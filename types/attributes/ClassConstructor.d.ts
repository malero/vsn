import { Attribute } from "../Attribute";
export declare class ClassConstructor extends Attribute {
    static readonly canDefer: boolean;
    static readonly scoped: boolean;
    protected attributeKey: string;
    protected className: string;
    setup(): Promise<void>;
    protected instantiateClass(cls: any): void;
}
