import { Attribute } from "../Attribute";
import { Tree } from "../ast";
export declare class If extends Attribute {
    protected tree: Tree;
    setup(): Promise<void>;
    execute(): Promise<void>;
    onChange(): void;
}
