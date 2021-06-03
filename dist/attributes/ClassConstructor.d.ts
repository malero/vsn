import { Attribute } from "../Attribute";
export declare class ClassConstructor extends Attribute {
    static readonly scoped: boolean;
    protected attributeKey: string;
    protected className: string;
    setup(): Promise<void>;
    extract(): Promise<void>;
    protected instantiateClass(cls: any): void;
}
