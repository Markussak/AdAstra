import { IGameEngine, IRenderer, IStateManager, ISceneManager, IInputManager, ICamera, IStatusBar, IPlayerShip } from './types';
export declare class GameEngine implements IGameEngine {
    canvas: HTMLCanvasElement;
    renderer: IRenderer;
    stateManager: IStateManager;
    sceneManager: ISceneManager;
    inputManager: IInputManager;
    camera: ICamera;
    statusBar: IStatusBar;
    player: IPlayerShip;
    gameTime: number;
    lastFrameTime: number;
    constructor(canvasId: string);
    startGameLoop(): void;
    update(deltaTime: number): void;
    render(): void;
    renderHUD(): void;
}
export declare function initializeGame(): void;
