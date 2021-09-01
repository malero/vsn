import { Attribute } from "../Attribute";
import { Tree } from "../AST";
export declare class Exec extends Attribute {
    static readonly canDefer: boolean;
    protected tree: Tree;
    compile(): Promise<void>;
    extract(): Promise<void>;
}
