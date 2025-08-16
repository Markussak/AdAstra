// sprites.ts - Pixel-art sprite registry and renderer using palette colors

import { IRenderer } from './types';

// Character-to-color mapping helper
type CharColorMap = { [ch: string]: string };

interface SpriteDef {
  id: string;
  width: number;
  height: number;
  // Rows encoded as strings; '.' means transparent, other chars map via colorMap
  rows: string[];
  colorMap: CharColorMap;
}

export class SpriteRegistry {
  private static sprites: Map<string, SpriteDef> = new Map();

  public static register(def: SpriteDef): void {
    this.sprites.set(def.id, def);
  }

  public static get(id: string): SpriteDef | undefined {
    return this.sprites.get(id);
  }
}

export class SpriteRenderer {
  // Draw centered at (0,0) in current transform; angle handled by caller (player already rotates canvas)
  public static drawSprite(renderer: IRenderer, spriteId: string, scale: number = 2): void {
    const def = SpriteRegistry.get(spriteId);
    if (!def) return;

    const ctx = renderer.getContext();
    const px = Math.max(1, Math.floor(scale));
    const originX = -Math.floor((def.width * px) / 2);
    const originY = -Math.floor((def.height * px) / 2);

    for (let y = 0; y < def.height; y++) {
      const row = def.rows[y] || '';
      for (let x = 0; x < def.width; x++) {
        const ch = row[x] || '.';
        if (ch === '.' || ch === ' ') continue;
        const color = def.colorMap[ch];
        if (!color) continue;
        renderer.drawRect(originX + x * px, originY + y * px, px, px, color);
      }
    }
  }
}

// Palette-friendly colors (must exist in assets/colors.txt):
const O = '#2b323a'; // outline
const A = '#5a6978'; // hull primary
const B = '#434c55'; // hull shadow
const H = '#e0e3e6'; // highlight
const W = '#00ffff'; // canopy / light
const F = '#e8732c'; // engine flame hot
const G = '#ffc357'; // engine flame warm

// Ship: Explorer (32x18)
SpriteRegistry.register({
  id: 'ship_explorer',
  width: 32,
  height: 18,
  colorMap: { O, A, B, H, W, F, G },
  rows: [
    '..............OO..............',
    '.............OOOO.............',
    '...........OOAAAAOO...........',
    '..........OAABAAABO...........',
    '.........OAABAAAAABO..........',
    '........OAABAAAAAAABO.........',
    '.......OAABAAAAWAAAABO........',
    '......OAAABAAAAAAAABAAO.......',
    'OOOOOOOABAAAAAAAAAAABOOOOOOOOO',
    '......OAAABAAAAAAAABAAO.......',
    '.......OAABAAAAAAAABO.........',
    '........OAABAAAAAAABO.........',
    '.........OAAABAAABAO..........',
    '..........OOAAAAAAOO..........',
    '.....F....GGAAAAAAGG....F.....',
    '....FF....GGAAAAAAGG....FF....',
    '...FFF.....GAAAAAAG.....FFF...',
    '...FF........OOOO........FF...'
  ]
});

// Ship: Fighter (28x16) - sleeker nose
SpriteRegistry.register({
  id: 'ship_fighter',
  width: 28,
  height: 16,
  colorMap: { O, A, B, H, W, F, G },
  rows: [
    '...........OOO...........',
    '..........OAAAO..........',
    '.........OABWBAO.........',
    '........OABAAAABO........',
    '.......OABAAAAAABO.......',
    'OOOOOOOABAAAAAAAABOOOOOOO',
    '.......OABAAAAAABO.......',
    '........OABAAAABO........',
    '.........OABAABO.........',
    '..........OAAAO..........',
    '......F....GAA G....F....',
    '.....FF....GAA G....FF...',
    '.....FF.....GA G.....FF..',
    '......F......OOO......F..',
    '...............O.........',
    '.........................'
  ]
});

// Ship: Cargo (34x20) - bulky body
SpriteRegistry.register({
  id: 'ship_cargo',
  width: 34,
  height: 20,
  colorMap: { O, A, B, H, W, F, G },
  rows: [
    '..............OOOOOO..............',
    '...........OOOAAAAAO OOO..........',
    '.........OOAABAAAAAA BAOO.........',
    '........OAABAAAAWAAAAAABO........',
    '.......OABAAAAAA AAAAAAABO.......',
    'OOOOOOOABAAAAAAA AAAAAAAABOOOOOOO',
    '.......OABAAAAAA AAAAAAABO.......',
    '........OAABAAAA AAAAAABO........',
    '.........OOAABAAA AAAAOO.........',
    '...........OOOAAA AAAOO..........',
    '.....F......GGAAA AAGG......F....',
    '....FF......GGAAA AAGG......FF...',
    '...FFF.......GAAA AAG.......FFF..',
    '...FF.........OOOOOOO.........FF.',
    '................O O..............',
    '................O O..............',
    '..................................',
    '..................................',
    '..................................',
    '..................................'
  ]
});

// Station (24x24) - simple rotating hub sprite (static for now)
SpriteRegistry.register({
  id: 'station_basic',
  width: 24,
  height: 24,
  colorMap: { O, A, B, H, W },
  rows: [
    '.............OOO.............',
    '..........OOOAAAOOO..........',
    '.........OABAAAAAA BO.........',
    '........OABAAAAAAAABO........',
    '.......OABAAAAHAAAAABO.......',
    '......OABAAAAAAAAAAAABO......',
    '.....OABAAAAAAAAAAAAAABO.....',
    '.....OABAAAAWWWWAAAAAABO.....',
    '.....OABAAAAAAAAAAAAAABO.....',
    '......OABAAAAAAAAAAAABO......',
    '.......OABAAAAHAAAAABO.......',
    '........OABAAAAAAAABO........',
    '.........OABAAAAAA BO.........',
    '..........OOOAAAOOO..........',
    '.............OOO.............',
    '.............................',
    '.............................',
    '.............................',
    '.............................',
    '.............................',
    '.............................',
    '.............................',
    '.............................',
    '.............................'
  ]
});