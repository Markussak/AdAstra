import { ShipSystemType, WeaponType } from './types';
import { PhysicsEngine } from './utils';
export class PlayerShip {
    constructor(x, y) {
        this.velocity = { x: 0, y: 0 };
        this.angle = 0;
        this.radius = 15;
        this.active = true;
        this.systems = new Map();
        this.components = [];
        this.weapons = new Map();
        this.selectedWeapon = WeaponType.LASER;
        this.hull = 100;
        this.maxHull = 100;
        this.shields = 85;
        this.maxShields = 100;
        this.fuel = 75;
        this.maxFuel = 100;
        this.energy = 90;
        this.maxEnergy = 100;
        this.thrust = 0;
        this.maxThrust = 0.2;
        this.rotationSpeed = 3.0;
        this.cargoItems = new Map();
        this.cargoWeight = 0;
        this.maxCargoWeight = 1000;
        this.position = { x, y };
        this.initializeSystems();
        this.initializeWeapons();
        this.initializeComponents();
    }
    initializeSystems() {
        const systemDefinitions = [
            { type: ShipSystemType.REACTOR, health: 100, powerConsumption: 0 },
            { type: ShipSystemType.ENGINES, health: 100, powerConsumption: 15 },
            { type: ShipSystemType.SHIELDS, health: 100, powerConsumption: 20 },
            { type: ShipSystemType.WEAPONS, health: 100, powerConsumption: 10 },
            { type: ShipSystemType.LIFE_SUPPORT, health: 100, powerConsumption: 5 },
            { type: ShipSystemType.NAVIGATION, health: 100, powerConsumption: 8 },
            { type: ShipSystemType.COMMUNICATIONS, health: 100, powerConsumption: 3 },
            { type: ShipSystemType.WARP_DRIVE, health: 100, powerConsumption: 50 }
        ];
        systemDefinitions.forEach(def => {
            this.systems.set(def.type, {
                type: def.type,
                health: def.health,
                maxHealth: def.health,
                active: def.type !== ShipSystemType.WARP_DRIVE,
                efficiency: 1.0,
                powerConsumption: def.powerConsumption
            });
        });
    }
    initializeWeapons() {
        this.weapons.set(WeaponType.LASER, {
            type: WeaponType.LASER,
            damage: 25,
            range: 500,
            energyCost: 5,
            heat: 0,
            maxHeat: 100,
            cooldownRate: 15,
            fireRate: 0.2,
            lastFired: 0
        });
        this.weapons.set(WeaponType.MISSILES, {
            type: WeaponType.MISSILES,
            damage: 75,
            range: 800,
            energyCost: 10,
            heat: 0,
            maxHeat: 50,
            cooldownRate: 10,
            ammo: 12,
            maxAmmo: 12,
            fireRate: 1.0,
            lastFired: 0
        });
    }
    initializeComponents() {
        const componentDefinitions = [
            { name: 'BOW', health: 100, critical: false, position: { x: 15, y: 0 } },
            { name: 'PORT', health: 100, critical: false, position: { x: -5, y: -8 } },
            { name: 'STARBOARD', health: 100, critical: false, position: { x: -5, y: 8 } },
            { name: 'AFT', health: 100, critical: false, position: { x: -15, y: 0 } },
            { name: 'ENGINES', health: 100, critical: true, position: { x: -12, y: 0 } },
            { name: 'LIFE_SUPPORT', health: 100, critical: true, position: { x: -5, y: 0 } },
            { name: 'NAVIGATION', health: 100, critical: true, position: { x: 5, y: 0 } },
            { name: 'COMMUNICATIONS', health: 100, critical: false, position: { x: 0, y: 5 } }
        ];
        this.components = componentDefinitions.map(def => ({
            name: def.name,
            health: def.health,
            maxHealth: def.health,
            critical: def.critical,
            position: def.position
        }));
    }
    update(deltaTime, game) {
        this.handleInput(game.inputManager, deltaTime);
        this.updateSystems(deltaTime);
        this.updateWeapons(deltaTime);
        PhysicsEngine.applyNewtonianMotion(this, deltaTime);
        if (game.sceneManager.getCurrentScene()?.getCelestialBodies) {
            const celestialBodies = game.sceneManager.getCurrentScene().getCelestialBodies();
            if (celestialBodies) {
                PhysicsEngine.applyGravity(this, celestialBodies, deltaTime);
            }
        }
    }
    handleInput(inputManager, deltaTime) {
        const rotationInput = inputManager.getRotationInput();
        this.angle += rotationInput * this.rotationSpeed * deltaTime;
        const thrustInput = inputManager.getThrustInput();
        const enginesActive = this.systems.get(ShipSystemType.ENGINES)?.active;
        if (thrustInput > 0 && enginesActive && this.fuel > 0) {
            const thrustForce = this.maxThrust * (this.systems.get(ShipSystemType.REACTOR)?.active ? 1.0 : 0.5);
            this.velocity.x += Math.cos(this.angle) * thrustForce * deltaTime;
            this.velocity.y += Math.sin(this.angle) * thrustForce * deltaTime;
            this.fuel = Math.max(0, this.fuel - 0.1 * deltaTime);
            this.energy = Math.max(0, this.energy - 0.05 * deltaTime);
            this.thrust = Math.min(1.0, this.thrust + 2.0 * deltaTime);
        }
        else {
            this.thrust = Math.max(0, this.thrust - 4.0 * deltaTime);
        }
        const brakeInput = inputManager.getBrakeInput();
        if (brakeInput > 0 && enginesActive) {
            const brakeForce = this.maxThrust * 0.5;
            this.velocity.x -= Math.cos(this.angle) * brakeForce * deltaTime;
            this.velocity.y -= Math.sin(this.angle) * brakeForce * deltaTime;
        }
        if (inputManager.getFireInput()) {
            this.fireWeapon();
        }
    }
    updateSystems(deltaTime) {
        const reactor = this.systems.get(ShipSystemType.REACTOR);
        if (reactor?.active && this.energy < this.maxEnergy) {
            this.energy = Math.min(this.maxEnergy, this.energy + 5.0 * deltaTime);
        }
        const shields = this.systems.get(ShipSystemType.SHIELDS);
        if (shields?.active && this.energy > 0) {
            this.energy = Math.max(0, this.energy - 0.5 * deltaTime);
            if (this.shields < this.maxShields) {
                this.shields = Math.min(this.maxShields, this.shields + 2.0 * deltaTime);
            }
        }
        this.systems.forEach(system => {
            system.efficiency = system.health / system.maxHealth;
        });
    }
    updateWeapons(deltaTime) {
        this.weapons.forEach(weapon => {
            if (weapon.heat > 0) {
                weapon.heat = Math.max(0, weapon.heat - weapon.cooldownRate * deltaTime);
            }
        });
    }
    fireWeapon() {
        const weapon = this.weapons.get(this.selectedWeapon);
        if (!weapon)
            return;
        const now = Date.now() / 1000;
        if (now - weapon.lastFired < weapon.fireRate)
            return;
        if (weapon.heat >= weapon.maxHeat)
            return;
        if (this.energy < weapon.energyCost)
            return;
        if (weapon.ammo !== undefined && weapon.ammo <= 0)
            return;
        weapon.heat += 15;
        this.energy -= weapon.energyCost;
        weapon.lastFired = now;
        if (weapon.ammo !== undefined) {
            weapon.ammo--;
        }
        this.createWeaponEffect(weapon);
    }
    createWeaponEffect(weapon) {
        console.log(`Firing ${weapon.type} at angle ${this.angle}`);
    }
    render(renderer, camera) {
        const screenPos = camera.worldToScreen(this.position.x, this.position.y);
        renderer.save();
        renderer.translate(screenPos.x, screenPos.y);
        renderer.rotate(this.angle);
        this.renderHull(renderer);
        if (this.thrust > 0.1) {
            this.renderEngineEffects(renderer);
        }
        if (this.systems.get(ShipSystemType.SHIELDS)?.active && this.shields > 0) {
            this.renderShieldEffects(renderer);
        }
        renderer.restore();
    }
    renderHull(renderer) {
        const ctx = renderer.getContext();
        ctx.fillStyle = '#dcd0c0';
        ctx.strokeStyle = '#8c8c8c';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(15, 0);
        ctx.lineTo(-10, -8);
        ctx.lineTo(-8, -4);
        ctx.lineTo(-12, -2);
        ctx.lineTo(-12, 2);
        ctx.lineTo(-8, 4);
        ctx.lineTo(-10, 8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#5f9e9e';
        ctx.fillRect(8, -2, 4, 1);
        ctx.fillRect(8, 1, 4, 1);
        ctx.fillRect(-6, -1, 3, 2);
        ctx.fillStyle = '#8c8c8c';
        ctx.fillRect(12, -1, 3, 2);
        ctx.strokeStyle = '#5f9e9e';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-8, -6);
        ctx.lineTo(-10, -8);
        ctx.moveTo(-8, 6);
        ctx.lineTo(-10, 8);
        ctx.stroke();
    }
    renderEngineEffects(renderer) {
        const ctx = renderer.getContext();
        const intensity = this.thrust;
        ctx.fillStyle = '#ff8c00';
        ctx.globalAlpha = intensity * 0.8;
        ctx.beginPath();
        ctx.moveTo(-12, -3);
        ctx.lineTo(-12 - (8 * intensity), -1);
        ctx.lineTo(-12 - (6 * intensity), 0);
        ctx.lineTo(-12 - (8 * intensity), 1);
        ctx.lineTo(-12, 3);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#00ffff';
        for (let i = 0; i < 5; i++) {
            const particleX = -15 - Math.random() * 10 * intensity;
            const particleY = (Math.random() - 0.5) * 6;
            ctx.fillRect(particleX, particleY, 2, 1);
        }
        ctx.globalAlpha = 1.0;
    }
    renderShieldEffects(renderer) {
        const ctx = renderer.getContext();
        const shieldStrength = this.shields / this.maxShields;
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 1;
        ctx.globalAlpha = shieldStrength * 0.4;
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.stroke();
        if (Math.random() < 0.1) {
            ctx.globalAlpha = 0.8;
            ctx.beginPath();
            ctx.arc(Math.random() * 40 - 20, Math.random() * 40 - 20, 5, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.globalAlpha = 1.0;
    }
    toggleSystem(systemType) {
        const system = this.systems.get(systemType);
        if (system) {
            system.active = !system.active;
        }
    }
    selectWeapon(weaponType) {
        if (this.weapons.has(weaponType)) {
            this.selectedWeapon = weaponType;
        }
    }
    getSystemStatus(systemType) {
        return this.systems.get(systemType);
    }
    getWeaponStatus(weaponType) {
        return this.weapons.get(weaponType);
    }
}
//# sourceMappingURL=player.js.map