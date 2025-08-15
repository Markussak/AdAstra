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
  
  // Enhanced 16-bit surface data for realistic spheres
  private surfaceMap: Array<Array<{r: number, g: number, b: number, elevation: number}>> = [];
  private normalMap: Array<Array<{x: number, y: number, z: number}>> = [];
  private shadowMap: Array<Array<number>> = [];
  private uniqueFeatures: Array<{x: number, y: number, size: number, type: string, intensity: number}> = [];
  private textureResolution: number = 64;

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
    this.rotationSpeed = 0.0002 + Math.random() * 0.0008; // Even slower rotation
    
    // Generate realistic 16-bit sphere surface
    this.generateRealisticSphere();
    
    // Set atmosphere for planets
    if (type === CelestialBodyType.PLANET && Math.random() < 0.6) {
      this.hasAtmosphere = true;
      this.atmosphereRadius = radius * (1.1 + Math.random() * 0.2);
      this.generateAtmosphereColor();
    }
  }

  private generateRealisticSphere(): void {
    const random = new SeededRandom(this.name.charCodeAt(0) * 1337 + this.name.length * 777);
    
    // Initialize arrays for high-quality sphere rendering
    this.surfaceMap = [];
    this.normalMap = [];
    this.shadowMap = [];
    this.uniqueFeatures = [];
    
    // Create surface and normal maps
    for (let x = 0; x < this.textureResolution; x++) {
      this.surfaceMap[x] = [];
      this.normalMap[x] = [];
      this.shadowMap[x] = [];
      
      for (let y = 0; y < this.textureResolution; y++) {
        this.surfaceMap[x][y] = {r: 0, g: 0, b: 0, elevation: 0};
        this.normalMap[x][y] = {x: 0, y: 0, z: 1};
        this.shadowMap[x][y] = 1.0;
      }
    }
    
    // Generate unique surface patterns
    this.generateUniqueSurface(random);
    
    // Generate surface features
    this.generateSurfaceFeatures(random);
    
    // Calculate sphere normals and lighting
    this.calculateSphereGeometry();
    
    // Apply realistic lighting with shadows
    this.applyRealisticLighting();
  }

  private generateUniqueSurface(random: SeededRandom): void {
    const baseColors = this.getBaseColorPalette();
    const centerX = this.textureResolution / 2;
    const centerY = this.textureResolution / 2;
    const maxRadius = this.textureResolution / 2;
    
    // Generate multi-octave noise for varied terrain
    for (let x = 0; x < this.textureResolution; x++) {
      for (let y = 0; y < this.textureResolution; y++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distFromCenter = Math.sqrt(dx * dx + dy * dy);
        
        if (distFromCenter <= maxRadius) {
          // Generate unique surface patterns using multiple noise layers
          const scale1 = 0.1;
          const scale2 = 0.05;
          const scale3 = 0.02;
          
          const noise1 = this.perlinNoise(x * scale1, y * scale1, random.next() * 1000) * 0.5;
          const noise2 = this.perlinNoise(x * scale2, y * scale2, random.next() * 2000) * 0.3;
          const noise3 = this.perlinNoise(x * scale3, y * scale3, random.next() * 3000) * 0.2;
          
          const combinedNoise = noise1 + noise2 + noise3;
          const normalizedNoise = (combinedNoise + 1) / 2; // Normalize to 0-1
          
          // Select base color based on noise and celestial type
          const colorIndex = Math.floor(normalizedNoise * (baseColors.length - 1));
          const baseColor = baseColors[colorIndex];
          
          // Add elevation variation
          this.surfaceMap[x][y].elevation = normalizedNoise * 0.3;
          
          // Apply color variation
          const variation = (random.next() - 0.5) * 0.2;
          this.surfaceMap[x][y].r = Math.max(0, Math.min(255, baseColor.r + variation * 255));
          this.surfaceMap[x][y].g = Math.max(0, Math.min(255, baseColor.g + variation * 255));
          this.surfaceMap[x][y].b = Math.max(0, Math.min(255, baseColor.b + variation * 255));
        }
      }
    }
  }

  private generateSurfaceFeatures(random: SeededRandom): void {
    const featureCount = 5 + Math.floor(random.next() * 15);
    
    for (let i = 0; i < featureCount; i++) {
      const x = Math.floor(random.next() * this.textureResolution);
      const y = Math.floor(random.next() * this.textureResolution);
      const size = 3 + random.next() * 12;
      const intensity = 0.3 + random.next() * 0.7;
      
      let featureType = 'crater';
      switch (this.type) {
        case CelestialBodyType.PLANET:
          featureType = random.choose(['mountain', 'crater', 'valley', 'plateau', 'rift']);
          break;
        case CelestialBodyType.MOON:
          featureType = random.choose(['crater', 'mountain', 'ridge', 'basin']);
          break;
        case CelestialBodyType.STAR:
          featureType = random.choose(['sunspot', 'flare', 'granule', 'prominence']);
          break;
        case CelestialBodyType.ASTEROID:
          featureType = random.choose(['crater', 'boulder', 'fracture', 'metal_deposit']);
          break;
      }
      
      this.uniqueFeatures.push({x, y, size, type: featureType, intensity});
      
      // Apply feature to surface map
      this.applyFeatureToSurface(x, y, size, featureType, intensity);
    }
  }

  private applyFeatureToSurface(centerX: number, centerY: number, size: number, type: string, intensity: number): void {
    const radius = size / 2;
    
    for (let x = Math.max(0, centerX - radius); x < Math.min(this.textureResolution, centerX + radius); x++) {
      for (let y = Math.max(0, centerY - radius); y < Math.min(this.textureResolution, centerY + radius); y++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= radius) {
          const falloff = 1 - (distance / radius);
          const effect = intensity * falloff;
          
          switch (type) {
            case 'crater':
              this.surfaceMap[x][y].elevation -= effect * 0.5;
              this.surfaceMap[x][y].r = Math.max(0, this.surfaceMap[x][y].r - effect * 50);
              this.surfaceMap[x][y].g = Math.max(0, this.surfaceMap[x][y].g - effect * 50);
              this.surfaceMap[x][y].b = Math.max(0, this.surfaceMap[x][y].b - effect * 50);
              break;
            case 'mountain':
              this.surfaceMap[x][y].elevation += effect * 0.4;
              this.surfaceMap[x][y].r = Math.min(255, this.surfaceMap[x][y].r + effect * 30);
              this.surfaceMap[x][y].g = Math.min(255, this.surfaceMap[x][y].g + effect * 30);
              this.surfaceMap[x][y].b = Math.min(255, this.surfaceMap[x][y].b + effect * 30);
              break;
            case 'sunspot':
              this.surfaceMap[x][y].r = Math.max(0, this.surfaceMap[x][y].r - effect * 100);
              this.surfaceMap[x][y].g = Math.max(0, this.surfaceMap[x][y].g - effect * 80);
              this.surfaceMap[x][y].b = Math.max(0, this.surfaceMap[x][y].b - effect * 60);
              break;
          }
        }
      }
    }
  }

  private calculateSphereGeometry(): void {
    const centerX = this.textureResolution / 2;
    const centerY = this.textureResolution / 2;
    const maxRadius = this.textureResolution / 2;
    
    for (let x = 0; x < this.textureResolution; x++) {
      for (let y = 0; y < this.textureResolution; y++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distFromCenter = Math.sqrt(dx * dx + dy * dy);
        
        if (distFromCenter <= maxRadius) {
          // Calculate sphere normal
          const normalizedX = dx / maxRadius;
          const normalizedY = dy / maxRadius;
          const z = Math.sqrt(Math.max(0, 1 - normalizedX * normalizedX - normalizedY * normalizedY));
          
          // Combine sphere normal with surface elevation
          const elevation = this.surfaceMap[x][y].elevation;
          const surfaceNormalX = 0;
          const surfaceNormalY = 0;
          const surfaceNormalZ = 1;
          
          // Calculate surface gradient if not on edge
          if (x > 0 && x < this.textureResolution - 1 && y > 0 && y < this.textureResolution - 1) {
            const gradientX = this.surfaceMap[x + 1][y].elevation - this.surfaceMap[x - 1][y].elevation;
            const gradientY = this.surfaceMap[x][y + 1].elevation - this.surfaceMap[x][y - 1].elevation;
            
            this.normalMap[x][y].x = normalizedX + gradientX * 0.1;
            this.normalMap[x][y].y = normalizedY + gradientY * 0.1;
            this.normalMap[x][y].z = z;
          } else {
            this.normalMap[x][y].x = normalizedX;
            this.normalMap[x][y].y = normalizedY;
            this.normalMap[x][y].z = z;
          }
        }
      }
    }
  }

  private applyRealisticLighting(): void {
    const lightDirection = { x: 0.7, y: -0.5, z: 0.5 }; // Light from upper right
    const ambientLight = 0.2;
    const diffuseStrength = 0.8;
    
    const centerX = this.textureResolution / 2;
    const centerY = this.textureResolution / 2;
    const maxRadius = this.textureResolution / 2;
    
    for (let x = 0; x < this.textureResolution; x++) {
      for (let y = 0; y < this.textureResolution; y++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distFromCenter = Math.sqrt(dx * dx + dy * dy);
        
        if (distFromCenter <= maxRadius) {
          const normal = this.normalMap[x][y];
          
          // Calculate diffuse lighting
          const diffuse = Math.max(0, 
            normal.x * lightDirection.x + 
            normal.y * lightDirection.y + 
            normal.z * lightDirection.z
          );
          
          // Calculate terminator effect (day/night)
          const terminatorFactor = Math.max(0, (normal.x * 0.7 + 0.3));
          
          // Calculate sphere edge darkening
          const edgeFactor = Math.max(0.3, normal.z);
          
          // Combine lighting factors
          const finalLighting = (ambientLight + diffuse * diffuseStrength) * terminatorFactor * edgeFactor;
          
          // Apply lighting to surface color
          const pixel = this.surfaceMap[x][y];
          pixel.r = Math.floor(pixel.r * finalLighting);
          pixel.g = Math.floor(pixel.g * finalLighting);
          pixel.b = Math.floor(pixel.b * finalLighting);
          
          // Store shadow value for later use
          this.shadowMap[x][y] = finalLighting;
        }
      }
    }
  }

  private perlinNoise(x: number, y: number, seed: number): number {
    // Simple Perlin-like noise implementation
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    
    x -= Math.floor(x);
    y -= Math.floor(y);
    
    const u = this.fade(x);
    const v = this.fade(y);
    
    const a = this.grad(this.hash(X + this.hash(Y + seed)), x, y);
    const b = this.grad(this.hash(X + 1 + this.hash(Y + seed)), x - 1, y);
    const c = this.grad(this.hash(X + this.hash(Y + 1 + seed)), x, y - 1);
    const d = this.grad(this.hash(X + 1 + this.hash(Y + 1 + seed)), x - 1, y - 1);
    
    return this.lerp(v, this.lerp(u, a, b), this.lerp(u, c, d));
  }

  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private lerp(t: number, a: number, b: number): number {
    return a + t * (b - a);
  }

  private hash(n: number): number {
    n = (n << 13) ^ n;
    return (n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff;
  }

  private grad(hash: number, x: number, y: number): number {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  private getBaseColorPalette(): Array<{r: number, g: number, b: number}> {
    switch (this.type) {
      case CelestialBodyType.STAR:
        return [
          {r: 255, g: 255, b: 220}, // White hot core
          {r: 255, g: 240, b: 180}, // Yellow hot
          {r: 255, g: 200, b: 120}, // Orange
          {r: 255, g: 160, b: 100}, // Red-orange
          {r: 255, g: 120, b: 80}   // Deep red
        ];
      case CelestialBodyType.PLANET:
        return [
          {r: 80, g: 120, b: 180},   // Deep ocean blue
          {r: 100, g: 160, b: 100},  // Forest green  
          {r: 160, g: 120, b: 80},   // Desert tan
          {r: 120, g: 100, b: 80},   // Rocky brown
          {r: 180, g: 180, b: 190},  // Ice white
          {r: 130, g: 90, b: 70},    // Mountain gray-brown
          {r: 180, g: 100, b: 60}    // Volcanic red-orange
        ];
      case CelestialBodyType.MOON:
        return [
          {r: 160, g: 160, b: 150}, // Light gray
          {r: 130, g: 130, b: 120}, // Medium gray
          {r: 100, g: 100, b: 90},  // Dark gray
          {r: 80, g: 80, b: 70},    // Very dark gray
          {r: 120, g: 110, b: 100}  // Brownish gray
        ];
      case CelestialBodyType.ASTEROID:
        return [
          {r: 70, g: 60, b: 50},    // Dark rock
          {r: 100, g: 90, b: 80},   // Light rock
          {r: 130, g: 110, b: 80},  // Iron-rich
          {r: 80, g: 70, b: 60},    // Carbon-rich
          {r: 140, g: 120, b: 100}  // Silicate
        ];
      default:
        return [{r: 128, g: 128, b: 128}];
    }
  }

  private generateAtmosphereColor(): void {
    switch (this.type) {
      case CelestialBodyType.PLANET:
        const atmosphereTypes = [
          'rgba(135, 206, 235, 0.25)', // Earth-like blue
          'rgba(255, 165, 0, 0.2)',    // Mars-like orange
          'rgba(255, 255, 255, 0.3)',  // Venus-like white
          'rgba(128, 0, 128, 0.25)',   // Purple exotic
          'rgba(0, 255, 127, 0.2)'     // Green exotic
        ];
        this.atmosphereColor = atmosphereTypes[Math.floor(Math.random() * atmosphereTypes.length)];
        break;
    }
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
      // Animate sunspots and surface features
      const time = Date.now() * 0.0001;
      this.uniqueFeatures.forEach((feature, index) => {
        if (feature.type === 'sunspot' || feature.type === 'flare') {
          feature.intensity = 0.5 + Math.sin(time + index) * 0.3;
        }
      });
    }
  }

  public isVisible(camera: ICamera, screenWidth: number, screenHeight: number): boolean {
    const screenPos = camera.worldToScreen(this.position.x, this.position.y);
    const screenRadius = this.radius * camera.zoom;
    
    // Extended frustum culling with margin for better performance
    const margin = Math.max(50, screenRadius);
    return (
      screenPos.x + screenRadius > -margin &&
      screenPos.x - screenRadius < screenWidth + margin &&
      screenPos.y + screenRadius > -margin &&
      screenPos.y - screenRadius < screenHeight + margin
    );
  }

  public render(renderer: IRenderer, camera: ICamera): void {
    if (!this.isVisible(camera, renderer.getWidth(), renderer.getHeight())) {
      return;
    }

    const screenPos = camera.worldToScreen(this.position.x, this.position.y);
    const scaledRadius = this.radius * camera.zoom;

    // Level of Detail (LOD) system for performance
    const distanceToCamera = Math.sqrt(
      (camera.x - this.position.x) ** 2 + 
      (camera.y - this.position.y) ** 2
    );
    
    // Very distant objects - render as simple colored pixels
    if (scaledRadius < 3 || distanceToCamera > 5000) {
      const ctx = renderer.getContext();
      ctx.fillStyle = this.color;
      ctx.fillRect(screenPos.x - 1, screenPos.y - 1, 2, 2);
      return;
    }
    
    // Distant objects - simplified rendering
    if (scaledRadius < 8 || distanceToCamera > 2500) {
      const ctx = renderer.getContext();
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, Math.max(2, scaledRadius), 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    renderer.save();
    renderer.translate(screenPos.x, screenPos.y);

    // Only render orbit paths for nearby objects to save performance
    if (this.orbitCenter && this.type !== CelestialBodyType.STAR && distanceToCamera < 3000) {
      this.renderOrbitPath(renderer, camera);
    }

    // Enhanced 16-bit rendering for close objects
    this.renderRealistic16BitSphere(renderer, camera);

    renderer.restore();

    // Only render names for large, close objects
    if ((this.type === CelestialBodyType.STAR || this.type === CelestialBodyType.PLANET) && 
        distanceToCamera < 1500 &&
        Math.abs(screenPos.x - renderer.getWidth()/2) < 200 && 
        Math.abs(screenPos.y - renderer.getHeight()/2) < 200) {
      renderer.drawText(this.name, screenPos.x, screenPos.y + this.radius * camera.zoom + 25, '#e0e3e6', '10px "Big Apple 3PM", monospace');
    }
  }

  private renderOrbitPath(renderer: IRenderer, camera: ICamera): void {
    if (!this.orbitCenter) return;

    const ctx = renderer.getContext();
    const centerScreen = camera.worldToScreen(this.orbitCenter.x, this.orbitCenter.y);

    // Only render orbit if center is roughly on screen
    const screenWidth = renderer.getWidth();
    const screenHeight = renderer.getHeight();
    const orbitRadius = this.semiMajorAxis * camera.zoom;
    
    if (centerScreen.x + orbitRadius < -100 || centerScreen.x - orbitRadius > screenWidth + 100 ||
        centerScreen.y + orbitRadius < -100 || centerScreen.y - orbitRadius > screenHeight + 100) {
      return;
    }

    ctx.strokeStyle = 'rgba(162, 170, 178, 0.15)';
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

  private renderRealistic16BitSphere(renderer: IRenderer, camera: ICamera): void {
    const ctx = renderer.getContext();
    const scaledRadius = this.radius * camera.zoom;
    
    // Don't render if too small
    if (scaledRadius < 6) {
      // Render as simple colored pixel for distant objects
      ctx.fillStyle = this.color;
      ctx.fillRect(-1, -1, 2, 2);
      return;
    }

    // Turn off smoothing for pixel art
    ctx.imageSmoothingEnabled = false;
    
    // Render atmosphere first if present and large enough
    if (this.hasAtmosphere && this.atmosphereColor && scaledRadius > 12) {
      const gradient = ctx.createRadialGradient(0, 0, scaledRadius * 0.8, 0, 0, this.atmosphereRadius * camera.zoom);
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(0.7, this.atmosphereColor);
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, this.atmosphereRadius * camera.zoom, 0, Math.PI * 2);
      ctx.fill();
    }

    // Render the realistic sphere surface with LOD
    ctx.save();
    ctx.rotate(this.rotation);
    
    const pixelSize = Math.max(1, Math.floor(scaledRadius / 32));
    const textureScale = scaledRadius / (this.textureResolution / 2);
    
    // Adaptive rendering based on size
    const renderStep = scaledRadius > 50 ? 1 : Math.max(1, Math.floor(3 - scaledRadius / 25));
    
    // Render surface pixels with proper sphere mapping and LOD
    for (let x = 0; x < this.textureResolution; x += renderStep) {
      for (let y = 0; y < this.textureResolution; y += renderStep) {
        const centerX = this.textureResolution / 2;
        const centerY = this.textureResolution / 2;
        const dx = x - centerX;
        const dy = y - centerY;
        const distFromCenter = Math.sqrt(dx * dx + dy * dy);
        
        if (distFromCenter <= this.textureResolution / 2) {
          const pixel = this.surfaceMap[x][y];
          const screenX = dx * textureScale;
          const screenY = dy * textureScale;
          
          // Only render pixels that are on the visible hemisphere
          const normal = this.normalMap[x][y];
          if (normal.z > 0.1) { // Only render front-facing pixels
            ctx.fillStyle = `rgb(${pixel.r}, ${pixel.g}, ${pixel.b})`;
            const renderSize = Math.max(renderStep, pixelSize);
            ctx.fillRect(
              screenX - renderSize/2, 
              screenY - renderSize/2, 
              renderSize, 
              renderSize
            );
          }
        }
      }
    }

    // Add stellar corona for stars (only for large, close stars)
    if (this.type === CelestialBodyType.STAR && scaledRadius > 20) {
      this.renderStellarCorona(ctx, camera);
    }
    
    ctx.restore();
    
    // Turn smoothing back on
    ctx.imageSmoothingEnabled = true;
  }

  private renderStellarCorona(ctx: CanvasRenderingContext2D, camera: ICamera): void {
    const coronaRadius = this.radius * camera.zoom * 1.15;
    
    // Create radial gradient for corona
    const gradient = ctx.createRadialGradient(0, 0, this.radius * camera.zoom, 0, 0, coronaRadius);
    gradient.addColorStop(0, 'rgba(255, 255, 200, 0.0)');
    gradient.addColorStop(0.7, 'rgba(255, 200, 100, 0.2)');
    gradient.addColorStop(1, 'rgba(255, 150, 50, 0.05)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, coronaRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Add subtle solar flares
    const time = Date.now() * 0.001;
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + time * 0.1;
      const flareLength = (15 + Math.sin(time + i) * 8) * camera.zoom;
      const flareX = Math.cos(angle) * this.radius * camera.zoom;
      const flareY = Math.sin(angle) * this.radius * camera.zoom;
      
      ctx.strokeStyle = `rgba(255, 240, 180, ${0.2 + Math.sin(time + i) * 0.1})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(flareX, flareY);
      ctx.lineTo(flareX + Math.cos(angle) * flareLength, flareY + Math.sin(angle) * flareLength);
      ctx.stroke();
    }
  }

  private renderGeneric(renderer: IRenderer): void {
    renderer.drawCircle(0, 0, this.radius, this.color, true);
  }
}