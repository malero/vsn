import {Scope} from "../Scope";
import {DOM} from "../DOM";
import {Tag} from "../Tag";
import {TreeNode} from "../AST";
import {Node} from "./Node";
import {FunctionArgumentNode} from "./FunctionArgumentNode";
import {ScopeMemberNode} from "./ScopeMemberNode";
import {FunctionNode} from "./FunctionNode";
import {Registry} from "../Registry";
import {ElementQueryNode} from "./ElementQueryNode";
import {ClassNode} from "./ClassNode";

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

    protected async _evaluate(scope: Scope, dom: DOM, tag: Tag = null) {
        // @todo: Need to rewrite/refactor this. It's a bit of a mess with element queries.
        let tags: Tag[] = [];
        let functionScope: Scope = scope;
        let functionName: string = '';
        let instanceOfScopeMemberNode = false;
        if (this.fnc instanceof ScopeMemberNode) {
            instanceOfScopeMemberNode = true
            functionScope = await this.fnc.scope.evaluate(scope, dom, tag);
            functionName = await this.fnc.name.evaluate(scope, dom, tag);
            if (this.fnc.scope instanceof ElementQueryNode) {
                const _tags = await this.fnc.scope.evaluate(scope, dom, tag);
                if (_tags instanceof Array) {
                    tags = _tags;
                } else if (_tags instanceof Tag) {
                    tags = [_tags];
                } else {
                    throw new Error('Invalid element query result');
                }
            } else {
               tags = [tag];
            }
        }

        const values = await this.args.evaluate(scope, dom, tag);
        let func = await this.fnc.evaluate(scope, dom, tag);
        if (!func || func instanceof Array) {
            const functionName = await (this.fnc as any).name.evaluate(scope, dom, tag);
            const returnValues = [];
            const toCleanup = [];
            let calls = 0;

            for (const _tag of tags) {
                let tagNum = 0;
                for (const className of _tag.element[ClassNode.ClassesVariable] || []) {
                    tagNum++;
                    const cls = Registry.instance.classes.getSynchronous(className);
                    if (cls) {
                        if (cls.classScope.has(functionName)) {
                            const fnc = cls.classScope.get(functionName);
                            toCleanup.push(fnc);
                            returnValues.push(await (await fnc.evaluate(_tag.scope, dom, _tag))(...values));
                            calls++;
                        }
                    }
                }
            }

            for (const fnc of toCleanup) {
                await fnc.collectGarbage();
            }
            if (calls === 1) {
                return returnValues[0];
            } else if (calls === 0) {
                throw new Error(`Function ${functionName} not found`);
            } else {
                return returnValues;
            }
        } else if (func instanceof FunctionNode) {
            const r = await (await func.evaluate(functionScope, dom, tag) as any)(...values);
            await func.collectGarbage();
            return r;
        } else {
            return func.call(functionScope.wrapped || functionScope, ...values);
        }
    }
}
