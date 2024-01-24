import { Attribute } from "../Attribute";
import { Scope } from "../Scope";
export declare class StyleVarAttribute extends Attribute {
    static readonly canDefer: boolean;
    protected key?: string;
    protected styleVar?: string;
    protected boundScope?: Scope;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    update(e: any): void;
}
