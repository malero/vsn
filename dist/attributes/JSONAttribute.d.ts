import { Attribute } from "../Attribute";
export declare class JSONAttribute extends Attribute {
    static readonly canDefer: boolean;
    extract(): Promise<void>;
}
