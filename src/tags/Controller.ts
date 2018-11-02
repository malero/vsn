import {Tag} from "../Tag";
import {Scope, Wrapper} from "../Scope";


export class Controller extends Tag {
    protected controllerScope: Scope;

    protected setup(): void {
        const name: string = this.attributes['v-name'];
        const value: any = this.scope.get(name);
        const controllerClassName: string = this.attributes['v-controller'];
        const cls: any = window[controllerClassName];

        if (name && !value && cls) {
            this.controllerScope = new Wrapper(new cls(), this.scope);
            this.scope.set(name, this.controllerScope);
        } else if (value instanceof Wrapper) {
            this.controllerScope = value;
        }
    }
}
