export declare const ieee754: (n: number) => Uint8Array;
export declare const encodeString: (str: string) => number[];
export declare const signedLEB128: (n: number) => any[];
export declare const unsignedLEB128: (n: number) => any[];
declare enum EValueType {
    i32 = 127,
    f32 = 125
}
export declare abstract class Section {
    abstract get sectionTypes(): number[];
    abstract get sectionExport(): number[];
}
export declare class FunctionSection extends Section {
    protected readonly name: string;
    protected readonly params: EValueType[];
    protected readonly results: EValueType[];
    protected readonly code: number[];
    constructor(name: string);
    addParam(paramType: EValueType): void;
    addResult(paramType: EValueType): void;
    addCode(code: number[]): void;
    get sectionTypes(): number[];
    get sectionExport(): number[];
    get sectionCode(): number[];
    get paramCount(): number;
    get paramTypes(): number[];
    get resultCount(): number;
    get resultTypes(): number[];
}
export declare const emitter: () => Uint8Array;
export {};
