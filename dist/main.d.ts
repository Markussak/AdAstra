import { IGameEngine, IRenderer, IStateManager, ISceneManager, IInputManager, ICamera, IStatusBar, IPlayerShip } from './types';
import { QuestSystem } from './questSystem';
export declare class GameEngine implements IGameEngine {
    canvas: HTMLCanvasElement;
    renderer: IRenderer;
    stateManager: IStateManager;
    sceneManager: ISceneManager;
    inputManager: IInputManager;
    camera: ICamera;
    statusBar: IStatusBar;
    player: IPlayerShip;
    questSystem: QuestSystem;
    gameTime: number;
    lastFrameTime: number;
    constructor(canvasId: string);
    startGameLoop(): void;
    update(deltaTime: number): void;
    render(): void;
    renderHUD(): void;
    renderActiveQuests(): void;
}
export declare function initializeGame(): void;
