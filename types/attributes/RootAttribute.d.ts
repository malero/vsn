import { Attribute } from "../Attribute";
export declare class RootAttribute extends Attribute {
    static readonly scoped: boolean;
    setup(): Promise<void>;
}
