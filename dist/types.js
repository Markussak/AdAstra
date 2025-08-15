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
})(ShipType || (ShipType = {}));
//# sourceMappingURL=types.js.map