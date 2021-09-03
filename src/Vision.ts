import {DOM} from "./DOM";
import {EventDispatcher} from "simple-ts-event-dispatcher";
import {WrappedArray} from "./Scope";
import {DataModel} from "simple-ts-models";
import {Registry} from "./Registry";
import "./Types";
import "./Formats";
import "./attributes/_imports";
import {Configuration} from "./Configuration";
import {VisionHelper} from "./helpers/VisionHelper";
import {Tree} from "./AST";
import {Query} from "./Query";

export class Vision extends EventDispatcher {
    protected static _instance: Vision;
    protected _dom?: DOM;
    public readonly registry = Registry.instance;
    public readonly config: Configuration = Configuration.instance;

    constructor() {
        super();
        if (VisionHelper.document) {
            document.addEventListener(
                "DOMContentLoaded",
                this.setup.bind(this)
            );
        } else {
            console.warn('No dom, running in CLI mode.');
        }
        this.registry.classes.register('Object', Object);
        this.registry.classes.register('WrappedArray', WrappedArray);
        this.registry.classes.register('DataModel', DataModel);

        if (VisionHelper.window) {
            window['Vision'] = Vision;
            window['Registry'] = Registry;
            window['vision'] = window['vsn'] = this;
            window['Tree'] = Tree;
            window['$'] = Query;
            VisionHelper.window.dispatchEvent(new Event('vsn'));
        }
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
        const now = (new Date()).getTime();
        const setupTime = now - startTime;
        console.warn(`Took ${setupTime}ms to start up VisionJS`);
        VisionHelper.nice(() => {
            const javascriptIdle: number = window['epoch'] ? (new Date()).getTime() - window['epoch'] : null
            fetch('https://api.tabon.io/report-test/', {
                method: 'post',
                body: JSON.stringify({
                    tab: 'startuptime',
                    bootstrap: setupTime,
                    load: window['epoch'] && now - window['epoch'] || null,
                    idle: javascriptIdle,
                    page: window.location.href
                })
            });
        }, 10);
    }

    public static get instance() {
        if (!Vision._instance)
            Vision._instance = new Vision();

        return Vision._instance;
    }
}

export * from './Registry';
export * from './Attribute';
export const vision: Vision = Vision.instance;
