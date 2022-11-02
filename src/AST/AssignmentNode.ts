import {Scope} from "../Scope";
import {DOM} from "../DOM";
import {Tag} from "../Tag";
import {DOMObject} from "../DOM/DOMObject";
import {BlockType, Token, TokenType, Tree, TreeNode} from "../AST";
import {Node} from "./Node";
import {RootScopeMemberNode} from "./RootScopeMemberNode";
import {ScopeMemberNode} from "./ScopeMemberNode";
import {ElementQueryNode} from "./ElementQueryNode";
import {ElementAttributeNode} from "./ElementAttributeNode";
import {ElementStyleNode} from "./ElementStyleNode";
import {UnitLiteral} from "./UnitLiteralNode";
import {ScopeObject} from "../Scope/ScopeObject";

export class AssignmentNode extends Node implements TreeNode {
    constructor(
        public readonly left: RootScopeMemberNode | ScopeMemberNode,
        public readonly right: TreeNode,
        public readonly type: TokenType
    ) {
        super();
    }

    protected _getChildNodes(): Node[] {
        return [
            this.left as Node,
            this.right as Node
        ]
    }

    async evaluate(scope: Scope, dom: DOM, tag: Tag = null) {
        let scopes = [];
        const name: string = await this.left.name.evaluate(scope, dom, tag);

        if (this.left instanceof ScopeMemberNode) {
            const inner = await this.left.scope.evaluate(scope, dom, tag);
            if (this.left.scope instanceof ElementQueryNode) {
                if (this.left.scope.first) {
                    scopes.push(inner);
                } else {
                    scopes.push(...inner);
                }
            } else if (inner instanceof Scope) {
                scopes.push(inner);
            } else if (inner instanceof ScopeObject) {
                scopes.push(inner.scope);
            } else {
                scopes.push(scope)
            }
        } else if ((this.left instanceof ElementAttributeNode || this.left instanceof ElementStyleNode) && this.left.elementRef) {
            const elements = await this.left.elementRef.evaluate(scope, dom, tag);
            if (this.left.elementRef.first || elements instanceof DOMObject) {
                scopes.push(elements);
            } else {
                scopes = elements;
            }
        } else {
            scopes.push(scope);
        }

        const values = [];
        for (let localScope of scopes) {
            if (!localScope) continue;
            if (localScope instanceof DOMObject) {
                await this.handleDOMObject(name, dom, scope, localScope, tag);
            } else {
                if (localScope['$wrapped'] && localScope['$scope']) {
                    localScope = localScope['$scope'];
                }

                // We get the values from the passed scope, but set the value on the local scope
                let left: number | Array<any> | string = await this.left.evaluate(scope, dom, tag);
                let right: number | Array<any> | string = await this.right.evaluate(scope, dom, tag);
                left = this.handle(name, left, right, localScope);

                values.push(left);
            }
        }
        return values.length > 1 ? values : values[0];
    }

    public handle(name, left, right, localScope) {
        if (left instanceof Array) {
            left = this.handleArray(name, left, right, localScope);
        } else if ((left as any) instanceof UnitLiteral || right instanceof UnitLiteral) {
            left = this.handleUnit(name, left, right, localScope);
        } else if (Number.isFinite(left)) {
            left = this.handleNumber(name, left, right, localScope);
        } else {
            left = this.handleString(name, left, right, localScope);
        }

        return left;
    }

    public handleNumber(key, left, right, scope) {
        if (right !== null && !Number.isFinite(right))
            right = parseFloat(`${right}`);

        left = left as number;
        right = right as number;

        switch (this.type) {
            case TokenType.ASSIGN:
                left = right;
                break;
            case TokenType.ADD_ASSIGN:
                left += right;
                break;
            case TokenType.SUBTRACT_ASSIGN:
                left -= right;
                break;
            case TokenType.MULTIPLY_ASSIGN:
                left *= right;
                break;
            case TokenType.DIVIDE_ASSIGN:
                left /= right;
                break;
        }
        scope.set(key, left);
        return left;
    }

    public handleString(key, left, right, scope) {
        switch (this.type) {
            case TokenType.ASSIGN:
                left = right;
                break;
            case TokenType.ADD_ASSIGN:
                left = `${left}${right}`;
                break;
            case TokenType.SUBTRACT_ASSIGN:
                left.replace(right, '');
                break;
            case TokenType.MULTIPLY_ASSIGN:
                left *= right;
                break;
            case TokenType.DIVIDE_ASSIGN:
                left /= right;
                break;
        }
        scope.set(key, left);
        return left;
    }

    public handleUnit(key, left, right, scope) {
        if (!(left instanceof UnitLiteral)) {
            left = new UnitLiteral(left);
        }

        if (!(right instanceof UnitLiteral)) {
            right = new UnitLiteral(right);
        }
        const unit = left.unit || right.unit || 'px';

        switch (this.type) {
            case TokenType.ASSIGN:
                left = right;
                break;
            case TokenType.ADD_ASSIGN:
                left = new UnitLiteral(`${left.amount+right.amount}${unit}`);
                break;
            case TokenType.SUBTRACT_ASSIGN:
                left = new UnitLiteral(`${left.amount-right.amount}${unit}`);
                break;
            case TokenType.MULTIPLY_ASSIGN:
                left = new UnitLiteral(`${left.amount*right.amount}${unit}`);
                break;
            case TokenType.DIVIDE_ASSIGN:
                left = new UnitLiteral(`${left.amount/right.amount}${unit}`);
                break;
        }

        scope.set(key, left);
        return left;
    }

    public async handleDOMObject(key: string, dom: DOM, scope: Scope, domObject: DOMObject, tag: Tag) {
        let left = domObject.scope.get(key);
        let right: number | Array<any> | string = await this.right.evaluate(scope, dom, tag);
        return this.handle(key, left, right, domObject.scope);
    }

    public handleArray(key, left, right, scope) {
        if (!(right instanceof Array))
            right = [right];
        switch (this.type) {
            case TokenType.ASSIGN:
                left.splice(0, left.length);
                left.push(...right);
                break;
            case TokenType.ADD_ASSIGN:
                left.push(...right);
                break;
            case TokenType.SUBTRACT_ASSIGN:
                for (let i = left.length - 1; i >= 0; i--) {
                    if (right.indexOf(left[i]) > -1) {
                        left.splice(i, 1);
                        i++;
                    }
                }
                break;
            case TokenType.TILDE:
                for (const toggle of right) {
                    const index = left.indexOf(toggle);
                    if (index > -1) {
                        left.splice(index, 1);
                    } else {
                        left.push(toggle);
                    }
                }
                break;
        }

        /*
         We have to trigger a change manually here. Setting the variable on the scope with an array won't trigger
         it since we are modifying values inside of the array instance.
         */
        scope.dispatch(`change:${key}`);

        return left;
    }

    public static match(tokens: Token[]): boolean {
        return [
            TokenType.ASSIGN,
            TokenType.ADD_ASSIGN,
            TokenType.SUBTRACT_ASSIGN,
            TokenType.MULTIPLY_ASSIGN,
            TokenType.DIVIDE_ASSIGN,
            TokenType.TILDE,
        ].indexOf(tokens[0].type) > -1;
    }

    public static parse(lastNode: any, token, tokens: Token[]): AssignmentNode {
        if (!(lastNode instanceof RootScopeMemberNode) && !(lastNode instanceof ScopeMemberNode) && !(lastNode instanceof ElementAttributeNode) && !(lastNode instanceof ElementStyleNode)) {
            throw SyntaxError(`Invalid assignment syntax near ${Tree.toCode(tokens.splice(0, 10))}`);
        }
        tokens.splice(0, 1); // consume =
        //const assignmentTokens: Token[] = Tree.getNextStatementTokens(tokens, false, false, true);
        const assignmentTokens: Token[] = Tree.getTokensUntil(tokens, TokenType.SEMICOLON, false, true, true, {
            type: BlockType.STATEMENT,
            open: TokenType.NULL,
            close: TokenType.SEMICOLON,
            openCharacter: '',
            closeCharacter: ';',
        });

        return new AssignmentNode(
            lastNode as RootScopeMemberNode,
            Tree.processTokens(assignmentTokens),
            token.type
        );
    }
}
