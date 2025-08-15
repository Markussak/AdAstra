import { IInputManager, KeyState, MouseState, TouchData, VirtualJoystick, Vector2D } from './types';
export declare class InputManager implements IInputManager {
    keys: Map<string, KeyState>;
    mouse: MouseState;
    touches: Map<number, TouchData>;
    isMobile: boolean;
    virtualJoystick: VirtualJoystick;
    constructor();
    private detectMobile;
    private setupEventListeners;
    private handleKeyDown;
    private handleKeyUp;
    private handleMouseMove;
    private handleMouseDown;
    private handleMouseUp;
    private handleTouchStart;
    private handleTouchMove;
    private handleTouchEnd;
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
