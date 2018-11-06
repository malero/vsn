import { Tag } from "./Tag";
export declare abstract class Attribute {
    readonly tag: Tag;
    protected constructor(tag: Tag);
    setup(): void;
    protected configure(): void;
}
