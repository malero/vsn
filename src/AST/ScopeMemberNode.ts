import {Scope} from "../Scope";
import {DOM} from "../DOM";
import {Tag} from "../Tag";
import {TagList} from "../Tag/TagList";
import {DOMObject} from "../DOM/DOMObject";
import {TreeNode} from "../AST";
import {Node} from "./Node";
import {ElementQueryNode} from "./ElementQueryNode";
import {ScopeNodeAbstract} from "./ScopeNodeAbstract";
import {ObjectAccessor} from "../Scope/ObjectAccessor";
import {ScopeAbstract} from "../Scope/ScopeAbstract";

export class ScopeMemberNode extends ScopeNodeAbstract implements TreeNode {
    constructor(
        public readonly scope: TreeNode<Scope>,
        public readonly name: TreeNode<string>
    ) {
        super();
    }

    protected _getChildNodes(): Node[] {
        return [
            this.scope as Node,
            this.name as Node
        ]
    }

    protected async _evaluate(scope: Scope, dom: DOM, tag: Tag = null) {
        let scopes = [];
        const values = [];
        if (this.scope instanceof ElementQueryNode) {
            const elements = await this.scope.evaluate(scope, dom, tag);
            if (this.scope.first) {
                scopes.push(elements);
            } else {
                scopes = elements;
            }
        } else {
            const evalScope = await this.scope.evaluate(scope, dom, tag);
            if (evalScope instanceof TagList) {
                scopes = evalScope;
            } else {
                scopes.push(evalScope);
            }
        }

        for (let parent of scopes) {
            if (parent instanceof DOMObject)
                parent = parent.scope;
            else if (parent && !(parent instanceof ScopeAbstract))
                parent = new ObjectAccessor(parent);

            if (!parent) {
                throw Error(`Cannot access "${await this.name.evaluate(scope, dom, tag)}" of undefined.`);
            }
            const name = await this.name.evaluate(scope, dom, tag);
            await this.applyModifiers(name, parent, dom, tag);
            const value: any = parent.get(name, false);
            values.push(value instanceof Scope && value.wrapped || value);
        }
        return values.length === 1 ? values[0] : values;
    }
}
