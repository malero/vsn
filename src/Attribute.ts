import {Tag} from "./Tag";
import {VisionHelper} from "./helpers/VisionHelper";


export abstract class Attribute {
    public static readonly scoped: boolean = false;
    public static readonly cache: {[key: string]: Attribute} = {};

    constructor(
        public readonly tag: Tag,
        public readonly attributeName: string
    ) {
        this.configure();
        if (VisionHelper.window) VisionHelper.window['Attributes'].push(this);
        Attribute.cache[attributeName] = this;
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

    public getAttributeModifiers(fallback: any = []): string[] {
        const modifiers = this.tag.getAttributeModifiers(this.attributeName);
        return modifiers.length && modifiers || fallback;
    }

    public hasModifier(mod: string): boolean {
        return this.getAttributeModifiers().indexOf(mod) > -1;
    }

    public mutate(mutation: MutationRecord): void {}

    public set value(value: string) {
        this.tag.element.setAttribute(this.attributeName, value);
    }

    public get value(): string {
        return this.tag.element.getAttribute(this.attributeName) || '';
    }
}
