import {Tag} from "./Tag";

export abstract class Attribute {
    protected constructor(
        public readonly tag: Tag,
        public readonly attributeName: string
    ) {
        this.configure();
    }

    protected async configure() {};
    public async setup() {};
    public async execute() {};

    public getAttributeValue(fallback: any = null) {
        return this.tag.getRawAttributeValue(this.attributeName, fallback);
    }

    public getAttributeBinding(fallback: any = null): string {
        return this.tag.getAttributeBinding(this.attributeName) || fallback;
    }

    public mutate(mutation: MutationRecord): void {}
}
