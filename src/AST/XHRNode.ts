import {Node} from "./Node";
import {Token, TokenType, Tree, TreeNode} from "../AST";
import {Scope} from "../Scope";
import {DOM} from "../DOM";
import {Tag} from "../Tag";
import {ScopeDataAbstract} from "../Scope/ScopeDataAbstract";
import {VisionHelper} from "../helpers/VisionHelper";

export class XHRNode extends Node implements TreeNode {
    constructor(
        public readonly left: Node | null,
        public readonly requestType: TokenType,
        public readonly url: Node
    ) {
        super();
    }

    public getChildNodes(): Node[] {
        const nodes = [this.url];
        if (this.left)
            nodes.push(this.left);
        return nodes;
    }

    async evaluate(scope: Scope, dom: DOM, tag?: Tag) {
        let url = await this.url.evaluate(scope, dom, tag);
        let method: string;
        let data = this.left ? await this.left.evaluate(scope, dom, tag) : {};

        if (data instanceof Scope)
            data = data.data;

        if (data instanceof ScopeDataAbstract)
            data = data.getData();

        switch (this.requestType) {
            case TokenType.XHR_POST:
                method = "POST";
                break;
            case TokenType.XHR_PUT:
                method = "PUT";
                break;
            case TokenType.XHR_DELETE:
                method = "DELETE";
                break;
            default:
                method = "GET";
        }

        let request = {
            method: method
        };

        if (request.method === 'GET') {
            url = VisionHelper.getUriWithParams(url, data);
        } else {
            request['body'] = (typeof data === "string") ? data : JSON.stringify(data);
        }

        const response = await fetch(url, request);
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }
        return await response.text();
    }

    public static parse(node: Node, token: Token, tokens: Token[]): XHRNode {
        tokens.splice(0, 1); // Consume request type
        const url = Tree.processTokens(Tree.getNextStatementTokens(tokens, false, false, false));
        return new XHRNode(node, token.type, url);
    }

    public static match(tokens: Token[]) {
        return [
            TokenType.XHR_POST,
            TokenType.XHR_PUT,
            TokenType.XHR_GET,
            TokenType.XHR_DELETE,
        ].indexOf(tokens[0].type) > -1;
    }
}
