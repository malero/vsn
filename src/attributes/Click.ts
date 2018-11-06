import {ScopeReference} from "../Scope";
import {Attribute} from "../Attribute";

export class Click extends Attribute {
    protected onClickHandler: any;

    public setup(): void {
        const click: string = this.tag.rawAttributes['v-click'];
        const ref: ScopeReference = this.tag.scope.getReference(click);
        this.onClickHandler = ref.value;
        this.tag.element.onclick = this.onClick.bind(this);
    }

    onClick() {
        if (this.onClickHandler)
            this.onClickHandler();
    }
}
