import { Tag } from "./Tag";
import { EventDispatcher } from "./EventDispatcher";
export declare enum AttributeState {
    Instantiated = 0,
    Deferred = 1,
    Compiled = 2,
    Setup = 3,
    Extracted = 4,
    Connected = 5,
    Built = 6
}
export declare abstract class Attribute extends EventDispatcher {
    readonly tag: Tag;
    readonly attributeName: string;
    protected _state: AttributeState;
    static readonly scoped: boolean;
    static readonly canDefer: boolean;
    constructor(tag: Tag, attributeName: string);
    get state(): AttributeState;
    protected defer(): Promise<void>;
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
    private setState;
}
