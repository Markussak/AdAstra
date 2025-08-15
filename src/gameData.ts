// gameData.ts - Game configuration data

import { ShipTemplate, DifficultyLevel, ShipType, WeaponType } from './types';

export const SHIP_TEMPLATES: Record<ShipType, ShipTemplate> = {
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
    specialAbilities: ['Rychlá regenerace energie', 'Pokročilé senzory']
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
    specialAbilities: ['Zvýšená firepower', 'Pancéřování']
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
    specialAbilities: ['Efektivní spotřeba paliva', 'Univerzálnost']
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
    specialAbilities: ['Masivní nákladový prostor', 'Ekonomické motory']
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
    specialAbilities: ['Devastující firepower', 'Těžké pancéřování', 'Pokročilé zbraňové systémy']
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