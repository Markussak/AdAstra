// questSystem.ts - Quest and mission system

import { Quest, QuestType, QuestStatus, QuestObjective, CargoItem } from './types';
import { SeededRandom } from './utils';

export class QuestSystem {
  private activeQuests: Map<string, Quest> = new Map();
  private completedQuests: Set<string> = new Set();
  private availableQuests: Quest[] = [];
  private questIdCounter: number = 1;

  constructor() {
    this.generateInitialQuests();
  }

  /**
   * Generate initial starter quests
   */
  private generateInitialQuests(): void {
    // Tutorial quest
    this.createQuest({
      title: 'První kroky ve vesmíru',
      description: 'Seznamte se se základy pilotování vaší lodi. Naučte se pohybovat a ovládat systémy.',
      type: QuestType.STORY,
      objectives: [
        {
          id: 'move_tutorial',
          description: 'Pohybujte se pomocí WASD klávesy',
          type: 'survive',
          quantity: 30,
          currentProgress: 0,
          completed: false
        },
        {
          id: 'fire_tutorial',
          description: 'Vystřelte 5krát mezerníkem',
          type: 'collect',
          quantity: 5,
          currentProgress: 0,
          completed: false
        }
      ],
      rewards: {
        credits: 500,
        experience: 100
      },
      difficulty: 1
    });

    // Simple delivery quest
    this.createQuest({
      title: 'Zásilka pro stanici Alpha',
      description: 'Doručte důležité zásoby na vesmírnou stanici Alpha. Jednoduché, ale dobře placené.',
      type: QuestType.DELIVERY,
      objectives: [
        {
          id: 'collect_supplies',
          description: 'Vyzvedněte zásoby (3x Medical Supplies)',
          type: 'collect',
          target: 'medical_supplies',
          quantity: 3,
          currentProgress: 0,
          completed: false
        },
        {
          id: 'deliver_supplies',
          description: 'Doručte zásoby na stanici Alpha',
          type: 'deliver',
          target: 'station_alpha',
          quantity: 1,
          currentProgress: 0,
          completed: false
        }
      ],
      rewards: {
        credits: 1200,
        experience: 150,
        items: [
          {
            id: 'fuel_cell',
            name: 'Palivová cela',
            quantity: 2,
            weight: 10,
            value: 200
          }
        ]
      },
      difficulty: 2,
      timeLimit: 1800, // 30 minutes
      location: 'Sol System'
    });

    // Combat quest
    this.createQuest({
      title: 'Pirátská hrozba',
      description: 'V sektoru Beta se objevili piráti. Eliminujte je a zajistěte bezpečnost obchodních tras.',
      type: QuestType.COMBAT,
      objectives: [
        {
          id: 'eliminate_pirates',
          description: 'Zničte 5 pirátských lodí',
          type: 'kill',
          target: 'pirate_ship',
          quantity: 5,
          currentProgress: 0,
          completed: false
        }
      ],
      rewards: {
        credits: 2500,
        experience: 300,
        items: [
          {
            id: 'weapon_upgrade',
            name: 'Vylepšení zbraní',
            quantity: 1,
            weight: 5,
            value: 800
          }
        ]
      },
      difficulty: 4,
      location: 'Beta Sector'
    });

    // Mining quest
    this.createQuest({
      title: 'Asteroid mining operace',
      description: 'Těžte cenné minerály z asteroidového pásu. Buďte opatrní na asteroidy s vysokou radioaktivitou.',
      type: QuestType.MINING,
      objectives: [
        {
          id: 'mine_iron',
          description: 'Vytěžte 20 jednotek železa',
          type: 'collect',
          target: 'iron_ore',
          quantity: 20,
          currentProgress: 0,
          completed: false
        },
        {
          id: 'mine_rare_metals',
          description: 'Vytěžte 5 jednotek vzácných kovů',
          type: 'collect',
          target: 'rare_metals',
          quantity: 5,
          currentProgress: 0,
          completed: false
        }
      ],
      rewards: {
        credits: 1800,
        experience: 200
      },
      difficulty: 3,
      location: 'Asteroid Belt'
    });

    // Add quests to available list
    this.availableQuests = Array.from(this.activeQuests.values());
  }

  /**
   * Create a new quest
   */
  public createQuest(questData: Partial<Quest>): Quest {
    const quest: Quest = {
      id: `quest_${this.questIdCounter++}`,
      title: questData.title || 'Untitled Quest',
      description: questData.description || 'No description',
      type: questData.type || QuestType.DELIVERY,
      status: QuestStatus.AVAILABLE,
      objectives: questData.objectives || [],
      rewards: questData.rewards || { credits: 0, experience: 0 },
      difficulty: questData.difficulty || 1,
      timeLimit: questData.timeLimit,
      timeRemaining: questData.timeLimit,
      location: questData.location,
      npcGiver: questData.npcGiver
    };

    this.activeQuests.set(quest.id, quest);
    return quest;
  }

  /**
   * Accept a quest
   */
  public acceptQuest(questId: string): boolean {
    const quest = this.activeQuests.get(questId);
    if (!quest || quest.status !== QuestStatus.AVAILABLE) {
      return false;
    }

    quest.status = QuestStatus.ACTIVE;
    console.log(`Quest accepted: ${quest.title}`);
    return true;
  }

  /**
   * Update quest progress
   */
  public updateProgress(action: string, target?: string, amount: number = 1): void {
    this.activeQuests.forEach(quest => {
      if (quest.status !== QuestStatus.ACTIVE) return;

      quest.objectives.forEach(objective => {
        if (objective.completed) return;

        let shouldUpdate = false;

        // Check if this action matches the objective
        switch (objective.type) {
          case 'kill':
            shouldUpdate = action === 'kill' && objective.target === target;
            break;
          case 'collect':
            shouldUpdate = action === 'collect' && objective.target === target;
            break;
          case 'deliver':
            shouldUpdate = action === 'deliver' && objective.target === target;
            break;
          case 'visit':
            shouldUpdate = action === 'visit' && objective.target === target;
            break;
          case 'survive':
            shouldUpdate = action === 'survive';
            break;
        }

        if (shouldUpdate) {
          objective.currentProgress = Math.min(
            objective.currentProgress + amount,
            objective.quantity
          );

          if (objective.currentProgress >= objective.quantity) {
            objective.completed = true;
            console.log(`Objective completed: ${objective.description}`);
            
            // Check if all objectives are completed
            if (quest.objectives.every(obj => obj.completed)) {
              this.completeQuest(quest.id);
            }
          }
        }
      });
    });
  }

  /**
   * Complete a quest
   */
  public completeQuest(questId: string): boolean {
    const quest = this.activeQuests.get(questId);
    if (!quest || quest.status !== QuestStatus.ACTIVE) {
      return false;
    }

    quest.status = QuestStatus.COMPLETED;
    this.completedQuests.add(questId);

    // Award rewards
    this.awardRewards(quest);
    
    console.log(`Quest completed: ${quest.title}`);
    return true;
  }

  /**
   * Fail a quest
   */
  public failQuest(questId: string, reason?: string): boolean {
    const quest = this.activeQuests.get(questId);
    if (!quest || quest.status !== QuestStatus.ACTIVE) {
      return false;
    }

    quest.status = QuestStatus.FAILED;
    console.log(`Quest failed: ${quest.title}${reason ? ` - ${reason}` : ''}`);
    return true;
  }

  /**
   * Update quest timers
   */
  public updateTimers(deltaTime: number): void {
    this.activeQuests.forEach(quest => {
      if (quest.status === QuestStatus.ACTIVE && quest.timeRemaining !== undefined) {
        quest.timeRemaining -= deltaTime;
        
        if (quest.timeRemaining <= 0) {
          this.failQuest(quest.id, 'Time limit exceeded');
        }
      }
    });
  }

  /**
   * Get active quests
   */
  public getActiveQuests(): Quest[] {
    return Array.from(this.activeQuests.values())
      .filter(quest => quest.status === QuestStatus.ACTIVE);
  }

  /**
   * Get available quests
   */
  public getAvailableQuests(): Quest[] {
    return Array.from(this.activeQuests.values())
      .filter(quest => quest.status === QuestStatus.AVAILABLE);
  }

  /**
   * Get completed quests
   */
  public getCompletedQuests(): Quest[] {
    return Array.from(this.activeQuests.values())
      .filter(quest => quest.status === QuestStatus.COMPLETED);
  }

  /**
   * Generate random quest
   */
  public generateRandomQuest(playerLevel: number = 1): Quest {
    const random = new SeededRandom(Date.now());
    const questTypes = Object.values(QuestType);
    const selectedType = random.choose(questTypes);
    
    const difficulty = Math.max(1, playerLevel + random.nextInt(-1, 2));
    
    const questTemplates = this.getQuestTemplates(selectedType, difficulty);
    const template = random.choose(questTemplates);
    
    return this.createQuest(template);
  }

  /**
   * Award quest rewards
   */
  private awardRewards(quest: Quest): void {
    const saveData = (window as any).saveData || { playerData: { credits: 0, experience: 0 } };
    
    // Award credits
    saveData.playerData.credits = (saveData.playerData.credits || 0) + quest.rewards.credits;
    
    // Award experience
    saveData.playerData.experience = (saveData.playerData.experience || 0) + quest.rewards.experience;
    
    // Award items to cargo
    if (quest.rewards.items) {
      const gameEngine = (window as any).game;
      if (gameEngine && gameEngine.player) {
        quest.rewards.items.forEach(item => {
          gameEngine.player.cargoItems.set(item.id, item);
        });
      }
    }
    
    // Update global save data
    (window as any).saveData = saveData;
    
    console.log(`Rewards awarded: ${quest.rewards.credits} credits, ${quest.rewards.experience} XP`);
  }

  /**
   * Get quest templates for generation
   */
  private getQuestTemplates(type: QuestType, difficulty: number): Partial<Quest>[] {
    const baseReward = difficulty * 200;
    const baseXP = difficulty * 50;

    switch (type) {
      case QuestType.DELIVERY:
        return [
          {
            title: 'Zásilka do vzdálené stanice',
            description: 'Doručte důležité zásoby na vzdálenou vesmírnou stanici.',
            type: QuestType.DELIVERY,
            objectives: [
              {
                id: 'deliver_cargo',
                description: `Doručte náklad (${difficulty * 2}x zásoby)`,
                type: 'deliver',
                target: 'supply_crate',
                quantity: difficulty * 2,
                currentProgress: 0,
                completed: false
              }
            ],
            rewards: { credits: baseReward, experience: baseXP },
            difficulty,
            timeLimit: 1200 + difficulty * 600
          }
        ];

      case QuestType.COMBAT:
        return [
          {
            title: 'Eliminace nepřátelských sil',
            description: 'Zničte nepřátelské lodě v daném sektoru.',
            type: QuestType.COMBAT,
            objectives: [
              {
                id: 'eliminate_enemies',
                description: `Zničte ${difficulty + 2} nepřátelských lodí`,
                type: 'kill',
                target: 'enemy_ship',
                quantity: difficulty + 2,
                currentProgress: 0,
                completed: false
              }
            ],
            rewards: { credits: baseReward * 1.5, experience: baseXP * 1.5 },
            difficulty
          }
        ];

      case QuestType.EXPLORATION:
        return [
          {
            title: 'Průzkum neznámého sektoru',
            description: 'Prozkoumejte nezmapovanou oblast vesmíru.',
            type: QuestType.EXPLORATION,
            objectives: [
              {
                id: 'visit_waypoints',
                description: `Navštivte ${difficulty + 1} průzkumných bodů`,
                type: 'visit',
                target: 'waypoint',
                quantity: difficulty + 1,
                currentProgress: 0,
                completed: false
              }
            ],
            rewards: { credits: baseReward * 0.8, experience: baseXP * 2 },
            difficulty
          }
        ];

      case QuestType.MINING:
        return [
          {
            title: 'Těžební operace',
            description: 'Vytěžte požadované minerály z asteroidového pole.',
            type: QuestType.MINING,
            objectives: [
              {
                id: 'mine_resources',
                description: `Vytěžte ${difficulty * 10} jednotek minerálů`,
                type: 'collect',
                target: 'mineral_ore',
                quantity: difficulty * 10,
                currentProgress: 0,
                completed: false
              }
            ],
            rewards: { credits: baseReward, experience: baseXP },
            difficulty
          }
        ];

      default:
        return [
          {
            title: 'Základní úkol',
            description: 'Splňte základní úkol.',
            type: QuestType.DELIVERY,
            objectives: [
              {
                id: 'basic_objective',
                description: 'Dokončete základní úkol',
                type: 'survive',
                quantity: 1,
                currentProgress: 0,
                completed: false
              }
            ],
            rewards: { credits: baseReward, experience: baseXP },
            difficulty
          }
        ];
    }
  }

  /**
   * Load quest data from save
   */
  public loadFromSave(questData: any): void {
    if (questData.currentQuests) {
      this.activeQuests.clear();
      questData.currentQuests.forEach((quest: Quest) => {
        this.activeQuests.set(quest.id, quest);
      });
    }

    if (questData.completedQuests) {
      this.completedQuests = new Set(questData.completedQuests);
    }
  }

  /**
   * Get quest data for saving
   */
  public getSaveData(): any {
    return {
      currentQuests: Array.from(this.activeQuests.values()),
      completedQuests: Array.from(this.completedQuests)
    };
  }
}