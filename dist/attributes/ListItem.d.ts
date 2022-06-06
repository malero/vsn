import { Attribute } from "../Attribute";
import { Tag } from "../Tag";
import { List } from "./List";
export declare class ListItem extends Attribute {
    static readonly canDefer: boolean;
    static readonly scoped: boolean;
    static readonly ERROR_NO_PARENT = "Cannot find list parent.";
    protected _list: Tag;
    get list(): Tag;
    setup(): Promise<void>;
    get listItemName(): string;
    getList(): Promise<List>;
    private instantiateModel;
}
