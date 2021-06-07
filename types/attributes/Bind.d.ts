import { Scope } from "../Scope";
import { Attribute } from "../Attribute";
export declare class Bind extends Attribute {
    protected key?: string;
    protected property?: string;
    protected boundScope?: Scope;
    compile(): Promise<void>;
    setup(): Promise<void>;
    extract(): Promise<void>;
    connect(): Promise<void>;
    evaluate(): Promise<void>;
    set value(v: any);
    get value(): any;
    get valueFromElement(): string;
    mutate(mutation: MutationRecord): void;
    updateFrom(): void;
    updateTo(): void;
}
