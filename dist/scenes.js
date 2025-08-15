import { SceneType, CelestialBodyType } from './types';
import { CelestialBody } from './celestial';
import { SeededRandom } from './utils';
export class StarSystemScene {
    constructor(systemName = 'Sol', seed = 12345) {
        this.celestialBodies = [];
        this.systemName = systemName;
        this.systemSeed = seed;
        this.generateSolarSystem();
    }
    generateSolarSystem() {
        const random = new SeededRandom(this.systemSeed);
        const starMass = 800 + random.next() * 400;
        const starRadius = 30 + random.next() * 20;
        const starColor = this.generateStarColor(random);
        const centralStar = new CelestialBody(0, 0, starRadius, CelestialBodyType.STAR, this.systemName, starMass, starColor);
        this.celestialBodies.push(centralStar);
        const planetCount = 2 + Math.floor(random.next() * 6);
        let currentDistance = 120;
        for (let i = 0; i < planetCount; i++) {
            currentDistance += 50 + random.next() * 100;
            const planetRadius = 8 + random.next() * 15;
            const planetMass = planetRadius * 2;
            const planetColor = this.generatePlanetColor(random);
            const orbitSpeed = 0.01 / Math.sqrt(currentDistance / 100);
            const startAngle = random.next() * Math.PI * 2;
            const planet = new CelestialBody(currentDistance, 0, planetRadius, CelestialBodyType.PLANET, `${this.systemName}-${i + 1}`, planetMass, planetColor);
            planet.setOrbit({ x: 0, y: 0 }, currentDistance, orbitSpeed, startAngle);
            if (random.next() < 0.4) {
                planet.hasAtmosphere = true;
                planet.atmosphereColor = 'rgba(95, 158, 158, 0.4)';
            }
            this.celestialBodies.push(planet);
            if (planetRadius > 12 && random.next() < 0.6) {
                const moonCount = 1 + Math.floor(random.next() * 3);
                for (let j = 0; j < moonCount; j++) {
                    const moonDistance = planetRadius * 3 + j * 25;
                    const moonRadius = 3 + random.next() * 5;
                    const moonMass = moonRadius;
                    const moonColor = '#888888';
                    const moonOrbitSpeed = 0.05 / Math.sqrt(moonDistance / 10);
                    const moon = new CelestialBody(currentDistance + moonDistance, 0, moonRadius, CelestialBodyType.MOON, `${planet.name}-M${j + 1}`, moonMass, moonColor);
                    moon.setOrbit(planet.position, moonDistance, moonOrbitSpeed, random.next() * Math.PI * 2);
                    this.celestialBodies.push(moon);
                }
            }
        }
        if (random.next() < 0.7) {
            const beltDistance = currentDistance + 80 + random.next() * 100;
            const asteroidCount = 15 + Math.floor(random.next() * 25);
            for (let i = 0; i < asteroidCount; i++) {
                const angle = random.next() * Math.PI * 2;
                const distance = beltDistance + (random.next() - 0.5) * 60;
                const asteroidRadius = 2 + random.next() * 4;
                const asteroidMass = asteroidRadius * 0.5;
                const orbitSpeed = 0.008 / Math.sqrt(distance / 100);
                const asteroid = new CelestialBody(distance, 0, asteroidRadius, CelestialBodyType.ASTEROID, `Asteroid-${i}`, asteroidMass, '#666666');
                asteroid.setOrbit({ x: 0, y: 0 }, distance, orbitSpeed, angle);
                this.celestialBodies.push(asteroid);
            }
        }
    }
    generateStarColor(random) {
        const starTypes = [
            '#606060', '#505050', '#404040', '#505050', '#606060'
        ];
        return random.choose(starTypes);
    }
    generatePlanetColor(random) {
        const planetColors = [
            '#505050', '#404040', '#404040', '#505050', '#404040',
            '#505050', '#606060', '#404040'
        ];
        return random.choose(planetColors);
    }
    update(deltaTime, game) {
        this.celestialBodies.forEach(body => {
            body.update(deltaTime, game);
        });
    }
    render(renderer, camera) {
        renderer.drawStarField(camera);
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