import { Attribute } from "../Attribute";
import { Tree } from "../AST";
export declare class ScopeAttribute extends Attribute {
    static readonly canDefer: boolean;
    static readonly scoped: boolean;
    protected tree: Tree;
    compile(): Promise<void>;
    extract(): Promise<void>;
}
