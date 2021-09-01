import {Attribute} from "../Attribute";
import {Scope} from "../Scope";
import {Registry} from "../Registry";

@Registry.attribute('vsn-name')
export class Name extends Attribute {
    public static readonly canDefer: boolean = false;
    public static readonly scoped: boolean = true;

    public async setup() {
        const parentScope: Scope = this.tag.scope.parentScope;
        if (parentScope) {
            parentScope.set(this.tag.parsedAttributes['vsn-name'][1], this.tag.scope);
        }
    }
}
