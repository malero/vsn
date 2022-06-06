import { TemplateAttribute } from "./TemplateAttribute";
export declare class ComponentAttribute extends TemplateAttribute {
    static readonly scoped: boolean;
    extract(): Promise<void>;
}
