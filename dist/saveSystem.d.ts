import { SaveData, GameSettings } from './types';
export declare class SaveSystem {
    private static readonly SAVE_KEY;
    private static readonly SETTINGS_KEY;
    private static readonly VERSION;
    private static readonly MAX_SAVES;
    private static defaultSettings;
    static saveGame(gameEngine: any, slotName?: string): boolean;
    static loadGame(slotName: string): SaveData | null;
    static getSaveList(): Array<{
        slot: string;
        timestamp: number;
        playerName: string;
    }>;
    static deleteSave(slotName: string): boolean;
    static saveExists(slotName: string): boolean;
    static applySaveData(gameEngine: any, saveData: SaveData): void;
    static saveSettings(settings: GameSettings): void;
    static loadSettings(): GameSettings;
    static resetSettings(): GameSettings;
    static exportSave(slotName: string): void;
    static importSave(file: File, slotName: string): Promise<boolean>;
    private static createSaveData;
    private static updateSaveList;
    private static serializeSystems;
    private static serializeWeapons;
    private static applySettings;
}
export declare class AutoSaveManager {
    private static interval;
    private static gameEngine;
    static start(gameEngine: any): void;
    static stop(): void;
    static updateInterval(newInterval: number): void;
}
