import { Attribute } from "../Attribute";
import { Tree } from "../AST";
export declare abstract class ScopeChange extends Attribute {
    protected handler: Tree;
    compile(): Promise<void>;
    connect(): Promise<void>;
    handleEvent(e: any): Promise<void>;
}
