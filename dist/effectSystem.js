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
    render(renderer, camera) {
        this.effects.forEach(effect => {
            this.renderEffect(effect, renderer, camera);
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
            color: options.color || '#505050',
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
            color: '#505050',
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
            color: '#404040',
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
            color: '#404040',
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
            duration: 4.0,
            timeRemaining: 4.0,
            intensity: 0.0,
            color: '#000000',
            size: 20,
            animationFrame: 0,
            phase: 'charging',
            bubbleRadius: 20,
            distortionLevel: 0.0,
            accretionDiskRadius: 0,
            gravitationalLensing: 0.0,
            spacetimeDistortion: 0.0
        };
    }
    createWarpBubbleEffect(id, position, options) {
        return {
            id,
            type: EffectType.WARP_BUBBLE,
            position: { ...position },
            duration: 3.0,
            timeRemaining: 3.0,
            intensity: 1.0,
            color: '#000000',
            size: 150,
            animationFrame: 0,
            phase: 'blackhole',
            bubbleRadius: 150,
            distortionLevel: 1.0,
            accretionDiskRadius: 200,
            gravitationalLensing: 1.0,
            spacetimeDistortion: 1.0
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
            color: options.color || '#505050',
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
            color: options.color || '#505050',
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
        effect.intensity = Math.pow(progress, 2);
        effect.bubbleRadius = 20 + progress * 80;
        effect.accretionDiskRadius = progress * 120;
        effect.gravitationalLensing = progress * 0.5;
        effect.spacetimeDistortion = progress * 0.8;
        if (progress > 0.9) {
            effect.phase = 'blackhole';
        }
    }
    updateWarpBubbleEffect(effect, progress, deltaTime) {
        if (progress < 0.2) {
            effect.phase = 'blackhole';
            effect.intensity = 1.0;
            effect.accretionDiskRadius = 200 + progress * 50;
            effect.gravitationalLensing = 1.0;
            effect.spacetimeDistortion = 1.0 + progress * 0.5;
        }
        else if (progress < 0.8) {
            effect.phase = 'distortion';
            effect.accretionDiskRadius = 250 + Math.sin((progress - 0.2) * 20) * 30;
            effect.gravitationalLensing = 1.0 + Math.sin((progress - 0.2) * 15) * 0.3;
            effect.spacetimeDistortion = 1.5 + Math.sin((progress - 0.2) * 12) * 0.2;
        }
        else {
            effect.phase = 'collapse';
            const collapseProgress = (progress - 0.8) / 0.2;
            effect.bubbleRadius = 150 * (1 - collapseProgress);
            effect.accretionDiskRadius = 250 * (1 - collapseProgress);
            effect.intensity = 1 - collapseProgress;
            effect.gravitationalLensing = (1 - collapseProgress) * 1.3;
            effect.spacetimeDistortion = (1 - collapseProgress) * 1.7;
        }
    }
    renderEffect(effect, renderer, camera) {
        switch (effect.type) {
            case EffectType.SHIELD_HIT:
            case EffectType.SHIELD_REGENERATE:
                this.renderShieldEffect(effect, renderer, camera);
                break;
            case EffectType.ENGINE_THRUST:
            case EffectType.MANEUVERING_THRUST:
                this.renderEngineEffect(effect, renderer, camera);
                break;
            case EffectType.WARP_CHARGE:
            case EffectType.WARP_BUBBLE:
                this.renderWarpEffect(effect, renderer, camera);
                break;
            case EffectType.WEAPON_IMPACT:
                this.renderWeaponImpact(effect, renderer, camera);
                break;
            default:
                this.renderBasicEffect(effect, renderer, camera);
        }
    }
    renderShieldEffect(effect, renderer, camera) {
        const { position, size, intensity, color } = effect;
        if (effect.hexagonPattern) {
            this.renderHexagonalShield(renderer, position, size, intensity, color, effect, camera);
        }
        else {
            this.renderBubbleShield(renderer, position, size, intensity, color, camera);
        }
    }
    renderHexagonalShield(renderer, pos, size, intensity, color, effect, camera) {
        const screenPos = camera.worldToScreen(pos.x, pos.y);
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
                    x: screenPos.x + Math.cos(angle) * currentRadius,
                    y: screenPos.y + Math.sin(angle) * currentRadius
                });
            }
            renderer.strokePath(points, `rgba(80, 80, 80, ${alpha})`, 2);
            renderer.strokePath(points, `rgba(80, 80, 80, ${alpha * 0.3})`, 6);
        }
        if (effect.rippleCenter && effect.type === EffectType.SHIELD_HIT) {
            const rippleScreenPos = camera.worldToScreen(effect.rippleCenter.x, effect.rippleCenter.y);
            const rippleRadius = size * (1 - effect.timeRemaining / effect.duration);
            renderer.strokeCircle(rippleScreenPos.x, rippleScreenPos.y, rippleRadius, `rgba(80, 80, 80, ${effect.intensity})`, 3);
        }
    }
    renderBubbleShield(renderer, pos, size, intensity, color, camera) {
        const screenPos = camera.worldToScreen(pos.x, pos.y);
        const radius = size / 2;
        renderer.fillCircle(screenPos.x, screenPos.y, radius + 10, `rgba(0, 170, 255, ${intensity * 0.1})`);
        renderer.strokeCircle(screenPos.x, screenPos.y, radius, `rgba(0, 170, 255, ${intensity * 0.6})`, 2);
        renderer.strokeCircle(screenPos.x, screenPos.y, radius - 5, `rgba(255, 255, 255, ${intensity * 0.3})`, 1);
    }
    renderEngineEffect(effect, renderer, camera) {
        const { position, intensity, thrustVector, exhaustLength, particleCount } = effect;
        const screenPos = camera.worldToScreen(position.x, position.y);
        const thrustAngle = Math.atan2(thrustVector.y, thrustVector.x);
        for (let i = 0; i < particleCount; i++) {
            const particleDistance = (i / particleCount) * exhaustLength;
            const spread = (i / particleCount) * 0.3;
            const baseX = screenPos.x + Math.cos(thrustAngle) * particleDistance;
            const baseY = screenPos.y + Math.sin(thrustAngle) * particleDistance;
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
    renderWarpEffect(effect, renderer, camera) {
        const { position, bubbleRadius, distortionLevel, phase, intensity, accretionDiskRadius, gravitationalLensing, spacetimeDistortion } = effect;
        switch (phase) {
            case 'charging':
                this.renderWarpCharging(renderer, position, bubbleRadius, intensity, accretionDiskRadius, gravitationalLensing, camera);
                break;
            case 'blackhole':
                this.renderBlackHole(renderer, position, bubbleRadius, accretionDiskRadius, gravitationalLensing, spacetimeDistortion, intensity, camera);
                break;
            case 'distortion':
                this.renderBlackHoleDistortion(renderer, position, bubbleRadius, accretionDiskRadius, gravitationalLensing, spacetimeDistortion, intensity, camera);
                break;
            case 'collapse':
                this.renderBlackHoleCollapse(renderer, position, bubbleRadius, accretionDiskRadius, gravitationalLensing, intensity, camera);
                break;
        }
    }
    renderWarpCharging(renderer, pos, radius, intensity, accretionRadius, lensing, camera) {
        const screenPos = camera.worldToScreen(pos.x, pos.y);
        const ctx = renderer.getContext();
        if (intensity > 0.1) {
            ctx.save();
            const pulseIntensity = intensity * (0.7 + 0.3 * Math.sin(Date.now() * 0.008));
            if (accretionRadius > 30) {
                this.renderAccretionDisk(ctx, screenPos, accretionRadius, intensity * 0.6);
            }
            for (let i = 1; i <= 3; i++) {
                const ringRadius = radius * i * 0.8;
                const alpha = (intensity * 0.4) / i;
                ctx.strokeStyle = `rgba(100, 100, 255, ${alpha})`;
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.arc(screenPos.x, screenPos.y, ringRadius, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.setLineDash([]);
            const gradient = ctx.createRadialGradient(screenPos.x, screenPos.y, 0, screenPos.x, screenPos.y, radius * 0.5);
            gradient.addColorStop(0, `rgba(150, 150, 255, ${pulseIntensity * 0.8})`);
            gradient.addColorStop(0.5, `rgba(100, 100, 200, ${pulseIntensity * 0.4})`);
            gradient.addColorStop(1, 'rgba(50, 50, 150, 0.1)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(screenPos.x, screenPos.y, radius * 0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
    renderBlackHole(renderer, pos, radius, accretionRadius, lensing, distortion, intensity, camera) {
        const screenPos = camera.worldToScreen(pos.x, pos.y);
        const ctx = renderer.getContext();
        ctx.save();
        this.renderSpacetimeDistortion(ctx, screenPos, radius * 2, distortion, intensity);
        this.renderAccretionDisk(ctx, screenPos, accretionRadius, intensity);
        this.renderGravitationalLensing(ctx, screenPos, radius * 1.5, lensing, intensity);
        this.renderEventHorizon(ctx, screenPos, radius * 0.6, intensity);
        ctx.strokeStyle = `rgba(255, 255, 255, ${intensity * 0.3})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 4]);
        ctx.beginPath();
        ctx.arc(screenPos.x, screenPos.y, radius * 0.9, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
    }
    renderBlackHoleDistortion(renderer, pos, radius, accretionRadius, lensing, distortion, intensity, camera) {
        this.renderBlackHole(renderer, pos, radius, accretionRadius, lensing, distortion, intensity, camera);
        const screenPos = camera.worldToScreen(pos.x, pos.y);
        const ctx = renderer.getContext();
        ctx.save();
        const time = Date.now() * 0.003;
        for (let i = 0; i < 5; i++) {
            const waveRadius = radius * (2 + i * 0.8) + Math.sin(time + i) * 20;
            const alpha = (intensity * 0.2) / (i + 1);
            ctx.strokeStyle = `rgba(200, 200, 255, ${alpha})`;
            ctx.lineWidth = 3 - i * 0.4;
            ctx.beginPath();
            ctx.arc(screenPos.x, screenPos.y, waveRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();
    }
    renderBlackHoleCollapse(renderer, pos, radius, accretionRadius, lensing, intensity, camera) {
        const screenPos = camera.worldToScreen(pos.x, pos.y);
        const ctx = renderer.getContext();
        ctx.save();
        if (accretionRadius > 10) {
            this.renderAccretionDisk(ctx, screenPos, accretionRadius, intensity * 0.8);
        }
        this.renderEventHorizon(ctx, screenPos, radius * 0.6, intensity);
        const burstRadius = radius * 3;
        const burstAlpha = intensity * 0.6;
        ctx.strokeStyle = `rgba(255, 255, 255, ${burstAlpha})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(screenPos.x, screenPos.y, burstRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
    renderAccretionDisk(ctx, center, radius, intensity) {
        const time = Date.now() * 0.002;
        for (let ring = 0; ring < 8; ring++) {
            const ringRadius = radius * 0.4 + ring * (radius * 0.6) / 8;
            const particlesInRing = Math.floor(ringRadius * 0.3);
            for (let i = 0; i < particlesInRing; i++) {
                const angle = (i / particlesInRing) * Math.PI * 2 + time * (2 - ring * 0.2);
                const x = center.x + Math.cos(angle) * ringRadius;
                const y = center.y + Math.sin(angle) * ringRadius * 0.3;
                const temp = 1 - (ring / 8);
                const r = Math.floor(255 * temp);
                const g = Math.floor(200 * temp * 0.7);
                const b = Math.floor(100 * temp * 0.3);
                const alpha = intensity * (0.8 - ring * 0.1);
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
                const particleSize = Math.max(1, (2 - ring * 0.2) * intensity);
                ctx.fillRect(x - particleSize / 2, y - particleSize / 2, particleSize, particleSize);
                if (Math.random() < 0.05 * intensity) {
                    ctx.fillStyle = `rgba(255, 255, 200, ${alpha * 0.8})`;
                    ctx.fillRect(x - 1, y - 1, 2, 2);
                }
            }
        }
    }
    renderEventHorizon(ctx, center, radius, intensity) {
        const gradient = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, radius);
        gradient.addColorStop(0, '#000000');
        gradient.addColorStop(0.8, '#000000');
        gradient.addColorStop(1, `rgba(0, 0, 0, ${intensity * 0.9})`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `rgba(100, 100, 200, ${intensity * 0.6})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
        ctx.stroke();
    }
    renderGravitationalLensing(ctx, center, radius, lensing, intensity) {
        for (let i = 1; i <= 4; i++) {
            const lensRadius = radius + i * 30;
            const alpha = (intensity * lensing * 0.15) / i;
            ctx.strokeStyle = `rgba(150, 200, 255, ${alpha})`;
            ctx.lineWidth = 3 - i * 0.5;
            ctx.setLineDash([3, 6]);
            ctx.beginPath();
            ctx.arc(center.x, center.y, lensRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.setLineDash([]);
        const time = Date.now() * 0.001;
        for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2 + time * 0.5;
            const startRadius = radius * 1.2;
            const endRadius = radius * 1.8;
            const startX = center.x + Math.cos(angle) * startRadius;
            const startY = center.y + Math.sin(angle) * startRadius;
            const endX = center.x + Math.cos(angle + lensing * 0.3) * endRadius;
            const endY = center.y + Math.sin(angle + lensing * 0.3) * endRadius;
            ctx.strokeStyle = `rgba(255, 255, 200, ${intensity * lensing * 0.3})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }
    }
    renderSpacetimeDistortion(ctx, center, radius, distortion, intensity) {
        const gridSize = 40;
        const time = Date.now() * 0.001;
        ctx.strokeStyle = `rgba(100, 150, 200, ${intensity * distortion * 0.2})`;
        ctx.lineWidth = 1;
        for (let x = -radius; x <= radius; x += gridSize) {
            ctx.beginPath();
            for (let y = -radius; y <= radius; y += 5) {
                const dist = Math.sqrt(x * x + y * y);
                if (dist < radius) {
                    const distortionFactor = Math.max(0, 1 - dist / radius);
                    const warpX = x + Math.sin(time + y * 0.01) * distortion * distortionFactor * 20;
                    const warpY = y + Math.cos(time + x * 0.01) * distortion * distortionFactor * 15;
                    if (y === -radius) {
                        ctx.moveTo(center.x + warpX, center.y + warpY);
                    }
                    else {
                        ctx.lineTo(center.x + warpX, center.y + warpY);
                    }
                }
            }
            ctx.stroke();
        }
        for (let y = -radius; y <= radius; y += gridSize) {
            ctx.beginPath();
            for (let x = -radius; x <= radius; x += 5) {
                const dist = Math.sqrt(x * x + y * y);
                if (dist < radius) {
                    const distortionFactor = Math.max(0, 1 - dist / radius);
                    const warpX = x + Math.sin(time + y * 0.01) * distortion * distortionFactor * 20;
                    const warpY = y + Math.cos(time + x * 0.01) * distortion * distortionFactor * 15;
                    if (x === -radius) {
                        ctx.moveTo(center.x + warpX, center.y + warpY);
                    }
                    else {
                        ctx.lineTo(center.x + warpX, center.y + warpY);
                    }
                }
            }
            ctx.stroke();
        }
    }
    renderWeaponImpact(effect, renderer, camera) {
        const { position, size, intensity, color } = effect;
        const screenPos = camera.worldToScreen(position.x, position.y);
        const progress = 1 - (effect.timeRemaining / effect.duration);
        const currentSize = size * (1 + progress * 2);
        const alpha = intensity * (1 - progress);
        renderer.fillCircle(screenPos.x, screenPos.y, currentSize, `rgba(255, 255, 0, ${alpha})`);
        renderer.fillCircle(screenPos.x, screenPos.y, currentSize * 0.7, `rgba(255, 150, 0, ${alpha})`);
        renderer.fillCircle(screenPos.x, screenPos.y, currentSize * 0.4, `rgba(255, 255, 255, ${alpha})`);
    }
    renderBasicEffect(effect, renderer, camera) {
        const { position, size, intensity, color } = effect;
        const screenPos = camera.worldToScreen(position.x, position.y);
        renderer.fillCircle(screenPos.x, screenPos.y, size, color);
    }
}
//# sourceMappingURL=effectSystem.js.map