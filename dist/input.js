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
            radius: 80
        };
        this.touchButtons = {
            fire: { x: 0, y: 0, radius: 60, pressed: false, justPressed: false },
            pause: { x: 0, y: 0, radius: 45, pressed: false, justPressed: false },
            warp: { x: 0, y: 0, radius: 55, pressed: false, justPressed: false }
        };
        this.joystickTouchId = null;
        this.canvas = null;
        this.mobileTextInput = null;
        this.textInputCallback = null;
        this.textInputActive = false;
        this.isMobile = this.detectMobile();
        this.setupEventListeners();
        this.setupMobileTextInput();
    }
    setCanvas(canvas) {
        this.canvas = canvas;
        this.initializeTouchControls();
        this.setupCanvasEventListeners();
    }
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
            'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
    initializeTouchControls() {
        if (this.isMobile && this.canvas) {
            this.updateTouchButtonPositions();
            this.touchControlsEnabled = true;
            this.virtualJoystick.centerX = 150;
            this.virtualJoystick.centerY = this.canvas.height - 160;
        }
    }
    updateTouchButtonPositions() {
        if (!this.canvas)
            return;
        const width = this.canvas.clientWidth || this.canvas.width;
        const height = this.canvas.clientHeight || this.canvas.height;
        this.touchButtons.fire.x = width - 120;
        this.touchButtons.fire.y = height - 160;
        this.touchButtons.warp.x = width - 120;
        this.touchButtons.warp.y = height - 280;
        this.touchButtons.pause.x = width - 70;
        this.touchButtons.pause.y = 70;
        this.virtualJoystick.centerX = 150;
        this.virtualJoystick.centerY = height - 160;
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
    setupCanvasEventListeners() {
        if (!this.canvas)
            return;
        this.canvas.addEventListener('mousedown', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
            this.mouse.justPressed = true;
            this.mouse.pressed = true;
        });
        this.canvas.addEventListener('mouseup', (e) => {
            e.preventDefault();
            this.mouse.pressed = false;
            this.mouse.justReleased = true;
        });
        if (this.isMobile) {
            this.canvas.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.handleTouchStart(e);
            }, { passive: false });
            this.canvas.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.handleTouchEnd(e);
            }, { passive: false });
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
        if (this.canvas) {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = event.clientX - rect.left;
            this.mouse.y = event.clientY - rect.top;
        }
        else {
            this.mouse.x = event.clientX;
            this.mouse.y = event.clientY;
        }
    }
    handleMouseDown(event) {
        if (this.canvas) {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = event.clientX - rect.left;
            this.mouse.y = event.clientY - rect.top;
        }
        else {
            this.mouse.x = event.clientX;
            this.mouse.y = event.clientY;
        }
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
            if (!rect) {
                continue;
            }
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
            const touchData = this.touches.get(touch.identifier);
            if (touchData) {
                const deltaX = touchData.x - touchData.startX;
                const deltaY = touchData.y - touchData.startY;
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                if (distance < 30) {
                }
            }
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
            const magnitude = Math.sqrt(this.virtualJoystick.x * this.virtualJoystick.x + this.virtualJoystick.y * this.virtualJoystick.y);
            return Math.min(1, magnitude);
        }
        return (this.isKeyPressed('w') || this.isKeyPressed('arrowup')) ? 1 : 0;
    }
    getBrakeInput() {
        if (this.touchControlsEnabled && this.virtualJoystick.active) {
            return 0;
        }
        return (this.isKeyPressed('s') || this.isKeyPressed('arrowdown')) ? 1 : 0;
    }
    getRotationInput() {
        if (this.touchControlsEnabled && this.virtualJoystick.active) {
            return this.virtualJoystick.x * 2;
        }
        let rotation = 0;
        if (this.isKeyPressed('a') || this.isKeyPressed('arrowleft'))
            rotation -= 1;
        if (this.isKeyPressed('d') || this.isKeyPressed('arrowright'))
            rotation += 1;
        return rotation;
    }
    getJoystickDirection() {
        if (this.touchControlsEnabled && this.virtualJoystick.active) {
            return { x: this.virtualJoystick.x, y: this.virtualJoystick.y };
        }
        return { x: 0, y: 0 };
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
            if (distance > 30 && Math.abs(deltaX) < 80) {
                if (deltaY < -30)
                    up = true;
                if (deltaY > 30)
                    down = true;
            }
            if (distance < 30) {
                select = true;
            }
        });
        if (this.mouse.justPressed) {
            select = true;
        }
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
        const width = renderer.getWidth();
        const height = renderer.getHeight();
        this.touchButtons.fire.x = width - 120;
        this.touchButtons.fire.y = height - 160;
        this.touchButtons.warp.x = width - 120;
        this.touchButtons.warp.y = height - 280;
        this.touchButtons.pause.x = width - 70;
        this.touchButtons.pause.y = 70;
        this.virtualJoystick.centerX = 150;
        this.virtualJoystick.centerY = height - 160;
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
        ctx.fillStyle = colors.chassisDark;
        ctx.beginPath();
        ctx.arc(this.virtualJoystick.centerX, this.virtualJoystick.centerY, this.virtualJoystick.radius + 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = colors.chassisMidtone;
        ctx.beginPath();
        ctx.arc(this.virtualJoystick.centerX, this.virtualJoystick.centerY, this.virtualJoystick.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = colors.highlightStandard;
        ctx.lineWidth = 2;
        const centerX = this.virtualJoystick.centerX;
        const centerY = this.virtualJoystick.centerY;
        const radius = this.virtualJoystick.radius;
        ctx.beginPath();
        ctx.moveTo(centerX - radius * 0.8, centerY);
        ctx.lineTo(centerX + radius * 0.8, centerY);
        ctx.moveTo(centerX, centerY - radius * 0.8);
        ctx.lineTo(centerX, centerY + radius * 0.8);
        ctx.stroke();
        for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI) / 2 + Math.PI / 4;
            const x = centerX + Math.cos(angle) * radius * 0.7;
            const y = centerY + Math.sin(angle) * radius * 0.7;
            ctx.fillStyle = colors.highlightStandard;
            ctx.fillRect(x - 2, y - 2, 4, 4);
        }
        ctx.strokeStyle = colors.highlightSpecular;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
        const knobX = centerX + this.virtualJoystick.x * (radius * 0.6);
        const knobY = centerY + this.virtualJoystick.y * (radius * 0.6);
        ctx.fillStyle = colors.chassisDark;
        ctx.beginPath();
        ctx.arc(knobX + 2, knobY + 2, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = colors.chassisPrimary;
        ctx.beginPath();
        ctx.arc(knobX, knobY, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = colors.highlightSpecular;
        ctx.beginPath();
        ctx.arc(knobX - 3, knobY - 3, 12, 0, Math.PI * 2);
        ctx.fill();
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4;
            const gx = knobX + Math.cos(angle) * 8;
            const gy = knobY + Math.sin(angle) * 8;
            ctx.fillStyle = colors.chassisDark;
            ctx.fillRect(gx - 1, gy - 1, 2, 2);
        }
        this.draw16BitButton(renderer, this.touchButtons.fire, 'FIRE', colors.accentRed, colors);
        this.draw16BitButton(renderer, this.touchButtons.warp, 'WARP', colors.accentYellow, colors);
        this.draw16BitButton(renderer, this.touchButtons.pause, 'MENU', colors.accentOrange, colors);
    }
    draw16BitButton(renderer, button, label, accentColor, colors) {
        const ctx = renderer.getContext();
        const offset = button.pressed ? 2 : 0;
        ctx.fillStyle = colors.chassisDark;
        ctx.beginPath();
        ctx.arc(button.x + offset, button.y + offset, button.radius + 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = button.pressed ? colors.chassisMidtone : colors.chassisPrimary;
        ctx.beginPath();
        ctx.arc(button.x + offset, button.y + offset, button.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = button.pressed ? colors.chassisMidtone : colors.highlightStandard;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(button.x + offset, button.y + offset, button.radius - 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = button.pressed ? accentColor : colors.highlightSpecular;
        ctx.beginPath();
        ctx.arc(button.x + offset, button.y + offset, button.radius - 15, 0, Math.PI * 2);
        ctx.fill();
        for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI) / 2;
            const sx = button.x + offset + Math.cos(angle) * (button.radius - 8);
            const sy = button.y + offset + Math.sin(angle) * (button.radius - 8);
            ctx.fillStyle = colors.chassisDark;
            ctx.beginPath();
            ctx.arc(sx, sy, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = colors.highlightStandard;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(sx - 2, sy);
            ctx.lineTo(sx + 2, sy);
            ctx.stroke();
        }
        ctx.fillStyle = button.pressed ? colors.chassisDark : colors.highlightSpecular;
        ctx.font = 'bold 14px "Big Apple 3PM", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(label, button.x + offset, button.y + offset + 4);
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