import { Attribute } from "../Attribute";
import { Tree } from "../AST";
export declare class Click extends Attribute {
    protected clickHandler: Tree;
    setup(): Promise<void>;
    connect(): Promise<void>;
    onClick(e: any): void;
}
