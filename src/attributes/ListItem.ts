import {Attribute} from "../Attribute";
import {IPromise} from "simple-ts-promise";
import {Tag} from "../Tag";

export class ListItem extends Attribute {
    public static readonly ERROR_NO_PARENT = "Cannot find list parent.";
    protected _list: Tag;

    public get list(): Tag {
        return this._list;
    }

    public async setup() {
        this.tag.scope.set(this.listItemName, this.tag.scope);
        const modelName: string = this.modelClassName;
        const promise: IPromise<any> = window['Vision'].instance.getClass(modelName);
        promise.then((cls) => {
            this.instantiateModel(cls);
        });
        this._list = this.tag.findAncestorByAttribute('v-list');
        if (!this._list)
            throw Error(ListItem.ERROR_NO_PARENT);
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
