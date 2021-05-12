import {Attribute} from "../Attribute";
import {Scope} from "../Scope";

export class Name extends Attribute {
    public async setup() {
        const parentScope: Scope = this.tag.scope.parent;
        if (parentScope)
            parentScope.set(this.tag.rawAttributes['v-name'][1], this.tag.scope);
    }
}
