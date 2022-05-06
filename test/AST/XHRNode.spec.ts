import {Tree} from "../../src/AST";
import {Scope} from "../../src/Scope";


describe('XHRNode', () => {
    it("should parse and stuff", async () => {
        const tree = new Tree(`{asd:123} >> '/test'`);
        const scope = new Scope();
    });
});
