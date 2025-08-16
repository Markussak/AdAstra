// renderer.ts - Rendering system

import { IRenderer, ICamera, Vector2D } from './types';
import { ColorPalette } from './palette';

export class Renderer implements IRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private pixelRatio: number;
  private width: number = 0;
  private height: number = 0;
  private imageCache: Map<string, HTMLImageElement> = new Map();

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Unable to get 2D context from canvas');
    }
    this.ctx = context;
    this.pixelRatio = window.devicePixelRatio || 1;
    this.ctx.imageSmoothingEnabled = false;
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Try to load runtime palette (non-blocking)
    ColorPalette.load().catch(() => {});
  }

  public resize(): void {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.canvas.width = this.width * this.pixelRatio;
    this.canvas.height = this.height * this.pixelRatio;
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';

    this.ctx.scale(this.pixelRatio, this.pixelRatio);
  }

  public clear(color: string = '#1a1a2a'): void {
    this.ctx.fillStyle = ColorPalette.resolve(color);
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  public getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  public getWidth(): number {
    return this.width;
  }

  public getHeight(): number {
    return this.height;
  }

  public drawRect(x: number, y: number, width: number, height: number, color: string): void {
    this.ctx.fillStyle = ColorPalette.resolve(color);
    this.ctx.fillRect(x, y, width, height);
  }

  public strokeRect(x: number, y: number, width: number, height: number, color: string, lineWidth: number = 1): void {
    this.ctx.strokeStyle = ColorPalette.resolve(color);
    this.ctx.lineWidth = lineWidth;
    this.ctx.strokeRect(x, y, width, height);
  }

  public drawCircle(x: number, y: number, radius: number, color: string, filled: boolean = true): void {
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);

    if (filled) {
      this.ctx.fillStyle = ColorPalette.resolve(color);
      this.ctx.fill();
    } else {
      this.ctx.strokeStyle = ColorPalette.resolve(color);
      this.ctx.stroke();
    }
  }

  public fillCircle(x: number, y: number, radius: number, color: string): void {
    this.ctx.fillStyle = ColorPalette.resolve(color);
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  public strokeCircle(x: number, y: number, radius: number, color: string, lineWidth: number = 1): void {
    this.ctx.strokeStyle = ColorPalette.resolve(color);
    this.ctx.lineWidth = lineWidth;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.stroke();
  }

  public strokePath(points: Vector2D[], color: string, lineWidth: number = 1): void {
    if (points.length < 2) return;
    
    this.ctx.strokeStyle = ColorPalette.resolve(color);
    this.ctx.lineWidth = lineWidth;
    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i].x, points[i].y);
    }
    
    this.ctx.stroke();
  }

  public drawLine(x1: number, y1: number, x2: number, y2: number, color: string, width: number = 1): void {
    this.ctx.strokeStyle = ColorPalette.resolve(color);
    this.ctx.lineWidth = width;
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
  }

  public drawText(text: string, x: number, y: number, color: string = '#ffffff', font: string = '12px "Big Apple 3PM", monospace'): void {
    this.ctx.fillStyle = ColorPalette.resolve(color);
    this.ctx.font = font;
    this.ctx.textAlign = 'center';
    this.ctx.fillText(text, x, y);
  }

  public drawImage(imagePath: string, x: number, y: number, width?: number, height?: number): void {
    let image = this.imageCache.get(imagePath);
    
    if (!image) {
      image = new Image();
      image.src = imagePath;
      this.imageCache.set(imagePath, image);
      
      // If image not loaded yet, return
      if (!image.complete) {
        image.onload = () => {
          // Re-draw when image loads (this is a simplified approach)
        };
        return;
      }
    }

    if (image.complete) {
      if (width !== undefined && height !== undefined) {
        this.ctx.drawImage(image, x, y, width, height);
      } else {
        this.ctx.drawImage(image, x, y);
      }
    }
  }

  public drawStarField(camera: ICamera, layers: number = 3): void {
    for (let layer = 0; layer < layers; layer++) {
      const parallaxFactor = 0.1 + layer * 0.05;
      const starCount = 50 + layer * 25;
      const alpha = 0.3 + layer * 0.2;

      this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      
      for (let i = 0; i < starCount; i++) {
        const starX = (i * 123.456) % 2000 - 1000;
        const starY = (i * 789.123) % 1500 - 750;
        
        const screenX = starX - camera.x * parallaxFactor;
        const screenY = starY - camera.y * parallaxFactor;
        
        const wrappedX = ((screenX % this.width) + this.width) % this.width;
        const wrappedY = ((screenY % this.height) + this.height) % this.height;
        
        // Twinkling effect
        const time = Date.now() * 0.001;
        const twinkle = Math.sin((time + i * 0.1) * 2) * 0.3 + 0.7;
        this.ctx.globalAlpha = twinkle * alpha;
        
        this.ctx.fillRect(wrappedX, wrappedY, 1, 1);
      }
    }
    this.ctx.globalAlpha = 1.0;
  }

  public save(): void {
    this.ctx.save();
  }

  public restore(): void {
    this.ctx.restore();
  }

  public translate(x: number, y: number): void {
    this.ctx.translate(x, y);
  }

  public rotate(angle: number): void {
    this.ctx.rotate(angle);
  }

  public scale(x: number, y: number): void {
    this.ctx.scale(x, y);
  }

  public drawRacePortrait(race: string, x: number, y: number, size: number, baseColor: string): void {
    const centerX = x + size / 2;
    const centerY = y + size / 2;
    
    this.ctx.save();
    
    // Draw background
    this.drawRect(x, y, size, size, 'rgba(0, 0, 0, 0.3)');
    this.drawRect(x, y, size, size, '#505050');
    
    // Draw race-specific portrait based on race type
    switch (race.toLowerCase()) {
      case 'human':
      case 'lidé':
        this.drawHumanPortrait(centerX, centerY, size, baseColor);
        break;
      case 'terran':
      case 'terraňané':
        this.drawTerranPortrait(centerX, centerY, size, baseColor);
        break;
      case 'zephyrian':
      case 'zefyriáni':
        this.drawZephyrianPortrait(centerX, centerY, size, baseColor);
        break;
      case 'crystalline':
      case 'krystalové':
        this.drawCrystallinePortrait(centerX, centerY, size, baseColor);
        break;
      case 'vorthan':
      case 'vorthané':
        this.drawVorthanPortrait(centerX, centerY, size, baseColor);
        break;
      case 'aquarian':
      case 'akvariáni':
        this.drawAquarianPortrait(centerX, centerY, size, baseColor);
        break;
      case 'mechano':
      case 'mechanoidové':
        this.drawMechanoPortrait(centerX, centerY, size, baseColor);
        break;
      case 'ethereal':
      case 'éteričtí':
        this.drawEtherealPortrait(centerX, centerY, size, baseColor);
        break;
      default:
        this.drawHumanPortrait(centerX, centerY, size, baseColor);
    }
    
    this.ctx.restore();
  }

  private drawHumanPortrait(x: number, y: number, size: number, color: string): void {
    const s = size * 0.3;
    // Head
    this.fillCircle(x, y - s * 0.3, s * 0.8, color);
    // Eyes
    this.fillCircle(x - s * 0.3, y - s * 0.5, s * 0.15, '#000000');
    this.fillCircle(x + s * 0.3, y - s * 0.5, s * 0.15, '#000000');
    // Body
    this.drawRect(x - s * 0.6, y + s * 0.2, s * 1.2, s * 1.0, color);
  }

  private drawTerranPortrait(x: number, y: number, size: number, color: string): void {
    const s = size * 0.3;
    // Head with tech implants
    this.fillCircle(x, y - s * 0.3, s * 0.8, color);
    // Eyes (cybernetic)
    this.fillCircle(x - s * 0.3, y - s * 0.5, s * 0.15, '#00ffff');
    this.fillCircle(x + s * 0.3, y - s * 0.5, s * 0.15, '#00ffff');
    // Tech lines
    this.drawLine(x - s * 0.5, y - s * 0.2, x + s * 0.5, y - s * 0.2, '#00ffff', 2);
    // Body
    this.drawRect(x - s * 0.6, y + s * 0.2, s * 1.2, s * 1.0, color);
  }

  private drawZephyrianPortrait(x: number, y: number, size: number, color: string): void {
    const s = size * 0.3;
    // Head (elongated)
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.ellipse(x, y - s * 0.3, s * 0.6, s * 1.0, 0, 0, Math.PI * 2);
    this.ctx.fill();
    // Large eyes
    this.fillCircle(x - s * 0.2, y - s * 0.4, s * 0.2, '#ffffff');
    this.fillCircle(x + s * 0.2, y - s * 0.4, s * 0.2, '#ffffff');
    this.fillCircle(x - s * 0.2, y - s * 0.4, s * 0.1, '#000088');
    this.fillCircle(x + s * 0.2, y - s * 0.4, s * 0.1, '#000088');
    // Body
    this.drawRect(x - s * 0.5, y + s * 0.3, s * 1.0, s * 0.8, color);
  }

  private drawCrystallinePortrait(x: number, y: number, size: number, color: string): void {
    const s = size * 0.3;
    // Crystalline head (angular)
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y - s * 0.8);
    this.ctx.lineTo(x + s * 0.6, y - s * 0.2);
    this.ctx.lineTo(x + s * 0.4, y + s * 0.2);
    this.ctx.lineTo(x - s * 0.4, y + s * 0.2);
    this.ctx.lineTo(x - s * 0.6, y - s * 0.2);
    this.ctx.closePath();
    this.ctx.fill();
    // Crystal eyes
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(x - s * 0.2, y - s * 0.4, s * 0.1, s * 0.2);
    this.ctx.fillRect(x + s * 0.1, y - s * 0.4, s * 0.1, s * 0.2);
    // Body (angular)
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x - s * 0.5, y + s * 0.3, s * 1.0, s * 0.8);
  }

  private drawVorthanPortrait(x: number, y: number, size: number, color: string): void {
    const s = size * 0.3;
    // Large head
    this.fillCircle(x, y - s * 0.2, s * 0.9, color);
    // Red eyes
    this.fillCircle(x - s * 0.3, y - s * 0.4, s * 0.15, '#ff0000');
    this.fillCircle(x + s * 0.3, y - s * 0.4, s * 0.15, '#ff0000');
    // Scars
    this.drawLine(x - s * 0.1, y - s * 0.7, x + s * 0.2, y - s * 0.2, '#800000', 2);
    // Muscular body
    this.drawRect(x - s * 0.7, y + s * 0.2, s * 1.4, s * 1.0, color);
  }

  private drawAquarianPortrait(x: number, y: number, size: number, color: string): void {
    const s = size * 0.3;
    // Smooth head
    this.fillCircle(x, y - s * 0.3, s * 0.8, color);
    // Large, gentle eyes
    this.fillCircle(x - s * 0.3, y - s * 0.5, s * 0.2, '#0088ff');
    this.fillCircle(x + s * 0.3, y - s * 0.5, s * 0.2, '#0088ff');
    // Gills
    this.drawLine(x - s * 0.6, y - s * 0.1, x - s * 0.4, y + s * 0.1, '#0066cc', 2);
    this.drawLine(x + s * 0.4, y - s * 0.1, x + s * 0.6, y + s * 0.1, '#0066cc', 2);
    // Body
    this.drawRect(x - s * 0.6, y + s * 0.2, s * 1.2, s * 1.0, color);
  }

  private drawMechanoPortrait(x: number, y: number, size: number, color: string): void {
    const s = size * 0.3;
    // Mechanical head
    this.drawRect(x - s * 0.6, y - s * 0.8, s * 1.2, s * 1.0, color);
    // LED eyes
    this.fillCircle(x - s * 0.3, y - s * 0.5, s * 0.1, '#ff0000');
    this.fillCircle(x + s * 0.3, y - s * 0.5, s * 0.1, '#ff0000');
    // Mechanical details
    this.drawRect(x - s * 0.5, y - s * 0.2, s * 1.0, s * 0.1, '#666666');
    this.drawRect(x - s * 0.2, y - s * 0.6, s * 0.4, s * 0.1, '#666666');
    // Body
    this.drawRect(x - s * 0.6, y + s * 0.2, s * 1.2, s * 1.0, color);
  }

  private drawEtherealPortrait(x: number, y: number, size: number, color: string): void {
    const s = size * 0.3;
    // Translucent head
    this.ctx.globalAlpha = 0.7;
    this.fillCircle(x, y - s * 0.3, s * 0.8, color);
    // Glowing eyes
    this.ctx.globalAlpha = 1.0;
    this.fillCircle(x - s * 0.3, y - s * 0.5, s * 0.15, '#ffffff');
    this.fillCircle(x + s * 0.3, y - s * 0.5, s * 0.15, '#ffffff');
    // Energy wisps
    this.ctx.globalAlpha = 0.5;
    this.fillCircle(x - s * 0.8, y - s * 0.6, s * 0.2, color);
    this.fillCircle(x + s * 0.8, y - s * 0.4, s * 0.15, color);
    // Body
    this.ctx.globalAlpha = 0.7;
    this.drawRect(x - s * 0.6, y + s * 0.2, s * 1.2, s * 1.0, color);
    this.ctx.globalAlpha = 1.0;
  }

  private drawDrakonidPortrait(x: number, y: number, size: number, color: string): void {
    const s = size * 0.3;
    // Reptilian head
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.ellipse(x, y - s * 0.3, s * 0.7, s * 0.9, 0, 0, Math.PI * 2);
    this.ctx.fill();
    // Reptilian eyes
    this.fillCircle(x - s * 0.2, y - s * 0.5, s * 0.12, '#ffff00');
    this.fillCircle(x + s * 0.2, y - s * 0.5, s * 0.12, '#ffff00');
    this.fillCircle(x - s * 0.2, y - s * 0.5, s * 0.06, '#000000');
    this.fillCircle(x + s * 0.2, y - s * 0.5, s * 0.06, '#000000');
    // Scales
    for (let i = 0; i < 3; i++) {
      this.drawRect(x - s * 0.3 + i * s * 0.3, y - s * 0.1, s * 0.2, s * 0.1, '#333333');
    }
    // Body
    this.drawRect(x - s * 0.6, y + s * 0.2, s * 1.2, s * 1.0, color);
  }

  private drawSylvanPortrait(x: number, y: number, size: number, color: string): void {
    const s = size * 0.3;
    // Plant-like head
    this.fillCircle(x, y - s * 0.3, s * 0.8, color);
    // Nature eyes
    this.fillCircle(x - s * 0.3, y - s * 0.5, s * 0.15, '#00ff00');
    this.fillCircle(x + s * 0.3, y - s * 0.5, s * 0.15, '#00ff00');
    // Leaf patterns
    this.ctx.fillStyle = '#228B22';
    this.ctx.beginPath();
    this.ctx.ellipse(x - s * 0.4, y - s * 0.8, s * 0.2, s * 0.4, -0.5, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.ellipse(x + s * 0.4, y - s * 0.8, s * 0.2, s * 0.4, 0.5, 0, Math.PI * 2);
    this.ctx.fill();
    // Body
    this.drawRect(x - s * 0.6, y + s * 0.2, s * 1.2, s * 1.0, color);
  }

  private drawDefaultPortrait(x: number, y: number, size: number, color: string): void {
    const s = size * 0.3;
    // Generic head
    this.fillCircle(x, y - s * 0.3, s * 0.8, color);
    // Eyes
    this.fillCircle(x - s * 0.3, y - s * 0.5, s * 0.15, '#000000');
    this.fillCircle(x + s * 0.3, y - s * 0.5, s * 0.15, '#000000');
    // Body
    this.drawRect(x - s * 0.6, y + s * 0.2, s * 1.2, s * 1.0, color);
  }
}