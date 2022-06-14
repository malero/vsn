import { Attribute } from "../Attribute";
import { Tag } from "../Tag";
export declare class List extends Attribute {
    static readonly MetaItemSetupFlag = "vsn-list-item-setup";
    static readonly canDefer: boolean;
    static readonly scoped: boolean;
    items: any[];
    tags: Tag[];
    protected template: Node;
    setup(): Promise<void>;
    extract(): Promise<void>;
    protected addExistingItems(defaultList: any[] | null): Promise<void>;
    get listItemName(): string;
    get listItemModel(): string;
    remove(item: any): void;
    protected add(obj: any): Promise<void>;
    setupTagScope(tag: Tag, obj: any): Promise<void>;
}
