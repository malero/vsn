import {Tag} from "./Tag";

export abstract class Attribute {
    protected constructor(
        public readonly tag: Tag
    ) {
        this.configure();
    }

    public setup(): void {};
    protected configure(): void {};
}
