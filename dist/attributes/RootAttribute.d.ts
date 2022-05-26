import { Attribute } from "../Attribute";
export declare class RootAttribute extends Attribute {
    static readonly canDefer: boolean;
    static readonly scoped: boolean;
    setup(): Promise<void>;
    registerFunction(name: string, fn: Function): Promise<void>;
}
