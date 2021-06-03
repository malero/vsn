import { Attribute } from "../Attribute";
import { Tag } from "../Tag";
export declare class ListItem extends Attribute {
    static readonly scoped: boolean;
    static readonly ERROR_NO_PARENT = "Cannot find list parent.";
    protected _list: Tag;
    get list(): Tag;
    setup(): Promise<void>;
    get listItemName(): string;
    get modelClassName(): string;
    protected configure(): Promise<void>;
    private instantiateModel;
}
