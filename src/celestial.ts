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

  public hasAtmosphere: boolean = false;
  public atmosphereColor: string | null = null;
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
    this.rotationSpeed = 0.01 + Math.random() * 0.02;

    this.generateSurfaceFeatures();
  }

  private generateSurfaceFeatures(): void {
    const featureCount = 3 + Math.floor(Math.random() * 5);
    for (let i = 0; i < featureCount; i++) {
      this.surfaceFeatures.push({
        angle: Math.random() * Math.PI * 2,
        size: 0.1 + Math.random() * 0.3,
        color: this.type === CelestialBodyType.PLANET ? '#444444' : '#666666'
      });
    }
  }

  public update(deltaTime: number, game: any): void {
    this.rotation += this.rotationSpeed * deltaTime;

    if (this.orbitCenter && this.orbitDistance > 0) {
      this.orbitAngle += this.orbitSpeed * deltaTime;
      this.position.x = this.orbitCenter.x + Math.cos(this.orbitAngle) * this.orbitDistance;
      this.position.y = this.orbitCenter.y + Math.sin(this.orbitAngle) * this.orbitDistance;
    }
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
      renderer.drawText(this.name, screenPos.x, screenPos.y + this.radius + 20, '#dcd0c0', '8px "Big Apple 3PM", monospace');
    }
  }

  private renderOrbitPath(renderer: IRenderer, camera: ICamera): void {
    if (!this.orbitCenter) return;

    const ctx = renderer.getContext();
    const centerScreen = camera.worldToScreen(this.orbitCenter.x, this.orbitCenter.y);

    ctx.strokeStyle = 'rgba(95, 158, 158, 0.15)';
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

    // Glow effect
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius + 20);
    gradient.addColorStop(0, this.color);
    gradient.addColorStop(0.6, this.color + '88');
    gradient.addColorStop(1, this.color + '00');

    ctx.fillStyle = gradient;
    ctx.fillRect(-this.radius - 20, -this.radius - 20, 
                (this.radius + 20) * 2, (this.radius + 20) * 2);

    // Main star body
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Surface features (solar flares)
    ctx.save();
    ctx.rotate(this.rotation);
    ctx.fillStyle = 'rgba(255, 140, 0, 0.3)';
    this.surfaceFeatures.forEach(feature => {
      const x = Math.cos(feature.angle) * this.radius * 0.7;
      const y = Math.sin(feature.angle) * this.radius * 0.7;
      ctx.beginPath();
      ctx.arc(x, y, this.radius * feature.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // Random solar flares
    if (Math.random() < 0.1) {
      ctx.strokeStyle = '#ff8c00';
      ctx.lineWidth = 2;
      const flareAngle = Math.random() * Math.PI * 2;
      const flareLength = this.radius + Math.random() * 30;
      ctx.beginPath();
      ctx.moveTo(Math.cos(flareAngle) * this.radius, Math.sin(flareAngle) * this.radius);
      ctx.lineTo(Math.cos(flareAngle) * flareLength, Math.sin(flareAngle) * flareLength);
      ctx.stroke();
    }
  }

  private renderPlanet(renderer: IRenderer): void {
    const ctx = renderer.getContext();

    // Main planet body
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Surface features
    ctx.save();
    ctx.rotate(this.rotation);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    this.surfaceFeatures.forEach(feature => {
      const x = Math.cos(feature.angle) * this.radius * 0.4;
      const y = Math.sin(feature.angle) * this.radius * 0.4;
      ctx.beginPath();
      ctx.arc(x, y, this.radius * feature.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // Atmosphere
    if (this.hasAtmosphere && this.atmosphereColor) {
      ctx.strokeStyle = this.atmosphereColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 3, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Day/night terminator
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, Math.PI * 0.7, Math.PI * 1.3);
    ctx.fill();
  }

  private renderMoon(renderer: IRenderer): void {
    const ctx = renderer.getContext();

    // Main moon body
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Craters
    ctx.save();
    ctx.rotate(this.rotation);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.surfaceFeatures.forEach(feature => {
      const x = Math.cos(feature.angle) * this.radius * 0.6;
      const y = Math.sin(feature.angle) * this.radius * 0.6;
      ctx.beginPath();
      ctx.arc(x, y, this.radius * feature.size * 0.5, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  private renderAsteroid(renderer: IRenderer): void {
    const ctx = renderer.getContext();

    ctx.save();
    ctx.rotate(this.rotation);

    // Irregular shape
    ctx.fillStyle = this.color;
    ctx.beginPath();

    const sides = 6 + Math.floor(Math.random() * 3);
    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2;
      const radius = this.radius * (0.7 + Math.random() * 0.6);
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fill();

    // Surface details
    ctx.fillStyle = 'rgba(140, 140, 140, 0.5)';
    ctx.fillRect(-this.radius * 0.3, -this.radius * 0.3, 
                this.radius * 0.2, this.radius * 0.2);

    ctx.restore();
  }

  private renderGeneric(renderer: IRenderer): void {
    renderer.drawCircle(0, 0, this.radius, this.color, true);
  }

  public setOrbit(center: Vector2D, distance: number, speed: number, startAngle: number = 0): void {
    this.orbitCenter = center;
    this.orbitDistance = distance;
    this.orbitSpeed = speed;
    this.orbitAngle = startAngle;
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