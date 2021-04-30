import {Attribute} from "../Attribute";
import {Tag} from "../Tag";
import {Scope, WrappedArray} from "../Scope";
import {Tree} from "../ast";

export class List extends Attribute {
    protected items: any[];
    protected tags: Tag[];
    protected template: Node;

    public setup(): void {
        const listAttr: string = this.tag.rawAttributes['v-list'];
        (new Tree(listAttr)).evaluate(this.tag.scope).then(this.addExistingItems.bind(this));
    }

    protected addExistingItems(defaultList: any[] | null) {
        const controllerClassName: string = this.tag.rawAttributes['v-item-class'];
        const cls: any = window[controllerClassName];

        this.items = defaultList || [];
        this.tags = [];

        if (this.tag.element.children.length > 0) {
            this.template = this.tag.element.children[0].cloneNode(true);
        }

        for (const element of Array.from(this.tag.element.querySelectorAll('[v-list-item]'))) {
            const tag: Tag = this.tag.dom.getTagForElement(element);
            if (tag) {
                this.tags.push(tag);
                this.items.push(tag.wrap(cls));
            }
        }

        if (!(this.items instanceof WrappedArray)) {

        }

        (this.items as WrappedArray<any>).bind('add', (item) => {
            this.add(item);
        });

        this.tag.scope.set('add', this.add.bind(this));
        this.tag.scope.set('remove', this.remove.bind(this));
    }

    public get listItemName(): string {
        return this.tag.rawAttributes['v-list-item-name'] || 'item';
    }

    public remove(item: any) {
        for (let i: number = 0; i < this.tags.length; i++) {
            const tag: Tag = this.tags[i];
            if (tag.scope.get(this.listItemName) == item) {
                tag.decompose();
                this.tags.splice(i, 1);

                return;
            }
        }
    }

    protected add(obj) {
        const element: HTMLElement = this.template.cloneNode(true) as HTMLElement;
        this.tag.element.appendChild(element);

        this.tag.dom.buildFrom(this.tag.element);
        const tag: Tag = this.tag.dom.getTagForElement(element);
        this.tags.push(tag);
        const scope: Scope = tag.scope.get(this.listItemName);
        scope.clear();

        if (obj) {
            tag.wrap(obj, true);
        }
    }
}
