export class SpriteRegistry {
    static register(def) {
        this.sprites.set(def.id, def);
    }
    static get(id) {
        return this.sprites.get(id);
    }
}
SpriteRegistry.sprites = new Map();
export class SpriteRenderer {
    static drawSprite(renderer, spriteId, scale = 2) {
        const def = SpriteRegistry.get(spriteId);
        if (!def)
            return;
        const ctx = renderer.getContext();
        const px = Math.max(1, Math.floor(scale));
        const originX = -Math.floor((def.width * px) / 2);
        const originY = -Math.floor((def.height * px) / 2);
        for (let y = 0; y < def.height; y++) {
            const row = def.rows[y] || '';
            for (let x = 0; x < def.width; x++) {
                const ch = row[x] || '.';
                if (ch === '.' || ch === ' ')
                    continue;
                const color = def.colorMap[ch];
                if (!color)
                    continue;
                renderer.drawRect(originX + x * px, originY + y * px, px, px, color);
            }
        }
    }
}
const O = '#2b323a';
const A = '#5a6978';
const B = '#434c55';
const H = '#e0e3e6';
const W = '#00ffff';
const F = '#e8732c';
const G = '#ffc357';
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
//# sourceMappingURL=sprites.js.map