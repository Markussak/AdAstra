export class InputManager {
    constructor() {
        this.keys = new Map();
        this.mouse = {
            x: 0,
            y: 0,
            pressed: false,
            justPressed: false,
            justReleased: false
        };
        this.touches = new Map();
        this.virtualJoystick = {
            active: false,
            centerX: 0,
            centerY: 0,
            x: 0,
            y: 0,
            radius: 50
        };
        this.isMobile = this.detectMobile();
        this.setupEventListeners();
    }
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
            'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
    setupEventListeners() {
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
    handleKeyDown(event) {
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
    handleKeyUp(event) {
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
    handleMouseMove(event) {
        this.mouse.x = event.clientX;
        this.mouse.y = event.clientY;
    }
    handleMouseDown(event) {
        this.mouse.justPressed = true;
        this.mouse.pressed = true;
    }
    handleMouseUp(event) {
        this.mouse.pressed = false;
        this.mouse.justReleased = true;
    }
    handleTouchStart(event) {
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
    handleTouchMove(event) {
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
    handleTouchEnd(event) {
        event.preventDefault();
        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];
            this.touches.delete(touch.identifier);
        }
    }
    isKeyPressed(key) {
        return this.keys.get(key.toLowerCase())?.pressed || false;
    }
    wasKeyJustPressed(key) {
        return this.keys.get(key.toLowerCase())?.justPressed || false;
    }
    wasKeyJustReleased(key) {
        return this.keys.get(key.toLowerCase())?.justReleased || false;
    }
    getMousePosition() {
        return { x: this.mouse.x, y: this.mouse.y };
    }
    isMousePressed() {
        return this.mouse.pressed;
    }
    getThrustInput() {
        if (this.isMobile && this.virtualJoystick.active) {
            return Math.max(0, -this.virtualJoystick.y);
        }
        return (this.isKeyPressed('w') || this.isKeyPressed('arrowup')) ? 1 : 0;
    }
    getBrakeInput() {
        if (this.isMobile && this.virtualJoystick.active) {
            return Math.max(0, this.virtualJoystick.y);
        }
        return (this.isKeyPressed('s') || this.isKeyPressed('arrowdown')) ? 1 : 0;
    }
    getRotationInput() {
        if (this.isMobile && this.virtualJoystick.active) {
            return this.virtualJoystick.x;
        }
        let rotation = 0;
        if (this.isKeyPressed('a') || this.isKeyPressed('arrowleft'))
            rotation -= 1;
        if (this.isKeyPressed('d') || this.isKeyPressed('arrowright'))
            rotation += 1;
        return rotation;
    }
    getFireInput() {
        if (this.isMobile) {
            return false;
        }
        return this.isKeyPressed(' ') || this.mouse.pressed;
    }
    update() {
        this.keys.forEach((keyState, key) => {
            keyState.justPressed = false;
            keyState.justReleased = false;
        });
        this.mouse.justPressed = false;
        this.mouse.justReleased = false;
    }
}
//# sourceMappingURL=input.js.map