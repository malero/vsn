import {Attribute} from "../Attribute";
import {Tag} from "../Tag";
import {Scope, WrappedArray} from "../Scope";
import {Tree} from "../AST";
import {ElementHelper} from "../helpers/ElementHelper";

export class List extends Attribute {
    public static readonly scoped: boolean = true;
    protected items: any[];
    protected tags: Tag[];
    protected template: Node;

    public async extract() {
        const listAttr: string = this.getAttributeBinding();
        const tree = new Tree(listAttr);
        const items = await tree.evaluate(this.tag.scope, this.tag.dom);
        await this.addExistingItems(items)
    }

    protected async addExistingItems(defaultList: any[] | null) {
        this.items = defaultList || new WrappedArray();
        this.tags = [];

        if (defaultList)
            for (const existingItem of defaultList) {
                await this.add(existingItem);
            }

        if (this.tag.element.children.length > 0) {
            this.template = this.tag.element.children[0].cloneNode(true);
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

        (this.items as WrappedArray<any>).bind('add', (item) => {
            this.add(item);
        });

        this.tag.scope.set('add', this.add.bind(this));
        this.tag.scope.set('remove', this.remove.bind(this));
    }

    public get listItemName(): string {
        return this.tag.getRawAttributeValue('vsn-list-item-name', 'item');
    }

    public get listItemModel(): string {
        return this.tag.getRawAttributeValue('vsn-list-item-model', 'DataModel');
    }

    public remove(item: any) {
        for (let i: number = 0; i < this.tags.length; i++) {
            const tag: Tag = this.tags[i];
            const listItem = tag.scope.get(this.listItemName);
            if ([listItem, listItem.wrapped].indexOf(item) > -1) {
                tag.removeFromDOM();
                this.tags.splice(i, 1);

                return;
            }
        }
    }

    protected async add(obj) {
        const element: HTMLElement = this.template.cloneNode(true) as HTMLElement;
        this.tag.element.appendChild(element);

        await this.tag.dom.buildFrom(this.tag.element);
        const tag: Tag = await this.tag.dom.getTagForElement(element);
        this.tags.push(tag);
        const scope: Scope = tag.scope.get(this.listItemName);
        scope.clear();

        if (obj) {
            // Scope has already wrapped a new v-list-item-model, so we need to unwrap and wrap the passed object
            tag.unwrap();
            tag.wrap(obj, true);
        }
    }
}
