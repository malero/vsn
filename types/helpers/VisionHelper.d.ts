export declare class VisionHelper {
    static isConstructor(obj: any): boolean;
    static get document(): Document;
    static get window(): Window & typeof globalThis;
    static isMobile(): boolean;
    static get inDevelopment(): boolean;
    static get doBenchmark(): boolean;
    static get inLegacy(): boolean;
    static nice(callback: any, timeout?: number): void;
}
