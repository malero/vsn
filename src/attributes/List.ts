import {Attribute} from "../Attribute";
import {Tag} from "../Tag";
import {WrappedArray} from "../Scope/WrappedArray";
import {ElementHelper} from "../helpers/ElementHelper";
import {Registry} from "../Registry";
import {DOM} from "../DOM";
import {Scope} from "../Scope";

@Registry.attribute('vsn-list')
export class List extends Attribute {
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
            if (e.oldValue) {
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

        this.tags = [];

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
                this.items.push(tag.scope.wrapped || tag.scope);
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
        return this.tag.getRawAttributeValue('vsn-list-item-name', 'item');
    }

    public get listItemModel(): string {
        return this.tag.getRawAttributeValue('vsn-list-item-model');
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
        const clone = this.template.cloneNode(true);
        let element: HTMLElement;
        if (clone instanceof DocumentFragment) {
            element = clone.children[0] as HTMLElement;
        } else {
            element = clone as HTMLElement;
        }
        delete element[Tag.TaggedVariable];

        this.tag.element.appendChild(element);

        await this.tag.dom.buildFrom(this.tag.element);
        const tag: Tag = await this.tag.dom.getTagForElement(element);
        this.tags.push(tag);

        if (obj) {
            if (tag.scope.wrapped) {
                tag.scope.data.setData(obj);
            } else {
                tag.wrap(obj);
            }
        }

        this.tag.dispatch('add', obj);
    }
}
