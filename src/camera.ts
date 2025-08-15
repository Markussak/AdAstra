// camera.ts - Camera system

import { ICamera, Vector2D } from './types';

export class Camera implements ICamera {
  public x: number = 0;
  public y: number = 0;
  public zoom: number = 1.0;
  public targetX: number = 0;
  public targetY: number = 0;
  public smoothing: number = 0.05;

  public followTarget(
    target: Vector2D,
    deltaTime: number,
    screenWidth: number,
    screenHeight: number,
    predictionFactor: number = 30
  ): void {
    this.targetX = target.x;
    this.targetY = target.y;

    const factor = 1 - Math.pow(this.smoothing, deltaTime * 60);
    this.x += (this.targetX - this.x - screenWidth / 2) * factor;
    this.y += (this.targetY - this.y - screenHeight / 2) * factor;
  }

  public screenToWorld(screenX: number, screenY: number): Vector2D {
    return {
      x: (screenX / this.zoom) + this.x,
      y: (screenY / this.zoom) + this.y
    };
  }

  public worldToScreen(worldX: number, worldY: number): Vector2D {
    return {
      x: (worldX - this.x) * this.zoom,
      y: (worldY - this.y) * this.zoom
    };
  }

  public setZoom(zoom: number): void {
    this.zoom = Math.max(0.1, Math.min(5.0, zoom));
  }
}