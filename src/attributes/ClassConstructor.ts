import {Scope} from "../Scope";
import {Attribute} from "../Attribute";
import {IPromise} from "simple-ts-promise";

export class ClassConstructor extends Attribute {
    protected attributeKey: string;
    protected className: string;

    public async setup() {
        const parentScope: Scope = this.tag.parent.scope;
        if (!parentScope)
            return;

        this.attributeKey = this.getAttributeBinding();
        this.className = this.getAttributeValue();

        if (this.attributeKey && parentScope)
            parentScope.set(this.attributeKey, this.tag.scope);
    }

    public async execute() {
        const promise: IPromise<any> = window['Vision'].instance.getClass(this.className);
        promise.then((cls) => {
            this.instantiateClass(cls);
        });
    }

    protected instantiateClass(cls) {
        this.tag.wrap(cls);
    }
}
