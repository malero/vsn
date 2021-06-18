import {DOM} from "./DOM";
import {EventDispatcher} from "simple-ts-event-dispatcher";
import {WrappedArray} from "./Scope";
import {IDeferred, IPromise, Promise} from "simple-ts-promise";
import {DataModel} from "simple-ts-models";
import {Tree} from "./AST";

export class Vision extends EventDispatcher {
    protected static _instance: Vision;
    protected _dom?: DOM;
    protected controllers: {[key: string]: any} = {};
    protected controllerTimeouts = {};

    constructor() {
        super();
        document.addEventListener(
            "DOMContentLoaded",
            this.setup.bind(this)
        );
        this.registerClass(WrappedArray, 'WrappedArray');
        this.registerClass(DataModel, 'DataModel');
    }

    public get dom(): DOM {
        return this._dom;
    }

    setup(): void {
        const body: HTMLElement = document.body;
        body.setAttribute('vsn-root', '');
        this._dom = new DOM(document);
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
            this.controllerTimeouts[key] = setTimeout(() => {
                console.warn(`vision.getClass timed out after 5 seconds trying to find ${key}. Make sure the class is registered with vision.registerClass`);
            }, 5000);
            this.once(`registered:${key}`, (cls) => {
                clearTimeout(this.controllerTimeouts[key]);
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
window['vision'] = window['vsn'] = vision;
window['Tree'] = Tree;
