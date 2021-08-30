import { Tag } from "./Tag";
export declare abstract class Attribute {
    readonly tag: Tag;
    readonly attributeName: string;
    static readonly scoped: boolean;
    static readonly cache: {
        [key: string]: Attribute;
    };
    constructor(tag: Tag, attributeName: string);
    protected configure(): Promise<void>;
    compile(): Promise<void>;
    setup(): Promise<void>;
    extract(): Promise<void>;
    connect(): Promise<void>;
    evaluate(): Promise<void>;
    getAttributeValue(fallback?: any): any;
    getAttributeBinding(fallback?: any): string;
    getAttributeModifiers(fallback?: any): string[];
    hasModifier(mod: string): boolean;
    mutate(mutation: MutationRecord): void;
    set value(value: string);
    get value(): string;
}
