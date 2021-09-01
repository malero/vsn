import {Registry} from "../Registry";
import {Attribute} from "../Attribute";

@Registry.attribute('vsn-template')
export class Template extends Attribute {
    public static readonly canDefer: boolean = false;
}
