export class Renderer {
    constructor(canvas) {
        this.width = 0;
        this.height = 0;
        this.imageCache = new Map();
        this.canvas = canvas;
        const context = canvas.getContext('2d');
        if (!context) {
            throw new Error('Unable to get 2D context from canvas');
        }
        this.ctx = context;
        this.pixelRatio = window.devicePixelRatio || 1;
        this.ctx.imageSmoothingEnabled = false;
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }
    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width * this.pixelRatio;
        this.canvas.height = this.height * this.pixelRatio;
        this.canvas.style.width = this.width + 'px';
        this.canvas.style.height = this.height + 'px';
        this.ctx.scale(this.pixelRatio, this.pixelRatio);
    }
    clear(color = '#1a1a2a') {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    getContext() {
        return this.ctx;
    }
    getWidth() {
        return this.width;
    }
    getHeight() {
        return this.height;
    }
    drawRect(x, y, width, height, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
    }
    strokeRect(x, y, width, height, color, lineWidth = 1) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.strokeRect(x, y, width, height);
    }
    drawCircle(x, y, radius, color, filled = true) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        if (filled) {
            this.ctx.fillStyle = color;
            this.ctx.fill();
        }
        else {
            this.ctx.strokeStyle = color;
            this.ctx.stroke();
        }
    }
    fillCircle(x, y, radius, color) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
    }
    strokeCircle(x, y, radius, color, lineWidth = 1) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.stroke();
    }
    strokePath(points, color, lineWidth = 1) {
        if (points.length < 2)
            return;
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i].x, points[i].y);
        }
        this.ctx.stroke();
    }
    drawLine(x1, y1, x2, y2, color, width = 1) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = width;
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
    }
    drawText(text, x, y, color = '#ffffff', font = '12px "Big Apple 3PM", monospace') {
        this.ctx.fillStyle = color;
        this.ctx.font = font;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(text, x, y);
    }
    drawImage(imagePath, x, y, width, height) {
        let image = this.imageCache.get(imagePath);
        if (!image) {
            image = new Image();
            image.src = imagePath;
            this.imageCache.set(imagePath, image);
            if (!image.complete) {
                image.onload = () => {
                };
                return;
            }
        }
        if (image.complete) {
            if (width !== undefined && height !== undefined) {
                this.ctx.drawImage(image, x, y, width, height);
            }
            else {
                this.ctx.drawImage(image, x, y);
            }
        }
    }
    drawStarField(camera, layers = 3) {
        for (let layer = 0; layer < layers; layer++) {
            const parallaxFactor = 0.1 + layer * 0.05;
            const starCount = 50 + layer * 25;
            const alpha = 0.3 + layer * 0.2;
            this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            for (let i = 0; i < starCount; i++) {
                const starX = (i * 123.456) % 2000 - 1000;
                const starY = (i * 789.123) % 1500 - 750;
                const screenX = starX - camera.x * parallaxFactor;
                const screenY = starY - camera.y * parallaxFactor;
                const wrappedX = ((screenX % this.width) + this.width) % this.width;
                const wrappedY = ((screenY % this.height) + this.height) % this.height;
                const time = Date.now() * 0.001;
                const twinkle = Math.sin((time + i * 0.1) * 2) * 0.3 + 0.7;
                this.ctx.globalAlpha = twinkle * alpha;
                this.ctx.fillRect(wrappedX, wrappedY, 1, 1);
            }
        }
        this.ctx.globalAlpha = 1.0;
    }
    save() {
        this.ctx.save();
    }
    restore() {
        this.ctx.restore();
    }
    translate(x, y) {
        this.ctx.translate(x, y);
    }
    rotate(angle) {
        this.ctx.rotate(angle);
    }
    scale(x, y) {
        this.ctx.scale(x, y);
    }
    drawRacePortrait(race, x, y, size, baseColor) {
        const centerX = x + size / 2;
        const centerY = y + size / 2;
        this.ctx.save();
        this.drawRect(x, y, size, size, 'rgba(0, 0, 0, 0.3)');
        this.drawRect(x, y, size, size, '#505050');
        switch (race.toLowerCase()) {
            case 'human':
            case 'lidé':
                this.drawHumanPortrait(centerX, centerY, size, baseColor);
                break;
            case 'terran':
            case 'terraňané':
                this.drawTerranPortrait(centerX, centerY, size, baseColor);
                break;
            case 'zephyrian':
            case 'zefyriáni':
                this.drawZephyrianPortrait(centerX, centerY, size, baseColor);
                break;
            case 'crystalline':
            case 'krystalové':
                this.drawCrystallinePortrait(centerX, centerY, size, baseColor);
                break;
            case 'vorthan':
            case 'vorthané':
                this.drawVorthanPortrait(centerX, centerY, size, baseColor);
                break;
            case 'aquarian':
            case 'akvariáni':
                this.drawAquarianPortrait(centerX, centerY, size, baseColor);
                break;
            case 'mechano':
            case 'mechanoidové':
                this.drawMechanoPortrait(centerX, centerY, size, baseColor);
                break;
            case 'ethereal':
            case 'éteriálové':
                this.drawEtherealPortrait(centerX, centerY, size, baseColor);
                break;
            case 'drakonid':
            case 'drakonidi':
                this.drawDrakonidPortrait(centerX, centerY, size, baseColor);
                break;
            case 'sylvan':
            case 'sylváni':
                this.drawSylvanPortrait(centerX, centerY, size, baseColor);
                break;
            default:
                this.drawDefaultPortrait(centerX, centerY, size, baseColor);
                break;
        }
        this.ctx.restore();
    }
    drawHumanPortrait(x, y, size, color) {
        const s = size * 0.3;
        this.fillCircle(x, y - s * 0.3, s * 0.8, color);
        this.fillCircle(x - s * 0.3, y - s * 0.5, s * 0.15, '#000000');
        this.fillCircle(x + s * 0.3, y - s * 0.5, s * 0.15, '#000000');
        this.drawRect(x - s * 0.6, y + s * 0.2, s * 1.2, s * 1.0, color);
    }
    drawTerranPortrait(x, y, size, color) {
        const s = size * 0.3;
        this.fillCircle(x, y - s * 0.3, s * 0.8, color);
        this.fillCircle(x - s * 0.3, y - s * 0.5, s * 0.15, '#00ffff');
        this.fillCircle(x + s * 0.3, y - s * 0.5, s * 0.15, '#00ffff');
        this.drawLine(x - s * 0.5, y - s * 0.2, x + s * 0.5, y - s * 0.2, '#00ffff', 2);
        this.drawRect(x - s * 0.6, y + s * 0.2, s * 1.2, s * 1.0, color);
    }
    drawZephyrianPortrait(x, y, size, color) {
        const s = size * 0.3;
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.ellipse(x, y - s * 0.3, s * 0.6, s * 1.0, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.fillCircle(x - s * 0.2, y - s * 0.4, s * 0.2, '#ffffff');
        this.fillCircle(x + s * 0.2, y - s * 0.4, s * 0.2, '#ffffff');
        this.fillCircle(x - s * 0.2, y - s * 0.4, s * 0.1, '#000088');
        this.fillCircle(x + s * 0.2, y - s * 0.4, s * 0.1, '#000088');
        this.drawRect(x - s * 0.5, y + s * 0.3, s * 1.0, s * 0.8, color);
    }
    drawCrystallinePortrait(x, y, size, color) {
        const s = size * 0.3;
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - s * 0.8);
        this.ctx.lineTo(x + s * 0.6, y - s * 0.2);
        this.ctx.lineTo(x + s * 0.4, y + s * 0.2);
        this.ctx.lineTo(x - s * 0.4, y + s * 0.2);
        this.ctx.lineTo(x - s * 0.6, y - s * 0.2);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(x - s * 0.2, y - s * 0.4, s * 0.1, s * 0.2);
        this.ctx.fillRect(x + s * 0.1, y - s * 0.4, s * 0.1, s * 0.2);
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x - s * 0.5, y + s * 0.3, s * 1.0, s * 0.8);
    }
    drawVorthanPortrait(x, y, size, color) {
        const s = size * 0.3;
        this.fillCircle(x, y - s * 0.2, s * 0.9, color);
        this.fillCircle(x - s * 0.3, y - s * 0.4, s * 0.15, '#ff0000');
        this.fillCircle(x + s * 0.3, y - s * 0.4, s * 0.15, '#ff0000');
        this.drawLine(x - s * 0.1, y - s * 0.7, x + s * 0.2, y - s * 0.2, '#800000', 2);
        this.drawRect(x - s * 0.7, y + s * 0.2, s * 1.4, s * 1.0, color);
    }
    drawAquarianPortrait(x, y, size, color) {
        const s = size * 0.3;
        this.fillCircle(x, y - s * 0.3, s * 0.8, color);
        this.fillCircle(x - s * 0.3, y - s * 0.5, s * 0.2, '#0088ff');
        this.fillCircle(x + s * 0.3, y - s * 0.5, s * 0.2, '#0088ff');
        this.drawLine(x - s * 0.6, y - s * 0.1, x - s * 0.4, y + s * 0.1, '#0066cc', 2);
        this.drawLine(x + s * 0.4, y - s * 0.1, x + s * 0.6, y + s * 0.1, '#0066cc', 2);
        this.drawRect(x - s * 0.6, y + s * 0.2, s * 1.2, s * 1.0, color);
    }
    drawMechanoPortrait(x, y, size, color) {
        const s = size * 0.3;
        this.drawRect(x - s * 0.6, y - s * 0.8, s * 1.2, s * 1.0, color);
        this.fillCircle(x - s * 0.3, y - s * 0.5, s * 0.1, '#ff0000');
        this.fillCircle(x + s * 0.3, y - s * 0.5, s * 0.1, '#ff0000');
        this.drawRect(x - s * 0.5, y - s * 0.2, s * 1.0, s * 0.1, '#666666');
        this.drawRect(x - s * 0.2, y - s * 0.6, s * 0.4, s * 0.1, '#666666');
        this.drawRect(x - s * 0.6, y + s * 0.2, s * 1.2, s * 1.0, color);
    }
    drawEtherealPortrait(x, y, size, color) {
        const s = size * 0.3;
        this.ctx.globalAlpha = 0.7;
        this.fillCircle(x, y - s * 0.3, s * 0.8, color);
        this.ctx.globalAlpha = 1.0;
        this.fillCircle(x - s * 0.3, y - s * 0.5, s * 0.15, '#ffffff');
        this.fillCircle(x + s * 0.3, y - s * 0.5, s * 0.15, '#ffffff');
        this.ctx.globalAlpha = 0.5;
        this.fillCircle(x - s * 0.8, y - s * 0.6, s * 0.2, color);
        this.fillCircle(x + s * 0.8, y - s * 0.4, s * 0.15, color);
        this.ctx.globalAlpha = 0.7;
        this.drawRect(x - s * 0.6, y + s * 0.2, s * 1.2, s * 1.0, color);
        this.ctx.globalAlpha = 1.0;
    }
    drawDrakonidPortrait(x, y, size, color) {
        const s = size * 0.3;
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.ellipse(x, y - s * 0.3, s * 0.7, s * 0.9, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.fillCircle(x - s * 0.2, y - s * 0.5, s * 0.12, '#ffff00');
        this.fillCircle(x + s * 0.2, y - s * 0.5, s * 0.12, '#ffff00');
        this.fillCircle(x - s * 0.2, y - s * 0.5, s * 0.06, '#000000');
        this.fillCircle(x + s * 0.2, y - s * 0.5, s * 0.06, '#000000');
        for (let i = 0; i < 3; i++) {
            this.drawRect(x - s * 0.3 + i * s * 0.3, y - s * 0.1, s * 0.2, s * 0.1, '#333333');
        }
        this.drawRect(x - s * 0.6, y + s * 0.2, s * 1.2, s * 1.0, color);
    }
    drawSylvanPortrait(x, y, size, color) {
        const s = size * 0.3;
        this.fillCircle(x, y - s * 0.3, s * 0.8, color);
        this.fillCircle(x - s * 0.3, y - s * 0.5, s * 0.15, '#00ff00');
        this.fillCircle(x + s * 0.3, y - s * 0.5, s * 0.15, '#00ff00');
        this.ctx.fillStyle = '#228B22';
        this.ctx.beginPath();
        this.ctx.ellipse(x - s * 0.4, y - s * 0.8, s * 0.2, s * 0.4, -0.5, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.ellipse(x + s * 0.4, y - s * 0.8, s * 0.2, s * 0.4, 0.5, 0, Math.PI * 2);
        this.ctx.fill();
        this.drawRect(x - s * 0.6, y + s * 0.2, s * 1.2, s * 1.0, color);
    }
    drawDefaultPortrait(x, y, size, color) {
        const s = size * 0.3;
        this.fillCircle(x, y - s * 0.3, s * 0.8, color);
        this.fillCircle(x - s * 0.3, y - s * 0.5, s * 0.15, '#000000');
        this.fillCircle(x + s * 0.3, y - s * 0.5, s * 0.15, '#000000');
        this.drawRect(x - s * 0.6, y + s * 0.2, s * 1.2, s * 1.0, color);
    }
}
//# sourceMappingURL=renderer.js.map