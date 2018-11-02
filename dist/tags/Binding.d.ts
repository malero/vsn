import { Tag } from "../Tag";
import { Scope } from "../Scope";
export declare class Binding extends Tag {
    protected key?: string;
    protected boundScope?: Scope;
    value: any;
    protected setup(): void;
    updateFrom(): void;
    updateTo(): void;
}
