import { Scope } from "../Scope";
import { Attribute } from "../Attribute";
export declare class SetAttribute extends Attribute {
    static readonly canDefer: boolean;
    protected key?: string;
    protected property?: string;
    protected boundScope?: Scope;
    set value(v: any);
    get value(): any;
    setup(): Promise<void>;
    extract(): Promise<void>;
}
