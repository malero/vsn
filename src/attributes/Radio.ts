import {Registry} from "../Registry";
import {Attribute} from "../Attribute";
import {Scope, ScopeReference} from "../Scope";


@Registry.attribute('vsn-radio')
export class Radio extends Attribute {
    public static readonly canDefer: boolean = false;
    protected key?: string;
    protected boundScope?: Scope;

    public async extract() {
        let scopeKey: string = this.getAttributeValue() || this.tag.getRawAttributeValue('name');
        let ref: ScopeReference;
        try {
            ref = this.tag.scope.getReference(scopeKey);
        } catch (e) {
            console.error('error', e);
            return;
        }

        this.key = await ref.getKey();
        this.boundScope = await ref.getScope();
    }

    public async connect() {
        this.boundScope.bind(`change:${this.key}`, this.checkSelected, this);
        this.tag.addEventHandler('change', this.getAttributeModifiers(), this.handleEvent.bind(this));
    }

    async handleEvent(e) {
        this.boundScope.set(this.key, this.tag.value);
    }

    async checkSelected() {
        this.tag.checked = this.boundScope.get(this.key) === this.tag.value;
    }
}
