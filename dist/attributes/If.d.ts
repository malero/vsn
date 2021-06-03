import { Attribute } from "../Attribute";
import { Tree } from "../AST";
export declare class If extends Attribute {
    protected tree: Tree;
    setup(): Promise<void>;
    extract(): Promise<void>;
    connect(): Promise<void>;
    evaluate(): Promise<void>;
    onChange(): Promise<void>;
}
