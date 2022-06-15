import {Attribute} from "../Attribute";
import {Tag} from "../Tag";
import {WrappedArray} from "../Scope/WrappedArray";
import {ElementHelper} from "../helpers/ElementHelper";
import {Registry} from "../Registry";
import {DOM} from "../DOM";
import {Scope} from "../Scope";
import {ScopeData} from "../Scope/ScopeData";

@Registry.attribute('vsn-list')
export class List extends Attribute {
    public static readonly MetaItemSetupFlag = 'vsn-list-item-setup';
    public static readonly canDefer: boolean = false;
    public static readonly scoped: boolean = true;

    public items: any[];
    public tags: Tag[];
    protected template: Node;

    public async setup() {
        if (this.tag.element.children.length > 0) {
            const template = this.tag.element.children[0];
            const templateTag: Tag = await this.tag.dom.getTagForElement(template);

            if (template) {
                if (template.hasAttribute('vsn-template')) {
                    templateTag.parentTag = this.tag; // Set parentTag before removing from DOM
                    template.removeAttribute('vsn-template');
                    this.tag.element.removeChild(template);
                    this.template = template;
                } else {
                    this.template = template.cloneNode(true);
                }
            }
        } else {
            if (this.tag.hasRawAttribute('template')) {
                let templateNode = await DOM.instance.exec(this.tag.getRawAttributeValue('template'));
                if (templateNode instanceof Array && templateNode.length === 1)
                    templateNode = templateNode[0];

                this.template = templateNode.element.content.cloneNode(true);
            }
        }
        await super.setup();
    }

    public async extract() {
        const listAttr: string = this.getAttributeBinding('items');
        const ref = this.tag.scope.getReference(listAttr);
        const listScope: Scope = await ref.getScope();
        const listKey: string = await ref.getKey();
        const items = listScope.get(listKey);
        await this.addExistingItems(items);

        listScope.on(`change:${listKey}`, (e) => {
            if (e?.oldValue) {
                if (e.oldValue instanceof WrappedArray) {
                    e.oldValue.map((item) => {
                        this.remove(item);
                    });
                    e.oldValue.offWithContext('add', this);
                    e.oldValue.offWithContext('remove', this);
                }
                this.addExistingItems(e.value);
            }
        });

        if (this.tag.hasRawAttribute('initial-items')) {
            const toAdd: number = parseInt(this.tag.getRawAttributeValue('initial-items'));
            for (let i = 0; i < toAdd; i++) {
                await this.add({});
            }
        }
        await super.extract();
    }

    protected async addExistingItems(defaultList: any[] | null) {
        this.items = defaultList || new WrappedArray();

        if (this.tags?.length > 0) {
            for (const tag of this.tags) {
                tag.deconstruct();
                tag.removeFromDOM();
            }
        }

        this.tags = this.tags || [];
        this.tags.length = 0;

        if (defaultList)
            for (const existingItem of defaultList) {
                await this.add(existingItem);
            }

        for (const element of Array.from(this.tag.element.querySelectorAll('*'))) {
            if (!ElementHelper.hasVisionAttribute(element, 'vsn-list-item'))
                continue;

            const tag: Tag = await this.tag.dom.getTagForElement(element);
            if (tag) {
                this.tags.push(tag);
                this.items.push(tag.scope.get(this.listItemName) || tag.scope.wrapped || tag.scope);
            }
        }

        if (!(this.items instanceof WrappedArray)) {
            this.items = new WrappedArray(this.items);
        }

        (this.items as WrappedArray<any>).on('add', this.add, this);
        (this.items as WrappedArray<any>).on('remove', this.remove, this);

        this.tag.scope.set('add', this.add.bind(this));
        this.tag.scope.set('remove', this.remove.bind(this));
    }

    public get listItemName(): string {
        return this.tag.getRawAttributeValue('list-item-name', 'item');
    }

    public get listItemModel(): string {
        return this.tag.getRawAttributeValue('list-item-model');
    }

    public remove(item: any) {
        for (let i: number = 0; i < this.tags.length; i++) {
            const tag: Tag = this.tags[i];
            const listItem = tag.scope.get(this.listItemName);
            if ([listItem, listItem.data, listItem.wrapped].indexOf(item) > -1) {
                tag.deconstruct();
                tag.removeFromDOM();
                this.tags.splice(i, 1);

                return;
            }
        }
    }

    protected async add(obj) {
        // Setup new HTML element
        const clone = this.template.cloneNode(true);
        let element: HTMLElement;
        if (clone instanceof DocumentFragment) {
            element = clone.children[0] as HTMLElement;
        } else {
            element = clone as HTMLElement;
        }
        delete element[Tag.TaggedVariable];

        // Collect raw data
        let data;
        if (obj instanceof ScopeData)
            data = obj.getData();
        else
            data = Object.assign({}, obj);

        // Setup new tag
        const tag = await this.tag.dom.buildTag(element, true);
        await this.setupTagScope(tag, obj);

        // Add to DOM & build
        this.tag.element.appendChild(element);
        await this.tag.dom.setupTags([tag]);
        await this.tag.dom.buildFrom(this.tag.element);

        // Make sure we're using the correct data (Template may have vsn-bind values that are not desired)
        const itemScope = tag.scope.get(this.listItemName);
        if (itemScope instanceof Scope && data) {
            itemScope.data.setData(data);
        }

        this.tags.push(tag);
        this.tag.dispatch('add', obj);
    }

    async setupTagScope(tag: Tag, obj: any) {
        if (tag.meta[List.MetaItemSetupFlag])
            return;

        tag.createScope(true);
        const itemScope = new Scope(tag.scope);

        // Setup new scope & model class, if defined
        const modelName: string = this.listItemModel;
        let cls;
        if (modelName)
            cls = await Registry.instance.models.get(modelName);

        if (cls) {
            if (!obj || !(obj instanceof cls)) {
                obj = new cls(obj);
                this.tag.once('$built', () => {
                    if (obj['$built'])
                        obj['$built'](this.tag, this.tag.scope, this.tag.element);
                });
            }
        }

        // Check if the class is set up already
        if (!cls || (!(itemScope.data instanceof cls) && !(itemScope.wrapped instanceof cls))) {
            if (itemScope.wrapped)
                itemScope.unwrap();
            itemScope.wrap(obj, true, true);
        }

        tag.scope.set(this.listItemName, itemScope);
        tag.meta[List.MetaItemSetupFlag] = true;
    }
}
