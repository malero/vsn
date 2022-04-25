import {DOM} from "./DOM";
import {WrappedArray} from "./Scope/WrappedArray";
import {Registry} from "./Registry";
import "./Types";
import "./Formats";
import {Configuration} from "./Configuration";
import {VisionHelper} from "./helpers/VisionHelper";
import {Tree} from "./AST";
import {Query} from "./Query";
import {EventDispatcher} from "./EventDispatcher";
import {DynamicScopeData} from "./Scope/DynamicScopeData";
import {Controller} from "./Controller";
import {property} from "./Scope/properties/Property";

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
        this.registry.classes.register('Data', DynamicScopeData);

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
        console.warn(`Took ${setupTime}ms to start up VisionJS. https://www.vsnjs.com/`);
    }

    public static get instance() {
        if (!Vision._instance)
            Vision._instance = new Vision();

        return Vision._instance;
    }
}

export * from "./attributes/_imports";
export * from './Registry';
export * from './Attribute';
export * from './AST';
export {DOM} from './DOM';
export {Scope} from './Scope';
export {ScopeReference} from './Scope/ScopeReference';
export {WrappedArray} from './Scope/WrappedArray';
export {Controller} from './Controller';
export {Property, property} from './Scope/properties/Property';
export {Tag} from './Tag';
export const vision: Vision = Vision.instance;
