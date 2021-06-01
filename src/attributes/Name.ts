import {Attribute} from "../Attribute";
import {Scope} from "../Scope";

export class Name extends Attribute {
    public static readonly scoped: boolean = true;

    public async setup() {
        const parentScope: Scope = this.tag.scope.parentScope;
        if (parentScope)
            parentScope.set(this.tag.parsedAttributes['v-name'][1], this.tag.scope);
    }
}
