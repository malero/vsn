import {Tag} from "./Tag";
import {VisionHelper} from "./helpers/VisionHelper";
import {EventDispatcher} from "simple-ts-event-dispatcher";

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
        public readonly attributeName: string
    ) {
        super();
        this.configure();
        if (VisionHelper.window) VisionHelper.window['Attributes'].push(this);
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

    private setState(state: AttributeState) {
        const previousState = this._state;
        this._state = state;
        this.trigger('state', {
            state: state,
            previousState: previousState,
            attribute: this
        });
    }
}
