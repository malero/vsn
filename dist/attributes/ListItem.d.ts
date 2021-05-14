import { Attribute } from "../Attribute";
export declare class ListItem extends Attribute {
    setup(): Promise<void>;
    get listItemName(): string;
    get modelClassName(): string;
    protected configure(): Promise<void>;
    private instantiateModel;
}
