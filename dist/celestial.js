import { CelestialBodyType } from './types';
export class CelestialBody {
    constructor(x, y, radius, type, name, mass = 100, color = '#888888') {
        this.velocity = { x: 0, y: 0 };
        this.angle = 0;
        this.active = true;
        this.rotation = 0;
        this.orbitDistance = 0;
        this.orbitSpeed = 0;
        this.orbitAngle = 0;
        this.orbitCenter = null;
        this.orbitEccentricity = 0;
        this.periapsis = 0;
        this.apoapsis = 0;
        this.hasAtmosphere = false;
        this.atmosphereColor = null;
        this.atmosphereRadius = 0;
        this.surfaceFeatures = [];
        this.position = { x, y };
        this.radius = radius;
        this.type = type;
        this.name = name;
        this.mass = mass;
        this.color = color;
        this.rotationSpeed = 0.01 + Math.random() * 0.02;
        if (type === CelestialBodyType.PLANET && Math.random() < 0.4) {
            this.hasAtmosphere = true;
            this.atmosphereRadius = radius * (1.2 + Math.random() * 0.5);
        }
        this.generateSurfaceFeatures();
    }
    generateSurfaceFeatures() {
        const featureCount = 3 + Math.floor(Math.random() * 5);
        for (let i = 0; i < featureCount; i++) {
            this.surfaceFeatures.push({
                angle: Math.random() * Math.PI * 2,
                size: 0.1 + Math.random() * 0.3,
                color: this.type === CelestialBodyType.PLANET ? '#404040' : '#505050'
            });
        }
    }
    setOrbit(center, distance, speed, startAngle = 0, eccentricity = 0) {
        this.orbitCenter = center;
        this.orbitDistance = distance;
        this.orbitSpeed = speed;
        this.orbitAngle = startAngle;
        this.orbitEccentricity = Math.min(0.8, eccentricity);
        this.periapsis = distance * (1 - this.orbitEccentricity);
        this.apoapsis = distance * (1 + this.orbitEccentricity);
        this.updateOrbitalPosition();
    }
    updateOrbitalPosition() {
        if (!this.orbitCenter)
            return;
        const currentDistance = this.orbitDistance * (1 - this.orbitEccentricity * this.orbitEccentricity) /
            (1 + this.orbitEccentricity * Math.cos(this.orbitAngle));
        this.position.x = this.orbitCenter.x + Math.cos(this.orbitAngle) * currentDistance;
        this.position.y = this.orbitCenter.y + Math.sin(this.orbitAngle) * currentDistance;
    }
    update(deltaTime, game) {
        this.rotation += this.rotationSpeed * deltaTime;
        if (this.orbitCenter && this.orbitDistance > 0) {
            const currentDistance = this.orbitDistance * (1 - this.orbitEccentricity * this.orbitEccentricity) /
                (1 + this.orbitEccentricity * Math.cos(this.orbitAngle));
            const speedMultiplier = Math.sqrt(this.orbitDistance / currentDistance);
            const adjustedSpeed = this.orbitSpeed * speedMultiplier;
            this.orbitAngle += adjustedSpeed * deltaTime;
            if (this.orbitAngle > Math.PI * 2) {
                this.orbitAngle -= Math.PI * 2;
            }
            this.updateOrbitalPosition();
            const orbitVelX = -Math.sin(this.orbitAngle) * currentDistance * adjustedSpeed;
            const orbitVelY = Math.cos(this.orbitAngle) * currentDistance * adjustedSpeed;
            this.velocity.x = orbitVelX * 0.01;
            this.velocity.y = orbitVelY * 0.01;
        }
        if (game.sceneManager?.getCurrentScene()?.getCelestialBodies && this.type !== CelestialBodyType.ASTEROID) {
            const otherBodies = game.sceneManager.getCurrentScene().getCelestialBodies();
            this.applyMutualGravity(otherBodies, deltaTime);
        }
    }
    applyMutualGravity(otherBodies, deltaTime) {
        otherBodies.forEach(other => {
            if (other === this)
                return;
            const dx = other.position.x - this.position.x;
            const dy = other.position.y - this.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > (this.radius + other.radius) * 2 && other.mass > this.mass * 0.1) {
                const force = (other.mass * 0.0001) / (distance * distance);
                const angle = Math.atan2(dy, dx);
                if (this.orbitCenter) {
                    this.orbitAngle += force * Math.sin(angle - this.orbitAngle) * deltaTime * 0.001;
                    this.orbitSpeed *= (1 + force * deltaTime * 0.0001);
                }
            }
        });
    }
    render(renderer, camera) {
        if (!this.isVisible(camera, renderer.getWidth(), renderer.getHeight())) {
            return;
        }
        const screenPos = camera.worldToScreen(this.position.x, this.position.y);
        renderer.save();
        renderer.translate(screenPos.x, screenPos.y);
        if (this.orbitCenter && this.type !== CelestialBodyType.STAR) {
            this.renderOrbitPath(renderer, camera);
        }
        switch (this.type) {
            case CelestialBodyType.STAR:
                this.renderStar(renderer);
                break;
            case CelestialBodyType.PLANET:
                this.renderPlanet(renderer);
                break;
            case CelestialBodyType.MOON:
                this.renderMoon(renderer);
                break;
            case CelestialBodyType.ASTEROID:
                this.renderAsteroid(renderer);
                break;
            default:
                this.renderGeneric(renderer);
        }
        renderer.restore();
        if ((this.type === CelestialBodyType.STAR || this.type === CelestialBodyType.PLANET) &&
            Math.abs(screenPos.x - renderer.getWidth() / 2) < 150 &&
            Math.abs(screenPos.y - renderer.getHeight() / 2) < 150) {
            renderer.drawText(this.name, screenPos.x, screenPos.y + this.radius + 20, '#dcd0c0', '8px "Big Apple 3PM", monospace');
        }
    }
    renderOrbitPath(renderer, camera) {
        if (!this.orbitCenter)
            return;
        const ctx = renderer.getContext();
        const centerScreen = camera.worldToScreen(this.orbitCenter.x, this.orbitCenter.y);
        ctx.strokeStyle = 'rgba(95, 158, 158, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(centerScreen.x - camera.worldToScreen(this.position.x, this.position.y).x, centerScreen.y - camera.worldToScreen(this.position.x, this.position.y).y, this.orbitDistance * camera.zoom, 0, Math.PI * 2);
        ctx.stroke();
    }
    renderStar(renderer) {
        const ctx = renderer.getContext();
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius + 20);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(0.6, this.color + '88');
        gradient.addColorStop(1, this.color + '00');
        ctx.fillStyle = gradient;
        ctx.fillRect(-this.radius - 20, -this.radius - 20, (this.radius + 20) * 2, (this.radius + 20) * 2);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.save();
        ctx.rotate(this.rotation);
        ctx.fillStyle = 'rgba(255, 140, 0, 0.3)';
        this.surfaceFeatures.forEach(feature => {
            const x = Math.cos(feature.angle) * this.radius * 0.7;
            const y = Math.sin(feature.angle) * this.radius * 0.7;
            ctx.beginPath();
            ctx.arc(x, y, this.radius * feature.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
        if (Math.random() < 0.1) {
            ctx.strokeStyle = '#ff8c00';
            ctx.lineWidth = 2;
            const flareAngle = Math.random() * Math.PI * 2;
            const flareLength = this.radius + Math.random() * 30;
            ctx.beginPath();
            ctx.moveTo(Math.cos(flareAngle) * this.radius, Math.sin(flareAngle) * this.radius);
            ctx.lineTo(Math.cos(flareAngle) * flareLength, Math.sin(flareAngle) * flareLength);
            ctx.stroke();
        }
    }
    renderPlanet(renderer) {
        const ctx = renderer.getContext();
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.save();
        ctx.rotate(this.rotation);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.surfaceFeatures.forEach(feature => {
            const x = Math.cos(feature.angle) * this.radius * 0.4;
            const y = Math.sin(feature.angle) * this.radius * 0.4;
            ctx.beginPath();
            ctx.arc(x, y, this.radius * feature.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
        if (this.hasAtmosphere && this.atmosphereColor) {
            ctx.strokeStyle = this.atmosphereColor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 3, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, Math.PI * 0.7, Math.PI * 1.3);
        ctx.fill();
    }
    renderMoon(renderer) {
        const ctx = renderer.getContext();
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.save();
        ctx.rotate(this.rotation);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.surfaceFeatures.forEach(feature => {
            const x = Math.cos(feature.angle) * this.radius * 0.6;
            const y = Math.sin(feature.angle) * this.radius * 0.6;
            ctx.beginPath();
            ctx.arc(x, y, this.radius * feature.size * 0.5, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    }
    renderAsteroid(renderer) {
        const ctx = renderer.getContext();
        ctx.save();
        ctx.rotate(this.rotation);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        const sides = 6 + Math.floor(Math.random() * 3);
        for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * Math.PI * 2;
            const radius = this.radius * (0.7 + Math.random() * 0.6);
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (i === 0) {
                ctx.moveTo(x, y);
            }
            else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(140, 140, 140, 0.5)';
        ctx.fillRect(-this.radius * 0.3, -this.radius * 0.3, this.radius * 0.2, this.radius * 0.2);
        ctx.restore();
    }
    renderGeneric(renderer) {
        renderer.drawCircle(0, 0, this.radius, this.color, true);
    }
    isVisible(camera, screenWidth, screenHeight) {
        const screenPos = camera.worldToScreen(this.position.x, this.position.y);
        const margin = this.radius + 50;
        return screenPos.x > -margin &&
            screenPos.x < screenWidth + margin &&
            screenPos.y > -margin &&
            screenPos.y < screenHeight + margin;
    }
}
//# sourceMappingURL=celestial.js.map