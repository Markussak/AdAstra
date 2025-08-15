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
      duration: 4.0, // Longer charge time for dramatic effect
      timeRemaining: 4.0,
      intensity: 0.0,
      color: '#000000', // Black hole core
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

  private createWarpBubbleEffect(id: string, position: Vector2D, options: any): WarpEffect {
    return {
      id,
      type: EffectType.WARP_BUBBLE,
      position: { ...position },
      duration: 3.0, // Longer warp effect
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
    // Gradually build up the black hole effect
    effect.intensity = Math.pow(progress, 2); // Exponential buildup
    effect.bubbleRadius = 20 + progress * 80;
    effect.accretionDiskRadius = progress * 120;
    effect.gravitationalLensing = progress * 0.5;
    effect.spacetimeDistortion = progress * 0.8;
    
    // Transition to full black hole at 90% charge
    if (progress > 0.9) {
      effect.phase = 'blackhole';
    }
  }

  private updateWarpBubbleEffect(effect: WarpEffect, progress: number, deltaTime: number): void {
    if (progress < 0.2) {
      // Initial black hole formation
      effect.phase = 'blackhole';
      effect.intensity = 1.0;
      effect.accretionDiskRadius = 200 + progress * 50;
      effect.gravitationalLensing = 1.0;
      effect.spacetimeDistortion = 1.0 + progress * 0.5;
    } else if (progress < 0.8) {
      // Stable black hole with maximum distortion
      effect.phase = 'distortion';
      effect.accretionDiskRadius = 250 + Math.sin((progress - 0.2) * 20) * 30;
      effect.gravitationalLensing = 1.0 + Math.sin((progress - 0.2) * 15) * 0.3;
      effect.spacetimeDistortion = 1.5 + Math.sin((progress - 0.2) * 12) * 0.2;
    } else {
      // Black hole collapse
      effect.phase = 'collapse';
      const collapseProgress = (progress - 0.8) / 0.2;
      effect.bubbleRadius = 150 * (1 - collapseProgress);
      effect.accretionDiskRadius = 250 * (1 - collapseProgress);
      effect.intensity = 1 - collapseProgress;
      effect.gravitationalLensing = (1 - collapseProgress) * 1.3;
      effect.spacetimeDistortion = (1 - collapseProgress) * 1.7;
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

  private renderWarpCharging(renderer: IRenderer, pos: Vector2D, radius: number, intensity: number, accretionRadius: number, lensing: number, camera: ICamera): void {
    const screenPos = camera.worldToScreen(pos.x, pos.y);
    const ctx = renderer.getContext();
    
    // Building energy distortion field
    if (intensity > 0.1) {
      ctx.save();
      
      // Pulsing gravitational distortion
      const pulseIntensity = intensity * (0.7 + 0.3 * Math.sin(Date.now() * 0.008));
      
      // Early accretion disk formation
      if (accretionRadius > 30) {
        this.renderAccretionDisk(ctx, screenPos, accretionRadius, intensity * 0.6);
      }
      
      // Space distortion rings
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
      
      // Central energy buildup
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

  private renderBlackHole(renderer: IRenderer, pos: Vector2D, radius: number, accretionRadius: number, lensing: number, distortion: number, intensity: number, camera: ICamera): void {
    const screenPos = camera.worldToScreen(pos.x, pos.y);
    const ctx = renderer.getContext();
    
    ctx.save();
    
    // Render space-time distortion field first
    this.renderSpacetimeDistortion(ctx, screenPos, radius * 2, distortion, intensity);
    
    // Render accretion disk
    this.renderAccretionDisk(ctx, screenPos, accretionRadius, intensity);
    
    // Render gravitational lensing effect
    this.renderGravitationalLensing(ctx, screenPos, radius * 1.5, lensing, intensity);
    
    // Render the black hole event horizon
    this.renderEventHorizon(ctx, screenPos, radius * 0.6, intensity);
    
    // Render photon sphere
    ctx.strokeStyle = `rgba(255, 255, 255, ${intensity * 0.3})`;
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 4]);
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, radius * 0.9, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    
    ctx.restore();
  }

  private renderBlackHoleDistortion(renderer: IRenderer, pos: Vector2D, radius: number, accretionRadius: number, lensing: number, distortion: number, intensity: number, camera: ICamera): void {
    this.renderBlackHole(renderer, pos, radius, accretionRadius, lensing, distortion, intensity, camera);
    
    const screenPos = camera.worldToScreen(pos.x, pos.y);
    const ctx = renderer.getContext();
    
    // Additional distortion effects for maximum warp
    ctx.save();
    
    // Intense gravitational waves
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

  private renderBlackHoleCollapse(renderer: IRenderer, pos: Vector2D, radius: number, accretionRadius: number, lensing: number, intensity: number, camera: ICamera): void {
    const screenPos = camera.worldToScreen(pos.x, pos.y);
    const ctx = renderer.getContext();
    
    ctx.save();
    
    // Collapsing accretion disk
    if (accretionRadius > 10) {
      this.renderAccretionDisk(ctx, screenPos, accretionRadius, intensity * 0.8);
    }
    
    // Fading event horizon
    this.renderEventHorizon(ctx, screenPos, radius * 0.6, intensity);
    
    // Final gravitational wave burst
    const burstRadius = radius * 3;
    const burstAlpha = intensity * 0.6;
    
    ctx.strokeStyle = `rgba(255, 255, 255, ${burstAlpha})`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, burstRadius, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.restore();
  }

  private renderAccretionDisk(ctx: CanvasRenderingContext2D, center: Vector2D, radius: number, intensity: number): void {
    const time = Date.now() * 0.002;
    
    // Create swirling accretion disk with multiple particle streams
    for (let ring = 0; ring < 8; ring++) {
      const ringRadius = radius * 0.4 + ring * (radius * 0.6) / 8;
      const particlesInRing = Math.floor(ringRadius * 0.3);
      
      for (let i = 0; i < particlesInRing; i++) {
        const angle = (i / particlesInRing) * Math.PI * 2 + time * (2 - ring * 0.2);
        const x = center.x + Math.cos(angle) * ringRadius;
        const y = center.y + Math.sin(angle) * ringRadius * 0.3; // Flatten the disk
        
        // Color based on temperature (closer = hotter)
        const temp = 1 - (ring / 8);
        const r = Math.floor(255 * temp);
        const g = Math.floor(200 * temp * 0.7);
        const b = Math.floor(100 * temp * 0.3);
        const alpha = intensity * (0.8 - ring * 0.1);
        
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        
        // Particle size based on distance and intensity
        const particleSize = Math.max(1, (2 - ring * 0.2) * intensity);
        ctx.fillRect(x - particleSize/2, y - particleSize/2, particleSize, particleSize);
        
        // Add some bright hot spots
        if (Math.random() < 0.05 * intensity) {
          ctx.fillStyle = `rgba(255, 255, 200, ${alpha * 0.8})`;
          ctx.fillRect(x - 1, y - 1, 2, 2);
        }
      }
    }
  }

  private renderEventHorizon(ctx: CanvasRenderingContext2D, center: Vector2D, radius: number, intensity: number): void {
    // Perfect black circle for the event horizon
    const gradient = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, radius);
    gradient.addColorStop(0, '#000000');
    gradient.addColorStop(0.8, '#000000');
    gradient.addColorStop(1, `rgba(0, 0, 0, ${intensity * 0.9})`);
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Event horizon edge glow
    ctx.strokeStyle = `rgba(100, 100, 200, ${intensity * 0.6})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  private renderGravitationalLensing(ctx: CanvasRenderingContext2D, center: Vector2D, radius: number, lensing: number, intensity: number): void {
    // Create gravitational lensing distortion rings
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
    
    // Light bending effects
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

  private renderSpacetimeDistortion(ctx: CanvasRenderingContext2D, center: Vector2D, radius: number, distortion: number, intensity: number): void {
    // Create grid distortion to show spacetime curvature
    const gridSize = 40;
    const time = Date.now() * 0.001;
    
    ctx.strokeStyle = `rgba(100, 150, 200, ${intensity * distortion * 0.2})`;
    ctx.lineWidth = 1;
    
    // Distorted grid lines
    for (let x = -radius; x <= radius; x += gridSize) {
      ctx.beginPath();
      for (let y = -radius; y <= radius; y += 5) {
        const dist = Math.sqrt(x*x + y*y);
        if (dist < radius) {
          const distortionFactor = Math.max(0, 1 - dist / radius);
          const warpX = x + Math.sin(time + y * 0.01) * distortion * distortionFactor * 20;
          const warpY = y + Math.cos(time + x * 0.01) * distortion * distortionFactor * 15;
          
          if (y === -radius) {
            ctx.moveTo(center.x + warpX, center.y + warpY);
          } else {
            ctx.lineTo(center.x + warpX, center.y + warpY);
          }
        }
      }
      ctx.stroke();
    }
    
    for (let y = -radius; y <= radius; y += gridSize) {
      ctx.beginPath();
      for (let x = -radius; x <= radius; x += 5) {
        const dist = Math.sqrt(x*x + y*y);
        if (dist < radius) {
          const distortionFactor = Math.max(0, 1 - dist / radius);
          const warpX = x + Math.sin(time + y * 0.01) * distortion * distortionFactor * 20;
          const warpY = y + Math.cos(time + x * 0.01) * distortion * distortionFactor * 15;
          
          if (x === -radius) {
            ctx.moveTo(center.x + warpX, center.y + warpY);
          } else {
            ctx.lineTo(center.x + warpX, center.y + warpY);
          }
        }
      }
      ctx.stroke();
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