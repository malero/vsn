import { Attribute } from "../Attribute";
export declare class ControllerAttribute extends Attribute {
    static readonly canDefer: boolean;
    static readonly scoped: boolean;
    readonly registryName: string;
    protected attributeKey: string;
    protected className: string;
    protected defaultClassName: string;
    setup(): Promise<void>;
    protected instantiateClass(cls: any): any;
}
