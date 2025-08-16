export class ColorPalette {
    static async load(path = '/assets/colors.txt') {
        if (this.loading || this.loaded)
            return;
        this.loading = true;
        try {
            const res = await fetch(path, { cache: 'no-cache' });
            if (!res.ok)
                throw new Error(`Failed to load palette: ${res.status}`);
            const text = await res.text();
            const hexes = text
                .split(/\r?\n/)
                .map(l => l.trim())
                .filter(l => l && l.startsWith('#') && this.isHex(l));
            if (hexes.length > 0) {
                this.palette = hexes.map(h => ({ ...this.hexToRgb(h), hex: this.normalizeHex(h) }));
                this.loaded = true;
            }
            else {
                this.useFallback();
            }
        }
        catch {
            this.useFallback();
        }
        finally {
            this.loading = false;
        }
    }
    static useFallback() {
        this.palette = this.fallbackHex.map(h => ({ ...this.hexToRgb(h), hex: this.normalizeHex(h) }));
        this.loaded = true;
    }
    static resolve(color) {
        if (!this.enableMapping)
            return color;
        if (!color)
            return color;
        const rgbaMatch = color.match(/^rgba?\((\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(\d*\.?\d+))?\)$/i);
        if (rgbaMatch) {
            const r = Math.max(0, Math.min(255, parseInt(rgbaMatch[1], 10)));
            const g = Math.max(0, Math.min(255, parseInt(rgbaMatch[2], 10)));
            const b = Math.max(0, Math.min(255, parseInt(rgbaMatch[3], 10)));
            const a = rgbaMatch[4] !== undefined ? parseFloat(rgbaMatch[4]) : 1;
            if (!this.loaded)
                this.useFallback();
            const nearest = this.nearestFromRgb(r, g, b);
            const nr = parseInt(nearest.substring(1, 3), 16);
            const ng = parseInt(nearest.substring(3, 5), 16);
            const nb = parseInt(nearest.substring(5, 7), 16);
            return `rgba(${nr}, ${ng}, ${nb}, ${a})`;
        }
        if (!color.startsWith('#') || !this.isHex(color))
            return color;
        if (!this.loaded) {
            this.useFallback();
        }
        const target = this.hexToRgb(color);
        let best = null;
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
    static nearestFromRgb(r, g, b) {
        let best = null;
        for (const p of this.palette) {
            const dr = p.r - r;
            const dg = p.g - g;
            const db = p.b - b;
            const dist = dr * dr + dg * dg + db * db;
            if (!best || dist < best.dist)
                best = { hex: p.hex, dist };
        }
        return best ? best.hex : `#${r.toString(16).padStart(2, '0')}${g
            .toString(16)
            .padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    static isHex(hex) {
        const h = this.normalizeHex(hex);
        return /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(h);
    }
    static normalizeHex(hex) {
        if (hex.length === 4) {
            const r = hex[1];
            const g = hex[2];
            const b = hex[3];
            return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
        }
        return hex.toLowerCase();
    }
    static hexToRgb(hex) {
        const norm = this.normalizeHex(hex).substring(1);
        const r = parseInt(norm.substring(0, 2), 16);
        const g = parseInt(norm.substring(2, 4), 16);
        const b = parseInt(norm.substring(4, 6), 16);
        return { r, g, b };
    }
}
ColorPalette.palette = [];
ColorPalette.loaded = false;
ColorPalette.loading = false;
ColorPalette.enableMapping = true;
ColorPalette.fallbackHex = [
    '#000000', '#0a0a0a', '#1a1a1a', '#2a2a2a', '#3a3a3a', '#404040', '#505050', '#606060', '#888888', '#b8b8b8', '#e8e8e8',
    '#d4a574', '#74a574', '#a57474',
    '#A27B5C', '#F6B17A', '#F97300', '#be794f', '#664400', '#443300', '#221100', '#3F4F44', '#7077A1', '#6aaf9d', '#355d68',
    '#E6E6FA', '#F0F8FF', '#FFF8DC', '#F5F5DC', '#FFFAF0', '#FAF0E6', '#E0E6FF', '#a8a8a8', '#c8c8c8',
    '#2D1B3D', '#4A2C4A', '#3D1A3D', '#5D2E5D', '#4D1F4D', '#3A2A5A', '#2E1E4E', '#4A3A6A', '#3D2D5D', '#2F1F2F', '#1F1F2F', '#2A1A2A', '#251525',
    '#5a6978', '#434c55', '#2b323a', '#e0e3e6', '#6d4c4c',
    '#e8732c', '#ffc357', '#52de44',
    '#4169E1', '#CD853F', '#8B4513', '#228B22', '#DC143C', '#9370DB', '#FF6347', '#4682B4', '#DDA0DD', '#32CD32', '#FF8C00', '#8A2BE2',
    '#C0C0C0', '#8B7355', '#696969', '#A0522D', '#BC8F8F', '#D2691E', '#F4A460', '#708090', '#778899', '#B8860B',
    '#FFD700', '#FF6B47', '#FF4444', '#87CEEB', '#FFFFFF', '#FFA500', '#FFE4B5',
    '#00ffff', '#ffff00', '#ff0000', '#000088'
];
//# sourceMappingURL=palette.js.map