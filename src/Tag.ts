import {Scope} from "./Scope";
import {Attribute, AttributeState} from "./Attribute";
import {DOM} from "./DOM";
import {Controller} from "./Controller";
import {VisionHelper} from "./helpers/VisionHelper";
import {StandardAttribute} from "./attributes/StandardAttribute";
import {On} from "./attributes/On";
import {Registry} from "./Registry";
import {benchmarkEnd, benchmarkStart} from "./Bencmark";
import {DOMObject} from "./DOM/DOMObject";
import {Tree} from "./AST";
import {StyleAttribute} from "./attributes/StyleAttribute";

export enum TagState {
    Instantiated,
    AttributesBuilt,
    AttributesCompiled,
    AttributesSetup,
    AttributesExtracted,
    AttributesConnected,
    Built,
}

export class Tag extends DOMObject {
    public static readonly TaggedVariable: string = '_vsn_tag';
    public readonly rawAttributes: { [key: string]: string; };
    public readonly parsedAttributes: { [key: string]: string[]; };
    public readonly deferredAttributes: Attribute[] = [];
    protected _state: TagState;
    protected attributes: Attribute[];
    protected _nonDeferredAttributes: Attribute[] = [];
    protected _parentTag: Tag;
    protected _children: Tag[] = [];
    protected _controller: Controller;

    public static readonly magicAttributes: string[] = [
        '@text',
        '@html',
        '@class',
        '@value'
    ];

    protected inputTags: string[] = [
        'input',
        'select',
        'textarea'
    ];

    public get uniqueScope(): boolean {
        return this._uniqueScope;
    };

    constructor(
        element: HTMLElement,
        public readonly dom: DOM,
        ...props
    ) {
        super(element, props);
        element[Tag.TaggedVariable] = this;
        this.rawAttributes = {};
        this.parsedAttributes = {};
        this.attributes = [];
        this.onEventHandlers = {};
        this.analyzeElementAttributes();
        this._state = TagState.Instantiated;
        if (VisionHelper.window) {
            if (!VisionHelper.window['Tags']) {
                VisionHelper.window['Tags'] = [];
                VisionHelper.window['Attributes'] = [];
            }
            VisionHelper.window['Tags'].push(this);
        }
    }

    protected onAttributeStateChange(event) {
        if (event.previouseState === AttributeState.Deferred)
            this._nonDeferredAttributes.length = 0;
    }

    public get nonDeferredAttributes(): Attribute[] {
        if (this._nonDeferredAttributes.length > 0)
            return this._nonDeferredAttributes;

        const attrs: Attribute[] = this.attributes.filter(attr => attr.state !== AttributeState.Deferred);
        this._nonDeferredAttributes = attrs;
        return attrs;
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

    public async exec(code: string) {
        const tree = new Tree(code);
        await tree.prepare(this.scope, this.dom, this);
        return await tree.evaluate(this.scope, this.dom, this);
    }

    public async evaluate() {
        for (const attr of this.nonDeferredAttributes) {
            await attr.evaluate();
        }
    }

    mutate(mutation: MutationRecord): void {
        this.attributes.map(attr => attr.mutate(mutation));
        this.dispatch('mutate', mutation);
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

    get isSelect(): boolean {
        return this.element.tagName.toLowerCase() === 'select';
    }

    get isMultipleSelect(): boolean {
        return this.isSelect && this.element.hasAttribute('multiple');
    }

    set value(value: string | string[]) {
        if (this.isInput) {
            if (this.isMultipleSelect) {
                for (const option of Array.from((this.element as HTMLSelectElement).options)) {
                    option.selected = value.indexOf(option.value) > -1;
                }
            } else {
                this.element.setAttribute('value', value as string);
                (this.element as any).value = value;
            }

        } else {
            this.element.innerText = value as string;
        }
    }

    get value(): string | string[] {
        if (this.isInput) {
            if (this.isMultipleSelect) {
                return Array.from((this.element as HTMLSelectElement).options).filter((o) => o.selected).map((o) => o.value);
            }
            return (this.element as any).value;
        } else {
            return this.element.textContent;
        }
    }

    set checked(value) {
        if (this.isInput) {
            if (value) {
                this.element.setAttribute('checked', '');
                (this.element as HTMLInputElement).checked = true;
            } else {
                this.element.removeAttribute('checked');
                (this.element as HTMLInputElement).checked = false;
            }
        }
    }

    get checked(): boolean {
        if (this.isInput) {
            return (this.element as HTMLInputElement).checked;
        } else {
            return false;
        }
    }

    public addChild(tag: Tag) {
        this._children.push(tag);
    }

    public get children(): Tag[] {
        return [...this._children];
    }

    public get parentTag(): Tag {
        if (!this._parentTag) {
            let parentElement: HTMLElement = this.element.parentElement as HTMLElement;
            let foundParent = false;
            while (parentElement) {
                if (parentElement[Tag.TaggedVariable]) {
                    foundParent = true;
                    this.parentTag = parentElement[Tag.TaggedVariable];
                    break;
                }

                parentElement = parentElement.parentElement as HTMLElement;
            }

            if (!foundParent && DOM.instance.root !== this)
                return DOM.instance.root;
        }

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

        if (this.uniqueScope)
            return this.createScope(true);

        if (!!this.parentTag)
            return this.parentTag.scope;

        return null;
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

        if (obj instanceof Controller) {
            obj.init(this.scope, this, this.element);
            this.controller = obj;
        } else {
            obj['$scope'] = this.scope;
            obj['$tag'] = this;
            obj['$el'] = this.element;
        }
        this.scope.wrap(obj, triggerUpdates, updateFromWrapped);
        return obj;
    }

    public unwrap(): void {
        this.scope.unwrap();
    }

    public removeFromDOM() {
        this.element.remove();
    }

    public addToParentElement() {
        this.parentTag.element.appendChild(this.element)
    }

    public hide() {
        this.element.hidden = true;
    }

    public show() {
        this.element.hidden = false;
    }

    public findAncestorByAttribute(attr: string, includeSelf: boolean = false): Tag {
        if (includeSelf && this.hasAttribute(attr))
            return this;
        return this.parentTag ? this.parentTag.findAncestorByAttribute(attr, true) : null;
    }

    public findDescendantsByAttribute(attr: string, includeSelf: boolean = false): Tag[] {
        const tags = [];
        if (includeSelf && this.hasAttribute(attr))
            tags.push(this);

        for (const child of this.children) {
            tags.concat(child.findDescendantsByAttribute(attr, true))
        }

        return tags;
    }

    public findChildrenByAttribute(attr: string): Tag[] {
        return this.children.filter((child) => child.hasAttribute(attr));
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

    public isMagicAttribute(key: string): boolean {
        return Tag.magicAttributes.indexOf(key) > -1;
    }

    public setElementAttribute(key: string, value: any) {
        if (this.isMagicAttribute(key)) {
            if (key === '@text')
                this.element.innerText = value;
            else if (key === '@html') {
                this.element.innerHTML = value;
                DOM.instance.buildFrom(this.element);
            } else if (key === '@value')
                this.value = value;
            else if (key === '@class' && value) {
                this.element.classList.remove(...Array.from(this.element.classList));
                const classes: string[] = value instanceof Array ? value : [value];
                if (classes.length)
                    this.element.classList.add(...classes);
            }
        } else {
            this.element.setAttribute(key, value);
        }
    }

    public getElementAttribute(key: string): any {
        if (this.isMagicAttribute(key)) {
            if (key === '@text')
                return this.element.innerText;
            else if (key === '@html')
                return this.element.innerHTML;
            else if (key === '@value')
                return this.value;
            else if (key === '@class') {
                return Array.from(this.element.classList);
            }
        }
        return this.element.getAttribute(key);
    }

    public getRawAttributeValue(key: string, fallback: any = null) {
        return this.rawAttributes[key] ? this.rawAttributes[key] : fallback;
    }

    public hasRawAttribute(mod: string): boolean {
        return this.getRawAttributeValue(mod, undefined) !== undefined;
    }

    public getParsedAttributeValue(key: string, index: number = 0, fallback: any = null) {
        return this.parsedAttributes[key] && this.parsedAttributes[key][index] || fallback;
    }

    public async buildAttributes() {
        let requiresScope = false;
        let defer: boolean = false;
        this.attributes.length = 0;
        const isMobile: boolean = VisionHelper.isMobile();
        if (this.element.offsetParent === null ||
            this.hasAttribute('hidden') ||
            this.hasAttribute('vsn-defer')
        ) {
            defer = true;
        }

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
                const attrObj = attrClass.create(this, attr, attrClass);
                this.attributes.push(attrObj);

                if (defer && attrClass.canDefer) {
                    await attrObj.defer();
                    this.deferredAttributes.push(attrObj);
                    attrObj.on('state', this.onAttributeStateChange.bind(this));
                }
            }
        }

        if (this.element.getAttribute('id'))
            requiresScope = true;

        if (requiresScope && !this.uniqueScope) {
            this._uniqueScope = true;
        }

        this._state = TagState.AttributesBuilt;
    }

    public async compileAttributes() {
        for (const attr of this.nonDeferredAttributes) {
            await attr.compile();
        }

        this._state = TagState.AttributesCompiled;
    }

    public async setupAttributes() {
        if (VisionHelper.doBenchmark) benchmarkStart('Tag.setupAttributes');
        for (const attr of this.nonDeferredAttributes) {
            await attr.setup();
        }
        if (VisionHelper.doBenchmark) benchmarkEnd('Tag.setupAttributes', 'Attribute.setup');
        this.dom.registerElementInRoot(this);
        if (VisionHelper.doBenchmark) benchmarkEnd('Tag.setupAttributes', 'register');

        this._state = TagState.AttributesSetup;
        this.callOnWrapped('$setup');
        if (VisionHelper.doBenchmark) benchmarkEnd('Tag.setupAttributes', '$setup');
    }

    public async extractAttributes() {
        for (const attr of this.nonDeferredAttributes) {
            await attr.extract();
        }
        this._state = TagState.AttributesExtracted;
        this.callOnWrapped('$extracted');
    }

    public async connectAttributes() {
        if (this.isInput) {
            this.addEventHandler('input', [], this.inputMutation, this);
        }

        for (const attr of this.nonDeferredAttributes) {
            await attr.connect();
        }
        this._state = TagState.AttributesConnected;
        this.callOnWrapped('$bound');
    }

    public inputMutation(e) {
        if (this.isSelect) {
            const selected = (this.element as HTMLSelectElement).selectedOptions;
            const values = [];
            for (let i = 0; i < selected.length; i++) {
                values.push(selected[i].value);
            }
            for (const option of Array.from((this.element as HTMLSelectElement).options)) {
                if (values.indexOf(option.value) > -1) {
                    option.setAttribute('selected', '');
                } else {
                    option.removeAttribute('selected');
                }
            }
            //this.element.setAttribute('value', );
            this.value = values.join(',');
        } else {
            //this.element.setAttribute('value', e.target.value);
            //(this.element as any).value = e.target.value;
            this.value = e.target.value;
        }
    }

    public finalize(): void {
        this._state = TagState.Built;
        this.callOnWrapped('$built', this, this.scope, this.element);
        VisionHelper.nice(this.setupDeferredAttributes.bind(this));
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
        for (const handler of this.onEventHandlers[eventType]) {
            handler.handler.call(handler.context, e);
        }
    }

    public hasModifier(attribute: string, modifier: string): boolean {
        return attribute.indexOf(`|${modifier}`) > -1;
    }

    public stripModifier(attribute: string, modifier: string): string {
        return attribute.replace(`|${modifier}`, '');
    }

    public addEventHandler(eventType: string, modifiers: string[], handler, context: any = null) {
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

        this.onEventHandlers[eventType].push({
            handler: handler,
            event: eventType,
            context: context,
        });
    }

    public removeEventHandler(eventType: string, handler, context: any = null) {
        if (!this.onEventHandlers[eventType])
            return;

        const _handler = this.onEventHandlers[eventType].find(h => h.handler === handler && h.context === context);
        if (_handler) {
            this.onEventHandlers[eventType].splice(this.onEventHandlers[eventType].indexOf(_handler), 1);
            if (this.onEventHandlers[eventType].length === 0) {
                this.element.removeEventListener(eventType, this.handleEvent.bind(this, eventType));
            }
        }
    }

    public removeContextEventHandlers(context: any) {
        for (const eventType of Object.keys(this.onEventHandlers)) {
            for (const handler of this.onEventHandlers[eventType]) {
                if (handler.context === context) {
                    this.removeEventHandler(eventType, handler.handler, context);
                }
            }
        }
    }

    public createScope(force: boolean = false): Scope {
        // Standard attribute requires a unique scope
        // @todo: Does this cause any issues with attribute bindings on the parent scope prior to having its own scope? hmm...
        if (!this._scope && (force || this.uniqueScope)) {
            this._uniqueScope = true;
            this._scope = new Scope();

            if (this.parentTag) {
                this.scope.parentScope = this.parentTag.scope;
            }
        }

        return this._scope;
    }

    async watchAttribute(attributeName: string) {
        for (const attribute of this.attributes) {
            if (attribute instanceof StandardAttribute && attribute.attributeName == attributeName) {
                return attribute;
            }
        }

        this.createScope(true);

        const standardAttribute = new StandardAttribute(this, attributeName);
        this.attributes.push(standardAttribute);
        await this.setupAttribute(standardAttribute);

        return standardAttribute;
    }

    async watchStyle(styleName: string) {
        for (const attribute of this.attributes) {
            if (attribute instanceof StyleAttribute) {
                return attribute;
            }
        }

        this.createScope(true);

        const styleAttribute = new StyleAttribute(this, 'style');
        this.attributes.push(styleAttribute);
        await this.setupAttribute(styleAttribute);

        return styleAttribute;
    }

    private async setupAttribute(attribute: Attribute) {
        await attribute.compile();
        await attribute.setup();
        await attribute.extract();
        await attribute.connect();
    }

    private async setupDeferredAttributes() {
        for (const attr of this.deferredAttributes)
            await this.setupAttribute(attr);
        this.deferredAttributes.length = 0;
    }

    deconstruct() {
        this.attributes.forEach(attr => attr.deconstruct());
        this.attributes.length = 0;
        this._children.forEach(child => child.deconstruct());
        this._children.length = 0;
        super.deconstruct();
    }
}
