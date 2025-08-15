import { GameState, DifficultyLevel, ShipType } from './types';
import { gameConfig } from './utils';
import { Renderer } from './renderer';
import { Camera } from './camera';
import { InputManager } from './input';
import { PlayerShip } from './player';
import { StarSystemScene } from './scenes';
import { SHIP_TEMPLATES, DIFFICULTY_SETTINGS, LOADING_MESSAGES } from './gameData';
import { SaveSystem, AutoSaveManager } from './saveSystem';
import { QuestSystem } from './questSystem';
import { EffectSystem } from './effectSystem';
class StateManager {
    constructor() {
        this.states = new Map();
        this.currentState = GameState.LOADING;
        this.transitionInProgress = false;
        this.registerStates();
    }
    registerStates() {
        this.states.set(GameState.LOADING, new LoadingState());
        this.states.set(GameState.MAIN_MENU, new MainMenuState());
        this.states.set(GameState.NEW_GAME_SETUP, new NewGameSetupState());
        this.states.set(GameState.PLAYING, new PlayingState());
        this.states.set(GameState.PAUSED, new PausedState());
        this.states.set(GameState.SETTINGS, new SettingsState());
    }
    setState(newState) {
        if (this.transitionInProgress)
            return;
        this.transitionInProgress = true;
        const currentStateObj = this.states.get(this.currentState);
        if (currentStateObj?.exit) {
            currentStateObj.exit();
        }
        this.currentState = newState;
        const newStateObj = this.states.get(this.currentState);
        if (newStateObj?.enter) {
            newStateObj.enter();
        }
        this.transitionInProgress = false;
    }
    update(deltaTime) {
        const state = this.states.get(this.currentState);
        if (state) {
            state.update(deltaTime);
        }
    }
    render(renderer) {
        const state = this.states.get(this.currentState);
        if (state) {
            state.render(renderer);
        }
    }
    handleInput(input) {
        const state = this.states.get(this.currentState);
        if (state) {
            state.handleInput(input);
        }
    }
    getCurrentState() {
        return this.currentState;
    }
}
class LoadingState {
    constructor() {
        this.progress = 0;
        this.loadingTexts = LOADING_MESSAGES;
        this.currentTextIndex = 0;
        this.lastUpdate = 0;
        this.startTime = 0;
    }
    enter() {
        console.log('Loading state entered');
        this.progress = 0;
        this.currentTextIndex = 0;
        this.lastUpdate = Date.now();
        this.startTime = Date.now();
        this.updateHTMLLoadingDisplay();
    }
    update(deltaTime) {
        const now = Date.now();
        const elapsed = now - this.startTime;
        if (elapsed > 300 && now - this.lastUpdate > 150) {
            this.progress += Math.random() * 15 + 5;
            if (this.progress > 100)
                this.progress = 100;
            if (Math.random() < 0.4 && this.currentTextIndex < this.loadingTexts.length - 1) {
                this.currentTextIndex++;
            }
            this.updateHTMLLoadingDisplay();
            this.lastUpdate = now;
            if (this.progress >= 100 && elapsed > 2000) {
                setTimeout(() => {
                    console.log('Loading complete, switching to main menu');
                    this.hideHTMLLoadingOverlay();
                    if (window.game?.stateManager) {
                        window.game.stateManager.setState(GameState.MAIN_MENU);
                    }
                }, 500);
            }
        }
    }
    updateHTMLLoadingDisplay() {
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
    hideHTMLLoadingOverlay() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
            setTimeout(() => {
                if (loadingOverlay.parentNode) {
                    loadingOverlay.parentNode.removeChild(loadingOverlay);
                }
            }, 1000);
        }
    }
    render(renderer) {
        const width = renderer.getWidth();
        const height = renderer.getHeight();
        renderer.clear('#0a0a0f');
        for (let i = 0; i < 100; i++) {
            const x = (i * 123.456) % width;
            const y = (i * 789.123) % height;
            const alpha = Math.sin(Date.now() * 0.001 + i) * 0.3 + 0.7;
            renderer.getContext().globalAlpha = alpha * 0.3;
            renderer.drawRect(x, y, 1, 1, '#ffffff');
        }
        renderer.getContext().globalAlpha = 1.0;
        renderer.drawText('STAR DUST VOYAGER', width / 2, height / 2 - 150, '#00ffff', 'bold 48px "Big Apple 3PM", monospace');
        renderer.drawText('GALAXY WANDERER', width / 2, height / 2 - 100, '#5f9e9e', '24px "Big Apple 3PM", monospace');
        const barWidth = 400;
        const barHeight = 20;
        const barX = width / 2 - barWidth / 2;
        const barY = height / 2 + 50;
        renderer.drawRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4, '#333333');
        renderer.drawRect(barX, barY, barWidth, barHeight, '#1a1a2a');
        const fillWidth = (this.progress / 100) * barWidth;
        const gradient = renderer.getContext().createLinearGradient(barX, barY, barX + fillWidth, barY);
        gradient.addColorStop(0, '#00ffff');
        gradient.addColorStop(1, '#0088cc');
        renderer.getContext().fillStyle = gradient;
        renderer.getContext().fillRect(barX, barY, fillWidth, barHeight);
        renderer.drawText(this.loadingTexts[this.currentTextIndex], width / 2, height / 2 + 100, '#dcd0c0', '14px "Big Apple 3PM", monospace');
        renderer.drawText(`${Math.round(this.progress)}%`, width / 2, height / 2 + 130, '#5f9e9e', '12px "Big Apple 3PM", monospace');
    }
    handleInput(input) {
    }
}
class MainMenuState {
    constructor() {
        this.selectedOption = 0;
        this.menuOptions = ['NOVÁ HRA', 'POKRAČOVAT', 'NASTAVENÍ', 'KREDITY', 'UKONČIT'];
        this.animationTime = 0;
    }
    enter() {
        console.log('Main menu entered');
        this.selectedOption = 0;
        this.animationTime = 0;
    }
    update(deltaTime) {
        this.animationTime += deltaTime;
    }
    render(renderer) {
        const width = renderer.getWidth();
        const height = renderer.getHeight();
        renderer.drawImage('/assets/main-menu-bg.jpg', 0, 0, width, height);
        renderer.getContext().fillStyle = 'rgba(0, 0, 0, 0.4)';
        renderer.getContext().fillRect(0, 0, width, height);
        const titleGlow = Math.sin(this.animationTime * 2) * 0.3 + 0.7;
        renderer.getContext().shadowColor = '#00ffff';
        renderer.getContext().shadowBlur = 20 * titleGlow;
        renderer.drawText('STAR DUST VOYAGER', width / 2, height / 4, '#00ffff', 'bold 64px "Big Apple 3PM", monospace');
        renderer.drawText('GALAXY WANDERER', width / 2, height / 4 + 60, '#5f9e9e', '32px "Big Apple 3PM", monospace');
        renderer.getContext().shadowBlur = 0;
        const startY = height / 2 + 50;
        const spacing = 60;
        this.menuOptions.forEach((option, index) => {
            const y = startY + index * spacing;
            const isSelected = index === this.selectedOption;
            if (isSelected) {
                renderer.drawRect(width / 2 - 200, y - 25, 400, 50, 'rgba(0, 255, 255, 0.2)');
                renderer.drawText('▶ ' + option + ' ◀', width / 2, y, '#00ffff', 'bold 24px "Big Apple 3PM", monospace');
            }
            else {
                renderer.drawText(option, width / 2, y, '#dcd0c0', '20px "Big Apple 3PM", monospace');
            }
        });
        renderer.drawText('v2.0.0', width - 100, height - 30, '#666666', '12px "Big Apple 3PM", monospace');
        renderer.drawText('↑↓ Navigace | ENTER Výběr | ESC Zpět', width / 2, height - 50, '#888888', '14px "Big Apple 3PM", monospace');
    }
    handleInput(input) {
        if (input.wasKeyJustPressed('arrowup') || input.wasKeyJustPressed('w')) {
            this.selectedOption = Math.max(0, this.selectedOption - 1);
        }
        if (input.wasKeyJustPressed('arrowdown') || input.wasKeyJustPressed('s')) {
            this.selectedOption = Math.min(this.menuOptions.length - 1, this.selectedOption + 1);
        }
        if (input.wasKeyJustPressed('enter')) {
            this.handleMenuSelection();
        }
    }
    handleMenuSelection() {
        const game = window.game;
        if (!game)
            return;
        switch (this.selectedOption) {
            case 0:
                game.stateManager.setState(GameState.NEW_GAME_SETUP);
                break;
            case 1:
                const saveList = SaveSystem.getSaveList();
                if (saveList.length > 0) {
                    const mostRecentSave = saveList[0];
                    const saveData = SaveSystem.loadGame(mostRecentSave.slot);
                    if (saveData) {
                        SaveSystem.applySaveData(game, saveData);
                        game.stateManager.setState(GameState.PLAYING);
                    }
                    else {
                        console.log('Failed to load save');
                    }
                }
                else {
                    console.log('No saves found');
                }
                break;
            case 2:
                game.stateManager.setState(GameState.SETTINGS);
                break;
            case 3:
                console.log('Credits not implemented yet');
                break;
            case 4:
                if (confirm('Opravdu chcete ukončit hru?')) {
                    window.close();
                }
                break;
        }
    }
}
class NewGameSetupState {
    constructor() {
        this.currentStep = 0;
        this.steps = ['OBTÍŽNOST', 'POSTAVA', 'LOĎ', 'SOUHRN'];
        this.gameSetup = {};
        this.selectedDifficulty = DifficultyLevel.NORMAL;
        this.selectedShip = ShipType.EXPLORER;
        this.playerName = '';
        this.isEditingName = false;
    }
    enter() {
        console.log('New game setup entered');
        this.currentStep = 0;
        this.gameSetup = {};
        this.selectedDifficulty = DifficultyLevel.NORMAL;
        this.selectedShip = ShipType.EXPLORER;
        this.playerName = '';
    }
    update(deltaTime) {
    }
    render(renderer) {
        const width = renderer.getWidth();
        const height = renderer.getHeight();
        renderer.drawImage('/assets/setup-bg.jpg', 0, 0, width, height);
        renderer.getContext().fillStyle = 'rgba(0, 0, 0, 0.6)';
        renderer.getContext().fillRect(0, 0, width, height);
        renderer.drawText('NASTAVENÍ NOVÉ HRY', width / 2, 100, '#00ffff', 'bold 36px "Big Apple 3PM", monospace');
        const stepY = 150;
        this.steps.forEach((step, index) => {
            const x = (width / this.steps.length) * (index + 0.5);
            const isActive = index === this.currentStep;
            const isCompleted = index < this.currentStep;
            let color = '#666666';
            if (isCompleted)
                color = '#00ff00';
            if (isActive)
                color = '#00ffff';
            renderer.drawText(`${index + 1}. ${step}`, x, stepY, color, isActive ? 'bold 18px "Big Apple 3PM", monospace' : '16px "Big Apple 3PM", monospace');
        });
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
        renderer.drawText('←→ Navigace | ENTER Potvrdit | ESC Zpět', width / 2, height - 50, '#888888', '14px "Big Apple 3PM", monospace');
    }
    renderDifficultySelection(renderer) {
        const width = renderer.getWidth();
        const startY = 250;
        renderer.drawText('VYBERTE OBTÍŽNOST', width / 2, startY, '#dcd0c0', 'bold 24px "Big Apple 3PM", monospace');
        Object.values(DifficultyLevel).forEach((difficulty, index) => {
            const settings = DIFFICULTY_SETTINGS[difficulty];
            const y = startY + 80 + index * 80;
            const isSelected = difficulty === this.selectedDifficulty;
            if (isSelected) {
                renderer.drawRect(width / 2 - 400, y - 30, 800, 60, 'rgba(0, 255, 255, 0.2)');
            }
            const color = isSelected ? '#00ffff' : '#dcd0c0';
            renderer.drawText(settings.name, width / 2 - 200, y, color, isSelected ? 'bold 20px "Big Apple 3PM", monospace' : '18px "Big Apple 3PM", monospace');
            renderer.drawText(settings.description, width / 2 + 50, y, color, '14px "Big Apple 3PM", monospace');
        });
    }
    renderCharacterCreation(renderer) {
        const width = renderer.getWidth();
        const startY = 250;
        renderer.drawText('VYTVOŘENÍ POSTAVY', width / 2, startY, '#dcd0c0', 'bold 24px "Big Apple 3PM", monospace');
        renderer.drawText('Jméno pilota:', width / 2 - 100, startY + 80, '#dcd0c0', '18px "Big Apple 3PM", monospace');
        const nameBoxColor = this.isEditingName ? '#00ffff' : '#666666';
        renderer.drawRect(width / 2 - 150, startY + 100, 300, 40, 'rgba(0, 0, 0, 0.5)');
        renderer.drawRect(width / 2 - 150, startY + 100, 300, 40, nameBoxColor);
        const displayName = this.playerName || 'Zadejte jméno...';
        const nameColor = this.playerName ? '#ffffff' : '#888888';
        renderer.drawText(displayName, width / 2, startY + 125, nameColor, '16px "Big Apple 3PM", monospace');
        if (this.isEditingName) {
            const cursorX = width / 2 + (this.playerName.length * 9);
            renderer.drawText('|', cursorX, startY + 125, '#00ffff', '16px "Big Apple 3PM", monospace');
        }
        renderer.drawText('ENTER pro editaci | TAB pro dokončení', width / 2, startY + 180, '#888888', '12px "Big Apple 3PM", monospace');
    }
    renderShipSelection(renderer) {
        const width = renderer.getWidth();
        const startY = 250;
        renderer.drawText('VYBERTE TYP LODĚ', width / 2, startY, '#dcd0c0', 'bold 24px "Big Apple 3PM", monospace');
        const ships = Object.values(ShipType);
        const shipsPerRow = 3;
        const shipWidth = 250;
        const shipHeight = 120;
        ships.forEach((shipType, index) => {
            const template = SHIP_TEMPLATES[shipType];
            const row = Math.floor(index / shipsPerRow);
            const col = index % shipsPerRow;
            const x = width / 2 - (shipsPerRow * shipWidth) / 2 + col * shipWidth + shipWidth / 2;
            const y = startY + 60 + row * (shipHeight + 20);
            const isSelected = shipType === this.selectedShip;
            if (isSelected) {
                renderer.drawRect(x - shipWidth / 2, y - shipHeight / 2, shipWidth, shipHeight, 'rgba(0, 255, 255, 0.3)');
            }
            renderer.drawRect(x - shipWidth / 2 + 5, y - shipHeight / 2 + 5, shipWidth - 10, shipHeight - 10, 'rgba(0, 0, 0, 0.7)');
            const color = isSelected ? '#00ffff' : '#dcd0c0';
            renderer.drawText(template.name, x, y - 35, color, isSelected ? 'bold 16px "Big Apple 3PM", monospace' : '14px "Big Apple 3PM", monospace');
            renderer.drawText(`Hull: ${template.baseStats.hull}`, x - 80, y - 10, color, '10px "Big Apple 3PM", monospace');
            renderer.drawText(`Speed: ${template.baseStats.speed}`, x + 80, y - 10, color, '10px "Big Apple 3PM", monospace');
            renderer.drawText(`Shields: ${template.baseStats.shields}`, x - 80, y + 10, color, '10px "Big Apple 3PM", monospace');
            renderer.drawText(`Cargo: ${template.baseStats.cargo}`, x + 80, y + 10, color, '10px "Big Apple 3PM", monospace');
        });
    }
    renderSummary(renderer) {
        const width = renderer.getWidth();
        const startY = 250;
        renderer.drawText('SOUHRN NASTAVENÍ', width / 2, startY, '#dcd0c0', 'bold 24px "Big Apple 3PM", monospace');
        const difficultySettings = DIFFICULTY_SETTINGS[this.selectedDifficulty];
        const shipTemplate = SHIP_TEMPLATES[this.selectedShip];
        renderer.drawText('Pilot: ' + (this.playerName || 'Neznámý'), width / 2, startY + 60, '#00ffff', '18px "Big Apple 3PM", monospace');
        renderer.drawText('Obtížnost: ' + difficultySettings.name, width / 2, startY + 100, '#00ffff', '18px "Big Apple 3PM", monospace');
        renderer.drawText('Loď: ' + shipTemplate.name, width / 2, startY + 140, '#00ffff', '18px "Big Apple 3PM", monospace');
        renderer.drawText('Počáteční zdroje:', width / 2, startY + 200, '#dcd0c0', '16px "Big Apple 3PM", monospace');
        renderer.drawText(`Palivo: ${difficultySettings.startingResources.fuel}%`, width / 2 - 100, startY + 230, '#5f9e9e', '14px "Big Apple 3PM", monospace');
        renderer.drawText(`Energie: ${difficultySettings.startingResources.energy}%`, width / 2, startY + 230, '#5f9e9e', '14px "Big Apple 3PM", monospace');
        renderer.drawText(`Kredity: ${difficultySettings.startingResources.credits}`, width / 2 + 100, startY + 230, '#5f9e9e', '14px "Big Apple 3PM", monospace');
        renderer.drawText('ENTER pro zahájení hry', width / 2, startY + 300, '#00ff00', 'bold 20px "Big Apple 3PM", monospace');
    }
    handleInput(input) {
        if (input.wasKeyJustPressed('escape')) {
            const game = window.game;
            if (game) {
                game.stateManager.setState(GameState.MAIN_MENU);
            }
            return;
        }
        if (this.currentStep === 1) {
            if (input.wasKeyJustPressed('enter')) {
                this.isEditingName = !this.isEditingName;
                return;
            }
            if (this.isEditingName) {
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
        if (input.wasKeyJustPressed('arrowleft') && this.currentStep > 0) {
            this.currentStep--;
        }
        if (input.wasKeyJustPressed('arrowright') && this.currentStep < this.steps.length - 1) {
            this.currentStep++;
        }
        switch (this.currentStep) {
            case 0:
                if (input.wasKeyJustPressed('arrowup') || input.wasKeyJustPressed('arrowdown')) {
                    const difficulties = Object.values(DifficultyLevel);
                    const currentIndex = difficulties.indexOf(this.selectedDifficulty);
                    const newIndex = input.wasKeyJustPressed('arrowup')
                        ? Math.max(0, currentIndex - 1)
                        : Math.min(difficulties.length - 1, currentIndex + 1);
                    this.selectedDifficulty = difficulties[newIndex];
                }
                break;
            case 2:
                if (input.wasKeyJustPressed('arrowup') || input.wasKeyJustPressed('arrowdown') ||
                    input.wasKeyJustPressed('arrowleft') || input.wasKeyJustPressed('arrowright')) {
                    const ships = Object.values(ShipType);
                    const currentIndex = ships.indexOf(this.selectedShip);
                    let newIndex = currentIndex;
                    if (input.wasKeyJustPressed('arrowleft'))
                        newIndex = Math.max(0, currentIndex - 1);
                    if (input.wasKeyJustPressed('arrowright'))
                        newIndex = Math.min(ships.length - 1, currentIndex + 1);
                    if (input.wasKeyJustPressed('arrowup'))
                        newIndex = Math.max(0, currentIndex - 3);
                    if (input.wasKeyJustPressed('arrowdown'))
                        newIndex = Math.min(ships.length - 1, currentIndex + 3);
                    this.selectedShip = ships[newIndex];
                }
                break;
            case 3:
                if (input.wasKeyJustPressed('enter')) {
                    this.startGame();
                }
                break;
        }
    }
    startGame() {
        const game = window.game;
        if (!game)
            return;
        this.gameSetup = {
            playerName: this.playerName || 'Neznámý Pilot',
            difficulty: this.selectedDifficulty,
            shipType: this.selectedShip,
            startingResources: DIFFICULTY_SETTINGS[this.selectedDifficulty].startingResources
        };
        window.gameSetup = this.gameSetup;
        game.stateManager.setState(GameState.PLAYING);
    }
}
class PlayingState {
    enter() {
        console.log('Entering playing state');
        const game = window.game;
        const gameSetup = window.gameSetup;
        if (gameSetup && game.player) {
            const difficultySettings = DIFFICULTY_SETTINGS[gameSetup.difficulty];
            const shipTemplate = SHIP_TEMPLATES[gameSetup.shipType];
            game.player.fuel = gameSetup.startingResources.fuel;
            game.player.energy = gameSetup.startingResources.energy;
            game.player.maxHull = shipTemplate.baseStats.hull;
            game.player.hull = shipTemplate.baseStats.hull;
            game.player.maxShields = shipTemplate.baseStats.shields;
            game.player.shields = shipTemplate.baseStats.shields;
            game.player.maxCargoWeight = shipTemplate.baseStats.cargo;
            console.log(`Game started as ${gameSetup.playerName} with ${gameSetup.shipType} on ${gameSetup.difficulty} difficulty`);
        }
    }
    update(deltaTime) {
    }
    render(renderer) {
    }
    handleInput(input) {
        if (input.wasKeyJustPressed('escape')) {
            const game = window.game;
            if (game) {
                game.stateManager.setState(GameState.PAUSED);
            }
        }
        if (input.wasKeyJustPressed('F5')) {
            const game = window.game;
            if (game && SaveSystem.saveGame(game, 'quicksave')) {
                console.log('Quick save completed');
            }
        }
        if (input.wasKeyJustPressed('F9')) {
            const game = window.game;
            if (game) {
                const saveData = SaveSystem.loadGame('quicksave');
                if (saveData) {
                    SaveSystem.applySaveData(game, saveData);
                    console.log('Quick load completed');
                }
                else {
                    console.log('No quicksave found');
                }
            }
        }
        if (input.wasKeyJustPressed('j')) {
            const game = window.game;
            if (game && game.player.canWarp()) {
                game.player.initiateWarp();
                console.log('Warp drive initiated!');
            }
            else {
                console.log('Cannot warp: insufficient charge/energy/fuel');
            }
        }
        if (input.wasKeyJustPressed('h')) {
            const game = window.game;
            if (game && game.player) {
                game.player.takeDamage(25);
                console.log('Player took 25 damage');
            }
        }
    }
}
class PausedState {
    constructor() {
        this.selectedOption = 0;
        this.menuOptions = ['POKRAČOVAT', 'NASTAVENÍ', 'HLAVNÍ MENU', 'UKONČIT'];
    }
    enter() {
        console.log('Game paused');
        this.selectedOption = 0;
    }
    update(deltaTime) {
    }
    render(renderer) {
        const width = renderer.getWidth();
        const height = renderer.getHeight();
        renderer.getContext().fillStyle = 'rgba(0, 0, 0, 0.7)';
        renderer.getContext().fillRect(0, 0, width, height);
        renderer.drawText('HRA POZASTAVENA', width / 2, height / 2 - 100, '#ff8c00', 'bold 32px "Big Apple 3PM", monospace');
        const startY = height / 2 + 20;
        const spacing = 50;
        this.menuOptions.forEach((option, index) => {
            const y = startY + index * spacing;
            const isSelected = index === this.selectedOption;
            if (isSelected) {
                renderer.drawText('▶ ' + option + ' ◀', width / 2, y, '#00ffff', 'bold 20px "Big Apple 3PM", monospace');
            }
            else {
                renderer.drawText(option, width / 2, y, '#dcd0c0', '18px "Big Apple 3PM", monospace');
            }
        });
    }
    handleInput(input) {
        if (input.wasKeyJustPressed('escape')) {
            const game = window.game;
            if (game) {
                game.stateManager.setState(GameState.PLAYING);
            }
            return;
        }
        if (input.wasKeyJustPressed('arrowup') || input.wasKeyJustPressed('w')) {
            this.selectedOption = Math.max(0, this.selectedOption - 1);
        }
        if (input.wasKeyJustPressed('arrowdown') || input.wasKeyJustPressed('s')) {
            this.selectedOption = Math.min(this.menuOptions.length - 1, this.selectedOption + 1);
        }
        if (input.wasKeyJustPressed('enter')) {
            this.handleMenuSelection();
        }
    }
    handleMenuSelection() {
        const game = window.game;
        if (!game)
            return;
        switch (this.selectedOption) {
            case 0:
                game.stateManager.setState(GameState.PLAYING);
                break;
            case 1:
                console.log('Settings not implemented yet');
                break;
            case 2:
                if (confirm('Opravdu se chcete vrátit do hlavního menu? Neuložený postup bude ztracen.')) {
                    game.stateManager.setState(GameState.MAIN_MENU);
                }
                break;
            case 3:
                if (confirm('Opravdu chcete ukončit hru? Neuložený postup bude ztracen.')) {
                    window.close();
                }
                break;
        }
    }
}
class SettingsState {
    constructor() {
        this.selectedTab = 0;
        this.selectedOption = 0;
        this.tabs = ['GRAFIKA', 'ZVUK', 'OVLÁDÁNÍ', 'GAMEPLAY'];
        this.isEditing = false;
    }
    enter() {
        console.log('Settings entered');
        this.selectedTab = 0;
        this.selectedOption = 0;
        this.settings = SaveSystem.loadSettings();
    }
    update(deltaTime) {
    }
    render(renderer) {
        const width = renderer.getWidth();
        const height = renderer.getHeight();
        renderer.clear('#0a0a0f');
        renderer.drawText('NASTAVENÍ', width / 2, 80, '#00ffff', 'bold 36px "Big Apple 3PM", monospace');
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
        this.renderSettingsContent(renderer);
        renderer.drawText('←→ Taby | ↑↓ Možnosti | ENTER Změnit | ESC Zpět', width / 2, height - 50, '#888888', '14px "Big Apple 3PM", monospace');
    }
    renderSettingsContent(renderer) {
        const width = renderer.getWidth();
        const startY = 220;
        const spacing = 50;
        switch (this.selectedTab) {
            case 0:
                this.renderGraphicsSettings(renderer, startY, spacing);
                break;
            case 1:
                this.renderAudioSettings(renderer, startY, spacing);
                break;
            case 2:
                this.renderControlSettings(renderer, startY, spacing);
                break;
            case 3:
                this.renderGameplaySettings(renderer, startY, spacing);
                break;
        }
    }
    renderGraphicsSettings(renderer, startY, spacing) {
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
            renderer.drawText(option.name, width / 2 - 200, y, nameColor, isSelected ? 'bold 18px "Big Apple 3PM", monospace' : '16px "Big Apple 3PM", monospace');
            renderer.drawText(option.value, width / 2 + 200, y, valueColor, '16px "Big Apple 3PM", monospace');
            if (isSelected) {
                renderer.drawRect(width / 2 - 250, y - 20, 500, 40, 'rgba(0, 255, 255, 0.1)');
            }
        });
    }
    renderAudioSettings(renderer, startY, spacing) {
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
            renderer.drawText(option.name, width / 2 - 200, y, nameColor, isSelected ? 'bold 18px "Big Apple 3PM", monospace' : '16px "Big Apple 3PM", monospace');
            renderer.drawText(option.value, width / 2 + 200, y, valueColor, '16px "Big Apple 3PM", monospace');
            if (isSelected) {
                renderer.drawRect(width / 2 - 250, y - 20, 500, 40, 'rgba(0, 255, 255, 0.1)');
            }
        });
    }
    renderControlSettings(renderer, startY, spacing) {
        const width = renderer.getWidth();
        renderer.drawText('OVLÁDÁNÍ - Zatím není implementováno', width / 2, startY + 100, '#888888', '18px "Big Apple 3PM", monospace');
        renderer.drawText('Plánované funkce:', width / 2, startY + 150, '#dcd0c0', '16px "Big Apple 3PM", monospace');
        renderer.drawText('• Změna kláves', width / 2, startY + 180, '#5f9e9e', '14px "Big Apple 3PM", monospace');
        renderer.drawText('• Citlivost myši', width / 2, startY + 200, '#5f9e9e', '14px "Big Apple 3PM", monospace');
        renderer.drawText('• Gamepad podpora', width / 2, startY + 220, '#5f9e9e', '14px "Big Apple 3PM", monospace');
    }
    renderGameplaySettings(renderer, startY, spacing) {
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
            renderer.drawText(option.name, width / 2 - 200, y, nameColor, isSelected ? 'bold 18px "Big Apple 3PM", monospace' : '16px "Big Apple 3PM", monospace');
            renderer.drawText(option.value, width / 2 + 200, y, valueColor, '16px "Big Apple 3PM", monospace');
            if (isSelected) {
                renderer.drawRect(width / 2 - 250, y - 20, 500, 40, 'rgba(0, 255, 255, 0.1)');
            }
        });
    }
    handleInput(input) {
        if (input.wasKeyJustPressed('escape')) {
            SaveSystem.saveSettings(this.settings);
            const game = window.game;
            if (game) {
                game.stateManager.setState(GameState.MAIN_MENU);
            }
            return;
        }
        if (input.wasKeyJustPressed('arrowleft') && this.selectedTab > 0) {
            this.selectedTab--;
            this.selectedOption = 0;
        }
        if (input.wasKeyJustPressed('arrowright') && this.selectedTab < this.tabs.length - 1) {
            this.selectedTab++;
            this.selectedOption = 0;
        }
        const maxOptions = this.getMaxOptionsForTab();
        if (input.wasKeyJustPressed('arrowup') && this.selectedOption > 0) {
            this.selectedOption--;
        }
        if (input.wasKeyJustPressed('arrowdown') && this.selectedOption < maxOptions - 1) {
            this.selectedOption++;
        }
        if (input.wasKeyJustPressed('enter')) {
            this.modifySetting();
        }
    }
    getMaxOptionsForTab() {
        switch (this.selectedTab) {
            case 0: return 4;
            case 1: return 4;
            case 2: return 0;
            case 3: return 4;
            default: return 0;
        }
    }
    modifySetting() {
        switch (this.selectedTab) {
            case 0:
                switch (this.selectedOption) {
                    case 0:
                        this.settings.graphics.fullscreen = !this.settings.graphics.fullscreen;
                        break;
                    case 1:
                        const resolutions = ['1920x1080', '1680x1050', '1366x768', '1280x720'];
                        const currentIndex = resolutions.indexOf(this.settings.graphics.resolution);
                        const nextIndex = (currentIndex + 1) % resolutions.length;
                        this.settings.graphics.resolution = resolutions[nextIndex];
                        break;
                    case 2:
                        this.settings.graphics.pixelPerfect = !this.settings.graphics.pixelPerfect;
                        break;
                    case 3:
                        this.settings.graphics.showFPS = !this.settings.graphics.showFPS;
                        break;
                }
                break;
            case 1:
                switch (this.selectedOption) {
                    case 0:
                        this.settings.audio.masterVolume = Math.min(1.0, this.settings.audio.masterVolume + 0.1);
                        if (this.settings.audio.masterVolume > 0.95)
                            this.settings.audio.masterVolume = 0;
                        break;
                    case 1:
                        this.settings.audio.musicVolume = Math.min(1.0, this.settings.audio.musicVolume + 0.1);
                        if (this.settings.audio.musicVolume > 0.95)
                            this.settings.audio.musicVolume = 0;
                        break;
                    case 2:
                        this.settings.audio.sfxVolume = Math.min(1.0, this.settings.audio.sfxVolume + 0.1);
                        if (this.settings.audio.sfxVolume > 0.95)
                            this.settings.audio.sfxVolume = 0;
                        break;
                    case 3:
                        this.settings.audio.muted = !this.settings.audio.muted;
                        break;
                }
                break;
            case 3:
                switch (this.selectedOption) {
                    case 0:
                        this.settings.gameplay.autosave = !this.settings.gameplay.autosave;
                        break;
                    case 1:
                        const intervals = [60, 180, 300, 600, 900];
                        const currentIndex = intervals.indexOf(this.settings.gameplay.autosaveInterval);
                        const nextIndex = (currentIndex + 1) % intervals.length;
                        this.settings.gameplay.autosaveInterval = intervals[nextIndex];
                        break;
                    case 2:
                        this.settings.gameplay.showTutorials = !this.settings.gameplay.showTutorials;
                        break;
                    case 3:
                        this.settings.gameplay.pauseOnFocusLoss = !this.settings.gameplay.pauseOnFocusLoss;
                        break;
                }
                break;
        }
    }
}
class SceneManager {
    constructor() {
        this.scenes = new Map();
        this.currentScene = 'starSystem';
        this.transitionInProgress = false;
    }
    switchScene(newScene) {
        if (this.transitionInProgress)
            return;
        this.transitionInProgress = true;
        setTimeout(() => {
            this.currentScene = newScene;
            this.transitionInProgress = false;
        }, 500);
    }
    getCurrentScene() {
        return new StarSystemScene();
    }
    getCurrentSceneType() {
        return this.currentScene;
    }
    update(deltaTime, game) {
        this.getCurrentScene().update(deltaTime, game);
    }
    render(renderer, camera) {
        this.getCurrentScene().render(renderer, camera);
    }
}
class StatusBar {
    constructor(renderer) {
        this.height = 0;
        this.panels = [];
        this.renderer = renderer;
    }
    update(player) {
        const screenHeight = this.renderer.getHeight();
        this.height = Math.floor(screenHeight * gameConfig.ui.statusBarHeight);
    }
    render(player) {
        const screenWidth = this.renderer.getWidth();
        const screenHeight = this.renderer.getHeight();
        const statusY = screenHeight - this.height;
        this.renderer.drawRect(0, statusY, screenWidth, this.height, '#1a1a2a');
        this.renderer.drawRect(0, screenHeight - 5, screenWidth, 5, '#333333');
        this.renderer.drawText(`HULL: ${Math.round(player.hull)}%`, 20, statusY + 20, '#00ff00', '10px "Big Apple 3PM", monospace');
        this.renderer.drawText(`SHIELDS: ${Math.round(player.shields)}%`, 20, statusY + 35, '#00ffff', '10px "Big Apple 3PM", monospace');
        this.renderer.drawText(`FUEL: ${Math.round(player.fuel)}%`, 20, statusY + 50, '#ffff00', '10px "Big Apple 3PM", monospace');
        this.renderer.drawText(`ENERGY: ${Math.round(player.energy)}%`, 20, statusY + 65, '#ff00ff', '10px "Big Apple 3PM", monospace');
        const weapon = player.getWeaponStatus(player.selectedWeapon);
        if (weapon) {
            this.renderer.drawText(`WEAPON: ${weapon.type.toUpperCase()}`, screenWidth - 200, statusY + 20, '#dcd0c0', '10px "Big Apple 3PM", monospace');
            this.renderer.drawText(`HEAT: ${Math.round(weapon.heat)}%`, screenWidth - 200, statusY + 35, '#ff6600', '10px "Big Apple 3PM", monospace');
            if (weapon.ammo !== undefined) {
                this.renderer.drawText(`AMMO: ${weapon.ammo}/${weapon.maxAmmo}`, screenWidth - 200, statusY + 50, '#dcd0c0', '10px "Big Apple 3PM", monospace');
            }
        }
    }
}
export class GameEngine {
    constructor(canvasId) {
        this.gameTime = 0;
        this.lastFrameTime = 0;
        this.canvas = document.getElementById(canvasId);
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
        AutoSaveManager.start(this);
        this.startGameLoop();
    }
    startGameLoop() {
        const gameLoop = (currentTime) => {
            const deltaTime = Math.min((currentTime - this.lastFrameTime) / 1000, 0.016);
            this.lastFrameTime = currentTime;
            this.gameTime = currentTime / 1000;
            this.update(deltaTime);
            this.render();
            requestAnimationFrame(gameLoop);
        };
        console.log('Starting game loop');
        gameLoop(0);
    }
    update(deltaTime) {
        this.inputManager.update();
        this.stateManager.update(deltaTime);
        this.stateManager.handleInput(this.inputManager);
        if (this.stateManager.getCurrentState() === GameState.PLAYING) {
            this.player.update(deltaTime, this);
            this.sceneManager.update(deltaTime, this);
            this.questSystem.updateTimers(deltaTime);
            this.effectSystem.update(deltaTime);
            this.questSystem.updateProgress('survive', undefined, deltaTime);
            this.camera.followTarget(this.player.position, deltaTime, this.renderer.getWidth(), this.renderer.getHeight());
            this.statusBar.update(this.player);
        }
    }
    render() {
        this.renderer.clear(gameConfig.colors.bgPrimary);
        if (this.stateManager.getCurrentState() === GameState.PLAYING) {
            this.sceneManager.render(this.renderer, this.camera);
            this.player.render(this.renderer, this.camera);
            this.effectSystem.render(this.renderer);
            this.renderHUD();
            this.statusBar.render(this.player);
        }
        else {
            this.stateManager.render(this.renderer);
        }
    }
    renderHUD() {
        const width = this.renderer.getWidth();
        const height = this.renderer.getHeight();
        this.renderer.drawLine(width / 2 - 8, height / 2, width / 2 + 8, height / 2, 'rgba(0, 255, 255, 0.6)', 1);
        this.renderer.drawLine(width / 2, height / 2 - 8, width / 2, height / 2 + 8, 'rgba(0, 255, 255, 0.6)', 1);
        this.renderer.drawText(`X: ${Math.round(this.player.position.x)} AU`, 10, 25, '#5f9e9e', '10px "Big Apple 3PM", monospace');
        this.renderer.drawText(`Y: ${Math.round(this.player.position.y)} AU`, 10, 40, '#5f9e9e', '10px "Big Apple 3PM", monospace');
        const speed = Math.sqrt(this.player.velocity.x ** 2 + this.player.velocity.y ** 2);
        this.renderer.drawText(`V: ${(speed * 100).toFixed(1)} m/s`, 10, 55, '#5f9e9e', '10px "Big Apple 3PM", monospace');
        this.renderer.drawText(`SCENE: STAR SYSTEM`, 10, 70, '#5f9e9e', '10px "Big Apple 3PM", monospace');
        this.renderActiveQuests();
        const warpPercent = Math.round((this.player.warpCharge / this.player.maxWarpCharge) * 100);
        const warpColor = this.player.canWarp() ? '#00ff00' : '#ffaa00';
        this.renderer.drawText(`WARP: ${warpPercent}%`, 10, 100, warpColor, 'bold 10px "Big Apple 3PM", monospace');
        if (this.player.isWarping) {
            this.renderer.drawText('WARPING...', 10, 115, '#ff0000', 'bold 12px "Big Apple 3PM", monospace');
        }
        const statusBarHeight = this.renderer.getHeight() * gameConfig.ui.statusBarHeight;
        this.renderer.drawText('WASD: Move | SPACE: Fire | ESC: Menu | Q: Quests | J: Warp | H: Test Damage', 10, this.renderer.getHeight() - statusBarHeight - 20, '#8c8c8c', '8px "Big Apple 3PM", monospace');
    }
    renderActiveQuests() {
        const activeQuests = this.questSystem.getActiveQuests();
        if (activeQuests.length === 0)
            return;
        const width = this.renderer.getWidth();
        const startX = width - 350;
        const startY = 20;
        this.renderer.drawRect(startX - 10, startY - 10, 340, Math.min(200, activeQuests.length * 60 + 40), 'rgba(0, 0, 0, 0.7)');
        this.renderer.drawText('AKTIVNÍ ÚKOLY', startX + 160, startY + 10, '#00ffff', 'bold 12px "Big Apple 3PM", monospace');
        activeQuests.slice(0, 3).forEach((quest, index) => {
            const y = startY + 40 + index * 60;
            this.renderer.drawText(quest.title, startX, y, '#dcd0c0', 'bold 10px "Big Apple 3PM", monospace');
            const completedObjectives = quest.objectives.filter(obj => obj.completed).length;
            this.renderer.drawText(`${completedObjectives}/${quest.objectives.length}`, startX + 280, y, '#5f9e9e', '10px "Big Apple 3PM", monospace');
            if (quest.timeRemaining !== undefined) {
                const minutes = Math.floor(quest.timeRemaining / 60);
                const seconds = Math.floor(quest.timeRemaining % 60);
                const timeColor = quest.timeRemaining < 300 ? '#ff4444' : '#ffff00';
                this.renderer.drawText(`${minutes}:${seconds.toString().padStart(2, '0')}`, startX + 280, y + 15, timeColor, '8px "Big Apple 3PM", monospace');
            }
            const currentObjective = quest.objectives.find(obj => !obj.completed);
            if (currentObjective) {
                this.renderer.drawText(currentObjective.description, startX, y + 15, '#888888', '8px "Big Apple 3PM", monospace');
                const progress = currentObjective.currentProgress / currentObjective.quantity;
                const barWidth = 250;
                this.renderer.drawRect(startX, y + 30, barWidth, 4, '#333333');
                this.renderer.drawRect(startX, y + 30, barWidth * progress, 4, '#00ff00');
            }
        });
    }
}
export function initializeGame() {
    try {
        console.log('🚀 Initializing Star Dust Voyager: Galaxy Wanderer...');
        let canvas = document.getElementById('gameCanvas');
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
        window.game = game;
        console.log('✅ Game initialized successfully');
        console.log('🎮 Controls: WASD/Arrow keys for movement, SPACE for fire, ESC for menu');
        console.log('🔧 Debug: Use window.game object in console');
        console.log('⚡ Features: Enhanced UI, New Game Setup, Multiple Ship Types, Difficulty Levels');
    }
    catch (error) {
        console.error('❌ Error initializing game:', error);
    }
}
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', initializeGame);
}
//# sourceMappingURL=main.js.map