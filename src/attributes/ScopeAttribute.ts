import {Attribute} from "../Attribute";
import {Registry} from "../Registry";

@Registry.attribute('vsn-scope')
export class ScopeAttribute extends Attribute {
    public static readonly scoped: boolean = true;
}
