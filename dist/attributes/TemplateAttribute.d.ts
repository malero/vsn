import { Attribute } from "../Attribute";
export declare class TemplateAttribute extends Attribute {
    static readonly canDefer: boolean;
    extract(): Promise<void>;
}
