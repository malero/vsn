import { Attribute } from "../Attribute";
export declare class StyleAttribute extends Attribute {
    static readonly canDefer: boolean;
    private scopeRef;
    private styleScope;
    setup(): Promise<void>;
    connect(): Promise<void>;
    extract(): Promise<void>;
    updateFrom(): void;
    updateTo(): void;
    mutate(mutation: MutationRecord): void;
    handleEvent(k: any, v: any): Promise<void>;
}
