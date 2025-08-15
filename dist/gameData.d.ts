import { ShipTemplate, ShipType } from './types';
export declare const SHIP_TEMPLATES: Record<ShipType, ShipTemplate>;
export declare const DIFFICULTY_SETTINGS: {
    easy: {
        name: string;
        description: string;
        multipliers: {
            resourceMultiplier: number;
            damageMultiplier: number;
            experienceMultiplier: number;
            fuelConsumption: number;
        };
        startingResources: {
            fuel: number;
            energy: number;
            credits: number;
        };
    };
    normal: {
        name: string;
        description: string;
        multipliers: {
            resourceMultiplier: number;
            damageMultiplier: number;
            experienceMultiplier: number;
            fuelConsumption: number;
        };
        startingResources: {
            fuel: number;
            energy: number;
            credits: number;
        };
    };
    hard: {
        name: string;
        description: string;
        multipliers: {
            resourceMultiplier: number;
            damageMultiplier: number;
            experienceMultiplier: number;
            fuelConsumption: number;
        };
        startingResources: {
            fuel: number;
            energy: number;
            credits: number;
        };
    };
    extreme: {
        name: string;
        description: string;
        multipliers: {
            resourceMultiplier: number;
            damageMultiplier: number;
            experienceMultiplier: number;
            fuelConsumption: number;
        };
        startingResources: {
            fuel: number;
            energy: number;
            credits: number;
        };
    };
};
export declare const LOADING_MESSAGES: string[];
export declare const MENU_MUSIC_TRACKS: string[];
export declare const WEAPON_DATA: {
    laser: {
        name: string;
        description: string;
        damage: number;
        range: number;
        energyCost: number;
        fireRate: number;
        rarity: string;
        cost: number;
    };
    pulseLaser: {
        name: string;
        description: string;
        damage: number;
        range: number;
        energyCost: number;
        fireRate: number;
        rarity: string;
        cost: number;
    };
    beamLaser: {
        name: string;
        description: string;
        damage: number;
        range: number;
        energyCost: number;
        fireRate: number;
        rarity: string;
        cost: number;
    };
    missiles: {
        name: string;
        description: string;
        damage: number;
        range: number;
        energyCost: number;
        fireRate: number;
        ammo: number;
        rarity: string;
        cost: number;
    };
    torpedo: {
        name: string;
        description: string;
        damage: number;
        range: number;
        energyCost: number;
        fireRate: number;
        ammo: number;
        rarity: string;
        cost: number;
    };
    railgun: {
        name: string;
        description: string;
        damage: number;
        range: number;
        energyCost: number;
        fireRate: number;
        rarity: string;
        cost: number;
    };
    plasmaCannon: {
        name: string;
        description: string;
        damage: number;
        range: number;
        energyCost: number;
        fireRate: number;
        rarity: string;
        cost: number;
    };
    ionBeam: {
        name: string;
        description: string;
        damage: number;
        range: number;
        energyCost: number;
        fireRate: number;
        rarity: string;
        cost: number;
    };
    flakCannon: {
        name: string;
        description: string;
        damage: number;
        range: number;
        energyCost: number;
        fireRate: number;
        rarity: string;
        cost: number;
    };
    empWeapon: {
        name: string;
        description: string;
        damage: number;
        range: number;
        energyCost: number;
        fireRate: number;
        rarity: string;
        cost: number;
    };
    miningLaser: {
        name: string;
        description: string;
        damage: number;
        range: number;
        energyCost: number;
        fireRate: number;
        rarity: string;
        cost: number;
    };
};
export declare const QUEST_DIFFICULTY_COLORS: {
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
};
export declare const SHIP_RARITY_COLORS: {
    common: string;
    uncommon: string;
    rare: string;
    legendary: string;
};
export declare const CREDITS_TEXT = "\nSTAR DUST VOYAGER: GALAXY WANDERER\n\nVytvo\u0159eno s l\u00E1skou ke sci-fi\n\n--- V\u00DDVOJOV\u00DD T\u00DDM ---\n\u2022 Programov\u00E1n\u00ED: Claude AI & Human Developer\n\u2022 Design: Inspirov\u00E1no klasick\u00FDmi space opera hrami\n\u2022 Hudba: Syntezovan\u00E9 vesm\u00EDrn\u00E9 melodie\n\u2022 Grafika: Retro pixel art styl\n\n--- SPECI\u00C1LN\u00CD POD\u011AKOV\u00C1N\u00CD ---\n\u2022 Elite: Dangerous za inspiraci\n\u2022 Star Citizen za vizi budoucnosti\n\u2022 EVE Online za komplexnost\n\u2022 No Man's Sky za nekone\u010Dnost\n\n--- TECHNOLOGIE ---\n\u2022 TypeScript\n\u2022 HTML5 Canvas\n\u2022 Web Audio API\n\u2022 Modern ES6+ Features\n\nVerze 2.0.0\n\u00A9 2024 Space Explorer Development Team\n\n--- OVL\u00C1D\u00C1N\u00CD ---\nWASD / \u0160ipky: Pohyb\nMEZERN\u00CDK: St\u0159elba\nESC: Menu\nTAB: Invent\u00E1\u0159\nM: Mapa\n\nU\u017Eijte si svou cestu mezi hv\u011Bzdami!\n";
