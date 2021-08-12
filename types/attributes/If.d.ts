import { Attribute } from "../Attribute";
import { Tree } from "../AST";
export declare class If extends Attribute {
    protected tree: Tree;
    compile(): Promise<void>;
    extract(): Promise<void>;
    connect(): Promise<void>;
    evaluate(): Promise<void>;
    onChange(): Promise<void>;
}
