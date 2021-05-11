import {Tag} from "./Tag";

export abstract class Attribute {
    protected constructor(
        public readonly tag: Tag
    ) {
        this.configure();
    }

    protected async configure() {};
    public async setup() {};
    public async execute() {};

    public getAttributeValue(key: string, index: number = 0, fallback: any = null) {
        return this.tag.getRawAttributeValue(key, index, fallback);
    }

    public getAttributeValues(key: string, fallback: any = null) {
        return this.tag.rawAttributes[key] || fallback;
    }
}
