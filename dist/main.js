import { GameState, DifficultyLevel, ShipType, CharacterGender, CharacterRace, CharacterSkill, CharacterBackground, GalaxySize, GalaxyDensity, EconomyComplexity } from './types';
import { Renderer } from './renderer';
import { Camera } from './camera';
import { InputManager } from './input';
import { PlayerShip } from './player';
import { StarSystemScene } from './scenes';
import { SHIP_TEMPLATES, DIFFICULTY_SETTINGS, LOADING_MESSAGES, WEAPON_DATA, RACE_DATA, BACKGROUND_DATA, SKILL_DATA, GALAXY_SIZE_DATA, GALAXY_DENSITY_DATA, ECONOMY_COMPLEXITY_DATA } from './gameData';
import { NameGenerator } from './utils';
import { SaveSystem } from './saveSystem';
import { QuestSystem } from './questSystem';
import { EffectSystem } from './effectSystem';
class StateManager {
    constructor() {
        this.states = new Map();
        this.currentState = GameState.LOADING;
        this.transitionInProgress = false;
        this.registerStates();
        const initialState = this.states.get(this.currentState);
        if (initialState?.enter) {
            console.log(`Entering initial state: ${this.currentState}`);
            initialState.enter();
        }
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
            console.log(`Entering state: ${this.currentState}`);
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
        renderer.clear('#1a1a1a');
        for (let i = 0; i < 100; i++) {
            const x = (i * 123.456) % width;
            const y = (i * 789.123) % height;
            const alpha = Math.sin(Date.now() * 0.001 + i) * 0.3 + 0.7;
            renderer.getContext().globalAlpha = alpha * 0.1;
            renderer.drawRect(x, y, 1, 1, '#606060');
        }
        renderer.getContext().globalAlpha = 1.0;
        renderer.drawText('STAR DUST VOYAGER', width / 2, height / 2 - 150, '#606060', 'bold 48px "Big Apple 3PM", monospace');
        renderer.drawText('GALAXY WANDERER', width / 2, height / 2 - 100, '#e0e3e6', '24px "Big Apple 3PM", monospace');
        const barWidth = 400;
        const barHeight = 20;
        const barX = width / 2 - barWidth / 2;
        const barY = height / 2 + 50;
        renderer.drawRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4, '#404040');
        renderer.drawRect(barX, barY, barWidth, barHeight, '#2a2a2a');
        const fillWidth = (this.progress / 100) * barWidth;
        const gradient = renderer.getContext().createLinearGradient(barX, barY, barX + fillWidth, barY);
        gradient.addColorStop(0, '#505050');
        gradient.addColorStop(1, '#404040');
        renderer.getContext().fillStyle = gradient;
        renderer.getContext().fillRect(barX, barY, fillWidth, barHeight);
        renderer.drawText(this.loadingTexts[this.currentTextIndex], width / 2, height / 2 + 100, '#606060', '14px "Big Apple 3PM", monospace');
        renderer.drawText(`${Math.round(this.progress)}%`, width / 2, height / 2 + 130, '#a2aab2', '12px "Big Apple 3PM", monospace');
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
        renderer.clear('#0a0a1a');
        for (let i = 0; i < 200; i++) {
            const x = (i * 123.456) % width;
            const y = (i * 789.123) % height;
            const alpha = Math.sin(Date.now() * 0.001 + i) * 0.3 + 0.7;
            renderer.getContext().globalAlpha = alpha * 0.4;
            const size = Math.random() > 0.8 ? 2 : 1;
            renderer.drawRect(x, y, size, size, '#606060');
        }
        renderer.getContext().globalAlpha = 1.0;
        const gradient = renderer.getContext().createRadialGradient(width / 2, height / 3, 0, width / 2, height / 3, width);
        gradient.addColorStop(0, 'rgba(64, 32, 128, 0.1)');
        gradient.addColorStop(0.5, 'rgba(32, 16, 64, 0.05)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        renderer.getContext().fillStyle = gradient;
        renderer.getContext().fillRect(0, 0, width, height);
        renderer.getContext().shadowColor = '#404040';
        renderer.getContext().shadowBlur = 0;
        renderer.drawText('STAR DUST VOYAGER', width / 2, height / 4, '#606060', 'bold 64px "Big Apple 3PM", monospace');
        renderer.drawText('GALAXY WANDERER', width / 2, height / 4 + 60, '#e0e3e6', '32px "Big Apple 3PM", monospace');
        renderer.getContext().shadowBlur = 0;
        const startY = height / 2 + 50;
        const spacing = 60;
        this.menuOptions.forEach((option, index) => {
            const y = startY + index * spacing;
            const isSelected = index === this.selectedOption;
            if (isSelected) {
                renderer.drawRect(width / 2 - 200, y - 25, 400, 50, 'rgba(64, 64, 64, 0.3)');
                renderer.drawText('▶ ' + option + ' ◀', width / 2, y, '#606060', 'bold 24px "Big Apple 3PM", monospace');
            }
            else {
                renderer.drawText(option, width / 2, y, '#505050', '20px "Big Apple 3PM", monospace');
            }
        });
        renderer.drawText('v2.0.0', width - 100, height - 30, '#666666', '12px "Big Apple 3PM", monospace');
        renderer.drawText('↑↓ Navigace | ENTER Výběr | ESC Zpět', width / 2, height - 50, '#505050', '14px "Big Apple 3PM", monospace');
    }
    handleInput(input) {
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
        this.steps = ['OBTÍŽNOST', 'GALAXIE', 'EKONOMIKA', 'POSTAVA', 'DOVEDNOSTI', 'LOĎ', 'SOUHRN'];
        this.gameSetup = {};
        this.selectedDifficulty = DifficultyLevel.NORMAL;
        this.galaxySettings = {
            size: GalaxySize.MEDIUM,
            density: GalaxyDensity.NORMAL,
            factionCount: 5,
            hostilityLevel: 5
        };
        this.economySettings = {
            complexity: EconomyComplexity.MODERATE,
            marketVolatility: 5,
            tradeRouteFrequency: 5,
            pirateActivity: 5
        };
        this.character = {
            name: '',
            age: 25,
            gender: CharacterGender.MALE,
            race: CharacterRace.HUMAN,
            skills: new Map(),
            background: CharacterBackground.EXPLORER
        };
        this.selectedShip = ShipType.EXPLORER;
        this.isEditingName = false;
        this.remainingSkillPoints = 10;
        this.tooltip = { visible: false, x: 0, y: 0, title: '', description: '', width: 300 };
        this.animations = { stepTransition: 0, buttonPulse: 0, starField: 0 };
        this.backButton = { x: 0, y: 0, width: 120, height: 40, hovered: false, pressed: false };
        this.nextButton = { x: 0, y: 0, width: 120, height: 40, hovered: false, pressed: false };
        this.difficultyButtons = [];
        this.galaxySizeButtons = [];
        this.galaxyDensityButtons = [];
        this.economyButtons = [];
        this.raceButtons = [];
        this.genderButtons = [];
        this.backgroundButtons = [];
        this.skillButtons = [];
        this.shipButtons = [];
        this.nameInputButton = { x: 0, y: 0, width: 200, height: 40, hovered: false };
        this.randomNameButton = { x: 0, y: 0, width: 80, height: 40, hovered: false };
        this.skipNameButton = { x: 0, y: 0, width: 100, height: 40, hovered: false };
        this.ageInputButton = { x: 0, y: 0, width: 100, height: 40, hovered: false };
        this.startGameButton = { x: 0, y: 0, width: 200, height: 50, hovered: false, pressed: false };
    }
    enter() {
        console.log('New game setup entered');
        this.currentStep = 0;
        this.gameSetup = {};
        this.selectedDifficulty = DifficultyLevel.NORMAL;
        this.selectedShip = ShipType.EXPLORER;
        this.character = {
            name: '',
            age: 25,
            gender: CharacterGender.MALE,
            race: CharacterRace.HUMAN,
            skills: new Map(),
            background: CharacterBackground.EXPLORER
        };
        this.remainingSkillPoints = 10;
        Object.values(CharacterSkill).forEach(skill => {
            this.character.skills.set(skill, 1);
        });
    }
    update(deltaTime) {
        this.animations.stepTransition += deltaTime * 3.0;
        this.animations.buttonPulse += deltaTime * 4.0;
        this.animations.starField += deltaTime * 0.5;
        if (this.animations.stepTransition > Math.PI * 2)
            this.animations.stepTransition = 0;
        if (this.animations.buttonPulse > Math.PI * 2)
            this.animations.buttonPulse = 0;
        if (this.animations.starField > 1000)
            this.animations.starField = 0;
    }
    render(renderer) {
        const width = renderer.getWidth();
        const height = renderer.getHeight();
        const gradient = renderer.getContext().createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#0a0a20');
        gradient.addColorStop(0.5, '#0a0a15');
        gradient.addColorStop(1, '#050510');
        renderer.getContext().fillStyle = gradient;
        renderer.getContext().fillRect(0, 0, width, height);
        for (let layer = 0; layer < 3; layer++) {
            const starCount = [50, 75, 100][layer];
            const speed = [0.2, 0.4, 0.6][layer];
            const brightness = [0.8, 0.5, 0.3][layer];
            for (let i = 0; i < starCount; i++) {
                const baseX = (i * 87.456) % width;
                const baseY = (i * 543.123) % height;
                const x = (baseX + this.animations.starField * speed * 10) % width;
                const y = baseY;
                const alpha = Math.sin(this.animations.starField * 2 + i * 0.1) * 0.3 + 0.7;
                const size = layer === 0 ? 2 : 1;
                renderer.getContext().globalAlpha = alpha * brightness * 0.4;
                renderer.drawRect(x, y, size, size, layer === 0 ? '#8080a0' : '#606080');
            }
        }
        renderer.getContext().globalAlpha = 1.0;
        const overlayGradient = renderer.getContext().createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) / 2);
        overlayGradient.addColorStop(0, 'rgba(16, 16, 32, 0.4)');
        overlayGradient.addColorStop(1, 'rgba(8, 8, 16, 0.8)');
        renderer.getContext().fillStyle = overlayGradient;
        renderer.getContext().fillRect(0, 0, width, height);
        const titleGlow = Math.sin(this.animations.buttonPulse) * 0.3 + 0.7;
        renderer.getContext().shadowColor = '#4080ff';
        renderer.getContext().shadowBlur = 10 * titleGlow;
        renderer.drawText('NASTAVENÍ NOVÉ HRY', width / 2, 100, `rgba(96, 128, 255, ${titleGlow})`, 'bold 36px "Big Apple 3PM", monospace');
        renderer.getContext().shadowBlur = 0;
        const stepY = 150;
        const progressWidth = width * 0.8;
        const progressX = width * 0.1;
        const progressY = stepY + 30;
        renderer.drawRect(progressX, progressY - 3, progressWidth, 6, 'rgba(64, 64, 64, 0.5)');
        const progress = this.currentStep / (this.steps.length - 1);
        const fillWidth = progressWidth * progress;
        const progressGradient = renderer.getContext().createLinearGradient(progressX, 0, progressX + fillWidth, 0);
        progressGradient.addColorStop(0, '#4080ff');
        progressGradient.addColorStop(1, '#60a0ff');
        renderer.getContext().fillStyle = progressGradient;
        renderer.getContext().fillRect(progressX, progressY - 3, fillWidth, 6);
        this.steps.forEach((step, index) => {
            const x = (width / this.steps.length) * (index + 0.5);
            const isActive = index === this.currentStep;
            const isCompleted = index < this.currentStep;
            let color = '#404040';
            let glowIntensity = 0;
            if (isCompleted) {
                color = '#60c060';
                glowIntensity = 0.3;
            }
            if (isActive) {
                color = '#80a0ff';
                glowIntensity = Math.sin(this.animations.buttonPulse) * 0.4 + 0.6;
            }
            if (glowIntensity > 0) {
                renderer.getContext().shadowColor = color;
                renderer.getContext().shadowBlur = 8 * glowIntensity;
            }
            renderer.drawText(`${index + 1}. ${step}`, x, stepY, color, isActive ? 'bold 18px "Big Apple 3PM", monospace' : '16px "Big Apple 3PM", monospace');
            renderer.getContext().shadowBlur = 0;
        });
        switch (this.currentStep) {
            case 0:
                this.renderDifficultySelection(renderer);
                break;
            case 1:
                this.renderGalaxySettings(renderer);
                break;
            case 2:
                this.renderEconomySettings(renderer);
                break;
            case 3:
                this.renderCharacterCreation(renderer);
                break;
            case 4:
                this.renderSkillSelection(renderer);
                break;
            case 5:
                this.renderShipSelection(renderer);
                break;
            case 6:
                this.renderSummary(renderer);
                break;
        }
        this.renderNavigationButtons(renderer, width, height);
        this.renderTooltip(renderer);
    }
    renderNavigationButtons(renderer, width, height) {
        this.backButton.x = 50;
        this.backButton.y = height - 80;
        this.nextButton.x = width - 170;
        this.nextButton.y = height - 80;
        if (this.currentStep > 0) {
            const backColor = this.backButton.pressed ? 'rgba(96, 96, 96, 0.8)' :
                this.backButton.hovered ? 'rgba(96, 96, 96, 0.4)' : 'rgba(64, 64, 64, 0.7)';
            renderer.drawRect(this.backButton.x, this.backButton.y, this.backButton.width, this.backButton.height, backColor);
            renderer.drawRect(this.backButton.x, this.backButton.y, this.backButton.width, this.backButton.height, '#505050');
            renderer.drawText('← ZPĚT', this.backButton.x + this.backButton.width / 2, this.backButton.y + this.backButton.height / 2 + 5, '#dcd0c0', '14px "Big Apple 3PM", monospace');
        }
        const isLastStep = this.currentStep === this.steps.length - 1;
        const canProceed = this.canProceedFromCurrentStep();
        const nextText = isLastStep ? 'SPUSTIT' : 'POKRAČOVAT →';
        if (canProceed) {
            const nextColor = this.nextButton.pressed ? 'rgba(96, 96, 96, 0.8)' :
                this.nextButton.hovered ? 'rgba(96, 96, 96, 0.4)' : 'rgba(64, 64, 64, 0.7)';
            renderer.drawRect(this.nextButton.x, this.nextButton.y, this.nextButton.width, this.nextButton.height, nextColor);
            renderer.drawRect(this.nextButton.x, this.nextButton.y, this.nextButton.width, this.nextButton.height, '#505050');
            renderer.drawText(nextText, this.nextButton.x + this.nextButton.width / 2, this.nextButton.y + this.nextButton.height / 2 + 5, '#dcd0c0', '14px "Big Apple 3PM", monospace');
        }
        renderer.drawText('Klávesnice: ←→ ESC ENTER | Touch: Klepněte na tlačítka', width / 2, height - 30, '#505050', '12px "Big Apple 3PM", monospace');
    }
    canProceedFromCurrentStep() {
        switch (this.currentStep) {
            case 3:
                return true;
            case 4:
                return this.remainingSkillPoints >= 0;
            default:
                return true;
        }
    }
    renderDifficultySelection(renderer) {
        const width = renderer.getWidth();
        const startY = 250;
        renderer.drawText('VYBERTE OBTÍŽNOST', width / 2, startY, '#606060', 'bold 24px "Big Apple 3PM", monospace');
        this.difficultyButtons = [];
        Object.values(DifficultyLevel).forEach((difficulty, index) => {
            const settings = DIFFICULTY_SETTINGS[difficulty];
            const y = startY + 80 + index * 80;
            const isSelected = difficulty === this.selectedDifficulty;
            const buttonArea = {
                x: width / 2 - 400,
                y: y - 30,
                width: 800,
                height: 60,
                difficulty: difficulty,
                hovered: false
            };
            this.difficultyButtons.push(buttonArea);
            let bgColor = 'rgba(64, 64, 64, 0.3)';
            if (isSelected) {
                bgColor = 'rgba(96, 96, 96, 0.6)';
            }
            else if (buttonArea.hovered) {
                bgColor = 'rgba(80, 80, 80, 0.4)';
            }
            renderer.drawRect(buttonArea.x, buttonArea.y, buttonArea.width, buttonArea.height, bgColor);
            renderer.drawRect(buttonArea.x, buttonArea.y, buttonArea.width, buttonArea.height, '#505050');
            const color = isSelected ? '#dcd0c0' : '#606060';
            renderer.drawText(settings.name, width / 2 - 200, y, color, isSelected ? 'bold 20px "Big Apple 3PM", monospace' : '18px "Big Apple 3PM", monospace');
            renderer.drawText(settings.description, width / 2 + 50, y, color, '14px "Big Apple 3PM", monospace');
        });
    }
    renderGalaxySettings(renderer) {
        const width = renderer.getWidth();
        const startY = 220;
        renderer.drawText('NASTAVENÍ GALAXIE', width / 2, startY, '#606060', 'bold 24px "Big Apple 3PM", monospace');
        renderer.drawText('Velikost galaxie:', width / 4, startY + 60, '#606060', '18px "Big Apple 3PM", monospace');
        this.galaxySizeButtons = [];
        Object.values(GalaxySize).forEach((size, index) => {
            const data = GALAXY_SIZE_DATA[size];
            const y = startY + 90 + index * 50;
            const isSelected = size === this.galaxySettings.size;
            const buttonArea = {
                x: width / 4 - 150,
                y: y - 20,
                width: 300,
                height: 40,
                size: size,
                hovered: false
            };
            this.galaxySizeButtons.push(buttonArea);
            let bgColor = 'rgba(64, 64, 64, 0.3)';
            if (isSelected)
                bgColor = 'rgba(96, 96, 96, 0.6)';
            else if (buttonArea.hovered)
                bgColor = 'rgba(80, 80, 80, 0.4)';
            renderer.drawRect(buttonArea.x, buttonArea.y, buttonArea.width, buttonArea.height, bgColor);
            renderer.drawRect(buttonArea.x, buttonArea.y, buttonArea.width, buttonArea.height, '#505050');
            const color = isSelected ? '#dcd0c0' : '#808080';
            renderer.drawText(data.name, width / 4, y, color, isSelected ? 'bold 16px "Big Apple 3PM", monospace' : '14px "Big Apple 3PM", monospace');
        });
        renderer.drawText('Hustota galaxie:', 3 * width / 4, startY + 60, '#606060', '18px "Big Apple 3PM", monospace');
        this.galaxyDensityButtons = [];
        Object.values(GalaxyDensity).forEach((density, index) => {
            const data = GALAXY_DENSITY_DATA[density];
            const y = startY + 90 + index * 50;
            const isSelected = density === this.galaxySettings.density;
            const buttonArea = {
                x: 3 * width / 4 - 150,
                y: y - 20,
                width: 300,
                height: 40,
                density: density,
                hovered: false
            };
            this.galaxyDensityButtons.push(buttonArea);
            let bgColor = 'rgba(64, 64, 64, 0.3)';
            if (isSelected)
                bgColor = 'rgba(96, 96, 96, 0.6)';
            else if (buttonArea.hovered)
                bgColor = 'rgba(80, 80, 80, 0.4)';
            renderer.drawRect(buttonArea.x, buttonArea.y, buttonArea.width, buttonArea.height, bgColor);
            renderer.drawRect(buttonArea.x, buttonArea.y, buttonArea.width, buttonArea.height, '#505050');
            const color = isSelected ? '#dcd0c0' : '#808080';
            renderer.drawText(data.name, 3 * width / 4, y, color, isSelected ? 'bold 16px "Big Apple 3PM", monospace' : '14px "Big Apple 3PM", monospace');
        });
        renderer.drawText(`Frakce: ${this.galaxySettings.factionCount} | Nepřátelskost: ${this.galaxySettings.hostilityLevel}/10`, width / 2, startY + 340, '#808080', '14px "Big Apple 3PM", monospace');
    }
    renderEconomySettings(renderer) {
        const width = renderer.getWidth();
        const startY = 250;
        renderer.drawText('NASTAVENÍ EKONOMIKY', width / 2, startY, '#606060', 'bold 24px "Big Apple 3PM", monospace');
        this.economyButtons = [];
        Object.values(EconomyComplexity).forEach((complexity, index) => {
            const data = ECONOMY_COMPLEXITY_DATA[complexity];
            const y = startY + 80 + index * 80;
            const isSelected = complexity === this.economySettings.complexity;
            const buttonArea = {
                x: width / 2 - 400,
                y: y - 30,
                width: 800,
                height: 60,
                complexity: complexity,
                hovered: false
            };
            this.economyButtons.push(buttonArea);
            let bgColor = 'rgba(64, 64, 64, 0.3)';
            if (isSelected)
                bgColor = 'rgba(96, 96, 96, 0.6)';
            else if (buttonArea.hovered)
                bgColor = 'rgba(80, 80, 80, 0.4)';
            renderer.drawRect(buttonArea.x, buttonArea.y, buttonArea.width, buttonArea.height, bgColor);
            renderer.drawRect(buttonArea.x, buttonArea.y, buttonArea.width, buttonArea.height, '#505050');
            const color = isSelected ? '#dcd0c0' : '#606060';
            renderer.drawText(data.name, width / 2 - 200, y, color, isSelected ? 'bold 20px "Big Apple 3PM", monospace' : '18px "Big Apple 3PM", monospace');
            renderer.drawText(data.description, width / 2 + 50, y, color, '14px "Big Apple 3PM", monospace');
        });
        renderer.drawText(`Volatilita: ${this.economySettings.marketVolatility}/10 | Obchod: ${this.economySettings.tradeRouteFrequency}/10 | Piráti: ${this.economySettings.pirateActivity}/10`, width / 2, startY + 380, '#808080', '14px "Big Apple 3PM", monospace');
    }
    renderCharacterCreation(renderer) {
        const width = renderer.getWidth();
        const startY = 200;
        renderer.drawText('VYTVOŘENÍ POSTAVY', width / 2, startY, '#606060', 'bold 24px "Big Apple 3PM", monospace');
        renderer.drawText('Jméno:', width / 4 - 50, startY + 50, '#606060', '16px "Big Apple 3PM", monospace');
        this.nameInputButton.x = width / 4 - 150;
        this.nameInputButton.y = startY + 70;
        this.nameInputButton.width = 200;
        let nameBoxColor = 'rgba(64, 64, 64, 0.7)';
        if (this.isEditingName)
            nameBoxColor = 'rgba(96, 96, 96, 0.8)';
        else if (this.nameInputButton.hovered)
            nameBoxColor = 'rgba(80, 80, 80, 0.7)';
        renderer.drawRect(this.nameInputButton.x, this.nameInputButton.y, this.nameInputButton.width, this.nameInputButton.height, nameBoxColor);
        renderer.drawRect(this.nameInputButton.x, this.nameInputButton.y, this.nameInputButton.width, this.nameInputButton.height, '#505050');
        const displayName = this.character.name || 'Jméno...';
        const nameColor = this.character.name ? '#dcd0c0' : '#808080';
        renderer.drawText(displayName, width / 4 - 50, startY + 95, nameColor, '14px "Big Apple 3PM", monospace');
        if (this.isEditingName && Math.floor(Date.now() / 500) % 2 === 0) {
            const cursorX = width / 4 - 50 + (this.character.name.length * 8);
            renderer.drawText('|', cursorX, startY + 95, '#dcd0c0', '14px "Big Apple 3PM", monospace');
        }
        this.randomNameButton.x = width / 4 + 70;
        this.randomNameButton.y = startY + 70;
        let randomButtonColor = this.randomNameButton.hovered ? 'rgba(80, 120, 80, 0.7)' : 'rgba(64, 96, 64, 0.7)';
        renderer.drawRect(this.randomNameButton.x, this.randomNameButton.y, this.randomNameButton.width, this.randomNameButton.height, randomButtonColor);
        renderer.drawRect(this.randomNameButton.x, this.randomNameButton.y, this.randomNameButton.width, this.randomNameButton.height, '#505050');
        renderer.drawText('🎲', this.randomNameButton.x + 40, startY + 95, '#dcd0c0', '16px "Big Apple 3PM", monospace');
        this.skipNameButton.x = width / 4 + 160;
        this.skipNameButton.y = startY + 70;
        let skipButtonColor = this.skipNameButton.hovered ? 'rgba(120, 80, 80, 0.7)' : 'rgba(96, 64, 64, 0.7)';
        renderer.drawRect(this.skipNameButton.x, this.skipNameButton.y, this.skipNameButton.width, this.skipNameButton.height, skipButtonColor);
        renderer.drawRect(this.skipNameButton.x, this.skipNameButton.y, this.skipNameButton.width, this.skipNameButton.height, '#505050');
        renderer.drawText('Přeskočit', this.skipNameButton.x + 50, startY + 95, '#dcd0c0', '12px "Big Apple 3PM", monospace');
        renderer.drawText('Věk:', width / 4 - 50, startY + 130, '#606060', '16px "Big Apple 3PM", monospace');
        this.ageInputButton.x = width / 4 - 50;
        this.ageInputButton.y = startY + 150;
        let ageBoxColor = this.ageInputButton.hovered ? 'rgba(80, 80, 80, 0.7)' : 'rgba(64, 64, 64, 0.7)';
        renderer.drawRect(this.ageInputButton.x, this.ageInputButton.y, this.ageInputButton.width, this.ageInputButton.height, ageBoxColor);
        renderer.drawRect(this.ageInputButton.x, this.ageInputButton.y, this.ageInputButton.width, this.ageInputButton.height, '#505050');
        renderer.drawText(this.character.age.toString(), width / 4, startY + 175, '#dcd0c0', '14px "Big Apple 3PM", monospace');
        renderer.drawText('Pohlaví:', 3 * width / 4 - 100, startY + 50, '#606060', '16px "Big Apple 3PM", monospace');
        this.genderButtons = [];
        Object.values(CharacterGender).forEach((gender, index) => {
            const x = 3 * width / 4 - 80 + (index % 2) * 160;
            const y = startY + 80 + Math.floor(index / 2) * 40;
            const isSelected = gender === this.character.gender;
            const buttonArea = {
                x: x - 70,
                y: y - 15,
                width: 140,
                height: 30,
                gender: gender,
                hovered: false
            };
            this.genderButtons.push(buttonArea);
            let bgColor = 'rgba(64, 64, 64, 0.3)';
            if (isSelected)
                bgColor = 'rgba(96, 96, 96, 0.6)';
            else if (buttonArea.hovered)
                bgColor = 'rgba(80, 80, 80, 0.4)';
            renderer.drawRect(buttonArea.x, buttonArea.y, buttonArea.width, buttonArea.height, bgColor);
            renderer.drawRect(buttonArea.x, buttonArea.y, buttonArea.width, buttonArea.height, '#505050');
            const genderName = gender === CharacterGender.MALE ? 'Muž' :
                gender === CharacterGender.FEMALE ? 'Žena' :
                    gender === CharacterGender.NON_BINARY ? 'Nebinární' : 'Jiné';
            const color = isSelected ? '#dcd0c0' : '#808080';
            renderer.drawText(genderName, x, y, color, isSelected ? 'bold 12px "Big Apple 3PM", monospace' : '12px "Big Apple 3PM", monospace');
        });
        renderer.drawText('Rasa:', width / 2, startY + 180, '#606060', '16px "Big Apple 3PM", monospace');
        this.raceButtons = [];
        const raceKeys = Object.keys(RACE_DATA);
        const racesPerRow = 5;
        raceKeys.forEach((race, index) => {
            const data = RACE_DATA[race];
            const row = Math.floor(index / racesPerRow);
            const col = index % racesPerRow;
            const x = width / 2 - (racesPerRow * 140) / 2 + col * 140 + 70;
            const y = startY + 220 + row * 60;
            const isSelected = race === this.character.race;
            const buttonArea = {
                x: x - 65,
                y: y - 25,
                width: 130,
                height: 50,
                race: race,
                hovered: false
            };
            this.raceButtons.push(buttonArea);
            let bgColor = 'rgba(64, 64, 64, 0.3)';
            if (isSelected)
                bgColor = 'rgba(96, 96, 96, 0.6)';
            else if (buttonArea.hovered)
                bgColor = 'rgba(80, 80, 80, 0.4)';
            renderer.drawRect(buttonArea.x, buttonArea.y, buttonArea.width, buttonArea.height, bgColor);
            renderer.drawRect(buttonArea.x, buttonArea.y, buttonArea.width, buttonArea.height, '#505050');
            renderer.drawRacePortrait(data.name, x - 18, y - 25, 36, data.portraitColor);
            const color = isSelected ? '#dcd0c0' : '#808080';
            renderer.drawText(data.name, x, y + 15, color, isSelected ? 'bold 10px "Big Apple 3PM", monospace' : '10px "Big Apple 3PM", monospace');
        });
        renderer.drawText('Pozadí:', width / 2, startY + 360, '#606060', '16px "Big Apple 3PM", monospace');
        this.backgroundButtons = [];
        const backgroundKeys = Object.keys(BACKGROUND_DATA);
        const backgroundsPerRow = 5;
        backgroundKeys.forEach((background, index) => {
            const data = BACKGROUND_DATA[background];
            const row = Math.floor(index / backgroundsPerRow);
            const col = index % backgroundsPerRow;
            const x = width / 2 - (backgroundsPerRow * 140) / 2 + col * 140 + 70;
            const y = startY + 390 + row * 50;
            const isSelected = background === this.character.background;
            const buttonArea = {
                x: x - 65,
                y: y - 20,
                width: 130,
                height: 40,
                background: background,
                hovered: false
            };
            this.backgroundButtons.push(buttonArea);
            let bgColor = 'rgba(64, 64, 64, 0.3)';
            if (isSelected)
                bgColor = 'rgba(96, 96, 96, 0.6)';
            else if (buttonArea.hovered)
                bgColor = 'rgba(80, 80, 80, 0.4)';
            renderer.drawRect(buttonArea.x, buttonArea.y, buttonArea.width, buttonArea.height, bgColor);
            renderer.drawRect(buttonArea.x, buttonArea.y, buttonArea.width, buttonArea.height, '#505050');
            const color = isSelected ? '#dcd0c0' : '#808080';
            renderer.drawText(data.name, x, y, color, isSelected ? 'bold 10px "Big Apple 3PM", monospace' : '10px "Big Apple 3PM", monospace');
        });
    }
    renderSkillSelection(renderer) {
        const width = renderer.getWidth();
        const startY = 200;
        renderer.drawText('DOVEDNOSTI', width / 2, startY, '#606060', 'bold 24px "Big Apple 3PM", monospace');
        renderer.drawText(`Zbývající body: ${this.remainingSkillPoints}`, width / 2, startY + 40, '#808080', '16px "Big Apple 3PM", monospace');
        this.skillButtons = [];
        const skillKeys = Object.keys(SKILL_DATA);
        const skillsPerRow = 2;
        skillKeys.forEach((skill, index) => {
            const data = SKILL_DATA[skill];
            const row = Math.floor(index / skillsPerRow);
            const col = index % skillsPerRow;
            const x = width / 2 - 300 + col * 600;
            const y = startY + 80 + row * 60;
            const currentLevel = this.character.skills.get(skill) || 1;
            renderer.drawText(`${data.icon} ${data.name}:`, x - 200, y, '#606060', '16px "Big Apple 3PM", monospace');
            for (let level = 1; level <= 10; level++) {
                const buttonX = x - 100 + (level - 1) * 25;
                const buttonY = y - 10;
                const isActive = level <= currentLevel;
                const buttonArea = {
                    x: buttonX - 10,
                    y: buttonY - 10,
                    width: 20,
                    height: 20,
                    skill: skill,
                    level: level,
                    hovered: false
                };
                this.skillButtons.push(buttonArea);
                let bgColor = isActive ? 'rgba(96, 96, 96, 0.8)' : 'rgba(64, 64, 64, 0.3)';
                if (buttonArea.hovered)
                    bgColor = 'rgba(120, 120, 120, 0.6)';
                renderer.drawRect(buttonArea.x, buttonArea.y, buttonArea.width, buttonArea.height, bgColor);
                renderer.drawRect(buttonArea.x, buttonArea.y, buttonArea.width, buttonArea.height, '#505050');
                const color = isActive ? '#dcd0c0' : '#404040';
                renderer.drawText(level.toString(), buttonX, buttonY + 5, color, '10px "Big Apple 3PM", monospace');
            }
            renderer.drawText(`Úroveň: ${currentLevel}`, x + 160, y, '#dcd0c0', '14px "Big Apple 3PM", monospace');
        });
        renderer.drawText('Klepněte na čísla pro změnu úrovně dovedností', width / 2, startY + 380, '#505050', '12px "Big Apple 3PM", monospace');
    }
    renderShipSelection(renderer) {
        const width = renderer.getWidth();
        const startY = 250;
        renderer.drawText('VYBERTE TYP LODĚ', width / 2, startY, '#606060', 'bold 24px "Big Apple 3PM", monospace');
        const ships = Object.values(ShipType);
        const shipsPerRow = 3;
        const shipWidth = 250;
        const shipHeight = 120;
        this.shipButtons = [];
        ships.forEach((shipType, index) => {
            const template = SHIP_TEMPLATES[shipType];
            const row = Math.floor(index / shipsPerRow);
            const col = index % shipsPerRow;
            const x = width / 2 - (shipsPerRow * shipWidth) / 2 + col * shipWidth + shipWidth / 2;
            const y = startY + 60 + row * (shipHeight + 20);
            const isSelected = shipType === this.selectedShip;
            const buttonArea = {
                x: x - shipWidth / 2,
                y: y - shipHeight / 2,
                width: shipWidth,
                height: shipHeight,
                shipType: shipType,
                hovered: false
            };
            this.shipButtons.push(buttonArea);
            let bgColor = 'rgba(64, 64, 64, 0.7)';
            if (isSelected) {
                bgColor = 'rgba(96, 96, 96, 0.8)';
            }
            else if (buttonArea.hovered) {
                bgColor = 'rgba(80, 80, 80, 0.7)';
            }
            renderer.drawRect(buttonArea.x, buttonArea.y, buttonArea.width, buttonArea.height, bgColor);
            renderer.drawRect(buttonArea.x + 5, buttonArea.y + 5, buttonArea.width - 10, buttonArea.height - 10, 'rgba(32, 32, 32, 0.7)');
            renderer.drawRect(buttonArea.x, buttonArea.y, buttonArea.width, buttonArea.height, '#505050');
            const color = isSelected ? '#dcd0c0' : '#808080';
            renderer.drawText(template.name, x, y - 35, color, isSelected ? 'bold 16px "Big Apple 3PM", monospace' : '14px "Big Apple 3PM", monospace');
            renderer.drawText(`Hull: ${template.baseStats.hull}`, x - 80, y - 10, color, '10px "Big Apple 3PM", monospace');
            renderer.drawText(`Speed: ${template.baseStats.speed}`, x + 80, y - 10, color, '10px "Big Apple 3PM", monospace');
            renderer.drawText(`Shields: ${template.baseStats.shields}`, x - 80, y + 10, color, '10px "Big Apple 3PM", monospace');
            renderer.drawText(`Cargo: ${template.baseStats.cargo}`, x + 80, y + 10, color, '10px "Big Apple 3PM", monospace');
        });
    }
    renderSummary(renderer) {
        const width = renderer.getWidth();
        const startY = 200;
        renderer.drawText('SOUHRN NASTAVENÍ', width / 2, startY, '#606060', 'bold 24px "Big Apple 3PM", monospace');
        const difficultySettings = DIFFICULTY_SETTINGS[this.selectedDifficulty];
        const shipTemplate = SHIP_TEMPLATES[this.selectedShip];
        const raceData = RACE_DATA[this.character.race];
        const backgroundData = BACKGROUND_DATA[this.character.background];
        renderer.drawText('=== POSTAVA ===', width / 2, startY + 50, '#808080', '16px "Big Apple 3PM", monospace');
        renderer.drawText(`Jméno: ${this.character.name || 'Neznámý'}`, width / 2, startY + 80, '#dcd0c0', '14px "Big Apple 3PM", monospace');
        renderer.drawText(`Věk: ${this.character.age} | Pohlaví: ${this.character.gender === CharacterGender.MALE ? 'Muž' : this.character.gender === CharacterGender.FEMALE ? 'Žena' : 'Jiné'}`, width / 2, startY + 105, '#dcd0c0', '14px "Big Apple 3PM", monospace');
        renderer.drawText(`Rasa: ${raceData.name} | Pozadí: ${backgroundData.name}`, width / 2, startY + 130, '#dcd0c0', '14px "Big Apple 3PM", monospace');
        renderer.drawText('=== NASTAVENÍ HRY ===', width / 2, startY + 170, '#808080', '16px "Big Apple 3PM", monospace');
        renderer.drawText(`Obtížnost: ${difficultySettings.name}`, width / 2, startY + 200, '#dcd0c0', '14px "Big Apple 3PM", monospace');
        renderer.drawText(`Galaxie: ${GALAXY_SIZE_DATA[this.galaxySettings.size].name} (${GALAXY_DENSITY_DATA[this.galaxySettings.density].name})`, width / 2, startY + 225, '#dcd0c0', '14px "Big Apple 3PM", monospace');
        renderer.drawText(`Ekonomika: ${ECONOMY_COMPLEXITY_DATA[this.economySettings.complexity].name}`, width / 2, startY + 250, '#dcd0c0', '14px "Big Apple 3PM", monospace');
        renderer.drawText(`Loď: ${shipTemplate.name}`, width / 2, startY + 275, '#dcd0c0', '14px "Big Apple 3PM", monospace');
        renderer.drawText('=== POČÁTEČNÍ ZDROJE ===', width / 2, startY + 315, '#808080', '16px "Big Apple 3PM", monospace');
        renderer.drawText(`Palivo: ${difficultySettings.startingResources.fuel}% | Energie: ${difficultySettings.startingResources.energy}% | Kredity: ${difficultySettings.startingResources.credits + backgroundData.startingCredits}`, width / 2, startY + 345, '#dcd0c0', '14px "Big Apple 3PM", monospace');
        const topSkills = Array.from(this.character.skills.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([skill, level]) => `${SKILL_DATA[skill].name}: ${level}`)
            .join(' | ');
        renderer.drawText(`Nejlepší dovednosti: ${topSkills}`, width / 2, startY + 375, '#808080', '12px "Big Apple 3PM", monospace');
        this.startGameButton.x = width / 2 - this.startGameButton.width / 2;
        this.startGameButton.y = startY + 420;
        const buttonColor = this.startGameButton.pressed ? 'rgba(96, 96, 96, 0.8)' :
            this.startGameButton.hovered ? 'rgba(96, 96, 96, 0.4)' : 'rgba(64, 64, 64, 0.7)';
        renderer.drawRect(this.startGameButton.x, this.startGameButton.y, this.startGameButton.width, this.startGameButton.height, buttonColor);
        renderer.drawRect(this.startGameButton.x, this.startGameButton.y, this.startGameButton.width, this.startGameButton.height, '#505050');
        renderer.drawText('SPUSTIT HRU', width / 2, startY + 450, '#dcd0c0', 'bold 20px "Big Apple 3PM", monospace');
    }
    isPointInRect(x, y, rect) {
        return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
    }
    showTooltip(x, y, title, description) {
        this.tooltip.visible = true;
        this.tooltip.x = x + 10;
        this.tooltip.y = y - 10;
        this.tooltip.title = title;
        this.tooltip.description = description;
        const lines = description.split('\n');
        const maxLineLength = Math.max(title.length, ...lines.map(line => line.length));
        this.tooltip.width = Math.min(400, Math.max(250, maxLineLength * 8));
    }
    renderTooltip(renderer) {
        if (!this.tooltip.visible)
            return;
        const lines = this.tooltip.description.split('\n');
        const totalLines = lines.length + 1;
        const lineHeight = 16;
        const padding = 10;
        const tooltipHeight = totalLines * lineHeight + padding * 2;
        const screenWidth = renderer.getWidth();
        const screenHeight = renderer.getHeight();
        let x = this.tooltip.x;
        let y = this.tooltip.y;
        if (x + this.tooltip.width > screenWidth) {
            x = screenWidth - this.tooltip.width - 10;
        }
        if (y + tooltipHeight > screenHeight) {
            y = screenHeight - tooltipHeight - 10;
        }
        if (y < 0)
            y = 10;
        renderer.drawRect(x - 2, y - 2, this.tooltip.width + 4, tooltipHeight + 4, 'rgba(0, 0, 0, 0.9)');
        renderer.drawRect(x, y, this.tooltip.width, tooltipHeight, 'rgba(32, 32, 48, 0.95)');
        renderer.drawRect(x, y, this.tooltip.width, tooltipHeight, 'rgba(96, 96, 128, 0.8)');
        renderer.drawText(this.tooltip.title, x + padding, y + padding + 12, '#ffeb3b', 'bold 14px "Big Apple 3PM", monospace');
        lines.forEach((line, index) => {
            const lineY = y + padding + 12 + (index + 1) * lineHeight;
            renderer.drawText(line, x + padding, lineY, '#dcd0c0', '12px "Big Apple 3PM", monospace');
        });
    }
    updateHoverStates(input) {
        this.backButton.hovered = false;
        this.nextButton.hovered = false;
        this.nameInputButton.hovered = false;
        this.randomNameButton.hovered = false;
        this.skipNameButton.hovered = false;
        this.ageInputButton.hovered = false;
        this.startGameButton.hovered = false;
        this.difficultyButtons.forEach(btn => btn.hovered = false);
        this.galaxySizeButtons.forEach(btn => btn.hovered = false);
        this.galaxyDensityButtons.forEach(btn => btn.hovered = false);
        this.economyButtons.forEach(btn => btn.hovered = false);
        this.raceButtons.forEach(btn => btn.hovered = false);
        this.genderButtons.forEach(btn => btn.hovered = false);
        this.backgroundButtons.forEach(btn => btn.hovered = false);
        this.skillButtons.forEach(btn => btn.hovered = false);
        this.shipButtons.forEach(btn => btn.hovered = false);
        this.tooltip.visible = false;
        if (!input.isMobile) {
            const mousePos = input.getMousePosition();
            let mouseX = mousePos.x, mouseY = mousePos.y;
            const canvas = document.getElementById('gameCanvas');
            if (canvas) {
                const rect = canvas.getBoundingClientRect();
                mouseX = mousePos.x - rect.left;
                mouseY = mousePos.y - rect.top;
            }
            this.backButton.hovered = this.isPointInRect(mouseX, mouseY, this.backButton);
            this.nextButton.hovered = this.isPointInRect(mouseX, mouseY, this.nextButton);
            this.nameInputButton.hovered = this.isPointInRect(mouseX, mouseY, this.nameInputButton);
            this.randomNameButton.hovered = this.isPointInRect(mouseX, mouseY, this.randomNameButton);
            this.skipNameButton.hovered = this.isPointInRect(mouseX, mouseY, this.skipNameButton);
            this.ageInputButton.hovered = this.isPointInRect(mouseX, mouseY, this.ageInputButton);
            this.startGameButton.hovered = this.isPointInRect(mouseX, mouseY, this.startGameButton);
            this.difficultyButtons.forEach(btn => {
                btn.hovered = this.isPointInRect(mouseX, mouseY, btn);
            });
            this.galaxySizeButtons.forEach(btn => {
                btn.hovered = this.isPointInRect(mouseX, mouseY, btn);
            });
            this.galaxyDensityButtons.forEach(btn => {
                btn.hovered = this.isPointInRect(mouseX, mouseY, btn);
            });
            this.economyButtons.forEach(btn => {
                btn.hovered = this.isPointInRect(mouseX, mouseY, btn);
            });
            this.raceButtons.forEach(btn => {
                btn.hovered = this.isPointInRect(mouseX, mouseY, btn);
                if (btn.hovered) {
                    const raceData = RACE_DATA[btn.race];
                    this.showTooltip(mouseX, mouseY, raceData.name, raceData.description + '\nRasové bonusy: ' + Object.entries(raceData.bonuses).map(([skill, bonus]) => `${SKILL_DATA[skill].name} +${bonus}`).join(', '));
                }
            });
            this.genderButtons.forEach(btn => {
                btn.hovered = this.isPointInRect(mouseX, mouseY, btn);
            });
            this.backgroundButtons.forEach(btn => {
                btn.hovered = this.isPointInRect(mouseX, mouseY, btn);
                if (btn.hovered) {
                    const backgroundData = BACKGROUND_DATA[btn.background];
                    this.showTooltip(mouseX, mouseY, backgroundData.name, backgroundData.description + `\nBonus kredity: ${backgroundData.startingCredits}\nVybavení: ${backgroundData.startingEquipment.join(', ')}`);
                }
            });
            this.skillButtons.forEach(btn => {
                btn.hovered = this.isPointInRect(mouseX, mouseY, btn);
                if (btn.hovered) {
                    const skillData = SKILL_DATA[btn.skill];
                    this.showTooltip(mouseX, mouseY, skillData.name, skillData.description);
                }
            });
            this.shipButtons.forEach(btn => {
                btn.hovered = this.isPointInRect(mouseX, mouseY, btn);
                if (btn.hovered) {
                    const shipData = SHIP_TEMPLATES[btn.shipType];
                    this.showTooltip(mouseX, mouseY, shipData.name, shipData.description + `\nStat: Hull ${shipData.baseStats.hull}, Štíty ${shipData.baseStats.shields}, Rychlost ${shipData.baseStats.speed}, Náklad ${shipData.baseStats.cargo}\nZbraně: ${shipData.weapons.map(w => WEAPON_DATA[w].name).join(', ')}`);
                }
            });
        }
    }
    handleTouchAndMouseClicks(input) {
        let handled = false;
        this.backButton.pressed = false;
        this.nextButton.pressed = false;
        this.startGameButton.pressed = false;
        const mousePressed = input.mouse.justPressed;
        const touchPressed = input.touches.size > 0;
        if (mousePressed || touchPressed) {
            let clickX = 0, clickY = 0;
            if (mousePressed) {
                const canvas = document.getElementById('gameCanvas');
                if (canvas) {
                    const rect = canvas.getBoundingClientRect();
                    clickX = input.mouse.x - rect.left;
                    clickY = input.mouse.y - rect.top;
                }
            }
            else if (touchPressed) {
                const touch = input.touches.values().next().value;
                if (touch) {
                    clickX = touch.x;
                    clickY = touch.y;
                }
            }
            if (this.currentStep > 0 && this.isPointInRect(clickX, clickY, this.backButton)) {
                this.backButton.pressed = true;
                this.currentStep--;
                handled = true;
            }
            else if (this.canProceedFromCurrentStep() && this.isPointInRect(clickX, clickY, this.nextButton)) {
                this.nextButton.pressed = true;
                if (this.currentStep === this.steps.length - 1) {
                    this.startGame();
                }
                else {
                    this.currentStep++;
                }
                handled = true;
            }
            if (!handled) {
                switch (this.currentStep) {
                    case 0:
                        this.difficultyButtons.forEach(btn => {
                            if (this.isPointInRect(clickX, clickY, btn)) {
                                this.selectedDifficulty = btn.difficulty;
                                handled = true;
                            }
                        });
                        break;
                    case 1:
                        this.galaxySizeButtons.forEach(btn => {
                            if (this.isPointInRect(clickX, clickY, btn)) {
                                this.galaxySettings.size = btn.size;
                                handled = true;
                            }
                        });
                        this.galaxyDensityButtons.forEach(btn => {
                            if (this.isPointInRect(clickX, clickY, btn)) {
                                this.galaxySettings.density = btn.density;
                                handled = true;
                            }
                        });
                        break;
                    case 2:
                        this.economyButtons.forEach(btn => {
                            if (this.isPointInRect(clickX, clickY, btn)) {
                                this.economySettings.complexity = btn.complexity;
                                handled = true;
                            }
                        });
                        break;
                    case 3:
                        if (this.isPointInRect(clickX, clickY, this.nameInputButton)) {
                            this.isEditingName = !this.isEditingName;
                            if (input.isMobile && this.isEditingName) {
                                input.activateMobileTextInput(this.character.name, (newText) => {
                                    this.character.name = newText.slice(0, 20);
                                });
                            }
                            else if (input.isMobile && !this.isEditingName) {
                                input.deactivateMobileTextInput();
                            }
                            handled = true;
                        }
                        if (this.isPointInRect(clickX, clickY, this.randomNameButton)) {
                            this.character.name = NameGenerator.generateRandomName(this.character.race);
                            this.isEditingName = false;
                            if (input.isMobile) {
                                input.deactivateMobileTextInput();
                            }
                            handled = true;
                        }
                        if (this.isPointInRect(clickX, clickY, this.skipNameButton)) {
                            this.character.name = '';
                            this.isEditingName = false;
                            if (input.isMobile) {
                                input.deactivateMobileTextInput();
                            }
                            handled = true;
                        }
                        if (this.isPointInRect(clickX, clickY, this.ageInputButton)) {
                            this.character.age = Math.min(100, this.character.age + 1);
                            if (this.character.age > 100)
                                this.character.age = 18;
                            handled = true;
                        }
                        this.genderButtons.forEach(btn => {
                            if (this.isPointInRect(clickX, clickY, btn)) {
                                this.character.gender = btn.gender;
                                handled = true;
                            }
                        });
                        this.raceButtons.forEach(btn => {
                            if (this.isPointInRect(clickX, clickY, btn)) {
                                this.character.race = btn.race;
                                handled = true;
                            }
                        });
                        this.backgroundButtons.forEach(btn => {
                            if (this.isPointInRect(clickX, clickY, btn)) {
                                this.character.background = btn.background;
                                handled = true;
                            }
                        });
                        break;
                    case 4:
                        this.skillButtons.forEach(btn => {
                            if (this.isPointInRect(clickX, clickY, btn)) {
                                const currentLevel = this.character.skills.get(btn.skill) || 1;
                                const targetLevel = btn.level;
                                const difference = targetLevel - currentLevel;
                                if (difference <= this.remainingSkillPoints && targetLevel >= 1 && targetLevel <= 10) {
                                    this.character.skills.set(btn.skill, targetLevel);
                                    this.remainingSkillPoints -= difference;
                                    handled = true;
                                }
                            }
                        });
                        break;
                    case 5:
                        this.shipButtons.forEach(btn => {
                            if (this.isPointInRect(clickX, clickY, btn)) {
                                this.selectedShip = btn.shipType;
                                handled = true;
                            }
                        });
                        break;
                    case 6:
                        if (this.isPointInRect(clickX, clickY, this.startGameButton)) {
                            this.startGameButton.pressed = true;
                            this.startGame();
                            handled = true;
                        }
                        break;
                }
            }
        }
        return handled;
    }
    handleInput(input) {
        this.updateHoverStates(input);
        if (this.handleTouchAndMouseClicks(input)) {
            return;
        }
        if (input.wasKeyJustPressed('escape')) {
            const game = window.game;
            if (game) {
                game.stateManager.setState(GameState.MAIN_MENU);
            }
            return;
        }
        if (this.currentStep === 3) {
            if (input.wasKeyJustPressed('enter')) {
                this.isEditingName = !this.isEditingName;
                if (input.isMobile && this.isEditingName) {
                    input.activateMobileTextInput(this.character.name, (newText) => {
                        this.character.name = newText.slice(0, 20);
                    });
                }
                else if (input.isMobile && !this.isEditingName) {
                    input.deactivateMobileTextInput();
                }
                return;
            }
            if (this.isEditingName) {
                if (!input.isMobile || !input.isMobileTextInputActive()) {
                    input.keys.forEach((keyState, key) => {
                        if (keyState.justPressed && key.length === 1 && this.character.name.length < 20) {
                            this.character.name += key.toUpperCase();
                        }
                    });
                    if (input.wasKeyJustPressed('backspace') && this.character.name.length > 0) {
                        this.character.name = this.character.name.slice(0, -1);
                    }
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
        if (input.wasKeyJustPressed('arrowright') && this.canProceedFromCurrentStep() && this.currentStep < this.steps.length - 1) {
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
            case 5:
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
            case 6:
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
            character: this.character,
            difficulty: this.selectedDifficulty,
            shipType: this.selectedShip,
            galaxySettings: this.galaxySettings,
            economySettings: this.economySettings,
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
            console.log(`Game started as ${gameSetup.character.name} with ${gameSetup.shipType} on ${gameSetup.difficulty} difficulty`);
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
        this.menuOptions = ['POKRAČOVAT', 'ULOŽIT HRU', 'NAČÍST HRU', 'NASTAVENÍ', 'HLAVNÍ MENU', 'UKONČIT'];
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
        renderer.getContext().fillStyle = 'rgba(0, 0, 0, 0.8)';
        renderer.getContext().fillRect(0, 0, width, height);
        renderer.getContext().shadowColor = '#ffc357';
        renderer.getContext().shadowBlur = 10;
        renderer.drawText('HRA POZASTAVENA', width / 2, height / 2 - 120, '#ffc357', 'bold 36px "Big Apple 3PM", monospace');
        renderer.getContext().shadowBlur = 0;
        const menuWidth = 400;
        const menuHeight = this.menuOptions.length * 50 + 40;
        const menuX = width / 2 - menuWidth / 2;
        const menuY = height / 2 - 40;
        renderer.drawRect(menuX, menuY, menuWidth, menuHeight, 'rgba(26, 28, 32, 0.9)');
        renderer.strokeRect(menuX, menuY, menuWidth, menuHeight, '#434c55', 2);
        const startY = height / 2;
        const spacing = 45;
        this.menuOptions.forEach((option, index) => {
            const y = startY + index * spacing;
            const isSelected = index === this.selectedOption;
            if (isSelected) {
                renderer.drawRect(menuX + 10, y - 18, menuWidth - 20, 36, 'rgba(95, 158, 158, 0.3)');
                renderer.strokeRect(menuX + 10, y - 18, menuWidth - 20, 36, '#5f9e9e', 1);
                renderer.drawText('▶ ' + option + ' ◀', width / 2, y, '#52de44', 'bold 20px "Big Apple 3PM", monospace');
            }
            else {
                renderer.drawText(option, width / 2, y, '#a2aab2', '18px "Big Apple 3PM", monospace');
            }
        });
        renderer.drawText('↑↓ Navigace | ENTER Výběr | ESC Pokračovat', width / 2, height - 80, '#5a6978', '14px "Big Apple 3PM", monospace');
        const message = this.message;
        if (message && Date.now() - message.time < 2000) {
            renderer.getContext().shadowColor = message.color;
            renderer.getContext().shadowBlur = 5;
            renderer.drawText(message.text, width / 2, height / 2 + 200, message.color, 'bold 24px "Big Apple 3PM", monospace');
            renderer.getContext().shadowBlur = 0;
        }
    }
    handleInput(input) {
        const touchInput = input.getTouchMenuInput();
        if (input.wasKeyJustPressed('escape') || touchInput.back) {
            const game = window.game;
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
    handleMenuSelection() {
        const game = window.game;
        if (!game)
            return;
        switch (this.selectedOption) {
            case 0:
                game.stateManager.setState(GameState.PLAYING);
                break;
            case 1:
                this.quickSave(game);
                break;
            case 2:
                this.showLoadMenu(game);
                break;
            case 3:
                game.stateManager.setState(GameState.SETTINGS);
                break;
            case 4:
                if (confirm('Opravdu se chcete vrátit do hlavního menu? Neuložený postup bude ztracen.')) {
                    game.stateManager.setState(GameState.MAIN_MENU);
                }
                break;
            case 5:
                if (confirm('Opravdu chcete ukončit hru? Neuložený postup bude ztracen.')) {
                    window.close();
                }
                break;
        }
    }
    quickSave(game) {
        try {
            const success = SaveSystem.saveGame(game, 'quicksave');
            if (success) {
                this.showMessage('HRA ULOŽENA', '#52de44');
                console.log('Game saved successfully');
            }
            else {
                this.showMessage('CHYBA ULOŽENÍ', '#d43d3d');
                console.error('Failed to save game');
            }
        }
        catch (error) {
            console.error('Failed to save game:', error);
            this.showMessage('CHYBA ULOŽENÍ', '#d43d3d');
        }
    }
    showLoadMenu(game) {
        const saveList = SaveSystem.getSaveList();
        if (saveList.length === 0) {
            this.showMessage('ŽÁDNÉ ULOŽENÉ HRY', '#ffc357');
            return;
        }
        try {
            const mostRecentSave = saveList[0];
            const saveData = SaveSystem.loadGame(mostRecentSave.slot);
            if (saveData) {
                SaveSystem.applySaveData(game, saveData);
                game.stateManager.setState(GameState.PLAYING);
                this.showMessage('HRA NAČTENA', '#52de44');
            }
            else {
                this.showMessage('CHYBA PĜI NAČÍTÁNÍ', '#d43d3d');
            }
        }
        catch (error) {
            console.error('Failed to load game:', error);
            this.showMessage('CHYBA PĜI NAČÍTÁNÍ', '#d43d3d');
        }
    }
    showMessage(text, color) {
        this.message = { text, color, time: Date.now() };
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
        const game = window.game;
        if (game?.inputManager && this.settings.controls) {
            game.inputManager.setTouchControlsEnabled(this.settings.controls.touchControlsEnabled);
        }
    }
    update(deltaTime) {
    }
    render(renderer) {
        const width = renderer.getWidth();
        const height = renderer.getHeight();
        renderer.clear('#0a0a0f');
        renderer.drawText('NASTAVENÍ', width / 2, 80, '#52de44', 'bold 36px "Big Apple 3PM", monospace');
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
        const game = window.game;
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
            renderer.drawText(option.name, width / 2 - 200, y, nameColor, isSelected ? 'bold 18px "Big Apple 3PM", monospace' : '16px "Big Apple 3PM", monospace');
            renderer.drawText(option.value, width / 2 + 200, y, valueColor, '16px "Big Apple 3PM", monospace');
            if (isSelected) {
                renderer.drawRect(width / 2 - 250, y - 20, 500, 40, 'rgba(0, 255, 255, 0.1)');
            }
        });
        if (game?.inputManager?.isMobile) {
            renderer.drawText('Mobilní zařízení detekováno', width / 2, startY + 250, '#00ff00', '14px "Big Apple 3PM", monospace');
        }
        else {
            renderer.drawText('Desktop zařízení detekováno', width / 2, startY + 250, '#888888', '14px "Big Apple 3PM", monospace');
        }
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
        const touchInput = input.getTouchMenuInput();
        if (input.wasKeyJustPressed('escape') || touchInput.back) {
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
        if ((input.wasKeyJustPressed('arrowup') || touchInput.up) && this.selectedOption > 0) {
            this.selectedOption--;
        }
        if ((input.wasKeyJustPressed('arrowdown') || touchInput.down) && this.selectedOption < maxOptions - 1) {
            this.selectedOption++;
        }
        if (input.wasKeyJustPressed('enter') || touchInput.select) {
            this.modifySetting();
        }
    }
    getMaxOptionsForTab() {
        switch (this.selectedTab) {
            case 0: return 4;
            case 1: return 4;
            case 2: return 4;
            case 3: return 4;
            default: return 0;
        }
    }
    modifySetting() {
        const game = window.game;
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
            case 2:
                switch (this.selectedOption) {
                    case 0:
                        if (game?.inputManager) {
                            const newValue = !game.inputManager.touchControlsEnabled;
                            game.inputManager.setTouchControlsEnabled(newValue);
                            this.settings.controls = this.settings.controls || {};
                            this.settings.controls.touchControlsEnabled = newValue;
                        }
                        break;
                    case 1:
                        break;
                    case 2:
                        console.log('Joystick sensitivity not implemented yet');
                        break;
                    case 3:
                        console.log('Gamepad support not implemented yet');
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
        this.colors = {
            chassisDark: '#0a0a0a',
            chassisPrimary: '#1a1a1a',
            chassisMidtone: '#2a2a2a',
            chassisLight: '#3a3a3a',
            borderDark: '#0f0f0f',
            borderPrimary: '#404040',
            borderLight: '#606060',
            textAmber: '#ffb000',
            textAmberDim: '#cc8800',
            textGreen: '#00ff41',
            textGreenDim: '#00cc33',
            textWhite: '#e8e8e8',
            textGray: '#888888',
            screenDark: '#001100',
            screenGlow: '#003300',
            scanline: '#002200',
            statusGreen: '#00ff41',
            statusAmber: '#ffb000',
            statusRed: '#ff4444',
            statusBlue: '#4488ff',
            statusOff: '#333333',
            hullBar: '#4488ff',
            hullBarGlow: '#2266dd',
            shieldBar: '#bb44ff',
            shieldBarGlow: '#9922dd',
            energyBar: '#ffbb44',
            energyBarGlow: '#dd9922',
            fuelBar: '#ff6644',
            fuelBarGlow: '#dd4422',
            rivetColor: '#666666',
            screwColor: '#555555',
            wireColor: '#777777'
        };
        this.renderer = renderer;
    }
    update(player) {
        const screenHeight = this.renderer.getHeight();
        this.height = Math.floor(screenHeight * 0.15);
    }
    render(player) {
        const screenWidth = this.renderer.getWidth();
        const screenHeight = this.renderer.getHeight();
        const statusY = screenHeight - this.height;
        this.drawMainPanel(screenWidth, statusY);
        this.drawShipStatus(player, 20, statusY + 8);
        this.drawWeaponCargoStatus(player, 240, statusY + 8);
        this.drawSystemInfo(player, screenWidth / 2 - 80, statusY + 8);
        this.drawMissionStatus(player, screenWidth / 2 + 120, statusY + 8);
        this.drawRadarSection(player, screenWidth - 160, statusY + 8);
        this.drawFunctionalButtons(screenWidth, statusY);
    }
    drawMainPanel(screenWidth, statusY) {
        const ctx = this.renderer.getContext();
        ctx.fillStyle = this.colors.chassisDark;
        ctx.fillRect(0, statusY, screenWidth, this.height);
        ctx.fillStyle = this.colors.chassisPrimary;
        ctx.fillRect(2, statusY + 2, screenWidth - 4, this.height - 4);
        ctx.fillStyle = this.colors.chassisLight;
        ctx.fillRect(2, statusY + 2, screenWidth - 4, 1);
        ctx.fillStyle = this.colors.borderDark;
        ctx.fillRect(2, statusY + this.height - 3, screenWidth - 4, 1);
        for (let x = 20; x < screenWidth - 20; x += 80) {
            this.drawRivet(ctx, x, statusY + 6);
        }
        const sectionWidth = screenWidth / 3;
        for (let i = 1; i < 3; i++) {
            const dividerX = sectionWidth * i;
            ctx.fillStyle = this.colors.borderDark;
            ctx.fillRect(dividerX - 1, statusY + 8, 2, this.height - 16);
            ctx.fillStyle = this.colors.chassisLight;
            ctx.fillRect(dividerX, statusY + 8, 1, this.height - 16);
            this.drawRivet(ctx, dividerX, statusY + 15);
            this.drawRivet(ctx, dividerX, statusY + this.height - 15);
        }
        this.drawCornerReinforcement(ctx, 5, statusY + 5);
        this.drawCornerReinforcement(ctx, screenWidth - 15, statusY + 5);
        this.drawCornerReinforcement(ctx, 5, statusY + this.height - 15);
        this.drawCornerReinforcement(ctx, screenWidth - 15, statusY + this.height - 15);
    }
    drawRivet(ctx, x, y) {
        ctx.fillStyle = this.colors.borderDark;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = this.colors.rivetColor;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = this.colors.chassisLight;
        ctx.beginPath();
        ctx.arc(x - 1, y - 1, 1, 0, Math.PI * 2);
        ctx.fill();
    }
    drawCornerReinforcement(ctx, x, y) {
        ctx.fillStyle = this.colors.chassisMidtone;
        ctx.fillRect(x, y, 10, 10);
        ctx.strokeStyle = this.colors.borderDark;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, 10, 10);
        ctx.fillStyle = this.colors.screwColor;
        ctx.fillRect(x + 2, y + 2, 2, 2);
        ctx.fillRect(x + 6, y + 2, 2, 2);
        ctx.fillRect(x + 2, y + 6, 2, 2);
        ctx.fillRect(x + 6, y + 6, 2, 2);
    }
    drawShipStatus(player, x, y) {
        const ctx = this.renderer.getContext();
        this.drawCRTBezel(ctx, x - 5, y - 5, 200, 70);
        ctx.fillStyle = this.colors.textAmber;
        ctx.font = 'bold 8px "Big Apple 3PM", monospace';
        ctx.textAlign = 'left';
        ctx.fillText('>>> SHIP STATUS <<<', x + 5, y + 10);
        ctx.shadowBlur = 3;
        ctx.shadowColor = this.colors.textAmber;
        ctx.fillText('>>> SHIP STATUS <<<', x + 5, y + 10);
        ctx.shadowBlur = 0;
        this.drawCRTStatusBar('HULL', player.hull, player.maxHull, x + 5, y + 20, this.colors.hullBar, this.colors.hullBarGlow, 140);
        this.drawCRTStatusBar('SHLD', player.shields, player.maxShields, x + 5, y + 32, this.colors.shieldBar, this.colors.shieldBarGlow, 140);
        this.drawCRTStatusBar('PWR', player.energy, player.maxEnergy, x + 5, y + 44, this.colors.energyBar, this.colors.energyBarGlow, 140);
        this.drawCRTStatusBar('FUEL', player.fuel, player.maxFuel, x + 5, y + 56, this.colors.fuelBar, this.colors.fuelBarGlow, 140);
        ctx.fillStyle = this.colors.textAmberDim;
        ctx.font = '6px "Big Apple 3PM", monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`${Math.floor(player.hull).toString().padStart(3, '0')}/${player.maxHull.toString().padStart(3, '0')}`, x + 190, y + 26);
        ctx.fillText(`${Math.floor(player.shields).toString().padStart(3, '0')}/${player.maxShields.toString().padStart(3, '0')}`, x + 190, y + 38);
        ctx.fillText(`${Math.floor(player.energy).toString().padStart(3, '0')}/${player.maxEnergy.toString().padStart(3, '0')}`, x + 190, y + 50);
        ctx.fillText(`${Math.floor(player.fuel).toString().padStart(3, '0')}/${player.maxFuel.toString().padStart(3, '0')}`, x + 190, y + 62);
    }
    drawCRTBezel(ctx, x, y, width, height) {
        ctx.fillStyle = this.colors.chassisDark;
        ctx.fillRect(x, y, width, height);
        ctx.fillStyle = this.colors.chassisMidtone;
        ctx.fillRect(x + 3, y + 3, width - 6, height - 6);
        ctx.fillStyle = this.colors.screenDark;
        ctx.fillRect(x + 5, y + 5, width - 10, height - 10);
        for (let i = y + 6; i < y + height - 5; i += 2) {
            ctx.fillStyle = this.colors.scanline;
            ctx.fillRect(x + 5, i, width - 10, 1);
        }
        ctx.fillStyle = this.colors.screenGlow;
        ctx.fillRect(x + 6, y + 6, width - 12, height - 12);
        this.drawRivet(ctx, x + 8, y + 8);
        this.drawRivet(ctx, x + width - 8, y + 8);
        this.drawRivet(ctx, x + 8, y + height - 8);
        this.drawRivet(ctx, x + width - 8, y + height - 8);
    }
    drawCRTStatusBar(label, current, max, x, y, color, glowColor, width) {
        const ctx = this.renderer.getContext();
        const percent = Math.max(0, Math.min(100, (current / max) * 100));
        const barHeight = 8;
        const indicatorColor = percent > 75 ? this.colors.statusGreen :
            percent > 50 ? this.colors.statusAmber :
                percent > 25 ? this.colors.statusRed : this.colors.statusRed;
        ctx.fillStyle = this.colors.borderDark;
        ctx.fillRect(x, y + 1, 8, 6);
        ctx.shadowBlur = 4;
        ctx.shadowColor = indicatorColor;
        ctx.fillStyle = indicatorColor;
        ctx.fillRect(x + 1, y + 2, 6, 4);
        ctx.shadowBlur = 0;
        ctx.fillStyle = this.colors.textAmber;
        ctx.font = 'bold 6px "Big Apple 3PM", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(label, x + 12, y + 6);
        ctx.fillStyle = this.colors.borderDark;
        ctx.fillRect(x + 42, y - 1, width + 2, barHeight + 2);
        ctx.fillStyle = this.colors.screenDark;
        ctx.fillRect(x + 43, y, width, barHeight);
        const fillWidth = (width - 2) * (percent / 100);
        if (fillWidth > 0) {
            ctx.fillStyle = color;
            ctx.fillRect(x + 44, y + 1, fillWidth, barHeight - 2);
            ctx.shadowBlur = 2;
            ctx.shadowColor = glowColor;
            ctx.fillStyle = glowColor;
            ctx.fillRect(x + 44, y + 1, fillWidth, barHeight - 2);
            ctx.shadowBlur = 0;
            ctx.fillStyle = this.colors.textWhite;
            ctx.fillRect(x + 44, y + 1, fillWidth, 1);
        }
        for (let i = 0; i < width; i += 10) {
            ctx.fillStyle = this.colors.borderDark;
            ctx.fillRect(x + 44 + i, y, 1, barHeight);
        }
    }
    drawStatusBar(label, current, max, x, y, color, width) {
        this.drawCRTStatusBar(label, current, max, x, y, color, color, width);
    }
    drawSystemInfo(player, x, y) {
        const ctx = this.renderer.getContext();
        this.drawCRTBezel(ctx, x - 5, y - 5, 220, 70);
        ctx.fillStyle = this.colors.textGreen;
        ctx.font = 'bold 8px "Big Apple 3PM", monospace';
        ctx.textAlign = 'left';
        ctx.shadowBlur = 3;
        ctx.shadowColor = this.colors.textGreen;
        ctx.fillText('>>> NAVIGATION <<<', x + 5, y + 10);
        ctx.shadowBlur = 0;
        const speed = Math.sqrt(player.velocity.x ** 2 + player.velocity.y ** 2);
        ctx.fillStyle = this.colors.textGreenDim;
        ctx.font = '6px "Big Apple 3PM", monospace';
        ctx.fillText(`VEL: ${speed.toFixed(2).padStart(6, '0')} U/S`, x + 5, y + 22);
        ctx.fillText(`POS: ${Math.floor(player.position.x).toString().padStart(6, '0')},${Math.floor(player.position.y).toString().padStart(6, '0')}`, x + 5, y + 32);
        ctx.fillText(`HDG: ${Math.floor((player.angle * 180 / Math.PI + 360) % 360).toString().padStart(3, '0')}°`, x + 5, y + 42);
        ctx.fillStyle = this.colors.textGreen;
        ctx.fillText('SYS STATUS:', x + 5, y + 54);
        const systems = [
            { name: 'NAV', active: true },
            { name: 'COM', active: true },
            { name: 'DEF', active: player.shields > 0 },
            { name: 'PWR', active: player.energy > 10 },
            { name: 'ENG', active: player.fuel > 0 }
        ];
        for (let i = 0; i < systems.length; i++) {
            const sys = systems[i];
            const baseX = x + 10 + i * 35;
            ctx.fillStyle = sys.active ? this.colors.textGreen : this.colors.textGray;
            ctx.fillText(sys.name, baseX + 8, y + 62);
            ctx.fillStyle = this.colors.borderDark;
            ctx.fillRect(baseX, y + 56, 6, 6);
            const lightColor = sys.active ? this.colors.statusGreen : this.colors.statusOff;
            if (sys.active) {
                ctx.shadowBlur = 2;
                ctx.shadowColor = lightColor;
            }
            ctx.fillStyle = lightColor;
            ctx.fillRect(baseX + 1, y + 57, 4, 4);
            ctx.shadowBlur = 0;
        }
    }
    drawRadarSection(player, x, y) {
        const ctx = this.renderer.getContext();
        this.drawCRTBezel(ctx, x - 5, y - 5, 140, 70);
        ctx.fillStyle = this.colors.statusBlue;
        ctx.font = 'bold 8px "Big Apple 3PM", monospace';
        ctx.textAlign = 'left';
        ctx.shadowBlur = 3;
        ctx.shadowColor = this.colors.statusBlue;
        ctx.fillText('>>> RADAR <<<', x + 5, y + 10);
        ctx.shadowBlur = 0;
        const radarSize = 60;
        const radarX = x + 5;
        const radarY = y + 15;
        ctx.fillStyle = this.colors.borderDark;
        ctx.fillRect(radarX - 2, radarY - 2, radarSize + 4, radarSize + 4);
        ctx.fillStyle = this.colors.screenDark;
        ctx.fillRect(radarX, radarY, radarSize, radarSize);
        ctx.strokeStyle = this.colors.statusBlue;
        ctx.lineWidth = 1;
        ctx.shadowBlur = 1;
        ctx.shadowColor = this.colors.statusBlue;
        const centerX = radarX + radarSize / 2;
        const centerY = radarY + radarSize / 2;
        ctx.beginPath();
        ctx.moveTo(centerX, radarY);
        ctx.lineTo(centerX, radarY + radarSize);
        ctx.moveTo(radarX, centerY);
        ctx.lineTo(radarX + radarSize, centerY);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(centerX, centerY, radarSize / 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(centerX, centerY, radarSize / 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(centerX, centerY, radarSize / 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.shadowBlur = 4;
        ctx.shadowColor = this.colors.statusGreen;
        ctx.fillStyle = this.colors.statusGreen;
        ctx.fillRect(centerX - 1, centerY - 1, 3, 3);
        ctx.strokeStyle = this.colors.statusGreen;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + Math.cos(player.angle) * 8, centerY + Math.sin(player.angle) * 8);
        ctx.stroke();
        ctx.shadowBlur = 0;
        const sweepAngle = (Date.now() * 0.002) % (Math.PI * 2);
        for (let i = 0; i < 10; i++) {
            const trailAngle = sweepAngle - (i * 0.1);
            const alpha = (10 - i) / 20;
            ctx.strokeStyle = `rgba(0, 255, 65, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(centerX + Math.cos(trailAngle) * radarSize / 2, centerY + Math.sin(trailAngle) * radarSize / 2);
            ctx.stroke();
        }
        ctx.fillStyle = this.colors.statusBlue;
        ctx.font = '5px "Big Apple 3PM", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('500', radarX + radarSize + 8, radarY + 15);
        ctx.fillText('1K', radarX + radarSize + 8, radarY + 35);
        ctx.fillText('2K', radarX + radarSize + 8, radarY + 55);
        ctx.fillStyle = this.colors.textGreenDim;
        ctx.font = '6px "Big Apple 3PM", monospace';
        ctx.textAlign = 'left';
        ctx.fillText('RANGE: 1000U', x + 60, y + 25);
        ctx.fillText('CONTACTS: 0', x + 60, y + 35);
        ctx.fillText('THREAT: LOW', x + 60, y + 45);
    }
    drawWeaponCargoStatus(player, x, y) {
        const ctx = this.renderer.getContext();
        this.drawCRTBezel(ctx, x - 5, y - 5, 180, 70);
        ctx.fillStyle = this.colors.statusRed;
        ctx.font = 'bold 8px "Big Apple 3PM", monospace';
        ctx.textAlign = 'left';
        ctx.shadowBlur = 3;
        ctx.shadowColor = this.colors.statusRed;
        ctx.fillText('>>> WEAPONS <<<', x + 5, y + 10);
        ctx.shadowBlur = 0;
        const weapons = [
            { name: 'PLS', charge: 85, active: true },
            { name: 'LSR', charge: 92, active: true },
            { name: 'MSL', charge: 12, active: false },
            { name: 'TRP', charge: 0, active: false }
        ];
        for (let i = 0; i < weapons.length; i++) {
            const weapon = weapons[i];
            const weaponY = y + 20 + i * 9;
            ctx.fillStyle = this.colors.borderDark;
            ctx.fillRect(x + 5, weaponY, 6, 6);
            const lightColor = weapon.active ? this.colors.statusRed : this.colors.statusOff;
            if (weapon.active) {
                ctx.shadowBlur = 2;
                ctx.shadowColor = lightColor;
            }
            ctx.fillStyle = lightColor;
            ctx.fillRect(x + 6, weaponY + 1, 4, 4);
            ctx.shadowBlur = 0;
            ctx.fillStyle = weapon.active ? this.colors.statusRed : this.colors.textGray;
            ctx.font = '6px "Big Apple 3PM", monospace';
            ctx.fillText(weapon.name, x + 15, weaponY + 5);
            const chargeWidth = 60;
            ctx.fillStyle = this.colors.borderDark;
            ctx.fillRect(x + 35, weaponY, chargeWidth + 2, 6);
            if (weapon.charge > 0) {
                const fillWidth = (chargeWidth * weapon.charge) / 100;
                ctx.fillStyle = weapon.active ? this.colors.statusRed : this.colors.textGray;
                ctx.fillRect(x + 36, weaponY + 1, fillWidth, 4);
            }
            ctx.fillStyle = this.colors.textAmberDim;
            ctx.font = '5px "Big Apple 3PM", monospace';
            ctx.textAlign = 'right';
            ctx.fillText(`${weapon.charge}%`, x + 170, weaponY + 5);
        }
        ctx.fillStyle = this.colors.textAmber;
        ctx.font = 'bold 6px "Big Apple 3PM", monospace';
        ctx.textAlign = 'left';
        ctx.fillText('CARGO: 15/50 TONS', x + 5, y + 62);
    }
    drawMissionStatus(player, x, y) {
        const ctx = this.renderer.getContext();
        this.drawCRTBezel(ctx, x - 5, y - 5, 160, 70);
        ctx.fillStyle = this.colors.textAmber;
        ctx.font = 'bold 8px "Big Apple 3PM", monospace';
        ctx.textAlign = 'left';
        ctx.shadowBlur = 3;
        ctx.shadowColor = this.colors.textAmber;
        ctx.fillText('>>> MISSION <<<', x + 5, y + 10);
        ctx.shadowBlur = 0;
        ctx.fillStyle = this.colors.textAmberDim;
        ctx.font = '6px "Big Apple 3PM", monospace';
        ctx.fillText('PRIMARY: EXPLORATION', x + 5, y + 22);
        ctx.fillText('STATUS: IN PROGRESS', x + 5, y + 32);
        ctx.fillText('PROGRESS: 23%', x + 5, y + 42);
        const gameTime = new Date(Date.now());
        const hours = gameTime.getHours().toString().padStart(2, '0');
        const minutes = gameTime.getMinutes().toString().padStart(2, '0');
        const seconds = gameTime.getSeconds().toString().padStart(2, '0');
        ctx.fillStyle = this.colors.statusBlue;
        ctx.font = 'bold 7px "Big Apple 3PM", monospace';
        ctx.fillText(`TIME: ${hours}:${minutes}:${seconds}`, x + 5, y + 54);
        ctx.fillStyle = this.colors.statusGreen;
        ctx.fillText('CREDITS: 2,847', x + 5, y + 62);
    }
    drawFunctionalButtons(screenWidth, statusY) {
        const ctx = this.renderer.getContext();
        const buttonPanelY = statusY - 25;
        ctx.fillStyle = this.colors.chassisPrimary;
        ctx.fillRect(0, buttonPanelY, screenWidth, 25);
        ctx.fillStyle = this.colors.borderDark;
        ctx.fillRect(0, buttonPanelY, screenWidth, 1);
        const buttons = [
            { label: 'INV', key: 'I', active: false },
            { label: 'MAP', key: 'M', active: false },
            { label: 'LOG', key: 'L', active: false },
            { label: 'COM', key: 'C', active: true },
            { label: 'TRD', key: 'T', active: false },
            { label: 'OPT', key: 'O', active: false }
        ];
        const buttonWidth = 60;
        const buttonSpacing = 80;
        const startX = 50;
        for (let i = 0; i < buttons.length; i++) {
            const button = buttons[i];
            const buttonX = startX + i * buttonSpacing;
            const buttonY = buttonPanelY + 5;
            ctx.fillStyle = button.active ? this.colors.chassisLight : this.colors.chassisMidtone;
            ctx.fillRect(buttonX, buttonY, buttonWidth, 15);
            ctx.strokeStyle = this.colors.borderPrimary;
            ctx.lineWidth = 1;
            ctx.strokeRect(buttonX, buttonY, buttonWidth, 15);
            ctx.fillStyle = button.active ? this.colors.statusGreen : this.colors.textGray;
            ctx.font = 'bold 7px "Big Apple 3PM", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(button.label, buttonX + buttonWidth / 2, buttonY + 10);
            ctx.fillStyle = this.colors.textAmberDim;
            ctx.font = '5px "Big Apple 3PM", monospace';
            ctx.fillText(`[${button.key}]`, buttonX + buttonWidth / 2, buttonY + 18);
            if (button.active) {
                ctx.fillStyle = this.colors.statusGreen;
                ctx.shadowBlur = 2;
                ctx.shadowColor = this.colors.statusGreen;
                ctx.fillRect(buttonX + 2, buttonY + 2, 3, 3);
                ctx.shadowBlur = 0;
            }
        }
        const gameTime = new Date(Date.now());
        const timeString = gameTime.toLocaleTimeString('en-US', { hour12: false });
        ctx.fillStyle = this.colors.textAmber;
        ctx.font = 'bold 8px "Big Apple 3PM", monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`SYSTEM TIME: ${timeString}`, screenWidth - 20, buttonPanelY + 15);
        ctx.fillStyle = this.colors.statusGreen;
        ctx.font = '6px "Big Apple 3PM", monospace';
        ctx.fillText('60 FPS', screenWidth - 20, buttonPanelY + 8);
    }
}
export class GameEngine {
    constructor(canvasId) {
        this.gameTime = 0;
        this.lastFrameTime = 0;
        this.targetFPS = 60;
        this.frameInterval = 1000 / this.targetFPS;
        this.lastRenderTime = 0;
        this.frameCount = 0;
        this.fpsCounter = 0;
        this.fpsUpdateTimer = 0;
        this.maxDeltaTime = 1 / 30;
        this.isRunning = false;
        this.animationFrameId = 0;
        this.gameLoop = () => {
            if (!this.isRunning)
                return;
            const currentTime = performance.now();
            let deltaTime = (currentTime - this.lastFrameTime) / 1000;
            deltaTime = Math.min(deltaTime, this.maxDeltaTime);
            this.update(deltaTime);
            const timeSinceLastRender = currentTime - this.lastRenderTime;
            if (timeSinceLastRender >= this.frameInterval) {
                this.render();
                this.lastRenderTime = currentTime;
                this.frameCount++;
            }
            this.lastFrameTime = currentTime;
            this.gameTime += deltaTime;
            this.animationFrameId = requestAnimationFrame(this.gameLoop);
        };
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
        this.setupPerformanceMonitoring();
    }
    setupPerformanceMonitoring() {
        setInterval(() => {
            this.fpsCounter = this.frameCount;
            this.frameCount = 0;
            if (this.fpsCounter < 45) {
                console.warn(`Low FPS detected: ${this.fpsCounter}`);
            }
        }, 1000);
    }
    startGameLoop() {
        if (this.isRunning)
            return;
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.lastRenderTime = this.lastFrameTime;
        console.log('Game loop started');
        this.gameLoop();
    }
    stopGameLoop() {
        this.isRunning = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = 0;
        }
        console.log('Game loop stopped');
    }
    update(deltaTime) {
        this.inputManager.update();
        this.stateManager.update(deltaTime);
        if (this.stateManager.currentState === GameState.PLAYING) {
            this.updatePlayerOptimized(deltaTime);
            const scene = this.sceneManager.getCurrentScene();
            if (scene) {
                scene.update(deltaTime, this);
            }
            this.camera.followTarget(this.player.position, deltaTime, this.renderer.getWidth(), this.renderer.getHeight());
            this.questSystem.updateTimers(deltaTime);
            this.effectSystem.update(deltaTime);
            this.statusBar.update(this.player);
        }
    }
    updatePlayerOptimized(deltaTime) {
        const inputState = {
            thrust: this.inputManager.isKeyPressed('ArrowUp') || this.inputManager.isKeyPressed('KeyW'),
            turnLeft: this.inputManager.isKeyPressed('ArrowLeft') || this.inputManager.isKeyPressed('KeyA'),
            turnRight: this.inputManager.isKeyPressed('ArrowRight') || this.inputManager.isKeyPressed('KeyD'),
            brake: this.inputManager.isKeyPressed('ArrowDown') || this.inputManager.isKeyPressed('KeyS'),
            fire: this.inputManager.isKeyPressed('Space')
        };
        this.player.update(deltaTime, inputState);
    }
    render() {
        this.renderer.clear('#000000');
        if (this.stateManager.currentState === GameState.PLAYING) {
            const scene = this.sceneManager.getCurrentScene();
            if (scene) {
                scene.render(this.renderer, this.camera);
            }
            if (this.isPlayerVisible()) {
                this.player.render(this.renderer, this.camera);
            }
            this.effectSystem.render(this.renderer, this.camera);
            this.renderHUD();
            this.statusBar.render(this.player);
            this.inputManager.renderTouchControls(this.renderer);
        }
        else {
            this.stateManager.render(this.renderer);
        }
    }
    isPlayerVisible() {
        const screenWidth = this.renderer.getWidth();
        const screenHeight = this.renderer.getHeight();
        const screenPos = this.camera.worldToScreen(this.player.position.x, this.player.position.y);
        const margin = 100;
        return (screenPos.x > -margin &&
            screenPos.x < screenWidth + margin &&
            screenPos.y > -margin &&
            screenPos.y < screenHeight + margin);
    }
    renderHUD() {
        const width = this.renderer.getWidth();
        const height = this.renderer.getHeight();
        const ctx = this.renderer.getContext();
        ctx.strokeStyle = 'rgba(96, 96, 96, 0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(width / 2 - 8, height / 2);
        ctx.lineTo(width / 2 + 8, height / 2);
        ctx.moveTo(width / 2, height / 2 - 8);
        ctx.lineTo(width / 2, height / 2 + 8);
        ctx.stroke();
        const posX = Math.round(this.player.position.x);
        const posY = Math.round(this.player.position.y);
        const speed = Math.sqrt(this.player.velocity.x ** 2 + this.player.velocity.y ** 2);
        ctx.fillStyle = '#a2aab2';
        ctx.font = '10px "Big Apple 3PM", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`X: ${posX} AU`, 10, 25);
        ctx.fillText(`Y: ${posY} AU`, 10, 40);
        ctx.fillText(`Speed: ${speed.toFixed(1)} U/S`, 10, 55);
        if (this.frameCount % 30 === 0) {
            ctx.fillStyle = this.fpsCounter >= 50 ? '#00ff41' : this.fpsCounter >= 30 ? '#ffb000' : '#ff4444';
            ctx.font = '8px "Big Apple 3PM", monospace';
            ctx.textAlign = 'right';
            ctx.fillText(`FPS: ${this.fpsCounter}`, width - 10, 20);
            if ('memory' in performance) {
                const memory = performance.memory;
                const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
                ctx.fillStyle = '#888888';
                ctx.fillText(`MEM: ${usedMB}MB`, width - 10, 35);
            }
        }
    }
    setTargetFPS(fps) {
        this.targetFPS = Math.max(30, Math.min(120, fps));
        this.frameInterval = 1000 / this.targetFPS;
    }
    getPerformanceStats() {
        const stats = {
            fps: this.fpsCounter,
            frameTime: this.frameInterval
        };
        if ('memory' in performance) {
            const memory = performance.memory;
            stats.memoryUsage = Math.round(memory.usedJSHeapSize / 1048576);
        }
        return stats;
    }
    dispose() {
        this.stopGameLoop();
        console.log('Game engine disposed');
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
        game.startGameLoop();
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
    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', initializeGame);
    }
    else {
        initializeGame();
    }
}
//# sourceMappingURL=main.js.map