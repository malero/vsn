import { Attribute } from "../Attribute";
export declare class Format extends Attribute {
    static readonly canDefer: boolean;
    extract(): Promise<void>;
}
