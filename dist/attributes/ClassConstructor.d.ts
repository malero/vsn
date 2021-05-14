import { Attribute } from "../Attribute";
export declare class ClassConstructor extends Attribute {
    protected attributeKey: string;
    protected className: string;
    setup(): Promise<void>;
    execute(): Promise<void>;
    protected instantiateClass(cls: any): void;
}
