// utils.ts - Utility functions and static classes

import { Vector2D, GameConfig, CharacterRace } from './types';

export const Vector2DUtils = {
  create: (x: number = 0, y: number = 0): Vector2D => ({ x, y }),

  add: (a: Vector2D, b: Vector2D): Vector2D => ({
    x: a.x + b.x,
    y: a.y + b.y
  }),

  subtract: (a: Vector2D, b: Vector2D): Vector2D => ({
    x: a.x - b.x,
    y: a.y - b.y
  }),

  multiply: (v: Vector2D, scalar: number): Vector2D => ({
    x: v.x * scalar,
    y: v.y * scalar
  }),

  magnitude: (v: Vector2D): number =>
    Math.sqrt(v.x * v.x + v.y * v.y),

  normalize: (v: Vector2D): Vector2D => {
    const mag = Vector2DUtils.magnitude(v);
    return mag === 0 ? { x: 0, y: 0 } : { x: v.x / mag, y: v.y / mag };
  },

  distance: (a: Vector2D, b: Vector2D): number =>
    Vector2DUtils.magnitude(Vector2DUtils.subtract(b, a))
};

export const gameConfig = {
  canvas: {
    width: 1200,
    height: 800
  },
  physics: {
    gravityStrength: 0.005, // Increased for more noticeable effects
    frictionFactor: 0.9995, // Better space vacuum simulation
    maxVelocity: 500
  },
  colors: {
    // Enhanced retro 16-bit color palette - no neon, subtle and atmospheric
    bgPrimary: '#000000',            // Pure black space background
    bgSecondary: '#0a0a0a',          // Deep space black
    
    // Ship and chassis colors - muted retro tones
    hullPrimary: '#5a6978',          // Muted blue-gray hull
    hullSecondary: '#434c55',        // Darker hull accent
    hullDamaged: '#6d4c4c',          // Subtle red tint for damage
    
    // Retro accent colors - desaturated and subtle
    accentFriendly: '#4a8a44',       // Muted green
    accentHostile: '#8a4444',        // Muted red
    accentNeutral: '#8a7a44',        // Muted yellow/amber
    accentInfo: '#44708a',           // Muted blue
    accentWarning: '#8a6a44',        // Muted orange
    
    // Text colors - classic computer terminal style
    textPrimary: '#e8e8e8',          // Off-white text
    textSecondary: '#b8b8b8',        // Light gray text
    textDim: '#888888',              // Dim gray text
    textAmber: '#d4a574',            // Muted amber (not bright)
    textGreen: '#74a574',            // Muted green (not bright)
    textRed: '#a57474',              // Muted red (not bright)
    
    // UI panel colors - industrial and retro
    panelDark: '#1a1a1a',            // Dark panel background
    panelMid: '#2a2a2a',             // Mid-tone panel
    panelLight: '#3a3a3a',           // Light panel accent
    panelBorder: '#404040',          // Panel borders
    panelShadow: '#0f0f0f',          // Panel shadows
    
    // HUD and interface colors
    hudOverlay: 'rgba(0,0,0,0.7)',   // Semi-transparent overlay
    hudBorder: '#505050',            // HUD element borders
    hudBackground: '#1a1a1a',        // HUD background
    
    // Star and space colors
    starDim: '#a8a8a8',              // Dim distant stars
    starMid: '#c8c8c8',              // Medium stars
    starBright: '#e8e8e8',           // Bright nearby stars
    nebulaBase: '#2a1a2a',           // Base nebula color (dark purple)
    nebulaAccent: '#3a2a3a',         // Nebula accent (slightly lighter)
    
    // Status and system colors - muted versions
    statusOk: '#60a060',             // Muted green for OK status
    statusWarning: '#a0a060',        // Muted yellow for warnings
    statusError: '#a06060',          // Muted red for errors
    statusInfo: '#6080a0',           // Muted blue for info
    statusInactive: '#404040',       // Gray for inactive
    
    // Planet and celestial body colors
    planetRocky: '#8a7a6a',          // Rocky planet base
    planetOcean: '#5a7a8a',          // Ocean world base
    planetDesert: '#8a8a6a',         // Desert world base
    planetIce: '#7a8a8a',            // Ice world base
    planetGas: '#7a7a8a',            // Gas giant base
    
    // Star colors - realistic but muted
    starYellow: '#e8d8a8',           // Yellow star
    starOrange: '#e8c8a8',           // Orange star
    starRed: '#e8a8a8',              // Red star
    starBlue: '#a8c8e8',             // Blue star
    starWhite: '#e8e8e8'             // White star
  },
  ui: {
    statusBarHeight: 0.15,
    fontSize: {
      small: '8px',
      normal: '10px', 
      large: '12px',
      title: '16px'
    },
    fontFamily: '"Big Apple 3PM", monospace',
    borderRadius: 0, // Sharp corners for retro feel
    lineHeight: 1.2,
    padding: {
      small: 4,
      normal: 8,
      large: 16
    }
  },
  audio: {
    enabled: true,
    volume: 0.7,
    sfxVolume: 0.5,
    musicVolume: 0.3
  },
  graphics: {
    pixelArt: true,                  // Enable pixel-perfect rendering
    smoothing: false,                // Disable anti-aliasing for crisp pixels
    pixelScale: 1,                   // Base pixel scale
    dithering: true,                 // Enable dithering for retro effect
    scanlines: false,                // Disable scanlines (too modern/CRT)
    bloom: false,                    // Disable bloom effects
    glowEffects: false,              // Disable glow effects
    particleCount: 50,               // Reduced particles for retro feel
    maxStars: 1000,                  // Star count for backgrounds
    renderDistance: 5000,            // Maximum render distance
    lodLevels: 3                     // Number of Level-of-Detail levels
  },
  gameplay: {
    startingSystem: 'Sol',
    startingCredits: 1000,
    startingFuel: 100,
    warpCost: 10,
    baseSpeed: 100,
    turnSpeed: 3.0,
    thrustPower: 200
  }
};

export class PhysicsEngine {
  static applyNewtonianMotion(
    object: { position: Vector2D; velocity: Vector2D },
    deltaTime: number,
    friction: number = 0.9995
  ): void {
    // Apply velocity to position with enhanced precision
    object.position.x += object.velocity.x * deltaTime;
    object.position.y += object.velocity.y * deltaTime;

    // Apply very minimal friction (space is mostly vacuum)
    const frictionFactor = Math.pow(friction, deltaTime);
    object.velocity.x *= frictionFactor;
    object.velocity.y *= frictionFactor;

    // Enhanced velocity limiting with smooth curves for realistic feel
    const speed = Math.sqrt(object.velocity.x ** 2 + object.velocity.y ** 2);
    if (speed > gameConfig.physics.maxVelocity) {
      // Smooth velocity capping to prevent jarring stops
      const overspeed = speed - gameConfig.physics.maxVelocity;
      const dampingFactor = Math.exp(-overspeed * 0.01); // Exponential decay
      const targetSpeed = gameConfig.physics.maxVelocity * dampingFactor + gameConfig.physics.maxVelocity * (1 - dampingFactor);
      const factor = targetSpeed / speed;
      object.velocity.x *= factor;
      object.velocity.y *= factor;
    }

    // Apply micro-turbulence for realistic space movement
    if (speed > 10) {
      const turbulence = speed * 0.0001;
      object.velocity.x += (Math.random() - 0.5) * turbulence * deltaTime;
      object.velocity.y += (Math.random() - 0.5) * turbulence * deltaTime;
    }
  }

  static applyGravity(
    object: { position: Vector2D; velocity: Vector2D },
    gravitySources: Array<{ position: Vector2D; mass: number; radius: number }>,
    deltaTime: number,
    gravityStrength: number = 0.005
  ): void {
    gravitySources.forEach(source => {
      const dx = source.position.x - object.position.x;
      const dy = source.position.y - object.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Only apply gravity if not inside the celestial body
      if (distance > source.radius) {
        // More realistic gravity calculation: F = G * m1 * m2 / r^2
        // Simplified with mass scaling for game balance
        const force = (source.mass * gravityStrength) / (distance * distance);
        const angle = Math.atan2(dy, dx);
        
        // Apply gravitational acceleration (F = ma, a = F/m, assuming ship mass = 1)
        const accelX = Math.cos(angle) * force;
        const accelY = Math.sin(angle) * force;
        
        object.velocity.x += accelX * deltaTime;
        object.velocity.y += accelY * deltaTime;

        // Enhanced effects for very close approaches
        if (distance < source.radius * 3) {
          // Tidal effects - slight velocity dampening near massive objects
          const tidalStrength = 1.0 - (distance / (source.radius * 3));
          const dampening = 1.0 - (tidalStrength * 0.02 * deltaTime);
          object.velocity.x *= dampening;
          object.velocity.y *= dampening;
        }
      }
    });
  }

  static applyAtmosphericDrag(
    object: { position: Vector2D; velocity: Vector2D },
    atmosphere: { position: Vector2D; radius: number; density: number },
    deltaTime: number
  ): void {
    const dx = object.position.x - atmosphere.position.x;
    const dy = object.position.y - atmosphere.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Apply drag if inside atmosphere
    if (distance < atmosphere.radius) {
      const altitudeRatio = distance / atmosphere.radius;
      const dragStrength = atmosphere.density * (1 - altitudeRatio);
      
      // Drag opposes velocity (quadratic drag: F = -k * v^2)
      const speed = Math.sqrt(object.velocity.x ** 2 + object.velocity.y ** 2);
      if (speed > 0) {
        const dragFactor = 1.0 - (dragStrength * speed * deltaTime * 0.1);
        const clampedFactor = Math.max(0.9, dragFactor); // Minimum to prevent stopping
        
        object.velocity.x *= clampedFactor;
        object.velocity.y *= clampedFactor;
      }
    }
  }

  static calculateEscapeVelocity(mass: number, radius: number): number {
    // v_escape = sqrt(2 * G * M / r) - simplified for game use
    return Math.sqrt(2 * gameConfig.physics.gravityStrength * mass / radius);
  }

  static calculateOrbitalVelocity(mass: number, distance: number): number {
    // v_orbital = sqrt(G * M / r) - simplified for game use
    return Math.sqrt(gameConfig.physics.gravityStrength * mass / distance);
  }

  static checkCollision(
    obj1: { position: Vector2D; radius: number },
    obj2: { position: Vector2D; radius: number }
  ): boolean {
    const dx = obj2.position.x - obj1.position.x;
    const dy = obj2.position.y - obj1.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (obj1.radius + obj2.radius);
  }

  static calculateDistance(pos1: Vector2D, pos2: Vector2D): number {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  static normalizeVector(vector: Vector2D): Vector2D {
    const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    if (magnitude === 0) return { x: 0, y: 0 };
    return { x: vector.x / magnitude, y: vector.y / magnitude };
  }

  // Enhanced inertia effects for ships
  static updateAngularPhysics(
    object: { angle: number; angularVelocity?: number }, 
    targetAngularVelocity: number, 
    deltaTime: number, 
    inertia: number = 1.0
  ): void {
    // Initialize angularVelocity if it doesn't exist
    if (object.angularVelocity === undefined) {
      object.angularVelocity = 0;
    }
    
    // Angular acceleration to reach target velocity
    const angularAccel = (targetAngularVelocity - object.angularVelocity) / inertia;
    object.angularVelocity += angularAccel * deltaTime;

    // Apply angular friction
    object.angularVelocity *= Math.pow(0.995, deltaTime);

    // Update angle
    object.angle += object.angularVelocity * deltaTime;
  }

  static applyThrustWithInertia(
    object: { position: Vector2D; velocity: Vector2D; angle: number },
    thrustMagnitude: number,
    mass: number,
    deltaTime: number
  ): void {
    // Calculate thrust acceleration (F = ma, a = F/m)
    const acceleration = thrustMagnitude / mass;
    
    // Apply thrust in ship's facing direction
    const thrustX = Math.cos(object.angle) * acceleration;
    const thrustY = Math.sin(object.angle) * acceleration;
    
    object.velocity.x += thrustX * deltaTime;
    object.velocity.y += thrustY * deltaTime;
  }

  static applyGyroscopicEffects(
    object: { velocity: Vector2D; angle: number; angularVelocity?: number },
    deltaTime: number
  ): void {
    // Simulate gyroscopic effects - resistance to angular changes when moving fast
    const speed = Math.sqrt(object.velocity.x ** 2 + object.velocity.y ** 2);
    
    if (speed > 50 && object.angularVelocity !== undefined) {
      const gyroscopicFactor = Math.min(0.5, speed / 200); // Stronger effect at higher speeds
      const velocityAngle = Math.atan2(object.velocity.y, object.velocity.x);
      const angleDiff = velocityAngle - object.angle;
      
      // Normalize angle difference
      let normalizedDiff = angleDiff;
      while (normalizedDiff > Math.PI) normalizedDiff -= Math.PI * 2;
      while (normalizedDiff < -Math.PI) normalizedDiff += Math.PI * 2;
      
      // Apply gyroscopic force that tries to align ship with velocity
      const gyroscopicTorque = normalizedDiff * gyroscopicFactor * deltaTime;
      object.angularVelocity += gyroscopicTorque * 0.1;
    }
  }
}

export class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  choose<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)];
  }
}

export class MathUtils {
  static clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  static lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  static smoothstep(edge0: number, edge1: number, x: number): number {
    const t = MathUtils.clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
    return t * t * (3.0 - 2.0 * t);
  }

  static radToDeg(radians: number): number {
    return radians * (180 / Math.PI);
  }

  static degToRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  static angleToVector(angle: number): Vector2D {
    return {
      x: Math.cos(angle),
      y: Math.sin(angle)
    };
  }

  static vectorToAngle(vector: Vector2D): number {
    return Math.atan2(vector.y, vector.x);
  }

  static wrap(value: number, min: number, max: number): number {
    const range = max - min;
    if (range <= 0) return min;

    let result = value;
    while (result < min) result += range;
    while (result >= max) result -= range;
    return result;
  }
}

export class TimeUtils {
  private static startTime: number = Date.now();

  static getTime(): number {
    return Date.now();
  }

  static getGameTime(): number {
    return (Date.now() - TimeUtils.startTime) / 1000;
  }

  static formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export class ColorUtils {
  static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  static rgbToHex(r: number, g: number, b: number): string {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  static interpolateColor(color1: string, color2: string, factor: number): string {
    const rgb1 = ColorUtils.hexToRgb(color1);
    const rgb2 = ColorUtils.hexToRgb(color2);

    if (!rgb1 || !rgb2) return color1;

    const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * factor);
    const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * factor);
    const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * factor);

    return ColorUtils.rgbToHex(r, g, b);
  }

  static addAlpha(color: string, alpha: number): string {
    const rgb = ColorUtils.hexToRgb(color);
    if (!rgb) return color;

    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  }
}

// Random name generator for different races
export class NameGenerator {
  private static nameData = {
    [CharacterRace.HUMAN]: {
      prefixes: ['Jan', 'Anna', 'Petr', 'Marie', 'Tom', 'Eva', 'Alex', 'Sara', 'Mike', 'Lisa'],
      suffixes: ['ová', 'ek', 'ský', 'son', 'ington', 'berg', 'feld', 'stone', 'wood', 'nova']
    },
    [CharacterRace.TERRAN]: {
      prefixes: ['Neo', 'Cyber', 'Tech', 'Quantum', 'Matrix', 'Prime', 'Core', 'Vox', 'Zero', 'Flux'],
      suffixes: ['X1', 'Alpha', 'Beta', 'Prime', 'Core', 'Tech', 'Link', 'Node', 'Grid', 'Sync']
    },
    [CharacterRace.ZEPHYRIAN]: {
      prefixes: ['Aer', 'Zeph', 'Gale', 'Storm', 'Wind', 'Sky', 'Cloud', 'Breeze', 'Tempest', 'Vento'],
      suffixes: ['ian', 'ara', 'iel', 'yn', 'os', 'eira', 'wyn', 'an', 'el', 'or']
    },
    [CharacterRace.CRYSTALLINE]: {
      prefixes: ['Crys', 'Shard', 'Prism', 'Quartz', 'Gem', 'Crystal', 'Facet', 'Gleam', 'Shine', 'Spark'],
      suffixes: ['ine', 'tal', 'ion', 'ite', 'ium', 'yl', 'as', 'en', 'or', 'is']
    },
    [CharacterRace.VORTHAN]: {
      prefixes: ['Vor', 'Grak', 'Thul', 'Brak', 'Krog', 'Thar', 'Grok', 'Zul', 'Mor', 'Drak'],
      suffixes: ['than', 'gul', 'rok', 'tar', 'gor', 'nul', 'var', 'kul', 'dar', 'mul']
    },
    [CharacterRace.AQUARIAN]: {
      prefixes: ['Aqua', 'Mari', 'Ocean', 'Coral', 'Pearl', 'Wave', 'Tide', 'Flow', 'Stream', 'Bay'],
      suffixes: ['ina', 'ian', 'elle', 'ara', 'iel', 'yn', 'ena', 'lia', 'ana', 'ira']
    },
    [CharacterRace.MECHANO]: {
      prefixes: ['Mech', 'Gear', 'Steel', 'Iron', 'Bolt', 'Circuit', 'Wire', 'Motor', 'Engine', 'Servo'],
      suffixes: ['ano', 'oid', 'tron', 'mech', 'gear', 'tech', 'bot', 'droid', 'unit', 'core']
    },
    [CharacterRace.ETHEREAL]: {
      prefixes: ['Ether', 'Spirit', 'Ghost', 'Phantom', 'Mystic', 'Astral', 'Void', 'Echo', 'Mist', 'Shade'],
      suffixes: ['eal', 'iel', 'ara', 'yn', 'os', 'an', 'el', 'or', 'is', 'as']
    },
    [CharacterRace.DRAKONID]: {
      prefixes: ['Drax', 'Scal', 'Fang', 'Claw', 'Fire', 'Flame', 'Ember', 'Scale', 'Wing', 'Talon'],
      suffixes: ['id', 'on', 'ar', 'or', 'ul', 'ak', 'ix', 'ax', 'ex', 'ok']
    },
    [CharacterRace.SYLVAN]: {
      prefixes: ['Syl', 'Leaf', 'Branch', 'Root', 'Moss', 'Fern', 'Oak', 'Pine', 'Willow', 'Birch'],
      suffixes: ['van', 'iel', 'ara', 'wyn', 'en', 'or', 'an', 'el', 'yn', 'is']
    }
  };

  public static generateRandomName(race: CharacterRace): string {
    const data = this.nameData[race];
    if (!data) return 'Unnamed';

    const prefix = data.prefixes[Math.floor(Math.random() * data.prefixes.length)];
    const suffix = data.suffixes[Math.floor(Math.random() * data.suffixes.length)];
    
    return prefix + suffix;
  }
}