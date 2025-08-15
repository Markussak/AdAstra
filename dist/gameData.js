import { DifficultyLevel, ShipType, WeaponType, CharacterRace, CharacterSkill, CharacterBackground, GalaxySize, GalaxyDensity, EconomyComplexity } from './types';
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
export const RACE_DATA = {
    [CharacterRace.HUMAN]: {
        name: 'Lidé',
        description: 'Adaptabilní a vytrvalí průzkumníci původem ze Země. Vyváženě rozvinutá rasa.',
        traits: ['Univerzálnost', 'Rychlé učení', 'Diplomacie'],
        bonuses: { piloting: 1, diplomacy: 1 },
        portraitColor: '#ffdbac'
    },
    [CharacterRace.TERRAN]: {
        name: 'Terraňané',
        description: 'Pokročilí potomci pozemšťanů, mistři technologie a inženýrství.',
        traits: ['Technologické mistrovství', 'Analytické myšlení', 'Inovace'],
        bonuses: { engineering: 2, research: 1 },
        portraitColor: '#e8c5a0'
    },
    [CharacterRace.ZEPHYRIAN]: {
        name: 'Zefyriáni',
        description: 'Vzdušní nomádi z plynných planet, narození piloti s intuitivním citem pro letectví.',
        traits: ['Přirozené pilotování', 'Rychlé reflexy', 'Navigační instinkt'],
        bonuses: { piloting: 2, exploration: 1 },
        portraitColor: '#b3d9ff'
    },
    [CharacterRace.CRYSTALLINE]: {
        name: 'Krystalové',
        description: 'Křemíkoví bytosti s přirozeným pochopením energetických systémů a vědy.',
        traits: ['Energetická afinita', 'Dlouhověkost', 'Logické myšlení'],
        bonuses: { research: 2, engineering: 1 },
        portraitColor: '#e6ccff'
    },
    [CharacterRace.VORTHAN]: {
        name: 'Vorthané',
        description: 'Válečníci z pustých světů, specialisté na boj a taktiku.',
        traits: ['Bojová zdatnost', 'Odolnost', 'Taktické myšlení'],
        bonuses: { combat: 2, leadership: 1 },
        portraitColor: '#ffb3b3'
    },
    [CharacterRace.AQUARIAN]: {
        name: 'Akvariáni',
        description: 'Mírní obyvatelé oceánských světů, mistři obchodu a diplomacie.',
        traits: ['Obchodní smysl', 'Empatie', 'Kulturní porozumění'],
        bonuses: { trading: 2, diplomacy: 1 },
        portraitColor: '#b3ffcc'
    },
    [CharacterRace.MECHANO]: {
        name: 'Mechanoidové',
        description: 'Kyborgoví inženýři, fúze organického a umělého života.',
        traits: ['Technická integrace', 'Systémová analýza', 'Modularita'],
        bonuses: { engineering: 2, mining: 1 },
        portraitColor: '#cccccc'
    },
    [CharacterRace.ETHEREAL]: {
        name: 'Éteriálové',
        description: 'Záhadné bytosti z jiných dimenzí s nadpřirozenými schopnostmi.',
        traits: ['Dimenzionální vnímání', 'Psychické schopnosti', 'Mystika'],
        bonuses: { exploration: 2, stealth: 1 },
        portraitColor: '#d9b3ff'
    },
    [CharacterRace.DRAKONID]: {
        name: 'Drakonidi',
        description: 'Ještěří válečníci s drsnou minulostí a silným hrdostí.',
        traits: ['Přírodní pancíř', 'Teritorialita', 'Čestný kodex'],
        bonuses: { combat: 1, leadership: 2 },
        portraitColor: '#ccff99'
    },
    [CharacterRace.SYLVAN]: {
        name: 'Sylváni',
        description: 'Rostlinní bytosti s hlubokým spojením s přírodou a ekosystémy.',
        traits: ['Ekolokální harmonizace', 'Regenerace', 'Organická intuice'],
        bonuses: { mining: 2, research: 1 },
        portraitColor: '#99ff99'
    }
};
export const BACKGROUND_DATA = {
    [CharacterBackground.MILITARY_PILOT]: {
        name: 'Vojenský pilot',
        description: 'Bývalý člen hvězdné flotily s rozsáhlými bojovými zkušenostmi.',
        bonuses: { combat: 3, piloting: 2, leadership: 1 },
        startingCredits: 8000,
        startingEquipment: ['Vojenská ID karta', 'Taktický manuál']
    },
    [CharacterBackground.MERCHANT]: {
        name: 'Obchodník',
        description: 'Zkušený trader znající obchodní trasy a tržní možnosti.',
        bonuses: { trading: 3, diplomacy: 2, piloting: 1 },
        startingCredits: 15000,
        startingEquipment: ['Obchodní licence', 'Kontakty']
    },
    [CharacterBackground.EXPLORER]: {
        name: 'Průzkumník',
        description: 'Nezávislý explorér s vášní pro objevování neznámých světů.',
        bonuses: { exploration: 3, piloting: 2, research: 1 },
        startingCredits: 10000,
        startingEquipment: ['Průzkumná licence', 'Mapovací zařízení']
    },
    [CharacterBackground.SCIENTIST]: {
        name: 'Vědec',
        description: 'Akademický výzkumník specializující se na vesmírné fenomény.',
        bonuses: { research: 3, engineering: 2, exploration: 1 },
        startingCredits: 12000,
        startingEquipment: ['Vědecká licence', 'Laboratorní zařízení']
    },
    [CharacterBackground.ENGINEER]: {
        name: 'Inženýr',
        description: 'Technický specialista se znalostí lodních systémů.',
        bonuses: { engineering: 3, mining: 2, combat: 1 },
        startingCredits: 11000,
        startingEquipment: ['Inženýrské nástroje', 'Technické manuály']
    },
    [CharacterBackground.BOUNTY_HUNTER]: {
        name: 'Lovec odměn',
        description: 'Nezávislý hunter vyslídil nebezpečné zločince.',
        bonuses: { combat: 2, stealth: 2, piloting: 2 },
        startingCredits: 9000,
        startingEquipment: ['Lovecká licence', 'Sledovací zařízení']
    },
    [CharacterBackground.DIPLOMAT]: {
        name: 'Diplomat',
        description: 'Zkušený vyjednavač znající galaktické politické struktury.',
        bonuses: { diplomacy: 3, trading: 1, leadership: 2 },
        startingCredits: 13000,
        startingEquipment: ['Diplomatické pověření', 'Lingvistický překladač']
    },
    [CharacterBackground.MINER]: {
        name: 'Horník',
        description: 'Tvrdý pracovník specializující se na těžbu asteroidů.',
        bonuses: { mining: 3, engineering: 2, piloting: 1 },
        startingCredits: 7000,
        startingEquipment: ['Těžební licence', 'Geologické skenery']
    },
    [CharacterBackground.SMUGGLER]: {
        name: 'Pašerák',
        description: 'Rizikový trader operující na hranici legality.',
        bonuses: { stealth: 2, piloting: 2, trading: 2 },
        startingCredits: 6000,
        startingEquipment: ['Skryté oddíly', 'Černý trh kontakty']
    },
    [CharacterBackground.REFUGEE]: {
        name: 'Uprchlík',
        description: 'Survivor z konfliktní zóny s netušenými schopnostmi.',
        bonuses: { stealth: 2, diplomacy: 1, exploration: 1, piloting: 1, engineering: 1 },
        startingCredits: 3000,
        startingEquipment: ['Identifikační doklady', 'Osobní vzpomínky']
    }
};
export const SKILL_DATA = {
    [CharacterSkill.PILOTING]: {
        name: 'Pilotování',
        description: 'Ovládání lodě, manévrování a rychlost reakce při letu.',
        icon: '🚀'
    },
    [CharacterSkill.ENGINEERING]: {
        name: 'Inženýrství',
        description: 'Opravy systémů, modifikace lodě a technická analýza.',
        icon: '🔧'
    },
    [CharacterSkill.COMBAT]: {
        name: 'Boj',
        description: 'Efektivita ve střelbě, taktice a přežití v konfliktu.',
        icon: '⚔️'
    },
    [CharacterSkill.TRADING]: {
        name: 'Obchodování',
        description: 'Vyjednávání cen, trţní analýza a obchodní příležitosti.',
        icon: '💰'
    },
    [CharacterSkill.DIPLOMACY]: {
        name: 'Diplomacie',
        description: 'Komunikace s frakcemi, vyjednávání a konfliktní řešení.',
        icon: '🤝'
    },
    [CharacterSkill.EXPLORATION]: {
        name: 'Průzkum',
        description: 'Navigace neznámými oblastmi a objevování tajemství.',
        icon: '🌌'
    },
    [CharacterSkill.MINING]: {
        name: 'Těžba',
        description: 'Efektivní získávání surovin z asteroidů a planet.',
        icon: '⛏️'
    },
    [CharacterSkill.RESEARCH]: {
        name: 'Výzkum',
        description: 'Vědecká analýza, technologický vývoj a objevy.',
        icon: '🔬'
    },
    [CharacterSkill.STEALTH]: {
        name: 'Nenápadnost',
        description: 'Vyhýbání se detekci, tajné operace a pašování.',
        icon: '👥'
    },
    [CharacterSkill.LEADERSHIP]: {
        name: 'Vedení',
        description: 'Správa posádky, strategické plánování a motivace.',
        icon: '👑'
    }
};
export const GALAXY_SIZE_DATA = {
    [GalaxySize.SMALL]: {
        name: 'Malá galaxie',
        description: 'Kompaktní galaxie s 50-100 hvězdnými systémy. Ideální pro rychlé průzkumy.',
        systemCount: 75,
        travelTime: 0.8
    },
    [GalaxySize.MEDIUM]: {
        name: 'Střední galaxie',
        description: 'Vyvážená galaxie se 150-250 hvězdnými systémy. Standard pro většinu her.',
        systemCount: 200,
        travelTime: 1.0
    },
    [GalaxySize.LARGE]: {
        name: 'Velká galaxie',
        description: 'Rozsáhlá galaxie s 300-500 hvězdnými systémy. Pro dlouhodobé kampaně.',
        systemCount: 400,
        travelTime: 1.3
    },
    [GalaxySize.HUGE]: {
        name: 'Obrovská galaxie',
        description: 'Masivní galaxie s 500+ hvězdnými systémy. Nekonečné možnosti průzkumu.',
        systemCount: 750,
        travelTime: 1.6
    }
};
export const GALAXY_DENSITY_DATA = {
    [GalaxyDensity.SPARSE]: {
        name: 'Řídká',
        description: 'Většina systémů je daleko od sebe. Více prostoru, méně kontaktů.',
        connectionDensity: 0.6,
        encounterRate: 0.7
    },
    [GalaxyDensity.NORMAL]: {
        name: 'Normální',
        description: 'Vyvážené rozložení systémů s běžnými cestovními vzdálenostmi.',
        connectionDensity: 1.0,
        encounterRate: 1.0
    },
    [GalaxyDensity.DENSE]: {
        name: 'Hustá',
        description: 'Systémy blízko u sebe. Více obchodních tras a kontaktů.',
        connectionDensity: 1.4,
        encounterRate: 1.3
    },
    [GalaxyDensity.PACKED]: {
        name: 'Přeplněná',
        description: 'Extrémně hustá galaxie s častými setkáními a konflikty.',
        connectionDensity: 1.8,
        encounterRate: 1.6
    }
};
export const ECONOMY_COMPLEXITY_DATA = {
    [EconomyComplexity.SIMPLE]: {
        name: 'Jednoduchá',
        description: 'Základní nabídka a poptávka. Stabilní ceny a jednoduché obchody.',
        priceVariability: 0.5,
        commodityCount: 8
    },
    [EconomyComplexity.MODERATE]: {
        name: 'Mírná',
        description: 'Více komodit a mírné cenové fluktuace. Vyvážená ekonomická hra.',
        priceVariability: 1.0,
        commodityCount: 16
    },
    [EconomyComplexity.COMPLEX]: {
        name: 'Komplexní',
        description: 'Pokročilé tržní mechanismy s množstvím obchodních příležitostí.',
        priceVariability: 1.5,
        commodityCount: 24
    },
    [EconomyComplexity.REALISTIC]: {
        name: 'Realistická',
        description: 'Simulace skutečné ekonomiky s dynamickými trhy a složitými interakcemi.',
        priceVariability: 2.0,
        commodityCount: 32
    }
};
//# sourceMappingURL=gameData.js.map