import { CelestialBodyType } from './types';
import { SeededRandom } from './utils';
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
        this.semiMajorAxis = 0;
        this.meanAnomaly = 0;
        this.meanMotion = 0;
        this.centralBodyMass = 0;
        this.hasAtmosphere = false;
        this.atmosphereColor = null;
        this.atmosphereRadius = 0;
        this.surfaceFeatures = [];
        this.surfaceMap = [];
        this.normalMap = [];
        this.shadowMap = [];
        this.uniqueFeatures = [];
        this.textureResolution = 64;
        this.position = { x, y };
        this.radius = radius;
        this.type = type;
        this.name = name;
        this.mass = mass;
        this.color = color;
        this.rotationSpeed = 0.0002 + Math.random() * 0.0008;
        this.generateRealisticSphere();
        if (type === CelestialBodyType.PLANET && Math.random() < 0.6) {
            this.hasAtmosphere = true;
            this.atmosphereRadius = radius * (1.1 + Math.random() * 0.2);
            this.generateAtmosphereColor();
        }
    }
    generateRealisticSphere() {
        const random = new SeededRandom(this.name.charCodeAt(0) * 1337 + this.name.length * 777);
        this.surfaceMap = [];
        this.normalMap = [];
        this.shadowMap = [];
        this.uniqueFeatures = [];
        for (let x = 0; x < this.textureResolution; x++) {
            this.surfaceMap[x] = [];
            this.normalMap[x] = [];
            this.shadowMap[x] = [];
            for (let y = 0; y < this.textureResolution; y++) {
                this.surfaceMap[x][y] = { r: 0, g: 0, b: 0, elevation: 0 };
                this.normalMap[x][y] = { x: 0, y: 0, z: 1 };
                this.shadowMap[x][y] = 1.0;
            }
        }
        this.generateUniqueSurface(random);
        this.generateSurfaceFeatures(random);
        this.calculateSphereGeometry();
        this.applyRealisticLighting();
    }
    generateUniqueSurface(random) {
        const baseColors = this.getBaseColorPalette();
        const centerX = this.textureResolution / 2;
        const centerY = this.textureResolution / 2;
        const maxRadius = this.textureResolution / 2;
        for (let x = 0; x < this.textureResolution; x++) {
            for (let y = 0; y < this.textureResolution; y++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distFromCenter = Math.sqrt(dx * dx + dy * dy);
                if (distFromCenter <= maxRadius) {
                    const scale1 = 0.1;
                    const scale2 = 0.05;
                    const scale3 = 0.02;
                    const noise1 = this.perlinNoise(x * scale1, y * scale1, random.next() * 1000) * 0.5;
                    const noise2 = this.perlinNoise(x * scale2, y * scale2, random.next() * 2000) * 0.3;
                    const noise3 = this.perlinNoise(x * scale3, y * scale3, random.next() * 3000) * 0.2;
                    const combinedNoise = noise1 + noise2 + noise3;
                    const normalizedNoise = (combinedNoise + 1) / 2;
                    const colorIndex = Math.floor(normalizedNoise * (baseColors.length - 1));
                    const baseColor = baseColors[colorIndex];
                    this.surfaceMap[x][y].elevation = normalizedNoise * 0.3;
                    const variation = (random.next() - 0.5) * 0.2;
                    this.surfaceMap[x][y].r = Math.max(0, Math.min(255, baseColor.r + variation * 255));
                    this.surfaceMap[x][y].g = Math.max(0, Math.min(255, baseColor.g + variation * 255));
                    this.surfaceMap[x][y].b = Math.max(0, Math.min(255, baseColor.b + variation * 255));
                }
            }
        }
    }
    generateSurfaceFeatures(random) {
        const featureCount = 5 + Math.floor(random.next() * 15);
        for (let i = 0; i < featureCount; i++) {
            const x = Math.floor(random.next() * this.textureResolution);
            const y = Math.floor(random.next() * this.textureResolution);
            const size = 3 + random.next() * 12;
            const intensity = 0.3 + random.next() * 0.7;
            let featureType = 'crater';
            switch (this.type) {
                case CelestialBodyType.PLANET:
                    featureType = random.choose(['mountain', 'crater', 'valley', 'plateau', 'rift']);
                    break;
                case CelestialBodyType.MOON:
                    featureType = random.choose(['crater', 'mountain', 'ridge', 'basin']);
                    break;
                case CelestialBodyType.STAR:
                    featureType = random.choose(['sunspot', 'flare', 'granule', 'prominence']);
                    break;
                case CelestialBodyType.ASTEROID:
                    featureType = random.choose(['crater', 'boulder', 'fracture', 'metal_deposit']);
                    break;
            }
            this.uniqueFeatures.push({ x, y, size, type: featureType, intensity });
            this.applyFeatureToSurface(x, y, size, featureType, intensity);
        }
    }
    applyFeatureToSurface(centerX, centerY, size, type, intensity) {
        const radius = size / 2;
        for (let x = Math.max(0, centerX - radius); x < Math.min(this.textureResolution, centerX + radius); x++) {
            for (let y = Math.max(0, centerY - radius); y < Math.min(this.textureResolution, centerY + radius); y++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance <= radius) {
                    const falloff = 1 - (distance / radius);
                    const effect = intensity * falloff;
                    switch (type) {
                        case 'crater':
                            this.surfaceMap[x][y].elevation -= effect * 0.5;
                            this.surfaceMap[x][y].r = Math.max(0, this.surfaceMap[x][y].r - effect * 50);
                            this.surfaceMap[x][y].g = Math.max(0, this.surfaceMap[x][y].g - effect * 50);
                            this.surfaceMap[x][y].b = Math.max(0, this.surfaceMap[x][y].b - effect * 50);
                            break;
                        case 'mountain':
                            this.surfaceMap[x][y].elevation += effect * 0.4;
                            this.surfaceMap[x][y].r = Math.min(255, this.surfaceMap[x][y].r + effect * 30);
                            this.surfaceMap[x][y].g = Math.min(255, this.surfaceMap[x][y].g + effect * 30);
                            this.surfaceMap[x][y].b = Math.min(255, this.surfaceMap[x][y].b + effect * 30);
                            break;
                        case 'sunspot':
                            this.surfaceMap[x][y].r = Math.max(0, this.surfaceMap[x][y].r - effect * 100);
                            this.surfaceMap[x][y].g = Math.max(0, this.surfaceMap[x][y].g - effect * 80);
                            this.surfaceMap[x][y].b = Math.max(0, this.surfaceMap[x][y].b - effect * 60);
                            break;
                    }
                }
            }
        }
    }
    calculateSphereGeometry() {
        const centerX = this.textureResolution / 2;
        const centerY = this.textureResolution / 2;
        const maxRadius = this.textureResolution / 2;
        for (let x = 0; x < this.textureResolution; x++) {
            for (let y = 0; y < this.textureResolution; y++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distFromCenter = Math.sqrt(dx * dx + dy * dy);
                if (distFromCenter <= maxRadius) {
                    const normalizedX = dx / maxRadius;
                    const normalizedY = dy / maxRadius;
                    const z = Math.sqrt(Math.max(0, 1 - normalizedX * normalizedX - normalizedY * normalizedY));
                    const elevation = this.surfaceMap[x][y].elevation;
                    const surfaceNormalX = 0;
                    const surfaceNormalY = 0;
                    const surfaceNormalZ = 1;
                    if (x > 0 && x < this.textureResolution - 1 && y > 0 && y < this.textureResolution - 1) {
                        const gradientX = this.surfaceMap[x + 1][y].elevation - this.surfaceMap[x - 1][y].elevation;
                        const gradientY = this.surfaceMap[x][y + 1].elevation - this.surfaceMap[x][y - 1].elevation;
                        this.normalMap[x][y].x = normalizedX + gradientX * 0.1;
                        this.normalMap[x][y].y = normalizedY + gradientY * 0.1;
                        this.normalMap[x][y].z = z;
                    }
                    else {
                        this.normalMap[x][y].x = normalizedX;
                        this.normalMap[x][y].y = normalizedY;
                        this.normalMap[x][y].z = z;
                    }
                }
            }
        }
    }
    applyRealisticLighting() {
        const lightDirection = { x: 0.7, y: -0.5, z: 0.5 };
        const ambientLight = 0.2;
        const diffuseStrength = 0.8;
        const centerX = this.textureResolution / 2;
        const centerY = this.textureResolution / 2;
        const maxRadius = this.textureResolution / 2;
        for (let x = 0; x < this.textureResolution; x++) {
            for (let y = 0; y < this.textureResolution; y++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distFromCenter = Math.sqrt(dx * dx + dy * dy);
                if (distFromCenter <= maxRadius) {
                    const normal = this.normalMap[x][y];
                    const diffuse = Math.max(0, normal.x * lightDirection.x +
                        normal.y * lightDirection.y +
                        normal.z * lightDirection.z);
                    const terminatorFactor = Math.max(0, (normal.x * 0.7 + 0.3));
                    const edgeFactor = Math.max(0.3, normal.z);
                    const finalLighting = (ambientLight + diffuse * diffuseStrength) * terminatorFactor * edgeFactor;
                    const pixel = this.surfaceMap[x][y];
                    pixel.r = Math.floor(pixel.r * finalLighting);
                    pixel.g = Math.floor(pixel.g * finalLighting);
                    pixel.b = Math.floor(pixel.b * finalLighting);
                    this.shadowMap[x][y] = finalLighting;
                }
            }
        }
    }
    perlinNoise(x, y, seed) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        x -= Math.floor(x);
        y -= Math.floor(y);
        const u = this.fade(x);
        const v = this.fade(y);
        const a = this.grad(this.hash(X + this.hash(Y + seed)), x, y);
        const b = this.grad(this.hash(X + 1 + this.hash(Y + seed)), x - 1, y);
        const c = this.grad(this.hash(X + this.hash(Y + 1 + seed)), x, y - 1);
        const d = this.grad(this.hash(X + 1 + this.hash(Y + 1 + seed)), x - 1, y - 1);
        return this.lerp(v, this.lerp(u, a, b), this.lerp(u, c, d));
    }
    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }
    lerp(t, a, b) {
        return a + t * (b - a);
    }
    hash(n) {
        n = (n << 13) ^ n;
        return (n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff;
    }
    grad(hash, x, y) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }
    getBaseColorPalette() {
        switch (this.type) {
            case CelestialBodyType.STAR:
                return [
                    { r: 255, g: 255, b: 220 },
                    { r: 255, g: 240, b: 180 },
                    { r: 255, g: 200, b: 120 },
                    { r: 255, g: 160, b: 100 },
                    { r: 255, g: 120, b: 80 }
                ];
            case CelestialBodyType.PLANET:
                return [
                    { r: 80, g: 120, b: 180 },
                    { r: 100, g: 160, b: 100 },
                    { r: 160, g: 120, b: 80 },
                    { r: 120, g: 100, b: 80 },
                    { r: 180, g: 180, b: 190 },
                    { r: 130, g: 90, b: 70 },
                    { r: 180, g: 100, b: 60 }
                ];
            case CelestialBodyType.MOON:
                return [
                    { r: 160, g: 160, b: 150 },
                    { r: 130, g: 130, b: 120 },
                    { r: 100, g: 100, b: 90 },
                    { r: 80, g: 80, b: 70 },
                    { r: 120, g: 110, b: 100 }
                ];
            case CelestialBodyType.ASTEROID:
                return [
                    { r: 70, g: 60, b: 50 },
                    { r: 100, g: 90, b: 80 },
                    { r: 130, g: 110, b: 80 },
                    { r: 80, g: 70, b: 60 },
                    { r: 140, g: 120, b: 100 }
                ];
            default:
                return [{ r: 128, g: 128, b: 128 }];
        }
    }
    generateAtmosphereColor() {
        switch (this.type) {
            case CelestialBodyType.PLANET:
                const atmosphereTypes = [
                    'rgba(135, 206, 235, 0.25)',
                    'rgba(255, 165, 0, 0.2)',
                    'rgba(255, 255, 255, 0.3)',
                    'rgba(128, 0, 128, 0.25)',
                    'rgba(0, 255, 127, 0.2)'
                ];
                this.atmosphereColor = atmosphereTypes[Math.floor(Math.random() * atmosphereTypes.length)];
                break;
        }
    }
    setOrbit(center, distance, centralMass, startAngle = 0, eccentricity = 0) {
        this.orbitCenter = center;
        this.orbitDistance = distance;
        this.orbitEccentricity = Math.min(0.95, eccentricity);
        this.centralBodyMass = centralMass;
        this.semiMajorAxis = distance / (1 - this.orbitEccentricity);
        this.periapsis = distance;
        this.apoapsis = this.semiMajorAxis * (1 + this.orbitEccentricity);
        const G = 0.0008;
        this.meanMotion = Math.sqrt((G * centralMass) / Math.pow(this.semiMajorAxis, 3));
        this.meanAnomaly = startAngle;
        this.orbitAngle = startAngle;
        this.updateOrbitalPosition();
    }
    updateOrbitalPosition() {
        if (!this.orbitCenter)
            return;
        let eccentricAnomaly = this.meanAnomaly;
        for (let i = 0; i < 5; i++) {
            const delta = eccentricAnomaly - this.orbitEccentricity * Math.sin(eccentricAnomaly) - this.meanAnomaly;
            eccentricAnomaly -= delta / (1 - this.orbitEccentricity * Math.cos(eccentricAnomaly));
        }
        const trueAnomaly = 2 * Math.atan2(Math.sqrt(1 + this.orbitEccentricity) * Math.sin(eccentricAnomaly / 2), Math.sqrt(1 - this.orbitEccentricity) * Math.cos(eccentricAnomaly / 2));
        const currentDistance = this.semiMajorAxis * (1 - this.orbitEccentricity * Math.cos(eccentricAnomaly));
        this.position.x = this.orbitCenter.x + currentDistance * Math.cos(trueAnomaly);
        this.position.y = this.orbitCenter.y + currentDistance * Math.sin(trueAnomaly);
        this.orbitAngle = trueAnomaly;
    }
    update(deltaTime) {
        this.rotation += this.rotationSpeed * deltaTime * 60;
        if (this.orbitCenter) {
            this.meanAnomaly += this.meanMotion * deltaTime * 60;
            if (this.meanAnomaly > Math.PI * 2) {
                this.meanAnomaly -= Math.PI * 2;
            }
            this.updateOrbitalPosition();
        }
        if (this.type === CelestialBodyType.STAR) {
            const time = Date.now() * 0.0001;
            this.uniqueFeatures.forEach((feature, index) => {
                if (feature.type === 'sunspot' || feature.type === 'flare') {
                    feature.intensity = 0.5 + Math.sin(time + index) * 0.3;
                }
            });
        }
    }
    isVisible(camera, screenWidth, screenHeight) {
        const screenPos = camera.worldToScreen(this.position.x, this.position.y);
        const screenRadius = this.radius * camera.zoom;
        const margin = Math.max(50, screenRadius);
        return (screenPos.x + screenRadius > -margin &&
            screenPos.x - screenRadius < screenWidth + margin &&
            screenPos.y + screenRadius > -margin &&
            screenPos.y - screenRadius < screenHeight + margin);
    }
    render(renderer, camera) {
        if (!this.isVisible(camera, renderer.getWidth(), renderer.getHeight())) {
            return;
        }
        const screenPos = camera.worldToScreen(this.position.x, this.position.y);
        const scaledRadius = this.radius * camera.zoom;
        const distanceToCamera = Math.sqrt((camera.x - this.position.x) ** 2 +
            (camera.y - this.position.y) ** 2);
        if (scaledRadius < 3 || distanceToCamera > 5000) {
            const ctx = renderer.getContext();
            ctx.fillStyle = this.color;
            ctx.fillRect(screenPos.x - 1, screenPos.y - 1, 2, 2);
            return;
        }
        if (scaledRadius < 8 || distanceToCamera > 2500) {
            const ctx = renderer.getContext();
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(screenPos.x, screenPos.y, Math.max(2, scaledRadius), 0, Math.PI * 2);
            ctx.fill();
            return;
        }
        renderer.save();
        renderer.translate(screenPos.x, screenPos.y);
        if (this.orbitCenter && this.type !== CelestialBodyType.STAR && distanceToCamera < 3000) {
            this.renderOrbitPath(renderer, camera);
        }
        this.renderRealistic16BitSphere(renderer, camera);
        renderer.restore();
        if ((this.type === CelestialBodyType.STAR || this.type === CelestialBodyType.PLANET) &&
            distanceToCamera < 1500 &&
            Math.abs(screenPos.x - renderer.getWidth() / 2) < 200 &&
            Math.abs(screenPos.y - renderer.getHeight() / 2) < 200) {
            renderer.drawText(this.name, screenPos.x, screenPos.y + this.radius * camera.zoom + 25, '#e0e3e6', '10px "Big Apple 3PM", monospace');
        }
    }
    renderOrbitPath(renderer, camera) {
        if (!this.orbitCenter)
            return;
        const ctx = renderer.getContext();
        const centerScreen = camera.worldToScreen(this.orbitCenter.x, this.orbitCenter.y);
        const screenWidth = renderer.getWidth();
        const screenHeight = renderer.getHeight();
        const orbitRadius = this.semiMajorAxis * camera.zoom;
        if (centerScreen.x + orbitRadius < -100 || centerScreen.x - orbitRadius > screenWidth + 100 ||
            centerScreen.y + orbitRadius < -100 || centerScreen.y - orbitRadius > screenHeight + 100) {
            return;
        }
        ctx.strokeStyle = 'rgba(162, 170, 178, 0.15)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        const radiusX = this.semiMajorAxis * camera.zoom;
        const radiusY = this.semiMajorAxis * camera.zoom * Math.sqrt(1 - this.orbitEccentricity ** 2);
        ctx.ellipse(centerScreen.x, centerScreen.y, radiusX, radiusY, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
    }
    renderRealistic16BitSphere(renderer, camera) {
        const ctx = renderer.getContext();
        const scaledRadius = this.radius * camera.zoom;
        if (scaledRadius < 6) {
            ctx.fillStyle = this.color;
            ctx.fillRect(-1, -1, 2, 2);
            return;
        }
        ctx.imageSmoothingEnabled = false;
        if (this.hasAtmosphere && this.atmosphereColor && scaledRadius > 12) {
            const gradient = ctx.createRadialGradient(0, 0, scaledRadius * 0.8, 0, 0, this.atmosphereRadius * camera.zoom);
            gradient.addColorStop(0, 'rgba(0,0,0,0)');
            gradient.addColorStop(0.7, this.atmosphereColor);
            gradient.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, this.atmosphereRadius * camera.zoom, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.save();
        ctx.rotate(this.rotation);
        const pixelSize = Math.max(1, Math.floor(scaledRadius / 32));
        const textureScale = scaledRadius / (this.textureResolution / 2);
        const renderStep = scaledRadius > 50 ? 1 : Math.max(1, Math.floor(3 - scaledRadius / 25));
        for (let x = 0; x < this.textureResolution; x += renderStep) {
            for (let y = 0; y < this.textureResolution; y += renderStep) {
                const centerX = this.textureResolution / 2;
                const centerY = this.textureResolution / 2;
                const dx = x - centerX;
                const dy = y - centerY;
                const distFromCenter = Math.sqrt(dx * dx + dy * dy);
                if (distFromCenter <= this.textureResolution / 2) {
                    const pixel = this.surfaceMap[x][y];
                    const screenX = dx * textureScale;
                    const screenY = dy * textureScale;
                    const normal = this.normalMap[x][y];
                    if (normal.z > 0.1) {
                        ctx.fillStyle = `rgb(${pixel.r}, ${pixel.g}, ${pixel.b})`;
                        const renderSize = Math.max(renderStep, pixelSize);
                        ctx.fillRect(screenX - renderSize / 2, screenY - renderSize / 2, renderSize, renderSize);
                    }
                }
            }
        }
        if (this.type === CelestialBodyType.STAR && scaledRadius > 20) {
            this.renderStellarCorona(ctx, camera);
        }
        ctx.restore();
        ctx.imageSmoothingEnabled = true;
    }
    renderStellarCorona(ctx, camera) {
        const coronaRadius = this.radius * camera.zoom * 1.15;
        const gradient = ctx.createRadialGradient(0, 0, this.radius * camera.zoom, 0, 0, coronaRadius);
        gradient.addColorStop(0, 'rgba(255, 255, 200, 0.0)');
        gradient.addColorStop(0.7, 'rgba(255, 200, 100, 0.2)');
        gradient.addColorStop(1, 'rgba(255, 150, 50, 0.05)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, coronaRadius, 0, Math.PI * 2);
        ctx.fill();
        const time = Date.now() * 0.001;
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 + time * 0.1;
            const flareLength = (15 + Math.sin(time + i) * 8) * camera.zoom;
            const flareX = Math.cos(angle) * this.radius * camera.zoom;
            const flareY = Math.sin(angle) * this.radius * camera.zoom;
            ctx.strokeStyle = `rgba(255, 240, 180, ${0.2 + Math.sin(time + i) * 0.1})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(flareX, flareY);
            ctx.lineTo(flareX + Math.cos(angle) * flareLength, flareY + Math.sin(angle) * flareLength);
            ctx.stroke();
        }
    }
    renderGeneric(renderer) {
        renderer.drawCircle(0, 0, this.radius, this.color, true);
    }
}
//# sourceMappingURL=celestial.js.map