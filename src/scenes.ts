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

export class StarSystemScene implements IScene {
  private celestialBodies: CelestialBody[] = [];
  private systemName: string;
  private systemSeed: number;

  constructor(systemName: string = 'Sol', seed: number = 12345) {
    this.systemName = systemName;
    this.systemSeed = seed;
    this.generateSolarSystem();
  }

  private generateSolarSystem(): void {
    const random = new SeededRandom(this.systemSeed);

    const starMass = 800 + random.next() * 400;
    const starRadius = 120 + random.next() * 80; // Much larger stars for better visibility
    const starColor = this.generateStarColor(random);

    const centralStar = new CelestialBody(
      0, 0, starRadius, CelestialBodyType.STAR, 
      this.systemName, starMass, starColor
    );
    this.celestialBodies.push(centralStar);

    const planetCount = 2 + Math.floor(random.next() * 6);
    let currentDistance = 400; // Much larger starting distance

    for (let i = 0; i < planetCount; i++) {
      currentDistance += 200 + random.next() * 400; // Much larger spacing between planets
      
      const planetRadius = 32 + random.next() * 60; // Much larger planets for better visibility
      const planetMass = planetRadius * 2;
      const planetColor = this.generatePlanetColor(random);
      const orbitSpeed = 0.01 / Math.sqrt(currentDistance / 100);
      const startAngle = random.next() * Math.PI * 2;

      const planet = new CelestialBody(
        currentDistance, 0, planetRadius, CelestialBodyType.PLANET,
        `${this.systemName}-${i + 1}`, planetMass, planetColor
      );
      
      // Add some orbital eccentricity for realism
      const eccentricity = Math.random() * 0.3; // 0-0.3 eccentricity
      planet.setOrbit({ x: 0, y: 0 }, currentDistance, orbitSpeed, startAngle, eccentricity);
      
      if (random.next() < 0.4) {
        planet.hasAtmosphere = true;
        planet.atmosphereColor = 'rgba(95, 158, 158, 0.4)';
        planet.atmosphereRadius = planetRadius * (1.3 + random.next() * 0.4);
      }

      this.celestialBodies.push(planet);

      // Generate moons
      if (planetRadius > 20 && random.next() < 0.6) { // Adjusted threshold
        const moonCount = 1 + Math.floor(random.next() * 3);
        for (let j = 0; j < moonCount; j++) {
          const moonDistance = planetRadius * 6 + j * 80; // Much larger moon orbit distance
          const moonRadius = 12 + random.next() * 20; // Much larger moons for better visibility
          const moonMass = moonRadius;
          const moonColor = this.generateMoonColor(random); // Use new method
          const moonOrbitSpeed = 0.05 / Math.sqrt(moonDistance / 10);
          const moonEccentricity = Math.random() * 0.15; // Small eccentricity for moons

          const moon = new CelestialBody(
            currentDistance + moonDistance, 0, moonRadius, CelestialBodyType.MOON,
            `${planet.name}-M${j + 1}`, moonMass, moonColor
          );
          
          moon.setOrbit(planet.position, moonDistance, moonOrbitSpeed, random.next() * Math.PI * 2, moonEccentricity);
          this.celestialBodies.push(moon);
        }
      }
    }

    // Generate asteroid belt
    if (random.next() < 0.7) {
      const beltDistance = currentDistance + 300 + random.next() * 400; // Much larger asteroid belt distance
      const asteroidCount = 15 + Math.floor(random.next() * 25);
      
      for (let i = 0; i < asteroidCount; i++) {
        const angle = random.next() * Math.PI * 2;
        const distance = beltDistance + (random.next() - 0.5) * 240; // Larger asteroid belt spread
        const asteroidRadius = 8 + random.next() * 16; // Much larger asteroids for better visibility
        const asteroidMass = asteroidRadius * 0.5;
        const orbitSpeed = 0.008 / Math.sqrt(distance / 100);
        const asteroidEccentricity = Math.random() * 0.5; // More eccentric asteroid orbits

        const asteroid = new CelestialBody(
          distance, 0, asteroidRadius, CelestialBodyType.ASTEROID,
          `Asteroid-${i}`, asteroidMass, this.generateAsteroidColor(random) // Use new method
        );
        
        asteroid.setOrbit({ x: 0, y: 0 }, distance, orbitSpeed, random.next() * Math.PI * 2, asteroidEccentricity);
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
      body.update(deltaTime, game);
    });
  }

  public render(renderer: IRenderer, camera: ICamera): void {
    renderer.drawStarField(camera);

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