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
  
  // Enhanced orbital parameters for realistic mechanics
  public semiMajorAxis: number = 0; // Half the long axis of ellipse
  public meanAnomaly: number = 0; // Position in orbit (0 to 2π)
  public meanMotion: number = 0; // Radians per second
  public centralBodyMass: number = 0; // Mass of body being orbited

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

  // Realistic orbit setting with proper Kepler mechanics
  public setOrbit(center: Vector2D, distance: number, centralMass: number, startAngle: number = 0, eccentricity: number = 0): void {
    this.orbitCenter = center;
    this.orbitDistance = distance; // This will be periapsis for elliptical orbits
    this.orbitEccentricity = Math.min(0.95, eccentricity); // Limit eccentricity to prevent extremely elliptical orbits
    this.centralBodyMass = centralMass;
    
    // Calculate semi-major axis based on distance (periapsis) and eccentricity
    this.semiMajorAxis = distance / (1 - this.orbitEccentricity);
    this.periapsis = distance;
    this.apoapsis = this.semiMajorAxis * (1 + this.orbitEccentricity);
    
    // Calculate mean motion using Kepler's third law: n = sqrt(GM/a³)
    const G = 0.001; // Gravitational constant (scaled for game)
    this.meanMotion = Math.sqrt((G * centralMass) / Math.pow(this.semiMajorAxis, 3));
    
    // Set starting position
    this.meanAnomaly = startAngle;
    this.orbitAngle = startAngle;
    this.updateOrbitalPosition();
  }

  private updateOrbitalPosition(): void {
    if (!this.orbitCenter) return;
    
    // Solve Kepler's equation to get true anomaly from mean anomaly
    const eccentricAnomaly = this.solveKeplerEquation(this.meanAnomaly, this.orbitEccentricity);
    
    // Calculate true anomaly from eccentric anomaly
    const trueAnomaly = 2 * Math.atan2(
      Math.sqrt(1 + this.orbitEccentricity) * Math.sin(eccentricAnomaly / 2),
      Math.sqrt(1 - this.orbitEccentricity) * Math.cos(eccentricAnomaly / 2)
    );
    
    // Calculate distance from focus using orbital equation
    const currentDistance = this.semiMajorAxis * (1 - this.orbitEccentricity * this.orbitEccentricity) / 
                           (1 + this.orbitEccentricity * Math.cos(trueAnomaly));
    
    // Update position based on true anomaly
    this.position.x = this.orbitCenter.x + Math.cos(trueAnomaly) * currentDistance;
    this.position.y = this.orbitCenter.y + Math.sin(trueAnomaly) * currentDistance;
    this.orbitAngle = trueAnomaly;
    
    // Calculate orbital velocity for smooth movement
    const velocityMagnitude = Math.sqrt(0.001 * this.centralBodyMass * (2 / currentDistance - 1 / this.semiMajorAxis));
    const velocityAngle = trueAnomaly + Math.PI / 2; // Velocity is perpendicular to radius
    this.velocity.x = Math.cos(velocityAngle) * velocityMagnitude * 0.1; // Scale down for smoother visuals
    this.velocity.y = Math.sin(velocityAngle) * velocityMagnitude * 0.1;
  }
  
  // Solve Kepler's equation using Newton-Raphson method
  private solveKeplerEquation(meanAnomaly: number, eccentricity: number, tolerance: number = 1e-6): number {
    let eccentricAnomaly = meanAnomaly; // Initial guess
    
    for (let i = 0; i < 10; i++) { // Max 10 iterations
      const f = eccentricAnomaly - eccentricity * Math.sin(eccentricAnomaly) - meanAnomaly;
      const df = 1 - eccentricity * Math.cos(eccentricAnomaly);
      
      const delta = f / df;
      eccentricAnomaly -= delta;
      
      if (Math.abs(delta) < tolerance) break;
    }
    
    return eccentricAnomaly;
  }

  public update(deltaTime: number, game: any): void {
    this.rotation += this.rotationSpeed * deltaTime;

    if (this.orbitCenter && this.semiMajorAxis > 0) {
      // Update mean anomaly based on mean motion (Kepler's laws)
      this.meanAnomaly += this.meanMotion * deltaTime;
      
      // Keep mean anomaly in range [0, 2π]
      if (this.meanAnomaly > Math.PI * 2) {
        this.meanAnomaly -= Math.PI * 2;
      }
      
      // Update position using realistic orbital mechanics
      this.updateOrbitalPosition();
    }

    // Apply gravitational perturbations from other massive bodies (optional enhancement)
    if (game.sceneManager?.getCurrentScene()?.getCelestialBodies && this.type !== CelestialBodyType.ASTEROID) {
      const otherBodies = game.sceneManager.getCurrentScene().getCelestialBodies();
      this.applyOrbitalPerturbations(otherBodies, deltaTime);
    }
  }

  private applyOrbitalPerturbations(otherBodies: Array<{ position: Vector2D; mass: number; radius: number }>, deltaTime: number): void {
    // Apply subtle gravitational perturbations from other massive bodies
    otherBodies.forEach(other => {
      if (other === this || !this.orbitCenter) return;
      
      const dx = other.position.x - this.position.x;
      const dy = other.position.y - this.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Only apply for significant masses and at reasonable distances (avoid the central body)
      if (distance > (this.radius + other.radius) * 3 && other.mass > this.centralBodyMass * 0.01) {
        // Calculate perturbation strength based on mass and distance
        const perturbationStrength = (other.mass * 0.00001) / (distance * distance);
        
        // Apply small changes to orbital elements
        const perturbationAngle = Math.atan2(dy, dx);
        
        // Slightly modify mean motion (changes orbital period)
        this.meanMotion *= (1 + perturbationStrength * Math.sin(perturbationAngle) * deltaTime * 0.0001);
        
        // Slightly modify eccentricity (changes orbit shape)
        const eccentricityChange = perturbationStrength * Math.cos(perturbationAngle) * deltaTime * 0.0001;
        this.orbitEccentricity = Math.max(0, Math.min(0.95, this.orbitEccentricity + eccentricityChange));
        
        // Recalculate orbital parameters if eccentricity changed significantly
        if (Math.abs(eccentricityChange) > 0.00001) {
          this.apoapsis = this.semiMajorAxis * (1 + this.orbitEccentricity);
          this.periapsis = this.semiMajorAxis * (1 - this.orbitEccentricity);
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
    const seed = this.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Generate diverse planetary color palette based on planet type
    const planetType = seed % 4;
    let colors: any;
    
    switch (planetType) {
      case 0: // Earth-like
        colors = {
          water: '#1e4f72',     // Deep blue oceans
          land: '#2d5016',      // Green continents
          mountain: '#4a3728',  // Brown mountains
          desert: '#8b7355',    // Sandy deserts
          ice: '#e6f3ff',       // Ice caps
          cloud: 'rgba(255,255,255,0.4)',
          city: '#ffff99'       // City lights
        };
        break;
      case 1: // Desert world
        colors = {
          sand: '#c19a6b',      // Sandy surface
          rock: '#8b4513',      // Rocky outcrops
          dune: '#daa520',      // Sand dunes
          canyon: '#654321',    // Deep canyons
          mineral: '#b8860b',   // Mineral deposits
          storm: 'rgba(139,69,19,0.3)',
          oasis: '#228b22'      // Rare vegetation
        };
        break;
      case 2: // Ice world
        colors = {
          ice: '#f0f8ff',       // Ice surface
          deepice: '#b0c4de',   // Deep ice
          rock: '#2f4f4f',      // Exposed rock
          crevasse: '#483d8b',  // Deep crevasses
          aurora: '#00ff7f',    // Aurora effects
          frozen: '#e0e6ff',
          methane: '#87ceeb'    // Methane lakes
        };
        break;
      case 3: // Volcanic world
        colors = {
          lava: '#ff4500',      // Active lava
          cooling: '#8b0000',   // Cooling lava
          rock: '#2f2f2f',      // Volcanic rock
          ash: '#696969',       // Ash fields
          glow: '#ff6347',      // Volcanic glow
          sulfur: '#ffff00',    // Sulfur deposits
          magma: '#dc143c'      // Magma chambers
        };
        break;
    }
    
    // Draw realistic planetary surface with geographic features
    for (let x = -size/2; x < size/2; x += 2) {
      for (let y = -size/2; y < size/2; y += 2) {
        const distance = Math.sqrt(x*x + y*y);
        if (distance < this.radius) {
          // Calculate longitude/latitude for realistic features
          const longitude = Math.atan2(y, x) + this.rotation * 0.1;
          const latitude = Math.asin(Math.sqrt(x*x + y*y) / this.radius);
          
          // Multi-scale noise for realistic terrain
          const continentNoise = this.noise(longitude * 2, latitude * 2, seed) * 0.8;
          const mountainNoise = this.noise(longitude * 8, latitude * 8, seed + 100) * 0.4;
          const detailNoise = this.noise(longitude * 20, latitude * 20, seed + 200) * 0.2;
          const combined = continentNoise + mountainNoise + detailNoise;
          
          let color = colors[Object.keys(colors)[0]];
          
          if (planetType === 0) { // Earth-like
            if (combined > 0.3) {
              color = colors.land; // Land masses
              if (mountainNoise > 0.2) color = colors.mountain; // Mountains
              if (latitude > 0.8) color = colors.ice; // Polar ice
              if (detailNoise > 0.15 && combined > 0.5) color = colors.city; // Cities
            } else {
              color = colors.water; // Oceans
              if (latitude > 0.9) color = colors.ice; // Polar ice
            }
          } else if (planetType === 1) { // Desert
            if (combined > 0.2) {
              color = colors.rock; // Rocky highlands
              if (mountainNoise > 0.1) color = colors.canyon; // Canyons
            } else if (combined > -0.2) {
              color = colors.sand; // Sandy plains
              if (detailNoise > 0.1) color = colors.dune; // Dunes
            } else {
              color = colors.desert; // Low desert
              if (detailNoise > 0.18) color = colors.oasis; // Rare oases
            }
          } else if (planetType === 2) { // Ice world
            if (combined > 0.1) {
              color = colors.rock; // Exposed rock
            } else if (combined > -0.3) {
              color = colors.ice; // Surface ice
              if (detailNoise > 0.15) color = colors.aurora; // Aurora zones
            } else {
              color = colors.deepice; // Deep ice
              if (mountainNoise < -0.2) color = colors.crevasse; // Crevasses
            }
          } else { // Volcanic
            if (combined > 0.3) {
              color = colors.rock; // Solid rock
              if (detailNoise > 0.18) color = colors.sulfur; // Sulfur
            } else if (combined > 0.0) {
              color = colors.ash; // Ash fields
            } else {
              color = colors.lava; // Active lava
              if (mountainNoise < -0.1) color = colors.magma; // Magma
            }
          }
          
          // Proper 3D shading based on angle from sun
          const sunAngle = Math.atan2(y, x);
          const shadingIntensity = Math.cos(sunAngle) * 0.3 + 0.7;
          color = this.adjustBrightness(color, shadingIntensity);
          
          // Dithering for 16-bit effect
          if ((x + y) % 4 === 0 && Math.random() > 0.9) {
            color = this.darkenColor(color, 0.1);
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
    const seed = this.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Realistic moon color palette
    const colors = {
      highlands: '#e0e0e0',    // Bright highland material
      maria: '#606060',        // Dark basaltic plains (seas)
      crater: '#404040',       // Fresh crater material
      ancient: '#c0c0c0',      // Ancient crater material
      ray: '#ffffff',          // Bright crater rays
      shadow: '#202020'        // Deep crater shadows
    };
    
    // Draw realistic lunar surface with geographical features
    for (let x = -size/2; x < size/2; x += 2) {
      for (let y = -size/2; y < size/2; y += 2) {
        const distance = Math.sqrt(x*x + y*y);
        if (distance < this.radius) {
          const longitude = Math.atan2(y, x) + this.rotation * 0.05;
          const latitude = Math.asin(Math.sqrt(x*x + y*y) / this.radius);
          
          // Multi-scale crater and terrain features
          const mariaPattern = this.noise(longitude * 3, latitude * 3, seed) * 0.6;
          const craterPattern = this.noise(longitude * 12, latitude * 12, seed + 50) * 0.8;
          const rayPattern = this.noise(longitude * 25, latitude * 25, seed + 100) * 0.3;
          
          let color = colors.highlands; // Default highland color
          
          // Maria (dark plains) - large scale features
          if (mariaPattern < -0.2) {
            color = colors.maria;
          }
          
          // Crater features
          if (craterPattern > 0.6) {
            color = colors.crater; // Fresh crater material
          } else if (craterPattern > 0.4) {
            color = colors.ancient; // Older crater material
          } else if (craterPattern < -0.6) {
            color = colors.shadow; // Deep crater floors
          }
          
          // Bright crater rays (recent impacts)
          if (rayPattern > 0.2 && craterPattern > 0.5) {
            color = colors.ray;
          }
          
          // Realistic lighting based on sun angle
          const sunAngle = Math.atan2(y, x);
          const shadingIntensity = Math.max(0.3, Math.cos(sunAngle) * 0.4 + 0.6);
          color = this.adjustBrightness(color, shadingIntensity);
          
          // 16-bit dithering effect
          if ((x + y) % 4 === 0 && Math.random() > 0.85) {
            color = this.darkenColor(color, 0.15);
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
    const seed = this.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Diverse asteroid types and color palettes
    const asteroidType = seed % 3;
    let colors: any;
    
    switch (asteroidType) {
      case 0: // Rocky asteroid (C-type)
        colors = {
          base: '#3c3c3c',      // Dark carbonaceous material
          rock: '#5a5a5a',      // Rocky material
          crater: '#2a2a2a',    // Impact craters
          metal: '#696969',     // Metal traces
          dust: '#4a4a4a'       // Surface dust
        };
        break;
      case 1: // Metallic asteroid (M-type)
        colors = {
          base: '#8c7853',      // Iron-nickel base
          metal: '#b8860b',     // Metallic veins
          oxide: '#cd853f',     // Oxidized metal
          pure: '#daa520',      // Pure metal exposures
          rough: '#696969'      // Rough surfaces
        };
        break;
      case 2: // Stony asteroid (S-type)
        colors = {
          base: '#a0522d',      // Silicate rock
          crystal: '#deb887',   // Crystalline material
          regolith: '#8b7d6b',  // Surface regolith
          impact: '#654321',    // Impact melt
          mineral: '#d2691e'    // Mineral inclusions
        };
        break;
    }
    
    ctx.save();
    ctx.rotate(this.rotation);
    
    // Create realistic irregular asteroid shape and surface
    for (let x = -size/2; x < size/2; x += 2) {
      for (let y = -size/2; y < size/2; y += 2) {
        const distance = Math.sqrt(x*x + y*y);
        
        // Create highly irregular shape using multiple noise layers
        const largeNoise = this.noise(x * 0.1, y * 0.1, seed) * 0.4;
        const mediumNoise = this.noise(x * 0.3, y * 0.3, seed + 50) * 0.2;
        const smallNoise = this.noise(x * 0.6, y * 0.6, seed + 100) * 0.1;
        const shapeNoise = largeNoise + mediumNoise + smallNoise;
        const adjustedRadius = this.radius * (0.6 + shapeNoise);
        
        if (distance < adjustedRadius) {
          let color = colors.base;
          
          // Surface composition based on asteroid type
          const compositionNoise = this.noise(x * 0.2, y * 0.2, seed + 200);
          const detailNoise = this.noise(x * 0.8, y * 0.8, seed + 300);
          const craterNoise = this.noise(x * 1.2, y * 1.2, seed + 400);
          
          if (asteroidType === 0) { // Rocky asteroid
            if (compositionNoise > 0.3) {
              color = colors.rock;
            } else if (compositionNoise < -0.4) {
              color = colors.dust;
            }
            if (craterNoise > 0.6) color = colors.crater;
            if (detailNoise > 0.7) color = colors.metal;
          } else if (asteroidType === 1) { // Metallic asteroid  
            if (compositionNoise > 0.2) {
              color = colors.metal;
              if (detailNoise > 0.4) color = colors.pure;
            } else if (compositionNoise < -0.2) {
              color = colors.oxide;
            }
            if (craterNoise > 0.5) color = colors.rough;
          } else { // Stony asteroid
            if (compositionNoise > 0.3) {
              color = colors.crystal;
            } else if (compositionNoise < -0.3) {
              color = colors.regolith;
            }
            if (craterNoise > 0.6) color = colors.impact;
            if (detailNoise > 0.6) color = colors.mineral;
          }
          
          // Realistic lighting with rough surface
          const lightAngle = Math.atan2(y, x);
          const surfaceRoughness = 1 + smallNoise * 0.3;
          const shadingIntensity = Math.max(0.2, Math.cos(lightAngle) * 0.5 + 0.5) * surfaceRoughness;
          color = this.adjustBrightness(color, shadingIntensity);
          
          // Enhanced 16-bit dithering for rocky texture
          if ((x + y) % 4 === 0 && Math.random() > 0.8) {
            color = this.darkenColor(color, 0.2);
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

  private adjustBrightness(color: string, intensity: number): string {
    if (color.includes('rgba')) return color; // Skip rgba colors
    const hex = color.replace('#', '');
    const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) * intensity));
    const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) * intensity));
    const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) * intensity));
    return `#${Math.floor(r).toString(16).padStart(2, '0')}${Math.floor(g).toString(16).padStart(2, '0')}${Math.floor(b).toString(16).padStart(2, '0')}`;
  }

  // Simple noise function for terrain generation
  private noise(x: number, y: number, seed: number): number {
    const n = Math.sin(x * 12.9898 + y * 78.233 + seed * 37.719) * 43758.5453;
    return (n - Math.floor(n)) * 2 - 1; // Return value between -1 and 1
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