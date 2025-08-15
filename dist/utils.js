import { CharacterRace } from './types';
export const Vector2DUtils = {
    create: (x = 0, y = 0) => ({ x, y }),
    add: (a, b) => ({
        x: a.x + b.x,
        y: a.y + b.y
    }),
    subtract: (a, b) => ({
        x: a.x - b.x,
        y: a.y - b.y
    }),
    multiply: (v, scalar) => ({
        x: v.x * scalar,
        y: v.y * scalar
    }),
    magnitude: (v) => Math.sqrt(v.x * v.x + v.y * v.y),
    normalize: (v) => {
        const mag = Vector2DUtils.magnitude(v);
        return mag === 0 ? { x: 0, y: 0 } : { x: v.x / mag, y: v.y / mag };
    },
    distance: (a, b) => Vector2DUtils.magnitude(Vector2DUtils.subtract(b, a))
};
export const gameConfig = {
    canvas: {
        width: 1200,
        height: 800
    },
    physics: {
        gravityStrength: 0.005,
        frictionFactor: 0.9995,
        maxVelocity: 500
    },
    colors: {
        bgPrimary: '#000000',
        bgSecondary: '#0a0a0a',
        hullPrimary: '#5a6978',
        hullSecondary: '#434c55',
        hullDamaged: '#6d4c4c',
        accentFriendly: '#4a8a44',
        accentHostile: '#8a4444',
        accentNeutral: '#8a7a44',
        accentInfo: '#44708a',
        accentWarning: '#8a6a44',
        textPrimary: '#e8e8e8',
        textSecondary: '#b8b8b8',
        textDim: '#888888',
        textAmber: '#d4a574',
        textGreen: '#74a574',
        textRed: '#a57474',
        panelDark: '#1a1a1a',
        panelMid: '#2a2a2a',
        panelLight: '#3a3a3a',
        panelBorder: '#404040',
        panelShadow: '#0f0f0f',
        hudOverlay: 'rgba(0,0,0,0.7)',
        hudBorder: '#505050',
        hudBackground: '#1a1a1a',
        starDim: '#a8a8a8',
        starMid: '#c8c8c8',
        starBright: '#e8e8e8',
        nebulaBase: '#2a1a2a',
        nebulaAccent: '#3a2a3a',
        statusOk: '#60a060',
        statusWarning: '#a0a060',
        statusError: '#a06060',
        statusInfo: '#6080a0',
        statusInactive: '#404040',
        planetRocky: '#8a7a6a',
        planetOcean: '#5a7a8a',
        planetDesert: '#8a8a6a',
        planetIce: '#7a8a8a',
        planetGas: '#7a7a8a',
        starYellow: '#e8d8a8',
        starOrange: '#e8c8a8',
        starRed: '#e8a8a8',
        starBlue: '#a8c8e8',
        starWhite: '#e8e8e8'
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
        borderRadius: 0,
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
        pixelArt: true,
        smoothing: false,
        pixelScale: 1,
        dithering: true,
        scanlines: false,
        bloom: false,
        glowEffects: false,
        particleCount: 50,
        maxStars: 1000,
        renderDistance: 5000,
        lodLevels: 3
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
    static applyNewtonianMotion(object, deltaTime, friction = 0.9995) {
        object.position.x += object.velocity.x * deltaTime;
        object.position.y += object.velocity.y * deltaTime;
        const frictionFactor = Math.pow(friction, deltaTime);
        object.velocity.x *= frictionFactor;
        object.velocity.y *= frictionFactor;
        const speed = Math.sqrt(object.velocity.x ** 2 + object.velocity.y ** 2);
        if (speed > gameConfig.physics.maxVelocity) {
            const overspeed = speed - gameConfig.physics.maxVelocity;
            const dampingFactor = Math.exp(-overspeed * 0.01);
            const targetSpeed = gameConfig.physics.maxVelocity * dampingFactor + gameConfig.physics.maxVelocity * (1 - dampingFactor);
            const factor = targetSpeed / speed;
            object.velocity.x *= factor;
            object.velocity.y *= factor;
        }
        if (speed > 10) {
            const turbulence = speed * 0.0001;
            object.velocity.x += (Math.random() - 0.5) * turbulence * deltaTime;
            object.velocity.y += (Math.random() - 0.5) * turbulence * deltaTime;
        }
    }
    static applyGravity(object, gravitySources, deltaTime, gravityStrength = 0.005) {
        gravitySources.forEach(source => {
            const dx = source.position.x - object.position.x;
            const dy = source.position.y - object.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > source.radius) {
                const force = (source.mass * gravityStrength) / (distance * distance);
                const angle = Math.atan2(dy, dx);
                const accelX = Math.cos(angle) * force;
                const accelY = Math.sin(angle) * force;
                object.velocity.x += accelX * deltaTime;
                object.velocity.y += accelY * deltaTime;
                if (distance < source.radius * 3) {
                    const tidalStrength = 1.0 - (distance / (source.radius * 3));
                    const dampening = 1.0 - (tidalStrength * 0.02 * deltaTime);
                    object.velocity.x *= dampening;
                    object.velocity.y *= dampening;
                }
            }
        });
    }
    static applyAtmosphericDrag(object, atmosphere, deltaTime) {
        const dx = object.position.x - atmosphere.position.x;
        const dy = object.position.y - atmosphere.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < atmosphere.radius) {
            const altitudeRatio = distance / atmosphere.radius;
            const dragStrength = atmosphere.density * (1 - altitudeRatio);
            const speed = Math.sqrt(object.velocity.x ** 2 + object.velocity.y ** 2);
            if (speed > 0) {
                const dragFactor = 1.0 - (dragStrength * speed * deltaTime * 0.1);
                const clampedFactor = Math.max(0.9, dragFactor);
                object.velocity.x *= clampedFactor;
                object.velocity.y *= clampedFactor;
            }
        }
    }
    static calculateEscapeVelocity(mass, radius) {
        return Math.sqrt(2 * gameConfig.physics.gravityStrength * mass / radius);
    }
    static calculateOrbitalVelocity(mass, distance) {
        return Math.sqrt(gameConfig.physics.gravityStrength * mass / distance);
    }
    static checkCollision(obj1, obj2) {
        const dx = obj2.position.x - obj1.position.x;
        const dy = obj2.position.y - obj1.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (obj1.radius + obj2.radius);
    }
    static calculateDistance(pos1, pos2) {
        const dx = pos2.x - pos1.x;
        const dy = pos2.y - pos1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    static normalizeVector(vector) {
        const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
        if (magnitude === 0)
            return { x: 0, y: 0 };
        return { x: vector.x / magnitude, y: vector.y / magnitude };
    }
    static updateAngularPhysics(object, targetAngularVelocity, deltaTime, inertia = 1.0) {
        if (object.angularVelocity === undefined) {
            object.angularVelocity = 0;
        }
        const angularAccel = (targetAngularVelocity - object.angularVelocity) / inertia;
        object.angularVelocity += angularAccel * deltaTime;
        object.angularVelocity *= Math.pow(0.995, deltaTime);
        object.angle += object.angularVelocity * deltaTime;
    }
    static applyThrustWithInertia(object, thrustMagnitude, mass, deltaTime) {
        const acceleration = thrustMagnitude / mass;
        const thrustX = Math.cos(object.angle) * acceleration;
        const thrustY = Math.sin(object.angle) * acceleration;
        object.velocity.x += thrustX * deltaTime;
        object.velocity.y += thrustY * deltaTime;
    }
    static applyGyroscopicEffects(object, deltaTime) {
        const speed = Math.sqrt(object.velocity.x ** 2 + object.velocity.y ** 2);
        if (speed > 50 && object.angularVelocity !== undefined) {
            const gyroscopicFactor = Math.min(0.5, speed / 200);
            const velocityAngle = Math.atan2(object.velocity.y, object.velocity.x);
            const angleDiff = velocityAngle - object.angle;
            let normalizedDiff = angleDiff;
            while (normalizedDiff > Math.PI)
                normalizedDiff -= Math.PI * 2;
            while (normalizedDiff < -Math.PI)
                normalizedDiff += Math.PI * 2;
            const gyroscopicTorque = normalizedDiff * gyroscopicFactor * deltaTime;
            object.angularVelocity += gyroscopicTorque * 0.1;
        }
    }
}
export class SeededRandom {
    constructor(seed) {
        this.seed = seed;
    }
    next() {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }
    nextInt(min, max) {
        return Math.floor(this.next() * (max - min + 1)) + min;
    }
    nextFloat(min, max) {
        return this.next() * (max - min) + min;
    }
    choose(array) {
        return array[Math.floor(this.next() * array.length)];
    }
}
export class MathUtils {
    static clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
    static lerp(a, b, t) {
        return a + (b - a) * t;
    }
    static smoothstep(edge0, edge1, x) {
        const t = MathUtils.clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
        return t * t * (3.0 - 2.0 * t);
    }
    static radToDeg(radians) {
        return radians * (180 / Math.PI);
    }
    static degToRad(degrees) {
        return degrees * (Math.PI / 180);
    }
    static angleToVector(angle) {
        return {
            x: Math.cos(angle),
            y: Math.sin(angle)
        };
    }
    static vectorToAngle(vector) {
        return Math.atan2(vector.y, vector.x);
    }
    static wrap(value, min, max) {
        const range = max - min;
        if (range <= 0)
            return min;
        let result = value;
        while (result < min)
            result += range;
        while (result >= max)
            result -= range;
        return result;
    }
}
export class TimeUtils {
    static getTime() {
        return Date.now();
    }
    static getGameTime() {
        return (Date.now() - TimeUtils.startTime) / 1000;
    }
    static formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
TimeUtils.startTime = Date.now();
export class ColorUtils {
    static hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    static rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
    static interpolateColor(color1, color2, factor) {
        const rgb1 = ColorUtils.hexToRgb(color1);
        const rgb2 = ColorUtils.hexToRgb(color2);
        if (!rgb1 || !rgb2)
            return color1;
        const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * factor);
        const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * factor);
        const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * factor);
        return ColorUtils.rgbToHex(r, g, b);
    }
    static addAlpha(color, alpha) {
        const rgb = ColorUtils.hexToRgb(color);
        if (!rgb)
            return color;
        return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
    }
}
export class NameGenerator {
    static generateRandomName(race) {
        const data = this.nameData[race];
        if (!data)
            return 'Unnamed';
        const prefix = data.prefixes[Math.floor(Math.random() * data.prefixes.length)];
        const suffix = data.suffixes[Math.floor(Math.random() * data.suffixes.length)];
        return prefix + suffix;
    }
}
NameGenerator.nameData = {
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
//# sourceMappingURL=utils.js.map