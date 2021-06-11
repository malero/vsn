import {Attribute} from "../Attribute";
import {Tag} from "../Tag";
import {List} from "./List";

export class ListItem extends Attribute {
    public static readonly scoped: boolean = true;
    public static readonly ERROR_NO_PARENT = "Cannot find list parent.";
    protected _list: Tag;

    public get list(): Tag {
        return this._list;
    }

    public async setup() {
        this._list = this.tag.findAncestorByAttribute('vsn-list');
        if (!this._list)
            throw Error(ListItem.ERROR_NO_PARENT);

        this.tag.scope.set(this.listItemName, this.tag.scope);
        const modelName: string = this.modelClassName;
        const cls = await window['Vision'].instance.getClass(modelName);
        this.instantiateModel(cls);
    }

    public get listItemName(): string {
        return this.getAttributeBinding('item');
    }

    public get modelClassName(): string {
        return this.getAttributeValue(this._list.getAttribute<List>('vsn-list').listItemModel);
    }

    protected async configure() {

    }

    private instantiateModel(model: any) {
        this.tag.wrap(model, false, true);
    }
}
