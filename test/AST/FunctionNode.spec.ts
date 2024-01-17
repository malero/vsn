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

    it("should take a multitude of arguments", async () => {
        const tree = new Tree(`func add(a_int, a_dict, a_arr) { log(a_int, a_dict['a'], a_arr[0]); return a_int + a_dict['a'] + a_arr[0]; }; add(1, {'a':1, 'b': 2}, [1]);`);
        const scope = new Scope();
        await tree.prepare(scope, null, null);
        expect(scope.get('add')).toBeDefined();
        const v = await tree.evaluate(scope, null, null);
        expect(v).toBe(3);
    });
});
