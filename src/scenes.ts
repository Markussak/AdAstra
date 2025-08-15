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
  private homeGalaxyPlane: {angle: number, width: number, density: number, color: string, starCount: number};
  private distantStars: Array<{x: number, y: number, size: number, brightness: number, color: string, layer: number}> = [];
  
  constructor(seed: number = Math.random() * 1000000) {
    this.seed = seed;
    this.random = new SeededRandom(seed);
    
    // Initialize homeGalaxyPlane with default values
    this.homeGalaxyPlane = {
      angle: 0,
      width: 500,
      density: 0.8,
      color: '#E6E6FA',
      starCount: 2000
    };
    
    this.generateEnhancedBackground();
    this.generateMassiveHomeGalaxyPlane();
  }

  private generateEnhancedBackground(): void {
    // Generate multiple layers of distant stars with much more variety
    this.generateMultiLayerStars();
    
    // Generate abundant mini pixel galaxies
    this.generateAbundantMiniGalaxies();
    
    // Generate more star clusters
    this.generateEnhancedStarClusters();
    
    // Generate purple-red nebulae scattered throughout
    this.generatePurpleRedNebulae();
  }

  private generateMultiLayerStars(): void {
    const layers = [
      {count: 800, minSize: 1, maxSize: 1, brightness: 0.15, layer: 0}, // Far background dots
      {count: 600, minSize: 1, maxSize: 1, brightness: 0.25, layer: 1}, // Mid-far background
      {count: 400, minSize: 1, maxSize: 2, brightness: 0.4, layer: 2},  // Mid background
      {count: 300, minSize: 1, maxSize: 2, brightness: 0.6, layer: 3},  // Closer background
      {count: 200, minSize: 2, maxSize: 3, brightness: 0.8, layer: 4},  // Near background
      {count: 100, minSize: 2, maxSize: 3, brightness: 1.0, layer: 5}   // Foreground stars
    ];

    layers.forEach(layerInfo => {
      for (let i = 0; i < layerInfo.count; i++) {
        const x = this.random.next() * 8000 - 4000; // Much larger space
        const y = this.random.next() * 8000 - 4000;
        const size = layerInfo.minSize + this.random.next() * (layerInfo.maxSize - layerInfo.minSize);
        const brightness = layerInfo.brightness * (0.6 + this.random.next() * 0.4);
        
        // More subtle, retro star colors without neon
        const starTypes = [
          '#F8F8FF', // Ghost white
          '#E6E6FA', // Lavender
          '#F0F8FF', // Alice blue
          '#FFF8DC', // Cornsilk
          '#F5F5DC', // Beige
          '#FFFAF0', // Floral white
          '#FAF0E6'  // Linen
        ];
        const color = starTypes[Math.floor(this.random.next() * starTypes.length)];

        this.distantStars.push({
          x, y, size, brightness, color,
          layer: layerInfo.layer
        });
      }
    });
  }

  private generateAbundantMiniGalaxies(): void {
    const galaxyCount = 25 + Math.floor(this.random.next() * 35); // Many more galaxies
    
    for (let i = 0; i < galaxyCount; i++) {
      const x = this.random.next() * 12000 - 6000; // Much larger distribution
      const y = this.random.next() * 12000 - 6000;
      const size = 30 + this.random.next() * 100; // Varied sizes
      const rotation = this.random.next() * Math.PI * 2;
      
      const galaxyTypes = ['spiral', 'elliptical', 'irregular', 'barred', 'dwarf'];
      const type = galaxyTypes[Math.floor(this.random.next() * galaxyTypes.length)];
      
      // Subtle retro galaxy colors
      const galaxyColors = [
        '#E6E6FA', // Light purple
        '#F0F8FF', // Alice blue  
        '#FFE4E1', // Misty rose
        '#F5F5DC', // Beige
        '#E0E6FF', // Light blue
        '#FFF8DC', // Cornsilk
        '#FAF0E6'  // Linen
      ];
      const color = galaxyColors[Math.floor(this.random.next() * galaxyColors.length)];

      this.galaxies.push({
        x, y, size, type, rotation, color
      });
    }
  }

  private generateEnhancedStarClusters(): void {
    const clusterCount = 40 + Math.floor(this.random.next() * 60); // Many more clusters
    
    for (let i = 0; i < clusterCount; i++) {
      const x = this.random.next() * 10000 - 5000; // Larger distribution
      const y = this.random.next() * 10000 - 5000;
      const size = 15 + this.random.next() * 120; // Varied cluster sizes
      const starCount = 8 + Math.floor(this.random.next() * 50); // More stars per cluster
      const brightness = 0.3 + this.random.next() * 0.7;

      this.starClusters.push({
        x, y, size, starCount, brightness
      });
    }
  }

  private generatePurpleRedNebulae(): void {
    const nebulaCount = 15 + Math.floor(this.random.next() * 25); // More nebulae
    
    for (let i = 0; i < nebulaCount; i++) {
      const x = this.random.next() * 8000 - 4000;
      const y = this.random.next() * 8000 - 4000;
      const size = 80 + this.random.next() * 400; // Varied sizes
      const intensity = 0.15 + this.random.next() * 0.35; // Subtle intensity
      
      const nebulaTypes = ['emission', 'reflection', 'dark', 'planetary'];
      const type = nebulaTypes[Math.floor(this.random.next() * nebulaTypes.length)];
      
      // Purple-red nebula colors as requested, but subtle for retro feel
      let color = '#2D1B3D'; // Default dark nebula
      switch (type) {
        case 'emission':
          color = this.random.choose(['#4A2C4A', '#3D1A3D', '#5D2E5D', '#4D1F4D']); // Purple-red emission
          break;
        case 'reflection':
          color = this.random.choose(['#3A2A5A', '#2E1E4E', '#4A3A6A', '#3D2D5D']); // Purple-blue reflection  
          break;
        case 'planetary':
          color = this.random.choose(['#4A2C2C', '#3D1F1F', '#5D2E2E', '#4D2121']); // Red planetary
          break;
        case 'dark':
          color = this.random.choose(['#2F1F2F', '#1F1F2F', '#2A1A2A', '#251525']); // Dark nebula
          break;
      }

      this.nebulae.push({
        x, y, size, color, intensity, type
      });
    }
  }

  private generateMassiveHomeGalaxyPlane(): void {
    this.homeGalaxyPlane = {
      angle: this.random.next() * Math.PI * 2,
      width: 500 + this.random.next() * 800, // Much wider and more impressive
      density: 0.8 + this.random.next() * 0.2, // Higher density
      color: '#E6E6FA',
      starCount: 2000 + Math.floor(this.random.next() * 3000) // Many more stars
    };
  }

  public render(renderer: IRenderer, camera: ICamera): void {
    const ctx = renderer.getContext();
    const width = renderer.getWidth();
    const height = renderer.getHeight();

    // Pure black background base
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    // Turn off smoothing for pixel art effect
    ctx.imageSmoothingEnabled = false;

    // Render massive home galaxy plane first (furthest back)
    this.renderMassiveHomeGalaxyPlane(ctx, camera, width, height);

    // Render mini pixel galaxies
    this.renderMiniPixelGalaxies(ctx, camera);

    // Render purple-red nebulae
    this.renderPurpleRedNebulae(ctx, camera);

    // Render enhanced star clusters
    this.renderEnhancedStarClusters(ctx, camera);

    // Render multiple layers of pixel stars with parallax
    this.renderMultiLayerPixelStars(ctx, camera);

    // Turn smoothing back on
    ctx.imageSmoothingEnabled = true;
  }

  private renderMassiveHomeGalaxyPlane(ctx: CanvasRenderingContext2D, camera: ICamera, width: number, height: number): void {
    const plane = this.homeGalaxyPlane;
    
    // Calculate galaxy plane position with parallax
    const parallaxFactor = 0.1; // Very slow movement for distant galaxy
    const planeOffsetX = -camera.x * parallaxFactor;
    const planeOffsetY = -camera.y * parallaxFactor;
    
    ctx.save();
    ctx.translate(width / 2 + planeOffsetX, height / 2 + planeOffsetY);
    ctx.rotate(plane.angle);
    
    // Create gradient for galaxy plane
    const gradient = ctx.createLinearGradient(-plane.width, 0, plane.width, 0);
    gradient.addColorStop(0, 'rgba(230, 230, 250, 0)');
    gradient.addColorStop(0.2, `rgba(230, 230, 250, ${plane.density * 0.1})`);
    gradient.addColorStop(0.5, `rgba(230, 230, 250, ${plane.density * 0.2})`);
    gradient.addColorStop(0.8, `rgba(230, 230, 250, ${plane.density * 0.1})`);
    gradient.addColorStop(1, 'rgba(230, 230, 250, 0)');
    
    // Render the galaxy plane band
    ctx.fillStyle = gradient;
    ctx.fillRect(-plane.width, -40, plane.width * 2, 80);
    
    // Render individual stars in the galaxy plane
    const random = new SeededRandom(this.seed + 9999);
    for (let i = 0; i < plane.starCount; i++) {
      const starX = (random.next() - 0.5) * plane.width * 2;
      const starY = (random.next() - 0.5) * 60; // Concentrated in plane
      const starSize = random.next() < 0.7 ? 1 : 2; // Mostly single pixels
      const brightness = 0.3 + random.next() * 0.5;
      
      ctx.fillStyle = `rgba(255, 255, 255, ${brightness * plane.density})`;
      ctx.fillRect(starX, starY, starSize, starSize);
    }
    
    ctx.restore();
  }

  private renderMiniPixelGalaxies(ctx: CanvasRenderingContext2D, camera: ICamera): void {
    const parallaxFactor = 0.2;
    
    this.galaxies.forEach(galaxy => {
      const screenX = galaxy.x - camera.x * parallaxFactor;
      const screenY = galaxy.y - camera.y * parallaxFactor;
      
      // Only render if roughly visible
      if (screenX > -200 && screenX < ctx.canvas.width + 200 && 
          screenY > -200 && screenY < ctx.canvas.height + 200) {
        
        ctx.save();
        ctx.translate(screenX, screenY);
        ctx.rotate(galaxy.rotation);
        
        // Draw mini pixel galaxy based on type
        const random = new SeededRandom(this.seed + galaxy.x + galaxy.y);
        
        switch (galaxy.type) {
          case 'spiral':
            this.renderMiniSpiralGalaxy(ctx, galaxy, random);
            break;
          case 'elliptical':
            this.renderMiniEllipticalGalaxy(ctx, galaxy, random);
            break;
          case 'irregular':
            this.renderMiniIrregularGalaxy(ctx, galaxy, random);
            break;
          case 'barred':
            this.renderMiniBarredGalaxy(ctx, galaxy, random);
            break;
          case 'dwarf':
            this.renderMiniDwarfGalaxy(ctx, galaxy, random);
            break;
        }
        
        ctx.restore();
      }
    });
  }

  private renderMiniSpiralGalaxy(ctx: CanvasRenderingContext2D, galaxy: any, random: SeededRandom): void {
    const pixelCount = Math.floor(galaxy.size / 4);
    
    // Draw spiral arms
    for (let arm = 0; arm < 2; arm++) {
      for (let i = 0; i < pixelCount; i++) {
        const angle = (arm * Math.PI) + (i / pixelCount) * Math.PI * 2;
        const radius = (i / pixelCount) * galaxy.size / 2;
        const x = Math.cos(angle) * radius + (random.next() - 0.5) * 4;
        const y = Math.sin(angle) * radius + (random.next() - 0.5) * 4;
        
        if (random.next() < 0.6) {
          ctx.fillStyle = galaxy.color.replace(')', ', 0.6)').replace('rgb', 'rgba');
          ctx.fillRect(x - 1, y - 1, 1, 1);
        }
      }
    }
    
    // Central bulge
    ctx.fillStyle = galaxy.color.replace(')', ', 0.8)').replace('rgb', 'rgba');
    ctx.fillRect(-2, -2, 4, 4);
  }

  private renderMiniEllipticalGalaxy(ctx: CanvasRenderingContext2D, galaxy: any, random: SeededRandom): void {
    const pixelCount = Math.floor(galaxy.size / 3);
    
    for (let i = 0; i < pixelCount; i++) {
      const angle = random.next() * Math.PI * 2;
      const radius = random.next() * galaxy.size / 2;
      const ellipticity = 0.6;
      
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius * ellipticity;
      
      const alpha = Math.max(0.1, 1 - (radius / (galaxy.size / 2)));
      ctx.fillStyle = galaxy.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
      ctx.fillRect(x - 1, y - 1, 1, 1);
    }
  }

  private renderMiniIrregularGalaxy(ctx: CanvasRenderingContext2D, galaxy: any, random: SeededRandom): void {
    const pixelCount = Math.floor(galaxy.size / 5);
    
    for (let i = 0; i < pixelCount; i++) {
      const x = (random.next() - 0.5) * galaxy.size;
      const y = (random.next() - 0.5) * galaxy.size;
      
      if (random.next() < 0.4) {
        ctx.fillStyle = galaxy.color.replace(')', ', 0.5)').replace('rgb', 'rgba');
        ctx.fillRect(x - 1, y - 1, 1, 1);
      }
    }
  }

  private renderMiniBarredGalaxy(ctx: CanvasRenderingContext2D, galaxy: any, random: SeededRandom): void {
    // Draw central bar
    ctx.fillStyle = galaxy.color.replace(')', ', 0.7)').replace('rgb', 'rgba');
    ctx.fillRect(-galaxy.size / 4, -2, galaxy.size / 2, 4);
    
    // Draw spiral arms from bar ends
    this.renderMiniSpiralGalaxy(ctx, galaxy, random);
  }

  private renderMiniDwarfGalaxy(ctx: CanvasRenderingContext2D, galaxy: any, random: SeededRandom): void {
    const pixelCount = Math.floor(galaxy.size / 8);
    
    for (let i = 0; i < pixelCount; i++) {
      const x = (random.next() - 0.5) * galaxy.size * 0.5;
      const y = (random.next() - 0.5) * galaxy.size * 0.5;
      
      ctx.fillStyle = galaxy.color.replace(')', ', 0.4)').replace('rgb', 'rgba');
      ctx.fillRect(x, y, 1, 1);
    }
  }

  private renderPurpleRedNebulae(ctx: CanvasRenderingContext2D, camera: ICamera): void {
    const parallaxFactor = 0.3;
    
    this.nebulae.forEach(nebula => {
      const screenX = nebula.x - camera.x * parallaxFactor;
      const screenY = nebula.y - camera.y * parallaxFactor;
      
      if (screenX > -nebula.size && screenX < ctx.canvas.width + nebula.size && 
          screenY > -nebula.size && screenY < ctx.canvas.height + nebula.size) {
        
        // Create subtle nebula gradient
        const gradient = ctx.createRadialGradient(
          screenX, screenY, 0,
          screenX, screenY, nebula.size
        );
        
        gradient.addColorStop(0, nebula.color.replace(')', `, ${nebula.intensity})`).replace('rgb', 'rgba'));
        gradient.addColorStop(0.6, nebula.color.replace(')', `, ${nebula.intensity * 0.5})`).replace('rgb', 'rgba'));
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(screenX, screenY, nebula.size, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  private renderEnhancedStarClusters(ctx: CanvasRenderingContext2D, camera: ICamera): void {
    const parallaxFactor = 0.4;
    
    this.starClusters.forEach(cluster => {
      const screenX = cluster.x - camera.x * parallaxFactor;
      const screenY = cluster.y - camera.y * parallaxFactor;
      
      if (screenX > -cluster.size && screenX < ctx.canvas.width + cluster.size && 
          screenY > -cluster.size && screenY < ctx.canvas.height + cluster.size) {
        
        const random = new SeededRandom(this.seed + cluster.x + cluster.y);
        
        for (let i = 0; i < cluster.starCount; i++) {
          const angle = random.next() * Math.PI * 2;
          const radius = random.next() * cluster.size / 2;
          const starX = screenX + Math.cos(angle) * radius;
          const starY = screenY + Math.sin(angle) * radius;
          
          const starBrightness = cluster.brightness * (0.5 + random.next() * 0.5);
          const starSize = random.next() < 0.8 ? 1 : 2;
          
          ctx.fillStyle = `rgba(255, 255, 255, ${starBrightness})`;
          ctx.fillRect(starX, starY, starSize, starSize);
        }
      }
    });
  }

  private renderMultiLayerPixelStars(ctx: CanvasRenderingContext2D, camera: ICamera): void {
    // Render stars in layers with different parallax factors
    const layerParallax = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6];
    
    for (let layer = 0; layer < 6; layer++) {
      const parallaxFactor = layerParallax[layer];
      
      this.distantStars.forEach(star => {
        if (star.layer !== layer) return;
        
        const screenX = star.x - camera.x * parallaxFactor;
        const screenY = star.y - camera.y * parallaxFactor;
        
        // Wrap around for infinite scrolling effect
        let finalX = screenX;
        let finalY = screenY;
        
        if (screenX < -100) finalX += ctx.canvas.width + 200;
        if (screenX > ctx.canvas.width + 100) finalX -= ctx.canvas.width + 200;
        if (screenY < -100) finalY += ctx.canvas.height + 200;
        if (screenY > ctx.canvas.height + 100) finalY -= ctx.canvas.height + 200;
        
        if (finalX >= 0 && finalX <= ctx.canvas.width && 
            finalY >= 0 && finalY <= ctx.canvas.height) {
          
          // Apply subtle twinkle effect
          const time = Date.now() * 0.001;
          const twinkle = 0.8 + Math.sin(time + star.x * 0.01 + star.y * 0.01) * 0.2;
          const finalBrightness = star.brightness * twinkle;
          
          ctx.fillStyle = star.color.replace(')', `, ${finalBrightness})`).replace('rgb', 'rgba');
          ctx.fillRect(finalX, finalY, star.size, star.size);
        }
      });
    }
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
    let currentDistance = 1500; // Significantly larger starting distance (was 800)

    for (let i = 0; i < planetCount; i++) {
      currentDistance += 800 + random.next() * 1600; // Much larger spacing between planets (was 400 + 800)
      
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
          const moonDistance = planetRadius * 12 + j * 180; // Even larger moon orbit distance (was 8 + 120)
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
      const beltDistance = currentDistance + 1200 + random.next() * 1600; // Much larger asteroid belt distance (was 600 + 800)
      const asteroidCount = 20 + Math.floor(random.next() * 35);
      
      for (let i = 0; i < asteroidCount; i++) {
        const angle = random.next() * Math.PI * 2;
        const distance = beltDistance + (random.next() - 0.5) * 800; // Larger asteroid belt spread (was 400)
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