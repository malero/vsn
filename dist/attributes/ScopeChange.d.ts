import { Attribute } from "../Attribute";
import { Tree } from "../AST";
export declare abstract class ScopeChange extends Attribute {
    static readonly canDefer: boolean;
    protected handler: Tree;
    compile(): Promise<void>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    handleEvent(e: any): Promise<void>;
}
