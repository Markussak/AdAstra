import { DifficultyLevel, ShipType, WeaponType } from './types';
export const SHIP_TEMPLATES = {
    [ShipType.SCOUT]: {
        type: ShipType.SCOUT,
        name: 'Scout Vessel',
        description: 'Rychlá a obratná loď určená pro průzkum. Vynikající pro rychlé manévrování a vyhýbání se nebezpečí.',
        baseStats: {
            hull: 75,
            shields: 60,
            speed: 150,
            cargo: 300
        },
        weapons: [WeaponType.LASER],
        specialAbilities: ['Rychlá regenerace energie', 'Pokročilé senzory'],
        rarity: 'common',
        cost: 15000
    },
    [ShipType.FIGHTER]: {
        type: ShipType.FIGHTER,
        name: 'Combat Fighter',
        description: 'Bojová loď optimalizovaná pro souboje. Silné zbraně a dobrá obranyschopnost.',
        baseStats: {
            hull: 100,
            shields: 100,
            speed: 100,
            cargo: 200
        },
        weapons: [WeaponType.LASER, WeaponType.MISSILES],
        specialAbilities: ['Zvýšená firepower', 'Pancéřování'],
        rarity: 'common',
        cost: 25000
    },
    [ShipType.EXPLORER]: {
        type: ShipType.EXPLORER,
        name: 'Deep Space Explorer',
        description: 'Vybalancovaná loď pro dlouhé cesty. Dobrá kombinace všech schopností.',
        baseStats: {
            hull: 90,
            shields: 80,
            speed: 110,
            cargo: 500
        },
        weapons: [WeaponType.LASER, WeaponType.MINING_LASER],
        specialAbilities: ['Efektivní spotřeba paliva', 'Univerzálnost'],
        rarity: 'common',
        cost: 30000
    },
    [ShipType.CARGO]: {
        type: ShipType.CARGO,
        name: 'Cargo Hauler',
        description: 'Obchodní loď s velkým nákladovým prostorem. Ideální pro přepravu zboží.',
        baseStats: {
            hull: 120,
            shields: 70,
            speed: 80,
            cargo: 1000
        },
        weapons: [WeaponType.LASER],
        specialAbilities: ['Masivní nákladový prostor', 'Ekonomické motory'],
        rarity: 'common',
        cost: 40000
    },
    [ShipType.BATTLESHIP]: {
        type: ShipType.BATTLESHIP,
        name: 'Heavy Battleship',
        description: 'Těžká bojová loď s maximální ničivou silou. Pro zkušené piloty.',
        baseStats: {
            hull: 150,
            shields: 120,
            speed: 70,
            cargo: 400
        },
        weapons: [WeaponType.LASER, WeaponType.MISSILES, WeaponType.RAILGUN],
        specialAbilities: ['Devastující firepower', 'Těžké pancéřování', 'Pokročilé zbraňové systémy'],
        rarity: 'uncommon',
        cost: 75000
    },
    [ShipType.INTERCEPTOR]: {
        type: ShipType.INTERCEPTOR,
        name: 'Lightning Interceptor',
        description: 'Nejrychlejší loď v galaxii. Speciální design pro rychlé útoky a úniky.',
        baseStats: {
            hull: 60,
            shields: 40,
            speed: 200,
            cargo: 150
        },
        weapons: [WeaponType.PULSE_LASER, WeaponType.ION_BEAM],
        specialAbilities: ['Maximální rychlost', 'Stealth cloak', 'Afterburner'],
        rarity: 'rare',
        cost: 50000
    },
    [ShipType.CRUISER]: {
        type: ShipType.CRUISER,
        name: 'Star Cruiser',
        description: 'Velkotřídní válečná loď s vynikající výzbrojí a obranou.',
        baseStats: {
            hull: 180,
            shields: 150,
            speed: 90,
            cargo: 600
        },
        weapons: [WeaponType.PLASMA_CANNON, WeaponType.TORPEDO, WeaponType.FLAK_CANNON],
        specialAbilities: ['Těžká výzbroj', 'Regenerativní štíty', 'Taktické systémy'],
        rarity: 'rare',
        cost: 120000
    },
    [ShipType.DREADNOUGHT]: {
        type: ShipType.DREADNOUGHT,
        name: 'Titan Dreadnought',
        description: 'Ultimátní válečná mašina. Neprostupné pancéřování a devastující firepower.',
        baseStats: {
            hull: 250,
            shields: 200,
            speed: 50,
            cargo: 800
        },
        weapons: [WeaponType.PLASMA_CANNON, WeaponType.RAILGUN, WeaponType.TORPEDO, WeaponType.EMP_WEAPON],
        specialAbilities: ['Neproniknutelná obrana', 'Supersonic weapony', 'Flotilní velení'],
        rarity: 'legendary',
        cost: 300000
    },
    [ShipType.STEALTH]: {
        type: ShipType.STEALTH,
        name: 'Shadow Infiltrator',
        description: 'Neviditelná loď pro tajné mise. Pokročilá stealth technologie a tichá zbraňové systémy.',
        baseStats: {
            hull: 70,
            shields: 60,
            speed: 130,
            cargo: 250
        },
        weapons: [WeaponType.ION_BEAM, WeaponType.EMP_WEAPON],
        specialAbilities: ['Pokročilý stealth', 'Tichá výzbroj', 'Elektronické rušení'],
        rarity: 'rare',
        cost: 85000
    },
    [ShipType.MINING]: {
        type: ShipType.MINING,
        name: 'Industrial Miner',
        description: 'Specializovaná těžební loď s pokročilými mining systémy a velkým úložištěm.',
        baseStats: {
            hull: 140,
            shields: 90,
            speed: 60,
            cargo: 1500
        },
        weapons: [WeaponType.MINING_LASER, WeaponType.BEAM_LASER],
        specialAbilities: ['Pokročilé mining systémy', 'Automatické zpracování', 'Asteroid scanning'],
        rarity: 'uncommon',
        cost: 65000
    }
};
export const DIFFICULTY_SETTINGS = {
    [DifficultyLevel.EASY]: {
        name: 'Průzkumník',
        description: 'Ideální pro nové piloty. Více zdrojů, snížená obtížnost.',
        multipliers: {
            resourceMultiplier: 1.5,
            damageMultiplier: 0.7,
            experienceMultiplier: 0.8,
            fuelConsumption: 0.8
        },
        startingResources: {
            fuel: 100,
            energy: 100,
            credits: 2000
        }
    },
    [DifficultyLevel.NORMAL]: {
        name: 'Pilot',
        description: 'Standardní herní zážitek. Vybalancované výzvy a odměny.',
        multipliers: {
            resourceMultiplier: 1.0,
            damageMultiplier: 1.0,
            experienceMultiplier: 1.0,
            fuelConsumption: 1.0
        },
        startingResources: {
            fuel: 75,
            energy: 90,
            credits: 1000
        }
    },
    [DifficultyLevel.HARD]: {
        name: 'Veterán',
        description: 'Pro zkušené piloty. Vyšší obtížnost, ale větší odměny.',
        multipliers: {
            resourceMultiplier: 0.8,
            damageMultiplier: 1.3,
            experienceMultiplier: 1.2,
            fuelConsumption: 1.2
        },
        startingResources: {
            fuel: 60,
            energy: 70,
            credits: 500
        }
    },
    [DifficultyLevel.EXTREME]: {
        name: 'Legenda',
        description: 'Pouze pro mistry vesmíru. Extrémní výzva.',
        multipliers: {
            resourceMultiplier: 0.6,
            damageMultiplier: 1.5,
            experienceMultiplier: 1.5,
            fuelConsumption: 1.5
        },
        startingResources: {
            fuel: 50,
            energy: 60,
            credits: 300
        }
    }
};
export const LOADING_MESSAGES = [
    'INICIALIZACE KVANTOVÉ MATRICE...',
    'KALIBRACE NAVIGAČNÍCH POLÍ...',
    'NAČÍTÁNÍ HVĚZDNÉ KARTOGRAFIE...',
    'SYNCHRONIZACE WARP JÁDRA...',
    'AKTIVACE ŽIVOTNÍCH SYSTÉMŮ...',
    'NAVAZOVÁNÍ KOMUNIKAČNÍCH KANÁLŮ...',
    'SPUŠTĚNÍ DIAGNOSTIKY SYSTÉMŮ...',
    'KVANTOVÝ POHON PŘIPRAVEN',
    'VŠECHNY SYSTÉMY ONLINE',
    'PŘÍPRAVA NA VZLET...'
];
export const MENU_MUSIC_TRACKS = [
    'cosmic_voyage.ogg',
    'stellar_winds.ogg',
    'nebula_dreams.ogg'
];
export const WEAPON_DATA = {
    [WeaponType.LASER]: {
        name: 'Standard Laser',
        description: 'Základní energetická zbraň. Spolehlivá a efektivní.',
        damage: 25,
        range: 500,
        energyCost: 5,
        fireRate: 0.2,
        rarity: 'common',
        cost: 2000
    },
    [WeaponType.PULSE_LASER]: {
        name: 'Pulse Laser',
        description: 'Rychlofirná verze laseru s vyšší kadencí střelby.',
        damage: 20,
        range: 450,
        energyCost: 4,
        fireRate: 0.1,
        rarity: 'common',
        cost: 3500
    },
    [WeaponType.BEAM_LASER]: {
        name: 'Beam Laser',
        description: 'Kontinuální paprskový laser s vysokým poškozením.',
        damage: 40,
        range: 600,
        energyCost: 8,
        fireRate: 0.5,
        rarity: 'uncommon',
        cost: 7000
    },
    [WeaponType.MISSILES]: {
        name: 'Guided Missiles',
        description: 'Samonaváděcí rakety s výbušnou hlavicí.',
        damage: 75,
        range: 800,
        energyCost: 10,
        fireRate: 1.0,
        ammo: 12,
        rarity: 'common',
        cost: 5000
    },
    [WeaponType.TORPEDO]: {
        name: 'Heavy Torpedo',
        description: 'Těžká torpéda s devastujícím poškozením.',
        damage: 150,
        range: 1200,
        energyCost: 20,
        fireRate: 2.0,
        ammo: 6,
        rarity: 'rare',
        cost: 15000
    },
    [WeaponType.RAILGUN]: {
        name: 'Electromagnetic Railgun',
        description: 'Kinetická zbraň střílející projektily vysokou rychlostí.',
        damage: 100,
        range: 1000,
        energyCost: 15,
        fireRate: 1.5,
        rarity: 'uncommon',
        cost: 12000
    },
    [WeaponType.PLASMA_CANNON]: {
        name: 'Plasma Cannon',
        description: 'Pokročilá zbraň střílející plazmatické projektily.',
        damage: 80,
        range: 700,
        energyCost: 12,
        fireRate: 0.8,
        rarity: 'rare',
        cost: 25000
    },
    [WeaponType.ION_BEAM]: {
        name: 'Ion Beam',
        description: 'Disruptivní zbraň poškozující elektronické systémy.',
        damage: 30,
        range: 500,
        energyCost: 6,
        fireRate: 0.3,
        rarity: 'uncommon',
        cost: 8000
    },
    [WeaponType.FLAK_CANNON]: {
        name: 'Flak Cannon',
        description: 'Protivzdušná zbraň s fragmentačními projektily.',
        damage: 60,
        range: 400,
        energyCost: 8,
        fireRate: 0.6,
        rarity: 'uncommon',
        cost: 9000
    },
    [WeaponType.EMP_WEAPON]: {
        name: 'EMP Disruptor',
        description: 'Elektromagnetická zbraň vyřazující systémy nepřítele.',
        damage: 15,
        range: 300,
        energyCost: 10,
        fireRate: 1.2,
        rarity: 'rare',
        cost: 18000
    },
    [WeaponType.MINING_LASER]: {
        name: 'Mining Laser',
        description: 'Specializovaný laser pro těžbu asteroidů.',
        damage: 35,
        range: 200,
        energyCost: 3,
        fireRate: 0.15,
        rarity: 'common',
        cost: 4000
    }
};
export const QUEST_DIFFICULTY_COLORS = {
    1: '#00ff00',
    2: '#ffff00',
    3: '#ff8800',
    4: '#ff4400',
    5: '#ff0088'
};
export const SHIP_RARITY_COLORS = {
    'common': '#ffffff',
    'uncommon': '#00ff00',
    'rare': '#0088ff',
    'legendary': '#ff8800'
};
export const CREDITS_TEXT = `
STAR DUST VOYAGER: GALAXY WANDERER

Vytvořeno s láskou ke sci-fi

--- VÝVOJOVÝ TÝM ---
• Programování: Claude AI & Human Developer
• Design: Inspirováno klasickými space opera hrami
• Hudba: Syntezované vesmírné melodie
• Grafika: Retro pixel art styl

--- SPECIÁLNÍ PODĚKOVÁNÍ ---
• Elite: Dangerous za inspiraci
• Star Citizen za vizi budoucnosti
• EVE Online za komplexnost
• No Man's Sky za nekonečnost

--- TECHNOLOGIE ---
• TypeScript
• HTML5 Canvas
• Web Audio API
• Modern ES6+ Features

Verze 2.0.0
© 2024 Space Explorer Development Team

--- OVLÁDÁNÍ ---
WASD / Šipky: Pohyb
MEZERNÍK: Střelba
ESC: Menu
TAB: Inventář
M: Mapa

Užijte si svou cestu mezi hvězdami!
`;
//# sourceMappingURL=gameData.js.map