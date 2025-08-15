// celestial.ts - Celestial bodies and space objects

import {
  ICelestialBody,
  IRenderer,
  ICamera,
  Vector2D,
  CelestialBodyType,
  SurfaceFeature
} from './types';
import { PhysicsEngine, SeededRandom } from './utils';

export class CelestialBody implements ICelestialBody {
  public position: Vector2D;
  public velocity: Vector2D = { x: 0, y: 0 };
  public angle: number = 0;
  public radius: number;
  public active: boolean = true;
  public type: CelestialBodyType;
  public name: string;
  public mass: number;
  public color: string;
  public rotationSpeed: number;
  public rotation: number = 0;

  public orbitDistance: number = 0;
  public orbitSpeed: number = 0;
  public orbitAngle: number = 0;
  public orbitCenter: Vector2D | null = null;
  public orbitEccentricity: number = 0; // 0 = perfect circle, 0.99 = very elliptical
  public periapsis: number = 0; // Closest approach distance
  public apoapsis: number = 0;  // Farthest distance

  public hasAtmosphere: boolean = false;
  public atmosphereColor: string | null = null;
  public atmosphereRadius: number = 0;
  public surfaceFeatures: SurfaceFeature[] = [];

  constructor(
    x: number,
    y: number,
    radius: number,
    type: CelestialBodyType,
    name: string,
    mass: number = 100,
    color: string = '#888888'
  ) {
    this.position = { x, y };
    this.radius = radius;
    this.type = type;
    this.name = name;
    this.mass = mass;
    this.color = color;
    this.rotationSpeed = 0.001 + Math.random() * 0.002; // Much slower rotation

    // Set atmosphere for planets
    if (type === CelestialBodyType.PLANET && Math.random() < 0.4) {
      this.hasAtmosphere = true;
      this.atmosphereRadius = radius * (1.2 + Math.random() * 0.5);
    }

    this.generateSurfaceFeatures();
  }

  private generateSurfaceFeatures(): void {
    const featureCount = 3 + Math.floor(Math.random() * 5);
    for (let i = 0; i < featureCount; i++) {
      this.surfaceFeatures.push({
        angle: Math.random() * Math.PI * 2,
        size: 0.1 + Math.random() * 0.3,
        color: this.type === CelestialBodyType.PLANET ? '#404040' : '#505050'
      });
    }
  }

  // Simple orbit setting with circular orbits only
  public setOrbit(center: Vector2D, distance: number, speed: number, startAngle: number = 0, eccentricity: number = 0): void {
    this.orbitCenter = center;
    this.orbitDistance = distance;
    this.orbitSpeed = speed * 0.1; // Reduce speed significantly for smoother movement
    this.orbitAngle = startAngle;
    
    // Ignore eccentricity for simple circular orbits
    this.orbitEccentricity = 0;
    
    // Set initial position based on circular orbit
    this.position.x = center.x + Math.cos(startAngle) * distance;
    this.position.y = center.y + Math.sin(startAngle) * distance;
  }

  private updateOrbitalPosition(): void {
    if (!this.orbitCenter) return;
    
    // For elliptical orbits, distance varies with angle
    const currentDistance = this.orbitDistance * (1 - this.orbitEccentricity * this.orbitEccentricity) / 
                           (1 + this.orbitEccentricity * Math.cos(this.orbitAngle));
    
    this.position.x = this.orbitCenter.x + Math.cos(this.orbitAngle) * currentDistance;
    this.position.y = this.orbitCenter.y + Math.sin(this.orbitAngle) * currentDistance;
  }

  public update(deltaTime: number, game: any): void {
    this.rotation += this.rotationSpeed * deltaTime;

    if (this.orbitCenter && this.orbitDistance > 0) {
      // Simple, stable orbital motion - no complex elliptical mechanics
      this.orbitAngle += this.orbitSpeed * deltaTime;
      
      // Keep angle in reasonable range
      if (this.orbitAngle > Math.PI * 2) {
        this.orbitAngle -= Math.PI * 2;
      }
      
      // Simple circular orbit
      this.position.x = this.orbitCenter.x + Math.cos(this.orbitAngle) * this.orbitDistance;
      this.position.y = this.orbitCenter.y + Math.sin(this.orbitAngle) * this.orbitDistance;
      
      // Simple velocity calculation for smooth movement
      this.velocity.x = -Math.sin(this.orbitAngle) * this.orbitDistance * this.orbitSpeed * 0.01;
      this.velocity.y = Math.cos(this.orbitAngle) * this.orbitDistance * this.orbitSpeed * 0.01;
    }

    // Remove the mutual gravity system that was causing instability
    // if (game.sceneManager?.getCurrentScene()?.getCelestialBodies && this.type !== CelestialBodyType.ASTEROID) {
    //   const otherBodies = game.sceneManager.getCurrentScene().getCelestialBodies();
    //   this.applyMutualGravity(otherBodies, deltaTime);
    // }
  }

  private applyMutualGravity(otherBodies: Array<{ position: Vector2D; mass: number; radius: number }>, deltaTime: number): void {
    // Simplified mutual gravitational effects (mostly for orbital perturbations)
    otherBodies.forEach(other => {
      if (other === this) return;
      
      const dx = other.position.x - this.position.x;
      const dy = other.position.y - this.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Only apply for significant masses and at reasonable distances
      if (distance > (this.radius + other.radius) * 2 && other.mass > this.mass * 0.1) {
        const force = (other.mass * 0.0001) / (distance * distance); // Much weaker than ship gravity
        const angle = Math.atan2(dy, dx);
        
        // Apply tiny perturbations to orbital motion
        if (this.orbitCenter) {
          this.orbitAngle += force * Math.sin(angle - this.orbitAngle) * deltaTime * 0.001;
          this.orbitSpeed *= (1 + force * deltaTime * 0.0001);
        }
      }
    });
  }

  public render(renderer: IRenderer, camera: ICamera): void {
    if (!this.isVisible(camera, renderer.getWidth(), renderer.getHeight())) {
      return;
    }

    const screenPos = camera.worldToScreen(this.position.x, this.position.y);

    renderer.save();
    renderer.translate(screenPos.x, screenPos.y);

    if (this.orbitCenter && this.type !== CelestialBodyType.STAR) {
      this.renderOrbitPath(renderer, camera);
    }

    switch (this.type) {
      case CelestialBodyType.STAR:
        this.renderStar(renderer);
        break;
      case CelestialBodyType.PLANET:
        this.renderPlanet(renderer);
        break;
      case CelestialBodyType.MOON:
        this.renderMoon(renderer);
        break;
      case CelestialBodyType.ASTEROID:
        this.renderAsteroid(renderer);
        break;
      default:
        this.renderGeneric(renderer);
    }

    renderer.restore();

    // Draw name for large objects
    if ((this.type === CelestialBodyType.STAR || this.type === CelestialBodyType.PLANET) && 
        Math.abs(screenPos.x - renderer.getWidth()/2) < 150 && 
        Math.abs(screenPos.y - renderer.getHeight()/2) < 150) {
      renderer.drawText(this.name, screenPos.x, screenPos.y + this.radius + 20, '#e0e3e6', '8px "Big Apple 3PM", monospace');
    }
  }

  private renderOrbitPath(renderer: IRenderer, camera: ICamera): void {
    if (!this.orbitCenter) return;

    const ctx = renderer.getContext();
    const centerScreen = camera.worldToScreen(this.orbitCenter.x, this.orbitCenter.y);

    ctx.strokeStyle = 'rgba(162, 170, 178, 0.15)'; // 16-bit highlight standard with low opacity
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(
      centerScreen.x - camera.worldToScreen(this.position.x, this.position.y).x, 
      centerScreen.y - camera.worldToScreen(this.position.x, this.position.y).y, 
      this.orbitDistance * camera.zoom, 
      0, 
      Math.PI * 2
    );
    ctx.stroke();
  }

  private renderStar(renderer: IRenderer): void {
    const ctx = renderer.getContext();
    
    // 16-bit star with detailed pixelated surface
    this.draw16BitStar(ctx);
  }

  private renderPlanet(renderer: IRenderer): void {
    const ctx = renderer.getContext();
    
    // 16-bit planet with detailed surface features
    this.draw16BitPlanet(ctx);
  }

  private renderMoon(renderer: IRenderer): void {
    const ctx = renderer.getContext();
    
    // 16-bit moon with detailed craters
    this.draw16BitMoon(ctx);
  }

  private renderAsteroid(renderer: IRenderer): void {
    const ctx = renderer.getContext();
    
    // 16-bit asteroid with irregular pixelated shape
    this.draw16BitAsteroid(ctx);
  }

  private draw16BitStar(ctx: CanvasRenderingContext2D): void {
    const size = Math.floor(this.radius * 2);
    const centerX = 0;
    const centerY = 0;
    
    // 16-bit color palette for star
    const colors = {
      core: '#ffd700',      // Bright yellow core
      hot: '#ff8c00',       // Orange hot spots
      warm: '#ff6347',      // Red-orange
      surface: '#ffb347',   // Light orange
      flare: '#fff8dc'      // Near white flares
    };
    
    // Draw pixelated star core
    for (let x = -size/2; x < size/2; x += 2) {
      for (let y = -size/2; y < size/2; y += 2) {
        const distance = Math.sqrt(x*x + y*y);
        if (distance < this.radius) {
          let color = colors.surface;
          
          // Core region
          if (distance < this.radius * 0.3) {
            color = colors.core;
          } else if (distance < this.radius * 0.6) {
            color = colors.hot;
          } else if (distance < this.radius * 0.8) {
            color = colors.warm;
          }
          
          // Add surface noise for 16-bit effect
          const noise = (Math.sin(x * 0.3 + this.rotation) + Math.cos(y * 0.3 + this.rotation)) * 0.5;
          if (noise > 0.2) {
            color = colors.hot;
          }
          
          ctx.fillStyle = color;
          ctx.fillRect(centerX + x, centerY + y, 2, 2);
        }
      }
    }
    
    // Add solar flares as pixelated beams
    ctx.save();
    ctx.rotate(this.rotation);
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const flareX = Math.cos(angle) * this.radius * 0.9;
      const flareY = Math.sin(angle) * this.radius * 0.9;
      const flareLength = 4 + Math.random() * 8;
      
      ctx.fillStyle = colors.flare;
      for (let j = 0; j < flareLength; j += 2) {
        const fx = flareX + Math.cos(angle) * j;
        const fy = flareY + Math.sin(angle) * j;
        ctx.fillRect(fx, fy, 2, 2);
      }
    }
    ctx.restore();
  }

  private draw16BitPlanet(ctx: CanvasRenderingContext2D): void {
    const size = Math.floor(this.radius * 2);
    const centerX = 0;
    const centerY = 0;
    
    // 16-bit planet color palette
    const colors = {
      base: this.color,
      dark: this.darkenColor(this.color, 0.3),
      darker: this.darkenColor(this.color, 0.6),
      light: this.lightenColor(this.color, 0.2),
      feature: '#2d4a5b'
    };
    
    // Draw pixelated planet surface
    for (let x = -size/2; x < size/2; x += 2) {
      for (let y = -size/2; y < size/2; y += 2) {
        const distance = Math.sqrt(x*x + y*y);
        if (distance < this.radius) {
          let color = colors.base;
          
          // Create 16-bit terrain patterns
          const terrainPattern = Math.sin(x * 0.2) * Math.cos(y * 0.2);
          const craterPattern = Math.sin(x * 0.5 + this.rotation) * Math.cos(y * 0.5 + this.rotation);
          
          if (terrainPattern > 0.3) {
            color = colors.light;
          } else if (terrainPattern < -0.3) {
            color = colors.dark;
          }
          
          // Add crater-like features
          if (craterPattern > 0.6) {
            color = colors.darker;
          }
          
          // Day/night terminator effect
          const lightAngle = Math.atan2(y, x);
          if (lightAngle > Math.PI * 0.3 && lightAngle < Math.PI * 0.7) {
            color = this.darkenColor(color, 0.4);
          }
          
          // Surface details using dithering pattern
          if ((x + y) % 4 === 0 && Math.random() > 0.8) {
            color = colors.feature;
          }
          
          ctx.fillStyle = color;
          ctx.fillRect(centerX + x, centerY + y, 2, 2);
        }
      }
    }
    
    // Add atmosphere if present
    if (this.hasAtmosphere) {
      ctx.fillStyle = 'rgba(135, 206, 235, 0.3)';
      for (let x = -size/2; x < size/2; x += 4) {
        for (let y = -size/2; y < size/2; y += 4) {
          const distance = Math.sqrt(x*x + y*y);
          if (distance > this.radius - 4 && distance < this.radius + 6) {
            if (Math.random() > 0.5) {
              ctx.fillRect(centerX + x, centerY + y, 2, 2);
            }
          }
        }
      }
    }
  }

  private draw16BitMoon(ctx: CanvasRenderingContext2D): void {
    const size = Math.floor(this.radius * 2);
    const centerX = 0;
    const centerY = 0;
    
    // 16-bit moon color palette
    const colors = {
      base: '#c0c0c0',      // Silver gray
      dark: '#808080',      // Dark gray
      darker: '#404040',    // Very dark gray
      light: '#e0e0e0',     // Light gray
      crater: '#202020'     // Almost black
    };
    
    // Draw pixelated moon surface
    for (let x = -size/2; x < size/2; x += 2) {
      for (let y = -size/2; y < size/2; y += 2) {
        const distance = Math.sqrt(x*x + y*y);
        if (distance < this.radius) {
          let color = colors.base;
          
          // Create crater patterns
          const craterNoise = Math.sin(x * 0.3) * Math.cos(y * 0.3) + 
                             Math.sin(x * 0.7) * Math.cos(y * 0.7) * 0.5;
          
          if (craterNoise > 0.5) {
            color = colors.light;
          } else if (craterNoise < -0.5) {
            color = colors.dark;
          }
          
          // Large crater features
          const largeCrater = Math.sin(x * 0.1 + this.rotation) * Math.cos(y * 0.1 + this.rotation);
          if (largeCrater > 0.7) {
            color = colors.crater;
          }
          
          // Surface texturing with dithering
          if ((x + y) % 6 === 0) {
            color = this.darkenColor(color, 0.2);
          }
          
          ctx.fillStyle = color;
          ctx.fillRect(centerX + x, centerY + y, 2, 2);
        }
      }
    }
  }

  private draw16BitAsteroid(ctx: CanvasRenderingContext2D): void {
    const size = Math.floor(this.radius * 2);
    const centerX = 0;
    const centerY = 0;
    
    // 16-bit asteroid color palette
    const colors = {
      base: '#8b7355',      // Brown-gray
      dark: '#5d4e37',      // Dark brown
      light: '#a0906b',     // Light brown
      metal: '#696969'      // Metallic gray
    };
    
    ctx.save();
    ctx.rotate(this.rotation);
    
    // Create irregular pixelated asteroid shape
    for (let x = -size/2; x < size/2; x += 2) {
      for (let y = -size/2; y < size/2; y += 2) {
        const distance = Math.sqrt(x*x + y*y);
        
        // Create irregular shape using noise
        const shapeNoise = Math.sin(x * 0.2) * Math.cos(y * 0.2) * 0.3;
        const adjustedRadius = this.radius * (0.7 + shapeNoise);
        
        if (distance < adjustedRadius) {
          let color = colors.base;
          
          // Surface texture patterns
          const rockPattern = Math.sin(x * 0.4) * Math.cos(y * 0.4);
          const metalPattern = Math.sin(x * 0.8) * Math.cos(y * 0.8);
          
          if (rockPattern > 0.4) {
            color = colors.light;
          } else if (rockPattern < -0.4) {
            color = colors.dark;
          }
          
          // Metallic veins
          if (metalPattern > 0.7) {
            color = colors.metal;
          }
          
          // Random surface details
          if (Math.random() > 0.9) {
            color = this.darkenColor(color, 0.3);
          }
          
          ctx.fillStyle = color;
          ctx.fillRect(centerX + x, centerY + y, 2, 2);
        }
      }
    }
    
    ctx.restore();
  }

  private lightenColor(color: string, factor: number): string {
    const hex = color.replace('#', '');
    const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + Math.floor(factor * 255));
    const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + Math.floor(factor * 255));
    const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + Math.floor(factor * 255));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  private darkenColor(color: string, factor: number): string {
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - Math.floor(factor * 255));
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - Math.floor(factor * 255));
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - Math.floor(factor * 255));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  private renderGeneric(renderer: IRenderer): void {
    renderer.drawCircle(0, 0, this.radius, this.color, true);
  }

  public isVisible(camera: ICamera, screenWidth: number, screenHeight: number): boolean {
    const screenPos = camera.worldToScreen(this.position.x, this.position.y);
    const margin = this.radius + 50;

    return screenPos.x > -margin && 
           screenPos.x < screenWidth + margin && 
           screenPos.y > -margin && 
           screenPos.y < screenHeight + margin;
  }
}