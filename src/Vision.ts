import {DOM} from "./DOM";
import {EventDispatcher} from "simple-ts-event-dispatcher";
import {WrappedArray} from "./Scope";
import {DataModel} from "simple-ts-models";
import {Registry} from "./Registry";
import "./Types";
import "./Formats";
import "./attributes/_imports";
import {Configuration} from "./Configuration";

export class Vision extends EventDispatcher {
    protected static _instance: Vision;
    protected _dom?: DOM;
    public readonly registry = Registry.instance;
    public readonly config: Configuration = Configuration.instance;

    constructor() {
        super();
        document.addEventListener(
            "DOMContentLoaded",
            this.setup.bind(this)
        );
        this.registry.classes.register('Object', Object);
        this.registry.classes.register('WrappedArray', WrappedArray);
        this.registry.classes.register('DataModel', DataModel);
    }

    public get dom(): DOM {
        return this._dom;
    }

    public async eval(code: string) {
        return await this._dom.eval(code);
    }

    public async setup() {
        const body: HTMLElement = document.body;
        body.setAttribute('vsn-root', '');
        this._dom = DOM.instance;
        const startTime: number = new Date().getTime();
        await this._dom.buildFrom(document, true);
        console.warn(`Took ${new Date().getTime() - startTime}ms to start up VisionJS`);
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
