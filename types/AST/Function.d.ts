import { EValueType } from "./WASM";
import { Section } from "./Section";
export declare class FunctionSection extends Section {
    protected readonly name: string;
    protected readonly variables: {
        [key: string]: number;
    };
    protected readonly params: EValueType[];
    protected readonly results: EValueType[];
    protected readonly code: number[];
    constructor(name: string);
    addParam(paramType: EValueType, name?: string): void;
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
