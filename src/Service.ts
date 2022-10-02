import {Scope} from "./Scope";
import {ScopeObject} from "./Scope/ScopeObject";

export class Service extends ScopeObject {
    protected static _instance: Service;
    protected _scope: Scope;

    constructor() {
        super();
        this._scope = new Scope();
        this._scope.wrap(this);
    }

    public get scope(): Scope {
        return this._scope;
    }

    public static get instance(): Service {
        if (!this._instance) {
            this._instance = new this();
        }
        return this._instance;
    }
}
