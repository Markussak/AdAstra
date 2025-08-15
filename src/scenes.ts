// scenes.ts - Scene management and star system generation

import {
  IScene,
  IRenderer,
  ICamera,
  SceneType,
  CelestialBodyType,
  StarSystem,
  Vector2D
} from './types';
import { CelestialBody } from './celestial';
import { SeededRandom } from './utils';

// Enhanced Space Background System
class SpaceBackground {
  private seed: number;
  private random: SeededRandom;
  private nebulae: Array<{x: number, y: number, size: number, color: string, intensity: number, type: string}> = [];
  private starClusters: Array<{x: number, y: number, size: number, starCount: number, brightness: number}> = [];
  private galaxies: Array<{x: number, y: number, size: number, type: string, rotation: number, color: string}> = [];
  private homeGalaxyPlane: {angle: number, width: number, density: number, color: string};
  private distantStars: Array<{x: number, y: number, size: number, brightness: number, color: string, layer: number}> = [];
  
  constructor(seed: number = Math.random() * 1000000) {
    this.seed = seed;
    this.random = new SeededRandom(seed);
    this.generateBackground();
    this.generateHomeGalaxyPlane();
  }

  private generateBackground(): void {
    // Generate multiple layers of distant stars
    this.generateDistantStars();
    
    // Generate mini pixel galaxies
    this.generateDistantGalaxies();
    
    // Generate star clusters
    this.generateStarClusters();
    
    // Generate nebulae
    this.generateNebulae();
  }

  private generateDistantStars(): void {
    const layers = [
      {count: 300, minSize: 1, maxSize: 1, brightness: 0.3, layer: 0},
      {count: 200, minSize: 1, maxSize: 2, brightness: 0.5, layer: 1},
      {count: 100, minSize: 1, maxSize: 2, brightness: 0.8, layer: 2},
      {count: 50, minSize: 2, maxSize: 3, brightness: 1.0, layer: 3}
    ];

    layers.forEach(layerInfo => {
      for (let i = 0; i < layerInfo.count; i++) {
        const x = this.random.next() * 4000 - 2000;
        const y = this.random.next() * 4000 - 2000;
        const size = layerInfo.minSize + this.random.next() * (layerInfo.maxSize - layerInfo.minSize);
        const brightness = layerInfo.brightness * (0.7 + this.random.next() * 0.3);
        
        // Diverse star colors based on temperature
        const starTypes = [
          '#FFE4E1', // Cool red stars
          '#FFE4B5', // Warm yellow stars  
          '#FFFFFF', // Hot white stars
          '#E6E6FA', // Very hot blue-white stars
          '#87CEEB', // Hot blue stars
          '#FFA500', // Orange giants
          '#FFB6C1'  // Pink/red giants
        ];
        const color = starTypes[Math.floor(this.random.next() * starTypes.length)];

        this.distantStars.push({
          x, y, size, brightness, color,
          layer: layerInfo.layer
        });
      }
    });
  }

  private generateDistantGalaxies(): void {
    const galaxyCount = 8 + Math.floor(this.random.next() * 12);
    
    for (let i = 0; i < galaxyCount; i++) {
      const x = this.random.next() * 6000 - 3000;
      const y = this.random.next() * 6000 - 3000;
      const size = 40 + this.random.next() * 120;
      const rotation = this.random.next() * Math.PI * 2;
      
      const galaxyTypes = ['spiral', 'elliptical', 'irregular', 'barred'];
      const type = galaxyTypes[Math.floor(this.random.next() * galaxyTypes.length)];
      
      const galaxyColors = [
        '#E6E6FA', // Light purple
        '#F0F8FF', // Alice blue
        '#FFE4E1', // Misty rose
        '#F5F5DC', // Beige
        '#E0E6FF', // Light blue
        '#FFE4B5'  // Moccasin
      ];
      const color = galaxyColors[Math.floor(this.random.next() * galaxyColors.length)];

      this.galaxies.push({
        x, y, size, type, rotation, color
      });
    }
  }

  private generateStarClusters(): void {
    const clusterCount = 15 + Math.floor(this.random.next() * 20);
    
    for (let i = 0; i < clusterCount; i++) {
      const x = this.random.next() * 5000 - 2500;
      const y = this.random.next() * 5000 - 2500;
      const size = 20 + this.random.next() * 80;
      const starCount = 10 + Math.floor(this.random.next() * 30);
      const brightness = 0.4 + this.random.next() * 0.6;

      this.starClusters.push({
        x, y, size, starCount, brightness
      });
    }
  }

  private generateNebulae(): void {
    const nebulaCount = 6 + Math.floor(this.random.next() * 8);
    
    for (let i = 0; i < nebulaCount; i++) {
      const x = this.random.next() * 4000 - 2000;
      const y = this.random.next() * 4000 - 2000;
      const size = 100 + this.random.next() * 300;
      const intensity = 0.2 + this.random.next() * 0.4;
      
      const nebulaTypes = ['emission', 'reflection', 'dark', 'planetary'];
      const type = nebulaTypes[Math.floor(this.random.next() * nebulaTypes.length)];
      
      let color = '#400040'; // Default dark nebula
      switch (type) {
        case 'emission':
          color = this.random.choose(['#FF6347', '#FF1493', '#FF4500', '#DC143C']); // Red/pink emission
          break;
        case 'reflection':
          color = this.random.choose(['#4169E1', '#1E90FF', '#87CEEB', '#6495ED']); // Blue reflection
          break;
        case 'planetary':
          color = this.random.choose(['#00FF7F', '#32CD32', '#ADFF2F', '#7FFF00']); // Green planetary
          break;
        case 'dark':
          color = this.random.choose(['#2F2F2F', '#404040', '#1C1C1C', '#191970']); // Dark nebula
          break;
      }

      this.nebulae.push({
        x, y, size, color, intensity, type
      });
    }
  }

  private generateHomeGalaxyPlane(): void {
    this.homeGalaxyPlane = {
      angle: this.random.next() * Math.PI * 2,
      width: 200 + this.random.next() * 300,
      density: 0.6 + this.random.next() * 0.4,
      color: '#E6E6FA'
    };
  }

  public render(renderer: IRenderer, camera: ICamera): void {
    const ctx = renderer.getContext();
    const width = renderer.getWidth();
    const height = renderer.getHeight();

    // Enhanced dark space gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#050510');
    gradient.addColorStop(0.3, '#0a0a15');
    gradient.addColorStop(0.7, '#0f0f1a');
    gradient.addColorStop(1, '#181c20');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Turn off smoothing for pixel art effect
    ctx.imageSmoothingEnabled = false;

    // Render home galaxy plane
    this.renderHomeGalaxyPlane(ctx, camera, width, height);

    // Render distant galaxies
    this.renderDistantGalaxies(ctx, camera);

    // Render nebulae
    this.renderNebulae(ctx, camera);

    // Render star clusters
    this.renderStarClusters(ctx, camera);

    // Render distant stars in layers (parallax effect)
    this.renderDistantStars(ctx, camera);

    // Turn smoothing back on
    ctx.imageSmoothingEnabled = true;
  }

  private renderHomeGalaxyPlane(ctx: CanvasRenderingContext2D, camera: ICamera, width: number, height: number): void {
    const centerX = width / 2;
    const centerY = height / 2;
    
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(this.homeGalaxyPlane.angle);
    
    // Create galactic plane with star density
    const planeHeight = 40;
    const planeWidth = this.homeGalaxyPlane.width;
    
    for (let x = -planeWidth; x < planeWidth; x += 2) {
      for (let y = -planeHeight; y < planeHeight; y += 2) {
        const density = Math.exp(-Math.abs(y) / 15) * this.homeGalaxyPlane.density;
        if (this.random.next() < density * 0.3) {
          const alpha = density * (0.5 + this.random.next() * 0.5);
          ctx.fillStyle = `rgba(230, 230, 250, ${alpha})`;
          ctx.fillRect(x, y, 2, 2);
        }
      }
    }
    
    // Galactic center bulge
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 80);
    gradient.addColorStop(0, 'rgba(255, 255, 200, 0.6)');
    gradient.addColorStop(0.5, 'rgba(255, 230, 180, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(0, 0, 80, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }

  private renderDistantGalaxies(ctx: CanvasRenderingContext2D, camera: ICamera): void {
    this.galaxies.forEach(galaxy => {
      const screenPos = this.getParallaxPosition(galaxy, camera, 0.1);
      
      if (this.isVisible(screenPos, galaxy.size, ctx.canvas.width, ctx.canvas.height)) {
        this.renderPixelGalaxy(ctx, screenPos, galaxy);
      }
    });
  }

  private renderPixelGalaxy(ctx: CanvasRenderingContext2D, pos: Vector2D, galaxy: any): void {
    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(galaxy.rotation);
    
    const size = galaxy.size;
    const pixelSize = 2;
    
    switch (galaxy.type) {
      case 'spiral':
        this.renderSpiralGalaxy(ctx, size, galaxy.color, pixelSize);
        break;
      case 'elliptical':
        this.renderEllipticalGalaxy(ctx, size, galaxy.color, pixelSize);
        break;
      case 'irregular':
        this.renderIrregularGalaxy(ctx, size, galaxy.color, pixelSize);
        break;
      case 'barred':
        this.renderBarredGalaxy(ctx, size, galaxy.color, pixelSize);
        break;
    }
    
    ctx.restore();
  }

  private renderSpiralGalaxy(ctx: CanvasRenderingContext2D, size: number, color: string, pixelSize: number): void {
    const arms = 2;
    const coreSize = size * 0.3;
    
    // Galaxy core
    for (let x = -coreSize; x < coreSize; x += pixelSize) {
      for (let y = -coreSize; y < coreSize; y += pixelSize) {
        const dist = Math.sqrt(x*x + y*y);
        if (dist < coreSize) {
          const density = Math.exp(-dist / (coreSize * 0.5));
          if (this.random.next() < density * 0.8) {
            ctx.fillStyle = `rgba(255, 255, 200, ${density * 0.8})`;
            ctx.fillRect(x, y, pixelSize, pixelSize);
          }
        }
      }
    }
    
    // Spiral arms
    for (let arm = 0; arm < arms; arm++) {
      const armAngle = (arm / arms) * Math.PI * 2;
      
      for (let r = coreSize; r < size; r += 4) {
        const angle = armAngle + r * 0.02; // Spiral tightness
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        
        // Add arm width
        for (let w = -8; w <= 8; w += pixelSize) {
          const armX = x + Math.cos(angle + Math.PI/2) * w;
          const armY = y + Math.sin(angle + Math.PI/2) * w;
          
          const density = Math.exp(-Math.abs(w) / 6) * Math.exp(-r / size);
          if (this.random.next() < density * 0.4) {
            const alpha = density * 0.6;
            ctx.fillStyle = color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
            ctx.fillRect(armX, armY, pixelSize, pixelSize);
          }
        }
      }
    }
  }

  private renderEllipticalGalaxy(ctx: CanvasRenderingContext2D, size: number, color: string, pixelSize: number): void {
    const aAxis = size;
    const bAxis = size * 0.6;
    
    for (let x = -aAxis; x < aAxis; x += pixelSize) {
      for (let y = -bAxis; y < bAxis; y += pixelSize) {
        const ellipseDist = (x*x)/(aAxis*aAxis) + (y*y)/(bAxis*bAxis);
        if (ellipseDist <= 1) {
          const density = Math.exp(-ellipseDist * 2);
          if (this.random.next() < density * 0.6) {
            const alpha = density * 0.7;
            ctx.fillStyle = color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
            ctx.fillRect(x, y, pixelSize, pixelSize);
          }
        }
      }
    }
  }

  private renderIrregularGalaxy(ctx: CanvasRenderingContext2D, size: number, color: string, pixelSize: number): void {
    const clumps = 3 + Math.floor(this.random.next() * 4);
    
    for (let clump = 0; clump < clumps; clump++) {
      const clumpX = (this.random.next() - 0.5) * size;
      const clumpY = (this.random.next() - 0.5) * size;
      const clumpSize = size * (0.2 + this.random.next() * 0.3);
      
      for (let x = clumpX - clumpSize; x < clumpX + clumpSize; x += pixelSize) {
        for (let y = clumpY - clumpSize; y < clumpY + clumpSize; y += pixelSize) {
          const dist = Math.sqrt((x-clumpX)**2 + (y-clumpY)**2);
          if (dist < clumpSize) {
            const density = Math.exp(-dist / (clumpSize * 0.5));
            if (this.random.next() < density * 0.5) {
              const alpha = density * 0.6;
              ctx.fillStyle = color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
              ctx.fillRect(x, y, pixelSize, pixelSize);
            }
          }
        }
      }
    }
  }

  private renderBarredGalaxy(ctx: CanvasRenderingContext2D, size: number, color: string, pixelSize: number): void {
    // Central bar
    const barLength = size * 0.6;
    const barWidth = size * 0.15;
    
    for (let x = -barLength; x < barLength; x += pixelSize) {
      for (let y = -barWidth; y < barWidth; y += pixelSize) {
        const density = Math.exp(-Math.abs(y) / (barWidth * 0.5)) * Math.exp(-Math.abs(x) / (barLength * 0.7));
        if (this.random.next() < density * 0.7) {
          const alpha = density * 0.8;
          ctx.fillStyle = `rgba(255, 255, 200, ${alpha})`;
          ctx.fillRect(x, y, pixelSize, pixelSize);
        }
      }
    }
    
    // Spiral arms from bar ends
    this.renderSpiralGalaxy(ctx, size, color, pixelSize);
  }

  private renderStarClusters(ctx: CanvasRenderingContext2D, camera: ICamera): void {
    this.starClusters.forEach(cluster => {
      const screenPos = this.getParallaxPosition(cluster, camera, 0.3);
      
      if (this.isVisible(screenPos, cluster.size, ctx.canvas.width, ctx.canvas.height)) {
        // Cluster center glow
        const gradient = ctx.createRadialGradient(screenPos.x, screenPos.y, 0, screenPos.x, screenPos.y, cluster.size);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${cluster.brightness * 0.3})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(screenPos.x, screenPos.y, cluster.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Individual stars in cluster
        for (let i = 0; i < cluster.starCount; i++) {
          const angle = this.random.next() * Math.PI * 2;
          const dist = this.random.next() * cluster.size * 0.8;
          const x = screenPos.x + Math.cos(angle) * dist;
          const y = screenPos.y + Math.sin(angle) * dist;
          
          const starBrightness = cluster.brightness * (0.6 + this.random.next() * 0.4);
          ctx.fillStyle = `rgba(255, 255, 255, ${starBrightness})`;
          ctx.fillRect(x - 1, y - 1, 2, 2);
        }
      }
    });
  }

  private renderNebulae(ctx: CanvasRenderingContext2D, camera: ICamera): void {
    this.nebulae.forEach(nebula => {
      const screenPos = this.getParallaxPosition(nebula, camera, 0.05);
      
      if (this.isVisible(screenPos, nebula.size, ctx.canvas.width, ctx.canvas.height)) {
        const gradient = ctx.createRadialGradient(
          screenPos.x, screenPos.y, 0,
          screenPos.x, screenPos.y, nebula.size
        );
        
        const color = nebula.color;
        if (nebula.type === 'dark') {
          gradient.addColorStop(0, `rgba(0, 0, 0, ${nebula.intensity * 0.8})`);
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        } else {
          gradient.addColorStop(0, color.replace(')', `, ${nebula.intensity})`).replace('rgb', 'rgba'));
          gradient.addColorStop(0.7, color.replace(')', `, ${nebula.intensity * 0.3})`).replace('rgb', 'rgba'));
          gradient.addColorStop(1, color.replace(')', ', 0)').replace('rgb', 'rgba'));
        }
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(screenPos.x, screenPos.y, nebula.size, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  private renderDistantStars(ctx: CanvasRenderingContext2D, camera: ICamera): void {
    this.distantStars.forEach(star => {
      const parallaxFactor = 0.1 + star.layer * 0.1; // Different parallax for each layer
      const screenPos = this.getParallaxPosition(star, camera, parallaxFactor);
      
      if (this.isVisible(screenPos, star.size, ctx.canvas.width, ctx.canvas.height)) {
        const twinkle = 0.7 + 0.3 * Math.sin(Date.now() * 0.001 + star.x * 0.01);
        const alpha = star.brightness * twinkle;
        
        ctx.fillStyle = star.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
        ctx.fillRect(screenPos.x - star.size/2, screenPos.y - star.size/2, star.size, star.size);
        
        // Add cross pattern for brighter stars
        if (star.brightness > 0.7 && star.size >= 2) {
          ctx.fillRect(screenPos.x - star.size - 1, screenPos.y, star.size * 2 + 2, 1);
          ctx.fillRect(screenPos.x, screenPos.y - star.size - 1, 1, star.size * 2 + 2);
        }
      }
    });
  }

  private getParallaxPosition(object: any, camera: ICamera, parallaxFactor: number): Vector2D {
    return {
      x: object.x - camera.x * parallaxFactor,
      y: object.y - camera.y * parallaxFactor
    };
  }

  private isVisible(pos: Vector2D, size: number, width: number, height: number): boolean {
    return pos.x + size > 0 && pos.x - size < width && 
           pos.y + size > 0 && pos.y - size < height;
  }
}

export class StarSystemScene implements IScene {
  private celestialBodies: CelestialBody[] = [];
  private systemName: string;
  private systemSeed: number;
  private spaceBackground: SpaceBackground;

  constructor(systemName: string = 'Sol', seed: number = 12345) {
    this.systemName = systemName;
    this.systemSeed = seed;
    this.spaceBackground = new SpaceBackground(seed + 1000); // Different seed for background
    this.generateSolarSystem();
  }

  private generateSolarSystem(): void {
    const random = new SeededRandom(this.systemSeed);

    const starMass = 1200 + random.next() * 800;
    const starRadius = 180 + random.next() * 120; // Much larger stars
    const starColor = this.generateStarColor(random);

    const centralStar = new CelestialBody(
      0, 0, starRadius, CelestialBodyType.STAR, 
      this.systemName, starMass, starColor
    );
    this.celestialBodies.push(centralStar);

    const planetCount = 3 + Math.floor(random.next() * 5);
    let currentDistance = 800; // Much larger starting distance

    for (let i = 0; i < planetCount; i++) {
      currentDistance += 400 + random.next() * 800; // Much larger spacing between planets
      
      const planetRadius = 48 + random.next() * 90; // Much larger planets
      const planetMass = planetRadius * 3;
      const planetColor = this.generatePlanetColor(random);
      const startAngle = random.next() * Math.PI * 2;

      const planet = new CelestialBody(
        currentDistance, 0, planetRadius, CelestialBodyType.PLANET,
        `${this.systemName}-${i + 1}`, planetMass, planetColor
      );
      
      // Add orbital eccentricity for realism
      const eccentricity = Math.random() * 0.25; // 0-0.25 eccentricity
      planet.setOrbit({ x: 0, y: 0 }, currentDistance, starMass, startAngle, eccentricity);
      
      if (random.next() < 0.5) {
        planet.hasAtmosphere = true;
        planet.atmosphereColor = 'rgba(95, 158, 158, 0.4)';
        planet.atmosphereRadius = planetRadius * (1.2 + random.next() * 0.3);
      }

      this.celestialBodies.push(planet);

      // Generate moons
      if (planetRadius > 30 && random.next() < 0.7) {
        const moonCount = 1 + Math.floor(random.next() * 3);
        for (let j = 0; j < moonCount; j++) {
          const moonDistance = planetRadius * 8 + j * 120; // Much larger moon orbit distance
          const moonRadius = 18 + random.next() * 32; // Much larger moons
          const moonMass = moonRadius * 2;
          const moonColor = this.generateMoonColor(random);
          const moonEccentricity = Math.random() * 0.1; // Small eccentricity for moons

          const moon = new CelestialBody(
            currentDistance + moonDistance, 0, moonRadius, CelestialBodyType.MOON,
            `${planet.name}-M${j + 1}`, moonMass, moonColor
          );
          
          moon.setOrbit(planet.position, moonDistance, planetMass, random.next() * Math.PI * 2, moonEccentricity);
          this.celestialBodies.push(moon);
        }
      }
    }

    // Generate asteroid belt
    if (random.next() < 0.8) {
      const beltDistance = currentDistance + 600 + random.next() * 800; // Much larger asteroid belt distance
      const asteroidCount = 20 + Math.floor(random.next() * 35);
      
      for (let i = 0; i < asteroidCount; i++) {
        const angle = random.next() * Math.PI * 2;
        const distance = beltDistance + (random.next() - 0.5) * 400; // Larger asteroid belt spread
        const asteroidRadius = 12 + random.next() * 24; // Much larger asteroids
        const asteroidMass = asteroidRadius;
        const asteroidEccentricity = Math.random() * 0.4; // More eccentric asteroid orbits

        const asteroid = new CelestialBody(
          distance, 0, asteroidRadius, CelestialBodyType.ASTEROID,
          `Asteroid-${i}`, asteroidMass, this.generateAsteroidColor(random)
        );
        
        asteroid.setOrbit({ x: 0, y: 0 }, distance, starMass, random.next() * Math.PI * 2, asteroidEccentricity);
        this.celestialBodies.push(asteroid);
      }
    }
  }

  private generateStarColor(random: SeededRandom): string {
    const starTypes = [
      '#FFD700', // G-type (Yellow like our Sun)
      '#FF6B47', // K-type (Orange)
      '#FF4444', // M-type (Red dwarf)
      '#87CEEB', // B-type (Blue)
      '#FFFFFF', // O-type (White/Blue)
      '#FFA500', // Orange giant
      '#FFE4B5'  // Warm yellow
    ];
    return random.choose(starTypes);
  }

  private generatePlanetColor(random: SeededRandom): string {
    const planetColors = [
      '#4169E1', // Earth-like blue
      '#CD853F', // Desert/Mars-like
      '#8B4513', // Rocky brown
      '#228B22', // Forest green
      '#DC143C', // Volcanic red
      '#9370DB', // Purple gas giant
      '#FF6347', // Orange/red rocky
      '#4682B4', // Ice world blue
      '#DDA0DD', // Pink/purple exotic
      '#32CD32', // Lime green
      '#FF8C00', // Orange gas giant
      '#8A2BE2'  // Blue-violet exotic
    ];
    return random.choose(planetColors);
  }

  private generateMoonColor(random: SeededRandom): string {
    const moonColors = [
      '#C0C0C0', // Classic silver
      '#8B7355', // Sandy brown
      '#696969', // Dim gray
      '#A0522D', // Sienna
      '#BC8F8F', // Rosy brown
      '#D2691E', // Chocolate
      '#F4A460', // Sandy brown
      '#CD853F'  // Peru
    ];
    return random.choose(moonColors);
  }

  private generateAsteroidColor(random: SeededRandom): string {
    const asteroidColors = [
      '#8B7D6B', // Light taupe
      '#A0522D', // Sienna
      '#696969', // Dim gray
      '#708090', // Slate gray
      '#778899', // Light slate gray
      '#B8860B', // Dark goldenrod
      '#CD853F', // Peru
      '#D2691E'  // Chocolate
    ];
    return random.choose(asteroidColors);
  }

  public update(deltaTime: number, game: any): void {
    this.celestialBodies.forEach(body => {
      body.update(deltaTime);
    });
  }

  public render(renderer: IRenderer, camera: ICamera): void {
    // Render the enhanced space background first
    this.spaceBackground.render(renderer, camera);

    // Sort by distance for proper rendering order
    const sortedBodies = [...this.celestialBodies].sort((a, b) => {
      const distA = Math.sqrt((camera.x - a.position.x) ** 2 + (camera.y - a.position.y) ** 2);
      const distB = Math.sqrt((camera.x - b.position.x) ** 2 + (camera.y - b.position.y) ** 2);
      return distB - distA;
    });

    sortedBodies.forEach(body => {
      body.render(renderer, camera);
    });
  }

  public getSceneType(): SceneType {
    return SceneType.STAR_SYSTEM;
  }

  public getCelestialBodies(): Array<{ position: Vector2D; mass: number; radius: number }> {
    return this.celestialBodies.map(body => ({
      position: body.position,
      mass: body.mass,
      radius: body.radius
    }));
  }

  public getSystemName(): string {
    return this.systemName;
  }
}

export class InterstellarSpaceScene implements IScene {
  private starSystems: StarSystem[] = [];

  constructor() {
    this.generateGalaxy();
  }

  private generateGalaxy(): void {
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 100 + Math.random() * 800;

      const systemTypes = ['G-Class', 'K-Class', 'M-Class', 'Binary', 'Pulsar'];
      const systemColors = ['#ffff88', '#ff8844', '#ff4444', '#8888ff', '#ffffff'];
      const typeIndex = Math.floor(Math.random() * systemTypes.length);

      this.starSystems.push({
        position: {
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance
        },
        name: `System-${String.fromCharCode(65 + i)}${Math.floor(Math.random() * 999)}`,
        type: systemTypes[typeIndex],
        color: systemColors[typeIndex],
        size: 3 + Math.random() * 8,
        explored: i === 0,
        seed: Math.floor(Math.random() * 999999)
      });
    }
  }

  public update(deltaTime: number, game: any): void {
    this.starSystems.forEach(system => {
      const centerDistance = Math.sqrt(system.position.x ** 2 + system.position.y ** 2);
      if (centerDistance > 50) {
        const rotationSpeed = 0.001 / (centerDistance * 0.01);
        const currentAngle = Math.atan2(system.position.y, system.position.x);
        const newAngle = currentAngle + rotationSpeed * deltaTime;
        system.position.x = Math.cos(newAngle) * centerDistance;
        system.position.y = Math.sin(newAngle) * centerDistance;
      }
    });
  }

  public render(renderer: IRenderer, camera: ICamera): void {
    this.renderGalaxyBackground(renderer, camera);

    this.starSystems.forEach(system => {
      this.renderStarSystem(renderer, camera, system);
    });
  }

  private renderGalaxyBackground(renderer: IRenderer, camera: ICamera): void {
    const ctx = renderer.getContext();

    // Galaxy plane
    const gradient = ctx.createLinearGradient(0, 0, renderer.getWidth(), 0);
    gradient.addColorStop(0, 'rgba(95, 158, 158, 0.1)');
    gradient.addColorStop(0.5, 'rgba(95, 158, 158, 0.2)');
    gradient.addColorStop(1, 'rgba(95, 158, 158, 0.1)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, renderer.getHeight() * 0.3, renderer.getWidth(), renderer.getHeight() * 0.4);

    // Distant nebulae
    for (let i = 0; i < 10; i++) {
      const x = (i * 167.89) % renderer.getWidth();
      const y = (i * 234.56) % renderer.getHeight();
      const size = 1 + Math.random() * 2;
      
      ctx.fillStyle = 'rgba(140, 140, 140, 0.3)';
      ctx.fillRect(x, y, size, size);
    }
  }

  private renderStarSystem(renderer: IRenderer, camera: ICamera, system: StarSystem): void {
    const screenPos = camera.worldToScreen(system.position.x, system.position.y);
    const ctx = renderer.getContext();

    // Star glow
    const gradient = ctx.createRadialGradient(screenPos.x, screenPos.y, 0, screenPos.x, screenPos.y, system.size + 10);
    gradient.addColorStop(0, system.color);
    gradient.addColorStop(0.7, system.color + '44');
    gradient.addColorStop(1, system.color + '00');

    ctx.fillStyle = gradient;
    ctx.fillRect(screenPos.x - system.size - 10, screenPos.y - system.size - 10,
                (system.size + 10) * 2, (system.size + 10) * 2);

    // Star core
    renderer.drawCircle(screenPos.x, screenPos.y, system.size, system.color, true);

    // Exploration indicator
    if (system.explored) {
      renderer.drawCircle(screenPos.x, screenPos.y, system.size + 8, '#00ffff', false);
    }

    // System info
    if (Math.abs(screenPos.x - renderer.getWidth()/2) < 200 && 
        Math.abs(screenPos.y - renderer.getHeight()/2) < 200) {
      renderer.drawText(system.name, screenPos.x, screenPos.y + system.size + 15, '#dcd0c0', '6px "Big Apple 3PM", monospace');
      renderer.drawText(system.type, screenPos.x, screenPos.y + system.size + 25, '#dcd0c0', '6px "Big Apple 3PM", monospace');
    }
  }

  public getSceneType(): SceneType {
    return SceneType.INTERSTELLAR_SPACE;
  }

  public getStarSystems(): StarSystem[] {
    return this.starSystems;
  }

  public getCelestialBodies(): Array<{ position: Vector2D; mass: number; radius: number }> {
    return []; // No gravity sources in interstellar space
  }
}