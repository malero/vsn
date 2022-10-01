import { Attribute } from "../Attribute";
import { Tree } from "../AST";
export declare class XHRAttribute extends Attribute {
    static readonly canDefer: boolean;
    protected tree: Tree;
    get code(): any;
    compile(): Promise<void>;
    connect(): Promise<void>;
    get isForm(): boolean;
    get isAnchor(): boolean;
    handleEvent(e: any): Promise<void>;
}
