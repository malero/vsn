import {Attribute} from "../Attribute";
import {Tag} from "../Tag";
import {List} from "./List";
import {Registry} from "../Registry";

@Registry.attribute('vsn-list-item')
export class ListItem extends Attribute {
    public static readonly canDefer: boolean = false;
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

        const listAttr = await this.getListAttribute();
        await listAttr.setupTagScope(this.tag, {});
        await super.setup();
    }

    public async getListAttribute(): Promise<List> {
        return await this._list.getAttribute<List>('vsn-list');
    }
}
