import {EExportType, encodeString, encodeVector, EValueType, functionType} from "../WASM";
import {Section} from "./Section";

export class FunctionSection extends Section {
    protected readonly variables: {[key: string]: number} = {};
    protected readonly params: EValueType[] = [];
    protected readonly results: EValueType[] = [];
    protected readonly code: number[] = [];

    constructor(
        protected readonly name: string
    ) {
        super();
    }

    public addParam(paramType: EValueType, name: string = null) {
        const index: number = this.params.length;
        name = name || `$param${index}`;
        this.variables[name] = index;
        this.params.push(paramType);
    }

    public addResult(paramType: EValueType) {
        this.results.push(paramType);
    }

    public addCode(code: number[]) {
        this.code.push(...code);
    }

    get sectionTypes(): number[] {
        return [
            functionType,
            this.paramCount, // Number of params
            ...this.paramTypes, // Param type(s)
            this.resultCount, // Number of results
            ...this.resultTypes, // result type(s)
        ];
    }

    get sectionExport(): number[] {
        return [
            ...encodeString(this.name),
            EExportType.func,
        ]
    }

    get sectionCode(): number[] {
        return encodeVector(this.code);
    }

    get paramCount(): number {
        return this.params.length;
    }

    get paramTypes(): number[] {
        return this.params;
    }

    get resultCount(): number {
        return this.results.length;
    }

    get resultTypes(): number[] {
        return this.results;
    }
}
