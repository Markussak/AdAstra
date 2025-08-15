import { SceneType, CelestialBodyType } from './types';
import { CelestialBody } from './celestial';
import { SeededRandom } from './utils';
class SpaceBackground {
    constructor(seed = Math.random() * 1000000) {
        this.nebulae = [];
        this.starClusters = [];
        this.galaxies = [];
        this.distantStars = [];
        this.seed = seed;
        this.random = new SeededRandom(seed);
        this.homeGalaxyPlane = {
            angle: 0,
            width: 500,
            density: 0.8,
            color: '#E6E6FA',
            starCount: 2000
        };
        this.generateEnhancedBackground();
        this.generateMassiveHomeGalaxyPlane();
    }
    generateEnhancedBackground() {
        this.generateMultiLayerStars();
        this.generateAbundantMiniGalaxies();
        this.generateEnhancedStarClusters();
        this.generatePurpleRedNebulae();
    }
    generateMultiLayerStars() {
        const layers = [
            { count: 800, minSize: 1, maxSize: 1, brightness: 0.15, layer: 0 },
            { count: 600, minSize: 1, maxSize: 1, brightness: 0.25, layer: 1 },
            { count: 400, minSize: 1, maxSize: 2, brightness: 0.4, layer: 2 },
            { count: 300, minSize: 1, maxSize: 2, brightness: 0.6, layer: 3 },
            { count: 200, minSize: 2, maxSize: 3, brightness: 0.8, layer: 4 },
            { count: 100, minSize: 2, maxSize: 3, brightness: 1.0, layer: 5 }
        ];
        layers.forEach(layerInfo => {
            for (let i = 0; i < layerInfo.count; i++) {
                const x = this.random.next() * 8000 - 4000;
                const y = this.random.next() * 8000 - 4000;
                const size = layerInfo.minSize + this.random.next() * (layerInfo.maxSize - layerInfo.minSize);
                const brightness = layerInfo.brightness * (0.6 + this.random.next() * 0.4);
                const starTypes = [
                    '#F8F8FF',
                    '#E6E6FA',
                    '#F0F8FF',
                    '#FFF8DC',
                    '#F5F5DC',
                    '#FFFAF0',
                    '#FAF0E6'
                ];
                const color = starTypes[Math.floor(this.random.next() * starTypes.length)];
                this.distantStars.push({
                    x, y, size, brightness, color,
                    layer: layerInfo.layer
                });
            }
        });
    }
    generateAbundantMiniGalaxies() {
        const galaxyCount = 25 + Math.floor(this.random.next() * 35);
        for (let i = 0; i < galaxyCount; i++) {
            const x = this.random.next() * 12000 - 6000;
            const y = this.random.next() * 12000 - 6000;
            const size = 30 + this.random.next() * 100;
            const rotation = this.random.next() * Math.PI * 2;
            const galaxyTypes = ['spiral', 'elliptical', 'irregular', 'barred', 'dwarf'];
            const type = galaxyTypes[Math.floor(this.random.next() * galaxyTypes.length)];
            const galaxyColors = [
                '#E6E6FA',
                '#F0F8FF',
                '#FFE4E1',
                '#F5F5DC',
                '#E0E6FF',
                '#FFF8DC',
                '#FAF0E6'
            ];
            const color = galaxyColors[Math.floor(this.random.next() * galaxyColors.length)];
            this.galaxies.push({
                x, y, size, type, rotation, color
            });
        }
    }
    generateEnhancedStarClusters() {
        const clusterCount = 40 + Math.floor(this.random.next() * 60);
        for (let i = 0; i < clusterCount; i++) {
            const x = this.random.next() * 10000 - 5000;
            const y = this.random.next() * 10000 - 5000;
            const size = 15 + this.random.next() * 120;
            const starCount = 8 + Math.floor(this.random.next() * 50);
            const brightness = 0.3 + this.random.next() * 0.7;
            this.starClusters.push({
                x, y, size, starCount, brightness
            });
        }
    }
    generatePurpleRedNebulae() {
        const nebulaCount = 15 + Math.floor(this.random.next() * 25);
        for (let i = 0; i < nebulaCount; i++) {
            const x = this.random.next() * 8000 - 4000;
            const y = this.random.next() * 8000 - 4000;
            const size = 80 + this.random.next() * 400;
            const intensity = 0.15 + this.random.next() * 0.35;
            const nebulaTypes = ['emission', 'reflection', 'dark', 'planetary'];
            const type = nebulaTypes[Math.floor(this.random.next() * nebulaTypes.length)];
            let color = '#2D1B3D';
            switch (type) {
                case 'emission':
                    color = this.random.choose(['#4A2C4A', '#3D1A3D', '#5D2E5D', '#4D1F4D']);
                    break;
                case 'reflection':
                    color = this.random.choose(['#3A2A5A', '#2E1E4E', '#4A3A6A', '#3D2D5D']);
                    break;
                case 'planetary':
                    color = this.random.choose(['#4A2C2C', '#3D1F1F', '#5D2E2E', '#4D2121']);
                    break;
                case 'dark':
                    color = this.random.choose(['#2F1F2F', '#1F1F2F', '#2A1A2A', '#251525']);
                    break;
            }
            this.nebulae.push({
                x, y, size, color, intensity, type
            });
        }
    }
    generateMassiveHomeGalaxyPlane() {
        this.homeGalaxyPlane = {
            angle: this.random.next() * Math.PI * 2,
            width: 500 + this.random.next() * 800,
            density: 0.8 + this.random.next() * 0.2,
            color: '#E6E6FA',
            starCount: 2000 + Math.floor(this.random.next() * 3000)
        };
    }
    render(renderer, camera) {
        const ctx = renderer.getContext();
        const width = renderer.getWidth();
        const height = renderer.getHeight();
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);
        ctx.imageSmoothingEnabled = false;
        this.renderMassiveHomeGalaxyPlane(ctx, camera, width, height);
        this.renderMiniPixelGalaxies(ctx, camera);
        this.renderPurpleRedNebulae(ctx, camera);
        this.renderEnhancedStarClusters(ctx, camera);
        this.renderMultiLayerPixelStars(ctx, camera);
        ctx.imageSmoothingEnabled = true;
    }
    renderMassiveHomeGalaxyPlane(ctx, camera, width, height) {
        const plane = this.homeGalaxyPlane;
        const parallaxFactor = 0.1;
        const planeOffsetX = -camera.x * parallaxFactor;
        const planeOffsetY = -camera.y * parallaxFactor;
        ctx.save();
        ctx.translate(width / 2 + planeOffsetX, height / 2 + planeOffsetY);
        ctx.rotate(plane.angle);
        const gradient = ctx.createLinearGradient(-plane.width, 0, plane.width, 0);
        gradient.addColorStop(0, 'rgba(230, 230, 250, 0)');
        gradient.addColorStop(0.2, `rgba(230, 230, 250, ${plane.density * 0.1})`);
        gradient.addColorStop(0.5, `rgba(230, 230, 250, ${plane.density * 0.2})`);
        gradient.addColorStop(0.8, `rgba(230, 230, 250, ${plane.density * 0.1})`);
        gradient.addColorStop(1, 'rgba(230, 230, 250, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(-plane.width, -40, plane.width * 2, 80);
        const random = new SeededRandom(this.seed + 9999);
        for (let i = 0; i < plane.starCount; i++) {
            const starX = (random.next() - 0.5) * plane.width * 2;
            const starY = (random.next() - 0.5) * 60;
            const starSize = random.next() < 0.7 ? 1 : 2;
            const brightness = 0.3 + random.next() * 0.5;
            ctx.fillStyle = `rgba(255, 255, 255, ${brightness * plane.density})`;
            ctx.fillRect(starX, starY, starSize, starSize);
        }
        ctx.restore();
    }
    renderMiniPixelGalaxies(ctx, camera) {
        const parallaxFactor = 0.2;
        this.galaxies.forEach(galaxy => {
            const screenX = galaxy.x - camera.x * parallaxFactor;
            const screenY = galaxy.y - camera.y * parallaxFactor;
            if (screenX > -200 && screenX < ctx.canvas.width + 200 &&
                screenY > -200 && screenY < ctx.canvas.height + 200) {
                ctx.save();
                ctx.translate(screenX, screenY);
                ctx.rotate(galaxy.rotation);
                const random = new SeededRandom(this.seed + galaxy.x + galaxy.y);
                switch (galaxy.type) {
                    case 'spiral':
                        this.renderMiniSpiralGalaxy(ctx, galaxy, random);
                        break;
                    case 'elliptical':
                        this.renderMiniEllipticalGalaxy(ctx, galaxy, random);
                        break;
                    case 'irregular':
                        this.renderMiniIrregularGalaxy(ctx, galaxy, random);
                        break;
                    case 'barred':
                        this.renderMiniBarredGalaxy(ctx, galaxy, random);
                        break;
                    case 'dwarf':
                        this.renderMiniDwarfGalaxy(ctx, galaxy, random);
                        break;
                }
                ctx.restore();
            }
        });
    }
    renderMiniSpiralGalaxy(ctx, galaxy, random) {
        const pixelCount = Math.floor(galaxy.size / 4);
        for (let arm = 0; arm < 2; arm++) {
            for (let i = 0; i < pixelCount; i++) {
                const angle = (arm * Math.PI) + (i / pixelCount) * Math.PI * 2;
                const radius = (i / pixelCount) * galaxy.size / 2;
                const x = Math.cos(angle) * radius + (random.next() - 0.5) * 4;
                const y = Math.sin(angle) * radius + (random.next() - 0.5) * 4;
                if (random.next() < 0.6) {
                    ctx.fillStyle = galaxy.color.replace(')', ', 0.6)').replace('rgb', 'rgba');
                    ctx.fillRect(x - 1, y - 1, 1, 1);
                }
            }
        }
        ctx.fillStyle = galaxy.color.replace(')', ', 0.8)').replace('rgb', 'rgba');
        ctx.fillRect(-2, -2, 4, 4);
    }
    renderMiniEllipticalGalaxy(ctx, galaxy, random) {
        const pixelCount = Math.floor(galaxy.size / 3);
        for (let i = 0; i < pixelCount; i++) {
            const angle = random.next() * Math.PI * 2;
            const radius = random.next() * galaxy.size / 2;
            const ellipticity = 0.6;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius * ellipticity;
            const alpha = Math.max(0.1, 1 - (radius / (galaxy.size / 2)));
            ctx.fillStyle = galaxy.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
            ctx.fillRect(x - 1, y - 1, 1, 1);
        }
    }
    renderMiniIrregularGalaxy(ctx, galaxy, random) {
        const pixelCount = Math.floor(galaxy.size / 5);
        for (let i = 0; i < pixelCount; i++) {
            const x = (random.next() - 0.5) * galaxy.size;
            const y = (random.next() - 0.5) * galaxy.size;
            if (random.next() < 0.4) {
                ctx.fillStyle = galaxy.color.replace(')', ', 0.5)').replace('rgb', 'rgba');
                ctx.fillRect(x - 1, y - 1, 1, 1);
            }
        }
    }
    renderMiniBarredGalaxy(ctx, galaxy, random) {
        ctx.fillStyle = galaxy.color.replace(')', ', 0.7)').replace('rgb', 'rgba');
        ctx.fillRect(-galaxy.size / 4, -2, galaxy.size / 2, 4);
        this.renderMiniSpiralGalaxy(ctx, galaxy, random);
    }
    renderMiniDwarfGalaxy(ctx, galaxy, random) {
        const pixelCount = Math.floor(galaxy.size / 8);
        for (let i = 0; i < pixelCount; i++) {
            const x = (random.next() - 0.5) * galaxy.size * 0.5;
            const y = (random.next() - 0.5) * galaxy.size * 0.5;
            ctx.fillStyle = galaxy.color.replace(')', ', 0.4)').replace('rgb', 'rgba');
            ctx.fillRect(x, y, 1, 1);
        }
    }
    renderPurpleRedNebulae(ctx, camera) {
        const parallaxFactor = 0.3;
        this.nebulae.forEach(nebula => {
            const screenX = nebula.x - camera.x * parallaxFactor;
            const screenY = nebula.y - camera.y * parallaxFactor;
            if (screenX > -nebula.size && screenX < ctx.canvas.width + nebula.size &&
                screenY > -nebula.size && screenY < ctx.canvas.height + nebula.size) {
                const gradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, nebula.size);
                gradient.addColorStop(0, nebula.color.replace(')', `, ${nebula.intensity})`).replace('rgb', 'rgba'));
                gradient.addColorStop(0.6, nebula.color.replace(')', `, ${nebula.intensity * 0.5})`).replace('rgb', 'rgba'));
                gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(screenX, screenY, nebula.size, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }
    renderEnhancedStarClusters(ctx, camera) {
        const parallaxFactor = 0.4;
        this.starClusters.forEach(cluster => {
            const screenX = cluster.x - camera.x * parallaxFactor;
            const screenY = cluster.y - camera.y * parallaxFactor;
            if (screenX > -cluster.size && screenX < ctx.canvas.width + cluster.size &&
                screenY > -cluster.size && screenY < ctx.canvas.height + cluster.size) {
                const random = new SeededRandom(this.seed + cluster.x + cluster.y);
                for (let i = 0; i < cluster.starCount; i++) {
                    const angle = random.next() * Math.PI * 2;
                    const radius = random.next() * cluster.size / 2;
                    const starX = screenX + Math.cos(angle) * radius;
                    const starY = screenY + Math.sin(angle) * radius;
                    const starBrightness = cluster.brightness * (0.5 + random.next() * 0.5);
                    const starSize = random.next() < 0.8 ? 1 : 2;
                    ctx.fillStyle = `rgba(255, 255, 255, ${starBrightness})`;
                    ctx.fillRect(starX, starY, starSize, starSize);
                }
            }
        });
    }
    renderMultiLayerPixelStars(ctx, camera) {
        const layerParallax = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6];
        for (let layer = 0; layer < 6; layer++) {
            const parallaxFactor = layerParallax[layer];
            this.distantStars.forEach(star => {
                if (star.layer !== layer)
                    return;
                const screenX = star.x - camera.x * parallaxFactor;
                const screenY = star.y - camera.y * parallaxFactor;
                let finalX = screenX;
                let finalY = screenY;
                if (screenX < -100)
                    finalX += ctx.canvas.width + 200;
                if (screenX > ctx.canvas.width + 100)
                    finalX -= ctx.canvas.width + 200;
                if (screenY < -100)
                    finalY += ctx.canvas.height + 200;
                if (screenY > ctx.canvas.height + 100)
                    finalY -= ctx.canvas.height + 200;
                if (finalX >= 0 && finalX <= ctx.canvas.width &&
                    finalY >= 0 && finalY <= ctx.canvas.height) {
                    const time = Date.now() * 0.001;
                    const twinkle = 0.8 + Math.sin(time + star.x * 0.01 + star.y * 0.01) * 0.2;
                    const finalBrightness = star.brightness * twinkle;
                    ctx.fillStyle = star.color.replace(')', `, ${finalBrightness})`).replace('rgb', 'rgba');
                    ctx.fillRect(finalX, finalY, star.size, star.size);
                }
            });
        }
    }
}
export class StarSystemScene {
    constructor(systemName = 'Sol', seed = 12345) {
        this.celestialBodies = [];
        this.systemName = systemName;
        this.systemSeed = seed;
        this.spaceBackground = new SpaceBackground(seed + 1000);
        this.generateSolarSystem();
    }
    generateSolarSystem() {
        const random = new SeededRandom(this.systemSeed);
        const starMass = 1200 + random.next() * 800;
        const starRadius = 180 + random.next() * 120;
        const starColor = this.generateStarColor(random);
        const centralStar = new CelestialBody(0, 0, starRadius, CelestialBodyType.STAR, this.systemName, starMass, starColor);
        this.celestialBodies.push(centralStar);
        const planetCount = 3 + Math.floor(random.next() * 5);
        let currentDistance = 1500;
        for (let i = 0; i < planetCount; i++) {
            currentDistance += 800 + random.next() * 1600;
            const planetRadius = 48 + random.next() * 90;
            const planetMass = planetRadius * 3;
            const planetColor = this.generatePlanetColor(random);
            const startAngle = random.next() * Math.PI * 2;
            const planet = new CelestialBody(currentDistance, 0, planetRadius, CelestialBodyType.PLANET, `${this.systemName}-${i + 1}`, planetMass, planetColor);
            const eccentricity = Math.random() * 0.25;
            planet.setOrbit({ x: 0, y: 0 }, currentDistance, starMass, startAngle, eccentricity);
            if (random.next() < 0.5) {
                planet.hasAtmosphere = true;
                planet.atmosphereColor = 'rgba(95, 158, 158, 0.4)';
                planet.atmosphereRadius = planetRadius * (1.2 + random.next() * 0.3);
            }
            this.celestialBodies.push(planet);
            if (planetRadius > 30 && random.next() < 0.7) {
                const moonCount = 1 + Math.floor(random.next() * 3);
                for (let j = 0; j < moonCount; j++) {
                    const moonDistance = planetRadius * 12 + j * 180;
                    const moonRadius = 18 + random.next() * 32;
                    const moonMass = moonRadius * 2;
                    const moonColor = this.generateMoonColor(random);
                    const moonEccentricity = Math.random() * 0.1;
                    const moon = new CelestialBody(currentDistance + moonDistance, 0, moonRadius, CelestialBodyType.MOON, `${planet.name}-M${j + 1}`, moonMass, moonColor);
                    moon.setOrbit(planet.position, moonDistance, planetMass, random.next() * Math.PI * 2, moonEccentricity);
                    this.celestialBodies.push(moon);
                }
            }
        }
        if (random.next() < 0.8) {
            const beltDistance = currentDistance + 1200 + random.next() * 1600;
            const asteroidCount = 20 + Math.floor(random.next() * 35);
            for (let i = 0; i < asteroidCount; i++) {
                const angle = random.next() * Math.PI * 2;
                const distance = beltDistance + (random.next() - 0.5) * 800;
                const asteroidRadius = 12 + random.next() * 24;
                const asteroidMass = asteroidRadius;
                const asteroidEccentricity = Math.random() * 0.4;
                const asteroid = new CelestialBody(distance, 0, asteroidRadius, CelestialBodyType.ASTEROID, `Asteroid-${i}`, asteroidMass, this.generateAsteroidColor(random));
                asteroid.setOrbit({ x: 0, y: 0 }, distance, starMass, random.next() * Math.PI * 2, asteroidEccentricity);
                this.celestialBodies.push(asteroid);
            }
        }
    }
    generateStarColor(random) {
        const starTypes = [
            '#FFD700',
            '#FF6B47',
            '#FF4444',
            '#87CEEB',
            '#FFFFFF',
            '#FFA500',
            '#FFE4B5'
        ];
        return random.choose(starTypes);
    }
    generatePlanetColor(random) {
        const planetColors = [
            '#4169E1',
            '#CD853F',
            '#8B4513',
            '#228B22',
            '#DC143C',
            '#9370DB',
            '#FF6347',
            '#4682B4',
            '#DDA0DD',
            '#32CD32',
            '#FF8C00',
            '#8A2BE2'
        ];
        return random.choose(planetColors);
    }
    generateMoonColor(random) {
        const moonColors = [
            '#C0C0C0',
            '#8B7355',
            '#696969',
            '#A0522D',
            '#BC8F8F',
            '#D2691E',
            '#F4A460',
            '#CD853F'
        ];
        return random.choose(moonColors);
    }
    generateAsteroidColor(random) {
        const asteroidColors = [
            '#8B7D6B',
            '#A0522D',
            '#696969',
            '#708090',
            '#778899',
            '#B8860B',
            '#CD853F',
            '#D2691E'
        ];
        return random.choose(asteroidColors);
    }
    update(deltaTime, game) {
        this.celestialBodies.forEach(body => {
            body.update(deltaTime);
        });
    }
    render(renderer, camera) {
        this.spaceBackground.render(renderer, camera);
        const sortedBodies = [...this.celestialBodies].sort((a, b) => {
            const distA = Math.sqrt((camera.x - a.position.x) ** 2 + (camera.y - a.position.y) ** 2);
            const distB = Math.sqrt((camera.x - b.position.x) ** 2 + (camera.y - b.position.y) ** 2);
            return distB - distA;
        });
        sortedBodies.forEach(body => {
            body.render(renderer, camera);
        });
    }
    getSceneType() {
        return SceneType.STAR_SYSTEM;
    }
    getCelestialBodies() {
        return this.celestialBodies.map(body => ({
            position: body.position,
            mass: body.mass,
            radius: body.radius
        }));
    }
    getSystemName() {
        return this.systemName;
    }
}
export class InterstellarSpaceScene {
    constructor() {
        this.starSystems = [];
        this.generateGalaxy();
    }
    generateGalaxy() {
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 100 + Math.random() * 800;
            const systemTypes = ['G-Class', 'K-Class', 'M-Class', 'Binary', 'Pulsar'];
            const systemColors = ['#ffff88', '#ff8844', '#ff4444', '#8888ff', '#ffffff'];
            const typeIndex = Math.floor(Math.random() * systemTypes.length);
            this.starSystems.push({
                position: {
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance
                },
                name: `System-${String.fromCharCode(65 + i)}${Math.floor(Math.random() * 999)}`,
                type: systemTypes[typeIndex],
                color: systemColors[typeIndex],
                size: 3 + Math.random() * 8,
                explored: i === 0,
                seed: Math.floor(Math.random() * 999999)
            });
        }
    }
    update(deltaTime, game) {
        this.starSystems.forEach(system => {
            const centerDistance = Math.sqrt(system.position.x ** 2 + system.position.y ** 2);
            if (centerDistance > 50) {
                const rotationSpeed = 0.001 / (centerDistance * 0.01);
                const currentAngle = Math.atan2(system.position.y, system.position.x);
                const newAngle = currentAngle + rotationSpeed * deltaTime;
                system.position.x = Math.cos(newAngle) * centerDistance;
                system.position.y = Math.sin(newAngle) * centerDistance;
            }
        });
    }
    render(renderer, camera) {
        this.renderGalaxyBackground(renderer, camera);
        this.starSystems.forEach(system => {
            this.renderStarSystem(renderer, camera, system);
        });
    }
    renderGalaxyBackground(renderer, camera) {
        const ctx = renderer.getContext();
        const gradient = ctx.createLinearGradient(0, 0, renderer.getWidth(), 0);
        gradient.addColorStop(0, 'rgba(95, 158, 158, 0.1)');
        gradient.addColorStop(0.5, 'rgba(95, 158, 158, 0.2)');
        gradient.addColorStop(1, 'rgba(95, 158, 158, 0.1)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, renderer.getHeight() * 0.3, renderer.getWidth(), renderer.getHeight() * 0.4);
        for (let i = 0; i < 10; i++) {
            const x = (i * 167.89) % renderer.getWidth();
            const y = (i * 234.56) % renderer.getHeight();
            const size = 1 + Math.random() * 2;
            ctx.fillStyle = 'rgba(140, 140, 140, 0.3)';
            ctx.fillRect(x, y, size, size);
        }
    }
    renderStarSystem(renderer, camera, system) {
        const screenPos = camera.worldToScreen(system.position.x, system.position.y);
        const ctx = renderer.getContext();
        const gradient = ctx.createRadialGradient(screenPos.x, screenPos.y, 0, screenPos.x, screenPos.y, system.size + 10);
        gradient.addColorStop(0, system.color);
        gradient.addColorStop(0.7, system.color + '44');
        gradient.addColorStop(1, system.color + '00');
        ctx.fillStyle = gradient;
        ctx.fillRect(screenPos.x - system.size - 10, screenPos.y - system.size - 10, (system.size + 10) * 2, (system.size + 10) * 2);
        renderer.drawCircle(screenPos.x, screenPos.y, system.size, system.color, true);
        if (system.explored) {
            renderer.drawCircle(screenPos.x, screenPos.y, system.size + 8, '#00ffff', false);
        }
        if (Math.abs(screenPos.x - renderer.getWidth() / 2) < 200 &&
            Math.abs(screenPos.y - renderer.getHeight() / 2) < 200) {
            renderer.drawText(system.name, screenPos.x, screenPos.y + system.size + 15, '#dcd0c0', '6px "Big Apple 3PM", monospace');
            renderer.drawText(system.type, screenPos.x, screenPos.y + system.size + 25, '#dcd0c0', '6px "Big Apple 3PM", monospace');
        }
    }
    getSceneType() {
        return SceneType.INTERSTELLAR_SPACE;
    }
    getStarSystems() {
        return this.starSystems;
    }
    getCelestialBodies() {
        return [];
    }
}
//# sourceMappingURL=scenes.js.map