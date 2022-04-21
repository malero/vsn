import {Scope} from "../Scope";


export class ScopeReference {
    private _scope: Scope;
    private _key: string;
    private _value: any;

    constructor(
        scope: Scope = null,
        key: string = null,
        value: any = null
    ) {
        this._scope = scope;
        this._key = key;
        this._value = value;
    }

    public async getScope() {
        return this._scope;
    }

    public async getKey() {
        return this._key;
    }

    public async getValue() {
        return this._value;
    }
}
