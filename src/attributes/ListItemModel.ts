import {Registry} from "../Registry";
import {Attribute} from "../Attribute";

@Registry.attribute('vsn-list-item-model')
export class ListItemModel extends Attribute {
    public static readonly canDefer: boolean = false;
}
