import { Attribute } from "../Attribute";
import { Tag } from "../Tag";
export declare class List extends Attribute {
    protected items: any[];
    protected tags: Tag[];
    protected template: Node;
    setup(): Promise<void>;
    protected addExistingItems(defaultList: any[] | null): Promise<void>;
    get listItemName(): string;
    get listItemModel(): string;
    remove(item: any): void;
    protected add(obj: any): void;
}
