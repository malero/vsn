export declare class Modifier {
    readonly name: string;
    readonly arguments: string[];
    constructor(modifier: string);
    getArguments(fallback?: string[]): string[];
}
export declare class Modifiers {
    protected modifiers: Map<string, Modifier>;
    constructor(modifiers?: string[]);
    add(modifier: string): void;
    has(name: string): boolean;
    get(name: string): Modifier;
    get iter(): Modifier[];
    get names(): string[];
    get length(): number;
    static fromAttribute(attribute: string): Modifiers;
}
