import { Attribute } from "../Attribute";
import { Tree } from "../AST";
export declare class Exec extends Attribute {
    protected tree: Tree;
    compile(): Promise<void>;
    extract(): Promise<void>;
}
