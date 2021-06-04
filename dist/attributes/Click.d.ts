import { Attribute } from "../Attribute";
import { Tree } from "../AST";
export declare class Click extends Attribute {
    protected clickHandler: Tree;
    compile(): Promise<void>;
    connect(): Promise<void>;
    onClick(e: any): Promise<void>;
}
