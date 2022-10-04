import { Attribute } from "../Attribute";
import { Tree } from "../AST";
export declare class Exec extends Attribute {
    static readonly canDefer: boolean;
    protected tree: Tree;
    get code(): any;
    compile(): Promise<void>;
    extract(): Promise<void>;
    execute(): Promise<void>;
}
