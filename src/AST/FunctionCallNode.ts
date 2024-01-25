import {Scope} from "../Scope";
import {DOM} from "../DOM";
import {Tag} from "../Tag";
import {TreeNode} from "../AST";
import {Node} from "./Node";
import {FunctionArgumentNode} from "./FunctionArgumentNode";
import {ScopeMemberNode} from "./ScopeMemberNode";
import {FunctionNode} from "./FunctionNode";
import {ElementQueryNode} from "./ElementQueryNode";

export class FunctionCallNode<T = any> extends Node implements TreeNode {
    constructor(
        public readonly fnc: TreeNode<(...args: any[]) => any>,
        public readonly args: FunctionArgumentNode<any[]>
    ) {
        super();
    }

    protected _getChildNodes(): Node[] {
        return [
            this.fnc as Node,
            this.args as Node
        ]
    }

    protected async callFunction(func, functionScope, dom, tag, ...values): Promise<[any, boolean]> {
        if (func instanceof FunctionNode) {
            const r = await (await func.evaluate(functionScope, dom, tag) as any)(...values);
            await func.collectGarbage();
            return [r, true];
        } else if (typeof func === 'function') {
            return [func.call(functionScope.wrapped || functionScope, ...values), true];
        }
        return [null, false];
    }

    protected async _evaluate(scope: Scope, dom: DOM, tag: Tag = null) {
        // @todo: Need to rewrite/refactor this. It's a bit of a mess with element queries.
        let tags: Tag[] = [];
        let functionScope: Scope = scope;
        if (this.fnc instanceof ScopeMemberNode) {
            if (this.fnc.scope instanceof ElementQueryNode) {
                const _tags = await this.fnc.scope.evaluate(scope, dom, tag);
                if (_tags instanceof Array) {
                    tags = _tags;
                } else if (_tags instanceof Tag) {
                    tags = [_tags];
                    functionScope = _tags.scope;
                } else {
                    throw new Error('Invalid element query result');
                }
            } else {
                functionScope = await this.fnc.scope.evaluate(scope, dom, tag);
            }
        }

        if (tags.length === 0)
            tags.push(tag);

        const values = await this.args.evaluate(scope, dom, tag);
        const functionName = await (this.fnc as any).name.evaluate(scope, dom, tag);
        const returnValues = [];
        let calls = 0;
        let func;
        let _functionScope: Scope = functionScope;

        for (const _tag of tags) {
            if (_tag === null) {
                _functionScope = functionScope;
            } else {
                _functionScope = _tag.scope;
            }

            if (_functionScope.has(functionName)) {
                func = _functionScope.get(functionName);
            } else {
                func = await this.fnc.evaluate(scope, dom, _tag);
            }

            const [result, success] = await this.callFunction(func, _functionScope, dom, _tag, ...values);
            if (success) {
                returnValues.push(result);
                calls++;
            } else {
                console.warn(`Function ${functionName} was not found in current scope.`);
            }
        }

        if (calls === 1) {
            return returnValues[0];
        } else if (calls === 0) {
            throw new Error(`Function ${functionName} not found`);
        } else {
            return returnValues;
        }
    }
}
