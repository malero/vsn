import {Tag} from "./Tag";
import {VisionHelper} from "./helpers/VisionHelper";
import {EventDispatcher} from "./EventDispatcher";

export enum AttributeState {
    Instantiated,
    Deferred,
    Compiled,
    Setup,
    Extracted,
    Connected,
    Built
}

export abstract class Attribute extends EventDispatcher {
    protected _state: AttributeState;
    public static readonly scoped: boolean = false;
    public static readonly canDefer: boolean = true;

    constructor(
        public readonly tag: Tag,
        public readonly attributeName: string,
        public readonly slot?: Tag
    ) {
        super();
        this.configure();
        if (VisionHelper.window) VisionHelper.window['Attributes'].push(this);
    }

    public get origin(): Tag {
        return this.slot || this.tag;
    }

    public get state(): AttributeState {
        return this._state;
    }

    protected async defer() {
        this.setState(AttributeState.Deferred);
    }
    protected async configure() {
        this.setState(AttributeState.Instantiated);
    };
    public async compile() {
        this.setState(AttributeState.Compiled);
    };
    public async setup() {
        this.setState(AttributeState.Setup);
    };

    public async extract() {
        this.setState(AttributeState.Extracted);
    };
    public async connect() {
        this.setState(AttributeState.Connected);
    }
    public async evaluate() {
        this.setState(AttributeState.Built);
    };

    public getAttributeValue(fallback: any = null) {
        return this.origin.getRawAttributeValue(this.attributeName, fallback);
    }

    public getAttributeBinding(fallback: any = null): string {
        return this.origin.getAttributeBinding(this.attributeName) || fallback;
    }

    public getAttributeModifiers(fallback: any = []): string[] {
        const modifiers = this.origin.getAttributeModifiers(this.attributeName);
        return modifiers.length && modifiers || fallback;
    }

    public hasModifier(mod: string): boolean {
        return this.getAttributeModifiers().indexOf(mod) > -1;
    }

    public mutate(mutation: MutationRecord): void {}

    public set value(value: string) {
        this.origin.element.setAttribute(this.attributeName, value);
    }

    public get value(): string {
        return this.origin.element.getAttribute(this.attributeName) || '';
    }

    public async apply(fnc: Function) {
        for (const element of this.origin.delegates) {
            await fnc(element);
        }
    }

    private setState(state: AttributeState) {
        const previousState = this._state;
        this._state = state;
        this.dispatch('state', {
            state: state,
            previousState: previousState,
            attribute: this
        });
    }

    public static create(tag: Tag, attributeName: string, cls: any, slot?: Tag): Attribute {
        return new cls(tag, attributeName, slot);
    }
}
