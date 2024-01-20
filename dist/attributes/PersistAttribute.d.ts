import { Attribute } from "../Attribute";
export interface IPersistedValue {
    attribute: string;
    value: string;
}
export declare class PersistAttribute extends Attribute {
    static readonly persistedValues: Map<string, Map<string, string | string[]>>;
    static readonly canDefer: boolean;
    protected valueKeys: string[];
    extract(): Promise<void>;
    connect(): Promise<void>;
    mutate(mutation: MutationRecord): void;
    protected updateFrom(): void;
    static getPersistedValueStore(elementId: string): Map<string, string | string[]>;
}
