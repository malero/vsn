import {Tree} from "../../src/AST";
import {Scope} from "../../src/Scope";


describe('FunctionNode', () => {
    it("properly define a simple function", async () => {
        const tree = new Tree(`func add(a, b) { return a + b; }; add(1, 2);`);
        const scope = new Scope();
        await tree.prepare(scope, null, null);
        expect(scope.get('add')).toBeDefined();
        const v = await tree.evaluate(scope, null, null);
        expect(v).toBe(3);
    });
});
