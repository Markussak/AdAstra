// input.ts - Input management system

import {
  IInputManager,
  KeyState,
  MouseState,
  TouchData,
  VirtualJoystick,
  Vector2D
} from './types';

export class InputManager implements IInputManager {
  public keys: Map<string, KeyState> = new Map();
  public mouse: MouseState = {
    x: 0,
    y: 0,
    pressed: false,
    justPressed: false,
    justReleased: false
  };
  public touches: Map<number, TouchData> = new Map();
  public isMobile: boolean;
  public virtualJoystick: VirtualJoystick = {
    active: false,
    centerX: 0,
    centerY: 0,
    x: 0,
    y: 0,
    radius: 50
  };

  constructor() {
    this.isMobile = this.detectMobile();
    this.setupEventListeners();
  }

  private detectMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  private setupEventListeners(): void {
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    document.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    document.addEventListener('mouseup', (e) => this.handleMouseUp(e));

    if (this.isMobile) {
      document.addEventListener('touchstart', (e) => this.handleTouchStart(e));
      document.addEventListener('touchmove', (e) => this.handleTouchMove(e));
      document.addEventListener('touchend', (e) => this.handleTouchEnd(e));
    }
  }

  private handleKeyDown(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();
    const keyState = this.keys.get(key) || {
      pressed: false,
      justPressed: false,
      justReleased: false
    };

    if (!keyState.pressed) {
      keyState.justPressed = true;
    }
    keyState.pressed = true;
    this.keys.set(key, keyState);

    event.preventDefault();
  }

  private handleKeyUp(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();
    const keyState = this.keys.get(key) || {
      pressed: false,
      justPressed: false,
      justReleased: false
    };

    keyState.pressed = false;
    keyState.justReleased = true;
    this.keys.set(key, keyState);
  }

  private handleMouseMove(event: MouseEvent): void {
    this.mouse.x = event.clientX;
    this.mouse.y = event.clientY;
  }

  private handleMouseDown(event: MouseEvent): void {
    this.mouse.justPressed = true;
    this.mouse.pressed = true;
  }

  private handleMouseUp(event: MouseEvent): void {
    this.mouse.pressed = false;
    this.mouse.justReleased = true;
  }

  private handleTouchStart(event: TouchEvent): void {
    event.preventDefault();
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      this.touches.set(touch.identifier, {
        id: touch.identifier,
        x: touch.clientX,
        y: touch.clientY,
        startX: touch.clientX,
        startY: touch.clientY
      });
    }
  }

  private handleTouchMove(event: TouchEvent): void {
    event.preventDefault();
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      const touchData = this.touches.get(touch.identifier);
      if (touchData) {
        touchData.x = touch.clientX;
        touchData.y = touch.clientY;
      }
    }
  }

  private handleTouchEnd(event: TouchEvent): void {
    event.preventDefault();
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      this.touches.delete(touch.identifier);
    }
  }

  public isKeyPressed(key: string): boolean {
    return this.keys.get(key.toLowerCase())?.pressed || false;
  }

  public wasKeyJustPressed(key: string): boolean {
    return this.keys.get(key.toLowerCase())?.justPressed || false;
  }

  public wasKeyJustReleased(key: string): boolean {
    return this.keys.get(key.toLowerCase())?.justReleased || false;
  }

  public getMousePosition(): Vector2D {
    return { x: this.mouse.x, y: this.mouse.y };
  }

  public isMousePressed(): boolean {
    return this.mouse.pressed;
  }

  public getThrustInput(): number {
    if (this.isMobile && this.virtualJoystick.active) {
      return Math.max(0, -this.virtualJoystick.y);
    }
    return (this.isKeyPressed('w') || this.isKeyPressed('arrowup')) ? 1 : 0;
  }

  public getBrakeInput(): number {
    if (this.isMobile && this.virtualJoystick.active) {
      return Math.max(0, this.virtualJoystick.y);
    }
    return (this.isKeyPressed('s') || this.isKeyPressed('arrowdown')) ? 1 : 0;
  }

  public getRotationInput(): number {
    if (this.isMobile && this.virtualJoystick.active) {
      return this.virtualJoystick.x;
    }
    let rotation = 0;
    if (this.isKeyPressed('a') || this.isKeyPressed('arrowleft')) rotation -= 1;
    if (this.isKeyPressed('d') || this.isKeyPressed('arrowright')) rotation += 1;
    return rotation;
  }

  public getFireInput(): boolean {
    if (this.isMobile) {
      return false; // TODO: Implement touch fire button
    }
    return this.isKeyPressed(' ') || this.mouse.pressed;
  }

  public update(): void {
    this.keys.forEach((keyState, key) => {
      keyState.justPressed = false;
      keyState.justReleased = false;
    });

    this.mouse.justPressed = false;
    this.mouse.justReleased = false;
  }
}