import { Attribute } from "../Attribute";
import { Scope } from "../Scope";
export declare class Radio extends Attribute {
    static readonly canDefer: boolean;
    protected key?: string;
    protected boundScope?: Scope;
    extract(): Promise<void>;
    connect(): Promise<void>;
    handleEvent(e: any): Promise<void>;
    checkSelected(): Promise<void>;
}
