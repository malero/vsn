import {Scope} from "./Scope";
import {Attribute} from "./Attribute";
import {Bind} from "./attributes/Bind";
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
import {StandardAttribute} from "./attributes/StandardAttribute";
import {TypeAttribute} from "./attributes/TypeAttribute";
import {ScopeAttribute} from "./attributes/ScopeAttribute";
import {AddClassIf} from "./attributes/AddClassIf";
import {DisableIf} from "./attributes/DisableIf";
import {KeyUp} from "./attributes/KeyUp";
import {KeyDown} from "./attributes/KeyDown";
import {ScopeChange} from "./attributes/ScopeChange";
import {Exec} from "./attributes/Exec";
import {On} from "./attributes/On";

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
    public readonly flags: {[key: string]: boolean} = {};

    public static readonly attributeMap: { [attr: string]: any; } = {
        'vsn-root': RootAttribute,
        'vsn-exec': Exec,
        'vsn-scope': ScopeAttribute,
        'vsn-scope-change': ScopeChange,
        'vsn-name': Name,
        'vsn-controller': ControllerAttribute,
        'vsn-model': ModelAttribute,
        'vsn-list': List,
        'vsn-list-item': ListItem,
        'vsn-set': SetAttribute,
        'vsn-bind': Bind,
        'vsn-on': On,
        'vsn-key-up': KeyUp,
        'vsn-key-down': KeyDown,
        'vsn-click-toggle-class': ClickToggleClass,
        'vsn-click-remove-class': ClickRemoveClass,
        'vsn-if': If,
        'vsn-disable-if': DisableIf,
        'vsn-add-class-if': AddClassIf,
        'vsn-type': TypeAttribute,
    };

    protected inputTags: string[] = [
        'input',
        'select',
        'textarea'
    ];

    protected onEventHandlers: {[key:string]:any[]};

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
        return window.getComputedStyle(this.element);
    }

    public analyzeElementAttributes() {
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

        if (this.element.getAttribute('id'))
            requiresScope = true;

        if (requiresScope) {
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
        for (const attr of this.attributes) {
            await attr.connect();
        }
        this._state = TagState.AttributesConnected;
        this.callOnWrapped('$bound');
    }

    public finalize(): void {
        this._state = TagState.Built;
        this.callOnWrapped('$built', this, this.scope);
    }

    public callOnWrapped(method, ...args: any[]): boolean {
        if (this.scope && this.scope.wrapped && this.scope.wrapped[method]) {
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
        for (const handler of this.onEventHandlers[eventType])
        {
            handler(e);
        }
    }

    public addEventHandler(eventType: string, handler) {
        let passiveValue: boolean = null;
        if (eventType.indexOf('|active')) {
            passiveValue = false;
            eventType = eventType.replace('|active', '');
        } else if (eventType.indexOf('|passive')) {
            passiveValue = true;
            eventType = eventType.replace('|passive', '');
        }

        if (!this.onEventHandlers[eventType]) {
            this.onEventHandlers[eventType] = [];
            const element: HTMLElement | Window = On.WindowEvents.indexOf(eventType) > -1 ? window : this.element;
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

        const standardAttribute = new StandardAttribute(this, attributeName);
        this.attributes.push(standardAttribute);
        await standardAttribute.compile();
        await standardAttribute.setup();
        await standardAttribute.extract();
        await standardAttribute.connect();

        return standardAttribute;
    }
}
