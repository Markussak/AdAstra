import { DifficultyLevel, ShipType } from './types';
export class SaveSystem {
    static saveGame(gameEngine, slotName = 'autosave') {
        try {
            const saveData = this.createSaveData(gameEngine);
            const saveKey = `${this.SAVE_KEY}_${slotName}`;
            localStorage.setItem(saveKey, JSON.stringify(saveData));
            this.updateSaveList(slotName, saveData.timestamp);
            console.log(`Game saved to slot: ${slotName}`);
            return true;
        }
        catch (error) {
            console.error('Failed to save game:', error);
            return false;
        }
    }
    static loadGame(slotName) {
        try {
            const saveKey = `${this.SAVE_KEY}_${slotName}`;
            const saveDataStr = localStorage.getItem(saveKey);
            if (!saveDataStr) {
                console.warn(`No save found for slot: ${slotName}`);
                return null;
            }
            const saveData = JSON.parse(saveDataStr);
            if (saveData.version !== this.VERSION) {
                console.warn(`Save version mismatch. Save: ${saveData.version}, Game: ${this.VERSION}`);
            }
            console.log(`Game loaded from slot: ${slotName}`);
            return saveData;
        }
        catch (error) {
            console.error('Failed to load game:', error);
            return null;
        }
    }
    static getSaveList() {
        const saveListStr = localStorage.getItem(`${this.SAVE_KEY}_list`);
        if (!saveListStr)
            return [];
        try {
            return JSON.parse(saveListStr);
        }
        catch (error) {
            console.error('Failed to parse save list:', error);
            return [];
        }
    }
    static deleteSave(slotName) {
        try {
            const saveKey = `${this.SAVE_KEY}_${slotName}`;
            localStorage.removeItem(saveKey);
            const saveList = this.getSaveList().filter(save => save.slot !== slotName);
            localStorage.setItem(`${this.SAVE_KEY}_list`, JSON.stringify(saveList));
            console.log(`Save deleted: ${slotName}`);
            return true;
        }
        catch (error) {
            console.error('Failed to delete save:', error);
            return false;
        }
    }
    static saveExists(slotName) {
        const saveKey = `${this.SAVE_KEY}_${slotName}`;
        return localStorage.getItem(saveKey) !== null;
    }
    static applySaveData(gameEngine, saveData) {
        try {
            gameEngine.player.position = saveData.playerData.position;
            gameEngine.player.hull = saveData.shipData.hull;
            gameEngine.player.maxHull = saveData.shipData.maxHull;
            gameEngine.player.shields = saveData.shipData.shields;
            gameEngine.player.maxShields = saveData.shipData.maxShields;
            gameEngine.player.fuel = saveData.shipData.fuel;
            gameEngine.player.maxFuel = saveData.shipData.maxFuel;
            gameEngine.player.energy = saveData.shipData.energy;
            gameEngine.player.maxEnergy = saveData.shipData.maxEnergy;
            gameEngine.player.cargoItems.clear();
            saveData.shipData.cargo.forEach(item => {
                gameEngine.player.cargoItems.set(item.id, item);
            });
            this.applySettings(saveData.gameData.gameSettings);
            window.saveData = saveData;
            console.log('Save data applied successfully');
        }
        catch (error) {
            console.error('Failed to apply save data:', error);
        }
    }
    static saveSettings(settings) {
        try {
            localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
            this.applySettings(settings);
        }
        catch (error) {
            console.error('Failed to save settings:', error);
        }
    }
    static loadSettings() {
        try {
            const settingsStr = localStorage.getItem(this.SETTINGS_KEY);
            if (!settingsStr) {
                return { ...this.defaultSettings };
            }
            const settings = JSON.parse(settingsStr);
            return { ...this.defaultSettings, ...settings };
        }
        catch (error) {
            console.error('Failed to load settings:', error);
            return { ...this.defaultSettings };
        }
    }
    static resetSettings() {
        const settings = { ...this.defaultSettings };
        this.saveSettings(settings);
        return settings;
    }
    static exportSave(slotName) {
        const saveData = this.loadGame(slotName);
        if (!saveData)
            return;
        const dataStr = JSON.stringify(saveData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `star_dust_voyager_save_${slotName}_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    static importSave(file, slotName) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const saveData = JSON.parse(e.target?.result);
                    const saveKey = `${this.SAVE_KEY}_${slotName}`;
                    localStorage.setItem(saveKey, JSON.stringify(saveData));
                    this.updateSaveList(slotName, saveData.timestamp);
                    resolve(true);
                }
                catch (error) {
                    console.error('Failed to import save:', error);
                    resolve(false);
                }
            };
            reader.readAsText(file);
        });
    }
    static createSaveData(gameEngine) {
        const currentTime = Date.now();
        const gameSetup = window.gameSetup;
        const saveData = window.saveData || {};
        return {
            version: this.VERSION,
            timestamp: currentTime,
            playerData: {
                name: gameSetup?.playerName || 'Unknown Pilot',
                credits: saveData.playerData?.credits || 1000,
                experience: saveData.playerData?.experience || 0,
                level: saveData.playerData?.level || 1,
                position: { ...gameEngine.player.position },
                currentSystem: 'Sol'
            },
            shipData: {
                type: gameSetup?.shipType || ShipType.EXPLORER,
                hull: gameEngine.player.hull,
                maxHull: gameEngine.player.maxHull,
                shields: gameEngine.player.shields,
                maxShields: gameEngine.player.maxShields,
                fuel: gameEngine.player.fuel,
                maxFuel: gameEngine.player.maxFuel,
                energy: gameEngine.player.energy,
                maxEnergy: gameEngine.player.maxEnergy,
                cargo: Array.from(gameEngine.player.cargoItems.values()),
                systems: this.serializeSystems(gameEngine.player.systems),
                weapons: this.serializeWeapons(gameEngine.player.weapons)
            },
            gameData: {
                difficulty: gameSetup?.difficulty || DifficultyLevel.NORMAL,
                playTime: saveData.gameData?.playTime || 0,
                currentQuests: saveData.gameData?.currentQuests || [],
                completedQuests: saveData.gameData?.completedQuests || [],
                discoveredSystems: saveData.gameData?.discoveredSystems || ['Sol'],
                gameSettings: this.loadSettings()
            }
        };
    }
    static updateSaveList(slotName, timestamp) {
        const saveList = this.getSaveList();
        const existingIndex = saveList.findIndex(save => save.slot === slotName);
        const gameSetup = window.gameSetup;
        const saveEntry = {
            slot: slotName,
            timestamp,
            playerName: gameSetup?.playerName || 'Unknown Pilot'
        };
        if (existingIndex >= 0) {
            saveList[existingIndex] = saveEntry;
        }
        else {
            saveList.push(saveEntry);
            if (saveList.length > this.MAX_SAVES) {
                const oldestSave = saveList.shift();
                if (oldestSave) {
                    this.deleteSave(oldestSave.slot);
                }
            }
        }
        saveList.sort((a, b) => b.timestamp - a.timestamp);
        localStorage.setItem(`${this.SAVE_KEY}_list`, JSON.stringify(saveList));
    }
    static serializeSystems(systems) {
        const result = {};
        systems.forEach((value, key) => {
            result[key] = value;
        });
        return result;
    }
    static serializeWeapons(weapons) {
        const result = {};
        weapons.forEach((value, key) => {
            result[key] = value;
        });
        return result;
    }
    static applySettings(settings) {
        if (settings.graphics.fullscreen && document.fullscreenEnabled) {
        }
        window.gameSettings = settings;
    }
}
SaveSystem.SAVE_KEY = 'starDustVoyager_save';
SaveSystem.SETTINGS_KEY = 'starDustVoyager_settings';
SaveSystem.VERSION = '2.0.0';
SaveSystem.MAX_SAVES = 5;
SaveSystem.defaultSettings = {
    graphics: {
        fullscreen: false,
        resolution: '1920x1080',
        pixelPerfect: true,
        showFPS: false
    },
    audio: {
        masterVolume: 0.8,
        musicVolume: 0.6,
        sfxVolume: 0.8,
        muted: false
    },
    controls: {
        mouseInvert: false,
        touchControlsEnabled: true,
        keyBindings: {
            'moveUp': 'w',
            'moveDown': 's',
            'moveLeft': 'a',
            'moveRight': 'd',
            'fire': ' ',
            'menu': 'escape'
        }
    },
    gameplay: {
        autosave: true,
        autosaveInterval: 300,
        showTutorials: true,
        pauseOnFocusLoss: true
    }
};
export class AutoSaveManager {
    static start(gameEngine) {
        this.gameEngine = gameEngine;
        const settings = SaveSystem.loadSettings();
        if (settings.gameplay.autosave) {
            this.stop();
            this.interval = window.setInterval(() => {
                if (this.gameEngine && this.gameEngine.stateManager.getCurrentState() === 'playing') {
                    SaveSystem.saveGame(this.gameEngine, 'autosave');
                    console.log('Auto-save completed');
                }
            }, settings.gameplay.autosaveInterval * 1000);
            console.log(`Auto-save started with ${settings.gameplay.autosaveInterval}s interval`);
        }
    }
    static stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
            console.log('Auto-save stopped');
        }
    }
    static updateInterval(newInterval) {
        if (this.gameEngine) {
            this.stop();
            const settings = SaveSystem.loadSettings();
            settings.gameplay.autosaveInterval = newInterval;
            SaveSystem.saveSettings(settings);
            this.start(this.gameEngine);
        }
    }
}
AutoSaveManager.interval = null;
AutoSaveManager.gameEngine = null;
//# sourceMappingURL=saveSystem.js.map