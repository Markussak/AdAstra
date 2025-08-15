import { IRenderer, ICamera } from './types';
export declare class Renderer implements IRenderer {
    private canvas;
    private ctx;
    private pixelRatio;
    private width;
    private height;
    private imageCache;
    constructor(canvas: HTMLCanvasElement);
    resize(): void;
    clear(color?: string): void;
    getContext(): CanvasRenderingContext2D;
    getWidth(): number;
    getHeight(): number;
    drawRect(x: number, y: number, width: number, height: number, color: string): void;
    drawCircle(x: number, y: number, radius: number, color: string, filled?: boolean): void;
    drawLine(x1: number, y1: number, x2: number, y2: number, color: string, width?: number): void;
    drawText(text: string, x: number, y: number, color?: string, font?: string): void;
    drawImage(imagePath: string, x: number, y: number, width?: number, height?: number): void;
    drawStarField(camera: ICamera, layers?: number): void;
    save(): void;
    restore(): void;
    translate(x: number, y: number): void;
    rotate(angle: number): void;
    scale(x: number, y: number): void;
}
