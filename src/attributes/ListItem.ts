import {Attribute} from "../Attribute";
import {Tag} from "../Tag";
import {List} from "./List";

export class ListItem extends Attribute {


    public setup(): void {
        const parent: Tag = this.tag.parent;
        const list: List = parent.getAttribute('v-list') as List;
        this.tag.scope.set(list.listItemName, this.tag.scope);
    }

    protected configure(): void {

    }
}
