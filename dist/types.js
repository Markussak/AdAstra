export var GameState;
(function (GameState) {
    GameState["LOADING"] = "loading";
    GameState["MAIN_MENU"] = "mainMenu";
    GameState["NEW_GAME_SETUP"] = "newGameSetup";
    GameState["PLAYING"] = "playing";
    GameState["PAUSED"] = "paused";
    GameState["INVENTORY"] = "inventory";
    GameState["RESEARCH"] = "research";
    GameState["SETTINGS"] = "settings";
})(GameState || (GameState = {}));
export var ShipSystemType;
(function (ShipSystemType) {
    ShipSystemType["REACTOR"] = "reactor";
    ShipSystemType["ENGINES"] = "engines";
    ShipSystemType["SHIELDS"] = "shields";
    ShipSystemType["WEAPONS"] = "weapons";
    ShipSystemType["LIFE_SUPPORT"] = "lifeSupport";
    ShipSystemType["NAVIGATION"] = "navigation";
    ShipSystemType["COMMUNICATIONS"] = "communications";
    ShipSystemType["WARP_DRIVE"] = "warpDrive";
})(ShipSystemType || (ShipSystemType = {}));
export var WeaponType;
(function (WeaponType) {
    WeaponType["LASER"] = "laser";
    WeaponType["MISSILES"] = "missiles";
    WeaponType["RAILGUN"] = "railgun";
    WeaponType["MINING_LASER"] = "miningLaser";
    WeaponType["PLASMA_CANNON"] = "plasmaCannon";
    WeaponType["ION_BEAM"] = "ionBeam";
    WeaponType["TORPEDO"] = "torpedo";
    WeaponType["PULSE_LASER"] = "pulseLaser";
    WeaponType["BEAM_LASER"] = "beamLaser";
    WeaponType["FLAK_CANNON"] = "flakCannon";
    WeaponType["EMP_WEAPON"] = "empWeapon";
})(WeaponType || (WeaponType = {}));
export var CelestialBodyType;
(function (CelestialBodyType) {
    CelestialBodyType["STAR"] = "star";
    CelestialBodyType["PLANET"] = "planet";
    CelestialBodyType["MOON"] = "moon";
    CelestialBodyType["ASTEROID"] = "asteroid";
    CelestialBodyType["COMET"] = "comet";
    CelestialBodyType["BLACK_HOLE"] = "blackHole";
    CelestialBodyType["SPACE_STATION"] = "spaceStation";
})(CelestialBodyType || (CelestialBodyType = {}));
export var SceneType;
(function (SceneType) {
    SceneType["STAR_SYSTEM"] = "starSystem";
    SceneType["INTERSTELLAR_SPACE"] = "interstellarSpace";
})(SceneType || (SceneType = {}));
export var DifficultyLevel;
(function (DifficultyLevel) {
    DifficultyLevel["EASY"] = "easy";
    DifficultyLevel["NORMAL"] = "normal";
    DifficultyLevel["HARD"] = "hard";
    DifficultyLevel["EXTREME"] = "extreme";
})(DifficultyLevel || (DifficultyLevel = {}));
export var ShipType;
(function (ShipType) {
    ShipType["SCOUT"] = "scout";
    ShipType["FIGHTER"] = "fighter";
    ShipType["EXPLORER"] = "explorer";
    ShipType["CARGO"] = "cargo";
    ShipType["BATTLESHIP"] = "battleship";
    ShipType["INTERCEPTOR"] = "interceptor";
    ShipType["CRUISER"] = "cruiser";
    ShipType["DREADNOUGHT"] = "dreadnought";
    ShipType["STEALTH"] = "stealth";
    ShipType["MINING"] = "mining";
})(ShipType || (ShipType = {}));
export var CharacterGender;
(function (CharacterGender) {
    CharacterGender["MALE"] = "male";
    CharacterGender["FEMALE"] = "female";
    CharacterGender["NON_BINARY"] = "nonBinary";
    CharacterGender["OTHER"] = "other";
})(CharacterGender || (CharacterGender = {}));
export var CharacterRace;
(function (CharacterRace) {
    CharacterRace["HUMAN"] = "human";
    CharacterRace["TERRAN"] = "terran";
    CharacterRace["ZEPHYRIAN"] = "zephyrian";
    CharacterRace["CRYSTALLINE"] = "crystalline";
    CharacterRace["VORTHAN"] = "vorthan";
    CharacterRace["AQUARIAN"] = "aquarian";
    CharacterRace["MECHANO"] = "mechano";
    CharacterRace["ETHEREAL"] = "ethereal";
    CharacterRace["DRAKONID"] = "drakonid";
    CharacterRace["SYLVAN"] = "sylvan";
})(CharacterRace || (CharacterRace = {}));
export var CharacterSkill;
(function (CharacterSkill) {
    CharacterSkill["PILOTING"] = "piloting";
    CharacterSkill["ENGINEERING"] = "engineering";
    CharacterSkill["COMBAT"] = "combat";
    CharacterSkill["TRADING"] = "trading";
    CharacterSkill["DIPLOMACY"] = "diplomacy";
    CharacterSkill["EXPLORATION"] = "exploration";
    CharacterSkill["MINING"] = "mining";
    CharacterSkill["RESEARCH"] = "research";
    CharacterSkill["STEALTH"] = "stealth";
    CharacterSkill["LEADERSHIP"] = "leadership";
})(CharacterSkill || (CharacterSkill = {}));
export var CharacterBackground;
(function (CharacterBackground) {
    CharacterBackground["MILITARY_PILOT"] = "militaryPilot";
    CharacterBackground["MERCHANT"] = "merchant";
    CharacterBackground["EXPLORER"] = "explorer";
    CharacterBackground["SCIENTIST"] = "scientist";
    CharacterBackground["ENGINEER"] = "engineer";
    CharacterBackground["BOUNTY_HUNTER"] = "bountyHunter";
    CharacterBackground["DIPLOMAT"] = "diplomat";
    CharacterBackground["MINER"] = "miner";
    CharacterBackground["SMUGGLER"] = "smuggler";
    CharacterBackground["REFUGEE"] = "refugee";
})(CharacterBackground || (CharacterBackground = {}));
export var GalaxySize;
(function (GalaxySize) {
    GalaxySize["SMALL"] = "small";
    GalaxySize["MEDIUM"] = "medium";
    GalaxySize["LARGE"] = "large";
    GalaxySize["HUGE"] = "huge";
})(GalaxySize || (GalaxySize = {}));
export var GalaxyDensity;
(function (GalaxyDensity) {
    GalaxyDensity["SPARSE"] = "sparse";
    GalaxyDensity["NORMAL"] = "normal";
    GalaxyDensity["DENSE"] = "dense";
    GalaxyDensity["PACKED"] = "packed";
})(GalaxyDensity || (GalaxyDensity = {}));
export var EconomyComplexity;
(function (EconomyComplexity) {
    EconomyComplexity["SIMPLE"] = "simple";
    EconomyComplexity["MODERATE"] = "moderate";
    EconomyComplexity["COMPLEX"] = "complex";
    EconomyComplexity["REALISTIC"] = "realistic";
})(EconomyComplexity || (EconomyComplexity = {}));
export var QuestType;
(function (QuestType) {
    QuestType["DELIVERY"] = "delivery";
    QuestType["COMBAT"] = "combat";
    QuestType["EXPLORATION"] = "exploration";
    QuestType["MINING"] = "mining";
    QuestType["ESCORT"] = "escort";
    QuestType["STORY"] = "story";
})(QuestType || (QuestType = {}));
export var QuestStatus;
(function (QuestStatus) {
    QuestStatus["AVAILABLE"] = "available";
    QuestStatus["ACTIVE"] = "active";
    QuestStatus["COMPLETED"] = "completed";
    QuestStatus["FAILED"] = "failed";
    QuestStatus["TURNED_IN"] = "turnedIn";
})(QuestStatus || (QuestStatus = {}));
export var EffectType;
(function (EffectType) {
    EffectType["SHIELD_HIT"] = "shieldHit";
    EffectType["SHIELD_REGENERATE"] = "shieldRegenerate";
    EffectType["ENGINE_THRUST"] = "engineThrust";
    EffectType["MANEUVERING_THRUST"] = "maneuveringThrust";
    EffectType["WARP_CHARGE"] = "warpCharge";
    EffectType["WARP_BUBBLE"] = "warpBubble";
    EffectType["WARP_DISTORTION"] = "warpDistortion";
    EffectType["WARP_COLLAPSE"] = "warpCollapse";
    EffectType["WEAPON_IMPACT"] = "weaponImpact";
    EffectType["EXPLOSION"] = "explosion";
})(EffectType || (EffectType = {}));
//# sourceMappingURL=types.js.map