import {DOM} from "./DOM";
import {WrappedArray} from "./Scope/WrappedArray";
import {Registry} from "./Registry";
import {Configuration} from "./Configuration";
import {VisionHelper} from "./helpers/VisionHelper";
import {Tree} from "./AST";
import {Query} from "./Query";
import {EventDispatcher} from "./EventDispatcher";
import {DynamicScopeData} from "./Scope/DynamicScopeData";
import {Controller} from "./Controller";
import {VERSION} from "./version";
import './custom-elements';

export class Vision extends EventDispatcher {
    protected static _instance: Vision;
    protected _dom?: DOM;
    public readonly registry = Registry.instance;
    public readonly config: Configuration = Configuration.instance;

    constructor() {
        super();
        Registry.instance.components.on('register', this.defineComponent, this);
        if (VisionHelper.document) {
            document.addEventListener(
                "DOMContentLoaded",
                this.setup.bind(this)
            );
        } else {
            console.warn('No dom, running in CLI mode.');
        }
        this.registry.functions.register('log', console.log);
        this.registry.functions.register('warn', console.warn);
        this.registry.functions.register('error', console.error);
        this.registry.functions.register('info', console.info);
        this.registry.controllers.register('Object', Object);
        this.registry.controllers.register('WrappedArray', WrappedArray);
        this.registry.controllers.register('Data', DynamicScopeData);

        if (VisionHelper.window) {
            window['Vision'] = Vision;
            window['Registry'] = Registry;
            window['vision'] = window['vsn'] = this;
            window['Tree'] = Tree;
            window['$'] = Query;
            VisionHelper.window.dispatchEvent(new Event('vsn'));
        }
    }

    protected defineComponent(name, cls) {
        customElements.define(name, cls);
    }

    public get dom(): DOM {
        return this._dom;
    }

    public async exec(code: string) {
        return await this._dom.exec(code);
    }

    public async setup() {
        const body: HTMLElement = document.body;
        body.setAttribute('vsn-root', '');
        this._dom = DOM.instance;
        const startTime: number = new Date().getTime();
        await this._dom.buildFrom(document, true);
        const now = (new Date()).getTime();
        const setupTime = now - startTime;
        console.info(`Took ${setupTime}ms to start up VisionJS. https://www.vsnjs.com/`, `v${VERSION}`);
    }

    public static get instance() {
        if (!Vision._instance)
            Vision._instance = new Vision();

        return Vision._instance;
    }
}

export * from './Registry';
export * from "./attributes/_imports";
export * from './Scope/properties/_imports';
export * from './Attribute';
export * from './AST';
export {Formats} from './Formats';
export {Types} from './Types';
export {Validators} from './Validators';
export {DOM} from './DOM';
export {Scope} from './Scope';
export {ScopeReference} from './Scope/ScopeReference';
export {WrappedArray} from './Scope/WrappedArray';
export {Controller} from './Controller';
export {Model} from './Model';
export {EventDispatcher} from './EventDispatcher';
export {MessageList} from './MessageList';
export {SimplePromise} from './SimplePromise';
export {Tag} from './Tag';
export const vision: Vision = Vision.instance;
