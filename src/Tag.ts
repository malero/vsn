import {Scope} from "./Scope";
import {Attribute} from "./Attribute";
import {Bind} from "./attributes/Bind";
import {Click} from "./attributes/Click";
import {Controller} from "./attributes/Controller";
import {List} from "./attributes/List";
import {ListItem} from "./attributes/ListItem";
import {EventDispatcher} from "simple-ts-event-dispatcher";
import {DOM} from "./DOM";
import {Name} from "./attributes/Name";
import {If} from "./attributes/If";

export class Tag extends EventDispatcher {
    public readonly rawAttributes: { [key: string]: string; };
    protected attributes: Attribute[];
    protected _parent: Tag;
    protected _scope: Scope;

    public static readonly attributeMap: { [attr: string]: any; } = {
        'v-name': Name,
        'v-class': Controller,
        'v-list': List,
        'v-list-item': ListItem,
        'v-bind': Bind,
        'v-click': Click,
        'v-if': If,
    };

    protected inputTags: string[] = [
        'input',
        'select',
        'textarea'
    ];

    constructor(
        public readonly element: HTMLElement,
        public readonly dom: DOM
    ) {
        super();
        this.scope = new Scope();
        this.rawAttributes = {};
        this.attributes = [];

        for (let i: number = 0; i < this.element.attributes.length; i++) {
            const a = this.element.attributes[i];
            if (a.name.substr(0, 2) == 'v-') {
                this.rawAttributes[a.name] = a.value;
            }
        }
    }

    get isInput(): boolean {
        return this.inputTags.indexOf(this.element.tagName.toLowerCase()) > -1;
    }


    public get parent(): Tag {
        return this._parent;
    }

    public set parent(tag: Tag) {
        this._parent = tag;
        this.scope.parent = tag.scope;
    }

    public get scope(): Scope {
        return this._scope;
    }

    public set scope(scope: Scope) {
        this._scope = scope;
    }

    isConstructor(obj): boolean {
      return Object.hasOwnProperty("prototype") &&
          !!obj.prototype &&
          !!obj.prototype.constructor &&
          !!obj.prototype.constructor.name;
    }

    public wrap(obj: any, triggerUpdates: boolean = false) {
        if (this.isConstructor(obj))
            obj = new obj();

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

    public getAttribute(key: string) {
        const cls: any = Tag.attributeMap[key];
        if (!cls) return;
        for (const attr of this.attributes)
            if (attr instanceof cls)
                return attr;

    }

    public buildAttributes() {
        this.attributes.length = 0;

        for (const attr in this.rawAttributes) {
            if (Tag.attributeMap[attr])
                this.attributes.push(new Tag.attributeMap[attr](this));
        }
    }

    public setupAttributes() {
        for (const attr of this.attributes) {
            attr.setup();
        }
    }
}
