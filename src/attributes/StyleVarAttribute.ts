import {Registry} from "../Registry";
import {Attribute} from "../Attribute";
import {Scope} from "../Scope";
import {ScopeReference} from "../Scope/ScopeReference";


@Registry.attribute('vsn-style-var')
export class StyleVarAttribute extends Attribute {
    public static readonly canDefer: boolean = false;
    protected key?: string;
    protected styleVar?: string;
    protected boundScope?: Scope;

    public async connect() {
        let scopeKey: string = this.getAttributeValue();
        let ref: ScopeReference;
        try {
            ref = this.tag.scope.getReference(scopeKey);
        } catch (e) {
            console.error('error', e);
            return;
        }

        this.key = await ref.getKey();
        this.styleVar = this.getAttributeBinding();
        this.boundScope = await ref.getScope();
        this.boundScope.on(`change:${this.key}`, this.update, this);

        await super.connect();
    }

    public async disconnect() {
        this.boundScope.offWithContext(`change:${this.key}`, this);
        await super.disconnect();
    }

    update(e) {
        this.tag.element.style.setProperty(`--${this.styleVar}`, e.value);
    }
}
