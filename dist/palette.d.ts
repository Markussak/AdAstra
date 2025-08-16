export declare class ColorPalette {
    private static palette;
    private static loaded;
    private static loading;
    private static enableMapping;
    private static fallbackHex;
    static load(path?: string): Promise<void>;
    private static useFallback;
    static resolve(color: string): string;
    private static nearestFromRgb;
    private static isHex;
    private static normalizeHex;
    private static hexToRgb;
}
