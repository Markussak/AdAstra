export interface Vector2D {
    x: number;
    y: number;
}
export interface Position extends Vector2D {
}
export interface Velocity extends Vector2D {
}
export interface GameConfig {
    canvas: {
        width: number;
        height: number;
        pixelRatio: number;
    };
    ui: {
        statusBarHeight: number;
    };
    physics: {
        gravityStrength: number;
        frictionFactor: number;
        maxVelocity: number;
    };
    colors: {
        bgPrimary: string;
        hullPrimary: string;
        hullSecondary: string;
        accentFriendly: string;
        accentHostile: string;
        accentNeutral: string;
        fxGlowPrimary: string;
        fxGlowSecondary: string;
    };
}
export declare enum GameState {
    LOADING = "loading",
    MAIN_MENU = "mainMenu",
    NEW_GAME_SETUP = "newGameSetup",
    PLAYING = "playing",
    PAUSED = "paused",
    INVENTORY = "inventory",
    RESEARCH = "research",
    SETTINGS = "settings"
}
export declare enum ShipSystemType {
    REACTOR = "reactor",
    ENGINES = "engines",
    SHIELDS = "shields",
    WEAPONS = "weapons",
    LIFE_SUPPORT = "lifeSupport",
    NAVIGATION = "navigation",
    COMMUNICATIONS = "communications",
    WARP_DRIVE = "warpDrive"
}
export declare enum WeaponType {
    LASER = "laser",
    MISSILES = "missiles",
    RAILGUN = "railgun",
    MINING_LASER = "miningLaser",
    PLASMA_CANNON = "plasmaCannon",
    ION_BEAM = "ionBeam",
    TORPEDO = "torpedo",
    PULSE_LASER = "pulseLaser",
    BEAM_LASER = "beamLaser",
    FLAK_CANNON = "flakCannon",
    EMP_WEAPON = "empWeapon"
}
export declare enum CelestialBodyType {
    STAR = "star",
    PLANET = "planet",
    MOON = "moon",
    ASTEROID = "asteroid",
    COMET = "comet",
    BLACK_HOLE = "blackHole",
    SPACE_STATION = "spaceStation"
}
export declare enum SceneType {
    STAR_SYSTEM = "starSystem",
    INTERSTELLAR_SPACE = "interstellarSpace"
}
export declare enum DifficultyLevel {
    EASY = "easy",
    NORMAL = "normal",
    HARD = "hard",
    EXTREME = "extreme"
}
export declare enum ShipType {
    SCOUT = "scout",
    FIGHTER = "fighter",
    EXPLORER = "explorer",
    CARGO = "cargo",
    BATTLESHIP = "battleship",
    INTERCEPTOR = "interceptor",
    CRUISER = "cruiser",
    DREADNOUGHT = "dreadnought",
    STEALTH = "stealth",
    MINING = "mining"
}
export interface ShipSystem {
    type: ShipSystemType;
    health: number;
    maxHealth: number;
    active: boolean;
    efficiency: number;
    powerConsumption: number;
}
export interface Weapon {
    type: WeaponType;
    damage: number;
    range: number;
    energyCost: number;
    heat: number;
    maxHeat: number;
    cooldownRate: number;
    fireRate: number;
    lastFired: number;
    ammo?: number;
    maxAmmo?: number;
}
export interface ShipComponent {
    name: string;
    health: number;
    maxHealth: number;
    critical: boolean;
    position: Vector2D;
}
export interface CargoItem {
    id: string;
    name: string;
    quantity: number;
    weight: number;
    value: number;
}
export interface TouchData {
    id: number;
    x: number;
    y: number;
    startX: number;
    startY: number;
}
export interface VirtualJoystick {
    active: boolean;
    centerX: number;
    centerY: number;
    x: number;
    y: number;
    radius: number;
}
export interface MouseState {
    x: number;
    y: number;
    pressed: boolean;
    justPressed: boolean;
    justReleased: boolean;
}
export interface KeyState {
    pressed: boolean;
    justPressed: boolean;
    justReleased: boolean;
}
export interface SurfaceFeature {
    angle: number;
    size: number;
    color: string;
}
export interface StarSystem {
    position: Vector2D;
    name: string;
    type: string;
    color: string;
    size: number;
    explored: boolean;
    seed: number;
}
export interface StatusPanel {
    name: string;
    x: number;
    width: number;
    color: string;
}
export interface GameSetup {
    playerName: string;
    difficulty: DifficultyLevel;
    shipType: ShipType;
    startingResources: {
        fuel: number;
        energy: number;
        credits: number;
    };
}
export interface ShipTemplate {
    type: ShipType;
    name: string;
    description: string;
    baseStats: {
        hull: number;
        shields: number;
        speed: number;
        cargo: number;
    };
    weapons: WeaponType[];
    specialAbilities: string[];
    rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
    cost: number;
}
export declare enum QuestType {
    DELIVERY = "delivery",
    COMBAT = "combat",
    EXPLORATION = "exploration",
    MINING = "mining",
    ESCORT = "escort",
    STORY = "story"
}
export declare enum QuestStatus {
    AVAILABLE = "available",
    ACTIVE = "active",
    COMPLETED = "completed",
    FAILED = "failed",
    TURNED_IN = "turnedIn"
}
export interface QuestObjective {
    id: string;
    description: string;
    type: 'kill' | 'collect' | 'deliver' | 'visit' | 'survive';
    target?: string;
    quantity: number;
    currentProgress: number;
    completed: boolean;
}
export interface Quest {
    id: string;
    title: string;
    description: string;
    type: QuestType;
    status: QuestStatus;
    objectives: QuestObjective[];
    rewards: {
        credits: number;
        experience: number;
        items?: CargoItem[];
    };
    timeLimit?: number;
    timeRemaining?: number;
    difficulty: number;
    location?: string;
    npcGiver?: string;
}
export interface SaveData {
    version: string;
    timestamp: number;
    playerData: {
        name: string;
        credits: number;
        experience: number;
        level: number;
        position: Vector2D;
        currentSystem: string;
    };
    shipData: {
        type: ShipType;
        hull: number;
        maxHull: number;
        shields: number;
        maxShields: number;
        fuel: number;
        maxFuel: number;
        energy: number;
        maxEnergy: number;
        cargo: CargoItem[];
        systems: Record<string, any>;
        weapons: Record<string, any>;
    };
    gameData: {
        difficulty: DifficultyLevel;
        playTime: number;
        currentQuests: Quest[];
        completedQuests: string[];
        discoveredSystems: string[];
        gameSettings: GameSettings;
    };
}
export interface GameSettings {
    graphics: {
        fullscreen: boolean;
        resolution: string;
        pixelPerfect: boolean;
        showFPS: boolean;
    };
    audio: {
        masterVolume: number;
        musicVolume: number;
        sfxVolume: number;
        muted: boolean;
    };
    controls: {
        mouseInvert: boolean;
        keyBindings: Record<string, string>;
    };
    gameplay: {
        autosave: boolean;
        autosaveInterval: number;
        showTutorials: boolean;
        pauseOnFocusLoss: boolean;
    };
}
export interface IGameState {
    enter?(): void;
    exit?(): void;
    update(deltaTime: number): void;
    render(renderer: IRenderer): void;
    handleInput(input: IInputManager): void;
}
export interface IRenderer {
    clear(color?: string): void;
    getContext(): CanvasRenderingContext2D;
    getWidth(): number;
    getHeight(): number;
    drawRect(x: number, y: number, width: number, height: number, color: string): void;
    drawCircle(x: number, y: number, radius: number, color: string, filled?: boolean): void;
    drawLine(x1: number, y1: number, x2: number, y2: number, color: string, width?: number): void;
    drawText(text: string, x: number, y: number, color?: string, font?: string): void;
    drawStarField(camera: ICamera, layers?: number): void;
    drawImage(imagePath: string, x: number, y: number, width?: number, height?: number): void;
    save(): void;
    restore(): void;
    translate(x: number, y: number): void;
    rotate(angle: number): void;
    scale(x: number, y: number): void;
    resize(): void;
}
export interface ICamera {
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
export interface IInputManager {
    keys: Map<string, KeyState>;
    mouse: MouseState;
    touches: Map<number, TouchData>;
    isMobile: boolean;
    virtualJoystick: VirtualJoystick;
    isKeyPressed(key: string): boolean;
    wasKeyJustPressed(key: string): boolean;
    wasKeyJustReleased(key: string): boolean;
    getMousePosition(): Vector2D;
    isMousePressed(): boolean;
    getThrustInput(): number;
    getBrakeInput(): number;
    getRotationInput(): number;
    getFireInput(): boolean;
    update(): void;
}
export interface IGameObject {
    position: Vector2D;
    velocity: Vector2D;
    angle: number;
    radius: number;
    active: boolean;
    update(deltaTime: number, game: any): void;
    render(renderer: IRenderer, camera: ICamera): void;
}
export interface ICelestialBody extends IGameObject {
    type: CelestialBodyType;
    name: string;
    mass: number;
    color: string;
    rotationSpeed: number;
    rotation: number;
    orbitDistance: number;
    orbitSpeed: number;
    orbitAngle: number;
    orbitCenter: Vector2D | null;
    hasAtmosphere: boolean;
    atmosphereColor: string | null;
    surfaceFeatures: SurfaceFeature[];
    setOrbit(center: Vector2D, distance: number, speed: number, startAngle?: number): void;
    isVisible(camera: ICamera, screenWidth: number, screenHeight: number): boolean;
}
export interface IPlayerShip extends IGameObject {
    systems: Map<ShipSystemType, ShipSystem>;
    components: ShipComponent[];
    weapons: Map<WeaponType, Weapon>;
    selectedWeapon: WeaponType;
    hull: number;
    maxHull: number;
    shields: number;
    maxShields: number;
    fuel: number;
    maxFuel: number;
    energy: number;
    maxEnergy: number;
    thrust: number;
    maxThrust: number;
    rotationSpeed: number;
    cargoItems: Map<string, CargoItem>;
    cargoWeight: number;
    maxCargoWeight: number;
    toggleSystem(systemType: ShipSystemType): void;
    selectWeapon(weaponType: WeaponType): void;
    getSystemStatus(systemType: ShipSystemType): ShipSystem | undefined;
    getWeaponStatus(weaponType: WeaponType): Weapon | undefined;
    fireWeapon(): void;
}
export interface IScene {
    update(deltaTime: number, game: any): void;
    render(renderer: IRenderer, camera: ICamera): void;
    getSceneType(): SceneType;
}
export interface IStateManager {
    states: Map<GameState, IGameState>;
    currentState: GameState;
    transitionInProgress: boolean;
    setState(newState: GameState): void;
    update(deltaTime: number): void;
    render(renderer: IRenderer): void;
    handleInput(input: IInputManager): void;
    getCurrentState(): GameState;
}
export interface ISceneManager {
    scenes: Map<SceneType, IScene>;
    currentScene: SceneType;
    transitionInProgress: boolean;
    switchScene(newScene: SceneType): void;
    getCurrentScene(): IScene;
    getCurrentSceneType(): SceneType;
    update(deltaTime: number, game: any): void;
    render(renderer: IRenderer, camera: ICamera): void;
}
export interface IStatusBar {
    height: number;
    panels: StatusPanel[];
    update(player: IPlayerShip): void;
    render(player: IPlayerShip): void;
}
export interface IGameEngine {
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
    startGameLoop(): void;
    update(deltaTime: number): void;
    render(): void;
    renderHUD(): void;
}
