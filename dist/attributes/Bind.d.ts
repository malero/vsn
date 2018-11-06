import { Scope } from "../Scope";
import { Attribute } from "../Attribute";
export declare class Bind extends Attribute {
    protected key?: string;
    protected boundScope?: Scope;
    value: any;
    setup(): void;
    updateFrom(): void;
    updateTo(): void;
}
