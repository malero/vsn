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

export class Tag extends EventDispatcher {
    public readonly rawAttributes: { [key: string]: string; };
    public readonly parsedAttributes: { [key: string]: string[]; };
    protected attributes: Attribute[];
    protected _parent: Tag;
    protected _children: Tag[] = [];
    protected _scope: Scope;
    protected _controller: Controller;

    public static readonly attributeMap: { [attr: string]: any; } = {
        'v-name': Name,
        'v-controller': ControllerAttribute,
        'v-model': ModelAttribute,
        'v-list': List,
        'v-list-item': ListItem,
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
        this.scope = new Scope();
        this.rawAttributes = {};
        this.parsedAttributes = {};
        this.attributes = [];
        this.onclickHandlers = [];

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

        this.element.onclick = this.onclick.bind(this);
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

    public get parent(): Tag {
        return this._parent;
    }

    public set parent(tag: Tag) {
        this._parent = tag;
        tag.addChild(this);
        this.scope.parent = tag.scope;
    }

    public get scope(): Scope {
        return this._scope;
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

    isConstructor(obj): boolean {
      return obj &&
          obj.hasOwnProperty("prototype") &&
          !!obj.prototype &&
          !!obj.prototype.constructor &&
          !!obj.prototype.constructor.name;
    }

    public wrap(obj: any, triggerUpdates: boolean = false) {
        if (this.isConstructor(obj)) {
            obj = new obj();
        }

        this.scope.wrap(obj, triggerUpdates);
        return obj;
    }

    public decompose() {
        this.element.remove();
    }

    public recompose() {
        this._parent.element.appendChild(this.element)
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

        return this.parent.findAncestorByAttribute(attr);
    }

    public hasAttribute(attr: string): boolean {
        return !!this.parsedAttributes[attr];
    }

    public getAttribute(key: string) {
        const cls: any = Tag.attributeMap[key];
        if (!cls) return;
        for (const attr of this.attributes)
            if (attr instanceof cls)
                return attr;

    }

    public getRawAttributeValue(key: string, fallback: any = null) {
        return this.rawAttributes[key] && this.rawAttributes[key] || fallback;
    }

    public getParsedAttributeValue(key: string, index: number = 0, fallback: any = null) {
        return this.parsedAttributes[key] && this.parsedAttributes[key][index] || fallback;
    }

    public async buildAttributes() {
        this.attributes.length = 0;

        for (const attr in this.rawAttributes) {
            const attrClass = this.getAttributeClass(attr);
            if (attrClass)
                this.attributes.push(new attrClass(this, attr));
        }
    }

    public async setupAttributes() {
        for (const attr of this.attributes) {
            await attr.setup();
        }
    }

    public async executeAttributes() {
        for (const attr of this.attributes) {
            await attr.execute();
        }
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
