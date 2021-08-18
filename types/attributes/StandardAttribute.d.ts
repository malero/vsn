import { Attribute } from "../Attribute";
export declare class StandardAttribute extends Attribute {
    protected static readonly magicAttributes: string[];
    setup(): Promise<void>;
    extract(): Promise<void>;
    connect(): Promise<void>;
    mutate(mutation: MutationRecord): void;
    get needsToBeSynced(): boolean;
    updateTo(): void;
    updateFrom(): void;
    get key(): string;
    set value(value: any);
    get value(): any;
}
