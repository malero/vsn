import {Scope} from "../Scope";
import {Attribute} from "../Attribute";

export class Controller extends Attribute {
    protected controllerClassName: string;

    public setup(): void {
        const parentScope: Scope = this.tag.parent.scope;
        if (!parentScope)
            return;
        this.controllerClassName = this.tag.rawAttributes['v-class'];
        const cls: any = window[this.controllerClassName];

        if (!!cls) {
            this.registerController(cls)
        } else {
            console.log('waiting for class to be registered');
            window['vision'].once(`register:${this.controllerClassName}`, this.registerController.bind(this));
        }
    }

    protected registerController(cls) {
        this.tag.wrap(cls);
    }
}
