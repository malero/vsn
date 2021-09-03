import { Attribute } from "../Attribute";
import { Tree } from "../AST";
export declare abstract class On extends Attribute {
    protected handler: Tree;
    static readonly WindowEvents: string[];
    compile(): Promise<void>;
    handleEvent(e: any): Promise<void>;
    connect(): Promise<void>;
}
