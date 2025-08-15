import { ICamera, Vector2D } from './types';
export declare class Camera implements ICamera {
    x: number;
    y: number;
    zoom: number;
    targetX: number;
    targetY: number;
    smoothing: number;
    followTarget(target: Vector2D, deltaTime: number, screenWidth: number, screenHeight: number, predictionFactor?: number): void;
    screenToWorld(screenX: number, screenY: number): Vector2D;
    worldToScreen(worldX: number, worldY: number): Vector2D;
    setZoom(zoom: number): void;
}
