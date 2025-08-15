// celestial.ts - Enhanced 16-bit pixel art celestial bodies with realistic surfaces

import {
  ICelestialBody,
  IRenderer,
  ICamera,
  Vector2D,
  CelestialBodyType,
  SurfaceFeature
} from './types';
import { PhysicsEngine, SeededRandom } from './utils';

export class CelestialBody implements ICelestialBody {
  public position: Vector2D;
  public velocity: Vector2D = { x: 0, y: 0 };
  public angle: number = 0;
  public radius: number;
  public active: boolean = true;
  public type: CelestialBodyType;
  public name: string;
  public mass: number;
  public color: string;
  public rotationSpeed: number;
  public rotation: number = 0;

  public orbitDistance: number = 0;
  public orbitSpeed: number = 0;
  public orbitAngle: number = 0;
  public orbitCenter: Vector2D | null = null;
  public orbitEccentricity: number = 0;
  public periapsis: number = 0;
  public apoapsis: number = 0;
  
  // Enhanced orbital parameters for realistic mechanics
  public semiMajorAxis: number = 0;
  public meanAnomaly: number = 0;
  public meanMotion: number = 0;
  public centralBodyMass: number = 0;

  public hasAtmosphere: boolean = false;
  public atmosphereColor: string | null = null;
  public atmosphereRadius: number = 0;
  public surfaceFeatures: SurfaceFeature[] = [];
  
  // 16-bit surface data
  private pixelData: Array<Array<{r: number, g: number, b: number}>> = [];
  private surfaceNoise: Array<Array<number>> = [];
  private detailFeatures: Array<{x: number, y: number, size: number, type: string, color: string}> = [];
  private craterData: Array<{x: number, y: number, size: number, depth: number}> = [];
  private elevationMap: Array<Array<number>> = [];

  constructor(
    x: number,
    y: number,
    radius: number,
    type: CelestialBodyType,
    name: string,
    mass: number = 100,
    color: string = '#888888'
  ) {
    this.position = { x, y };
    this.radius = radius;
    this.type = type;
    this.name = name;
    this.mass = mass;
    this.color = color;
    this.rotationSpeed = 0.0005 + Math.random() * 0.001; // Slower, smoother rotation
    
    // Generate 16-bit surface texture
    this.generate16BitSurface();
    
    // Set atmosphere for planets
    if (type === CelestialBodyType.PLANET && Math.random() < 0.6) {
      this.hasAtmosphere = true;
      this.atmosphereRadius = radius * (1.15 + Math.random() * 0.3);
      this.generateAtmosphereColor();
    }
  }

  private generate16BitSurface(): void {
    const texSize = Math.floor(this.radius * 2);
    const random = new SeededRandom(this.name.charCodeAt(0) * 1337);
    
    // Initialize arrays
    this.pixelData = [];
    this.surfaceNoise = [];
    this.elevationMap = [];
    this.detailFeatures = [];
    this.craterData = [];
    
    for (let x = 0; x < texSize; x++) {
      this.pixelData[x] = [];
      this.surfaceNoise[x] = [];
      this.elevationMap[x] = [];
      for (let y = 0; y < texSize; y++) {
        this.pixelData[x][y] = {r: 0, g: 0, b: 0};
        this.surfaceNoise[x][y] = 0;
        this.elevationMap[x][y] = 0;
      }
    }
    
    this.generateBaseTexture(texSize, random);
    this.generateSurfaceFeatures(texSize, random);
    this.generateCraters(texSize, random);
    this.applyLighting(texSize);
  }

  private generateBaseTexture(size: number, random: SeededRandom): void {
    const baseColors = this.getBaseColorPalette();
    
    // Generate noise-based terrain
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        const centerX = size / 2;
        const centerY = size / 2;
        const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        
        if (dist <= this.radius) {
          // Multi-octave noise for realistic terrain
          let noise = 0;
          let amplitude = 1;
          let frequency = 0.02;
          
          for (let octave = 0; octave < 4; octave++) {
            noise += this.perlinNoise(x * frequency, y * frequency, random) * amplitude;
            amplitude *= 0.5;
            frequency *= 2;
          }
          
          this.surfaceNoise[x][y] = noise;
          this.elevationMap[x][y] = noise;
          
          // Choose base color based on noise and body type
          const colorIndex = Math.floor((noise + 1) * 0.5 * (baseColors.length - 1));
          const baseColor = baseColors[Math.max(0, Math.min(colorIndex, baseColors.length - 1))];
          
          // Add variation and dithering
          const variation = random.next() * 40 - 20;
          this.pixelData[x][y] = {
            r: Math.max(0, Math.min(255, baseColor.r + variation)),
            g: Math.max(0, Math.min(255, baseColor.g + variation)),
            b: Math.max(0, Math.min(255, baseColor.b + variation))
          };
        }
      }
    }
  }

  private generateSurfaceFeatures(size: number, random: SeededRandom): void {
    const featureCount = 8 + Math.floor(random.next() * 15);
    
    for (let i = 0; i < featureCount; i++) {
      const x = random.next() * size;
      const y = random.next() * size;
      const featureSize = 5 + random.next() * 20;
      
      let featureType = 'mountain';
      let featureColor = '#8B7765';
      
      switch (this.type) {
        case CelestialBodyType.PLANET:
          const planetFeatureTypes = ['mountain', 'ocean', 'desert', 'forest', 'ice', 'volcanic'];
          featureType = planetFeatureTypes[Math.floor(random.next() * planetFeatureTypes.length)];
          featureColor = this.getPlanetFeatureColor(featureType);
          break;
        case CelestialBodyType.MOON:
          const moonFeatureTypes = ['crater', 'highland', 'maria', 'ridge'];
          featureType = moonFeatureTypes[Math.floor(random.next() * moonFeatureTypes.length)];
          featureColor = this.getMoonFeatureColor(featureType);
          break;
        case CelestialBodyType.STAR:
          const starFeatureTypes = ['sunspot', 'flare', 'prominence', 'granule'];
          featureType = starFeatureTypes[Math.floor(random.next() * starFeatureTypes.length)];
          featureColor = this.getStarFeatureColor(featureType);
          break;
        case CelestialBodyType.ASTEROID:
          const asteroidFeatureTypes = ['metal_vein', 'rock_formation', 'impact_site'];
          featureType = asteroidFeatureTypes[Math.floor(random.next() * asteroidFeatureTypes.length)];
          featureColor = this.getAsteroidFeatureColor(featureType);
          break;
      }
      
      this.detailFeatures.push({
        x: x,
        y: y,
        size: featureSize,
        type: featureType,
        color: featureColor
      });
    }
  }

  private generateCraters(size: number, random: SeededRandom): void {
    if (this.type === CelestialBodyType.STAR) return;
    
    const craterCount = this.type === CelestialBodyType.MOON ? 8 + Math.floor(random.next() * 12) : 
                       this.type === CelestialBodyType.PLANET ? 3 + Math.floor(random.next() * 6) :
                       this.type === CelestialBodyType.ASTEROID ? 5 + Math.floor(random.next() * 8) : 0;
    
    for (let i = 0; i < craterCount; i++) {
      const x = random.next() * size;
      const y = random.next() * size;
      const craterSize = 3 + random.next() * 15;
      const depth = 0.2 + random.next() * 0.8;
      
      this.craterData.push({
        x: x,
        y: y,
        size: craterSize,
        depth: depth
      });
    }
  }

  private applyLighting(size: number): void {
    const lightDirection = { x: 1, y: -1 }; // Light from top-right
    const lightIntensity = 1.0;
    
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        const centerX = size / 2;
        const centerY = size / 2;
        const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        
        if (dist <= this.radius) {
          // Calculate surface normal from elevation
          const elevation = this.elevationMap[x][y];
          let normalX = 0, normalY = 0;
          
          if (x > 0 && x < size - 1) {
            normalX = this.elevationMap[x - 1][y] - this.elevationMap[x + 1][y];
          }
          if (y > 0 && y < size - 1) {
            normalY = this.elevationMap[x][y - 1] - this.elevationMap[x][y + 1];
          }
          
          // Spherical lighting
          const sphereNormalX = (x - centerX) / this.radius;
          const sphereNormalY = (y - centerY) / this.radius;
          const sphereNormalZ = Math.sqrt(Math.max(0, 1 - sphereNormalX ** 2 - sphereNormalY ** 2));
          
          // Combine surface and sphere normals
          const finalNormalX = sphereNormalX + normalX * 0.3;
          const finalNormalY = sphereNormalY + normalY * 0.3;
          const finalNormalZ = sphereNormalZ;
          
          // Calculate lighting
          const lightDot = Math.max(0, finalNormalX * lightDirection.x + finalNormalY * lightDirection.y + finalNormalZ * 0.5);
          const lightFactor = 0.3 + lightDot * 0.7; // Ambient + diffuse
          
          // Apply terminator (day/night) for realistic lighting
          const terminatorFactor = Math.max(0, Math.min(1, (sphereNormalX + 0.3) * 2));
          const finalLightFactor = lightFactor * terminatorFactor;
          
          // Apply lighting to pixel
          this.pixelData[x][y].r = Math.floor(this.pixelData[x][y].r * finalLightFactor);
          this.pixelData[x][y].g = Math.floor(this.pixelData[x][y].g * finalLightFactor);
          this.pixelData[x][y].b = Math.floor(this.pixelData[x][y].b * finalLightFactor);
        }
      }
    }
  }

  private getBaseColorPalette(): Array<{r: number, g: number, b: number}> {
    switch (this.type) {
      case CelestialBodyType.STAR:
        return [
          {r: 255, g: 255, b: 200}, // White hot
          {r: 255, g: 220, b: 150}, // Yellow
          {r: 255, g: 180, b: 100}, // Orange
          {r: 255, g: 140, b: 80},  // Red-orange
          {r: 255, g: 100, b: 60}   // Deep red
        ];
      case CelestialBodyType.PLANET:
        return [
          {r: 100, g: 150, b: 200}, // Ocean blue
          {r: 120, g: 180, b: 120}, // Forest green  
          {r: 180, g: 140, b: 100}, // Desert tan
          {r: 140, g: 120, b: 100}, // Rocky brown
          {r: 200, g: 200, b: 200}, // Ice white
          {r: 150, g: 100, b: 80},  // Mountain gray-brown
          {r: 200, g: 120, b: 80}   // Volcanic red-orange
        ];
      case CelestialBodyType.MOON:
        return [
          {r: 180, g: 180, b: 170}, // Light gray
          {r: 150, g: 150, b: 140}, // Medium gray
          {r: 120, g: 120, b: 110}, // Dark gray
          {r: 100, g: 100, b: 90},  // Very dark gray
          {r: 140, g: 130, b: 120}  // Brownish gray
        ];
      case CelestialBodyType.ASTEROID:
        return [
          {r: 80, g: 70, b: 60},    // Dark rock
          {r: 120, g: 110, b: 100}, // Light rock
          {r: 150, g: 130, b: 100}, // Iron-rich
          {r: 100, g: 90, b: 80},   // Carbon-rich
          {r: 160, g: 140, b: 120}  // Silicate
        ];
      default:
        return [{r: 128, g: 128, b: 128}];
    }
  }

  private getPlanetFeatureColor(featureType: string): string {
    switch (featureType) {
      case 'mountain': return '#8B7765';
      case 'ocean': return '#4682B4';
      case 'desert': return '#DEB887';
      case 'forest': return '#228B22';
      case 'ice': return '#F0F8FF';
      case 'volcanic': return '#DC143C';
      default: return '#808080';
    }
  }

  private getMoonFeatureColor(featureType: string): string {
    switch (featureType) {
      case 'crater': return '#696969';
      case 'highland': return '#C0C0C0';
      case 'maria': return '#2F4F4F';
      case 'ridge': return '#A9A9A9';
      default: return '#808080';
    }
  }

  private getStarFeatureColor(featureType: string): string {
    switch (featureType) {
      case 'sunspot': return '#8B0000';
      case 'flare': return '#FFD700';
      case 'prominence': return '#FF4500';
      case 'granule': return '#FFA500';
      default: return '#FFFF00';
    }
  }

  private getAsteroidFeatureColor(featureType: string): string {
    switch (featureType) {
      case 'metal_vein': return '#C0C0C0';
      case 'rock_formation': return '#8B4513';
      case 'impact_site': return '#2F2F2F';
      default: return '#696969';
    }
  }

  private generateAtmosphereColor(): void {
    switch (this.type) {
      case CelestialBodyType.PLANET:
        const atmosphereTypes = [
          'rgba(135, 206, 235, 0.3)', // Earth-like blue
          'rgba(255, 165, 0, 0.2)',   // Mars-like orange
          'rgba(255, 255, 224, 0.25)', // Venus-like yellow
          'rgba(138, 43, 226, 0.2)',  // Exotic purple
          'rgba(0, 255, 127, 0.2)'    // Alien green
        ];
        this.atmosphereColor = atmosphereTypes[Math.floor(Math.random() * atmosphereTypes.length)];
        break;
      default:
        this.atmosphereColor = 'rgba(255, 255, 255, 0.1)';
    }
  }

  private perlinNoise(x: number, y: number, random: SeededRandom): number {
    // Simple Perlin-like noise implementation
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    
    const u = this.fade(xf);
    const v = this.fade(yf);
    
    const a = this.grad(random.nextInt() % 256, xf, yf);
    const b = this.grad(random.nextInt() % 256, xf - 1, yf);
    const c = this.grad(random.nextInt() % 256, xf, yf - 1);
    const d = this.grad(random.nextInt() % 256, xf - 1, yf - 1);
    
    const i1 = this.lerp(a, b, u);
    const i2 = this.lerp(c, d, u);
    
    return this.lerp(i1, i2, v);
  }

  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private lerp(a: number, b: number, t: number): number {
    return a + t * (b - a);
  }

  private grad(hash: number, x: number, y: number): number {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  // Realistic orbit setting with proper Kepler mechanics
  public setOrbit(center: Vector2D, distance: number, centralMass: number, startAngle: number = 0, eccentricity: number = 0): void {
    this.orbitCenter = center;
    this.orbitDistance = distance;
    this.orbitEccentricity = Math.min(0.95, eccentricity);
    this.centralBodyMass = centralMass;
    
    // Calculate semi-major axis based on distance (periapsis) and eccentricity
    this.semiMajorAxis = distance / (1 - this.orbitEccentricity);
    this.periapsis = distance;
    this.apoapsis = this.semiMajorAxis * (1 + this.orbitEccentricity);
    
    // Calculate mean motion using Kepler's third law: n = sqrt(GM/a³)
    const G = 0.0008; // Adjusted gravitational constant for smoother motion
    this.meanMotion = Math.sqrt((G * centralMass) / Math.pow(this.semiMajorAxis, 3));
    
    // Set starting position
    this.meanAnomaly = startAngle;
    this.orbitAngle = startAngle;
    
    // Set initial position based on orbit
    this.updateOrbitalPosition();
  }

  private updateOrbitalPosition(): void {
    if (!this.orbitCenter) return;

    // Solve Kepler's equation for eccentric anomaly using Newton-Raphson method
    let eccentricAnomaly = this.meanAnomaly;
    for (let i = 0; i < 5; i++) { // 5 iterations should be enough for game precision
      const delta = eccentricAnomaly - this.orbitEccentricity * Math.sin(eccentricAnomaly) - this.meanAnomaly;
      eccentricAnomaly -= delta / (1 - this.orbitEccentricity * Math.cos(eccentricAnomaly));
    }

    // Calculate true anomaly
    const trueAnomaly = 2 * Math.atan2(
      Math.sqrt(1 + this.orbitEccentricity) * Math.sin(eccentricAnomaly / 2),
      Math.sqrt(1 - this.orbitEccentricity) * Math.cos(eccentricAnomaly / 2)
    );

    // Calculate distance from central body
    const currentDistance = this.semiMajorAxis * (1 - this.orbitEccentricity * Math.cos(eccentricAnomaly));

    // Update position
    this.position.x = this.orbitCenter.x + currentDistance * Math.cos(trueAnomaly);
    this.position.y = this.orbitCenter.y + currentDistance * Math.sin(trueAnomaly);
    
    this.orbitAngle = trueAnomaly;
  }

  public update(deltaTime: number): void {
    // Update rotation (much smoother)
    this.rotation += this.rotationSpeed * deltaTime * 60; // 60fps normalization
    
    // Update orbital position if in orbit
    if (this.orbitCenter) {
      this.meanAnomaly += this.meanMotion * deltaTime * 60; // Smooth orbital motion
      
      // Keep mean anomaly in range [0, 2π]
      if (this.meanAnomaly > Math.PI * 2) {
        this.meanAnomaly -= Math.PI * 2;
      }
      
      this.updateOrbitalPosition();
    }

    // Update surface features rotation for stars (solar activity)
    if (this.type === CelestialBodyType.STAR) {
      this.detailFeatures.forEach(feature => {
        if (feature.type === 'flare' || feature.type === 'prominence') {
          // Animate solar flares
          const time = Date.now() * 0.001;
          feature.size = Math.max(5, feature.size + Math.sin(time + feature.x) * 2);
        }
      });
    }
  }

  public isVisible(camera: ICamera, screenWidth: number, screenHeight: number): boolean {
    const screenPos = camera.worldToScreen(this.position.x, this.position.y);
    const margin = this.radius * camera.zoom + 100;
    
    return screenPos.x > -margin && 
           screenPos.x < screenWidth + margin && 
           screenPos.y > -margin && 
           screenPos.y < screenHeight + margin;
  }

  public render(renderer: IRenderer, camera: ICamera): void {
    if (!this.isVisible(camera, renderer.getWidth(), renderer.getHeight())) {
      return;
    }

    const screenPos = camera.worldToScreen(this.position.x, this.position.y);

    renderer.save();
    renderer.translate(screenPos.x, screenPos.y);

    if (this.orbitCenter && this.type !== CelestialBodyType.STAR) {
      this.renderOrbitPath(renderer, camera);
    }

    // Render 16-bit celestial body
    this.render16BitBody(renderer, camera);

    renderer.restore();

    // Draw name for large objects
    if ((this.type === CelestialBodyType.STAR || this.type === CelestialBodyType.PLANET) && 
        Math.abs(screenPos.x - renderer.getWidth()/2) < 200 && 
        Math.abs(screenPos.y - renderer.getHeight()/2) < 200) {
      renderer.drawText(this.name, screenPos.x, screenPos.y + this.radius * camera.zoom + 25, '#e0e3e6', '10px "Big Apple 3PM", monospace');
    }
  }

  private renderOrbitPath(renderer: IRenderer, camera: ICamera): void {
    if (!this.orbitCenter) return;

    const ctx = renderer.getContext();
    const centerScreen = camera.worldToScreen(this.orbitCenter.x, this.orbitCenter.y);
    const currentScreen = camera.worldToScreen(this.position.x, this.position.y);

    ctx.strokeStyle = 'rgba(162, 170, 178, 0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    
    // Draw elliptical orbit
    ctx.beginPath();
    const radiusX = this.semiMajorAxis * camera.zoom;
    const radiusY = this.semiMajorAxis * camera.zoom * Math.sqrt(1 - this.orbitEccentricity ** 2);
    
    ctx.ellipse(centerScreen.x, centerScreen.y, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  private render16BitBody(renderer: IRenderer, camera: ICamera): void {
    const ctx = renderer.getContext();
    const scaledRadius = this.radius * camera.zoom;
    
    // Don't render if too small
    if (scaledRadius < 8) {
      // Render as simple pixel for distant objects
      ctx.fillStyle = this.color;
      ctx.fillRect(-2, -2, 4, 4);
      return;
    }

    // Turn off smoothing for pixel art
    ctx.imageSmoothingEnabled = false;
    
    const pixelSize = Math.max(1, Math.floor(scaledRadius / this.radius));
    const size = Math.floor(scaledRadius * 2);
    
    // Render atmosphere first if present
    if (this.hasAtmosphere && this.atmosphereColor) {
      ctx.fillStyle = this.atmosphereColor;
      ctx.beginPath();
      ctx.arc(0, 0, this.atmosphereRadius * camera.zoom, 0, Math.PI * 2);
      ctx.fill();
    }

    // Render 16-bit surface texture
    ctx.save();
    ctx.rotate(this.rotation);
    
    const textureSize = this.pixelData.length;
    for (let x = 0; x < textureSize; x++) {
      for (let y = 0; y < textureSize; y++) {
        const centerX = textureSize / 2;
        const centerY = textureSize / 2;
        const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        
        if (dist <= this.radius) {
          const pixel = this.pixelData[x][y];
          const screenX = (x - centerX) * pixelSize;
          const screenY = (y - centerY) * pixelSize;
          
          ctx.fillStyle = `rgb(${pixel.r}, ${pixel.g}, ${pixel.b})`;
          ctx.fillRect(screenX, screenY, pixelSize, pixelSize);
        }
      }
    }

    // Render surface features
    this.renderSurfaceDetails(ctx, camera);
    
    // Add stellar corona for stars
    if (this.type === CelestialBodyType.STAR) {
      this.renderStellarCorona(ctx, camera);
    }
    
    ctx.restore();
    
    // Turn smoothing back on
    ctx.imageSmoothingEnabled = true;
  }

  private renderSurfaceDetails(ctx: CanvasRenderingContext2D, camera: ICamera): void {
    const pixelSize = Math.max(1, Math.floor((this.radius * camera.zoom) / this.radius));
    
    // Render detail features
    this.detailFeatures.forEach(feature => {
      const featureX = (feature.x - this.radius) * pixelSize;
      const featureY = (feature.y - this.radius) * pixelSize;
      const dist = Math.sqrt(featureX ** 2 + featureY ** 2);
      
      if (dist <= this.radius * pixelSize) {
        ctx.fillStyle = feature.color;
        const featureSize = Math.max(2, feature.size * pixelSize / 8);
        
        // Different shapes for different feature types
        if (feature.type === 'crater') {
          ctx.beginPath();
          ctx.arc(featureX, featureY, featureSize, 0, Math.PI * 2);
          ctx.fill();
          // Dark center for crater
          ctx.fillStyle = '#2F2F2F';
          ctx.beginPath();
          ctx.arc(featureX, featureY, featureSize * 0.3, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(featureX - featureSize/2, featureY - featureSize/2, featureSize, featureSize);
        }
      }
    });

    // Render craters
    this.craterData.forEach(crater => {
      const craterX = (crater.x - this.radius) * pixelSize;
      const craterY = (crater.y - this.radius) * pixelSize;
      const dist = Math.sqrt(craterX ** 2 + craterY ** 2);
      
      if (dist <= this.radius * pixelSize) {
        const craterSize = Math.max(3, crater.size * pixelSize / 4);
        
        // Crater rim (lighter)
        ctx.fillStyle = 'rgba(200, 200, 200, 0.8)';
        ctx.beginPath();
        ctx.arc(craterX, craterY, craterSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Crater interior (darker)
        ctx.fillStyle = 'rgba(50, 50, 50, 0.9)';
        ctx.beginPath();
        ctx.arc(craterX, craterY, craterSize * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  private renderStellarCorona(ctx: CanvasRenderingContext2D, camera: ICamera): void {
    const coronaRadius = this.radius * camera.zoom * 1.2;
    
    // Create radial gradient for corona
    const gradient = ctx.createRadialGradient(0, 0, this.radius * camera.zoom, 0, 0, coronaRadius);
    gradient.addColorStop(0, 'rgba(255, 255, 200, 0.0)');
    gradient.addColorStop(0.7, 'rgba(255, 200, 100, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 150, 50, 0.1)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, coronaRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Add solar flares
    const time = Date.now() * 0.001;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + time * 0.1;
      const flareLength = (20 + Math.sin(time + i) * 10) * camera.zoom;
      const flareX = Math.cos(angle) * this.radius * camera.zoom;
      const flareY = Math.sin(angle) * this.radius * camera.zoom;
      
      ctx.strokeStyle = `rgba(255, 255, 200, ${0.3 + Math.sin(time + i) * 0.2})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(flareX, flareY);
      ctx.lineTo(flareX + Math.cos(angle) * flareLength, flareY + Math.sin(angle) * flareLength);
      ctx.stroke();
    }
  }

  private lightenColor(color: string, factor: number): string {
    const hex = color.replace('#', '');
    const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + Math.floor(factor * 255));
    const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + Math.floor(factor * 255));
    const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + Math.floor(factor * 255));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  private darkenColor(color: string, factor: number): string {
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - Math.floor(factor * 255));
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - Math.floor(factor * 255));
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - Math.floor(factor * 255));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  private adjustBrightness(color: string, intensity: number): string {
    if (color.includes('rgba')) return color; // Skip rgba colors
    const hex = color.replace('#', '');
    const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) * intensity));
    const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) * intensity));
    const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) * intensity));
    return `#${Math.floor(r).toString(16).padStart(2, '0')}${Math.floor(g).toString(16).padStart(2, '0')}${Math.floor(b).toString(16).padStart(2, '0')}`;
  }

  // Simple noise function for terrain generation
  private noise(x: number, y: number, seed: number): number {
    const n = Math.sin(x * 12.9898 + y * 78.233 + seed * 37.719) * 43758.5453;
    return (n - Math.floor(n)) * 2 - 1; // Return value between -1 and 1
  }

  private renderGeneric(renderer: IRenderer): void {
    renderer.drawCircle(0, 0, this.radius, this.color, true);
  }
}