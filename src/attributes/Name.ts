import {Attribute} from "../Attribute";
import {Scope} from "../Scope";
import {Registry} from "../Registry";
import {benchmark} from "../Bencmark";

@Registry.attribute('vsn-name')
export class Name extends Attribute {
    public static readonly scoped: boolean = true;

    @benchmark('attributeSetup', 'Name')
    public async setup() {
        const parentScope: Scope = this.tag.scope.parentScope;
        if (parentScope) {
            parentScope.set(this.tag.parsedAttributes['vsn-name'][1], this.tag.scope);
        }
    }
}
