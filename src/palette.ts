// palette.ts - Runtime color palette loader and mapper

export class ColorPalette {
  private static palette: Array<{ r: number; g: number; b: number; hex: string }> = [];
  private static loaded: boolean = false;
  private static loading: boolean = false;
  private static enableMapping: boolean = true;

  // Fallback palette derived from in-game muted retro tones and common space colors
  private static fallbackHex: string[] = [
    // Core UI and text
    '#000000', '#0a0a0a', '#1a1a1a', '#2a2a2a', '#3a3a3a', '#404040', '#505050', '#606060', '#888888', '#b8b8b8', '#e8e8e8',
    // Amber/Green CRT
    '#d4a574', '#74a574', '#a57474',
    // Buttons/accents
    '#A27B5C', '#F6B17A', '#F97300', '#be794f', '#664400', '#443300', '#221100', '#3F4F44', '#7077A1', '#6aaf9d', '#355d68',
    // Stars/space
    '#E6E6FA', '#F0F8FF', '#FFF8DC', '#F5F5DC', '#FFFAF0', '#FAF0E6', '#E0E6FF', '#a8a8a8', '#c8c8c8',
    // Nebulae purples/reds
    '#2D1B3D', '#4A2C4A', '#3D1A3D', '#5D2E5D', '#4D1F4D', '#3A2A5A', '#2E1E4E', '#4A3A6A', '#3D2D5D', '#2F1F2F', '#1F1F2F', '#2A1A2A', '#251525',
    // Ship and chassis
    '#5a6978', '#434c55', '#2b323a', '#e0e3e6', '#6d4c4c',
    // Effects
    '#e8732c', '#ffc357', '#52de44',
    // Planets and bodies
    '#4169E1', '#CD853F', '#8B4513', '#228B22', '#DC143C', '#9370DB', '#FF6347', '#4682B4', '#DDA0DD', '#32CD32', '#FF8C00', '#8A2BE2',
    '#C0C0C0', '#8B7355', '#696969', '#A0522D', '#BC8F8F', '#D2691E', '#F4A460', '#708090', '#778899', '#B8860B',
    // Stars
    '#FFD700', '#FF6B47', '#FF4444', '#87CEEB', '#FFFFFF', '#FFA500', '#FFE4B5',
    // Info and highlights
    '#00ffff', '#ffff00', '#ff0000', '#000088'
  ];

  public static async load(path: string = '/assets/colors.txt'): Promise<void> {
    if (this.loading || this.loaded) return;
    this.loading = true;

    try {
      const res = await fetch(path, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`Failed to load palette: ${res.status}`);
      const text = await res.text();
      const hexes = text
        .split(/\r?\n/)
        .map(l => l.trim())
        .filter(l => l && l.startsWith('#') && this.isHex(l));

      if (hexes.length > 0) {
        this.palette = hexes.map(h => ({ ...this.hexToRgb(h), hex: this.normalizeHex(h) }));
        this.loaded = true;
      } else {
        this.useFallback();
      }
    } catch {
      this.useFallback();
    } finally {
      this.loading = false;
    }
  }

  private static useFallback(): void {
    this.palette = this.fallbackHex.map(h => ({ ...this.hexToRgb(h), hex: this.normalizeHex(h) }));
    this.loaded = true;
  }

  public static resolve(color: string): string {
    if (!this.enableMapping) return color;
    if (!color) return color;

    // Support rgba()/rgb(): map RGB to nearest palette, keep alpha
    const rgbaMatch = color.match(/^rgba?\((\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(\d*\.?\d+))?\)$/i);
    if (rgbaMatch) {
      const r = Math.max(0, Math.min(255, parseInt(rgbaMatch[1], 10)));
      const g = Math.max(0, Math.min(255, parseInt(rgbaMatch[2], 10)));
      const b = Math.max(0, Math.min(255, parseInt(rgbaMatch[3], 10)));
      const a = rgbaMatch[4] !== undefined ? parseFloat(rgbaMatch[4]) : 1;

      if (!this.loaded) this.useFallback();
      const nearest = this.nearestFromRgb(r, g, b);
      const nr = parseInt(nearest.substring(1, 3), 16);
      const ng = parseInt(nearest.substring(3, 5), 16);
      const nb = parseInt(nearest.substring(5, 7), 16);
      return `rgba(${nr}, ${ng}, ${nb}, ${a})`;
    }

    // Only map pure hex colors; leave other named colors untouched
    if (!color.startsWith('#') || !this.isHex(color)) return color;

    if (!this.loaded) {
      // Lazy-init fallback if not loaded yet
      this.useFallback();
    }

    const target = this.hexToRgb(color);
    let best: { hex: string; dist: number } | null = null;

    for (const p of this.palette) {
      const dr = p.r - target.r;
      const dg = p.g - target.g;
      const db = p.b - target.b;
      const dist = dr * dr + dg * dg + db * db;
      if (!best || dist < best.dist) {
        best = { hex: p.hex, dist };
      }
    }

    return best ? best.hex : color;
  }

  private static nearestFromRgb(r: number, g: number, b: number): string {
    let best: { hex: string; dist: number } | null = null;
    for (const p of this.palette) {
      const dr = p.r - r;
      const dg = p.g - g;
      const db = p.b - b;
      const dist = dr * dr + dg * dg + db * db;
      if (!best || dist < best.dist) best = { hex: p.hex, dist };
    }
    return best ? best.hex : `#${r.toString(16).padStart(2, '0')}${g
      .toString(16)
      .padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  private static isHex(hex: string): boolean {
    const h = this.normalizeHex(hex);
    return /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(h);
  }

  private static normalizeHex(hex: string): string {
    if (hex.length === 4) {
      // #rgb -> #rrggbb
      const r = hex[1];
      const g = hex[2];
      const b = hex[3];
      return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
    }
    return hex.toLowerCase();
  }

  private static hexToRgb(hex: string): { r: number; g: number; b: number } {
    const norm = this.normalizeHex(hex).substring(1);
    const r = parseInt(norm.substring(0, 2), 16);
    const g = parseInt(norm.substring(2, 4), 16);
    const b = parseInt(norm.substring(4, 6), 16);
    return { r, g, b };
  }
}