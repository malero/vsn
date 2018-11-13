import {Attribute} from "../Attribute";
import {Tag} from "../Tag";
import {Scope} from "../Scope";

export class List extends Attribute {
    protected items: Tag[];
    protected template: Node;

    public setup(): void {
        this.items = [];
        if (this.tag.element.children.length > 0) {
            this.template = this.tag.element.children[0].cloneNode(true);
        }

        for (const element of Array.from(this.tag.element.querySelectorAll('[v-list-item]'))) {
            const tag: Tag = this.tag.dom.getTagForElement(element);
            if (tag)
                this.items.push(tag);
        }

        this.tag.scope.set('add', this.add.bind(this));
        this.tag.scope.set('remove', this.remove.bind(this));
    }

    public get listItemName(): string {
        return this.tag.rawAttributes['v-list-item-name'] || 'item';
    }

    public remove(item: any) {
        for (let i: number = 0; i < this.items.length; i++) {
            const tag: Tag = this.items[i];
            if (tag.scope.get(this.listItemName) == item) {
                tag.decompose();
                this.items.splice(i, 1);

                return;
            }
        }
    }

    protected add() {
        const element: HTMLElement = this.template.cloneNode(true) as HTMLElement;
        this.tag.element.appendChild(element);

        this.tag.dom.buildFrom(this.tag.element);
        const tag: Tag = this.tag.dom.getTagForElement(element);
        this.items.push(tag);
        const item: Scope = tag.scope.get(this.listItemName);
        item.clear();
    }
}
