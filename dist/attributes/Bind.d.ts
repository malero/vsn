import { Scope } from "../Scope";
import { Attribute } from "../Attribute";
export declare class Bind extends Attribute {
    static readonly canDefer: boolean;
    protected key?: string;
    protected property?: string;
    protected direction: string;
    protected boundScope?: Scope;
    protected formatter: (v: string) => string;
    compile(): Promise<void>;
    setup(): Promise<void>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    evaluate(): Promise<void>;
    set value(v: any);
    get value(): any;
    get valueFromElement(): string;
    mutate(mutation: MutationRecord): void;
    get doUpdateFrom(): boolean;
    updateFrom(): void;
    get doUpdateTo(): boolean;
    updateTo(): void;
    setFormatter(formatter: any): void;
}
