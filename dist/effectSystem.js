import { EffectType } from './types';
export class EffectSystem {
    constructor() {
        this.effects = new Map();
        this.nextEffectId = 1;
    }
    createEffect(type, position, options = {}) {
        const id = `effect_${this.nextEffectId++}`;
        let effect;
        switch (type) {
            case EffectType.SHIELD_HIT:
                effect = this.createShieldHitEffect(id, position, options);
                break;
            case EffectType.SHIELD_REGENERATE:
                effect = this.createShieldRegenEffect(id, position, options);
                break;
            case EffectType.ENGINE_THRUST:
                effect = this.createEngineEffect(id, position, options);
                break;
            case EffectType.MANEUVERING_THRUST:
                effect = this.createManeuveringEffect(id, position, options);
                break;
            case EffectType.WARP_CHARGE:
                effect = this.createWarpChargeEffect(id, position, options);
                break;
            case EffectType.WARP_BUBBLE:
                effect = this.createWarpBubbleEffect(id, position, options);
                break;
            case EffectType.WEAPON_IMPACT:
                effect = this.createWeaponImpactEffect(id, position, options);
                break;
            default:
                effect = this.createBasicEffect(id, type, position, options);
        }
        this.effects.set(id, effect);
        return id;
    }
    update(deltaTime) {
        const effectsToRemove = [];
        this.effects.forEach((effect, id) => {
            effect.timeRemaining -= deltaTime;
            effect.animationFrame += deltaTime * 60;
            if (effect.timeRemaining <= 0) {
                effectsToRemove.push(id);
            }
            else {
                this.updateEffect(effect, deltaTime);
            }
        });
        effectsToRemove.forEach(id => this.effects.delete(id));
    }
    render(renderer) {
        this.effects.forEach(effect => {
            this.renderEffect(effect, renderer);
        });
    }
    removeEffect(id) {
        this.effects.delete(id);
    }
    clearAllEffects() {
        this.effects.clear();
    }
    createShieldHitEffect(id, position, options) {
        return {
            id,
            type: EffectType.SHIELD_HIT,
            position: { ...position },
            duration: 0.5,
            timeRemaining: 0.5,
            intensity: options.intensity || 1.0,
            color: options.color || '#00aaff',
            size: options.size || 50,
            animationFrame: 0,
            hexagonPattern: true,
            rippleCenter: options.impactPoint || position,
            impactIntensity: options.intensity || 1.0
        };
    }
    createShieldRegenEffect(id, position, options) {
        return {
            id,
            type: EffectType.SHIELD_REGENERATE,
            position: { ...position },
            duration: 2.0,
            timeRemaining: 2.0,
            intensity: 0.3,
            color: '#00ffaa',
            size: options.size || 40,
            animationFrame: 0,
            hexagonPattern: true,
            rippleCenter: position,
            impactIntensity: 0.2
        };
    }
    createEngineEffect(id, position, options) {
        return {
            id,
            type: EffectType.ENGINE_THRUST,
            position: { ...position },
            duration: options.duration || 0.1,
            timeRemaining: options.duration || 0.1,
            intensity: options.intensity || 1.0,
            color: '#ff6600',
            size: options.size || 30,
            animationFrame: 0,
            thrustVector: options.thrustVector || { x: 0, y: 1 },
            particleCount: options.particleCount || 20,
            exhaustLength: options.exhaustLength || 60
        };
    }
    createManeuveringEffect(id, position, options) {
        return {
            id,
            type: EffectType.MANEUVERING_THRUST,
            position: { ...position },
            duration: 0.2,
            timeRemaining: 0.2,
            intensity: options.intensity || 0.7,
            color: '#ff9900',
            size: 15,
            animationFrame: 0,
            thrustVector: options.thrustVector || { x: 1, y: 0 },
            particleCount: 8,
            exhaustLength: 25
        };
    }
    createWarpChargeEffect(id, position, options) {
        return {
            id,
            type: EffectType.WARP_CHARGE,
            position: { ...position },
            duration: 3.0,
            timeRemaining: 3.0,
            intensity: 0.0,
            color: '#ffffff',
            size: 10,
            animationFrame: 0,
            phase: 'charging',
            bubbleRadius: 10,
            distortionLevel: 0.0
        };
    }
    createWarpBubbleEffect(id, position, options) {
        return {
            id,
            type: EffectType.WARP_BUBBLE,
            position: { ...position },
            duration: 2.0,
            timeRemaining: 2.0,
            intensity: 1.0,
            color: '#aaccff',
            size: 80,
            animationFrame: 0,
            phase: 'bubble',
            bubbleRadius: 80,
            distortionLevel: 0.5
        };
    }
    createWeaponImpactEffect(id, position, options) {
        return {
            id,
            type: EffectType.WEAPON_IMPACT,
            position: { ...position },
            duration: 0.3,
            timeRemaining: 0.3,
            intensity: 1.0,
            color: options.color || '#ffff00',
            size: options.size || 20,
            animationFrame: 0,
            data: { weaponType: options.weaponType }
        };
    }
    createBasicEffect(id, type, position, options) {
        return {
            id,
            type,
            position: { ...position },
            duration: options.duration || 1.0,
            timeRemaining: options.duration || 1.0,
            intensity: options.intensity || 1.0,
            color: options.color || '#ffffff',
            size: options.size || 20,
            animationFrame: 0,
            data: options.data
        };
    }
    updateEffect(effect, deltaTime) {
        const progress = 1 - (effect.timeRemaining / effect.duration);
        switch (effect.type) {
            case EffectType.SHIELD_HIT:
                this.updateShieldHitEffect(effect, progress, deltaTime);
                break;
            case EffectType.SHIELD_REGENERATE:
                this.updateShieldRegenEffect(effect, progress, deltaTime);
                break;
            case EffectType.ENGINE_THRUST:
                this.updateEngineEffect(effect, progress, deltaTime);
                break;
            case EffectType.WARP_CHARGE:
                this.updateWarpChargeEffect(effect, progress, deltaTime);
                break;
            case EffectType.WARP_BUBBLE:
                this.updateWarpBubbleEffect(effect, progress, deltaTime);
                break;
        }
    }
    updateShieldHitEffect(effect, progress, deltaTime) {
        effect.intensity = Math.max(0, 1.0 - progress * 2);
        effect.size = 50 + progress * 30;
    }
    updateShieldRegenEffect(effect, progress, deltaTime) {
        effect.intensity = 0.3 + 0.2 * Math.sin(effect.animationFrame * 0.1);
    }
    updateEngineEffect(effect, progress, deltaTime) {
        effect.intensity = 0.8 + 0.2 * Math.random();
    }
    updateWarpChargeEffect(effect, progress, deltaTime) {
        effect.intensity = progress;
        effect.bubbleRadius = 10 + progress * 70;
        if (progress > 0.8) {
            effect.phase = 'bubble';
        }
    }
    updateWarpBubbleEffect(effect, progress, deltaTime) {
        if (progress < 0.3) {
            effect.phase = 'bubble';
            effect.distortionLevel = progress * 2;
        }
        else if (progress < 0.7) {
            effect.phase = 'distortion';
            effect.distortionLevel = 0.6 + (progress - 0.3) * 2;
        }
        else {
            effect.phase = 'collapse';
            effect.bubbleRadius = 80 * (1 - (progress - 0.7) * 3);
            effect.intensity = 1 - (progress - 0.7) * 3;
        }
    }
    renderEffect(effect, renderer) {
        switch (effect.type) {
            case EffectType.SHIELD_HIT:
            case EffectType.SHIELD_REGENERATE:
                this.renderShieldEffect(effect, renderer);
                break;
            case EffectType.ENGINE_THRUST:
            case EffectType.MANEUVERING_THRUST:
                this.renderEngineEffect(effect, renderer);
                break;
            case EffectType.WARP_CHARGE:
            case EffectType.WARP_BUBBLE:
                this.renderWarpEffect(effect, renderer);
                break;
            case EffectType.WEAPON_IMPACT:
                this.renderWeaponImpact(effect, renderer);
                break;
            default:
                this.renderBasicEffect(effect, renderer);
        }
    }
    renderShieldEffect(effect, renderer) {
        const { position, size, intensity, color } = effect;
        if (effect.hexagonPattern) {
            this.renderHexagonalShield(renderer, position, size, intensity, color, effect);
        }
        else {
            this.renderBubbleShield(renderer, position, size, intensity, color);
        }
    }
    renderHexagonalShield(renderer, pos, size, intensity, color, effect) {
        const hexRadius = size / 2;
        const hexCount = 6;
        for (let ring = 0; ring < 3; ring++) {
            const currentRadius = hexRadius + ring * 15;
            const alpha = intensity * (1 - ring * 0.3);
            if (alpha <= 0)
                continue;
            const points = [];
            for (let i = 0; i <= hexCount; i++) {
                const angle = (i / hexCount) * Math.PI * 2;
                points.push({
                    x: pos.x + Math.cos(angle) * currentRadius,
                    y: pos.y + Math.sin(angle) * currentRadius
                });
            }
            renderer.strokePath(points, `rgba(0, 170, 255, ${alpha})`, 2);
            renderer.strokePath(points, `rgba(0, 170, 255, ${alpha * 0.3})`, 6);
        }
        if (effect.rippleCenter && effect.type === EffectType.SHIELD_HIT) {
            const rippleRadius = size * (1 - effect.timeRemaining / effect.duration);
            renderer.strokeCircle(effect.rippleCenter.x, effect.rippleCenter.y, rippleRadius, `rgba(255, 255, 255, ${effect.intensity})`, 3);
        }
    }
    renderBubbleShield(renderer, pos, size, intensity, color) {
        const radius = size / 2;
        renderer.fillCircle(pos.x, pos.y, radius + 10, `rgba(0, 170, 255, ${intensity * 0.1})`);
        renderer.strokeCircle(pos.x, pos.y, radius, `rgba(0, 170, 255, ${intensity * 0.6})`, 2);
        renderer.strokeCircle(pos.x, pos.y, radius - 5, `rgba(255, 255, 255, ${intensity * 0.3})`, 1);
    }
    renderEngineEffect(effect, renderer) {
        const { position, intensity, thrustVector, exhaustLength, particleCount } = effect;
        const thrustAngle = Math.atan2(thrustVector.y, thrustVector.x);
        for (let i = 0; i < particleCount; i++) {
            const particleDistance = (i / particleCount) * exhaustLength;
            const spread = (i / particleCount) * 0.3;
            const baseX = position.x + Math.cos(thrustAngle) * particleDistance;
            const baseY = position.y + Math.sin(thrustAngle) * particleDistance;
            const spreadAngle = thrustAngle + (Math.random() - 0.5) * spread;
            const spreadDistance = Math.random() * 10;
            const x = baseX + Math.cos(spreadAngle) * spreadDistance;
            const y = baseY + Math.sin(spreadAngle) * spreadDistance;
            const heatRatio = 1 - (i / particleCount);
            const alpha = intensity * heatRatio * (0.5 + Math.random() * 0.5);
            let color;
            if (heatRatio > 0.7) {
                color = `rgba(255, 255, 255, ${alpha})`;
            }
            else if (heatRatio > 0.4) {
                color = `rgba(255, 200, 0, ${alpha})`;
            }
            else {
                color = `rgba(255, 100, 0, ${alpha})`;
            }
            const size = 2 + heatRatio * 3;
            renderer.fillCircle(x, y, size, color);
        }
    }
    renderWarpEffect(effect, renderer) {
        const { position, bubbleRadius, distortionLevel, phase, intensity } = effect;
        switch (phase) {
            case 'charging':
                this.renderWarpCharging(renderer, position, bubbleRadius, intensity);
                break;
            case 'bubble':
                this.renderWarpBubble(renderer, position, bubbleRadius, distortionLevel, intensity);
                break;
            case 'distortion':
                this.renderWarpDistortion(renderer, position, bubbleRadius, distortionLevel, intensity);
                break;
            case 'collapse':
                this.renderWarpCollapse(renderer, position, bubbleRadius, intensity);
                break;
        }
    }
    renderWarpCharging(renderer, pos, radius, intensity) {
        const pulseIntensity = intensity * (0.5 + 0.5 * Math.sin(Date.now() * 0.01));
        renderer.strokeCircle(pos.x, pos.y, radius, `rgba(255, 255, 255, ${pulseIntensity})`, 2);
        renderer.fillCircle(pos.x, pos.y, radius * 0.3, `rgba(255, 255, 255, ${pulseIntensity * 0.3})`);
    }
    renderWarpBubble(renderer, pos, radius, distortion, intensity) {
        renderer.strokeCircle(pos.x, pos.y, radius, `rgba(170, 204, 255, ${intensity * 0.8})`, 3);
        for (let i = 0; i < 3; i++) {
            const innerRadius = radius * (0.7 + i * 0.1);
            const alpha = intensity * 0.2 * (1 - i * 0.3);
            renderer.strokeCircle(pos.x, pos.y, innerRadius, `rgba(255, 255, 255, ${alpha})`, 1);
        }
    }
    renderWarpDistortion(renderer, pos, radius, distortion, intensity) {
        const rings = 5;
        for (let i = 0; i < rings; i++) {
            const ringRadius = radius * (0.5 + i * 0.3) * distortion;
            const alpha = intensity * 0.6 * (1 - i * 0.15);
            renderer.strokeCircle(pos.x, pos.y, ringRadius, `rgba(255, 255, 0, ${alpha})`, 2);
            renderer.strokeCircle(pos.x - 1, pos.y, ringRadius, `rgba(255, 0, 0, ${alpha * 0.5})`, 1);
            renderer.strokeCircle(pos.x + 1, pos.y, ringRadius, `rgba(0, 0, 255, ${alpha * 0.5})`, 1);
        }
    }
    renderWarpCollapse(renderer, pos, radius, intensity) {
        if (radius <= 0 || intensity <= 0)
            return;
        renderer.fillCircle(pos.x, pos.y, Math.max(1, radius * 0.1), '#000000');
        const diskRadius = radius * 0.5;
        for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
            const x = pos.x + Math.cos(angle) * diskRadius;
            const y = pos.y + Math.sin(angle) * diskRadius * 0.3;
            const alpha = intensity * 0.8;
            renderer.fillCircle(x, y, 2, `rgba(255, 150, 0, ${alpha})`);
        }
    }
    renderWeaponImpact(effect, renderer) {
        const { position, size, intensity, color } = effect;
        const progress = 1 - (effect.timeRemaining / effect.duration);
        const currentSize = size * (1 + progress * 2);
        const alpha = intensity * (1 - progress);
        renderer.fillCircle(position.x, position.y, currentSize, `rgba(255, 255, 0, ${alpha})`);
        renderer.fillCircle(position.x, position.y, currentSize * 0.7, `rgba(255, 150, 0, ${alpha})`);
        renderer.fillCircle(position.x, position.y, currentSize * 0.4, `rgba(255, 255, 255, ${alpha})`);
    }
    renderBasicEffect(effect, renderer) {
        const { position, size, intensity, color } = effect;
        renderer.fillCircle(position.x, position.y, size, color);
    }
}
//# sourceMappingURL=effectSystem.js.map