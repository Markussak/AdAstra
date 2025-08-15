// renderer.ts - Rendering system

import { IRenderer, ICamera, Vector2D } from './types';

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
    this.ctx.fillStyle = color;
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
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, width, height);
  }

  public drawCircle(x: number, y: number, radius: number, color: string, filled: boolean = true): void {
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);

    if (filled) {
      this.ctx.fillStyle = color;
      this.ctx.fill();
    } else {
      this.ctx.strokeStyle = color;
      this.ctx.stroke();
    }
  }

  public fillCircle(x: number, y: number, radius: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  public strokeCircle(x: number, y: number, radius: number, color: string, lineWidth: number = 1): void {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.stroke();
  }

  public strokePath(points: Vector2D[], color: string, lineWidth: number = 1): void {
    if (points.length < 2) return;
    
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i].x, points[i].y);
    }
    
    this.ctx.stroke();
  }

  public drawLine(x1: number, y1: number, x2: number, y2: number, color: string, width: number = 1): void {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
  }

  public drawText(text: string, x: number, y: number, color: string = '#ffffff', font: string = '12px monospace'): void {
    this.ctx.fillStyle = color;
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
}