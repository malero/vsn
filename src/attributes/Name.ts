import {Attribute} from "../Attribute";
import {Scope} from "../Scope";

export class Name extends Attribute {
    public setup(): void {
        const parentScope: Scope = this.tag.scope.parent;
        if (parentScope)
            parentScope.set(this.tag.rawAttributes['v-name'], this.tag.scope);
    }
}
