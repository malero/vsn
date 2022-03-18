import {Registry} from "../Registry";
import {Attribute} from "../Attribute";
import {Scope, ScopeReference} from "../Scope";


@Registry.attribute('vsn-styles')
export class StyleAttribute extends Attribute {
    private scopeRef: ScopeReference;
    private styleScope: Scope;

    public async setup() {
        const key = this.getAttributeValue() || null;
        if (key) {
            this.scopeRef = this.tag.scope.getReference(key, true);
            const parentScope = await this.scopeRef.getScope();
            const styleKey = await this.scopeRef.getKey();
            this.styleScope = parentScope.get(styleKey);
            if (!this.styleScope) {
                this.styleScope = new Scope(parentScope);
                parentScope.set(styleKey, this.styleScope);
            }
        } else {
            this.styleScope = this.tag.scope;
        }

        await super.setup();
    }

    public async connect() {
        this.styleScope.bind(`change`, this.handleEvent.bind(this));
        await super.connect();
    }

    public async extract() {
        this.updateFrom();
        await super.extract();
    }

    updateFrom() {
        const toSkip = [
            'cssText',
            'length'
        ]
        for (const k in this.tag.style) {
            if (toSkip.indexOf(k) > -1 || isFinite(k as any))
                continue;
            const value = this.tag.style[k];
            const key = `$${k}`;
            if (value && value !== this.styleScope.get(key))
                this.styleScope.set(key, value);
        }
    }

    public mutate(mutation: MutationRecord) {
        super.mutate(mutation);
        this.updateFrom();
    }

    public async handleEvent(k, v) {
        if (k.startsWith('$')) {
            const key = k.substr(1);

            if (v.value !== v.previousValue) {
                this.tag.element.style[key] = v.value;
            }
        }
    }
}
