import {Attribute} from "../Attribute";
import {Tag} from "../Tag";
import {List} from "./List";
import {Registry} from "../Registry";
import {benchmark} from "../Bencmark";

@Registry.attribute('vsn-list-item')
export class ListItem extends Attribute {
    public static readonly scoped: boolean = true;
    public static readonly ERROR_NO_PARENT = "Cannot find list parent.";
    protected _list: Tag;

    public get list(): Tag {
        return this._list;
    }

    @benchmark('attributeSetup', 'ListItem')
    public async setup() {
        this._list = this.tag.findAncestorByAttribute('vsn-list');
        if (!this._list)
            throw Error(ListItem.ERROR_NO_PARENT);

        this.tag.scope.set(this.listItemName, this.tag.scope);
        const modelName: string = (await this.getList()).listItemModel;
        const cls = await Registry.instance.classes.get(modelName);
        this.instantiateModel(cls);
    }

    public get listItemName(): string {
        return this.getAttributeBinding('item');
    }

    public async getList(): Promise<List> {
        return await this._list.getAttribute<List>('vsn-list');
    }

    protected async configure() {

    }

    private instantiateModel(model: any) {
        this.tag.wrap(model, false, true);
    }
}
