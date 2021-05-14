import { Attribute } from "../Attribute";
import { Tree } from "../ast";
export declare class Click extends Attribute {
    protected clickHandler: Tree;
    setup(): Promise<void>;
    onClick(e: any): void;
}
