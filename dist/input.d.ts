import { IInputManager, KeyState, MouseState, TouchData, VirtualJoystick, Vector2D } from './types';
export declare class InputManager implements IInputManager {
    keys: Map<string, KeyState>;
    mouse: MouseState;
    touches: Map<number, TouchData>;
    isMobile: boolean;
    touchControlsEnabled: boolean;
    virtualJoystick: VirtualJoystick;
    touchButtons: {
        fire: {
            x: number;
            y: number;
            radius: number;
            pressed: boolean;
            justPressed: boolean;
        };
        pause: {
            x: number;
            y: number;
            radius: number;
            pressed: boolean;
            justPressed: boolean;
        };
        warp: {
            x: number;
            y: number;
            radius: number;
            pressed: boolean;
            justPressed: boolean;
        };
    };
    private joystickTouchId;
    private canvas;
    constructor();
    private detectMobile;
    private initializeTouchControls;
    private updateTouchButtonPositions;
    private setupEventListeners;
    private handleKeyDown;
    private handleKeyUp;
    private handleMouseMove;
    private handleMouseDown;
    private handleMouseUp;
    private handleTouchStart;
    private handleTouchMove;
    private handleTouchEnd;
    private updateJoystick;
    private checkTouchButtons;
    private releaseTouchButtons;
    private isPointInCircle;
    isKeyPressed(key: string): boolean;
    wasKeyJustPressed(key: string): boolean;
    wasKeyJustReleased(key: string): boolean;
    getMousePosition(): Vector2D;
    isMousePressed(): boolean;
    getThrustInput(): number;
    getBrakeInput(): number;
    getRotationInput(): number;
    getFireInput(): boolean;
    getTouchMenuInput(): {
        up: boolean;
        down: boolean;
        select: boolean;
        back: boolean;
    };
    setTouchControlsEnabled(enabled: boolean): void;
    renderTouchControls(renderer: any): void;
    update(): void;
}
