// saveSystem.ts - Save/Load game system

import { SaveData, GameSettings, Quest, DifficultyLevel, ShipType } from './types';

export class SaveSystem {
  private static readonly SAVE_KEY = 'starDustVoyager_save';
  private static readonly SETTINGS_KEY = 'starDustVoyager_settings';
  private static readonly VERSION = '2.0.0';
  private static readonly MAX_SAVES = 5;

  // Default settings
  private static defaultSettings: GameSettings = {
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
      autosaveInterval: 300, // 5 minutes
      showTutorials: true,
      pauseOnFocusLoss: true
    }
  };

  /**
   * Save current game state
   */
  public static saveGame(gameEngine: any, slotName: string = 'autosave'): boolean {
    try {
      const saveData: SaveData = this.createSaveData(gameEngine);
      const saveKey = `${this.SAVE_KEY}_${slotName}`;
      
      localStorage.setItem(saveKey, JSON.stringify(saveData));
      
      // Update save list
      this.updateSaveList(slotName, saveData.timestamp);
      
      console.log(`Game saved to slot: ${slotName}`);
      return true;
    } catch (error) {
      console.error('Failed to save game:', error);
      return false;
    }
  }

  /**
   * Load game state
   */
  public static loadGame(slotName: string): SaveData | null {
    try {
      const saveKey = `${this.SAVE_KEY}_${slotName}`;
      const saveDataStr = localStorage.getItem(saveKey);
      
      if (!saveDataStr) {
        console.warn(`No save found for slot: ${slotName}`);
        return null;
      }
      
      const saveData: SaveData = JSON.parse(saveDataStr);
      
      // Version compatibility check
      if (saveData.version !== this.VERSION) {
        console.warn(`Save version mismatch. Save: ${saveData.version}, Game: ${this.VERSION}`);
        // TODO: Implement save migration if needed
      }
      
      console.log(`Game loaded from slot: ${slotName}`);
      return saveData;
    } catch (error) {
      console.error('Failed to load game:', error);
      return null;
    }
  }

  /**
   * Get list of available saves
   */
  public static getSaveList(): Array<{ slot: string; timestamp: number; playerName: string }> {
    const saveListStr = localStorage.getItem(`${this.SAVE_KEY}_list`);
    if (!saveListStr) return [];
    
    try {
      return JSON.parse(saveListStr);
    } catch (error) {
      console.error('Failed to parse save list:', error);
      return [];
    }
  }

  /**
   * Delete a save slot
   */
  public static deleteSave(slotName: string): boolean {
    try {
      const saveKey = `${this.SAVE_KEY}_${slotName}`;
      localStorage.removeItem(saveKey);
      
      // Update save list
      const saveList = this.getSaveList().filter(save => save.slot !== slotName);
      localStorage.setItem(`${this.SAVE_KEY}_list`, JSON.stringify(saveList));
      
      console.log(`Save deleted: ${slotName}`);
      return true;
    } catch (error) {
      console.error('Failed to delete save:', error);
      return false;
    }
  }

  /**
   * Check if save exists
   */
  public static saveExists(slotName: string): boolean {
    const saveKey = `${this.SAVE_KEY}_${slotName}`;
    return localStorage.getItem(saveKey) !== null;
  }

  /**
   * Apply save data to game engine
   */
  public static applySaveData(gameEngine: any, saveData: SaveData): void {
    try {
      // Apply player data
      gameEngine.player.position = saveData.playerData.position;
      
      // Apply ship data
      gameEngine.player.hull = saveData.shipData.hull;
      gameEngine.player.maxHull = saveData.shipData.maxHull;
      gameEngine.player.shields = saveData.shipData.shields;
      gameEngine.player.maxShields = saveData.shipData.maxShields;
      gameEngine.player.fuel = saveData.shipData.fuel;
      gameEngine.player.maxFuel = saveData.shipData.maxFuel;
      gameEngine.player.energy = saveData.shipData.energy;
      gameEngine.player.maxEnergy = saveData.shipData.maxEnergy;
      
      // Apply cargo
      gameEngine.player.cargoItems.clear();
      saveData.shipData.cargo.forEach(item => {
        gameEngine.player.cargoItems.set(item.id, item);
      });
      
      // Apply game settings
      this.applySettings(saveData.gameData.gameSettings);
      
      // Store additional data globally
      (window as any).saveData = saveData;
      
      console.log('Save data applied successfully');
    } catch (error) {
      console.error('Failed to apply save data:', error);
    }
  }

  /**
   * Save game settings
   */
  public static saveSettings(settings: GameSettings): void {
    try {
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
      this.applySettings(settings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  /**
   * Load game settings
   */
  public static loadSettings(): GameSettings {
    try {
      const settingsStr = localStorage.getItem(this.SETTINGS_KEY);
      if (!settingsStr) {
        return { ...this.defaultSettings };
      }
      
      const settings = JSON.parse(settingsStr);
      return { ...this.defaultSettings, ...settings };
    } catch (error) {
      console.error('Failed to load settings:', error);
      return { ...this.defaultSettings };
    }
  }

  /**
   * Reset settings to default
   */
  public static resetSettings(): GameSettings {
    const settings = { ...this.defaultSettings };
    this.saveSettings(settings);
    return settings;
  }

  /**
   * Export save data as file
   */
  public static exportSave(slotName: string): void {
    const saveData = this.loadGame(slotName);
    if (!saveData) return;
    
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

  /**
   * Import save data from file
   */
  public static importSave(file: File, slotName: string): Promise<boolean> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const saveData = JSON.parse(e.target?.result as string);
          const saveKey = `${this.SAVE_KEY}_${slotName}`;
          localStorage.setItem(saveKey, JSON.stringify(saveData));
          this.updateSaveList(slotName, saveData.timestamp);
          resolve(true);
        } catch (error) {
          console.error('Failed to import save:', error);
          resolve(false);
        }
      };
      reader.readAsText(file);
    });
  }

  // Private helper methods

  private static createSaveData(gameEngine: any): SaveData {
    const currentTime = Date.now();
    const gameSetup = (window as any).gameSetup;
    const saveData = (window as any).saveData || {};
    
    return {
      version: this.VERSION,
      timestamp: currentTime,
      playerData: {
        name: gameSetup?.playerName || 'Unknown Pilot',
        credits: saveData.playerData?.credits || 1000,
        experience: saveData.playerData?.experience || 0,
        level: saveData.playerData?.level || 1,
        position: { ...gameEngine.player.position },
        currentSystem: 'Sol' // TODO: Get from scene manager
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

  private static updateSaveList(slotName: string, timestamp: number): void {
    const saveList = this.getSaveList();
    const existingIndex = saveList.findIndex(save => save.slot === slotName);
    
    const gameSetup = (window as any).gameSetup;
    const saveEntry = {
      slot: slotName,
      timestamp,
      playerName: gameSetup?.playerName || 'Unknown Pilot'
    };
    
    if (existingIndex >= 0) {
      saveList[existingIndex] = saveEntry;
    } else {
      saveList.push(saveEntry);
      
      // Keep only the last MAX_SAVES saves
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

  private static serializeSystems(systems: Map<any, any>): Record<string, any> {
    const result: Record<string, any> = {};
    systems.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  private static serializeWeapons(weapons: Map<any, any>): Record<string, any> {
    const result: Record<string, any> = {};
    weapons.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  private static applySettings(settings: GameSettings): void {
    // Apply graphics settings
    if (settings.graphics.fullscreen && document.fullscreenEnabled) {
      // TODO: Handle fullscreen
    }
    
    // Apply audio settings
    // TODO: Apply audio volume settings when audio system is implemented
    
    // Store settings globally for access by other systems
    (window as any).gameSettings = settings;
  }
}

// Auto-save functionality
export class AutoSaveManager {
  private static interval: number | null = null;
  private static gameEngine: any = null;

  public static start(gameEngine: any): void {
    this.gameEngine = gameEngine;
    const settings = SaveSystem.loadSettings();
    
    if (settings.gameplay.autosave) {
      this.stop(); // Clear any existing interval
      
      this.interval = window.setInterval(() => {
        if (this.gameEngine && this.gameEngine.stateManager.getCurrentState() === 'playing') {
          SaveSystem.saveGame(this.gameEngine, 'autosave');
          console.log('Auto-save completed');
        }
      }, settings.gameplay.autosaveInterval * 1000);
      
      console.log(`Auto-save started with ${settings.gameplay.autosaveInterval}s interval`);
    }
  }

  public static stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      console.log('Auto-save stopped');
    }
  }

  public static updateInterval(newInterval: number): void {
    if (this.gameEngine) {
      this.stop();
      const settings = SaveSystem.loadSettings();
      settings.gameplay.autosaveInterval = newInterval;
      SaveSystem.saveSettings(settings);
      this.start(this.gameEngine);
    }
  }
}