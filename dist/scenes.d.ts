import { IScene, IRenderer, ICamera, SceneType, StarSystem, Vector2D } from './types';
export declare class StarSystemScene implements IScene {
    private celestialBodies;
    private systemName;
    private systemSeed;
    private spaceBackground;
    constructor(systemName?: string, seed?: number);
    private generateSolarSystem;
    private generateStarColor;
    private generatePlanetColor;
    private generateMoonColor;
    private generateAsteroidColor;
    update(deltaTime: number, game: any): void;
    render(renderer: IRenderer, camera: ICamera): void;
    getSceneType(): SceneType;
    getCelestialBodies(): Array<{
        position: Vector2D;
        mass: number;
        radius: number;
    }>;
    getSystemName(): string;
}
export declare class InterstellarSpaceScene implements IScene {
    private starSystems;
    constructor();
    private generateGalaxy;
    update(deltaTime: number, game: any): void;
    render(renderer: IRenderer, camera: ICamera): void;
    private renderGalaxyBackground;
    private renderStarSystem;
    getSceneType(): SceneType;
    getStarSystems(): StarSystem[];
    getCelestialBodies(): Array<{
        position: Vector2D;
        mass: number;
        radius: number;
    }>;
}
