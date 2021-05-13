import {Attribute} from "../Attribute";
import {IPromise} from "simple-ts-promise";

export class ListItem extends Attribute {
    public async setup() {
        this.tag.scope.set(this.listItemName, this.tag.scope);
        const modelName: string = this.modelClassName;
        const promise: IPromise<any> = window['Vision'].instance.getClass(modelName);
        promise.then((cls) => {
            this.instantiateModel(cls);
        });
    }

    public get listItemName(): string {
        return this.getAttributeBinding('item');
    }

    public get modelClassName(): string {
        return this.getAttributeValue();
    }

    protected async configure() {

    }

    private instantiateModel(model: any) {
        this.tag.wrap(model);
    }
}
