
import {AbstractDOM} from "./DOM/AbstractDOM";

export class DOM extends AbstractDOM {
    protected static _instance: AbstractDOM;

    public static get instance(): DOM {
        if (!DOM._instance)
            DOM._instance = new DOM(document.body ,false, false);

        return DOM._instance;
    }
}
