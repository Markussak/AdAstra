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
        this.touchControlsEnabled = true;
        this.virtualJoystick = {
            active: false,
            centerX: 0,
            centerY: 0,
            x: 0,
            y: 0,
            radius: 50
        };
        this.touchButtons = {
            fire: { x: 0, y: 0, radius: 40, pressed: false, justPressed: false },
            pause: { x: 0, y: 0, radius: 30, pressed: false, justPressed: false },
            warp: { x: 0, y: 0, radius: 35, pressed: false, justPressed: false }
        };
        this.joystickTouchId = null;
        this.canvas = null;
        this.mobileTextInput = null;
        this.textInputCallback = null;
        this.textInputActive = false;
        this.isMobile = this.detectMobile();
        this.setupEventListeners();
        this.initializeTouchControls();
        this.setupMobileTextInput();
    }
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
            'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
    initializeTouchControls() {
        if (this.isMobile) {
            this.canvas = document.getElementById('gameCanvas');
            if (this.canvas) {
                this.updateTouchButtonPositions();
                this.touchControlsEnabled = true;
                this.virtualJoystick.centerX = 120;
                this.virtualJoystick.centerY = this.canvas.height - 120;
            }
        }
    }
    updateTouchButtonPositions() {
        if (!this.canvas)
            return;
        const width = this.canvas.width;
        const height = this.canvas.height;
        this.touchButtons.fire.x = width - 80;
        this.touchButtons.fire.y = height - 120;
        this.touchButtons.warp.x = width - 80;
        this.touchButtons.warp.y = height - 200;
        this.touchButtons.pause.x = width - 50;
        this.touchButtons.pause.y = 50;
    }
    setupEventListeners() {
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
    setupMobileTextInput() {
        if (this.isMobile) {
            this.mobileTextInput = document.createElement('input');
            this.mobileTextInput.type = 'text';
            this.mobileTextInput.style.position = 'absolute';
            this.mobileTextInput.style.left = '-9999px';
            this.mobileTextInput.style.top = '-9999px';
            this.mobileTextInput.style.opacity = '0';
            this.mobileTextInput.style.pointerEvents = 'none';
            this.mobileTextInput.autocomplete = 'off';
            this.mobileTextInput.autocorrect = 'off';
            this.mobileTextInput.autocapitalize = 'off';
            this.mobileTextInput.spellcheck = false;
            document.body.appendChild(this.mobileTextInput);
            this.mobileTextInput.addEventListener('input', (e) => {
                if (this.textInputCallback && this.textInputActive) {
                    this.textInputCallback(this.mobileTextInput.value);
                }
            });
            this.mobileTextInput.addEventListener('blur', () => {
                this.textInputActive = false;
            });
        }
    }
    activateMobileTextInput(currentText, callback) {
        if (this.mobileTextInput && this.isMobile) {
            this.mobileTextInput.value = currentText;
            this.textInputCallback = callback;
            this.textInputActive = true;
            this.mobileTextInput.style.left = '50%';
            this.mobileTextInput.style.top = '50%';
            this.mobileTextInput.style.transform = 'translate(-50%, -50%)';
            this.mobileTextInput.style.zIndex = '9999';
            this.mobileTextInput.style.opacity = '0.1';
            this.mobileTextInput.style.pointerEvents = 'auto';
            this.mobileTextInput.focus();
            this.mobileTextInput.select();
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
    deactivateMobileTextInput() {
        if (this.mobileTextInput && this.isMobile) {
            this.textInputActive = false;
            this.mobileTextInput.blur();
            this.textInputCallback = null;
        }
    }
    isMobileTextInputActive() {
        return this.textInputActive;
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
            const rect = this.canvas?.getBoundingClientRect();
            if (!rect)
                continue;
            const touchX = touch.clientX - rect.left;
            const touchY = touch.clientY - rect.top;
            this.touches.set(touch.identifier, {
                id: touch.identifier,
                x: touchX,
                y: touchY,
                startX: touchX,
                startY: touchY
            });
            if (this.touchControlsEnabled && this.isPointInCircle(touchX, touchY, this.virtualJoystick.centerX, this.virtualJoystick.centerY, this.virtualJoystick.radius * 2)) {
                this.virtualJoystick.active = true;
                this.joystickTouchId = touch.identifier;
                this.updateJoystick(touchX, touchY);
            }
            this.checkTouchButtons(touchX, touchY, true);
        }
    }
    handleTouchMove(event) {
        event.preventDefault();
        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];
            const touchData = this.touches.get(touch.identifier);
            const rect = this.canvas?.getBoundingClientRect();
            if (!touchData || !rect)
                continue;
            const touchX = touch.clientX - rect.left;
            const touchY = touch.clientY - rect.top;
            touchData.x = touchX;
            touchData.y = touchY;
            if (touch.identifier === this.joystickTouchId) {
                this.updateJoystick(touchX, touchY);
            }
        }
    }
    handleTouchEnd(event) {
        event.preventDefault();
        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];
            if (touch.identifier === this.joystickTouchId) {
                this.virtualJoystick.active = false;
                this.virtualJoystick.x = 0;
                this.virtualJoystick.y = 0;
                this.joystickTouchId = null;
            }
            this.releaseTouchButtons();
            this.touches.delete(touch.identifier);
        }
    }
    updateJoystick(touchX, touchY) {
        const deltaX = touchX - this.virtualJoystick.centerX;
        const deltaY = touchY - this.virtualJoystick.centerY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        if (distance <= this.virtualJoystick.radius) {
            this.virtualJoystick.x = deltaX / this.virtualJoystick.radius;
            this.virtualJoystick.y = deltaY / this.virtualJoystick.radius;
        }
        else {
            const angle = Math.atan2(deltaY, deltaX);
            this.virtualJoystick.x = Math.cos(angle);
            this.virtualJoystick.y = Math.sin(angle);
        }
    }
    checkTouchButtons(x, y, pressed) {
        if (!this.touchControlsEnabled)
            return;
        if (this.isPointInCircle(x, y, this.touchButtons.fire.x, this.touchButtons.fire.y, this.touchButtons.fire.radius)) {
            this.touchButtons.fire.pressed = pressed;
            if (pressed)
                this.touchButtons.fire.justPressed = true;
        }
        if (this.isPointInCircle(x, y, this.touchButtons.warp.x, this.touchButtons.warp.y, this.touchButtons.warp.radius)) {
            this.touchButtons.warp.pressed = pressed;
            if (pressed)
                this.touchButtons.warp.justPressed = true;
        }
        if (this.isPointInCircle(x, y, this.touchButtons.pause.x, this.touchButtons.pause.y, this.touchButtons.pause.radius)) {
            this.touchButtons.pause.pressed = pressed;
            if (pressed)
                this.touchButtons.pause.justPressed = true;
        }
    }
    releaseTouchButtons() {
        this.touchButtons.fire.pressed = false;
        this.touchButtons.warp.pressed = false;
        this.touchButtons.pause.pressed = false;
    }
    isPointInCircle(px, py, cx, cy, radius) {
        const dx = px - cx;
        const dy = py - cy;
        return dx * dx + dy * dy <= radius * radius;
    }
    isKeyPressed(key) {
        return this.keys.get(key.toLowerCase())?.pressed || false;
    }
    wasKeyJustPressed(key) {
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
        if (this.touchControlsEnabled && this.virtualJoystick.active) {
            return Math.max(0, -this.virtualJoystick.y);
        }
        return (this.isKeyPressed('w') || this.isKeyPressed('arrowup')) ? 1 : 0;
    }
    getBrakeInput() {
        if (this.touchControlsEnabled && this.virtualJoystick.active) {
            return Math.max(0, this.virtualJoystick.y);
        }
        return (this.isKeyPressed('s') || this.isKeyPressed('arrowdown')) ? 1 : 0;
    }
    getRotationInput() {
        if (this.touchControlsEnabled && this.virtualJoystick.active) {
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
        if (this.touchControlsEnabled && this.touchButtons.fire.pressed) {
            return true;
        }
        return this.isKeyPressed(' ') || this.mouse.pressed;
    }
    getTouchMenuInput() {
        if (!this.touchControlsEnabled) {
            return { up: false, down: false, select: false, back: false };
        }
        let up = false, down = false, select = false, back = false;
        this.touches.forEach(touch => {
            const deltaY = touch.y - touch.startY;
            const deltaX = touch.x - touch.startX;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            if (distance > 40 && Math.abs(deltaX) < 60) {
                if (deltaY < -40)
                    up = true;
                if (deltaY > 40)
                    down = true;
            }
            if (distance < 10) {
                select = true;
            }
        });
        back = this.touchButtons.pause.justPressed;
        return { up, down, select, back };
    }
    setTouchControlsEnabled(enabled) {
        this.touchControlsEnabled = enabled;
        if (!enabled) {
            this.virtualJoystick.active = false;
            this.releaseTouchButtons();
        }
    }
    renderTouchControls(renderer) {
        if (!this.touchControlsEnabled)
            return;
        this.updateTouchButtonPositions();
        renderer.getContext().globalAlpha = 0.5;
        renderer.drawCircle(this.virtualJoystick.centerX, this.virtualJoystick.centerY, this.virtualJoystick.radius, 'rgba(0, 200, 255, 0.3)');
        renderer.strokeCircle(this.virtualJoystick.centerX, this.virtualJoystick.centerY, this.virtualJoystick.radius, 'rgba(0, 200, 255, 0.6)', 2);
        const knobX = this.virtualJoystick.centerX + this.virtualJoystick.x * (this.virtualJoystick.radius * 0.7);
        const knobY = this.virtualJoystick.centerY + this.virtualJoystick.y * (this.virtualJoystick.radius * 0.7);
        renderer.drawCircle(knobX, knobY, 15, 'rgba(255, 255, 255, 0.8)');
        renderer.strokeCircle(knobX, knobY, 15, 'rgba(0, 200, 255, 0.8)', 2);
        renderer.getContext().globalAlpha = 1.0;
        renderer.getContext().globalAlpha = 0.6;
        const fireColor = this.touchButtons.fire.pressed ? 'rgba(255, 100, 100, 0.9)' : 'rgba(255, 80, 80, 0.6)';
        renderer.drawCircle(this.touchButtons.fire.x, this.touchButtons.fire.y, this.touchButtons.fire.radius, fireColor);
        renderer.strokeCircle(this.touchButtons.fire.x, this.touchButtons.fire.y, this.touchButtons.fire.radius, 'rgba(255, 255, 255, 0.8)', 2);
        renderer.drawText('FIRE', this.touchButtons.fire.x, this.touchButtons.fire.y, '#ffffff', 'bold 12px "Big Apple 3PM", monospace');
        const warpColor = this.touchButtons.warp.pressed ? 'rgba(100, 100, 255, 0.9)' : 'rgba(100, 150, 255, 0.6)';
        renderer.drawCircle(this.touchButtons.warp.x, this.touchButtons.warp.y, this.touchButtons.warp.radius, warpColor);
        renderer.strokeCircle(this.touchButtons.warp.x, this.touchButtons.warp.y, this.touchButtons.warp.radius, 'rgba(255, 255, 255, 0.8)', 2);
        renderer.drawText('WARP', this.touchButtons.warp.x, this.touchButtons.warp.y, '#ffffff', 'bold 10px "Big Apple 3PM", monospace');
        const pauseColor = this.touchButtons.pause.pressed ? 'rgba(255, 255, 100, 0.9)' : 'rgba(255, 200, 100, 0.6)';
        renderer.drawCircle(this.touchButtons.pause.x, this.touchButtons.pause.y, this.touchButtons.pause.radius, pauseColor);
        renderer.strokeCircle(this.touchButtons.pause.x, this.touchButtons.pause.y, this.touchButtons.pause.radius, 'rgba(255, 255, 255, 0.8)', 2);
        renderer.drawText('⏸', this.touchButtons.pause.x, this.touchButtons.pause.y, '#ffffff', 'bold 16px "Big Apple 3PM", monospace');
        renderer.getContext().globalAlpha = 1.0;
    }
    update() {
        this.keys.forEach((keyState, key) => {
            keyState.justPressed = false;
            keyState.justReleased = false;
        });
        this.mouse.justPressed = false;
        this.mouse.justReleased = false;
        Object.values(this.touchButtons).forEach(button => {
            button.justPressed = false;
        });
    }
}
//# sourceMappingURL=input.js.map