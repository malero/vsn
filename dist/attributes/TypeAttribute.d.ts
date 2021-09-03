import { Attribute } from "../Attribute";
export declare class TypeAttribute extends Attribute {
    static readonly canDefer: boolean;
    extract(): Promise<void>;
}
