import {Registry} from "../Registry";
import {Attribute} from "../Attribute";
import {Scope} from "../Scope";
import {ScopeReference} from "../Scope/ScopeReference";


@Registry.attribute('vsn-styles')
export class StyleAttribute extends Attribute {
    public static readonly canDefer: boolean = false;
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
        this.styleScope.on(`change`, this.handleEvent.bind(this));
        await super.connect();
    }

    public async disconnect() {
        this.styleScope.offWithContext(`change`, this);
        await super.disconnect();
    }

    public async extract() {
        this.updateFrom();
        this.updateTo();
        await super.extract();
    }

    updateFrom() {
        const toSkip = [
            'cssText',
            'getPropertyPriority',
            'getPropertyValue',
            'removeProperty',
            'setProperty',
            'length'
        ];
        for (const k in this.tag.style) {
            if (toSkip.indexOf(k) > -1 || isFinite(k as any))
                continue;
            const value = this.tag.style[k];
            const key = `$${k}`;
            if (value && value !== this.styleScope.get(key))
                this.styleScope.set(key, value);
        }
    }

    public updateTo() {
        for (const k of this.styleScope.keys) {
            const v = this.styleScope.get(k);
            if (k.startsWith('$')) {
                const key = k.substr(1);
                this.tag.element.style[key] = v.value;
            }
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
