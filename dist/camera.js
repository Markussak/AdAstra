export class Camera {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.zoom = 1.0;
        this.targetX = 0;
        this.targetY = 0;
        this.smoothing = 0.05;
    }
    followTarget(target, deltaTime, screenWidth, screenHeight, predictionFactor = 30) {
        this.targetX = target.x;
        this.targetY = target.y;
        const factor = 1 - Math.pow(this.smoothing, deltaTime * 60);
        this.x += (this.targetX - this.x - screenWidth / 2) * factor;
        this.y += (this.targetY - this.y - screenHeight / 2) * factor;
    }
    screenToWorld(screenX, screenY) {
        return {
            x: (screenX / this.zoom) + this.x,
            y: (screenY / this.zoom) + this.y
        };
    }
    worldToScreen(worldX, worldY) {
        return {
            x: (worldX - this.x) * this.zoom,
            y: (worldY - this.y) * this.zoom
        };
    }
    setZoom(zoom) {
        this.zoom = Math.max(0.1, Math.min(5.0, zoom));
    }
}
//# sourceMappingURL=camera.js.map