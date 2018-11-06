import {Scope} from "../Scope";
import {Attribute} from "../Attribute";

export class Controller extends Attribute {
    public setup(): void {
        const parentScope: Scope = this.tag.parent.scope;
        if (!parentScope)
            return;
        const controllerClassName: string = this.tag.rawAttributes['v-class'];
        const cls: any = window[controllerClassName];
        this.tag.scope.wrap(new cls());
    }
}
