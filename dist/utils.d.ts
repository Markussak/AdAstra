import { Vector2D, GameConfig } from './types';
export declare const Vector2DUtils: {
    create: (x?: number, y?: number) => Vector2D;
    add: (a: Vector2D, b: Vector2D) => Vector2D;
    subtract: (a: Vector2D, b: Vector2D) => Vector2D;
    multiply: (v: Vector2D, scalar: number) => Vector2D;
    magnitude: (v: Vector2D) => number;
    normalize: (v: Vector2D) => Vector2D;
    distance: (a: Vector2D, b: Vector2D) => number;
};
export declare const gameConfig: GameConfig;
export declare class PhysicsEngine {
    static applyNewtonianMotion(object: {
        position: Vector2D;
        velocity: Vector2D;
    }, deltaTime: number, friction?: number): void;
    static applyGravity(object: {
        position: Vector2D;
        velocity: Vector2D;
    }, gravitySources: Array<{
        position: Vector2D;
        mass: number;
        radius: number;
    }>, deltaTime: number, gravityStrength?: number): void;
    static checkCollision(obj1: {
        position: Vector2D;
        radius: number;
    }, obj2: {
        position: Vector2D;
        radius: number;
    }): boolean;
    static calculateDistance(pos1: Vector2D, pos2: Vector2D): number;
    static normalizeVector(vector: Vector2D): Vector2D;
}
export declare class SeededRandom {
    private seed;
    constructor(seed: number);
    next(): number;
    nextInt(min: number, max: number): number;
    nextFloat(min: number, max: number): number;
    choose<T>(array: T[]): T;
}
export declare class MathUtils {
    static clamp(value: number, min: number, max: number): number;
    static lerp(a: number, b: number, t: number): number;
    static smoothstep(edge0: number, edge1: number, x: number): number;
    static radToDeg(radians: number): number;
    static degToRad(degrees: number): number;
    static angleToVector(angle: number): Vector2D;
    static vectorToAngle(vector: Vector2D): number;
    static wrap(value: number, min: number, max: number): number;
}
export declare class TimeUtils {
    private static startTime;
    static getTime(): number;
    static getGameTime(): number;
    static formatTime(seconds: number): string;
    static sleep(ms: number): Promise<void>;
}
export declare class ColorUtils {
    static hexToRgb(hex: string): {
        r: number;
        g: number;
        b: number;
    } | null;
    static rgbToHex(r: number, g: number, b: number): string;
    static interpolateColor(color1: string, color2: string, factor: number): string;
    static addAlpha(color: string, alpha: number): string;
}
