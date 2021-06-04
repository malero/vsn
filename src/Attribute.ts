import {Tag} from "./Tag";

export abstract class Attribute {
    public static readonly scoped: boolean = false;

    protected constructor(
        public readonly tag: Tag,
        public readonly attributeName: string
    ) {
        this.configure();
    }

    protected async configure() {};
    public async compile() {};
    public async setup() {};
    public async extract() {};
    public async connect() {}
    public async evaluate() {};

    public getAttributeValue(fallback: any = null) {
        return this.tag.getRawAttributeValue(this.attributeName, fallback);
    }

    public getAttributeBinding(fallback: any = null): string {
        return this.tag.getAttributeBinding(this.attributeName) || fallback;
    }

    public mutate(mutation: MutationRecord): void {}
}
