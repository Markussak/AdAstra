// player.ts - Player ship implementation

import {
  IPlayerShip,
  IRenderer,
  ICamera,
  IInputManager,
  Vector2D,
  ShipSystemType,
  WeaponType,
  ShipSystem,
  Weapon,
  ShipComponent,
  CargoItem,
  EffectType
} from './types';
import { PhysicsEngine, gameConfig } from './utils';

export class PlayerShip implements IPlayerShip {
  public position: Vector2D;
  public velocity: Vector2D = { x: 0, y: 0 };
  public angle: number = 0;
  public angularVelocity: number = 0; // For realistic rotation inertia
  public radius: number = 15;
  public active: boolean = true;
  public mass: number = 100; // Ship mass for inertia calculations

  public systems: Map<ShipSystemType, ShipSystem> = new Map();
  public components: ShipComponent[] = [];
  public weapons: Map<WeaponType, Weapon> = new Map();
  public selectedWeapon: WeaponType = WeaponType.LASER;

  // Resources
  public hull: number = 100;
  public maxHull: number = 100;
  public shields: number = 85;
  public maxShields: number = 100;
  public shieldRegenRate: number = 10; // shields per second
  public shieldRegenDelay: number = 3; // seconds before regen starts
  public lastDamageTime: number = 0;
  public fuel: number = 75;
  public maxFuel: number = 100;
  public energy: number = 90;
  public maxEnergy: number = 100;
  public warpCharge: number = 0;
  public maxWarpCharge: number = 100;
  public isWarping: boolean = false;
  public inertialDampers: boolean = true; // Reduces drift but costs energy

  // Movement
  public thrust: number = 0;
  public maxThrust: number = 0.4; // Increased from 0.2 for better responsiveness
  public rotationSpeed: number = 4.0; // Increased rotation speed

  // Cargo
  public cargoItems: Map<string, CargoItem> = new Map();
  public cargoWeight: number = 0;
  public maxCargoWeight: number = 1000;

  constructor(x: number, y: number) {
    this.position = { x, y };
    this.initializeSystems();
    this.initializeWeapons();
    this.initializeComponents();
  }

  private initializeSystems(): void {
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

  private initializeWeapons(): void {
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

  private initializeComponents(): void {
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

  public update(deltaTime: number, game: any): void {
    this.handleInput(game.inputManager, deltaTime);
    this.updateSystems(deltaTime);
    this.updateWeapons(deltaTime);

    // Apply enhanced Newtonian motion
    PhysicsEngine.applyNewtonianMotion(this, deltaTime, gameConfig.physics.frictionFactor);
    
    // Apply gyroscopic effects for realistic high-speed handling
    PhysicsEngine.applyGyroscopicEffects(this, deltaTime);
    
    // Apply inertial dampening if active
    if (this.inertialDampers && this.energy > 1) {
      this.applyInertialDampening(deltaTime);
    }

    // Apply gravitational forces from celestial bodies
    if (game.sceneManager.getCurrentScene()?.getCelestialBodies) {
      const celestialBodies = game.sceneManager.getCurrentScene().getCelestialBodies();
      if (celestialBodies) {
        PhysicsEngine.applyGravity(this, celestialBodies, deltaTime, gameConfig.physics.gravityStrength);
        
        // Apply atmospheric drag for planets with atmospheres
        celestialBodies.forEach((body: any) => {
          if (body.hasAtmosphere && body.atmosphereRadius > 0) {
            const atmosphere = {
              position: body.position,
              radius: body.atmosphereRadius,
              density: 0.5 // Atmospheric density factor
            };
            PhysicsEngine.applyAtmosphericDrag(this, atmosphere, deltaTime);
          }
        });
      }
    }

    // Update ship orientation to show motion effects
    this.updateMotionEffects(deltaTime);
  }

  private updateMotionEffects(deltaTime: number): void {
    // Calculate current speed for various effects
    const speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
    
    // High-speed effects (visual feedback for realistic physics)
    if (speed > 50) {
      // Slight angular drift at high speeds (simulating control difficulty)
      const speedFactor = Math.min(1.0, speed / 200);
      const drift = (Math.random() - 0.5) * speedFactor * 0.01 * deltaTime;
      this.angularVelocity += drift; // Apply to angular velocity for more realistic effect
    }

    // Fuel consumption based on actual thrust usage and speed
    if (this.thrust > 0) {
      const speedPenalty = 1 + (speed / 100) * 0.1; // More fuel at higher speeds
      this.fuel = Math.max(0, this.fuel - (0.1 * this.thrust * speedPenalty * deltaTime));
    }
  }

  private applyInertialDampening(deltaTime: number): void {
    // Inertial dampening reduces unwanted drift but consumes energy
    const speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
    const angularSpeed = Math.abs(this.angularVelocity);
    
    if (speed > 5 || angularSpeed > 0.1) {
      // Calculate dampening force needed
      const linearDampening = Math.min(speed * 0.02, 10); // Max dampening force
      const angularDampening = Math.min(angularSpeed * 0.1, 1);
      
      // Apply dampening forces
      if (speed > 5) {
        const dampFactor = Math.pow(0.98, deltaTime);
        this.velocity.x *= dampFactor;
        this.velocity.y *= dampFactor;
      }
      
      if (angularSpeed > 0.1) {
        this.angularVelocity *= Math.pow(0.95, deltaTime);
      }
      
      // Energy cost for dampening
      const energyCost = (linearDampening + angularDampening) * 0.1 * deltaTime;
      this.energy = Math.max(0, this.energy - energyCost);
      
      // Disable dampening if energy too low
      if (this.energy < 1) {
        this.inertialDampers = false;
      }
    }
  }

  private handleInput(inputManager: IInputManager, deltaTime: number): void {
    const enginesActive = this.systems.get(ShipSystemType.ENGINES)?.active;
    const thrustForce = this.maxThrust * (this.systems.get(ShipSystemType.REACTOR)?.active ? 1.0 : 0.5) * 3; // Increase base thrust
    
    // Check for joystick input (mobile/touch)
    const joystickDir = inputManager.getJoystickDirection();
    if (joystickDir.x !== 0 || joystickDir.y !== 0) {
      // Joystick mode: direct directional control
      if (enginesActive && this.fuel > 0) {
        const magnitude = Math.sqrt(joystickDir.x * joystickDir.x + joystickDir.y * joystickDir.y);
        const normalizedX = joystickDir.x / magnitude;
        const normalizedY = joystickDir.y / magnitude;
        
        // Apply thrust in joystick direction
        this.velocity.x += normalizedX * thrustForce * magnitude * deltaTime;
        this.velocity.y += normalizedY * thrustForce * magnitude * deltaTime;
        
        // Auto-rotate ship to face movement direction (for visual feedback)
        const targetAngle = Math.atan2(normalizedY, normalizedX);
        const angleDiff = targetAngle - this.angle;
        // Normalize angle difference
        const normalizedAngleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
        this.angle += normalizedAngleDiff * 3 * deltaTime; // Smooth rotation
        
        this.fuel = Math.max(0, this.fuel - 0.1 * magnitude * deltaTime);
        this.energy = Math.max(0, this.energy - 0.05 * magnitude * deltaTime);
        this.thrust = Math.min(1.0, this.thrust + 2.0 * deltaTime);
      }
    } else {
             // Keyboard mode: traditional rotation + thrust with enhanced inertia
       const rotationInput = inputManager.getRotationInput();
       const targetAngularVelocity = rotationInput * this.rotationSpeed;
       
       // Apply angular inertia for realistic rotation
       PhysicsEngine.applyAngularInertia(this, targetAngularVelocity, 0.5, deltaTime);

       const thrustInput = inputManager.getThrustInput();
       if (thrustInput > 0 && enginesActive && this.fuel > 0) {
         // Use enhanced thrust with mass-based inertia
         PhysicsEngine.applyThrustWithInertia(this, thrustForce * thrustInput, this.mass, deltaTime);
        
        this.fuel = Math.max(0, this.fuel - 0.1 * deltaTime);
        this.energy = Math.max(0, this.energy - 0.05 * deltaTime);
        this.thrust = Math.min(1.0, this.thrust + 2.0 * deltaTime);
      } else {
        this.thrust = Math.max(0, this.thrust - 4.0 * deltaTime);
      }

             const brakeInput = inputManager.getBrakeInput();
       if (brakeInput > 0 && enginesActive) {
         // Realistic reverse thrust braking
         const reverseAngle = this.angle + Math.PI; // Opposite direction
         PhysicsEngine.applyThrustWithInertia(
           { position: this.position, velocity: this.velocity, angle: reverseAngle }, 
           thrustForce * 0.6 * brakeInput, 
           this.mass, 
           deltaTime
         );
         
         this.fuel = Math.max(0, this.fuel - 0.05 * brakeInput * deltaTime);
         this.energy = Math.max(0, this.energy - 0.025 * brakeInput * deltaTime);
       }
    }

    if (inputManager.getFireInput()) {
      this.fireWeapon();
    }
  }

  private updateSystems(deltaTime: number): void {
    const reactor = this.systems.get(ShipSystemType.REACTOR);
    if (reactor?.active && this.energy < this.maxEnergy) {
      this.energy = Math.min(this.maxEnergy, this.energy + 5.0 * deltaTime);
    }

    // New shield regeneration system
    const shields = this.systems.get(ShipSystemType.SHIELDS);
    if (shields?.active) {
      this.rechargeShields(deltaTime);
      this.energy = Math.max(0, this.energy - 0.5 * deltaTime);
    }

    // Warp charge buildup when not warping
    if (!this.isWarping && this.warpCharge < this.maxWarpCharge && this.energy > 10) {
      this.warpCharge = Math.min(this.maxWarpCharge, this.warpCharge + 2.0 * deltaTime);
    }

    this.systems.forEach(system => {
      system.efficiency = system.health / system.maxHealth;
    });
  }

  private updateWeapons(deltaTime: number): void {
    this.weapons.forEach(weapon => {
      if (weapon.heat > 0) {
        weapon.heat = Math.max(0, weapon.heat - weapon.cooldownRate * deltaTime);
      }
    });
  }

  public fireWeapon(): void {
    const weapon = this.weapons.get(this.selectedWeapon);
    if (!weapon) return;

    const now = Date.now() / 1000;
    if (now - weapon.lastFired < weapon.fireRate) return;

    if (weapon.heat >= weapon.maxHeat) return;
    if (this.energy < weapon.energyCost) return;
    if (weapon.ammo !== undefined && weapon.ammo <= 0) return;

    weapon.heat += 15;
    this.energy -= weapon.energyCost;
    weapon.lastFired = now;

    if (weapon.ammo !== undefined) {
      weapon.ammo--;
    }

    this.createWeaponEffect(weapon);
  }

  private createWeaponEffect(weapon: Weapon): void {
    console.log(`Firing ${weapon.type} at angle ${this.angle}`);
    
    // Update quest progress for firing weapons
    const game = (window as any).game;
    if (game && game.questSystem) {
      game.questSystem.updateProgress('collect', 'fire_tutorial', 1);
    }
    
    // Create weapon visual effect
    if (game && game.effectSystem) {
      const weaponPos = {
        x: this.position.x + Math.cos(this.angle) * 20,
        y: this.position.y + Math.sin(this.angle) * 20
      };
      
      game.effectSystem.createEffect(EffectType.WEAPON_IMPACT, weaponPos, {
        weaponType: weapon.type,
        color: this.getWeaponColor(weapon.type),
        size: 8
      });
    }
  }
  
  private getWeaponColor(weaponType: WeaponType): string {
    switch (weaponType) {
      case WeaponType.LASER: return '#505050';
      case WeaponType.PULSE_LASER: return '#505050';
      case WeaponType.BEAM_LASER: return '#606060';
      case WeaponType.PLASMA_CANNON: return '#505050';
      case WeaponType.ION_BEAM: return '#505050';
      case WeaponType.MISSILES: return '#505050';
      case WeaponType.TORPEDO: return '#505050';
      case WeaponType.RAILGUN: return '#606060';
      case WeaponType.EMP_WEAPON: return '#505050';
      case WeaponType.FLAK_CANNON: return '#505050';
      default: return '#606060';
    }
  }

  private createEngineParticleEffects(): void {
    const game = (window as any).game;
    if (!game || !game.effectSystem) return;
    
    // Create main engine effect
    const enginePos = {
      x: this.position.x - Math.cos(this.angle) * 20,
      y: this.position.y - Math.sin(this.angle) * 20
    };
    
    const thrustVector = {
      x: -Math.cos(this.angle),
      y: -Math.sin(this.angle)
    };
    
    game.effectSystem.createEffect(EffectType.ENGINE_THRUST, enginePos, {
      thrustVector,
      intensity: this.thrust,
      exhaustLength: 40 + this.thrust * 30,
      particleCount: Math.floor(15 + this.thrust * 10),
      duration: 0.1
    });
  }

  public render(renderer: IRenderer, camera: ICamera): void {
    const screenPos = camera.worldToScreen(this.position.x, this.position.y);

    renderer.save();
    renderer.translate(screenPos.x, screenPos.y);
    renderer.rotate(this.angle);

    this.renderHull(renderer);

    if (this.thrust > 0.1) {
      this.renderEngineEffects(renderer);
      this.createEngineParticleEffects();
    }

    if (this.systems.get(ShipSystemType.SHIELDS)?.active && this.shields > 0) {
      this.renderShieldEffects(renderer);
    }

    renderer.restore();
  }

  private renderHull(renderer: IRenderer): void {
    const ctx = renderer.getContext();

    // 16-bit ship colors
    ctx.fillStyle = '#5a6978'; // chassis primary
    ctx.strokeStyle = '#2b323a'; // chassis dark
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

    ctx.fillStyle = '#a2aab2'; // highlight standard
    ctx.fillRect(8, -2, 4, 1);
    ctx.fillRect(8, 1, 4, 1);
    ctx.fillRect(-6, -1, 3, 2);

    ctx.fillStyle = '#434c55'; // chassis midtone
    ctx.fillRect(12, -1, 3, 2);

    ctx.strokeStyle = '#e0e3e6'; // highlight specular
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-8, -6);
    ctx.lineTo(-10, -8);
    ctx.moveTo(-8, 6);
    ctx.lineTo(-10, 8);
    ctx.stroke();
  }

  private renderEngineEffects(renderer: IRenderer): void {
    const ctx = renderer.getContext();
    const intensity = this.thrust;

    // 16-bit engine effects
    ctx.fillStyle = '#e8732c'; // accent orange for engine flames
    ctx.globalAlpha = intensity * 0.6;

    ctx.beginPath();
    ctx.moveTo(-12, -3);
    ctx.lineTo(-12 - (8 * intensity), -1);
    ctx.lineTo(-12 - (6 * intensity), 0);
    ctx.lineTo(-12 - (8 * intensity), 1);
    ctx.lineTo(-12, 3);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffc357'; // accent yellow for engine particles
    for (let i = 0; i < 5; i++) {
      const particleX = -15 - Math.random() * 10 * intensity;
      const particleY = (Math.random() - 0.5) * 6;
      ctx.fillRect(particleX, particleY, 2, 1);
    }

    ctx.globalAlpha = 1.0;
  }

  private renderShieldEffects(renderer: IRenderer): void {
    const ctx = renderer.getContext();
    const shieldStrength = this.shields / this.maxShields;

    // 16-bit shield effects
    ctx.strokeStyle = '#52de44'; // accent green for shields
    ctx.lineWidth = 2;
    ctx.globalAlpha = shieldStrength * 0.3;

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

  public toggleSystem(systemType: ShipSystemType): void {
    const system = this.systems.get(systemType);
    if (system) {
      system.active = !system.active;
    }
  }

  public selectWeapon(weaponType: WeaponType): void {
    if (this.weapons.has(weaponType)) {
      this.selectedWeapon = weaponType;
    }
  }

  public getSystemStatus(systemType: ShipSystemType): ShipSystem | undefined {
    return this.systems.get(systemType);
  }

  public getWeaponStatus(weaponType: WeaponType): Weapon | undefined {
    return this.weapons.get(weaponType);
  }

  public takeDamage(amount: number): void {
    this.lastDamageTime = Date.now() / 1000; // Convert to seconds
    
    if (this.shields > 0) {
      // Shields absorb damage first
      const shieldDamage = Math.min(amount, this.shields);
      this.shields -= shieldDamage;
      amount -= shieldDamage;
      
      // Create shield hit effect
      const game = (window as any).game;
      if (game && game.effectSystem) {
        game.effectSystem.createEffect(EffectType.SHIELD_HIT, this.position, {
          intensity: shieldDamage / 50,
          impactPoint: this.position
        });
      }
    }
    
    if (amount > 0) {
      // Remaining damage goes to hull
      this.hull = Math.max(0, this.hull - amount);
      
      // Create hull damage effect
      const game = (window as any).game;
      if (game && game.effectSystem) {
        game.effectSystem.createEffect(EffectType.WEAPON_IMPACT, this.position, {
          intensity: amount / 30,
          size: 15
        });
      }
    }
  }

  public rechargeShields(deltaTime: number): void {
    const currentTime = Date.now() / 1000;
    
    // Only regenerate if enough time has passed since last damage
    if (currentTime - this.lastDamageTime >= this.shieldRegenDelay && this.shields < this.maxShields) {
      const regenAmount = this.shieldRegenRate * deltaTime;
      this.shields = Math.min(this.maxShields, this.shields + regenAmount);
      
      // Create shield regeneration effect occasionally
      if (Math.random() < 0.1) {
        const game = (window as any).game;
        if (game && game.effectSystem) {
          game.effectSystem.createEffect(EffectType.SHIELD_REGENERATE, this.position, {
            size: this.radius * 3
          });
        }
      }
    }
  }

  public canWarp(): boolean {
    return this.warpCharge >= this.maxWarpCharge && 
           this.energy >= 50 && 
           !this.isWarping &&
           this.fuel >= 20;
  }

  public initiateWarp(): void {
    if (!this.canWarp()) return;
    
    this.isWarping = true;
    this.energy -= 50;
    this.fuel -= 20;
    this.warpCharge = 0;
    
    // Create warp effect sequence
    const game = (window as any).game;
    if (game && game.effectSystem) {
      // Start with warp charge effect
      game.effectSystem.createEffect(EffectType.WARP_CHARGE, this.position);
      
      // After 3 seconds, create warp bubble effect
      setTimeout(() => {
        if (game.effectSystem) {
          game.effectSystem.createEffect(EffectType.WARP_BUBBLE, this.position);
          
          // Simulate warp jump (teleport to random location)
          setTimeout(() => {
            this.position.x += (Math.random() - 0.5) * 2000;
            this.position.y += (Math.random() - 0.5) * 2000;
            this.isWarping = false;
          }, 2000);
        }
      }, 3000);
    }
  }
}