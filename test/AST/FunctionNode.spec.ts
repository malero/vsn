import {Tree} from "../../src/AST";
import {Scope} from "../../src/Scope";
import {Registry} from "../../src/Registry";
import {DOM, Service, Tag} from "../../src/vsn";


@Registry.service('FunctionNodeScopeTestService')
class FunctionNodeScopeTestController extends Service {
    test1() {
        return this.test2();
    }

    test2() {
        return 99;
    }
}


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

    it("methods should be callable with correct binding", async () => {
        document.body.innerHTML = `
            <div id="service-test" vsn-service:test="FunctionNodeScopeTestService"></div>
        `;
        const dom = new DOM(document.body);
        await new Promise((resolve, reject) => {
            dom.once('built', async () => {
                const result = await dom.exec('test.test1()');
                expect(result).toBe(99);
                resolve(null);
            });
        });
    });
});
