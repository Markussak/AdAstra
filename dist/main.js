import { GameState, DifficultyLevel, ShipType } from './types';
import { gameConfig } from './utils';
import { Renderer } from './renderer';
import { Camera } from './camera';
import { InputManager } from './input';
import { PlayerShip } from './player';
import { StarSystemScene } from './scenes';
import { SHIP_TEMPLATES, DIFFICULTY_SETTINGS, LOADING_MESSAGES } from './gameData';
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
            this.lastUpdate = now;
            if (this.progress >= 100 && elapsed > 2000) {
                setTimeout(() => {
                    console.log('Loading complete, switching to main menu');
                    if (window.game?.stateManager) {
                        window.game.stateManager.setState(GameState.MAIN_MENU);
                    }
                }, 500);
            }
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
        renderer.drawText('STAR DUST VOYAGER', width / 2, height / 2 - 150, '#00ffff', 'bold 48px monospace');
        renderer.drawText('GALAXY WANDERER', width / 2, height / 2 - 100, '#5f9e9e', '24px monospace');
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
        renderer.drawText(this.loadingTexts[this.currentTextIndex], width / 2, height / 2 + 100, '#dcd0c0', '14px monospace');
        renderer.drawText(`${Math.round(this.progress)}%`, width / 2, height / 2 + 130, '#5f9e9e', '12px monospace');
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
        renderer.drawText('STAR DUST VOYAGER', width / 2, height / 4, '#00ffff', 'bold 64px monospace');
        renderer.drawText('GALAXY WANDERER', width / 2, height / 4 + 60, '#5f9e9e', '32px monospace');
        renderer.getContext().shadowBlur = 0;
        const startY = height / 2 + 50;
        const spacing = 60;
        this.menuOptions.forEach((option, index) => {
            const y = startY + index * spacing;
            const isSelected = index === this.selectedOption;
            if (isSelected) {
                renderer.drawRect(width / 2 - 200, y - 25, 400, 50, 'rgba(0, 255, 255, 0.2)');
                renderer.drawText('▶ ' + option + ' ◀', width / 2, y, '#00ffff', 'bold 24px monospace');
            }
            else {
                renderer.drawText(option, width / 2, y, '#dcd0c0', '20px monospace');
            }
        });
        renderer.drawText('v2.0.0', width - 100, height - 30, '#666666', '12px monospace');
        renderer.drawText('↑↓ Navigace | ENTER Výběr | ESC Zpět', width / 2, height - 50, '#888888', '14px monospace');
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
                game.stateManager.setState(GameState.PLAYING);
                break;
            case 2:
                console.log('Settings not implemented yet');
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
        renderer.drawText('NASTAVENÍ NOVÉ HRY', width / 2, 100, '#00ffff', 'bold 36px monospace');
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
            renderer.drawText(`${index + 1}. ${step}`, x, stepY, color, isActive ? 'bold 18px monospace' : '16px monospace');
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
        renderer.drawText('←→ Navigace | ENTER Potvrdit | ESC Zpět', width / 2, height - 50, '#888888', '14px monospace');
    }
    renderDifficultySelection(renderer) {
        const width = renderer.getWidth();
        const startY = 250;
        renderer.drawText('VYBERTE OBTÍŽNOST', width / 2, startY, '#dcd0c0', 'bold 24px monospace');
        Object.values(DifficultyLevel).forEach((difficulty, index) => {
            const settings = DIFFICULTY_SETTINGS[difficulty];
            const y = startY + 80 + index * 80;
            const isSelected = difficulty === this.selectedDifficulty;
            if (isSelected) {
                renderer.drawRect(width / 2 - 400, y - 30, 800, 60, 'rgba(0, 255, 255, 0.2)');
            }
            const color = isSelected ? '#00ffff' : '#dcd0c0';
            renderer.drawText(settings.name, width / 2 - 200, y, color, isSelected ? 'bold 20px monospace' : '18px monospace');
            renderer.drawText(settings.description, width / 2 + 50, y, color, '14px monospace');
        });
    }
    renderCharacterCreation(renderer) {
        const width = renderer.getWidth();
        const startY = 250;
        renderer.drawText('VYTVOŘENÍ POSTAVY', width / 2, startY, '#dcd0c0', 'bold 24px monospace');
        renderer.drawText('Jméno pilota:', width / 2 - 100, startY + 80, '#dcd0c0', '18px monospace');
        const nameBoxColor = this.isEditingName ? '#00ffff' : '#666666';
        renderer.drawRect(width / 2 - 150, startY + 100, 300, 40, 'rgba(0, 0, 0, 0.5)');
        renderer.drawRect(width / 2 - 150, startY + 100, 300, 40, nameBoxColor);
        const displayName = this.playerName || 'Zadejte jméno...';
        const nameColor = this.playerName ? '#ffffff' : '#888888';
        renderer.drawText(displayName, width / 2, startY + 125, nameColor, '16px monospace');
        if (this.isEditingName) {
            const cursorX = width / 2 + (this.playerName.length * 9);
            renderer.drawText('|', cursorX, startY + 125, '#00ffff', '16px monospace');
        }
        renderer.drawText('ENTER pro editaci | TAB pro dokončení', width / 2, startY + 180, '#888888', '12px monospace');
    }
    renderShipSelection(renderer) {
        const width = renderer.getWidth();
        const startY = 250;
        renderer.drawText('VYBERTE TYP LODĚ', width / 2, startY, '#dcd0c0', 'bold 24px monospace');
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
            renderer.drawText(template.name, x, y - 35, color, isSelected ? 'bold 16px monospace' : '14px monospace');
            renderer.drawText(`Hull: ${template.baseStats.hull}`, x - 80, y - 10, color, '10px monospace');
            renderer.drawText(`Speed: ${template.baseStats.speed}`, x + 80, y - 10, color, '10px monospace');
            renderer.drawText(`Shields: ${template.baseStats.shields}`, x - 80, y + 10, color, '10px monospace');
            renderer.drawText(`Cargo: ${template.baseStats.cargo}`, x + 80, y + 10, color, '10px monospace');
        });
    }
    renderSummary(renderer) {
        const width = renderer.getWidth();
        const startY = 250;
        renderer.drawText('SOUHRN NASTAVENÍ', width / 2, startY, '#dcd0c0', 'bold 24px monospace');
        const difficultySettings = DIFFICULTY_SETTINGS[this.selectedDifficulty];
        const shipTemplate = SHIP_TEMPLATES[this.selectedShip];
        renderer.drawText('Pilot: ' + (this.playerName || 'Neznámý'), width / 2, startY + 60, '#00ffff', '18px monospace');
        renderer.drawText('Obtížnost: ' + difficultySettings.name, width / 2, startY + 100, '#00ffff', '18px monospace');
        renderer.drawText('Loď: ' + shipTemplate.name, width / 2, startY + 140, '#00ffff', '18px monospace');
        renderer.drawText('Počáteční zdroje:', width / 2, startY + 200, '#dcd0c0', '16px monospace');
        renderer.drawText(`Palivo: ${difficultySettings.startingResources.fuel}%`, width / 2 - 100, startY + 230, '#5f9e9e', '14px monospace');
        renderer.drawText(`Energie: ${difficultySettings.startingResources.energy}%`, width / 2, startY + 230, '#5f9e9e', '14px monospace');
        renderer.drawText(`Kredity: ${difficultySettings.startingResources.credits}`, width / 2 + 100, startY + 230, '#5f9e9e', '14px monospace');
        renderer.drawText('ENTER pro zahájení hry', width / 2, startY + 300, '#00ff00', 'bold 20px monospace');
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
        renderer.drawText('HRA POZASTAVENA', width / 2, height / 2 - 100, '#ff8c00', 'bold 32px monospace');
        const startY = height / 2 + 20;
        const spacing = 50;
        this.menuOptions.forEach((option, index) => {
            const y = startY + index * spacing;
            const isSelected = index === this.selectedOption;
            if (isSelected) {
                renderer.drawText('▶ ' + option + ' ◀', width / 2, y, '#00ffff', 'bold 20px monospace');
            }
            else {
                renderer.drawText(option, width / 2, y, '#dcd0c0', '18px monospace');
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
        this.renderer.drawText(`HULL: ${Math.round(player.hull)}%`, 20, statusY + 20, '#00ff00', '10px monospace');
        this.renderer.drawText(`SHIELDS: ${Math.round(player.shields)}%`, 20, statusY + 35, '#00ffff', '10px monospace');
        this.renderer.drawText(`FUEL: ${Math.round(player.fuel)}%`, 20, statusY + 50, '#ffff00', '10px monospace');
        this.renderer.drawText(`ENERGY: ${Math.round(player.energy)}%`, 20, statusY + 65, '#ff00ff', '10px monospace');
        const weapon = player.getWeaponStatus(player.selectedWeapon);
        if (weapon) {
            this.renderer.drawText(`WEAPON: ${weapon.type.toUpperCase()}`, screenWidth - 200, statusY + 20, '#dcd0c0', '10px monospace');
            this.renderer.drawText(`HEAT: ${Math.round(weapon.heat)}%`, screenWidth - 200, statusY + 35, '#ff6600', '10px monospace');
            if (weapon.ammo !== undefined) {
                this.renderer.drawText(`AMMO: ${weapon.ammo}/${weapon.maxAmmo}`, screenWidth - 200, statusY + 50, '#dcd0c0', '10px monospace');
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
        console.log('Game engine initialized');
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
            this.camera.followTarget(this.player.position, deltaTime, this.renderer.getWidth(), this.renderer.getHeight());
            this.statusBar.update(this.player);
        }
    }
    render() {
        this.renderer.clear(gameConfig.colors.bgPrimary);
        if (this.stateManager.getCurrentState() === GameState.PLAYING) {
            this.sceneManager.render(this.renderer, this.camera);
            this.player.render(this.renderer, this.camera);
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
        this.renderer.drawText(`X: ${Math.round(this.player.position.x)} AU`, 10, 25, '#5f9e9e', '10px monospace');
        this.renderer.drawText(`Y: ${Math.round(this.player.position.y)} AU`, 10, 40, '#5f9e9e', '10px monospace');
        const speed = Math.sqrt(this.player.velocity.x ** 2 + this.player.velocity.y ** 2);
        this.renderer.drawText(`V: ${(speed * 100).toFixed(1)} m/s`, 10, 55, '#5f9e9e', '10px monospace');
        this.renderer.drawText(`SCENE: STAR SYSTEM`, 10, 70, '#5f9e9e', '10px monospace');
        const statusBarHeight = this.renderer.getHeight() * gameConfig.ui.statusBarHeight;
        this.renderer.drawText('WASD: Move | SPACE: Fire | ESC: Menu', 10, this.renderer.getHeight() - statusBarHeight - 20, '#8c8c8c', '8px monospace');
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