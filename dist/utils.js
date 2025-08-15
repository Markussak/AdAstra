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
        width: 1920,
        height: 1080,
        pixelRatio: 1
    },
    ui: {
        statusBarHeight: 0.15
    },
    physics: {
        gravityStrength: 0.005,
        frictionFactor: 0.9995,
        maxVelocity: 500
    },
    colors: {
        bgPrimary: '#1a1a1a',
        hullPrimary: '#505050',
        hullSecondary: '#404040',
        accentFriendly: '#606060',
        accentHostile: '#404040',
        accentNeutral: '#404040',
        fxGlowPrimary: '#505050',
        fxGlowSecondary: '#404040'
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
            const factor = gameConfig.physics.maxVelocity / speed;
            object.velocity.x *= factor;
            object.velocity.y *= factor;
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