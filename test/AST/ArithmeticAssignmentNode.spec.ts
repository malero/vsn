import {SimplePromise} from "../../src/SimplePromise";
import {DOM} from "../../src/DOM";
import {Tree} from "../../src/AST";
import {Scope} from "../../src/Scope";


describe('ArithmeticAssignmentNode', () => {
    it("should support simple arithmetic with numbers", async () => {
        const tree = new Tree(`
            a = 1;
            a += 10;
            b = a + 1;
            b -= 10;
            c = a + 1;
            c /= 2;
            d = a + 1;
            d *= 2;
        `);
        const scope = new Scope();
        await tree.evaluate(scope, null, null);
        expect(scope.get("a")).toBe(11);
        expect(scope.get("b")).toBe(2);
        expect(scope.get("c")).toBe(6);
        expect(scope.get("d")).toBe(24);
    });

    it("should support simple arithmetic with numbers inside nested objects", async () => {
        const tree = new Tree(`
            z = {};
            a = 100;
            z.z = {};
            z.z.a = 10;
            z.a = 1;
            z.b = 15;
            z.a += z.z.a;
            z.b *= a + z.a + z.b;
            z.z.b = z.z.a + z.a;
            z.z.b *= z.z.a;
        `);
        const scope = new Scope();
        await tree.evaluate(scope, null, null);
        expect(await Tree.apply('z.z.a', scope, null, null)).toBe(10);
        expect(await Tree.apply('z.a', scope, null, null)).toBe(11);
        expect(await Tree.apply('z.b', scope, null, null)).toBe(1890);
        expect(await Tree.apply('z.z.b', scope, null, null)).toBe(210);
    });
});
