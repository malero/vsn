import { Attribute } from "../Attribute";
import { Tag } from "../Tag";
export declare class List extends Attribute {
    protected items: Tag[];
    protected template: Node;
    setup(): void;
    readonly listItemName: string;
    protected newItem(): void;
}
