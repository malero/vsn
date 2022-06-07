import {Node} from "./Node";
import {TreeNode} from "../AST";
import {Scope} from "../Scope";
import {DOM} from "../DOM";
import {Tag} from "../Tag";
import {Registry} from "../Registry";

export abstract class ScopeNodeAbstract extends Node implements TreeNode {
    async applyModifiers(name: string, scope: Scope, dom: DOM, tag: Tag) {
        let type: string;
        for (const modifier of this.modifiers) {
            if (Registry.instance.types.has(modifier)) {
                type = modifier;
                break;
            }
        }
        if (type)
            scope.setType(name, type);
    }
}