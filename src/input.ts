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
  public touchControlsEnabled: boolean = true;
  public virtualJoystick: VirtualJoystick = {
    active: false,
    centerX: 0,
    centerY: 0,
    x: 0,
    y: 0,
    radius: 50
  };

  // Touch buttons for mobile
  public touchButtons = {
    fire: { x: 0, y: 0, radius: 40, pressed: false, justPressed: false },
    pause: { x: 0, y: 0, radius: 30, pressed: false, justPressed: false },
    warp: { x: 0, y: 0, radius: 35, pressed: false, justPressed: false }
  };

  private joystickTouchId: number | null = null;
  private canvas: HTMLCanvasElement | null = null;

  constructor() {
    this.isMobile = this.detectMobile();
    this.setupEventListeners();
    this.initializeTouchControls();
  }

  private detectMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  private initializeTouchControls(): void {
    if (this.isMobile) {
      // Get canvas reference for positioning
      this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
      
      if (this.canvas) {
        this.updateTouchButtonPositions();
        
        // Auto-enable touch controls on mobile
        this.touchControlsEnabled = true;
        
        // Set joystick position (left side of screen)
        this.virtualJoystick.centerX = 120;
        this.virtualJoystick.centerY = this.canvas.height - 120;
      }
    }
  }

  private updateTouchButtonPositions(): void {
    if (!this.canvas) return;
    
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    // Position touch buttons (right side of screen)
    this.touchButtons.fire.x = width - 80;
    this.touchButtons.fire.y = height - 120;
    
    this.touchButtons.warp.x = width - 80;
    this.touchButtons.warp.y = height - 200;
    
    this.touchButtons.pause.x = width - 50;
    this.touchButtons.pause.y = 50;
  }

  private setupEventListeners(): void {
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    document.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    document.addEventListener('mouseup', (e) => this.handleMouseUp(e));

    if (this.isMobile) {
      document.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
      document.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
      document.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
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
      const rect = this.canvas?.getBoundingClientRect();
      if (!rect) continue;
      
      const touchX = touch.clientX - rect.left;
      const touchY = touch.clientY - rect.top;
      
      this.touches.set(touch.identifier, {
        id: touch.identifier,
        x: touchX,
        y: touchY,
        startX: touchX,
        startY: touchY
      });

      // Check for joystick interaction
      if (this.touchControlsEnabled && this.isPointInCircle(touchX, touchY, this.virtualJoystick.centerX, this.virtualJoystick.centerY, this.virtualJoystick.radius * 2)) {
        this.virtualJoystick.active = true;
        this.joystickTouchId = touch.identifier;
        this.updateJoystick(touchX, touchY);
      }

      // Check for button presses
      this.checkTouchButtons(touchX, touchY, true);
    }
  }

  private handleTouchMove(event: TouchEvent): void {
    event.preventDefault();
    
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      const touchData = this.touches.get(touch.identifier);
      const rect = this.canvas?.getBoundingClientRect();
      if (!touchData || !rect) continue;
      
      const touchX = touch.clientX - rect.left;
      const touchY = touch.clientY - rect.top;
      
      touchData.x = touchX;
      touchData.y = touchY;

      // Update joystick if this is the joystick touch
      if (touch.identifier === this.joystickTouchId) {
        this.updateJoystick(touchX, touchY);
      }
    }
  }

  private handleTouchEnd(event: TouchEvent): void {
    event.preventDefault();
    
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      
      // Release joystick if this was the joystick touch
      if (touch.identifier === this.joystickTouchId) {
        this.virtualJoystick.active = false;
        this.virtualJoystick.x = 0;
        this.virtualJoystick.y = 0;
        this.joystickTouchId = null;
      }

      // Release touch buttons
      this.releaseTouchButtons();
      
      this.touches.delete(touch.identifier);
    }
  }

  private updateJoystick(touchX: number, touchY: number): void {
    const deltaX = touchX - this.virtualJoystick.centerX;
    const deltaY = touchY - this.virtualJoystick.centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance <= this.virtualJoystick.radius) {
      this.virtualJoystick.x = deltaX / this.virtualJoystick.radius;
      this.virtualJoystick.y = deltaY / this.virtualJoystick.radius;
    } else {
      const angle = Math.atan2(deltaY, deltaX);
      this.virtualJoystick.x = Math.cos(angle);
      this.virtualJoystick.y = Math.sin(angle);
    }
  }

  private checkTouchButtons(x: number, y: number, pressed: boolean): void {
    if (!this.touchControlsEnabled) return;

    // Fire button
    if (this.isPointInCircle(x, y, this.touchButtons.fire.x, this.touchButtons.fire.y, this.touchButtons.fire.radius)) {
      this.touchButtons.fire.pressed = pressed;
      if (pressed) this.touchButtons.fire.justPressed = true;
    }

    // Warp button
    if (this.isPointInCircle(x, y, this.touchButtons.warp.x, this.touchButtons.warp.y, this.touchButtons.warp.radius)) {
      this.touchButtons.warp.pressed = pressed;
      if (pressed) this.touchButtons.warp.justPressed = true;
    }

    // Pause button
    if (this.isPointInCircle(x, y, this.touchButtons.pause.x, this.touchButtons.pause.y, this.touchButtons.pause.radius)) {
      this.touchButtons.pause.pressed = pressed;
      if (pressed) this.touchButtons.pause.justPressed = true;
    }
  }

  private releaseTouchButtons(): void {
    this.touchButtons.fire.pressed = false;
    this.touchButtons.warp.pressed = false;
    this.touchButtons.pause.pressed = false;
  }

  private isPointInCircle(px: number, py: number, cx: number, cy: number, radius: number): boolean {
    const dx = px - cx;
    const dy = py - cy;
    return dx * dx + dy * dy <= radius * radius;
  }

  public isKeyPressed(key: string): boolean {
    return this.keys.get(key.toLowerCase())?.pressed || false;
  }

  public wasKeyJustPressed(key: string): boolean {
    // Check for touch button equivalents
    if (this.touchControlsEnabled) {
      switch (key.toLowerCase()) {
        case 'escape':
          return this.touchButtons.pause.justPressed || this.keys.get(key.toLowerCase())?.justPressed || false;
        case 'j':
          return this.touchButtons.warp.justPressed || this.keys.get(key.toLowerCase())?.justPressed || false;
      }
    }
    
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
    if (this.touchControlsEnabled && this.virtualJoystick.active) {
      return Math.max(0, -this.virtualJoystick.y);
    }
    return (this.isKeyPressed('w') || this.isKeyPressed('arrowup')) ? 1 : 0;
  }

  public getBrakeInput(): number {
    if (this.touchControlsEnabled && this.virtualJoystick.active) {
      return Math.max(0, this.virtualJoystick.y);
    }
    return (this.isKeyPressed('s') || this.isKeyPressed('arrowdown')) ? 1 : 0;
  }

  public getRotationInput(): number {
    if (this.touchControlsEnabled && this.virtualJoystick.active) {
      return this.virtualJoystick.x;
    }
    let rotation = 0;
    if (this.isKeyPressed('a') || this.isKeyPressed('arrowleft')) rotation -= 1;
    if (this.isKeyPressed('d') || this.isKeyPressed('arrowright')) rotation += 1;
    return rotation;
  }

  public getFireInput(): boolean {
    if (this.touchControlsEnabled && this.touchButtons.fire.pressed) {
      return true;
    }
    return this.isKeyPressed(' ') || this.mouse.pressed;
  }

  // Touch menu navigation
  public getTouchMenuInput(): { up: boolean, down: boolean, select: boolean, back: boolean } {
    if (!this.touchControlsEnabled) {
      return { up: false, down: false, select: false, back: false };
    }

    let up = false, down = false, select = false, back = false;

    // Check for swipe gestures and taps
    this.touches.forEach(touch => {
      const deltaY = touch.y - touch.startY;
      const deltaX = touch.x - touch.startX;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      // Swipe gestures (for menu navigation)
      if (distance > 40 && Math.abs(deltaX) < 60) {
        if (deltaY < -40) up = true;
        if (deltaY > 40) down = true;
      }
      
      // Tap detection (small movement, short duration)
      if (distance < 10) {
        select = true;
      }
    });

    // Special button for back
    back = this.touchButtons.pause.justPressed;

    return { up, down, select, back };
  }

  public setTouchControlsEnabled(enabled: boolean): void {
    this.touchControlsEnabled = enabled;
    if (!enabled) {
      this.virtualJoystick.active = false;
      this.releaseTouchButtons();
    }
  }

  public renderTouchControls(renderer: any): void {
    if (!this.touchControlsEnabled || !this.isMobile) return;

    // Update button positions based on current canvas size
    this.updateTouchButtonPositions();

    // Render virtual joystick
    if (this.virtualJoystick.active || this.touches.size === 0) {
      // Joystick base
      renderer.getContext().globalAlpha = 0.3;
      renderer.drawCircle(
        this.virtualJoystick.centerX, 
        this.virtualJoystick.centerY, 
        this.virtualJoystick.radius, 
        'rgba(255, 255, 255, 0.2)'
      );
      
      // Joystick knob
      const knobX = this.virtualJoystick.centerX + this.virtualJoystick.x * (this.virtualJoystick.radius * 0.7);
      const knobY = this.virtualJoystick.centerY + this.virtualJoystick.y * (this.virtualJoystick.radius * 0.7);
      
      renderer.drawCircle(knobX, knobY, 15, 'rgba(255, 255, 255, 0.6)');
      renderer.getContext().globalAlpha = 1.0;
    }

    // Render touch buttons
    renderer.getContext().globalAlpha = 0.4;
    
    // Fire button
    const fireColor = this.touchButtons.fire.pressed ? 'rgba(255, 100, 100, 0.8)' : 'rgba(255, 255, 255, 0.3)';
    renderer.drawCircle(this.touchButtons.fire.x, this.touchButtons.fire.y, this.touchButtons.fire.radius, fireColor);
    renderer.drawText('FIRE', this.touchButtons.fire.x, this.touchButtons.fire.y, '#ffffff', '12px "Big Apple 3PM", monospace');

    // Warp button
    const warpColor = this.touchButtons.warp.pressed ? 'rgba(100, 100, 255, 0.8)' : 'rgba(255, 255, 255, 0.3)';
    renderer.drawCircle(this.touchButtons.warp.x, this.touchButtons.warp.y, this.touchButtons.warp.radius, warpColor);
    renderer.drawText('WARP', this.touchButtons.warp.x, this.touchButtons.warp.y, '#ffffff', '10px "Big Apple 3PM", monospace');

    // Pause button
    const pauseColor = this.touchButtons.pause.pressed ? 'rgba(255, 255, 100, 0.8)' : 'rgba(255, 255, 255, 0.3)';
    renderer.drawCircle(this.touchButtons.pause.x, this.touchButtons.pause.y, this.touchButtons.pause.radius, pauseColor);
    renderer.drawText('⏸', this.touchButtons.pause.x, this.touchButtons.pause.y, '#ffffff', '16px "Big Apple 3PM", monospace');

    renderer.getContext().globalAlpha = 1.0;
  }

  public update(): void {
    this.keys.forEach((keyState, key) => {
      keyState.justPressed = false;
      keyState.justReleased = false;
    });

    this.mouse.justPressed = false;
    this.mouse.justReleased = false;

    // Reset touch button just pressed states
    Object.values(this.touchButtons).forEach(button => {
      button.justPressed = false;
    });
  }
}