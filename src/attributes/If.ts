import {Attribute} from "../Attribute";
import {Tree} from "../ast";

export class If extends Attribute {
    protected tree: Tree;

    public setup(): void {
        const statement: string = this.tag.rawAttributes['v-if'];
        this.tree = new Tree(statement);
        this.onChange();
    }

    onChange() {
        this.tree.evaluate(this.tag.scope).then((result) => {
            console.log('onChange', result);
            if (result) {
                this.tag.show();
            } else {
                this.tag.hide();
            }
        });
    }
}
