import { Attribute } from "../Attribute";
export declare class Name extends Attribute {
    static readonly canDefer: boolean;
    static readonly scoped: boolean;
    setup(): Promise<void>;
}
