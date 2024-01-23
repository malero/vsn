import {Scope} from "./Scope";
import {Attribute, AttributeState} from "./Attribute";
import {DOM} from "./DOM";
import {Controller} from "./Controller";
import {VisionHelper} from "./helpers/VisionHelper";
import {StandardAttribute} from "./attributes/StandardAttribute";
import {On} from "./attributes/On";
import {Registry} from "./Registry";
import {DOMObject} from "./DOM/DOMObject";
import {Tree} from "./AST";
import {StyleAttribute} from "./attributes/StyleAttribute";
import {Modifiers} from "./Modifiers";

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
    protected _meta: { [key: string]: any; };
    protected attributes: Map<string, Attribute> = new Map<string, Attribute>();
    protected _nonDeferredAttributes: Attribute[] = [];
    protected _parentTag: Tag;
    protected _children: Tag[] = [];
    protected _controller: Controller;

    public static readonly magicAttributes: string[] = [
        '@text',
        '@html',
        '@class',
        '@value',
        '@disabled',
        '@hidden',
        '@selected',
        '@readonly',
        '@multiple',
        '@required',
        '@autofocus',
    ];

    public static readonly flagAttributes: string[] = [
        '@disabled',
        '@hidden',
        '@checked',
        '@selected',
        '@readonly',
        '@multiple',
        '@required',
        '@autofocus',
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
        this.onEventHandlers = {};
        this.onEventBindings = {};
        this.analyzeElementAttributes();
        this._state = TagState.Instantiated;
    }

    public get meta() {
        if (!this._meta)
            this._meta = {};
        return this._meta;
    }

    public get state(): TagState {
        return this._state;
    }

    protected onAttributeStateChange(event) {
        if (event.previouseState === AttributeState.Deferred)  // @todo: what is this?
            this._nonDeferredAttributes.length = 0;
    }

    public getAttributesWithState(state: AttributeState): Attribute[] {
        const attrs: Attribute[] = [];
        for (const attr of this.attributes.values()) {
            if (attr.state === state)
                attrs.push(attr);
        }
        return attrs;
    }

    public get nonDeferredAttributes(): Attribute[] {
        if (this._nonDeferredAttributes.length > 0)
            return this._nonDeferredAttributes;

        const attrs: Attribute[] = [];
        for (const attr of this.attributes.values()) {
            if (attr.state !== AttributeState.Deferred)
                attrs.push(attr);
        }
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
        this.attributes.forEach(attr => attr.mutate(mutation));
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
        tag.once('deconstruct', this.removeChild, this);
    }

    public removeChild(tag: Tag) {
        const index = this._children.indexOf(tag);
        if (index > -1)
            this._children.splice(index, 1);
    }

    public get children(): Tag[] {
        return [...this._children];
    }

    public findParentTag() {
        let foundParent = false;
        if (this.element) {
            let parentElement: HTMLElement = DOM.getParentElement(this.element);
            while (parentElement) {
                if (parentElement[Tag.TaggedVariable]) {
                    foundParent = true;
                    this.parentTag = parentElement[Tag.TaggedVariable];
                    break;
                }
                parentElement = DOM.getParentElement(parentElement);
            }
        }
        if (!foundParent && DOM.instance.root !== this)
            return DOM.instance.root;
    }

    public get parentTag(): Tag {
        if (!this._parentTag) {
            this.findParentTag();
        }

        return this._parentTag;
    }

    public set parentTag(tag: Tag) {
        if (this.element === document.body || tag.element === document.body)
            return;

        if (this._parentTag && this._parentTag !== tag) {
            this._parentTag.removeChild(this);
            this.scope.parentScope = null;
        }

        this._parentTag = tag;
        if (tag) {
            tag.addChild(this);

            if (this.scope !== tag.scope) {
                this.scope.parentScope = tag.scope;
            }
        }
    }

    public get scope(): Scope {
        if (!!this._scope)
            return this._scope;

        if (this.uniqueScope)
            return this.createScope(true);

        if (!!this.parentTag)
            return this.parentTag.scope;

        return DOM.instance.root.scope;
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
        for (const attr of this.attributes.values())
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
                DOM.instance.buildFrom(this.element).then((tag) => {
                    Tree.reprepareExecutingTrees();
                });
            } else if (key === '@value')
                this.value = value;
            else if (key === '@class' && value) {
                this.element.classList.remove(...Array.from(this.element.classList));
                const classes: string[] = value instanceof Array ? value : [value];
                if (classes.length)
                    this.element.classList.add(...classes);
            } else if (Tag.flagAttributes.indexOf(key) > -1) {
                const attrKey = key.replace('@', '');
                if (!!value) {
                    this.element.setAttribute(attrKey, '');
                } else {
                    this.element.removeAttribute(attrKey);
                }
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
            } else if (Tag.flagAttributes.indexOf(key) > -1) {
                const attrKey = key.replace('@', '');
                return this.element.hasAttribute(attrKey);
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

    public async getTagsToBuild() {
        if (this.isSlot) {
            return await DOM.instance.getTagsForElements(this.delegates, true);
        } else {
            return [this];
        }
    }

    public async buildAttributes() {
        let requiresScope = false;
        let defer: boolean = false;
        const isMobile: boolean = VisionHelper.isMobile();
        if (this.element.offsetParent === null ||
            this.hasAttribute('hidden') ||
            this.hasAttribute('vsn-defer')
        ) {
            defer = true;
        }

        const tags: Tag[] = await this.getTagsToBuild() as Tag[];
        const slot: Tag = this.isSlot ? this : null;
        for (const tag of tags) {
            for (let attr in this.rawAttributes) {
                if (tag.attributes.has(attr)) continue;

                if (this.hasModifier(attr, 'mobile') && !isMobile)
                    continue;


                if (this.hasModifier(attr, 'desktop') && isMobile)
                    continue;

                const attrClass = await this.getAttributeClass(attr);
                if (attrClass) {
                    if (attrClass.scoped)
                        requiresScope = true;

                    const attrObj = attrClass.create(tag, attr, attrClass, slot);

                    tag.attributes.set(attr, attrObj);
                    if (defer && attrClass.canDefer) {
                        await attrObj.defer();
                        tag.deferredAttributes.push(attrObj);
                        attrObj.on('state', tag.onAttributeStateChange, tag);
                    }
                }
            }

            if (tag.element.getAttribute('id'))
                requiresScope = true;

            if (requiresScope && !tag.uniqueScope) {
                tag._uniqueScope = true;
            }

        }
        this._state = TagState.AttributesBuilt;
    }

    public async compileAttributes() {
        const tags: Tag[] = await this.getTagsToBuild() as Tag[];
        for (const tag of tags) {
            for (const attr of tag.getAttributesWithState(AttributeState.Instantiated)) {
                await attr.compile();
            }
        }
        this._state = TagState.AttributesCompiled;
    }

    public async setupAttributes() {
        const tags: Tag[] = await this.getTagsToBuild() as Tag[];
        for (const tag of tags) {
            for (const attr of tag.getAttributesWithState(AttributeState.Compiled)) {
                await attr.setup();
            }
        }
        if (!this.isSlot)
            this.dom.registerElementInRoot(this);
        this._state = TagState.AttributesSetup;
        this.callOnWrapped('$setup');
    }

    public async extractAttributes() {
        const tags: Tag[] = await this.getTagsToBuild() as Tag[];
        for (const tag of tags) {
            for (const attr of tag.getAttributesWithState(AttributeState.Setup)) {
                await attr.extract();
            }
        }
        this._state = TagState.AttributesExtracted;
        this.callOnWrapped('$extracted');
    }

    public async connectAttributes() {
        const tags: Tag[] = await this.getTagsToBuild() as Tag[];
        for (const tag of tags) {
            if (tag.isInput) {
                tag.addEventHandler('input', null, tag.inputMutation, tag);
            }

            for (const attr of tag.getAttributesWithState(AttributeState.Extracted)) {
                await attr.connect();
            }
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
            this.value = values.join(',');
        } else {
            this.value = e.target.value;
        }
    }

    public async finalize() {
        const tags: Tag[] = await this.getTagsToBuild() as Tag[];
        for (const tag of tags) {
            for (const attr of tag.getAttributesWithState(AttributeState.Connected)) {
                await attr.finalize();
            }
        }
        this._state = TagState.Built;
        this.callOnWrapped('$built', this, this.scope, this.element);
        this.dispatch('$built', this);
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
        let preventedDefault = false;
        for (const handler of this.onEventHandlers[eventType]) {
            if (!preventedDefault && handler.modifiers.has('preventdefault') && e.cancelable) {
                e.preventDefault();
                preventedDefault = true;
            }

            if (handler.modifiers.has('once'))
                this.removeEventHandler(handler.event, handler.handler, handler.context);

            if (handler.modifiers.has('throttle')) {
                const modifierArguments = handler.modifiers.get('throttle').getArguments(['1000']);
                const throttleTime = parseInt(modifierArguments[0]);
                const now = Math.floor(Date.now());
                if (!handler.state.lastCalled || handler.state.lastCalled + throttleTime < now) {
                    handler.state.lastCalled = now;
                } else {
                    continue;
                }
            }

            if (handler.modifiers.has('debounce')) {
                clearTimeout(handler.state.debounceTimeout);
                const modifierArguments = handler.modifiers.get('debounce').getArguments(['1000']);
                const debounceTime = parseInt(modifierArguments[0]);
                handler.state.debounceTimeout = setTimeout(async () => {
                    await handler.handler.call(handler.context, e);
                }, debounceTime);
            } else {
                handler.handler.call(handler.context, e);
            }
        }
    }

    public hasModifier(attribute: string, modifier: string): boolean {
        this.attributes
        return attribute.indexOf(`|${modifier}`) > -1;
    }

    public stripModifier(attribute: string, modifier: string): string {
        return attribute.replace(`|${modifier}`, '');
    }

    public getElementPath(element: HTMLElement): string {
        const path = [];
        let currentElement = element;
        while (currentElement) {
            let tag = currentElement.tagName
            if (currentElement.hasAttribute('id'))
                tag += `#${currentElement.getAttribute('id')}`;
            else if (currentElement.hasAttribute('class'))
                tag += `.${currentElement.getAttribute('class').split(' ').join('.')}`;

            path.push(tag);
            currentElement = currentElement.parentElement;
        }
        return path.reverse().join('>');
    }

    public addEventHandler(eventType: string, modifiers: Modifiers, handler, context: any = null) {
        let passiveValue: boolean = null;
        modifiers = modifiers || new Modifiers();

        if (modifiers.has('active')) {
            passiveValue = false;
        } else if (modifiers.has('passive')) {
            passiveValue = true;
        }

        if (!this.onEventHandlers[eventType]) {
            this.onEventHandlers[eventType] = [];
            const element: HTMLElement | Window = On.WindowEvents.indexOf(eventType) > -1 && window ? window : this.element;
            const eventListenerOpts: any = {};
            if (eventType.indexOf('touch') > -1 || passiveValue !== null)
                eventListenerOpts['passive'] = passiveValue === null && true || passiveValue;


            element.addEventListener(eventType, this.getEventBinding(eventType), eventListenerOpts);
        }

        this.onEventHandlers[eventType].push({
            handler: handler,
            event: eventType,
            context: context,
            modifiers: modifiers,
            state: {}
        });
    }

    public getEventBinding(eventType: string) {
        if (this.onEventBindings[eventType] === undefined)
            this.onEventBindings[eventType] = this.handleEvent.bind(this, eventType);

        return this.onEventBindings[eventType];
    }

    public removeEventHandler(eventType: string, handler, context: any = null) {
        if (!this.onEventHandlers[eventType])
            return;

        const _handler = this.onEventHandlers[eventType].find(h => h.handler === handler && h.context === context);
        if (_handler) {
            this.onEventHandlers[eventType].splice(this.onEventHandlers[eventType].indexOf(_handler), 1);
            if (this.onEventHandlers[eventType].length === 0) {
                this.element.removeEventListener(eventType, this.getEventBinding(eventType));
            }
        }
    }

    public removeAllEventHandlers() {
        for (const eventType of Object.keys(this.onEventHandlers)) {
            this.element.removeEventListener(eventType, this.getEventBinding(eventType));
        }
        this.onEventHandlers = {};
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

    async watchAttribute(attributeName: string): Promise<Attribute | StandardAttribute> {
        if (this.attributes.has(attributeName) && this.attributes.get(attributeName) instanceof StandardAttribute) {
            return this.attributes.get(attributeName);
        }

        this.createScope(true);
        const standardAttribute = new StandardAttribute(this, attributeName);
        this.attributes.set(attributeName, standardAttribute);
        await this.setupAttribute(standardAttribute);

        return standardAttribute;
    }

    async watchStyle(styleName: string) {
        if (this.attributes.has('style'))
            return this.attributes.get('style');

        this.createScope(true);

        const styleAttribute = new StyleAttribute(this, 'style');
        this.attributes.set('style', styleAttribute);
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
        const dom = this.dom || DOM.instance;
        if (dom)
            dom.deregisterElementInRoot(this);
        this.removeAllEventHandlers();
        this.attributes.forEach(attr => attr.deconstruct());
        this.attributes.clear();
        this.deferredAttributes.length = 0;
        this._children.forEach(child => child.deconstruct());
        this._children.length = 0;
        if (this._controller) {
            this._controller.deconstruct();
            this._controller = null;
        }
        this._parentTag = null;
        (this as any).dom = null;
        super.deconstruct();
    }
}
