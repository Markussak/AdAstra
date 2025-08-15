// main.ts - Main game engine and initialization

import {
  GameState,
  IGameEngine,
  IRenderer,
  IStateManager,
  ISceneManager,
  IInputManager,
  ICamera,
  IStatusBar,
  IPlayerShip,
  IGameState,
  GameSetup,
  DifficultyLevel,
  ShipType
} from './types';
import { gameConfig } from './utils';
import { Renderer } from './renderer';
import { Camera } from './camera';
import { InputManager } from './input';
import { PlayerShip } from './player';
import { StarSystemScene, InterstellarSpaceScene } from './scenes';
import { SHIP_TEMPLATES, DIFFICULTY_SETTINGS, LOADING_MESSAGES, WEAPON_DATA } from './gameData';
import { SaveSystem, AutoSaveManager } from './saveSystem';
import { QuestSystem } from './questSystem';
import { EffectSystem } from './effectSystem';

// State Management
class StateManager implements IStateManager {
  public states: Map<GameState, IGameState> = new Map();
  public currentState: GameState = GameState.LOADING;
  public transitionInProgress: boolean = false;

  constructor() {
    this.registerStates();
    
    // Enter the initial state
    const initialState = this.states.get(this.currentState);
    if (initialState?.enter) {
      console.log(`Entering initial state: ${this.currentState}`);
      initialState.enter();
    }
  }

  private registerStates(): void {
    this.states.set(GameState.LOADING, new LoadingState());
    this.states.set(GameState.MAIN_MENU, new MainMenuState());
    this.states.set(GameState.NEW_GAME_SETUP, new NewGameSetupState());
    this.states.set(GameState.PLAYING, new PlayingState());
    this.states.set(GameState.PAUSED, new PausedState());
    this.states.set(GameState.SETTINGS, new SettingsState());
  }

  public setState(newState: GameState): void {
    if (this.transitionInProgress) return;

    this.transitionInProgress = true;

    const currentStateObj = this.states.get(this.currentState);
    if (currentStateObj?.exit) {
      currentStateObj.exit();
    }

    this.currentState = newState;

    const newStateObj = this.states.get(this.currentState);
    if (newStateObj?.enter) {
      console.log(`Entering state: ${this.currentState}`);
      newStateObj.enter();
    }

    this.transitionInProgress = false;
  }

  public update(deltaTime: number): void {
    const state = this.states.get(this.currentState);
    if (state) {
      state.update(deltaTime);
    }
  }

  public render(renderer: IRenderer): void {
    const state = this.states.get(this.currentState);
    if (state) {
      state.render(renderer);
    }
  }

  public handleInput(input: IInputManager): void {
    const state = this.states.get(this.currentState);
    if (state) {
      state.handleInput(input);
    }
  }

  public getCurrentState(): GameState {
    return this.currentState;
  }
}

// Game States
class LoadingState implements IGameState {
  private progress: number = 0;
  private loadingTexts: string[] = LOADING_MESSAGES;
  private currentTextIndex: number = 0;
  private lastUpdate: number = 0;
  private startTime: number = 0;

  public enter(): void {
    console.log('Loading state entered');
    this.progress = 0;
    this.currentTextIndex = 0;
    this.lastUpdate = Date.now();
    this.startTime = Date.now();
    
    // Initialize HTML loading display
    this.updateHTMLLoadingDisplay();
  }

  public update(deltaTime: number): void {
    const now = Date.now();
    const elapsed = now - this.startTime;
    
    // Simulate realistic loading with minimum time
    if (elapsed > 300 && now - this.lastUpdate > 150) {
      this.progress += Math.random() * 15 + 5;
      if (this.progress > 100) this.progress = 100;

      if (Math.random() < 0.4 && this.currentTextIndex < this.loadingTexts.length - 1) {
        this.currentTextIndex++;
      }
      
      // Update HTML loading overlay
      this.updateHTMLLoadingDisplay();
      
      this.lastUpdate = now;
      
      if (this.progress >= 100 && elapsed > 2000) {
        setTimeout(() => {
          console.log('Loading complete, switching to main menu');
          this.hideHTMLLoadingOverlay();
          if ((window as any).game?.stateManager) {
            (window as any).game.stateManager.setState(GameState.MAIN_MENU);
          }
        }, 500);
      }
    }
  }

  private updateHTMLLoadingDisplay(): void {
    const loadingFill = document.getElementById('loadingFill');
    const loadingText = document.getElementById('loadingText');
    const loadingPercent = document.getElementById('loadingPercent');
    
    if (loadingFill) {
      loadingFill.style.width = `${this.progress}%`;
    }
    
    if (loadingText && this.currentTextIndex < this.loadingTexts.length) {
      loadingText.textContent = this.loadingTexts[this.currentTextIndex];
    }
    
    if (loadingPercent) {
      loadingPercent.textContent = `${Math.round(this.progress)}%`;
    }
  }

  private hideHTMLLoadingOverlay(): void {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
      loadingOverlay.classList.add('hidden');
      // Remove the overlay completely after transition
      setTimeout(() => {
        if (loadingOverlay.parentNode) {
          loadingOverlay.parentNode.removeChild(loadingOverlay);
        }
      }, 1000);
    }
  }

  public render(renderer: IRenderer): void {
    const width = renderer.getWidth();
    const height = renderer.getHeight();

    // Background
    renderer.clear('#1a1a1a');
    
    // Stars in background
    for (let i = 0; i < 100; i++) {
      const x = (i * 123.456) % width;
      const y = (i * 789.123) % height;
      const alpha = Math.sin(Date.now() * 0.001 + i) * 0.3 + 0.7;
      renderer.getContext().globalAlpha = alpha * 0.1;
      renderer.drawRect(x, y, 1, 1, '#606060');
    }
    renderer.getContext().globalAlpha = 1.0;

    // Title
    renderer.drawText('STAR DUST VOYAGER', width/2, height/2 - 150, '#606060', 'bold 48px "Big Apple 3PM", monospace');
    renderer.drawText('GALAXY WANDERER', width/2, height/2 - 100, '#505050', '24px "Big Apple 3PM", monospace');

    // Loading bar background
    const barWidth = 400;
    const barHeight = 20;
    const barX = width/2 - barWidth/2;
    const barY = height/2 + 50;
    
    renderer.drawRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4, '#404040');
    renderer.drawRect(barX, barY, barWidth, barHeight, '#2a2a2a');
    
    // Loading bar fill
    const fillWidth = (this.progress / 100) * barWidth;
    const gradient = renderer.getContext().createLinearGradient(barX, barY, barX + fillWidth, barY);
    gradient.addColorStop(0, '#505050');
    gradient.addColorStop(1, '#404040');
    
    renderer.getContext().fillStyle = gradient;
    renderer.getContext().fillRect(barX, barY, fillWidth, barHeight);

    // Loading text
    renderer.drawText(this.loadingTexts[this.currentTextIndex], width/2, height/2 + 100, '#606060', '14px "Big Apple 3PM", monospace');
    renderer.drawText(`${Math.round(this.progress)}%`, width/2, height/2 + 130, '#505050', '12px "Big Apple 3PM", monospace');
  }

  public handleInput(input: IInputManager): void {
    // No input handling during loading
  }
}

class MainMenuState implements IGameState {
  private selectedOption: number = 0;
  private menuOptions: string[] = ['NOVÁ HRA', 'POKRAČOVAT', 'NASTAVENÍ', 'KREDITY', 'UKONČIT'];
  private animationTime: number = 0;

  public enter(): void {
    console.log('Main menu entered');
    this.selectedOption = 0;
    this.animationTime = 0;
  }

  public update(deltaTime: number): void {
    this.animationTime += deltaTime;
  }

  public render(renderer: IRenderer): void {
    const width = renderer.getWidth();
    const height = renderer.getHeight();

    // Procedural star field background
    renderer.clear('#0a0a1a');
    
    // Stars background
    for (let i = 0; i < 200; i++) {
      const x = (i * 123.456) % width;
      const y = (i * 789.123) % height;
      const alpha = Math.sin(Date.now() * 0.001 + i) * 0.3 + 0.7;
      renderer.getContext().globalAlpha = alpha * 0.4;
      const size = Math.random() > 0.8 ? 2 : 1;
      renderer.drawRect(x, y, size, size, '#606060');
    }
    renderer.getContext().globalAlpha = 1.0;
    
    // Space nebula effect
    const gradient = renderer.getContext().createRadialGradient(width/2, height/3, 0, width/2, height/3, width);
    gradient.addColorStop(0, 'rgba(64, 32, 128, 0.1)');
    gradient.addColorStop(0.5, 'rgba(32, 16, 64, 0.05)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    renderer.getContext().fillStyle = gradient;
    renderer.getContext().fillRect(0, 0, width, height);

    // Title with no glow effect
    renderer.getContext().shadowColor = '#404040';
    renderer.getContext().shadowBlur = 0;
    renderer.drawText('STAR DUST VOYAGER', width/2, height/4, '#606060', 'bold 64px "Big Apple 3PM", monospace');
    renderer.drawText('GALAXY WANDERER', width/2, height/4 + 60, '#505050', '32px "Big Apple 3PM", monospace');
    renderer.getContext().shadowBlur = 0;

    // Menu options
    const startY = height/2 + 50;
    const spacing = 60;

    this.menuOptions.forEach((option, index) => {
      const y = startY + index * spacing;
      const isSelected = index === this.selectedOption;
      
      if (isSelected) {
        // Selection highlight
        renderer.drawRect(width/2 - 200, y - 25, 400, 50, 'rgba(64, 64, 64, 0.3)');
        renderer.drawText('▶ ' + option + ' ◀', width/2, y, '#606060', 'bold 24px "Big Apple 3PM", monospace');
      } else {
        renderer.drawText(option, width/2, y, '#505050', '20px "Big Apple 3PM", monospace');
      }
    });

    // Version info
    renderer.drawText('v2.0.0', width - 100, height - 30, '#666666', '12px "Big Apple 3PM", monospace');
    
    // Controls hint
    renderer.drawText('↑↓ Navigace | ENTER Výběr | ESC Zpět', width/2, height - 50, '#505050', '14px "Big Apple 3PM", monospace');
  }

  public handleInput(input: IInputManager): void {
    // Handle touch menu navigation
    const touchInput = input.getTouchMenuInput();
    
    if (input.wasKeyJustPressed('arrowup') || input.wasKeyJustPressed('w') || touchInput.up) {
      this.selectedOption = Math.max(0, this.selectedOption - 1);
    }
    
    if (input.wasKeyJustPressed('arrowdown') || input.wasKeyJustPressed('s') || touchInput.down) {
      this.selectedOption = Math.min(this.menuOptions.length - 1, this.selectedOption + 1);
    }
    
    if (input.wasKeyJustPressed('enter') || touchInput.select) {
      this.handleMenuSelection();
    }
  }

  private handleMenuSelection(): void {
    const game = (window as any).game;
    if (!game) return;

    switch (this.selectedOption) {
      case 0: // NOVÁ HRA
        game.stateManager.setState(GameState.NEW_GAME_SETUP);
        break;
      case 1: // POKRAČOVAT
        // Check if saves exist
        const saveList = SaveSystem.getSaveList();
        if (saveList.length > 0) {
          // Load the most recent save
          const mostRecentSave = saveList[0];
          const saveData = SaveSystem.loadGame(mostRecentSave.slot);
          if (saveData) {
            SaveSystem.applySaveData(game, saveData);
            game.stateManager.setState(GameState.PLAYING);
          } else {
            console.log('Failed to load save');
          }
        } else {
          console.log('No saves found');
        }
        break;
      case 2: // NASTAVENÍ
        game.stateManager.setState(GameState.SETTINGS);
        break;
      case 3: // KREDITY
        // TODO: Credits screen
        console.log('Credits not implemented yet');
        break;
      case 4: // UKONČIT
        if (confirm('Opravdu chcete ukončit hru?')) {
          window.close();
        }
        break;
    }
  }
}

class NewGameSetupState implements IGameState {
  private currentStep: number = 0;
  private steps: string[] = ['OBTÍŽNOST', 'POSTAVA', 'LOĎ', 'SOUHRN'];
  private gameSetup: Partial<GameSetup> = {};
  private selectedDifficulty: DifficultyLevel = DifficultyLevel.NORMAL;
  private selectedShip: ShipType = ShipType.EXPLORER;
  private playerName: string = '';
  private isEditingName: boolean = false;

  public enter(): void {
    console.log('New game setup entered');
    this.currentStep = 0;
    this.gameSetup = {};
    this.selectedDifficulty = DifficultyLevel.NORMAL;
    this.selectedShip = ShipType.EXPLORER;
    this.playerName = '';
  }

  public update(deltaTime: number): void {
    // Update logic for setup
  }

  public render(renderer: IRenderer): void {
    const width = renderer.getWidth();
    const height = renderer.getHeight();

    // Procedural background with darker theme for setup
    renderer.clear('#0a0a15');
    
    // Subtle stars background
    for (let i = 0; i < 150; i++) {
      const x = (i * 87.456) % width;
      const y = (i * 543.123) % height;
      const alpha = Math.sin(Date.now() * 0.0008 + i) * 0.2 + 0.5;
      renderer.getContext().globalAlpha = alpha * 0.3;
      renderer.drawRect(x, y, 1, 1, '#505060');
    }
    renderer.getContext().globalAlpha = 1.0;
    
    // Setup panel background
    renderer.getContext().fillStyle = 'rgba(16, 16, 32, 0.7)';
    renderer.getContext().fillRect(0, 0, width, height);

    // Title
    renderer.drawText('NASTAVENÍ NOVÉ HRY', width/2, 100, '#606060', 'bold 36px "Big Apple 3PM", monospace');

    // Step indicator
    const stepY = 150;
    this.steps.forEach((step, index) => {
      const x = (width / this.steps.length) * (index + 0.5);
      const isActive = index === this.currentStep;
      const isCompleted = index < this.currentStep;
      
      let color = '#404040';
      if (isCompleted) color = '#606060';
      if (isActive) color = '#505050';
      
      renderer.drawText(`${index + 1}. ${step}`, x, stepY, color, isActive ? 'bold 18px "Big Apple 3PM", monospace' : '16px "Big Apple 3PM", monospace');
    });

    // Render current step content
    switch (this.currentStep) {
      case 0:
        this.renderDifficultySelection(renderer);
        break;
      case 1:
        this.renderCharacterCreation(renderer);
        break;
      case 2:
        this.renderShipSelection(renderer);
        break;
      case 3:
        this.renderSummary(renderer);
        break;
    }

    // Navigation hints
    renderer.drawText('←→ Navigace | ENTER Potvrdit | ESC Zpět', width/2, height - 50, '#505050', '14px "Big Apple 3PM", monospace');
  }

  private renderDifficultySelection(renderer: IRenderer): void {
    const width = renderer.getWidth();
    const startY = 250;
    
    renderer.drawText('VYBERTE OBTÍŽNOST', width/2, startY, '#606060', 'bold 24px "Big Apple 3PM", monospace');
    
    Object.values(DifficultyLevel).forEach((difficulty, index) => {
      const settings = DIFFICULTY_SETTINGS[difficulty];
      const y = startY + 80 + index * 80;
      const isSelected = difficulty === this.selectedDifficulty;
      
      if (isSelected) {
        renderer.drawRect(width/2 - 400, y - 30, 800, 60, 'rgba(96, 96, 96, 0.2)');
      }
      
      const color = isSelected ? '#606060' : '#505050';
      renderer.drawText(settings.name, width/2 - 200, y, color, isSelected ? 'bold 20px "Big Apple 3PM", monospace' : '18px "Big Apple 3PM", monospace');
      renderer.drawText(settings.description, width/2 + 50, y, color, '14px "Big Apple 3PM", monospace');
    });
  }

  private renderCharacterCreation(renderer: IRenderer): void {
    const width = renderer.getWidth();
    const startY = 250;
    
    renderer.drawText('VYTVOŘENÍ POSTAVY', width/2, startY, '#606060', 'bold 24px "Big Apple 3PM", monospace');
    
    renderer.drawText('Jméno pilota:', width/2 - 100, startY + 80, '#606060', '18px "Big Apple 3PM", monospace');
    
    const nameBoxColor = this.isEditingName ? '#606060' : '#404040';
    renderer.drawRect(width/2 - 150, startY + 100, 300, 40, 'rgba(0, 0, 0, 0.5)');
    renderer.drawRect(width/2 - 150, startY + 100, 300, 40, nameBoxColor);
    
    const displayName = this.playerName || 'Zadejte jméno...';
    const nameColor = this.playerName ? '#606060' : '#505050';
    renderer.drawText(displayName, width/2, startY + 125, nameColor, '16px "Big Apple 3PM", monospace');
    
    if (this.isEditingName) {
      // Blinking cursor
      const cursorX = width/2 + (this.playerName.length * 9);
              renderer.drawText('|', cursorX, startY + 125, '#606060', '16px "Big Apple 3PM", monospace');
    }
    
          renderer.drawText('ENTER pro editaci | TAB pro dokončení', width/2, startY + 180, '#505050', '12px "Big Apple 3PM", monospace');
  }

  private renderShipSelection(renderer: IRenderer): void {
    const width = renderer.getWidth();
    const startY = 250;
    
    renderer.drawText('VYBERTE TYP LODĚ', width/2, startY, '#606060', 'bold 24px "Big Apple 3PM", monospace');
    
    const ships = Object.values(ShipType);
    const shipsPerRow = 3;
    const shipWidth = 250;
    const shipHeight = 120;
    
    ships.forEach((shipType, index) => {
      const template = SHIP_TEMPLATES[shipType];
      const row = Math.floor(index / shipsPerRow);
      const col = index % shipsPerRow;
      
      const x = width/2 - (shipsPerRow * shipWidth)/2 + col * shipWidth + shipWidth/2;
      const y = startY + 60 + row * (shipHeight + 20);
      
      const isSelected = shipType === this.selectedShip;
      
      if (isSelected) {
        renderer.drawRect(x - shipWidth/2, y - shipHeight/2, shipWidth, shipHeight, 'rgba(96, 96, 96, 0.3)');
      }
      
      renderer.drawRect(x - shipWidth/2 + 5, y - shipHeight/2 + 5, shipWidth - 10, shipHeight - 10, 'rgba(64, 64, 64, 0.7)');
      
      const color = isSelected ? '#606060' : '#505050';
      renderer.drawText(template.name, x, y - 35, color, isSelected ? 'bold 16px "Big Apple 3PM", monospace' : '14px "Big Apple 3PM", monospace');
      renderer.drawText(`Hull: ${template.baseStats.hull}`, x - 80, y - 10, color, '10px "Big Apple 3PM", monospace');
      renderer.drawText(`Speed: ${template.baseStats.speed}`, x + 80, y - 10, color, '10px "Big Apple 3PM", monospace');
      renderer.drawText(`Shields: ${template.baseStats.shields}`, x - 80, y + 10, color, '10px "Big Apple 3PM", monospace');
      renderer.drawText(`Cargo: ${template.baseStats.cargo}`, x + 80, y + 10, color, '10px "Big Apple 3PM", monospace');
    });
  }

  private renderSummary(renderer: IRenderer): void {
    const width = renderer.getWidth();
    const startY = 250;
    
        renderer.drawText('SOUHRN NASTAVENÍ', width/2, startY, '#606060', 'bold 24px "Big Apple 3PM", monospace');

    const difficultySettings = DIFFICULTY_SETTINGS[this.selectedDifficulty];
    const shipTemplate = SHIP_TEMPLATES[this.selectedShip];
    
    renderer.drawText('Pilot: ' + (this.playerName || 'Neznámý'), width/2, startY + 60, '#606060', '18px "Big Apple 3PM", monospace');
    renderer.drawText('Obtížnost: ' + difficultySettings.name, width/2, startY + 100, '#606060', '18px "Big Apple 3PM", monospace');
    renderer.drawText('Loď: ' + shipTemplate.name, width/2, startY + 140, '#606060', '18px "Big Apple 3PM", monospace');
    
    renderer.drawText('Počáteční zdroje:', width/2, startY + 200, '#505050', '16px "Big Apple 3PM", monospace');
    renderer.drawText(`Palivo: ${difficultySettings.startingResources.fuel}%`, width/2 - 100, startY + 230, '#505050', '14px "Big Apple 3PM", monospace');
    renderer.drawText(`Energie: ${difficultySettings.startingResources.energy}%`, width/2, startY + 230, '#505050', '14px "Big Apple 3PM", monospace');
    renderer.drawText(`Kredity: ${difficultySettings.startingResources.credits}`, width/2 + 100, startY + 230, '#505050', '14px "Big Apple 3PM", monospace');
    
    renderer.drawText('ENTER pro zahájení hry', width/2, startY + 300, '#606060', 'bold 20px "Big Apple 3PM", monospace');
  }

  public handleInput(input: IInputManager): void {
    if (input.wasKeyJustPressed('escape')) {
      const game = (window as any).game;
      if (game) {
        game.stateManager.setState(GameState.MAIN_MENU);
      }
      return;
    }

    // Handle name editing
    if (this.currentStep === 1) {
      if (input.wasKeyJustPressed('enter')) {
        this.isEditingName = !this.isEditingName;
        return;
      }
      
      if (this.isEditingName) {
        // Simple text input handling (you might want to use a proper text input library)
        input.keys.forEach((keyState, key) => {
          if (keyState.justPressed && key.length === 1 && this.playerName.length < 20) {
            this.playerName += key.toUpperCase();
          }
        });
        
        if (input.wasKeyJustPressed('backspace') && this.playerName.length > 0) {
          this.playerName = this.playerName.slice(0, -1);
        }
        
        if (input.wasKeyJustPressed('tab')) {
          this.isEditingName = false;
        }
        return;
      }
    }

    // Navigation between steps
    if (input.wasKeyJustPressed('arrowleft') && this.currentStep > 0) {
      this.currentStep--;
    }
    
    if (input.wasKeyJustPressed('arrowright') && this.currentStep < this.steps.length - 1) {
      this.currentStep++;
    }

    // Step-specific input
    switch (this.currentStep) {
      case 0: // Difficulty selection
        if (input.wasKeyJustPressed('arrowup') || input.wasKeyJustPressed('arrowdown')) {
          const difficulties = Object.values(DifficultyLevel);
          const currentIndex = difficulties.indexOf(this.selectedDifficulty);
          const newIndex = input.wasKeyJustPressed('arrowup') 
            ? Math.max(0, currentIndex - 1)
            : Math.min(difficulties.length - 1, currentIndex + 1);
          this.selectedDifficulty = difficulties[newIndex];
        }
        break;
        
      case 2: // Ship selection
        if (input.wasKeyJustPressed('arrowup') || input.wasKeyJustPressed('arrowdown') ||
            input.wasKeyJustPressed('arrowleft') || input.wasKeyJustPressed('arrowright')) {
          const ships = Object.values(ShipType);
          const currentIndex = ships.indexOf(this.selectedShip);
          let newIndex = currentIndex;
          
          if (input.wasKeyJustPressed('arrowleft')) newIndex = Math.max(0, currentIndex - 1);
          if (input.wasKeyJustPressed('arrowright')) newIndex = Math.min(ships.length - 1, currentIndex + 1);
          if (input.wasKeyJustPressed('arrowup')) newIndex = Math.max(0, currentIndex - 3);
          if (input.wasKeyJustPressed('arrowdown')) newIndex = Math.min(ships.length - 1, currentIndex + 3);
          
          this.selectedShip = ships[newIndex];
        }
        break;
        
      case 3: // Summary
        if (input.wasKeyJustPressed('enter')) {
          this.startGame();
        }
        break;
    }
  }

  private startGame(): void {
    const game = (window as any).game;
    if (!game) return;

    // Apply setup to game
    this.gameSetup = {
      playerName: this.playerName || 'Neznámý Pilot',
      difficulty: this.selectedDifficulty,
      shipType: this.selectedShip,
      startingResources: DIFFICULTY_SETTINGS[this.selectedDifficulty].startingResources
    };

    // Store setup globally for game initialization
    (window as any).gameSetup = this.gameSetup;

    game.stateManager.setState(GameState.PLAYING);
  }
}

class PlayingState implements IGameState {
  public enter(): void {
    console.log('Entering playing state');
    
    // Initialize game with setup if available
    const game = (window as any).game;
    const gameSetup = (window as any).gameSetup as GameSetup;
    
    if (gameSetup && game.player) {
      // Apply difficulty and ship settings to player
      const difficultySettings = DIFFICULTY_SETTINGS[gameSetup.difficulty];
      const shipTemplate = SHIP_TEMPLATES[gameSetup.shipType];
      
      // Apply starting resources
      game.player.fuel = gameSetup.startingResources.fuel;
      game.player.energy = gameSetup.startingResources.energy;
      
      // Apply ship stats
      game.player.maxHull = shipTemplate.baseStats.hull;
      game.player.hull = shipTemplate.baseStats.hull;
      game.player.maxShields = shipTemplate.baseStats.shields;
      game.player.shields = shipTemplate.baseStats.shields;
      game.player.maxCargoWeight = shipTemplate.baseStats.cargo;
      
      console.log(`Game started as ${gameSetup.playerName} with ${gameSetup.shipType} on ${gameSetup.difficulty} difficulty`);
    }
  }

  public update(deltaTime: number): void {
    // Game logic is handled by GameEngine
  }

  public render(renderer: IRenderer): void {
    // Game rendering is handled by GameEngine
  }

  public handleInput(input: IInputManager): void {
    if (input.wasKeyJustPressed('escape')) {
      const game = (window as any).game;
      if (game) {
        game.stateManager.setState(GameState.PAUSED);
      }
    }
    
    // Quick save/load
    if (input.wasKeyJustPressed('F5')) {
      const game = (window as any).game;
      if (game && SaveSystem.saveGame(game, 'quicksave')) {
        console.log('Quick save completed');
      }
    }
    
    if (input.wasKeyJustPressed('F9')) {
      const game = (window as any).game;
      if (game) {
        const saveData = SaveSystem.loadGame('quicksave');
        if (saveData) {
          SaveSystem.applySaveData(game, saveData);
          console.log('Quick load completed');
        } else {
          console.log('No quicksave found');
        }
      }
    }
    
    // Warp drive
    if (input.wasKeyJustPressed('j')) {
      const game = (window as any).game;
      if (game && game.player.canWarp()) {
        game.player.initiateWarp();
        console.log('Warp drive initiated!');
      } else {
        console.log('Cannot warp: insufficient charge/energy/fuel');
      }
    }
    
    // Test damage (for testing shield effects)
    if (input.wasKeyJustPressed('h')) {
      const game = (window as any).game;
      if (game && game.player) {
        game.player.takeDamage(25);
        console.log('Player took 25 damage');
      }
    }
  }
}

class PausedState implements IGameState {
  private selectedOption: number = 0;
  private menuOptions: string[] = ['POKRAČOVAT', 'NASTAVENÍ', 'HLAVNÍ MENU', 'UKONČIT'];

  public enter(): void {
    console.log('Game paused');
    this.selectedOption = 0;
  }

  public update(deltaTime: number): void {
    // Pause update logic
  }

  public render(renderer: IRenderer): void {
    const width = renderer.getWidth();
    const height = renderer.getHeight();
    
    // Semi-transparent overlay
    renderer.getContext().fillStyle = 'rgba(0, 0, 0, 0.7)';
    renderer.getContext().fillRect(0, 0, width, height);
    
    renderer.drawText('HRA POZASTAVENA', width/2, height/2 - 100, '#ff8c00', 'bold 32px "Big Apple 3PM", monospace');
    
    // Menu options
    const startY = height/2 + 20;
    const spacing = 50;

    this.menuOptions.forEach((option, index) => {
      const y = startY + index * spacing;
      const isSelected = index === this.selectedOption;
      
      if (isSelected) {
        renderer.drawText('▶ ' + option + ' ◀', width/2, y, '#00ffff', 'bold 20px "Big Apple 3PM", monospace');
      } else {
        renderer.drawText(option, width/2, y, '#dcd0c0', '18px "Big Apple 3PM", monospace');
      }
    });
  }

  public handleInput(input: IInputManager): void {
    const touchInput = input.getTouchMenuInput();
    
    if (input.wasKeyJustPressed('escape') || touchInput.back) {
      const game = (window as any).game;
      if (game) {
        game.stateManager.setState(GameState.PLAYING);
      }
      return;
    }

    if (input.wasKeyJustPressed('arrowup') || input.wasKeyJustPressed('w') || touchInput.up) {
      this.selectedOption = Math.max(0, this.selectedOption - 1);
    }
    
    if (input.wasKeyJustPressed('arrowdown') || input.wasKeyJustPressed('s') || touchInput.down) {
      this.selectedOption = Math.min(this.menuOptions.length - 1, this.selectedOption + 1);
    }
    
    if (input.wasKeyJustPressed('enter') || touchInput.select) {
      this.handleMenuSelection();
    }
  }

  private handleMenuSelection(): void {
    const game = (window as any).game;
    if (!game) return;

    switch (this.selectedOption) {
      case 0: // POKRAČOVAT
        game.stateManager.setState(GameState.PLAYING);
        break;
      case 1: // NASTAVENÍ
        console.log('Settings not implemented yet');
        break;
      case 2: // HLAVNÍ MENU
        if (confirm('Opravdu se chcete vrátit do hlavního menu? Neuložený postup bude ztracen.')) {
          game.stateManager.setState(GameState.MAIN_MENU);
        }
        break;
      case 3: // UKONČIT
        if (confirm('Opravdu chcete ukončit hru? Neuložený postup bude ztracen.')) {
          window.close();
        }
        break;
    }
  }
}

class SettingsState implements IGameState {
  private selectedTab: number = 0;
  private selectedOption: number = 0;
  private tabs: string[] = ['GRAFIKA', 'ZVUK', 'OVLÁDÁNÍ', 'GAMEPLAY'];
  private settings: any;
  private isEditing: boolean = false;

  public enter(): void {
    console.log('Settings entered');
    this.selectedTab = 0;
    this.selectedOption = 0;
    this.settings = SaveSystem.loadSettings();
    
    // Apply loaded touch controls setting
    const game = (window as any).game;
    if (game?.inputManager && this.settings.controls) {
      game.inputManager.setTouchControlsEnabled(this.settings.controls.touchControlsEnabled);
    }
  }

  public update(deltaTime: number): void {
    // Settings update logic
  }

  public render(renderer: IRenderer): void {
    const width = renderer.getWidth();
    const height = renderer.getHeight();

    // Background
    renderer.clear('#0a0a0f');
    
    // Title
    renderer.drawText('NASTAVENÍ', width/2, 80, '#00ffff', 'bold 36px "Big Apple 3PM", monospace');

    // Tab navigation
    const tabY = 150;
    this.tabs.forEach((tab, index) => {
      const x = (width / this.tabs.length) * (index + 0.5);
      const isActive = index === this.selectedTab;
      
      const color = isActive ? '#00ffff' : '#888888';
      const font = isActive ? 'bold 18px "Big Apple 3PM", monospace' : '16px "Big Apple 3PM", monospace';
      
      renderer.drawText(tab, x, tabY, color, font);
      
      if (isActive) {
        renderer.drawRect(x - 50, tabY + 10, 100, 2, '#00ffff');
      }
    });

    // Settings content
    this.renderSettingsContent(renderer);

    // Controls hint
    renderer.drawText('←→ Taby | ↑↓ Možnosti | ENTER Změnit | ESC Zpět', width/2, height - 50, '#888888', '14px "Big Apple 3PM", monospace');
  }

  private renderSettingsContent(renderer: IRenderer): void {
    const width = renderer.getWidth();
    const startY = 220;
    const spacing = 50;

    switch (this.selectedTab) {
      case 0: // Graphics
        this.renderGraphicsSettings(renderer, startY, spacing);
        break;
      case 1: // Audio
        this.renderAudioSettings(renderer, startY, spacing);
        break;
      case 2: // Controls
        this.renderControlSettings(renderer, startY, spacing);
        break;
      case 3: // Gameplay
        this.renderGameplaySettings(renderer, startY, spacing);
        break;
    }
  }

  private renderGraphicsSettings(renderer: IRenderer, startY: number, spacing: number): void {
    const width = renderer.getWidth();
    const options = [
      { name: 'Celá obrazovka', value: this.settings.graphics.fullscreen ? 'ZAPNUTO' : 'VYPNUTO' },
      { name: 'Rozlišení', value: this.settings.graphics.resolution },
      { name: 'Pixel Perfect', value: this.settings.graphics.pixelPerfect ? 'ZAPNUTO' : 'VYPNUTO' },
      { name: 'Zobrazit FPS', value: this.settings.graphics.showFPS ? 'ZAPNUTO' : 'VYPNUTO' }
    ];

    options.forEach((option, index) => {
      const y = startY + index * spacing;
      const isSelected = index === this.selectedOption;
      
      const nameColor = isSelected ? '#00ffff' : '#dcd0c0';
      const valueColor = isSelected ? '#ffff00' : '#5f9e9e';
      
      renderer.drawText(option.name, width/2 - 200, y, nameColor, isSelected ? 'bold 18px "Big Apple 3PM", monospace' : '16px "Big Apple 3PM", monospace');
      renderer.drawText(option.value, width/2 + 200, y, valueColor, '16px "Big Apple 3PM", monospace');
      
      if (isSelected) {
        renderer.drawRect(width/2 - 250, y - 20, 500, 40, 'rgba(0, 255, 255, 0.1)');
      }
    });
  }

  private renderAudioSettings(renderer: IRenderer, startY: number, spacing: number): void {
    const width = renderer.getWidth();
    const options = [
      { name: 'Hlavní hlasitost', value: `${Math.round(this.settings.audio.masterVolume * 100)}%` },
      { name: 'Hudba', value: `${Math.round(this.settings.audio.musicVolume * 100)}%` },
      { name: 'Efekty', value: `${Math.round(this.settings.audio.sfxVolume * 100)}%` },
      { name: 'Ztlumeno', value: this.settings.audio.muted ? 'ANO' : 'NE' }
    ];

    options.forEach((option, index) => {
      const y = startY + index * spacing;
      const isSelected = index === this.selectedOption;
      
      const nameColor = isSelected ? '#00ffff' : '#dcd0c0';
      const valueColor = isSelected ? '#ffff00' : '#5f9e9e';
      
      renderer.drawText(option.name, width/2 - 200, y, nameColor, isSelected ? 'bold 18px "Big Apple 3PM", monospace' : '16px "Big Apple 3PM", monospace');
      renderer.drawText(option.value, width/2 + 200, y, valueColor, '16px "Big Apple 3PM", monospace');
      
      if (isSelected) {
        renderer.drawRect(width/2 - 250, y - 20, 500, 40, 'rgba(0, 255, 255, 0.1)');
      }
    });
  }

  private renderControlSettings(renderer: IRenderer, startY: number, spacing: number): void {
    const width = renderer.getWidth();
    const game = (window as any).game;
    const options = [
      { name: 'Touch Controls', value: game?.inputManager?.touchControlsEnabled ? 'ZAPNUTO' : 'VYPNUTO' },
      { name: 'Auto-detekce mobilního', value: game?.inputManager?.isMobile ? 'ZAPNUTO' : 'VYPNUTO' },
      { name: 'Citlivost joysticku', value: 'STŘEDNÍ' },
      { name: 'Gamepad podpora', value: 'VYPNUTO' }
    ];

    options.forEach((option, index) => {
      const y = startY + index * spacing;
      const isSelected = index === this.selectedOption;
      
      const nameColor = isSelected ? '#00ffff' : '#dcd0c0';
      const valueColor = isSelected ? '#ffff00' : '#5f9e9e';
      
      renderer.drawText(option.name, width/2 - 200, y, nameColor, isSelected ? 'bold 18px "Big Apple 3PM", monospace' : '16px "Big Apple 3PM", monospace');
      renderer.drawText(option.value, width/2 + 200, y, valueColor, '16px "Big Apple 3PM", monospace');
      
      if (isSelected) {
        renderer.drawRect(width/2 - 250, y - 20, 500, 40, 'rgba(0, 255, 255, 0.1)');
      }
    });
    
    // Touch controls info
    if (game?.inputManager?.isMobile) {
      renderer.drawText('Mobilní zařízení detekováno', width/2, startY + 250, '#00ff00', '14px "Big Apple 3PM", monospace');
    } else {
      renderer.drawText('Desktop zařízení detekováno', width/2, startY + 250, '#888888', '14px "Big Apple 3PM", monospace');
    }
  }

  private renderGameplaySettings(renderer: IRenderer, startY: number, spacing: number): void {
    const width = renderer.getWidth();
    const options = [
      { name: 'Automatické ukládání', value: this.settings.gameplay.autosave ? 'ZAPNUTO' : 'VYPNUTO' },
      { name: 'Interval ukládání', value: `${this.settings.gameplay.autosaveInterval}s` },
      { name: 'Zobrazit návody', value: this.settings.gameplay.showTutorials ? 'ANO' : 'NE' },
      { name: 'Pauza při ztrátě fokusu', value: this.settings.gameplay.pauseOnFocusLoss ? 'ANO' : 'NE' }
    ];

    options.forEach((option, index) => {
      const y = startY + index * spacing;
      const isSelected = index === this.selectedOption;
      
      const nameColor = isSelected ? '#00ffff' : '#dcd0c0';
      const valueColor = isSelected ? '#ffff00' : '#5f9e9e';
      
      renderer.drawText(option.name, width/2 - 200, y, nameColor, isSelected ? 'bold 18px "Big Apple 3PM", monospace' : '16px "Big Apple 3PM", monospace');
      renderer.drawText(option.value, width/2 + 200, y, valueColor, '16px "Big Apple 3PM", monospace');
      
      if (isSelected) {
        renderer.drawRect(width/2 - 250, y - 20, 500, 40, 'rgba(0, 255, 255, 0.1)');
      }
    });
  }

  public handleInput(input: IInputManager): void {
    const touchInput = input.getTouchMenuInput();
    
    if (input.wasKeyJustPressed('escape') || touchInput.back) {
      // Save settings before exiting
      SaveSystem.saveSettings(this.settings);
      const game = (window as any).game;
      if (game) {
        game.stateManager.setState(GameState.MAIN_MENU);
      }
      return;
    }

    // Tab navigation
    if (input.wasKeyJustPressed('arrowleft') && this.selectedTab > 0) {
      this.selectedTab--;
      this.selectedOption = 0;
    }
    
    if (input.wasKeyJustPressed('arrowright') && this.selectedTab < this.tabs.length - 1) {
      this.selectedTab++;
      this.selectedOption = 0;
    }

    // Option navigation
    const maxOptions = this.getMaxOptionsForTab();
    if ((input.wasKeyJustPressed('arrowup') || touchInput.up) && this.selectedOption > 0) {
      this.selectedOption--;
    }
    
    if ((input.wasKeyJustPressed('arrowdown') || touchInput.down) && this.selectedOption < maxOptions - 1) {
      this.selectedOption++;
    }

    // Modify settings
    if (input.wasKeyJustPressed('enter') || touchInput.select) {
      this.modifySetting();
    }
  }

  private getMaxOptionsForTab(): number {
    switch (this.selectedTab) {
      case 0: return 4; // Graphics
      case 1: return 4; // Audio
      case 2: return 4; // Controls
      case 3: return 4; // Gameplay
      default: return 0;
    }
  }

  private modifySetting(): void {
    const game = (window as any).game;
    
    switch (this.selectedTab) {
      case 0: // Graphics
        switch (this.selectedOption) {
          case 0: // Fullscreen
            this.settings.graphics.fullscreen = !this.settings.graphics.fullscreen;
            break;
          case 1: // Resolution
            // Cycle through common resolutions
            const resolutions = ['1920x1080', '1680x1050', '1366x768', '1280x720'];
            const currentIndex = resolutions.indexOf(this.settings.graphics.resolution);
            const nextIndex = (currentIndex + 1) % resolutions.length;
            this.settings.graphics.resolution = resolutions[nextIndex];
            break;
          case 2: // Pixel Perfect
            this.settings.graphics.pixelPerfect = !this.settings.graphics.pixelPerfect;
            break;
          case 3: // Show FPS
            this.settings.graphics.showFPS = !this.settings.graphics.showFPS;
            break;
        }
        break;
        
      case 1: // Audio
        switch (this.selectedOption) {
          case 0: // Master Volume
            this.settings.audio.masterVolume = Math.min(1.0, this.settings.audio.masterVolume + 0.1);
            if (this.settings.audio.masterVolume > 0.95) this.settings.audio.masterVolume = 0;
            break;
          case 1: // Music Volume
            this.settings.audio.musicVolume = Math.min(1.0, this.settings.audio.musicVolume + 0.1);
            if (this.settings.audio.musicVolume > 0.95) this.settings.audio.musicVolume = 0;
            break;
          case 2: // SFX Volume
            this.settings.audio.sfxVolume = Math.min(1.0, this.settings.audio.sfxVolume + 0.1);
            if (this.settings.audio.sfxVolume > 0.95) this.settings.audio.sfxVolume = 0;
            break;
          case 3: // Muted
            this.settings.audio.muted = !this.settings.audio.muted;
            break;
        }
        break;
        
      case 2: // Controls
        switch (this.selectedOption) {
          case 0: // Touch Controls
            if (game?.inputManager) {
              const newValue = !game.inputManager.touchControlsEnabled;
              game.inputManager.setTouchControlsEnabled(newValue);
              this.settings.controls = this.settings.controls || {};
              this.settings.controls.touchControlsEnabled = newValue;
            }
            break;
          case 1: // Auto-detect mobile (read-only)
            // This is read-only, do nothing
            break;
          case 2: // Joystick sensitivity
            // TODO: Implement joystick sensitivity
            console.log('Joystick sensitivity not implemented yet');
            break;
          case 3: // Gamepad support
            // TODO: Implement gamepad support
            console.log('Gamepad support not implemented yet');
            break;
        }
        break;
        
      case 3: // Gameplay
        switch (this.selectedOption) {
          case 0: // Autosave
            this.settings.gameplay.autosave = !this.settings.gameplay.autosave;
            break;
          case 1: // Autosave Interval
            const intervals = [60, 180, 300, 600, 900]; // 1, 3, 5, 10, 15 minutes
            const currentIndex = intervals.indexOf(this.settings.gameplay.autosaveInterval);
            const nextIndex = (currentIndex + 1) % intervals.length;
            this.settings.gameplay.autosaveInterval = intervals[nextIndex];
            break;
          case 2: // Show Tutorials
            this.settings.gameplay.showTutorials = !this.settings.gameplay.showTutorials;
            break;
          case 3: // Pause on Focus Loss
            this.settings.gameplay.pauseOnFocusLoss = !this.settings.gameplay.pauseOnFocusLoss;
            break;
        }
        break;
    }
  }
}

// Simple Scene Manager (simplified for now)
class SceneManager implements ISceneManager {
  public scenes: Map<any, any> = new Map();
  public currentScene: any = 'starSystem';
  public transitionInProgress: boolean = false;

  public switchScene(newScene: any): void {
    if (this.transitionInProgress) return;

    this.transitionInProgress = true;

    setTimeout(() => {
      this.currentScene = newScene;
      this.transitionInProgress = false;
    }, 500);
  }

  public getCurrentScene(): any {
    return new StarSystemScene();
  }

  public getCurrentSceneType(): any {
    return this.currentScene;
  }

  public update(deltaTime: number, game: any): void {
    this.getCurrentScene().update(deltaTime, game);
  }

  public render(renderer: IRenderer, camera: ICamera): void {
    this.getCurrentScene().render(renderer, camera);
  }
}

// Simple Status Bar (simplified for now)
class StatusBar implements IStatusBar {
  public height: number = 0;
  public panels: any[] = [];
  private renderer: IRenderer;

  constructor(renderer: IRenderer) {
    this.renderer = renderer;
  }

  public update(player: IPlayerShip): void {
    const screenHeight = this.renderer.getHeight();
    this.height = Math.floor(screenHeight * gameConfig.ui.statusBarHeight);
  }

  public render(player: IPlayerShip): void {
    const screenWidth = this.renderer.getWidth();
    const screenHeight = this.renderer.getHeight();
    const statusY = screenHeight - this.height;

    // Draw simple status bar
    this.renderer.drawRect(0, statusY, screenWidth, this.height, '#2a2a2a');
    this.renderer.drawRect(0, screenHeight - 5, screenWidth, 5, '#404040');

    // Draw basic ship stats
    this.renderer.drawText(`HULL: ${Math.round(player.hull)}%`, 20, statusY + 20, '#606060', '10px "Big Apple 3PM", monospace');
    this.renderer.drawText(`SHIELDS: ${Math.round(player.shields)}%`, 20, statusY + 35, '#606060', '10px "Big Apple 3PM", monospace');
    this.renderer.drawText(`FUEL: ${Math.round(player.fuel)}%`, 20, statusY + 50, '#606060', '10px "Big Apple 3PM", monospace');
    this.renderer.drawText(`ENERGY: ${Math.round(player.energy)}%`, 20, statusY + 65, '#606060', '10px "Big Apple 3PM", monospace');

    // Draw weapon info
    const weapon = player.getWeaponStatus(player.selectedWeapon);
    if (weapon) {
      this.renderer.drawText(`WEAPON: ${weapon.type.toUpperCase()}`, screenWidth - 200, statusY + 20, '#505050', '10px "Big Apple 3PM", monospace');
      this.renderer.drawText(`HEAT: ${Math.round(weapon.heat)}%`, screenWidth - 200, statusY + 35, '#505050', '10px "Big Apple 3PM", monospace');
      if (weapon.ammo !== undefined) {
        this.renderer.drawText(`AMMO: ${weapon.ammo}/${weapon.maxAmmo}`, screenWidth - 200, statusY + 50, '#505050', '10px "Big Apple 3PM", monospace');
      }
    }
  }
}

// Main Game Engine
export class GameEngine implements IGameEngine {
  public canvas: HTMLCanvasElement;
  public renderer: IRenderer;
  public stateManager: IStateManager;
  public sceneManager: ISceneManager;
  public inputManager: IInputManager;
  public camera: ICamera;
  public statusBar: IStatusBar;
  public player: IPlayerShip;
  public questSystem: QuestSystem;
  public effectSystem: EffectSystem;
  public gameTime: number = 0;
  public lastFrameTime: number = 0;

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!this.canvas) {
      throw new Error(`Canvas with id '${canvasId}' not found`);
    }

    this.renderer = new Renderer(this.canvas);
    this.stateManager = new StateManager();
    this.sceneManager = new SceneManager();
    this.inputManager = new InputManager();
    this.camera = new Camera();
    this.statusBar = new StatusBar(this.renderer);

    this.player = new PlayerShip(200, 200);
    this.questSystem = new QuestSystem();
    this.effectSystem = new EffectSystem();

    console.log('Game engine initialized');
    
    // Initialize touch controls from settings
    const settings = SaveSystem.loadSettings();
    if (settings.controls && this.inputManager.isMobile) {
      this.inputManager.setTouchControlsEnabled(settings.controls.touchControlsEnabled);
    }
    
    // Start auto-save system
    AutoSaveManager.start(this);
    
    this.startGameLoop();
  }

  public startGameLoop(): void {
    const gameLoop = (currentTime: number) => {
      // Fix: Initialize lastFrameTime if it's the first frame
      if (this.lastFrameTime === 0) {
        this.lastFrameTime = currentTime;
      }
      
      const deltaTime = Math.min((currentTime - this.lastFrameTime) / 1000, 0.016);
      this.lastFrameTime = currentTime;
      this.gameTime = currentTime / 1000;

      this.update(deltaTime);
      this.render();
      
      requestAnimationFrame(gameLoop);
    };

    console.log('Starting game loop');
    requestAnimationFrame(gameLoop);
  }

  public update(deltaTime: number): void {
    this.inputManager.update();
    this.stateManager.update(deltaTime);
    this.stateManager.handleInput(this.inputManager);

    if (this.stateManager.getCurrentState() === GameState.PLAYING) {
      this.player.update(deltaTime, this);
      this.sceneManager.update(deltaTime, this);
      this.questSystem.updateTimers(deltaTime);
      this.effectSystem.update(deltaTime);
      
      // Update quest progress based on player actions
      this.questSystem.updateProgress('survive', undefined, deltaTime);
      
      this.camera.followTarget(
        this.player.position, 
        deltaTime, 
        this.renderer.getWidth(), 
        this.renderer.getHeight()
      );
      this.statusBar.update(this.player);
    }
  }

  public render(): void {
    this.renderer.clear(gameConfig.colors.bgPrimary);

    if (this.stateManager.getCurrentState() === GameState.PLAYING) {
      this.sceneManager.render(this.renderer, this.camera);
      this.player.render(this.renderer, this.camera);
      
      // Render visual effects
      this.effectSystem.render(this.renderer);
      
      this.renderHUD();
      this.statusBar.render(this.player);
      
      // Render touch controls for mobile
      this.inputManager.renderTouchControls(this.renderer);
    } else {
      this.stateManager.render(this.renderer);
    }
  }

  public renderHUD(): void {
    const width = this.renderer.getWidth();
    const height = this.renderer.getHeight();

    // Crosshair
    this.renderer.drawLine(width/2 - 8, height/2, width/2 + 8, height/2, 'rgba(96, 96, 96, 0.6)', 1);
    this.renderer.drawLine(width/2, height/2 - 8, width/2, height/2 + 8, 'rgba(96, 96, 96, 0.6)', 1);

    // Coordinates and status
    this.renderer.drawText(`X: ${Math.round(this.player.position.x)} AU`, 10, 25, '#505050', '10px "Big Apple 3PM", monospace');
    this.renderer.drawText(`Y: ${Math.round(this.player.position.y)} AU`, 10, 40, '#505050', '10px "Big Apple 3PM", monospace');

    const speed = Math.sqrt(this.player.velocity.x ** 2 + this.player.velocity.y ** 2);
    this.renderer.drawText(`V: ${(speed * 100).toFixed(1)} m/s`, 10, 55, '#505050', '10px "Big Apple 3PM", monospace');

    // Current scene info
    this.renderer.drawText(`SCENE: STAR SYSTEM`, 10, 70, '#505050', '10px "Big Apple 3PM", monospace');

    // Active quests
    this.renderActiveQuests();

    // Warp charge indicator
    const warpPercent = Math.round((this.player.warpCharge / this.player.maxWarpCharge) * 100);
    const warpColor = this.player.canWarp() ? '#606060' : '#505050';
    this.renderer.drawText(`WARP: ${warpPercent}%`, 10, 100, warpColor, 'bold 10px "Big Apple 3PM", monospace');
    
    if (this.player.isWarping) {
      this.renderer.drawText('WARPING...', 10, 115, '#505050', 'bold 12px "Big Apple 3PM", monospace');
    }

    // Instructions
    const statusBarHeight = this.renderer.getHeight() * gameConfig.ui.statusBarHeight;
    const game = (window as any).game;
    const instructionText = game?.inputManager?.isMobile 
      ? 'Touch: Joystick Move | FIRE Button | WARP Button | PAUSE Menu'
      : 'WASD: Move | SPACE: Fire | ESC: Menu | Q: Quests | J: Warp | H: Test Damage';
    
    this.renderer.drawText(instructionText, 10, 
      this.renderer.getHeight() - statusBarHeight - 20, '#505050', '8px "Big Apple 3PM", monospace');
  }

  public renderActiveQuests(): void {
    const activeQuests = this.questSystem.getActiveQuests();
    if (activeQuests.length === 0) return;

    const width = this.renderer.getWidth();
    const startX = width - 350;
    const startY = 20;

    // Quest panel background
    this.renderer.drawRect(startX - 10, startY - 10, 340, Math.min(200, activeQuests.length * 60 + 40), 'rgba(0, 0, 0, 0.7)');
    this.renderer.drawText('AKTIVNÍ ÚKOLY', startX + 160, startY + 10, '#00ffff', 'bold 12px "Big Apple 3PM", monospace');

    activeQuests.slice(0, 3).forEach((quest, index) => {
      const y = startY + 40 + index * 60;
      
      // Quest title
      this.renderer.drawText(quest.title, startX, y, '#dcd0c0', 'bold 10px "Big Apple 3PM", monospace');
      
      // Progress
      const completedObjectives = quest.objectives.filter(obj => obj.completed).length;
      this.renderer.drawText(`${completedObjectives}/${quest.objectives.length}`, startX + 280, y, '#5f9e9e', '10px "Big Apple 3PM", monospace');
      
      // Time remaining
      if (quest.timeRemaining !== undefined) {
        const minutes = Math.floor(quest.timeRemaining / 60);
        const seconds = Math.floor(quest.timeRemaining % 60);
        const timeColor = quest.timeRemaining < 300 ? '#ff4444' : '#ffff00';
        this.renderer.drawText(`${minutes}:${seconds.toString().padStart(2, '0')}`, startX + 280, y + 15, timeColor, '8px "Big Apple 3PM", monospace');
      }
      
      // Current objective
      const currentObjective = quest.objectives.find(obj => !obj.completed);
      if (currentObjective) {
        this.renderer.drawText(currentObjective.description, startX, y + 15, '#888888', '8px "Big Apple 3PM", monospace');
        
        // Progress bar for current objective
        const progress = currentObjective.currentProgress / currentObjective.quantity;
        const barWidth = 250;
        this.renderer.drawRect(startX, y + 30, barWidth, 4, '#333333');
        this.renderer.drawRect(startX, y + 30, barWidth * progress, 4, '#00ff00');
      }
    });
  }
}

// Initialization
export function initializeGame(): void {
  try {
    console.log('🚀 Initializing Star Dust Voyager: Galaxy Wanderer...');

    // Create canvas if it doesn't exist
    let canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'gameCanvas';
      canvas.style.display = 'block';
      canvas.style.background = '#1a1a2a';
      canvas.style.imageRendering = 'pixelated';
      canvas.style.imageRendering = '-moz-crisp-edges';
      canvas.style.imageRendering = 'crisp-edges';
      document.body.appendChild(canvas);
    }

    const game = new GameEngine('gameCanvas');
    (window as any).game = game;

    console.log('✅ Game initialized successfully');
    console.log('🎮 Controls: WASD/Arrow keys for movement, SPACE for fire, ESC for menu');
    console.log('🔧 Debug: Use window.game object in console');
    console.log('⚡ Features: Enhanced UI, New Game Setup, Multiple Ship Types, Difficulty Levels');

  } catch (error) {
    console.error('❌ Error initializing game:', error);
  }
}

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initializeGame);
  } else {
    initializeGame();
  }
}