import { Attribute } from "../Attribute";
import { Tag } from "../Tag";
import { Tree } from "../AST";
export declare class List extends Attribute {
    static readonly canDefer: boolean;
    static readonly scoped: boolean;
    tree: Tree;
    items: any[];
    tags: Tag[];
    protected template: Node;
    compile(): Promise<void>;
    setup(): Promise<void>;
    extract(): Promise<void>;
    protected addExistingItems(defaultList: any[] | null): Promise<void>;
    get listItemName(): string;
    get listItemModel(): string;
    remove(item: any): void;
    protected add(obj: any): Promise<void>;
}
