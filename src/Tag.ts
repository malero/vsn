import {Scope} from "./Scope";
import {Attribute} from "./Attribute";
import {Bind} from "./attributes/Bind";
import {Click} from "./attributes/Click";
import {List} from "./attributes/List";
import {ListItem} from "./attributes/ListItem";
import {EventDispatcher} from "simple-ts-event-dispatcher";
import {DOM} from "./DOM";
import {Name} from "./attributes/Name";
import {If} from "./attributes/If";
import {ClickToggleClass} from "./attributes/ClickToggleClass";
import {ClickRemoveClass} from "./attributes/ClickRemoveClass";
import {ControllerAttribute} from "./attributes/ControllerAttribute";
import {ModelAttribute} from "./attributes/ModelAttribute";
import {Controller} from "./Controller";
import {VisionHelper} from "./helpers/VisionHelper";
import {SetAttribute} from "./attributes/SetAttribute";
import {RootAttribute} from "./attributes/RootAttribute";

export enum TagState {
    Instantiated,
    AttributesBuilt,
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

    public static readonly attributeMap: { [attr: string]: any; } = {
        'v-root': RootAttribute,
        'v-name': Name,
        'v-controller': ControllerAttribute,
        'v-model': ModelAttribute,
        'v-list': List,
        'v-list-item': ListItem,
        'v-set': SetAttribute,
        'v-bind': Bind,
        'v-click': Click,
        'v-click-toggle-class': ClickToggleClass,
        'v-click-remove-class': ClickRemoveClass,
        'v-if': If,
    };

    protected inputTags: string[] = [
        'input',
        'select',
        'textarea'
    ];

    protected onclickHandlers: any[];

    constructor(
        public readonly element: HTMLElement,
        public readonly dom: DOM
    ) {
        super();
        this.rawAttributes = {};
        this.parsedAttributes = {};
        this.attributes = [];
        this.onclickHandlers = [];
        this.element.onclick = this.onclick.bind(this);

        // Build element Attributes
        for (let i: number = 0; i < this.element.attributes.length; i++) {
            const a = this.element.attributes[i];
            if (a.name.substr(0, 2) == 'v-') {
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

        this._state = TagState.Instantiated;
    }

    public evaluate(): void {
        for (const attr of this.attributes) {
            attr.evaluate();
        }
    }

    mutate(mutation: MutationRecord): void {
        for (const attr of this.attributes) {
            attr.mutate(mutation);
        }
        this.trigger('mutate', mutation);
    }

    getAttributeClass(attr: string): any {
        attr = this.getAttributeName(attr);

        return Tag.attributeMap[attr]
    }

    getAttributeName(attr: string): string {
        if (attr.indexOf(':') > -1) {
            const parts: string[] = attr.split(':');
            attr = parts[0];
        }

        return attr;
    }

    getAttributeBinding(attr: string): string {
        if (attr.indexOf(':') > -1) {
            const parts: string[] = attr.split(':');
            return parts[1];
        }

        return null;
    }

    get isInput(): boolean {
        return this.inputTags.indexOf(this.element.tagName.toLowerCase()) > -1;
    }

    public addChild(tag: Tag) {
        this._children.push(tag);
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

    public wrap(obj: any, triggerUpdates: boolean = false) {
        if (VisionHelper.isConstructor(obj)) {
            obj = new obj();
        }

        this.scope.wrap(obj, triggerUpdates);
        obj['$scope'] = this.scope;
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

    public getAttribute<T = Attribute>(key: string): T {
        const cls: any = Tag.attributeMap[key];
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

        for (const attr in this.rawAttributes) {
            const attrClass = this.getAttributeClass(attr);
            if (attrClass) {
                if (attrClass.scoped)
                    requiresScope = true;

                const attrObj = new attrClass(this, attr)
                this.attributes.push(attrObj);
            }
        }

        if (requiresScope) {
            this._scope = new Scope();
        }

        this._state = TagState.AttributesBuilt;
    }

    public async setupAttributes() {
        for (const attr of this.attributes) {
            await attr.setup();
        }
        this._state = TagState.AttributesSetup;
    }

    public async extractAttributes() {
        for (const attr of this.attributes) {
            await attr.extract();
        }
        this._state = TagState.AttributesExtracted;
    }

    public async connectAttributes() {
        for (const attr of this.attributes) {
            await attr.connect();
        }
        this._state = TagState.AttributesConnected;
    }

    public finalize(): void {
        this._state = TagState.Built;
    }

    protected onclick(e) {
        this.scope.set('$event', e);
        for (const handler of this.onclickHandlers)
        {
            handler(e);
        }
    }

    public addClickHandler(handler) {
        this.onclickHandlers.push(handler);
    }
}
