import { Quest } from './types';
export declare class QuestSystem {
    private activeQuests;
    private completedQuests;
    private availableQuests;
    private questIdCounter;
    constructor();
    private generateInitialQuests;
    createQuest(questData: Partial<Quest>): Quest;
    acceptQuest(questId: string): boolean;
    updateProgress(action: string, target?: string, amount?: number): void;
    completeQuest(questId: string): boolean;
    failQuest(questId: string, reason?: string): boolean;
    updateTimers(deltaTime: number): void;
    getActiveQuests(): Quest[];
    getAvailableQuests(): Quest[];
    getCompletedQuests(): Quest[];
    generateRandomQuest(playerLevel?: number): Quest;
    private awardRewards;
    private getQuestTemplates;
    loadFromSave(questData: any): void;
    getSaveData(): any;
}
