import {DOM} from "../DOM";
import {Scope} from "../Scope";
import {ScopeReference} from "./ScopeReference";


export class QueryReference extends ScopeReference {
    constructor(
        public readonly path: string,
        public readonly scope: Scope
    ) {
        super();
    }

    public async getScope() {
        let parts: string[] = this.path.split('.');
        parts = parts.splice(0, parts.length - 1);
        const qResult = await DOM.instance.eval(parts.join('.'));
        return qResult.length === 1 ? qResult[0].scope : qResult.map((dobj) => dobj.scope);
    }

    public async getKey() {
        const parts: string[] = this.path.split('.');
        return parts[parts.length - 1];
    }

    public async getValue() {
        return await DOM.instance.eval(this.path);
    }
}
