import {Attribute} from "../Attribute";
import {Tag} from "../Tag";
import {WrappedArray} from "../Scope/WrappedArray";
import {Tree} from "../AST";
import {ElementHelper} from "../helpers/ElementHelper";
import {Registry} from "../Registry";
import {DOM} from "../DOM";

@Registry.attribute('vsn-list')
export class List extends Attribute {
    public static readonly canDefer: boolean = false;
    public static readonly scoped: boolean = true;
    public tree: Tree;
    public items: any[];
    public tags: Tag[];
    protected template: Node;

    public async compile() {
        const listAttr: string = this.getAttributeBinding();
        this.tree = new Tree(listAttr);
        await this.tree.prepare(this.tag.scope, this.tag.dom, this.tag);
        await super.compile();
    }

    public async setup() {
        if (this.tag.element.children.length > 0) {
            const template = this.tag.element.children[0];

            if (template) {
                if (template.hasAttribute('vsn-template')) {
                    template.removeAttribute('vsn-template');
                    this.tag.element.removeChild(template);
                    this.template = template;
                } else {
                    this.template = template.cloneNode(true);
                }
            }
        } else {
            if (this.tag.hasRawAttribute('template')) {
                let templateNode = await DOM.instance.eval(this.tag.getRawAttributeValue('template'));
                if (templateNode instanceof Array && templateNode.length === 1)
                    templateNode = templateNode[0];

                this.template = templateNode.element.content.cloneNode(true);
            }
        }
        await super.setup();
    }

    public async extract() {
        const items = await this.tree.evaluate(this.tag.scope, this.tag.dom, this.tag);
        await this.addExistingItems(items);

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

        (this.items as WrappedArray<any>).on('add', (item) => {
            this.add(item);
        });
        (this.items as WrappedArray<any>).on('remove', (item) => {
            this.remove(item);
        });

        this.tag.scope.set('add', this.add.bind(this));
        this.tag.scope.set('remove', this.remove.bind(this));
    }

    public get listItemName(): string {
        return this.tag.getRawAttributeValue('vsn-list-item-name', 'item');
    }

    public get listItemModel(): string {
        return this.tag.getRawAttributeValue('vsn-list-item-model', 'Object');
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
        const clone = this.template.cloneNode(true);
        let element: HTMLElement;
        if (clone instanceof DocumentFragment) {
            element = clone.children[0] as HTMLElement;
        } else {
            element = clone as HTMLElement;
        }

        this.tag.element.appendChild(element);

        await this.tag.dom.buildFrom(this.tag.element);
        const tag: Tag = await this.tag.dom.getTagForElement(element);
        this.tags.push(tag);
        tag.scope.clear();

        if (obj) {
            tag.unwrap();
            tag.wrap(obj);
        }

        this.tag.dispatch('add', obj);
    }
}
