import {Scope} from "../Scope";
import {DOM} from "../DOM";
import {Tag} from "../Tag";
import {TreeNode} from "../AST";
import {Node} from "./Node";
import {FunctionArgumentNode} from "./FunctionArgumentNode";
import {ScopeMemberNode} from "./ScopeMemberNode";
import {FunctionNode} from "./FunctionNode";
import {Registry} from "../Registry";

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

    public async evaluate(scope: Scope, dom: DOM, tag: Tag = null) {
        let functionScope: Scope = scope;
        if (this.fnc instanceof ScopeMemberNode) {
            functionScope = await this.fnc.scope.evaluate(scope, dom, tag);
        }

        const values = await this.args.evaluate(scope, dom, tag);
        const func = await this.fnc.evaluate(scope, dom, tag);
        if (!func) {
            const functionName = await (this.fnc as any).name.evaluate(scope, dom, tag);
            const returnValues = [];
            let calls = 0;
            for (const className of tag.preppedClasses) {
                const cls = Registry.instance.classes.getSynchronous(className);
                if (cls) {
                    if (cls.classScope.has(functionName)) {
                        const fnc = cls.classScope.get(functionName);
                        returnValues.push((await fnc.evaluate(functionScope, dom, tag))(...values));
                        calls++;
                    }
                }
            }
            if (calls === 1) {
                return returnValues[0];
            } else if (calls === 0) {
                throw new Error(`Function ${functionName} not found`);
            } else {
                return returnValues;
            }
        } else if (func instanceof FunctionNode) {
            return (await func.evaluate(functionScope, dom, tag) as any)(...values);
        } else {
            return func.call(functionScope.wrapped || functionScope, ...values);
        }
    }
}
