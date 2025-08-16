import { IRenderer } from './types';
type CharColorMap = {
    [ch: string]: string;
};
interface SpriteDef {
    id: string;
    width: number;
    height: number;
    rows: string[];
    colorMap: CharColorMap;
}
export declare class SpriteRegistry {
    private static sprites;
    static register(def: SpriteDef): void;
    static get(id: string): SpriteDef | undefined;
}
export declare class SpriteRenderer {
    static drawSprite(renderer: IRenderer, spriteId: string, scale?: number): void;
}
export {};
