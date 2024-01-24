import { Tag } from "./Tag";
import { EventDispatcher } from "./EventDispatcher";
import { Modifiers } from "./Modifiers";
export declare enum AttributeState {
    Instantiated = 0,
    Deferred = 1,
    Compiled = 2,
    Setup = 3,
    Extracted = 4,
    Connected = 5,
    Built = 6,
    Disconnected = 7
}
export declare abstract class Attribute extends EventDispatcher {
    readonly tag: Tag;
    readonly attributeName: string;
    readonly slot?: Tag;
    protected _state: AttributeState;
    readonly modifiers: Modifiers;
    static readonly scoped: boolean;
    static readonly canDefer: boolean;
    constructor(tag: Tag, attributeName: string, slot?: Tag);
    get origin(): Tag;
    get state(): AttributeState;
    protected defer(): Promise<void>;
    protected configure(): Promise<void>;
    compile(): Promise<void>;
    setup(): Promise<void>;
    extract(): Promise<void>;
    connect(): Promise<void>;
    finalize(): Promise<void>;
    disconnect(): Promise<void>;
    evaluate(): Promise<void>;
    getAttributeValue(fallback?: any): any;
    getAttributeBinding(fallback?: any): string;
    getAttributeModifiers(fallback?: any): string[];
    getAttributeModifierArguments(modifier: string, fallback?: string[]): string[];
    hasModifier(mod: string): boolean;
    mutate(mutation: MutationRecord): void;
    set value(value: string);
    get value(): string;
    apply(fnc: Function): Promise<void>;
    protected setState(state: AttributeState): void;
    deconstruct(): void;
    static create(tag: Tag, attributeName: string, cls: any, slot?: Tag): Attribute;
}
