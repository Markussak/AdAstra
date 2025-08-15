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
    const starRadius = 30 + random.next() * 20;
    const starColor = this.generateStarColor(random);

    const centralStar = new CelestialBody(
      0, 0, starRadius, CelestialBodyType.STAR, 
      this.systemName, starMass, starColor
    );
    this.celestialBodies.push(centralStar);

    const planetCount = 2 + Math.floor(random.next() * 6);
    let currentDistance = 120;

    for (let i = 0; i < planetCount; i++) {
      currentDistance += 50 + random.next() * 100;
      
      const planetRadius = 8 + random.next() * 15;
      const planetMass = planetRadius * 2;
      const planetColor = this.generatePlanetColor(random);
      const orbitSpeed = 0.01 / Math.sqrt(currentDistance / 100);
      const startAngle = random.next() * Math.PI * 2;

      const planet = new CelestialBody(
        currentDistance, 0, planetRadius, CelestialBodyType.PLANET,
        `${this.systemName}-${i + 1}`, planetMass, planetColor
      );
      
      planet.setOrbit({ x: 0, y: 0 }, currentDistance, orbitSpeed, startAngle);
      
      if (random.next() < 0.4) {
        planet.hasAtmosphere = true;
        planet.atmosphereColor = 'rgba(95, 158, 158, 0.4)';
      }

      this.celestialBodies.push(planet);

      // Generate moons
      if (planetRadius > 12 && random.next() < 0.6) {
        const moonCount = 1 + Math.floor(random.next() * 3);
        for (let j = 0; j < moonCount; j++) {
          const moonDistance = planetRadius * 3 + j * 25;
          const moonRadius = 3 + random.next() * 5;
          const moonMass = moonRadius;
          const moonColor = '#888888';
          const moonOrbitSpeed = 0.05 / Math.sqrt(moonDistance / 10);

          const moon = new CelestialBody(
            currentDistance + moonDistance, 0, moonRadius, CelestialBodyType.MOON,
            `${planet.name}-M${j + 1}`, moonMass, moonColor
          );
          
          moon.setOrbit(planet.position, moonDistance, moonOrbitSpeed, random.next() * Math.PI * 2);
          this.celestialBodies.push(moon);
        }
      }
    }

    // Generate asteroid belt
    if (random.next() < 0.7) {
      const beltDistance = currentDistance + 80 + random.next() * 100;
      const asteroidCount = 15 + Math.floor(random.next() * 25);
      
      for (let i = 0; i < asteroidCount; i++) {
        const angle = random.next() * Math.PI * 2;
        const distance = beltDistance + (random.next() - 0.5) * 60;
        const asteroidRadius = 2 + random.next() * 4;
        const asteroidMass = asteroidRadius * 0.5;
        const orbitSpeed = 0.008 / Math.sqrt(distance / 100);

        const asteroid = new CelestialBody(
          distance, 0, asteroidRadius, CelestialBodyType.ASTEROID,
          `Asteroid-${i}`, asteroidMass, '#666666'
        );
        
        asteroid.setOrbit({ x: 0, y: 0 }, distance, orbitSpeed, angle);
        this.celestialBodies.push(asteroid);
      }
    }
  }

  private generateStarColor(random: SeededRandom): string {
    const starTypes = [
      '#ffff88', '#ff8844', '#ff4444', '#8888ff', '#ffffff'
    ];
    return random.choose(starTypes);
  }

  private generatePlanetColor(random: SeededRandom): string {
    const planetColors = [
      '#4a90e2', '#d2691e', '#8c6a3d', '#ff6b35', '#a0522d',
      '#4169e1', '#ffd700', '#800080'
    ];
    return random.choose(planetColors);
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