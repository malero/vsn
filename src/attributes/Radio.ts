import {Registry} from "../Registry";
import {Attribute} from "../Attribute";
import {Scope} from "../Scope";
import {ScopeReference} from "../Scope/ScopeReference";


@Registry.attribute('vsn-radio')
export class Radio extends Attribute {
    public static readonly canDefer: boolean = false;
    protected key?: string;
    protected boundScope?: Scope;

    public async setup() {
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
        await super.setup();
    }

    public async extract() {
        if (this.tag.checked)
            await this.handleEvent(null);
        await super.extract();
    }

    public async connect() {
        this.boundScope.on(`change:${this.key}`, this.checkSelected, this);
        this.tag.addEventHandler('change', this.getAttributeModifiers(), this.handleEvent.bind(this));
        await this.checkSelected();
        await super.connect();
    }

    public async evaluate() {
        await this.checkSelected();
        await super.evaluate();
    }

    async handleEvent(e) {
        this.boundScope.set(this.key, this.tag.value);
    }

    async checkSelected() {
        const scopeValue = this.boundScope.get(this.key);
        this.tag.checked = `${scopeValue}` === this.tag.value;
    }
}
