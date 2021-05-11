import {DOM} from "./DOM";
import {EventDispatcher} from "simple-ts-event-dispatcher";
import {WrappedArray} from "./Scope";
import {IDeferred, IPromise, Promise} from "simple-ts-promise";

export class Vision extends EventDispatcher {
    protected static _instance: Vision;
    protected dom?: DOM;
    protected controllers: {[key: string]: any} = {};

    constructor() {
        super();
        document.addEventListener(
            "DOMContentLoaded",
            this.setup.bind(this)
        );
        this.registerClass(WrappedArray, 'WrappedArray');
    }

    setup(): void {
        this.dom = new DOM(document);
    }

    registerClass(cls: any, constructorName: string = null) {
        const key: string = constructorName || cls.prototype.constructor.name;
        this.controllers[key] = cls;
        this.trigger(`registered:${key}`, cls);
    }

    getClass(key: string): IPromise<any> {
        const deferred: IDeferred<any> = Promise.defer();

        if (!!this.controllers[key]) {
            deferred.resolve(this.controllers[key]);
        } else {
            this.once(`registered:${key}`, (cls) => {
                deferred.resolve(cls);
            })
        }

        return deferred.promise;
    }

    public static get instance() {
        if (!Vision._instance)
            Vision._instance = new Vision();

        return Vision._instance;
    }
}

export const vision: Vision = Vision.instance;
window['Vision'] = Vision;
window['vision'] = vision;
