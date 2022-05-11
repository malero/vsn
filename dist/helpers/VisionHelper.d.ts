export declare class VisionHelper {
    static isConstructor(obj: any): boolean;
    static get document(): Document;
    static get window(): Window & typeof globalThis;
    static isMobile(): boolean;
    static get inDevelopment(): boolean;
    static get doBenchmark(): boolean;
    static get inLegacy(): boolean;
    static getUriWithParams(url: string, params: Record<string, any>): string;
    static nice(callback: any, timeout?: number): void;
    static get wasmSupport(): boolean;
}
