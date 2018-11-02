import {Tag} from "../Tag";
import {Scope, ScopeReference} from "../Scope";

export class Click extends Tag {
    protected onClickHandler: any;

    protected setup(): void {
        const click: string = this.attributes['v-click'];
        const ref: ScopeReference = this.scope.getReference(click);
        this.onClickHandler = ref.value;
        this.element.onclick = this.onClick.bind(this);
    }

    onClick() {
        if (this.onClickHandler)
            this.onClickHandler();
    }
}
