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
    radius: 80  // Larger radius for better visibility and touch area
  };

  // Touch buttons for mobile - larger and more visible
  public touchButtons = {
    fire: { x: 0, y: 0, radius: 60, pressed: false, justPressed: false },
    pause: { x: 0, y: 0, radius: 45, pressed: false, justPressed: false },
    warp: { x: 0, y: 0, radius: 55, pressed: false, justPressed: false }
  };

  private joystickTouchId: number | null = null;
  private canvas: HTMLCanvasElement | null = null;
  
  // Mobile text input support
  private mobileTextInput: HTMLInputElement | null = null;
  private textInputCallback: ((text: string) => void) | null = null;
  private textInputActive: boolean = false;

  constructor() {
    this.isMobile = this.detectMobile();
    this.setupEventListeners();
    this.initializeTouchControls();
    this.setupMobileTextInput();
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
        this.virtualJoystick.centerX = 150;
        this.virtualJoystick.centerY = this.canvas.height - 160;
      }
    }
  }

  private updateTouchButtonPositions(): void {
    if (!this.canvas) return;
    
    // Use renderer dimensions instead of canvas dimensions for proper scaling
    const width = this.canvas.clientWidth || this.canvas.width;
    const height = this.canvas.clientHeight || this.canvas.height;
    
    // Position touch buttons (right side of screen) - adjusted for larger buttons
    this.touchButtons.fire.x = width - 120;
    this.touchButtons.fire.y = height - 160;
    
    this.touchButtons.warp.x = width - 120;
    this.touchButtons.warp.y = height - 280;
    
    this.touchButtons.pause.x = width - 70;
    this.touchButtons.pause.y = 70;
    
    // Update joystick position as well
    this.virtualJoystick.centerX = 150;
    this.virtualJoystick.centerY = height - 160;
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

  private setupMobileTextInput(): void {
    if (this.isMobile) {
      // Create hidden input element for mobile text input
      this.mobileTextInput = document.createElement('input');
      this.mobileTextInput.type = 'text';
      this.mobileTextInput.style.position = 'absolute';
      this.mobileTextInput.style.left = '-9999px';
      this.mobileTextInput.style.top = '-9999px';
      this.mobileTextInput.style.opacity = '0';
      this.mobileTextInput.style.pointerEvents = 'none';
      this.mobileTextInput.autocomplete = 'off';
      this.mobileTextInput.autocorrect = 'off' as any;
      this.mobileTextInput.autocapitalize = 'off';
      this.mobileTextInput.spellcheck = false;
      
      document.body.appendChild(this.mobileTextInput);
      
      // Handle input events
      this.mobileTextInput.addEventListener('input', (e) => {
        if (this.textInputCallback && this.textInputActive) {
          this.textInputCallback(this.mobileTextInput!.value);
        }
      });
      
      // Handle keyboard hide/show
      this.mobileTextInput.addEventListener('blur', () => {
        this.textInputActive = false;
      });
    }
  }

  public activateMobileTextInput(currentText: string, callback: (text: string) => void): void {
    if (this.mobileTextInput && this.isMobile) {
      this.mobileTextInput.value = currentText;
      this.textInputCallback = callback;
      this.textInputActive = true;
      
      // Show the input temporarily and focus it
      this.mobileTextInput.style.left = '50%';
      this.mobileTextInput.style.top = '50%';
      this.mobileTextInput.style.transform = 'translate(-50%, -50%)';
      this.mobileTextInput.style.zIndex = '9999';
      this.mobileTextInput.style.opacity = '0.1';
      this.mobileTextInput.style.pointerEvents = 'auto';
      
      this.mobileTextInput.focus();
      this.mobileTextInput.select();
      
      // Hide it again after a short delay, but keep it focused
      setTimeout(() => {
        if (this.mobileTextInput) {
          this.mobileTextInput.style.left = '-9999px';
          this.mobileTextInput.style.top = '-9999px';
          this.mobileTextInput.style.opacity = '0';
          this.mobileTextInput.style.pointerEvents = 'none';
        }
      }, 100);
    }
  }

  public deactivateMobileTextInput(): void {
    if (this.mobileTextInput && this.isMobile) {
      this.textInputActive = false;
      this.mobileTextInput.blur();
      this.textInputCallback = null;
    }
  }

  public isMobileTextInputActive(): boolean {
    return this.textInputActive;
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
    // Always show touch controls for testing purposes - remove the early return
    // if (!this.touchControlsEnabled) return;

    // Update button positions based on current canvas size using renderer dimensions
    const width = renderer.getWidth();
    const height = renderer.getHeight();
    
    // Update positions with renderer dimensions
    this.touchButtons.fire.x = width - 120;
    this.touchButtons.fire.y = height - 160;
    
    this.touchButtons.warp.x = width - 120;
    this.touchButtons.warp.y = height - 280;
    
    this.touchButtons.pause.x = width - 70;
    this.touchButtons.pause.y = 70;
    
    this.virtualJoystick.centerX = 150;
    this.virtualJoystick.centerY = height - 160;

    // 16-bit color palette for touch controls
    const colors = {
      chassisPrimary: '#5a6978',
      chassisMidtone: '#434c55', 
      chassisDark: '#2b323a',
      highlightSpecular: '#e0e3e6',
      highlightStandard: '#a2aab2',
      accentYellow: '#ffc357',
      accentOrange: '#e8732c',
      accentRed: '#d43d3d',
      accentGreen: '#52de44'
    };

    const ctx = renderer.getContext();

    // Always render virtual joystick when touch controls are enabled
    // Joystick housing (industrial look)
    ctx.fillStyle = colors.chassisDark;
    ctx.beginPath();
    ctx.arc(this.virtualJoystick.centerX, this.virtualJoystick.centerY, this.virtualJoystick.radius + 5, 0, Math.PI * 2);
    ctx.fill();

    // Joystick base with 16-bit dithered pattern
    ctx.fillStyle = colors.chassisMidtone;
    ctx.beginPath();
    ctx.arc(this.virtualJoystick.centerX, this.virtualJoystick.centerY, this.virtualJoystick.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Directional indicators (cross pattern)
    ctx.strokeStyle = colors.highlightStandard;
    ctx.lineWidth = 2;
    const centerX = this.virtualJoystick.centerX;
    const centerY = this.virtualJoystick.centerY;
    const radius = this.virtualJoystick.radius;
    
    // Cross lines
    ctx.beginPath();
    ctx.moveTo(centerX - radius * 0.8, centerY);
    ctx.lineTo(centerX + radius * 0.8, centerY);
    ctx.moveTo(centerX, centerY - radius * 0.8);
    ctx.lineTo(centerX, centerY + radius * 0.8);
    ctx.stroke();
    
    // Corner markers
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 + Math.PI / 4;
      const x = centerX + Math.cos(angle) * radius * 0.7;
      const y = centerY + Math.sin(angle) * radius * 0.7;
      ctx.fillStyle = colors.highlightStandard;
      ctx.fillRect(x - 2, y - 2, 4, 4);
    }
    
    // Joystick border with industrial styling
    ctx.strokeStyle = colors.highlightSpecular;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Joystick knob with heavy industrial look
    const knobX = centerX + this.virtualJoystick.x * (radius * 0.6);
    const knobY = centerY + this.virtualJoystick.y * (radius * 0.6);
    
    // Knob shadow
    ctx.fillStyle = colors.chassisDark;
    ctx.beginPath();
    ctx.arc(knobX + 2, knobY + 2, 20, 0, Math.PI * 2);
    ctx.fill();
    
    // Knob base
    ctx.fillStyle = colors.chassisPrimary;
    ctx.beginPath();
    ctx.arc(knobX, knobY, 20, 0, Math.PI * 2);
    ctx.fill();
    
    // Knob highlight
    ctx.fillStyle = colors.highlightSpecular;
    ctx.beginPath();
    ctx.arc(knobX - 3, knobY - 3, 12, 0, Math.PI * 2);
    ctx.fill();
    
    // Knob grip pattern
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const gx = knobX + Math.cos(angle) * 8;
      const gy = knobY + Math.sin(angle) * 8;
      ctx.fillStyle = colors.chassisDark;
      ctx.fillRect(gx - 1, gy - 1, 2, 2);
    }

    // Render touch buttons with 16-bit industrial styling
    this.draw16BitButton(renderer, this.touchButtons.fire, 'FIRE', colors.accentRed, colors);
    this.draw16BitButton(renderer, this.touchButtons.warp, 'WARP', colors.accentYellow, colors);
    this.draw16BitButton(renderer, this.touchButtons.pause, 'MENU', colors.accentOrange, colors);
  }

  private draw16BitButton(renderer: any, button: any, label: string, accentColor: string, colors: any): void {
    const ctx = renderer.getContext();
    
    // Button housing (recessed when pressed)
    const offset = button.pressed ? 2 : 0;
    
    // Outer ring
    ctx.fillStyle = colors.chassisDark;
    ctx.beginPath();
    ctx.arc(button.x + offset, button.y + offset, button.radius + 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Main button
    ctx.fillStyle = button.pressed ? colors.chassisMidtone : colors.chassisPrimary;
    ctx.beginPath();
    ctx.arc(button.x + offset, button.y + offset, button.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Button highlight ring
    ctx.strokeStyle = button.pressed ? colors.chassisMidtone : colors.highlightStandard;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(button.x + offset, button.y + offset, button.radius - 5, 0, Math.PI * 2);
    ctx.stroke();
    
    // Button center with accent color
    ctx.fillStyle = button.pressed ? accentColor : colors.highlightSpecular;
    ctx.beginPath();
    ctx.arc(button.x + offset, button.y + offset, button.radius - 15, 0, Math.PI * 2);
    ctx.fill();
    
    // Industrial corner screws
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const sx = button.x + offset + Math.cos(angle) * (button.radius - 8);
      const sy = button.y + offset + Math.sin(angle) * (button.radius - 8);
      
      ctx.fillStyle = colors.chassisDark;
      ctx.beginPath();
      ctx.arc(sx, sy, 3, 0, Math.PI * 2);
      ctx.fill();
      
      // Screw slot
      ctx.strokeStyle = colors.highlightStandard;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sx - 2, sy);
      ctx.lineTo(sx + 2, sy);
      ctx.stroke();
    }
    
    // Button label with 16-bit font
    ctx.fillStyle = button.pressed ? colors.chassisDark : colors.highlightSpecular;
    ctx.font = 'bold 14px "Big Apple 3PM", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(label, button.x + offset, button.y + offset + 4);
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