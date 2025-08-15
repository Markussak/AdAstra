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