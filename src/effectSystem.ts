// effectSystem.ts - Advanced visual effects system

import { 
  VisualEffect, 
  ShieldEffect, 
  WarpEffect, 
  EngineEffect, 
  EffectType, 
  Vector2D, 
  IRenderer,
  ICamera
} from './types';

export class EffectSystem {
  private effects: Map<string, VisualEffect> = new Map();
  private nextEffectId: number = 1;

  /**
   * Create a new visual effect
   */
  public createEffect(type: EffectType, position: Vector2D, options: any = {}): string {
    const id = `effect_${this.nextEffectId++}`;
    let effect: VisualEffect;

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

  /**
   * Update all effects
   */
  public update(deltaTime: number): void {
    const effectsToRemove: string[] = [];

    this.effects.forEach((effect, id) => {
      effect.timeRemaining -= deltaTime;
      effect.animationFrame += deltaTime * 60; // 60 FPS animation

      if (effect.timeRemaining <= 0) {
        effectsToRemove.push(id);
      } else {
        this.updateEffect(effect, deltaTime);
      }
    });

    // Remove expired effects
    effectsToRemove.forEach(id => this.effects.delete(id));
  }

  /**
   * Render all effects
   */
  public render(renderer: IRenderer, camera: ICamera): void {
    this.effects.forEach(effect => {
      this.renderEffect(effect, renderer, camera);
    });
  }

  /**
   * Remove effect by ID
   */
  public removeEffect(id: string): void {
    this.effects.delete(id);
  }

  /**
   * Clear all effects
   */
  public clearAllEffects(): void {
    this.effects.clear();
  }

  // Effect Creation Methods

  private createShieldHitEffect(id: string, position: Vector2D, options: any): ShieldEffect {
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

  private createShieldRegenEffect(id: string, position: Vector2D, options: any): ShieldEffect {
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

  private createEngineEffect(id: string, position: Vector2D, options: any): EngineEffect {
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

  private createManeuveringEffect(id: string, position: Vector2D, options: any): EngineEffect {
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

  private createWarpChargeEffect(id: string, position: Vector2D, options: any): WarpEffect {
    return {
      id,
      type: EffectType.WARP_CHARGE,
      position: { ...position },
      duration: 3.0,
      timeRemaining: 3.0,
      intensity: 0.0,
      color: '#505050',
      size: 10,
      animationFrame: 0,
      phase: 'charging',
      bubbleRadius: 10,
      distortionLevel: 0.0
    };
  }

  private createWarpBubbleEffect(id: string, position: Vector2D, options: any): WarpEffect {
    return {
      id,
      type: EffectType.WARP_BUBBLE,
      position: { ...position },
      duration: 2.0,
      timeRemaining: 2.0,
      intensity: 1.0,
      color: '#505050',
      size: 80,
      animationFrame: 0,
      phase: 'bubble',
      bubbleRadius: 80,
      distortionLevel: 0.5
    };
  }

  private createWeaponImpactEffect(id: string, position: Vector2D, options: any): VisualEffect {
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

  private createBasicEffect(id: string, type: EffectType, position: Vector2D, options: any): VisualEffect {
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

  // Effect Update Methods

  private updateEffect(effect: VisualEffect, deltaTime: number): void {
    const progress = 1 - (effect.timeRemaining / effect.duration);

    switch (effect.type) {
      case EffectType.SHIELD_HIT:
        this.updateShieldHitEffect(effect as ShieldEffect, progress, deltaTime);
        break;
      case EffectType.SHIELD_REGENERATE:
        this.updateShieldRegenEffect(effect as ShieldEffect, progress, deltaTime);
        break;
      case EffectType.ENGINE_THRUST:
        this.updateEngineEffect(effect as EngineEffect, progress, deltaTime);
        break;
      case EffectType.WARP_CHARGE:
        this.updateWarpChargeEffect(effect as WarpEffect, progress, deltaTime);
        break;
      case EffectType.WARP_BUBBLE:
        this.updateWarpBubbleEffect(effect as WarpEffect, progress, deltaTime);
        break;
    }
  }

  private updateShieldHitEffect(effect: ShieldEffect, progress: number, deltaTime: number): void {
    // Fade out intensity
    effect.intensity = Math.max(0, 1.0 - progress * 2);
    
    // Expand ripple size
    effect.size = 50 + progress * 30;
  }

  private updateShieldRegenEffect(effect: ShieldEffect, progress: number, deltaTime: number): void {
    // Pulsing intensity
    effect.intensity = 0.3 + 0.2 * Math.sin(effect.animationFrame * 0.1);
  }

  private updateEngineEffect(effect: EngineEffect, progress: number, deltaTime: number): void {
    // Flickering intensity for realistic engine effect
    effect.intensity = 0.8 + 0.2 * Math.random();
  }

  private updateWarpChargeEffect(effect: WarpEffect, progress: number, deltaTime: number): void {
    effect.intensity = progress;
    effect.bubbleRadius = 10 + progress * 70;
    
    if (progress > 0.8) {
      effect.phase = 'bubble';
    }
  }

  private updateWarpBubbleEffect(effect: WarpEffect, progress: number, deltaTime: number): void {
    if (progress < 0.3) {
      effect.phase = 'bubble';
      effect.distortionLevel = progress * 2;
    } else if (progress < 0.7) {
      effect.phase = 'distortion';
      effect.distortionLevel = 0.6 + (progress - 0.3) * 2;
    } else {
      effect.phase = 'collapse';
      effect.bubbleRadius = 80 * (1 - (progress - 0.7) * 3);
      effect.intensity = 1 - (progress - 0.7) * 3;
    }
  }

  // Effect Rendering Methods

  private renderEffect(effect: VisualEffect, renderer: IRenderer, camera: ICamera): void {
    switch (effect.type) {
      case EffectType.SHIELD_HIT:
      case EffectType.SHIELD_REGENERATE:
        this.renderShieldEffect(effect as ShieldEffect, renderer, camera);
        break;
      case EffectType.ENGINE_THRUST:
      case EffectType.MANEUVERING_THRUST:
        this.renderEngineEffect(effect as EngineEffect, renderer, camera);
        break;
      case EffectType.WARP_CHARGE:
      case EffectType.WARP_BUBBLE:
        this.renderWarpEffect(effect as WarpEffect, renderer, camera);
        break;
      case EffectType.WEAPON_IMPACT:
        this.renderWeaponImpact(effect, renderer, camera);
        break;
      default:
        this.renderBasicEffect(effect, renderer, camera);
    }
  }

  private renderShieldEffect(effect: ShieldEffect, renderer: IRenderer, camera: ICamera): void {
    const { position, size, intensity, color } = effect;
    
    if (effect.hexagonPattern) {
      // Render hexagonal shield pattern
      this.renderHexagonalShield(renderer, position, size, intensity, color, effect, camera);
    } else {
      // Render bubble shield
      this.renderBubbleShield(renderer, position, size, intensity, color, camera);
    }
  }

  private renderHexagonalShield(renderer: IRenderer, pos: Vector2D, size: number, intensity: number, color: string, effect: ShieldEffect, camera: ICamera): void {
    const screenPos = camera.worldToScreen(pos.x, pos.y);
    const hexRadius = size / 2;
    const hexCount = 6;
    
    // Draw multiple hexagonal rings
    for (let ring = 0; ring < 3; ring++) {
      const currentRadius = hexRadius + ring * 15;
      const alpha = intensity * (1 - ring * 0.3);
      
      if (alpha <= 0) continue;
      
      // Draw hexagon outline
      const points: Vector2D[] = [];
      for (let i = 0; i <= hexCount; i++) {
        const angle = (i / hexCount) * Math.PI * 2;
        points.push({
          x: screenPos.x + Math.cos(angle) * currentRadius,
          y: screenPos.y + Math.sin(angle) * currentRadius
        });
      }
      
      // Draw hexagon with glow effect
      renderer.strokePath(points, `rgba(80, 80, 80, ${alpha})`, 2);
      
      // Add glow
      renderer.strokePath(points, `rgba(80, 80, 80, ${alpha * 0.3})`, 6);
    }
    
    // Render impact ripple if hit
    if (effect.rippleCenter && effect.type === EffectType.SHIELD_HIT) {
      const rippleScreenPos = camera.worldToScreen(effect.rippleCenter.x, effect.rippleCenter.y);
      const rippleRadius = size * (1 - effect.timeRemaining / effect.duration);
      renderer.strokeCircle(
        rippleScreenPos.x, 
        rippleScreenPos.y, 
        rippleRadius, 
        `rgba(80, 80, 80, ${effect.intensity})`, 
        3
      );
    }
  }

  private renderBubbleShield(renderer: IRenderer, pos: Vector2D, size: number, intensity: number, color: string, camera: ICamera): void {
    const screenPos = camera.worldToScreen(pos.x, pos.y);
    const radius = size / 2;
    
    // Outer glow
    renderer.fillCircle(screenPos.x, screenPos.y, radius + 10, `rgba(0, 170, 255, ${intensity * 0.1})`);
    
    // Main shield bubble
    renderer.strokeCircle(screenPos.x, screenPos.y, radius, `rgba(0, 170, 255, ${intensity * 0.6})`, 2);
    
    // Inner shimmer
    renderer.strokeCircle(screenPos.x, screenPos.y, radius - 5, `rgba(255, 255, 255, ${intensity * 0.3})`, 1);
  }

  private renderEngineEffect(effect: EngineEffect, renderer: IRenderer, camera: ICamera): void {
    const { position, intensity, thrustVector, exhaustLength, particleCount } = effect;
    const screenPos = camera.worldToScreen(position.x, position.y);
    
    // Calculate exhaust direction
    const thrustAngle = Math.atan2(thrustVector.y, thrustVector.x);
    
    // Render main exhaust plume
    for (let i = 0; i < particleCount; i++) {
      const particleDistance = (i / particleCount) * exhaustLength;
      const spread = (i / particleCount) * 0.3; // Expanding cone
      
      const baseX = screenPos.x + Math.cos(thrustAngle) * particleDistance;
      const baseY = screenPos.y + Math.sin(thrustAngle) * particleDistance;
      
      // Add random spread
      const spreadAngle = thrustAngle + (Math.random() - 0.5) * spread;
      const spreadDistance = Math.random() * 10;
      
      const x = baseX + Math.cos(spreadAngle) * spreadDistance;
      const y = baseY + Math.sin(spreadAngle) * spreadDistance;
      
      // Color gradient from hot to cool
      const heatRatio = 1 - (i / particleCount);
      const alpha = intensity * heatRatio * (0.5 + Math.random() * 0.5);
      
      let color: string;
      if (heatRatio > 0.7) {
        color = `rgba(255, 255, 255, ${alpha})`; // White hot
      } else if (heatRatio > 0.4) {
        color = `rgba(255, 200, 0, ${alpha})`; // Yellow
      } else {
        color = `rgba(255, 100, 0, ${alpha})`; // Orange/Red
      }
      
      const size = 2 + heatRatio * 3;
      renderer.fillCircle(x, y, size, color);
    }
  }

  private renderWarpEffect(effect: WarpEffect, renderer: IRenderer, camera: ICamera): void {
    const { position, bubbleRadius, distortionLevel, phase, intensity } = effect;
    
    switch (phase) {
      case 'charging':
        this.renderWarpCharging(renderer, position, bubbleRadius, intensity, camera);
        break;
      case 'bubble':
        this.renderWarpBubble(renderer, position, bubbleRadius, distortionLevel, intensity, camera);
        break;
      case 'distortion':
        this.renderWarpDistortion(renderer, position, bubbleRadius, distortionLevel, intensity, camera);
        break;
      case 'collapse':
        this.renderWarpCollapse(renderer, position, bubbleRadius, intensity, camera);
        break;
    }
  }

  private renderWarpCharging(renderer: IRenderer, pos: Vector2D, radius: number, intensity: number, camera: ICamera): void {
    const screenPos = camera.worldToScreen(pos.x, pos.y);
    // Pulsing energy buildup
    const pulseIntensity = intensity * (0.5 + 0.5 * Math.sin(Date.now() * 0.01));
    
    renderer.strokeCircle(screenPos.x, screenPos.y, radius, `rgba(255, 255, 255, ${pulseIntensity})`, 2);
    renderer.fillCircle(screenPos.x, screenPos.y, radius * 0.3, `rgba(255, 255, 255, ${pulseIntensity * 0.3})`);
  }

  private renderWarpBubble(renderer: IRenderer, pos: Vector2D, radius: number, distortion: number, intensity: number, camera: ICamera): void {
    const screenPos = camera.worldToScreen(pos.x, pos.y);
    // Semi-transparent warp bubble
    renderer.strokeCircle(screenPos.x, screenPos.y, radius, `rgba(170, 204, 255, ${intensity * 0.8})`, 3);
    
    // Inner shimmer
    for (let i = 0; i < 3; i++) {
      const innerRadius = radius * (0.7 + i * 0.1);
      const alpha = intensity * 0.2 * (1 - i * 0.3);
      renderer.strokeCircle(screenPos.x, screenPos.y, innerRadius, `rgba(255, 255, 255, ${alpha})`, 1);
    }
  }

  private renderWarpDistortion(renderer: IRenderer, pos: Vector2D, radius: number, distortion: number, intensity: number, camera: ICamera): void {
    const screenPos = camera.worldToScreen(pos.x, pos.y);
    // Render gravitational lensing effect approximation
    const rings = 5;
    for (let i = 0; i < rings; i++) {
      const ringRadius = radius * (0.5 + i * 0.3) * distortion;
      const alpha = intensity * 0.6 * (1 - i * 0.15);
      
      // Distorted rings
      renderer.strokeCircle(screenPos.x, screenPos.y, ringRadius, `rgba(255, 255, 0, ${alpha})`, 2);
      
      // Add chromatic aberration effect
      renderer.strokeCircle(screenPos.x - 1, screenPos.y, ringRadius, `rgba(255, 0, 0, ${alpha * 0.5})`, 1);
      renderer.strokeCircle(screenPos.x + 1, screenPos.y, ringRadius, `rgba(0, 0, 255, ${alpha * 0.5})`, 1);
    }
  }

  private renderWarpCollapse(renderer: IRenderer, pos: Vector2D, radius: number, intensity: number, camera: ICamera): void {
    if (radius <= 0 || intensity <= 0) return;
    
    const screenPos = camera.worldToScreen(pos.x, pos.y);
    // Collapsing black hole effect
    renderer.fillCircle(screenPos.x, screenPos.y, Math.max(1, radius * 0.1), '#000000');
    
    // Accretion disk
    const diskRadius = radius * 0.5;
    for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
      const x = screenPos.x + Math.cos(angle) * diskRadius;
      const y = screenPos.y + Math.sin(angle) * diskRadius * 0.3; // Flattened disk
      
      const alpha = intensity * 0.8;
      renderer.fillCircle(x, y, 2, `rgba(255, 150, 0, ${alpha})`);
    }
  }

  private renderWeaponImpact(effect: VisualEffect, renderer: IRenderer, camera: ICamera): void {
    const { position, size, intensity, color } = effect;
    const screenPos = camera.worldToScreen(position.x, position.y);
    const progress = 1 - (effect.timeRemaining / effect.duration);
    
    // Expanding explosion
    const currentSize = size * (1 + progress * 2);
    const alpha = intensity * (1 - progress);
    
    renderer.fillCircle(screenPos.x, screenPos.y, currentSize, `rgba(255, 255, 0, ${alpha})`);
    renderer.fillCircle(screenPos.x, screenPos.y, currentSize * 0.7, `rgba(255, 150, 0, ${alpha})`);
    renderer.fillCircle(screenPos.x, screenPos.y, currentSize * 0.4, `rgba(255, 255, 255, ${alpha})`);
  }

  private renderBasicEffect(effect: VisualEffect, renderer: IRenderer, camera: ICamera): void {
    const { position, size, intensity, color } = effect;
    const screenPos = camera.worldToScreen(position.x, position.y);
    renderer.fillCircle(screenPos.x, screenPos.y, size, color);
  }
}