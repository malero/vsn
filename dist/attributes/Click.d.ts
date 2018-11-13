import { Attribute } from "../Attribute";
import { Tree } from "../ast";
export declare class Click extends Attribute {
    protected clickHandler: Tree;
    setup(): void;
    onClick(): void;
}
