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
    drawText(text, x, y, color = '#ffffff', font = '12px monospace') {
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
}
//# sourceMappingURL=renderer.js.map