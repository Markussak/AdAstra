import { GameState, DifficultyLevel, ShipType, CharacterGender, CharacterRace, CharacterSkill, CharacterBackground, GalaxySize, GalaxyDensity, EconomyComplexity } from './types';
import { Renderer } from './renderer';
import { Camera } from './camera';
import { InputManager } from './input';
import { PlayerShip } from './player';
import { StarSystemScene, InterstellarSpaceScene } from './scenes';
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
        this.states.set(GameState.LOADING, new LoadingState(this));
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
        else {
            console.error(`No state found for ${this.currentState}`);
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
    constructor(stateManager) {
        this.progress = 0;
        this.loadingTexts = LOADING_MESSAGES;
        this.currentTextIndex = 0;
        this.lastUpdate = 0;
        this.startTime = 0;
        this.hasTransitioned = false;
        this.stateManager = stateManager;
    }
    enter() {
        console.log('🔄 Loading state entered');
        this.progress = 0;
        this.currentTextIndex = 0;
        this.lastUpdate = Date.now();
        this.startTime = Date.now();
        this.hasTransitioned = false;
        console.log('🔄 Loading state initialized, starting progress simulation');
        this.updateHTMLLoadingDisplay();
    }
    update(deltaTime) {
        const now = Date.now();
        const elapsed = now - this.startTime;
        if (elapsed % 1000 < 50) {
            console.log(`Loading progress: ${Math.round(this.progress)}%, elapsed: ${elapsed}ms`);
        }
        if (elapsed > 300 && now - this.lastUpdate > 150) {
            this.progress += Math.random() * 15 + 5;
            if (this.progress > 100)
                this.progress = 100;
            if (Math.random() < 0.4 && this.currentTextIndex < this.loadingTexts.length - 1) {
                this.currentTextIndex++;
            }
            this.updateHTMLLoadingDisplay();
            this.lastUpdate = now;
            if (this.progress >= 100 && elapsed > 1500 && !this.hasTransitioned) {
                this.hasTransitioned = true;
                console.log('Loading conditions met, transitioning to main menu...');
                setTimeout(() => {
                    console.log('Loading complete, switching to main menu');
                    this.hideHTMLLoadingOverlay();
                    this.stateManager.setState(GameState.MAIN_MENU);
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
        const ctx = renderer.getContext();
        renderer.clear('#0a0a0a');
        const phosphorGradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) / 2);
        phosphorGradient.addColorStop(0, 'rgba(24, 30, 52, 0.15)');
        phosphorGradient.addColorStop(0.7, 'rgba(16, 24, 46, 0.08)');
        phosphorGradient.addColorStop(1, 'rgba(6, 11, 17, 0)');
        ctx.fillStyle = phosphorGradient;
        ctx.fillRect(0, 0, width, height);
        for (let i = 0; i < 150; i++) {
            const x = (i * 123.456) % width;
            const y = (i * 789.123) % height;
            const alpha = Math.sin(Date.now() * 0.001 + i) * 0.3 + 0.7;
            ctx.globalAlpha = alpha * 0.3;
            const size = Math.random() > 0.8 ? 2 : 1;
            renderer.drawRect(x, y, size, size, '#7077A1');
        }
        ctx.globalAlpha = 1.0;
        ctx.globalAlpha = 0.08;
        for (let y = 0; y < height; y += 4) {
            ctx.strokeStyle = '#3F4F44';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        ctx.globalAlpha = 1.0;
        this.drawTerminalFrame(renderer, 50, 80, width - 100, height - 160);
        const titleGlow = Math.sin(this.animationTime * 3) * 0.3 + 0.7;
        ctx.shadowColor = '#F6B17A';
        ctx.shadowBlur = 15 * titleGlow;
        renderer.drawText('STAR DUST VOYAGER', width / 2, height / 4, `rgba(255, 235, 153, ${titleGlow})`, 'bold 48px "Big Apple 3PM", monospace');
        ctx.shadowBlur = 8;
        renderer.drawText('GALAXY WANDERER', width / 2, height / 4 + 50, '#E2DFD0', '24px "Big Apple 3PM", monospace');
        ctx.shadowBlur = 0;
        const startY = height / 2 + 50;
        const spacing = 70;
        this.menuOptions.forEach((option, index) => {
            const y = startY + index * spacing;
            const isSelected = index === this.selectedOption;
            this.drawRetroButton(renderer, width / 2 - 180, y - 25, 360, 50, isSelected, option);
        });
        this.drawTerminalDetails(renderer);
        renderer.drawText('VER 2.0.0', width - 100, height - 40, '#6aaf9d', 'bold 10px "Big Apple 3PM", monospace');
        renderer.drawText('SYSTEM READY', width - 120, height - 25, '#6aaf9d', '8px "Big Apple 3PM", monospace');
        renderer.drawText('↑↓ NAVIGATE | ENTER SELECT | ESC BACK', width / 2, height - 30, '#94c5ac', '12px "Big Apple 3PM", monospace');
        const vignetteGradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) / 2);
        vignetteGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vignetteGradient.addColorStop(0.8, 'rgba(0, 0, 0, 0)');
        vignetteGradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
        ctx.fillStyle = vignetteGradient;
        ctx.fillRect(0, 0, width, height);
    }
    drawTerminalFrame(renderer, x, y, w, h) {
        const ctx = renderer.getContext();
        ctx.strokeStyle = '#3F4F44';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, w, h);
        ctx.strokeStyle = '#6aaf9d';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 5, y + 5, w - 10, h - 10);
        const bracketSize = 20;
        ctx.strokeStyle = '#94c5ac';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + bracketSize, y);
        ctx.lineTo(x, y);
        ctx.lineTo(x, y + bracketSize);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + w - bracketSize, y);
        ctx.lineTo(x + w, y);
        ctx.lineTo(x + w, y + bracketSize);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y + h - bracketSize);
        ctx.lineTo(x, y + h);
        ctx.lineTo(x + bracketSize, y + h);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + w - bracketSize, y + h);
        ctx.lineTo(x + w, y + h);
        ctx.lineTo(x + w, y + h - bracketSize);
        ctx.stroke();
    }
    drawRetroButton(renderer, x, y, w, h, selected, text) {
        const ctx = renderer.getContext();
        const offset = selected ? 0 : 2;
        ctx.fillStyle = '#001100';
        ctx.fillRect(x + offset, y + offset, w, h);
        ctx.fillStyle = selected ? '#003300' : '#002200';
        ctx.fillRect(x + offset + 2, y + offset + 2, w - 4, h - 4);
        if (selected) {
            ctx.strokeStyle = '#F97300';
            ctx.lineWidth = 2;
            ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
            const pulseAlpha = Math.sin(this.animationTime * 8) * 0.3 + 0.7;
            ctx.shadowColor = '#F97300';
            ctx.shadowBlur = 12 * pulseAlpha;
        }
        else {
            ctx.strokeStyle = '#524C42';
            ctx.lineWidth = 1;
            ctx.strokeRect(x + offset + 1, y + offset + 1, w - 2, h - 2);
        }
        const textColor = selected ? '#ffeb99' : '#A27B5C';
        const textSize = selected ? 'bold 18px' : '16px';
        renderer.drawText(text, x + w / 2, y + h / 2 + 3, textColor, `${textSize} "Big Apple 3PM", monospace`);
        if (selected) {
            renderer.drawText('►', x + 20, y + h / 2 + 3, '#F97300', 'bold 16px "Big Apple 3PM", monospace');
            renderer.drawText('◄', x + w - 20, y + h / 2 + 3, '#F97300', 'bold 16px "Big Apple 3PM", monospace');
        }
        ctx.shadowBlur = 0;
    }
    drawTerminalDetails(renderer) {
        const ctx = renderer.getContext();
        const width = renderer.getWidth();
        const height = renderer.getHeight();
        const statusY = 100;
        const statusX = 70;
        for (let i = 0; i < 5; i++) {
            const lightX = statusX + i * 25;
            const isActive = Math.sin(this.animationTime * 2 + i) > 0.5;
            ctx.fillStyle = isActive ? '#6aaf9d' : '#201127';
            ctx.beginPath();
            ctx.arc(lightX, statusY, 4, 0, Math.PI * 2);
            ctx.fill();
            if (isActive) {
                ctx.shadowColor = '#6aaf9d';
                ctx.shadowBlur = 6;
                ctx.beginPath();
                ctx.arc(lightX, statusY, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }
        renderer.drawText('SYSTEM STATUS: ONLINE', 70, statusY + 25, '#94c5ac', '10px "Big Apple 3PM", monospace');
        renderer.drawText('GALAXY MAP: LOADED', 70, statusY + 40, '#94c5ac', '10px "Big Apple 3PM", monospace');
        renderer.drawText('NAVIGATION: READY', 70, statusY + 55, '#94c5ac', '10px "Big Apple 3PM", monospace');
    }
    handleInput(input) {
        const touchInput = input.getTouchMenuInput();
        const directMenuClick = this.checkDirectMenuClick(input);
        if (directMenuClick !== -1) {
            this.selectedOption = directMenuClick;
            this.handleMenuSelection();
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
    checkDirectMenuClick(input) {
        const game = window.game;
        if (!game || !game.renderer)
            return -1;
        const width = game.renderer.getWidth();
        const height = game.renderer.getHeight();
        const startY = height / 2 + 50;
        const spacing = 60;
        if (input.mouse.justPressed) {
            const clickX = input.mouse.x;
            const clickY = input.mouse.y;
            for (let i = 0; i < this.menuOptions.length; i++) {
                const menuY = startY + i * spacing;
                if (clickX >= width / 2 - 250 && clickX <= width / 2 + 250 &&
                    clickY >= menuY - 30 && clickY <= menuY + 30) {
                    return i;
                }
            }
        }
        let clickedIndex = -1;
        input.getJustEndedTouches().forEach((touch) => {
            const tapX = touch.x;
            const tapY = touch.y;
            for (let i = 0; i < this.menuOptions.length; i++) {
                const menuY = startY + i * spacing;
                if (tapX >= width / 2 - 250 && tapX <= width / 2 + 250 &&
                    tapY >= menuY - 30 && tapY <= menuY + 30) {
                    clickedIndex = i;
                    return;
                }
            }
        });
        return clickedIndex;
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
        this.launching = { active: false, start: 0, duration: 800 };
        this.lastNavigationClickTime = 0;
        this.navigationClickCooldown = 300;
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
        this.launching = { active: false, start: 0, duration: 800 };
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
        if (this.launching.active) {
            const now = performance.now();
            const elapsed = now - this.launching.start;
            if (elapsed >= this.launching.duration) {
                console.log('🚀 Launch sequence complete, calling startGame()');
                this.launching.active = false;
                this.startGame();
            }
        }
    }
    render(renderer) {
        const width = renderer.getWidth();
        const height = renderer.getHeight();
        const ctx = renderer.getContext();
        renderer.clear('#0a0a0a');
        const phosphorGradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) / 2);
        phosphorGradient.addColorStop(0, 'rgba(32, 20, 51, 0.15)');
        phosphorGradient.addColorStop(0.7, 'rgba(16, 12, 35, 0.08)');
        phosphorGradient.addColorStop(1, 'rgba(6, 11, 17, 0)');
        ctx.fillStyle = phosphorGradient;
        ctx.fillRect(0, 0, width, height);
        ctx.globalAlpha = 0.06;
        for (let y = 0; y < height; y += 3) {
            ctx.strokeStyle = '#424769';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, y + Math.sin(this.animations.starField * 0.1 + y * 0.01) * 2);
            ctx.lineTo(width, y + Math.sin(this.animations.starField * 0.1 + y * 0.01) * 2);
            ctx.stroke();
        }
        ctx.globalAlpha = 1.0;
        this.drawSetupTerminalFrame(renderer, 30, 60, width - 60, height - 120);
        const titleGlow = Math.sin(this.animations.buttonPulse) * 0.3 + 0.7;
        ctx.shadowColor = '#ffc27a';
        ctx.shadowBlur = 12 * titleGlow;
        renderer.drawText('MISSION SETUP TERMINAL', width / 2, 110, `rgba(255, 235, 153, ${titleGlow})`, 'bold 32px "Big Apple 3PM", monospace');
        ctx.shadowBlur = 6;
        renderer.drawText('GALACTIC CONFIGURATION SYSTEM', width / 2, 140, '#DCD7C9', '16px "Big Apple 3PM", monospace');
        ctx.shadowBlur = 0;
        const stepY = 180;
        const progressWidth = width * 0.85;
        const progressX = width * 0.075;
        this.drawProgressBarHousing(renderer, progressX - 10, stepY + 15, progressWidth + 20, 25);
        const progress = this.currentStep / (this.steps.length - 1);
        const fillWidth = progressWidth * progress;
        for (let i = 0; i < this.steps.length; i++) {
            const segmentX = progressX + (progressWidth / this.steps.length) * i;
            const segmentWidth = progressWidth / this.steps.length - 2;
            const isActive = i <= this.currentStep;
            this.drawProgressSegment(renderer, segmentX, stepY + 18, segmentWidth, 19, isActive, i === this.currentStep);
        }
        this.steps.forEach((step, index) => {
            const x = (width / this.steps.length) * (index + 0.5);
            const isActive = index === this.currentStep;
            const isCompleted = index < this.currentStep;
            const lightColor = isCompleted ? '#6aaf9d' : (isActive ? '#F97300' : '#201127');
            const lightSize = isActive ? 8 : 6;
            ctx.fillStyle = lightColor;
            ctx.beginPath();
            ctx.arc(x, stepY + 50, lightSize, 0, Math.PI * 2);
            ctx.fill();
            if (isActive || isCompleted) {
                ctx.shadowColor = lightColor;
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(x, stepY + 50, lightSize, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
            let color = '#524C42';
            let glowIntensity = 0;
            if (isCompleted) {
                color = '#94c5ac';
                glowIntensity = 0.4;
            }
            if (isActive) {
                color = '#ffeb99';
                glowIntensity = Math.sin(this.animations.buttonPulse) * 0.4 + 0.6;
            }
            if (glowIntensity > 0) {
                ctx.shadowColor = color;
                ctx.shadowBlur = 10 * glowIntensity;
            }
            renderer.drawText(`${index + 1}`, x, stepY + 52, color, isActive ? 'bold 14px "Big Apple 3PM", monospace' : '12px "Big Apple 3PM", monospace');
            renderer.drawText(step, x, stepY + 70, color, isActive ? 'bold 12px "Big Apple 3PM", monospace' : '10px "Big Apple 3PM", monospace');
            ctx.shadowBlur = 0;
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
            default:
                console.warn(`Unknown step: ${this.currentStep}`);
                break;
        }
        this.renderNavigationButtons(renderer, width, height);
        this.renderTooltip(renderer);
        if (this.launching.active) {
            ctx.save();
            ctx.globalAlpha = 0.85;
            renderer.drawRect(0, 0, width, height, 'rgba(0,0,0,0.85)');
            ctx.globalAlpha = 1;
            const elapsed = performance.now() - this.launching.start;
            const progress = Math.min(1, elapsed / this.launching.duration);
            const barW = Math.floor(width * 0.4);
            const barH = 12;
            const barX = Math.floor((width - barW) / 2);
            const barY = Math.floor(height * 0.65);
            renderer.drawRect(barX - 2, barY - 2, barW + 4, barH + 4, '#221100');
            renderer.strokeRect(barX - 2, barY - 2, barW + 4, barH + 4, '#664400', 2);
            renderer.drawRect(barX, barY, Math.max(2, Math.floor(barW * progress)), barH, '#F97300');
            renderer.drawText('INITIATING LAUNCH SEQUENCE…', width / 2, barY - 16, '#E2DFD0', 'bold 16px "Big Apple 3PM", monospace');
            renderer.drawText('CALIBRATING SYSTEMS • PRESSURIZING • IGNITION', width / 2, barY + 28, '#A27B5C', '10px "Big Apple 3PM", monospace');
            ctx.restore();
        }
    }
    drawSetupTerminalFrame(renderer, x, y, w, h) {
        const ctx = renderer.getContext();
        ctx.strokeStyle = '#443300';
        ctx.lineWidth = 4;
        ctx.strokeRect(x, y, w, h);
        ctx.strokeStyle = '#cc8800';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 8, y + 8, w - 16, h - 16);
        const rivetSize = 6;
        const rivetPositions = [
            [x + 15, y + 15], [x + w - 15, y + 15],
            [x + 15, y + h - 15], [x + w - 15, y + h - 15]
        ];
        rivetPositions.forEach(([rx, ry]) => {
            ctx.fillStyle = '#666600';
            ctx.beginPath();
            ctx.arc(rx, ry, rivetSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#aa8800';
            ctx.beginPath();
            ctx.arc(rx - 1, ry - 1, rivetSize - 2, 0, Math.PI * 2);
            ctx.fill();
        });
        for (let i = 0; i < 8; i++) {
            const slotX = x + 80 + i * 40;
            ctx.strokeStyle = '#664400';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(slotX, y + 20);
            ctx.lineTo(slotX + 25, y + 20);
            ctx.stroke();
        }
    }
    drawProgressBarHousing(renderer, x, y, w, h) {
        const ctx = renderer.getContext();
        ctx.fillStyle = '#221100';
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = '#664400';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);
        ctx.strokeStyle = '#443300';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);
    }
    drawProgressSegment(renderer, x, y, w, h, isActive, isCurrent) {
        const ctx = renderer.getContext();
        if (isActive) {
            const color = isCurrent ? '#F97300' : '#6aaf9d';
            const pulseIntensity = isCurrent ? Math.sin(this.animations.buttonPulse * 2) * 0.3 + 0.7 : 1.0;
            ctx.fillStyle = `rgba(${isCurrent ? '249, 115, 0' : '106, 175, 157'}, ${0.6 * pulseIntensity})`;
            ctx.fillRect(x, y, w, h);
            if (isCurrent) {
                ctx.shadowColor = color;
                ctx.shadowBlur = 6;
                ctx.fillRect(x, y, w, h);
                ctx.shadowBlur = 0;
            }
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, w, h);
        }
        else {
            ctx.fillStyle = '#201127';
            ctx.fillRect(x, y, w, h);
            ctx.strokeStyle = '#424769';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, w, h);
        }
    }
    renderNavigationButtons(renderer, width, height) {
        const ctx = renderer.getContext();
        this.backButton.x = 60;
        this.backButton.y = height - 90;
        this.backButton.width = 140;
        this.backButton.height = 45;
        this.nextButton.x = width - 200;
        this.nextButton.y = height - 90;
        this.nextButton.width = 140;
        this.nextButton.height = 45;
        if (this.currentStep > 0) {
            this.drawRetroNavButton(renderer, this.backButton.x, this.backButton.y, this.backButton.width, this.backButton.height, this.backButton.pressed, this.backButton.hovered, '← BACK');
        }
        const isLastStep = this.currentStep === this.steps.length - 1;
        const canProceed = this.canProceedFromCurrentStep();
        const nextText = isLastStep ? 'START MISSION' : 'CONTINUE →';
        if (canProceed) {
            this.drawRetroNavButton(renderer, this.nextButton.x, this.nextButton.y, this.nextButton.width, this.nextButton.height, this.nextButton.pressed, this.nextButton.hovered, nextText);
        }
        ctx.shadowColor = '#355d68';
        ctx.shadowBlur = 3;
        renderer.drawText('USE ARROW KEYS OR CLICK TO NAVIGATE', width / 2, height - 35, '#6aaf9d', 'bold 12px "Big Apple 3PM", monospace');
        ctx.shadowBlur = 0;
    }
    drawRetroNavButton(renderer, x, y, w, h, pressed, hovered, text) {
        const ctx = renderer.getContext();
        const offset = pressed ? 2 : 0;
        ctx.fillStyle = '#221100';
        ctx.fillRect(x + offset, y + offset, w, h);
        ctx.fillStyle = pressed ? '#332200' : (hovered ? '#443300' : '#332200');
        ctx.fillRect(x + offset + 2, y + offset + 2, w - 4, h - 4);
        ctx.strokeStyle = hovered ? '#F6B17A' : '#3F4F44';
        ctx.lineWidth = pressed ? 1 : 2;
        ctx.strokeRect(x + offset + 1, y + offset + 1, w - 2, h - 2);
        if (!pressed) {
            ctx.strokeStyle = '#A27B5C';
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 4, y + 4, w - 8, h - 8);
        }
        const textColor = hovered ? '#ffeb99' : '#E2DFD0';
        if (hovered) {
            ctx.shadowColor = '#F6B17A';
            ctx.shadowBlur = 6;
        }
        renderer.drawText(text, x + w / 2, y + h / 2 + 3, textColor, pressed ? '13px "Big Apple 3PM", monospace' : 'bold 14px "Big Apple 3PM", monospace');
        if (hovered) {
            ctx.shadowBlur = 0;
        }
        const cornerSize = 6;
        ctx.fillStyle = '#404040';
        ctx.fillRect(x + offset, y + offset, cornerSize, cornerSize);
        ctx.fillRect(x + offset + w - cornerSize, y + offset, cornerSize, cornerSize);
        ctx.fillRect(x + offset, y + offset + h - cornerSize, cornerSize, cornerSize);
        ctx.fillRect(x + offset + w - cornerSize, y + offset + h - cornerSize, cornerSize, cornerSize);
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
        const height = renderer.getHeight();
        const ctx = renderer.getContext();
        const startY = 280;
        ctx.shadowColor = '#ec9a6d';
        ctx.shadowBlur = 8;
        renderer.drawText('DIFFICULTY CONFIGURATION', width / 2, startY, '#ffeb99', 'bold 22px "Big Apple 3PM", monospace');
        ctx.shadowBlur = 0;
        renderer.drawText('SELECT MISSION PARAMETERS', width / 2, startY + 25, '#DCD7C9', '14px "Big Apple 3PM", monospace');
        this.difficultyButtons = [];
        const panelMargin = Math.max(50, (width - 1000) / 2);
        const panelX = panelMargin;
        const panelY = startY + 50;
        const panelW = width - (panelMargin * 2);
        const panelH = 400;
        this.drawSelectionPanel(renderer, panelX, panelY, panelW, panelH, 'DIFFICULTY MATRIX');
        Object.values(DifficultyLevel).forEach((difficulty, index) => {
            const settings = DIFFICULTY_SETTINGS[difficulty];
            const y = startY + 100 + index * 85;
            const isSelected = difficulty === this.selectedDifficulty;
            const buttonArea = {
                x: panelX + 20,
                y: y - 35,
                width: panelW - 40,
                height: 70,
                difficulty: difficulty,
                hovered: false
            };
            this.difficultyButtons.push(buttonArea);
            this.drawDifficultyOption(renderer, buttonArea.x, buttonArea.y, buttonArea.width, buttonArea.height, isSelected, buttonArea.hovered, settings, index);
        });
        if (this.selectedDifficulty) {
            const detailPanelW = Math.min(300, width - panelX - panelW - 40);
            const detailPanelX = Math.min(width - detailPanelW - 20, panelX + panelW + 20);
            this.drawDifficultyDetailsPanel(renderer, detailPanelX, startY + 50, detailPanelW, 350);
        }
    }
    drawSelectionPanel(renderer, x, y, w, h, title) {
        const ctx = renderer.getContext();
        ctx.fillStyle = 'rgba(32, 20, 51, 0.8)';
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = '#3F4F44';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);
        ctx.strokeStyle = '#7077A1';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 5, y + 5, w - 10, h - 10);
        ctx.fillStyle = '#201127';
        ctx.fillRect(x + 1, y + 1, w - 2, 25);
        ctx.strokeStyle = '#A27B5C';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 1, y + 1, w - 2, 25);
        renderer.drawText(title, x + w / 2, y + 18, '#DCD7C9', 'bold 12px "Big Apple 3PM", monospace');
        const bracketSize = 15;
        ctx.strokeStyle = '#F6B17A';
        ctx.lineWidth = 2;
        [
            [x, y], [x + w, y], [x, y + h], [x + w, y + h]
        ].forEach(([cornerX, cornerY], i) => {
            const isLeft = i % 2 === 0;
            const isTop = i < 2;
            ctx.beginPath();
            if (isLeft && isTop) {
                ctx.moveTo(cornerX + bracketSize, cornerY);
                ctx.lineTo(cornerX, cornerY);
                ctx.lineTo(cornerX, cornerY + bracketSize);
            }
            else if (!isLeft && isTop) {
                ctx.moveTo(cornerX - bracketSize, cornerY);
                ctx.lineTo(cornerX, cornerY);
                ctx.lineTo(cornerX, cornerY + bracketSize);
            }
            else if (isLeft && !isTop) {
                ctx.moveTo(cornerX, cornerY - bracketSize);
                ctx.lineTo(cornerX, cornerY);
                ctx.lineTo(cornerX + bracketSize, cornerY);
            }
            else {
                ctx.moveTo(cornerX, cornerY - bracketSize);
                ctx.lineTo(cornerX, cornerY);
                ctx.lineTo(cornerX - bracketSize, cornerY);
            }
            ctx.stroke();
        });
    }
    drawDifficultyOption(renderer, x, y, w, h, selected, hovered, settings, index) {
        const ctx = renderer.getContext();
        const offset = selected ? 0 : 2;
        const difficultyColors = ['#6aaf9d', '#F6B17A', '#F97300', '#d9626b', '#c24b6e'];
        const baseColor = difficultyColors[index] || '#F97300';
        ctx.fillStyle = '#201127';
        ctx.fillRect(x + offset, y + offset, w, h);
        ctx.fillStyle = selected ? 'rgba(32, 17, 39, 0.9)' : 'rgba(16, 18, 46, 0.7)';
        ctx.fillRect(x + offset + 2, y + offset + 2, w - 4, h - 4);
        ctx.strokeStyle = selected ? baseColor : (hovered ? '#7077A1' : '#3F4F44');
        ctx.lineWidth = selected ? 3 : (hovered ? 2 : 1);
        ctx.strokeRect(x + offset + 1, y + offset + 1, w - 2, h - 2);
        if (selected) {
            const pulseAlpha = Math.sin(this.animations.buttonPulse * 3) * 0.3 + 0.7;
            ctx.shadowColor = baseColor;
            ctx.shadowBlur = 12 * pulseAlpha;
            ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
            ctx.shadowBlur = 0;
        }
        const barWidth = 120;
        const barHeight = 8;
        const barX = x + 20;
        const barY = y + h - 18;
        ctx.fillStyle = '#201127';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        const fillWidth = barWidth * ((index + 1) / 5);
        ctx.fillStyle = baseColor;
        ctx.fillRect(barX, barY, fillWidth, barHeight);
        ctx.strokeStyle = '#524C42';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
        const textColor = selected ? baseColor : (hovered ? '#E2DFD0' : '#A27B5C');
        const nameSize = selected ? 'bold 18px' : '16px';
        const descSize = selected ? '13px' : '12px';
        if (selected || hovered) {
            ctx.shadowColor = textColor;
            ctx.shadowBlur = 5;
        }
        renderer.drawText(settings.name, x + 20, y + 22, textColor, `${nameSize} "Big Apple 3PM", monospace`);
        renderer.drawText(settings.description, x + 20, y + 45, textColor, `${descSize} "Big Apple 3PM", monospace`);
        renderer.drawText(`LEVEL ${index + 1}`, x + w - 80, y + 25, textColor, 'bold 12px "Big Apple 3PM", monospace');
        ctx.shadowBlur = 0;
        if (selected) {
            renderer.drawText('►', x + w - 30, y + h / 2 + 3, baseColor, 'bold 20px "Big Apple 3PM", monospace');
        }
    }
    drawDifficultyDetailsPanel(renderer, x, y, w, h) {
        const ctx = renderer.getContext();
        const settings = DIFFICULTY_SETTINGS[this.selectedDifficulty];
        this.drawSelectionPanel(renderer, x, y, w, h, 'MISSION BRIEFING');
        const textY = y + 50;
        const lineHeight = 20;
        let currentY = textY;
        renderer.drawText('PARAMETERS:', x + 20, currentY, '#ffaa00', 'bold 14px "Big Apple 3PM", monospace');
        currentY += lineHeight * 1.5;
        renderer.drawText(`Resources: ${settings.multipliers.resourceMultiplier}x`, x + 20, currentY, '#ff8800', '12px "Big Apple 3PM", monospace');
        currentY += lineHeight;
        renderer.drawText(`Enemy Strength: ${settings.multipliers.damageMultiplier}x`, x + 20, currentY, '#ff8800', '12px "Big Apple 3PM", monospace');
        currentY += lineHeight;
        renderer.drawText(`Fuel Consumption: ${settings.multipliers.fuelConsumption}x`, x + 20, currentY, '#ff8800', '12px "Big Apple 3PM", monospace');
        currentY += lineHeight;
        renderer.drawText(`XP Rate: ${settings.multipliers.experienceMultiplier}x`, x + 20, currentY, '#ff8800', '12px "Big Apple 3PM", monospace');
        currentY += lineHeight * 2;
        renderer.drawText('MISSION BRIEF:', x + 20, currentY, '#ffaa00', 'bold 14px "Big Apple 3PM", monospace');
        currentY += lineHeight * 1.5;
        const words = settings.description.split(' ');
        let line = '';
        for (const word of words) {
            const testLine = line + (line ? ' ' : '') + word;
            if (testLine.length > 25) {
                renderer.drawText(line, x + 20, currentY, '#aa8800', '11px "Big Apple 3PM", monospace');
                currentY += lineHeight;
                line = word;
            }
            else {
                line = testLine;
            }
        }
        if (line) {
            renderer.drawText(line, x + 20, currentY, '#aa8800', '11px "Big Apple 3PM", monospace');
        }
    }
    renderGalaxySettings(renderer) {
        const width = renderer.getWidth();
        const height = renderer.getHeight();
        const startY = 280;
        const ctx = renderer.getContext();
        ctx.shadowColor = '#3a6d75';
        ctx.shadowBlur = 8;
        renderer.drawText('GALAXY CONFIGURATION', width / 2, startY, '#6aaf9d', 'bold 22px "Big Apple 3PM", monospace');
        ctx.shadowBlur = 0;
        const leftPanelX = 50;
        const leftPanelY = startY + 50;
        const leftPanelW = (width - 160) / 2;
        const leftPanelH = height - startY - 170;
        const rightPanelX = leftPanelX + leftPanelW + 60;
        const rightPanelY = startY + 50;
        const rightPanelW = leftPanelW;
        const rightPanelH = leftPanelH;
        this.drawSelectionPanel(renderer, leftPanelX, leftPanelY, leftPanelW, leftPanelH, 'GALAXY SIZE');
        this.drawSelectionPanel(renderer, rightPanelX, rightPanelY, rightPanelW, rightPanelH, 'GALAXY DENSITY');
        this.galaxySizeButtons = [];
        Object.values(GalaxySize).forEach((size, index) => {
            const data = GALAXY_SIZE_DATA[size];
            const y = leftPanelY + 60 + index * 60;
            const isSelected = size === this.galaxySettings.size;
            const buttonArea = {
                x: leftPanelX + 20,
                y: y - 20,
                width: leftPanelW - 40,
                height: 50,
                size: size,
                hovered: false
            };
            this.galaxySizeButtons.push(buttonArea);
            this.drawGalaxyOptionButton(renderer, buttonArea.x, buttonArea.y, buttonArea.width, buttonArea.height, isSelected, buttonArea.hovered, data.name, data.description);
        });
        this.galaxyDensityButtons = [];
        Object.values(GalaxyDensity).forEach((density, index) => {
            const data = GALAXY_DENSITY_DATA[density];
            const y = rightPanelY + 60 + index * 60;
            const isSelected = density === this.galaxySettings.density;
            const buttonArea = {
                x: rightPanelX + 20,
                y: y - 20,
                width: rightPanelW - 40,
                height: 50,
                density: density,
                hovered: false
            };
            this.galaxyDensityButtons.push(buttonArea);
            this.drawGalaxyOptionButton(renderer, buttonArea.x, buttonArea.y, buttonArea.width, buttonArea.height, isSelected, buttonArea.hovered, data.name, data.description);
        });
        const infoY = leftPanelY + leftPanelH - 40;
        renderer.drawText(`Factions: ${this.galaxySettings.factionCount} | Hostility Level: ${this.galaxySettings.hostilityLevel}/10`, width / 2, infoY, '#A27B5C', '12px "Big Apple 3PM", monospace');
    }
    renderEconomySettings(renderer) {
        const width = renderer.getWidth();
        const height = renderer.getHeight();
        const startY = 280;
        const ctx = renderer.getContext();
        ctx.shadowColor = '#d4782d';
        ctx.shadowBlur = 8;
        renderer.drawText('ECONOMIC PARAMETERS', width / 2, startY, '#F6B17A', 'bold 22px "Big Apple 3PM", monospace');
        ctx.shadowBlur = 0;
        const panelX = 50;
        const panelY = startY + 50;
        const panelW = width - 100;
        const panelH = height - startY - 170;
        this.drawSelectionPanel(renderer, panelX, panelY, panelW, panelH, 'ECONOMIC COMPLEXITY');
        this.economyButtons = [];
        Object.values(EconomyComplexity).forEach((complexity, index) => {
            const data = ECONOMY_COMPLEXITY_DATA[complexity];
            const y = panelY + 60 + index * 80;
            const isSelected = complexity === this.economySettings.complexity;
            const buttonArea = {
                x: panelX + 30,
                y: y - 30,
                width: panelW - 60,
                height: 65,
                complexity: complexity,
                hovered: false
            };
            this.economyButtons.push(buttonArea);
            this.drawEconomyOptionButton(renderer, buttonArea.x, buttonArea.y, buttonArea.width, buttonArea.height, isSelected, buttonArea.hovered, data.name, data.description);
        });
        const infoY = panelY + panelH - 40;
        renderer.drawText(`Market Volatility: ${this.economySettings.marketVolatility}/10 | Trade Routes: ${this.economySettings.tradeRouteFrequency}/10 | Pirate Activity: ${this.economySettings.pirateActivity}/10`, width / 2, infoY, '#A27B5C', '12px "Big Apple 3PM", monospace');
    }
    renderCharacterCreation(renderer) {
        const width = renderer.getWidth();
        const height = renderer.getHeight();
        const ctx = renderer.getContext();
        const startY = 280;
        ctx.shadowColor = '#a73169';
        ctx.shadowBlur = 8;
        renderer.drawText('PERSONNEL FILE CREATION', width / 2, startY, '#ffc27a', 'bold 22px "Big Apple 3PM", monospace');
        ctx.shadowBlur = 0;
        renderer.drawText('COMMANDER PROFILE CONFIGURATION', width / 2, startY + 25, '#E2DFD0', '14px "Big Apple 3PM", monospace');
        const leftPanelX = 60;
        const leftPanelY = startY + 50;
        const leftPanelW = width / 2 - 80;
        const leftPanelH = height - startY - 150;
        const rightPanelX = width / 2 + 20;
        const rightPanelY = startY + 50;
        const rightPanelW = width / 2 - 80;
        const rightPanelH = height - startY - 150;
        this.drawSelectionPanel(renderer, leftPanelX, leftPanelY, leftPanelW, leftPanelH, 'PERSONAL DATA');
        this.drawSelectionPanel(renderer, rightPanelX, rightPanelY, rightPanelW, rightPanelH, 'SPECIES & BACKGROUND');
        let leftY = leftPanelY + 50;
        renderer.drawText('DESIGNATION:', leftPanelX + 20, leftY, '#DCD7C9', 'bold 14px "Big Apple 3PM", monospace');
        leftY += 30;
        this.drawInputTerminal(renderer, leftPanelX + 20, leftY, leftPanelW - 40, 35, this.character.name || 'ENTER_CALLSIGN', this.isEditingName, this.nameInputButton);
        leftY += 50;
        this.drawSmallRetroButton(renderer, leftPanelX + 20, leftY, 80, 25, this.randomNameButton.hovered, false, 'RANDOM');
        this.randomNameButton.x = leftPanelX + 20;
        this.randomNameButton.y = leftY;
        this.randomNameButton.width = 80;
        this.randomNameButton.height = 25;
        this.drawSmallRetroButton(renderer, leftPanelX + 110, leftY, 80, 25, this.skipNameButton.hovered, false, 'SKIP');
        this.skipNameButton.x = leftPanelX + 110;
        this.skipNameButton.y = leftY;
        this.skipNameButton.width = 80;
        this.skipNameButton.height = 25;
        leftY += 50;
        renderer.drawText('AGE:', leftPanelX + 20, leftY, '#DCD7C9', 'bold 14px "Big Apple 3PM", monospace');
        leftY += 30;
        this.drawInputTerminal(renderer, leftPanelX + 20, leftY, 100, 35, this.character.age.toString(), false, this.ageInputButton);
        leftY += 60;
        renderer.drawText('GENDER:', leftPanelX + 20, leftY, '#DCD7C9', 'bold 14px "Big Apple 3PM", monospace');
        leftY += 30;
        this.genderButtons = [];
        const genderNames = ['MALE', 'FEMALE', 'NON-BINARY', 'OTHER'];
        Object.values(CharacterGender).forEach((gender, index) => {
            const isSelected = gender === this.character.gender;
            const row = Math.floor(index / 2);
            const col = index % 2;
            const buttonX = leftPanelX + 20 + col * 140;
            const buttonY = leftY + row * 35;
            const buttonArea = {
                x: buttonX,
                y: buttonY,
                width: 130,
                height: 30,
                gender: gender,
                hovered: false
            };
            this.genderButtons.push(buttonArea);
            this.drawSmallRetroButton(renderer, buttonX, buttonY, 130, 30, buttonArea.hovered, isSelected, genderNames[index]);
        });
        let rightY = rightPanelY + 50;
        renderer.drawText('SPECIES:', rightPanelX + 20, rightY, '#DCD7C9', 'bold 14px "Big Apple 3PM", monospace');
        rightY += 40;
        this.raceButtons = [];
        const raceKeys = Object.keys(RACE_DATA);
        const racesPerRow = 2;
        const availableRaceWidth = rightPanelW - 40;
        const raceButtonWidth = Math.min(150, (availableRaceWidth - 20) / racesPerRow);
        const raceSpacing = availableRaceWidth / racesPerRow;
        raceKeys.forEach((race, index) => {
            const data = RACE_DATA[race];
            const row = Math.floor(index / racesPerRow);
            const col = index % racesPerRow;
            const buttonX = rightPanelX + 20 + col * raceSpacing;
            const buttonY = rightY + row * 70;
            const isSelected = race === this.character.race;
            const buttonArea = {
                x: buttonX,
                y: buttonY,
                width: raceButtonWidth,
                height: 60,
                race: race,
                hovered: false
            };
            this.raceButtons.push(buttonArea);
            this.drawSpeciesOption(renderer, buttonX, buttonY, raceButtonWidth, 60, isSelected, buttonArea.hovered, data);
        });
        rightY += Math.ceil(raceKeys.length / racesPerRow) * 70 + 30;
        renderer.drawText('BACKGROUND:', rightPanelX + 20, rightY, '#DCD7C9', 'bold 14px "Big Apple 3PM", monospace');
        rightY += 40;
        this.backgroundButtons = [];
        const backgroundKeys = Object.keys(BACKGROUND_DATA);
        const backgroundsPerRow = 2;
        const availableBackgroundWidth = rightPanelW - 40;
        const backgroundButtonWidth = Math.min(150, (availableBackgroundWidth - 20) / backgroundsPerRow);
        const backgroundSpacing = availableBackgroundWidth / backgroundsPerRow;
        backgroundKeys.forEach((background, index) => {
            const data = BACKGROUND_DATA[background];
            const row = Math.floor(index / backgroundsPerRow);
            const col = index % backgroundsPerRow;
            const buttonX = rightPanelX + 20 + col * backgroundSpacing;
            const buttonY = rightY + row * 50;
            const isSelected = background === this.character.background;
            const buttonArea = {
                x: buttonX,
                y: buttonY,
                width: backgroundButtonWidth,
                height: 40,
                background: background,
                hovered: false
            };
            this.backgroundButtons.push(buttonArea);
            this.drawBackgroundOption(renderer, buttonX, buttonY, backgroundButtonWidth, 40, isSelected, buttonArea.hovered, data);
        });
    }
    drawInputTerminal(renderer, x, y, w, h, text, editing, buttonArea) {
        const ctx = renderer.getContext();
        buttonArea.x = x;
        buttonArea.y = y;
        buttonArea.width = w;
        buttonArea.height = h;
        ctx.fillStyle = '#201127';
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = editing ? '#F97300' : (buttonArea.hovered ? '#7077A1' : '#3F4F44');
        ctx.lineWidth = editing ? 2 : 1;
        ctx.strokeRect(x, y, w, h);
        ctx.strokeStyle = '#424769';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);
        const textColor = text.includes('ENTER_') ? '#A27B5C' : '#E2DFD0';
        renderer.drawText(text, x + 10, y + h / 2 + 4, textColor, '12px "Big Apple 3PM", monospace');
        if (editing && Math.floor(Date.now() / 500) % 2 === 0) {
            const cursorX = x + 10 + (text.length * 7);
            renderer.drawText('█', cursorX, y + h / 2 + 4, '#ffc27a', '12px "Big Apple 3PM", monospace');
        }
        if (editing) {
            ctx.globalAlpha = 0.2;
            const scanY = y + (Date.now() % 1000) / 1000 * h;
            ctx.strokeStyle = '#F97300';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, scanY);
            ctx.lineTo(x + w, scanY);
            ctx.stroke();
            ctx.globalAlpha = 1.0;
        }
    }
    drawSmallRetroButton(renderer, x, y, w, h, hovered, selected, text) {
        const ctx = renderer.getContext();
        const offset = selected ? 0 : 1;
        ctx.fillStyle = '#201127';
        ctx.fillRect(x + offset, y + offset, w, h);
        ctx.fillStyle = selected ? '#424769' : (hovered ? '#355d68' : '#1b1e34');
        ctx.fillRect(x + offset + 1, y + offset + 1, w - 2, h - 2);
        const frameColor = selected ? '#F97300' : (hovered ? '#7077A1' : '#3F4F44');
        ctx.strokeStyle = frameColor;
        ctx.lineWidth = selected ? 2 : 1;
        ctx.strokeRect(x + offset, y + offset, w, h);
        const textColor = selected ? '#ffc27a' : (hovered ? '#E2DFD0' : '#A27B5C');
        renderer.drawText(text, x + w / 2, y + h / 2 + 3, textColor, selected ? 'bold 10px "Big Apple 3PM", monospace' : '10px "Big Apple 3PM", monospace');
    }
    drawSpeciesOption(renderer, x, y, w, h, selected, hovered, data) {
        const ctx = renderer.getContext();
        const offset = selected ? 0 : 2;
        ctx.fillStyle = '#201127';
        ctx.fillRect(x + offset, y + offset, w, h);
        ctx.fillStyle = selected ? 'rgba(66, 71, 105, 0.9)' : 'rgba(27, 30, 52, 0.7)';
        ctx.fillRect(x + offset + 2, y + offset + 2, w - 4, h - 4);
        ctx.strokeStyle = selected ? '#6aaf9d' : (hovered ? '#7077A1' : '#3F4F44');
        ctx.lineWidth = selected ? 3 : (hovered ? 2 : 1);
        ctx.strokeRect(x + offset + 1, y + offset + 1, w - 2, h - 2);
        const portraitX = x + 10;
        const portraitY = y + 8;
        const portraitSize = 30;
        ctx.fillStyle = data.portraitColor || '#A27B5C';
        ctx.fillRect(portraitX, portraitY, portraitSize, portraitSize);
        ctx.strokeStyle = '#524C42';
        ctx.lineWidth = 1;
        ctx.strokeRect(portraitX, portraitY, portraitSize, portraitSize);
        const textColor = selected ? '#ffc27a' : (hovered ? '#E2DFD0' : '#A27B5C');
        renderer.drawText(data.name, x + 50, y + 20, textColor, selected ? 'bold 12px "Big Apple 3PM", monospace' : '11px "Big Apple 3PM", monospace');
        renderer.drawText(`${data.bonuses?.length || 0} TRAITS`, x + 50, y + 35, textColor, '8px "Big Apple 3PM", monospace');
        if (selected) {
            ctx.shadowColor = '#6aaf9d';
            ctx.shadowBlur = 6;
            renderer.drawText('✓', x + w - 20, y + h / 2 + 3, '#6aaf9d', 'bold 16px "Big Apple 3PM", monospace');
            ctx.shadowBlur = 0;
        }
    }
    drawBackgroundOption(renderer, x, y, w, h, selected, hovered, data) {
        const ctx = renderer.getContext();
        const offset = selected ? 0 : 2;
        ctx.fillStyle = '#201127';
        ctx.fillRect(x + offset, y + offset, w, h);
        ctx.fillStyle = selected ? 'rgba(66, 71, 105, 0.9)' : 'rgba(27, 30, 52, 0.7)';
        ctx.fillRect(x + offset + 2, y + offset + 2, w - 4, h - 4);
        ctx.strokeStyle = selected ? '#c24b6e' : (hovered ? '#7077A1' : '#3F4F44');
        ctx.lineWidth = selected ? 3 : (hovered ? 2 : 1);
        ctx.strokeRect(x + offset + 1, y + offset + 1, w - 2, h - 2);
        const textColor = selected ? '#ffeb99' : (hovered ? '#E2DFD0' : '#A27B5C');
        renderer.drawText(data.name, x + 10, y + h / 2 - 5, textColor, selected ? 'bold 12px "Big Apple 3PM", monospace' : '11px "Big Apple 3PM", monospace');
        const skillCount = data.skillBonuses ? Object.keys(data.skillBonuses).length : 0;
        renderer.drawText(`+${skillCount} SKILLS`, x + 10, y + h / 2 + 10, textColor, '8px "Big Apple 3PM", monospace');
        if (selected) {
            ctx.shadowColor = '#c24b6e';
            ctx.shadowBlur = 6;
            renderer.drawText('►', x + w - 20, y + h / 2 + 3, '#c24b6e', 'bold 14px "Big Apple 3PM", monospace');
            ctx.shadowBlur = 0;
        }
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
            const skillPanelWidth = Math.min(600, width - 100);
            const skillSpacing = skillPanelWidth / skillsPerRow;
            const x = (width / 2) - (skillPanelWidth / 2) + (col * skillSpacing) + (skillSpacing / 2);
            const y = startY + 80 + row * 60;
            const currentLevel = this.character.skills.get(skill) || 1;
            const skillNameX = Math.max(20, x - 180);
            renderer.drawText(`${data.icon} ${data.name}:`, skillNameX, y, '#606060', '16px "Big Apple 3PM", monospace');
            const levelStartX = Math.max(skillNameX + 120, x - 100);
            for (let level = 1; level <= 10; level++) {
                const buttonX = levelStartX + (level - 1) * 25;
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
            const levelDisplayX = Math.min(width - 120, levelStartX + 260);
            renderer.drawText(`Úroveň: ${currentLevel}`, levelDisplayX, y, '#dcd0c0', '14px "Big Apple 3PM", monospace');
        });
        renderer.drawText('Klepněte na čísla pro změnu úrovně dovedností', width / 2, startY + 380, '#505050', '12px "Big Apple 3PM", monospace');
    }
    renderShipSelection(renderer) {
        const width = renderer.getWidth();
        const height = renderer.getHeight();
        const ctx = renderer.getContext();
        const startY = 280;
        ctx.shadowColor = '#8d402f';
        ctx.shadowBlur = 8;
        renderer.drawText('FLEET CONFIGURATION', width / 2, startY, '#e3b47a', 'bold 22px "Big Apple 3PM", monospace');
        ctx.shadowBlur = 0;
        renderer.drawText('SELECT STARSHIP CLASS', width / 2, startY + 25, '#DCD7C9', '14px "Big Apple 3PM", monospace');
        const ships = Object.values(ShipType);
        const shipsPerRow = 2;
        const detailsPanelWidth = 320;
        const panelX = 40;
        const panelY = startY + 50;
        const panelW = width - 80 - detailsPanelWidth - 30;
        const panelH = height - startY - 150;
        const availableCardWidth = (panelW - 60 - 20) / shipsPerRow;
        const shipWidth = Math.min(350, availableCardWidth);
        const shipHeight = Math.min(140, shipWidth * 0.4);
        this.drawSelectionPanel(renderer, panelX, panelY, panelW, panelH, 'STARSHIP REGISTRY');
        this.shipButtons = [];
        ships.forEach((shipType, index) => {
            const template = SHIP_TEMPLATES[shipType];
            const row = Math.floor(index / shipsPerRow);
            const col = index % shipsPerRow;
            const x = panelX + 30 + col * (shipWidth + 20);
            const y = panelY + 60 + row * (shipHeight + 20);
            const isSelected = shipType === this.selectedShip;
            const buttonArea = {
                x: x,
                y: y,
                width: shipWidth,
                height: shipHeight,
                shipType: shipType,
                hovered: false
            };
            this.shipButtons.push(buttonArea);
            this.drawShipCard(renderer, x, y, shipWidth, shipHeight, isSelected, buttonArea.hovered, template, index);
        });
        if (this.selectedShip) {
            const detailsX = width - detailsPanelWidth - 40;
            this.drawShipDetailsPanel(renderer, detailsX, panelY + 60, detailsPanelWidth, panelH - 120);
        }
    }
    drawShipCard(renderer, x, y, w, h, selected, hovered, template, index) {
        const ctx = renderer.getContext();
        const offset = selected ? 0 : 3;
        const shipColors = ['#be794f', '#F6B17A', '#6aaf9d', '#7077A1', '#d9626b'];
        const shipColor = shipColors[index] || '#be794f';
        ctx.fillStyle = '#201127';
        ctx.fillRect(x + offset, y + offset, w, h);
        ctx.fillStyle = selected ? 'rgba(66, 71, 105, 0.9)' : 'rgba(27, 30, 52, 0.7)';
        ctx.fillRect(x + offset + 3, y + offset + 3, w - 6, h - 6);
        ctx.strokeStyle = selected ? shipColor : (hovered ? '#808080' : '#404040');
        ctx.lineWidth = selected ? 4 : (hovered ? 3 : 2);
        ctx.strokeRect(x + offset + 1, y + offset + 1, w - 2, h - 2);
        ctx.strokeStyle = selected ? '#707070' : '#303030';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + offset + 8, y + offset + 8, w - 16, h - 16);
        const silhouetteX = x + 20;
        const silhouetteY = y + 20;
        const silhouetteW = 120;
        const silhouetteH = 80;
        this.drawShipSilhouette(renderer, silhouetteX, silhouetteY, silhouetteW, silhouetteH, template, shipColor, selected);
        const infoX = x + 140;
        const infoY = y + 20;
        const textColor = selected ? shipColor : (hovered ? '#a0a0a0' : '#707070');
        const titleSize = selected ? 'bold 14px' : '12px';
        if (selected || hovered) {
            ctx.shadowColor = textColor;
            ctx.shadowBlur = selected ? 6 : 4;
        }
        renderer.drawText(template.name, infoX, infoY, textColor, `${titleSize} "Big Apple 3PM", monospace`);
        ctx.shadowBlur = 0;
        renderer.drawText(`CLASS: ${template.type || 'MULTI-ROLE'}`, infoX, infoY + 20, textColor, '10px "Big Apple 3PM", monospace');
        const statY = infoY + 40;
        const statHeight = 10;
        const statSpacing = 16;
        const stats = [
            { name: 'HULL', value: template.baseStats.hull, max: 1000, color: '#909090' },
            { name: 'SHIELDS', value: template.baseStats.shields, max: 1000, color: '#808080' },
            { name: 'SPEED', value: template.baseStats.speed, max: 100, color: '#a0a0a0' },
            { name: 'CARGO', value: template.baseStats.cargo, max: 500, color: '#707070' }
        ];
        stats.forEach((stat, i) => {
            const barY = statY + i * statSpacing;
            const barW = 120;
            const barFill = Math.min(barW * (stat.value / stat.max), barW);
            renderer.drawText(`${stat.name}:`, infoX, barY, textColor, '8px "Big Apple 3PM", monospace');
            ctx.fillStyle = '#221100';
            ctx.fillRect(infoX + 45, barY - 5, barW, statHeight);
            ctx.fillStyle = stat.color;
            ctx.fillRect(infoX + 45, barY - 5, barFill, statHeight);
            ctx.strokeStyle = '#404040';
            ctx.lineWidth = 1;
            ctx.strokeRect(infoX + 45, barY - 5, barW, statHeight);
            renderer.drawText(stat.value.toString(), infoX + 170, barY, textColor, '8px "Big Apple 3PM", monospace');
        });
        if (selected) {
            const pulseAlpha = Math.sin(this.animations.buttonPulse * 4) * 0.3 + 0.7;
            ctx.shadowColor = shipColor;
            ctx.shadowBlur = 15 * pulseAlpha;
            renderer.drawText('◆ SELECTED ◆', x + w / 2, y + h - 15, shipColor, 'bold 12px "Big Apple 3PM", monospace');
            ctx.shadowBlur = 0;
        }
    }
    drawShipSilhouette(renderer, x, y, w, h, template, color, selected) {
        const ctx = renderer.getContext();
        ctx.fillStyle = '#001100';
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = '#303030';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, w, h);
        const centerX = x + w / 2;
        const centerY = y + h / 2;
        ctx.fillStyle = selected ? color : '#707070';
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - 25);
        ctx.lineTo(centerX + 20, centerY + 15);
        ctx.lineTo(centerX + 10, centerY + 25);
        ctx.lineTo(centerX - 10, centerY + 25);
        ctx.lineTo(centerX - 20, centerY + 15);
        ctx.closePath();
        if (selected) {
            ctx.fill();
        }
        ctx.stroke();
        if (selected) {
            ctx.shadowColor = color;
            ctx.shadowBlur = 8;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(centerX - 8, centerY + 20, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(centerX + 8, centerY + 20, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
        renderer.drawText(template.name.split(' ')[0], centerX, y + h - 8, color, '8px "Big Apple 3PM", monospace');
    }
    drawShipDetailsPanel(renderer, x, y, w, h) {
        const ctx = renderer.getContext();
        const template = SHIP_TEMPLATES[this.selectedShip];
        this.drawSelectionPanel(renderer, x, y, w, h, 'SHIP SPECIFICATIONS');
        const textY = y + 50;
        const lineHeight = 18;
        let currentY = textY;
        renderer.drawText(template.name, x + 20, currentY, '#b0b0b0', 'bold 16px "Big Apple 3PM", monospace');
        currentY += lineHeight * 1.5;
        renderer.drawText(`CLASS: ${template.type || 'MULTI-ROLE'}`, x + 20, currentY, '#909090', '12px "Big Apple 3PM", monospace');
        currentY += lineHeight * 1.5;
        renderer.drawText('SPECIFICATIONS:', x + 20, currentY, '#b0b0b0', 'bold 14px "Big Apple 3PM", monospace');
        currentY += lineHeight * 1.2;
        const specs = [
            `Hull Integrity: ${template.baseStats.hull}`,
            `Shield Capacity: ${template.baseStats.shields}`,
            `Max Velocity: ${template.baseStats.speed} m/s`,
            `Cargo Capacity: ${template.baseStats.cargo} tons`,
            `Weapon Hardpoints: ${template.weapons.length}`,
            `Ship Class: ${template.rarity.toUpperCase()}`
        ];
        specs.forEach(spec => {
            renderer.drawText(spec, x + 20, currentY, '#808080', '11px "Big Apple 3PM", monospace');
            currentY += lineHeight;
        });
        currentY += lineHeight * 0.5;
        renderer.drawText('WEAPONS:', x + 20, currentY, '#b0b0b0', 'bold 14px "Big Apple 3PM", monospace');
        currentY += lineHeight * 1.2;
        if (template.weapons && template.weapons.length > 0) {
            template.weapons.forEach((weapon) => {
                const weaponData = WEAPON_DATA[weapon];
                if (weaponData) {
                    renderer.drawText(`• ${weaponData.name}`, x + 20, currentY, '#808080', '10px "Big Apple 3PM", monospace');
                    currentY += lineHeight * 0.8;
                }
            });
        }
        else {
            renderer.drawText('• Basic Laser Array', x + 20, currentY, '#808080', '10px "Big Apple 3PM", monospace');
            currentY += lineHeight * 0.8;
        }
        currentY += lineHeight;
        renderer.drawText('MISSION PROFILE:', x + 20, currentY, '#b0b0b0', 'bold 14px "Big Apple 3PM", monospace');
        currentY += lineHeight * 1.2;
        const words = template.description.split(' ');
        let line = '';
        for (const word of words) {
            const testLine = line + (line ? ' ' : '') + word;
            if (testLine.length > 28) {
                renderer.drawText(line, x + 20, currentY, '#808080', '10px "Big Apple 3PM", monospace');
                currentY += lineHeight * 0.9;
                line = word;
            }
            else {
                line = testLine;
            }
        }
        if (line) {
            renderer.drawText(line, x + 20, currentY, '#808080', '10px "Big Apple 3PM", monospace');
        }
    }
    renderSummary(renderer) {
        const width = renderer.getWidth();
        const height = renderer.getHeight();
        const ctx = renderer.getContext();
        const startY = 280;
        ctx.shadowColor = '#5e1a20';
        ctx.shadowBlur = 8;
        renderer.drawText('MISSION DEPLOYMENT SUMMARY', width / 2, startY, '#ec9a6d', 'bold 22px "Big Apple 3PM", monospace');
        ctx.shadowBlur = 0;
        renderer.drawText('FINAL CONFIGURATION REVIEW', width / 2, startY + 25, '#E2DFD0', '14px "Big Apple 3PM", monospace');
        const difficultySettings = DIFFICULTY_SETTINGS[this.selectedDifficulty];
        const shipTemplate = SHIP_TEMPLATES[this.selectedShip];
        const raceData = RACE_DATA[this.character.race];
        const backgroundData = BACKGROUND_DATA[this.character.background];
        const panelGap = 20;
        const totalPanelWidth = width - 100;
        const panelWidth = (totalPanelWidth - (2 * panelGap)) / 3;
        const leftPanelX = 50;
        const leftPanelY = startY + 60;
        const leftPanelW = panelWidth;
        const leftPanelH = height - startY - 180;
        const middlePanelX = leftPanelX + leftPanelW + panelGap;
        const middlePanelY = startY + 60;
        const middlePanelW = panelWidth;
        const middlePanelH = leftPanelH;
        const rightPanelX = middlePanelX + middlePanelW + panelGap;
        const rightPanelY = startY + 60;
        const rightPanelW = panelWidth;
        const rightPanelH = leftPanelH;
        this.drawSelectionPanel(renderer, leftPanelX, leftPanelY, leftPanelW, leftPanelH, 'COMMANDER PROFILE');
        let leftY = leftPanelY + 50;
        const lineHeight = 18;
        renderer.drawText('DESIGNATION:', leftPanelX + 15, leftY, '#DCD7C9', 'bold 12px "Big Apple 3PM", monospace');
        leftY += lineHeight;
        renderer.drawText(this.character.name || 'CLASSIFIED', leftPanelX + 15, leftY, '#A27B5C', '11px "Big Apple 3PM", monospace');
        leftY += lineHeight * 1.5;
        renderer.drawText('SPECIES:', leftPanelX + 15, leftY, '#DCD7C9', 'bold 12px "Big Apple 3PM", monospace');
        leftY += lineHeight;
        renderer.drawText(raceData.name, leftPanelX + 15, leftY, '#A27B5C', '11px "Big Apple 3PM", monospace');
        leftY += lineHeight * 1.5;
        renderer.drawText('BACKGROUND:', leftPanelX + 15, leftY, '#DCD7C9', 'bold 12px "Big Apple 3PM", monospace');
        leftY += lineHeight;
        renderer.drawText(backgroundData.name, leftPanelX + 15, leftY, '#A27B5C', '11px "Big Apple 3PM", monospace');
        leftY += lineHeight * 1.5;
        renderer.drawText('AGE/GENDER:', leftPanelX + 15, leftY, '#b0b0b0', 'bold 12px "Big Apple 3PM", monospace');
        leftY += lineHeight;
        const genderText = this.character.gender === CharacterGender.MALE ? 'MALE' :
            this.character.gender === CharacterGender.FEMALE ? 'FEMALE' :
                this.character.gender === CharacterGender.NON_BINARY ? 'NON-BINARY' : 'OTHER';
        renderer.drawText(`${this.character.age} / ${genderText}`, leftPanelX + 15, leftY, '#808080', '11px "Big Apple 3PM", monospace');
        leftY += lineHeight * 2;
        renderer.drawText('SKILLS:', leftPanelX + 15, leftY, '#b0b0b0', 'bold 12px "Big Apple 3PM", monospace');
        leftY += lineHeight;
        const topSkills = Array.from(this.character.skills.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4);
        topSkills.forEach(([skill, level]) => {
            renderer.drawText(`${SKILL_DATA[skill].name}: ${level}`, leftPanelX + 15, leftY, '#808080', '10px "Big Apple 3PM", monospace');
            leftY += lineHeight * 0.9;
        });
        this.drawSelectionPanel(renderer, middlePanelX, middlePanelY, middlePanelW, middlePanelH, 'MISSION PARAMETERS');
        let middleY = middlePanelY + 50;
        renderer.drawText('DIFFICULTY:', middlePanelX + 15, middleY, '#b0b0b0', 'bold 12px "Big Apple 3PM", monospace');
        middleY += lineHeight;
        renderer.drawText(difficultySettings.name, middlePanelX + 15, middleY, '#808080', '11px "Big Apple 3PM", monospace');
        middleY += lineHeight * 1.5;
        renderer.drawText('GALAXY:', middlePanelX + 15, middleY, '#b0b0b0', 'bold 12px "Big Apple 3PM", monospace');
        middleY += lineHeight;
        renderer.drawText(GALAXY_SIZE_DATA[this.galaxySettings.size].name, middlePanelX + 15, middleY, '#808080', '11px "Big Apple 3PM", monospace');
        middleY += lineHeight;
        renderer.drawText(GALAXY_DENSITY_DATA[this.galaxySettings.density].name, middlePanelX + 15, middleY, '#808080', '10px "Big Apple 3PM", monospace');
        middleY += lineHeight * 1.5;
        renderer.drawText('ECONOMY:', middlePanelX + 15, middleY, '#b0b0b0', 'bold 12px "Big Apple 3PM", monospace');
        middleY += lineHeight;
        renderer.drawText(ECONOMY_COMPLEXITY_DATA[this.economySettings.complexity].name, middlePanelX + 15, middleY, '#808080', '11px "Big Apple 3PM", monospace');
        middleY += lineHeight * 2;
        renderer.drawText('MODIFIERS:', middlePanelX + 15, middleY, '#b0b0b0', 'bold 12px "Big Apple 3PM", monospace');
        middleY += lineHeight;
        const modifiers = [
            `Resources: ${difficultySettings.multipliers.resourceMultiplier}x`,
            `Enemy Power: ${difficultySettings.multipliers.damageMultiplier}x`,
            `Fuel Usage: ${difficultySettings.multipliers.fuelConsumption}x`,
            `XP Rate: ${difficultySettings.multipliers.experienceMultiplier}x`
        ];
        modifiers.forEach(modifier => {
            renderer.drawText(modifier, middlePanelX + 15, middleY, '#808080', '10px "Big Apple 3PM", monospace');
            middleY += lineHeight * 0.9;
        });
        this.drawSelectionPanel(renderer, rightPanelX, rightPanelY, rightPanelW, rightPanelH, 'FLEET CONFIGURATION');
        let rightY = rightPanelY + 50;
        renderer.drawText('STARSHIP:', rightPanelX + 15, rightY, '#b0b0b0', 'bold 12px "Big Apple 3PM", monospace');
        rightY += lineHeight;
        renderer.drawText(shipTemplate.name, rightPanelX + 15, rightY, '#808080', '11px "Big Apple 3PM", monospace');
        rightY += lineHeight * 1.5;
        renderer.drawText('SPECIFICATIONS:', rightPanelX + 15, rightY, '#b0b0b0', 'bold 12px "Big Apple 3PM", monospace');
        rightY += lineHeight;
        const shipSpecs = [
            `Hull: ${shipTemplate.baseStats.hull}`,
            `Shields: ${shipTemplate.baseStats.shields}`,
            `Speed: ${shipTemplate.baseStats.speed}`,
            `Cargo: ${shipTemplate.baseStats.cargo}`
        ];
        shipSpecs.forEach(spec => {
            renderer.drawText(spec, rightPanelX + 15, rightY, '#808080', '10px "Big Apple 3PM", monospace');
            rightY += lineHeight * 0.9;
        });
        rightY += lineHeight;
        renderer.drawText('RESOURCES:', rightPanelX + 15, rightY, '#b0b0b0', 'bold 12px "Big Apple 3PM", monospace');
        rightY += lineHeight;
        const totalCredits = difficultySettings.startingResources.credits + backgroundData.startingCredits;
        const resources = [
            `Fuel: ${difficultySettings.startingResources.fuel}%`,
            `Energy: ${difficultySettings.startingResources.energy}%`,
            `Credits: ${totalCredits}`
        ];
        resources.forEach(resource => {
            renderer.drawText(resource, rightPanelX + 15, rightY, '#808080', '10px "Big Apple 3PM", monospace');
            rightY += lineHeight * 0.9;
        });
        this.drawLaunchButton(renderer, width, height);
    }
    drawGalaxyOptionButton(renderer, x, y, w, h, selected, hovered, name, description) {
        const ctx = renderer.getContext();
        const offset = selected ? 0 : 2;
        ctx.fillStyle = '#201127';
        ctx.fillRect(x + offset, y + offset, w, h);
        ctx.fillStyle = selected ? 'rgba(32, 17, 39, 0.9)' : 'rgba(16, 18, 46, 0.7)';
        ctx.fillRect(x + offset + 2, y + offset + 2, w - 4, h - 4);
        const frameColor = selected ? '#6aaf9d' : (hovered ? '#7077A1' : '#3F4F44');
        ctx.strokeStyle = frameColor;
        ctx.lineWidth = selected ? 3 : (hovered ? 2 : 1);
        ctx.strokeRect(x + offset + 1, y + offset + 1, w - 2, h - 2);
        if (selected) {
            const pulseAlpha = Math.sin(this.animations.buttonPulse * 3) * 0.3 + 0.7;
            ctx.shadowColor = '#6aaf9d';
            ctx.shadowBlur = 12 * pulseAlpha;
            ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
            ctx.shadowBlur = 0;
        }
        const textColor = selected ? '#6aaf9d' : (hovered ? '#E2DFD0' : '#A27B5C');
        const nameSize = selected ? 'bold 16px' : '14px';
        const descSize = '11px';
        if (selected || hovered) {
            ctx.shadowColor = textColor;
            ctx.shadowBlur = 5;
        }
        renderer.drawText(name, x + 20, y + 18, textColor, `${nameSize} "Big Apple 3PM", monospace`);
        renderer.drawText(description, x + 20, y + 35, textColor, `${descSize} "Big Apple 3PM", monospace`);
        if (selected || hovered) {
            ctx.shadowBlur = 0;
        }
    }
    drawEconomyOptionButton(renderer, x, y, w, h, selected, hovered, name, description) {
        const ctx = renderer.getContext();
        const offset = selected ? 0 : 2;
        ctx.fillStyle = '#221100';
        ctx.fillRect(x + offset, y + offset, w, h);
        ctx.fillStyle = selected ? 'rgba(51, 34, 0, 0.9)' : 'rgba(34, 17, 0, 0.7)';
        ctx.fillRect(x + offset + 2, y + offset + 2, w - 4, h - 4);
        const frameColor = selected ? '#F6B17A' : (hovered ? '#cc8800' : '#3F4F44');
        ctx.strokeStyle = frameColor;
        ctx.lineWidth = selected ? 3 : (hovered ? 2 : 1);
        ctx.strokeRect(x + offset + 1, y + offset + 1, w - 2, h - 2);
        if (selected) {
            const pulseAlpha = Math.sin(this.animations.buttonPulse * 3) * 0.3 + 0.7;
            ctx.shadowColor = '#F6B17A';
            ctx.shadowBlur = 12 * pulseAlpha;
            ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
            ctx.shadowBlur = 0;
        }
        const textColor = selected ? '#F6B17A' : (hovered ? '#E2DFD0' : '#A27B5C');
        const nameSize = selected ? 'bold 18px' : '16px';
        const descSize = '13px';
        if (selected || hovered) {
            ctx.shadowColor = textColor;
            ctx.shadowBlur = 5;
        }
        renderer.drawText(name, x + 30, y + 22, textColor, `${nameSize} "Big Apple 3PM", monospace`);
        renderer.drawText(description, x + 30, y + 45, textColor, `${descSize} "Big Apple 3PM", monospace`);
        if (selected || hovered) {
            ctx.shadowBlur = 0;
        }
    }
    drawLaunchButton(renderer, width, height) {
        const ctx = renderer.getContext();
        this.startGameButton.width = 300;
        this.startGameButton.height = 60;
        this.startGameButton.x = width / 2 - this.startGameButton.width / 2;
        this.startGameButton.y = height - 120;
        const pressed = this.startGameButton.pressed;
        const hovered = this.startGameButton.hovered;
        const offset = pressed ? 3 : 0;
        ctx.fillStyle = '#221100';
        ctx.fillRect(this.startGameButton.x + offset, this.startGameButton.y + offset, this.startGameButton.width, this.startGameButton.height);
        ctx.fillStyle = pressed ? '#443300' : (hovered ? '#554400' : '#332200');
        ctx.fillRect(this.startGameButton.x + offset + 3, this.startGameButton.y + offset + 3, this.startGameButton.width - 6, this.startGameButton.height - 6);
        const frameColor = '#F97300';
        ctx.strokeStyle = frameColor;
        ctx.lineWidth = pressed ? 2 : 4;
        ctx.strokeRect(this.startGameButton.x + offset + 1, this.startGameButton.y + offset + 1, this.startGameButton.width - 2, this.startGameButton.height - 2);
        ctx.strokeStyle = '#be794f';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.startGameButton.x + offset + 8, this.startGameButton.y + offset + 8, this.startGameButton.width - 16, this.startGameButton.height - 16);
        if (hovered || pressed) {
            const pulseAlpha = Math.sin(this.animations.buttonPulse * 6) * 0.3 + 0.7;
            ctx.shadowColor = '#F97300';
            ctx.shadowBlur = 15 * pulseAlpha;
            ctx.strokeStyle = '#F97300';
            ctx.lineWidth = 3;
            ctx.strokeRect(this.startGameButton.x + 2, this.startGameButton.y + 2, this.startGameButton.width - 4, this.startGameButton.height - 4);
            ctx.shadowBlur = 0;
        }
        const textColor = hovered ? '#ffeb99' : '#e3b47a';
        if (hovered) {
            ctx.shadowColor = '#a0a0a0';
            ctx.shadowBlur = 8;
        }
        renderer.drawText('▶ LAUNCH MISSION ◀', this.startGameButton.x + this.startGameButton.width / 2, this.startGameButton.y + this.startGameButton.height / 2 - 8, textColor, pressed ? 'bold 18px "Big Apple 3PM", monospace' : 'bold 20px "Big Apple 3PM", monospace');
        renderer.drawText('INITIATE DEPLOYMENT SEQUENCE', this.startGameButton.x + this.startGameButton.width / 2, this.startGameButton.y + this.startGameButton.height / 2 + 12, textColor, '10px "Big Apple 3PM", monospace');
        if (hovered) {
            ctx.shadowBlur = 0;
        }
        const cornerSize = 12;
        ctx.fillStyle = '#a0a0a0';
        const corners = [
            [this.startGameButton.x + offset, this.startGameButton.y + offset],
            [this.startGameButton.x + offset + this.startGameButton.width - cornerSize, this.startGameButton.y + offset],
            [this.startGameButton.x + offset, this.startGameButton.y + offset + this.startGameButton.height - cornerSize],
            [this.startGameButton.x + offset + this.startGameButton.width - cornerSize, this.startGameButton.y + offset + this.startGameButton.height - cornerSize]
        ];
        corners.forEach(([x, y]) => {
            ctx.fillRect(x, y, cornerSize, cornerSize);
        });
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
                clickX = input.mouse.x;
                clickY = input.mouse.y;
            }
            else if (touchPressed) {
                const touch = input.touches.values().next().value;
                if (touch) {
                    clickX = touch.x;
                    clickY = touch.y;
                }
            }
            const currentTime = performance.now();
            const timeSinceLastClick = currentTime - this.lastNavigationClickTime;
            if (timeSinceLastClick >= this.navigationClickCooldown) {
                if (this.currentStep > 0 && this.isPointInRect(clickX, clickY, this.backButton)) {
                    this.backButton.pressed = true;
                    this.currentStep--;
                    this.lastNavigationClickTime = currentTime;
                    handled = true;
                }
                else if (this.canProceedFromCurrentStep() && this.isPointInRect(clickX, clickY, this.nextButton)) {
                    console.log(`Next button clicked on step ${this.currentStep}`);
                    this.nextButton.pressed = true;
                    if (this.currentStep === this.steps.length - 1) {
                        console.log('🚀 Next button on final step - starting launch sequence');
                        this.launching.active = true;
                        this.launching.start = performance.now();
                    }
                    else {
                        this.currentStep++;
                    }
                    this.lastNavigationClickTime = currentTime;
                    handled = true;
                }
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
                        console.log(`Summary step: click at ${clickX}, ${clickY}`);
                        console.log(`Start button area: x=${this.startGameButton.x}, y=${this.startGameButton.y}, w=${this.startGameButton.width}, h=${this.startGameButton.height}`);
                        if (this.isPointInRect(clickX, clickY, this.startGameButton)) {
                            console.log('Start button clicked! Starting launch sequence...');
                            this.startGameButton.pressed = true;
                            this.launching.active = true;
                            this.launching.start = performance.now();
                            handled = true;
                        }
                        else {
                            console.log('Click missed start button');
                        }
                        break;
                }
            }
        }
        return handled;
    }
    handleInput(input) {
        if (input.mouse.justPressed || input.touches.size > 0) {
            console.log(`NewGameSetup handleInput: mouse=${input.mouse.justPressed}, touches=${input.touches.size}, currentStep=${this.currentStep}`);
            if (input.mouse.justPressed) {
                console.log(`Mouse click at: ${input.mouse.x}, ${input.mouse.y}`);
            }
        }
        if (this.launching.active) {
            this.updateHoverStates(input);
            return;
        }
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
        const currentTime = performance.now();
        const timeSinceLastClick = currentTime - this.lastNavigationClickTime;
        if (timeSinceLastClick >= this.navigationClickCooldown) {
            if (input.wasKeyJustPressed('arrowleft') && this.currentStep > 0) {
                this.currentStep--;
                this.lastNavigationClickTime = currentTime;
            }
            if (input.wasKeyJustPressed('arrowright') && this.canProceedFromCurrentStep() && this.currentStep < this.steps.length - 1) {
                this.currentStep++;
                this.lastNavigationClickTime = currentTime;
            }
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
                    console.log('🎯 ENTER key pressed in summary - starting launch sequence');
                    this.launching.active = true;
                    this.launching.start = performance.now();
                }
                break;
        }
    }
    startGame() {
        console.log('🚀 Starting game...');
        const game = window.game;
        if (!game) {
            console.error('Game instance not found!');
            return;
        }
        try {
            this.gameSetup = {
                character: this.character,
                difficulty: this.selectedDifficulty,
                shipType: this.selectedShip,
                galaxySettings: this.galaxySettings,
                economySettings: this.economySettings,
                startingResources: DIFFICULTY_SETTINGS[this.selectedDifficulty].startingResources
            };
            window.gameSetup = this.gameSetup;
            console.log('🎮 Switching to PLAYING state...');
            setTimeout(() => {
                try {
                    game.stateManager.setState(GameState.PLAYING);
                    console.log('✅ Successfully switched to PLAYING state');
                }
                catch (error) {
                    console.error('❌ Error switching to PLAYING state:', error);
                }
            }, 50);
        }
        catch (error) {
            console.error('❌ Error in startGame:', error);
        }
    }
}
class PlayingState {
    enter() {
        console.log('🎮 Entering playing state');
        try {
            const game = window.game;
            const gameSetup = window.gameSetup;
            if (gameSetup && game && game.player) {
                console.log('🔧 Applying game setup...');
                const difficultySettings = DIFFICULTY_SETTINGS[gameSetup.difficulty];
                const shipTemplate = SHIP_TEMPLATES[gameSetup.shipType];
                if (difficultySettings && shipTemplate) {
                    game.player.fuel = gameSetup.startingResources.fuel;
                    game.player.energy = gameSetup.startingResources.energy;
                    game.player.maxHull = shipTemplate.baseStats.hull;
                    game.player.hull = shipTemplate.baseStats.hull;
                    game.player.maxShields = shipTemplate.baseStats.shields;
                    game.player.shields = shipTemplate.baseStats.shields;
                    game.player.maxCargoWeight = shipTemplate.baseStats.cargo;
                    const shipTypeToSprite = {
                        explorer: 'ship_explorer',
                        fighter: 'ship_fighter',
                        cargo: 'ship_cargo'
                    };
                    const spriteKey = shipTypeToSprite[String(gameSetup.shipType)] || 'ship_explorer';
                    game.player.spriteKey = spriteKey;
                    console.log(`🚀 Game started as ${gameSetup.character.name} with ${gameSetup.shipType} on ${gameSetup.difficulty} difficulty`);
                }
                else {
                    console.warn('⚠️ Missing difficulty or ship template data');
                }
            }
            else {
                console.warn('⚠️ Missing gameSetup or player - using defaults');
            }
            console.log('🎮 PlayingState initialization complete');
            if (game && game.sceneManager) {
                console.log('🌌 Initializing scene manager...');
                setTimeout(() => {
                    game.sceneManager.getCurrentScene();
                }, 100);
            }
        }
        catch (error) {
            console.error('❌ Error in PlayingState enter:', error);
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
        this.cachedScenes = new Map();
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
        const sceneType = this.currentScene;
        if (!this.cachedScenes.has(sceneType)) {
            console.log(`🏗️ Creating new scene: ${sceneType}`);
            switch (sceneType) {
                case 'starSystem':
                    const starScene = new StarSystemScene();
                    this.cachedScenes.set(sceneType, starScene);
                    console.log('✅ StarSystemScene created successfully');
                    break;
                case 'interstellarSpace':
                    const spaceScene = new InterstellarSpaceScene();
                    this.cachedScenes.set(sceneType, spaceScene);
                    console.log('✅ InterstellarSpaceScene created successfully');
                    break;
                default:
                    const defaultScene = new StarSystemScene();
                    this.cachedScenes.set(sceneType, defaultScene);
                    console.log('✅ Default StarSystemScene created successfully');
            }
        }
        return this.cachedScenes.get(sceneType);
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
        this.inputManager.setCanvas(this.canvas);
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
        this.stateManager.handleInput(this.inputManager);
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
            console.log('Creating new canvas element');
            canvas = document.createElement('canvas');
            canvas.id = 'gameCanvas';
            canvas.width = 1920;
            canvas.height = 1080;
            canvas.style.display = 'block';
            canvas.style.background = '#1a1a2a';
            canvas.style.imageRendering = 'pixelated';
            canvas.style.imageRendering = '-moz-crisp-edges';
            canvas.style.imageRendering = 'crisp-edges';
            document.body.appendChild(canvas);
        }
        else {
            console.log('Using existing canvas element');
        }
        console.log('🎮 Creating game engine...');
        const game = new GameEngine('gameCanvas');
        window.game = game;
        console.log('🚀 Starting game loop...');
        game.startGameLoop();
        console.log('✅ Game initialized successfully');
        console.log('🎮 Controls: WASD/Arrow keys for movement, SPACE for fire, ESC for menu');
        console.log('🔧 Debug: Use window.game object in console');
        console.log('⚡ Features: Enhanced UI, New Game Setup, Multiple Ship Types, Difficulty Levels');
    }
    catch (error) {
        console.error('❌ Error initializing game:', error);
        console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
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