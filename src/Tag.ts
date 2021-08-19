import {Scope} from "./Scope";
import {Attribute} from "./Attribute";
import {EventDispatcher} from "simple-ts-event-dispatcher";
import {DOM} from "./DOM";
import {Controller} from "./Controller";
import {VisionHelper} from "./helpers/VisionHelper";
import {StandardAttribute} from "./attributes/StandardAttribute";
import {On} from "./attributes/On";
import {Registry} from "./Registry";


export enum TagState {
    Instantiated,
    AttributesBuilt,
    AttributesCompiled,
    AttributesSetup,
    AttributesExtracted,
    AttributesConnected,
    Built,
}

export class Tag extends EventDispatcher {
    public readonly rawAttributes: { [key: string]: string; };
    public readonly parsedAttributes: { [key: string]: string[]; };
    protected _state: TagState;
    protected attributes: Attribute[];
    protected _parentTag: Tag;
    protected _children: Tag[] = [];
    protected _scope: Scope;
    protected _controller: Controller;

    protected inputTags: string[] = [
        'input',
        'select',
        'textarea'
    ];

    protected onEventHandlers: {[key:string]:any[]};
    private _uniqueScope: boolean = false;

    public get uniqueScope(): boolean {
        return this._uniqueScope;
    };

    constructor(
        public readonly element: HTMLElement,
        public readonly dom: DOM
    ) {
        super();
        this.rawAttributes = {};
        this.parsedAttributes = {};
        this.attributes = [];
        this.onEventHandlers = {};
        this.analyzeElementAttributes();
        this._state = TagState.Instantiated;
    }

    public get style(): CSSStyleDeclaration {
        return this.element.style;
    }

    public get computedStyle(): CSSStyleDeclaration {
        return VisionHelper.window && window.getComputedStyle(this.element) || null;
    }

    public analyzeElementAttributes() {
        if (!this.element.attributes || this.element.attributes.length <= 0) return;
        for (let i: number = 0; i < this.element.attributes.length; i++) {
            const a = this.element.attributes[i];
            this.rawAttributes[a.name] = a.value;
            if (a.name.indexOf(':') > -1) {
                const nameParts: string[] = a.name.split(':');
                const values = nameParts.slice(1);
                values.push(a.value);
                this.parsedAttributes[nameParts[0]] = values;
            } else {
                this.parsedAttributes[a.name] = [null, a.value];
            }
        }
    }

    public async evaluate() {
        for (const attr of this.attributes) {
            await attr.evaluate();
        }
    }

    mutate(mutation: MutationRecord): void {
        for (const attr of this.attributes) {
            attr.mutate(mutation);
        }
        this.trigger('mutate', mutation);
    }

    public get(attr: string) {
        this.element.getAttribute(attr);
    }

    public set(attr: string, value) {
        this.element.setAttribute(attr, value);
    }

    public async getAttributeClass(attr: string) {
        if (!attr.startsWith('vsn-'))
            return null;
        attr = this.getAttributeName(attr);
        return Registry.instance.attributes.get(attr);
    }

    getAttributeName(attr: string): string {
        attr = attr.split('|')[0];
        if (attr.indexOf(':') > -1) {
            const parts: string[] = attr.split(':');
            attr = parts[0];
        }

        return attr;
    }

    getAttributeBinding(attr: string): string {
        attr = attr.split('|')[0];
        if (attr.indexOf(':') > -1) {
            const parts: string[] = attr.split(':');
            return parts[1];
        }

        return null;
    }

    getAttributeModifiers(attr: string): string[] {
        return attr.split('|').splice(1);
    }

    get isInput(): boolean {
        return this.inputTags.indexOf(this.element.tagName.toLowerCase()) > -1;
    }

    set value(value) {
        if (this.isInput) {
            this.element.setAttribute('value', value);
            (this.element as any).value = value;
        } else {
            this.element.innerText = value;
        }
    }

    get value(): string {
        if (this.isInput) {
            return (this.element as any).value;
        } else {
            return this.element.textContent;
        }
    }

    public addChild(tag: Tag) {
        this._children.push(tag);
    }

    public get children(): Tag[] {
        return [...this._children];
    }

    public get parentTag(): Tag {
        return this._parentTag;
    }

    public set parentTag(tag: Tag) {
        if (this.element === document.body)
            return;

        this._parentTag = tag;
        tag.addChild(this);

        if (this.scope !== tag.scope)
            this.scope.parentScope = tag.scope;
    }

    public get scope(): Scope {
        if (!!this._scope)
            return this._scope;

        if (!!this._parentTag)
            return this._parentTag.scope;

        return null;
    }

    public set scope(scope: Scope) {
        this._scope = scope;
    }

    public get controller(): Controller {
        return this._controller;
    }

    public set controller(controller: Controller) {
        this._controller = controller;
    }

    public wrap(obj: any, triggerUpdates: boolean = false, updateFromWrapped: boolean = true) {
        if (VisionHelper.isConstructor(obj)) {
            obj = new obj();
        }

        this.scope.wrap(obj, triggerUpdates, updateFromWrapped);
        obj['$scope'] = this.scope;
        obj['$tag'] = this;
        obj['$el'] = this.element;
        return obj;
    }

    public unwrap(): void {
        this.scope.unwrap();
    }

    public removeFromDOM() {
        this.element.remove();
    }

    public addToParentElement() {
        this._parentTag.element.appendChild(this.element)
    }

    public hide() {
        this.element.hidden = true;
    }

    public show() {
        this.element.hidden = false;
    }

    public findAncestorByAttribute(attr: string): Tag {
        if (this.hasAttribute(attr))
            return this;

        return this.parentTag ? this.parentTag.findAncestorByAttribute(attr) : null;
    }

    public hasAttribute(attr: string): boolean {
        return !!this.parsedAttributes[attr];
    }

    public async getAttribute<T = Attribute>(key: string): Promise<T> {
        const cls: any = await Registry.instance.attributes.get(key);
        if (!cls) return;
        for (const attr of this.attributes)
            if (attr instanceof cls)
                return attr as any as T;
    }

    public getRawAttributeValue(key: string, fallback: any = null) {
        return this.rawAttributes[key] && this.rawAttributes[key] || fallback;
    }

    public getParsedAttributeValue(key: string, index: number = 0, fallback: any = null) {
        return this.parsedAttributes[key] && this.parsedAttributes[key][index] || fallback;
    }

    public async buildAttributes() {
        let requiresScope = false;
        this.attributes.length = 0;
        const isMobile: boolean = VisionHelper.isMobile();

        for (let attr in this.rawAttributes) {
            if (this.hasModifier(attr, 'mobile')) {
                if (!isMobile) {
                    continue;
                }
            }

            if (this.hasModifier(attr, 'desktop')) {
                if (isMobile) {
                    continue;
                }
            }

            const attrClass = await this.getAttributeClass(attr);
            if (attrClass) {
                if (attrClass.scoped)
                    requiresScope = true;

                const attrObj = new attrClass(this, attr)
                this.attributes.push(attrObj);
            }
        }

        if (this.element.getAttribute('id'))
            requiresScope = true;

        if (requiresScope && !this.uniqueScope) {
            this._uniqueScope = true;
            this._scope = new Scope();
        }

        this._state = TagState.AttributesBuilt;
    }

    public async compileAttributes() {
        for (const attr of this.attributes) {
            await attr.compile();
        }

        this._state = TagState.AttributesCompiled;
    }

    public async setupAttributes() {
        for (const attr of this.attributes) {
            await attr.setup();
        }
        this.dom.registerElementInRoot(this);

        this._state = TagState.AttributesSetup;
        this.callOnWrapped('$setup');
    }

    public async extractAttributes() {
        for (const attr of this.attributes) {
            await attr.extract();
        }
        this._state = TagState.AttributesExtracted;
        this.callOnWrapped('$extracted');
    }

    public async connectAttributes() {
        if (this.isInput) {
            this.addEventHandler('input', [], this.inputMutation.bind(this));
        }

        for (const attr of this.attributes) {
            await attr.connect();
        }
        this._state = TagState.AttributesConnected;
        this.callOnWrapped('$bound');
    }

    public inputMutation(e) {
        this.element.setAttribute('value', e.target.value);
    }

    public finalize(): void {
        this._state = TagState.Built;
        this.callOnWrapped('$built', this, this.scope, this.element);
    }

    public callOnWrapped(method, ...args: any[]): boolean {
        if (this._uniqueScope && this.scope && this.scope.wrapped && this.scope.wrapped[method]) {
            this.scope.wrapped[method](...args);
            return true;
        }
        return false;
    }

    protected handleEvent(eventType: string, e) {
        if (e)
            e.stopPropagation();
        if (!this.onEventHandlers[eventType])
            return;

        this.scope.set('$event', e);
        this.scope.set('$value', this.value);
        for (const handler of this.onEventHandlers[eventType])
        {
            handler(e);
        }
    }

    public hasModifier(attribute: string, modifier: string): boolean {
        return attribute.indexOf(`|${modifier}`) > -1;
    }

    public stripModifier(attribute: string, modifier: string): string {
        return attribute.replace(`|${modifier}`, '');
    }

    public addEventHandler(eventType: string, modifiers: string[], handler) {
        let passiveValue: boolean = null;
        if (modifiers.indexOf('active') > -1) {
            passiveValue = false;
        } else if (modifiers.indexOf('passive') > -1) {
            passiveValue = true;
        }

        if (!this.onEventHandlers[eventType]) {
            this.onEventHandlers[eventType] = [];
            const element: HTMLElement | Window = On.WindowEvents.indexOf(eventType) > -1 && window ? window : this.element;
            const opts: any = {};
            if (eventType.indexOf('touch') > -1 || passiveValue !== null)
                opts['passive'] = passiveValue === null && true || passiveValue;

            element.addEventListener(eventType, this.handleEvent.bind(this, eventType), opts);
        }

        this.onEventHandlers[eventType].push(handler);
    }

    async watchAttribute(attributeName: string) {
        for (const attribute of this.attributes) {
            if (attribute instanceof StandardAttribute && attribute.attributeName == attributeName) {
                return attribute;
            }
        }

        // Standard attribute requires a unique scope
        // @todo: Does this cause any issues with attribute bindings on the parent scope prior to having its own scope? hmm...
        if (!this.uniqueScope) {
            this._uniqueScope = true;
            this._scope = new Scope();

            if (this.parentTag) {
                this.scope.parentScope = this.parentTag.scope;
            }
        }

        const standardAttribute = new StandardAttribute(this, attributeName);
        this.attributes.push(standardAttribute);
        await standardAttribute.compile();
        await standardAttribute.setup();
        await standardAttribute.extract();
        await standardAttribute.connect();

        return standardAttribute;
    }
}
