

import {Scope} from "../src/Scope";
import {Tree} from "../src/ast";

describe('Tree', () => {
    let scope: Scope = null,
        scope2: Scope = null;

    beforeEach(() => {
        scope = new Scope();
        scope2 = new Scope();
        scope.set('foo', 2);
        scope.set('bar', 3);
        scope.set('baz', scope2);
        scope2.set('add', (a, b) => {
            return a + b;
        });
    });


    it("should evaluate scope variables correctly", () => {
        let tree: Tree = new Tree('foo');
        expect(tree.evaluate(scope)).toBe(2);

        tree = new Tree('bar');
        expect(tree.evaluate(scope)).toBe(3);
    });

    it("should be able to call functions within the scope", () => {
        const tree: Tree = new Tree('baz.add(foo, bar)');
        expect(tree.evaluate(scope)).toBe(5);

        scope.set('foo', 15);
        scope.set('bar', 33);
        expect(tree.evaluate(scope)).toBe(48);
    });

    it("should be able to call functions with literals", () => {
        let tree: Tree = new Tree('baz.add(foo, 5)');
        expect(tree.evaluate(scope)).toBe(7);

        scope.set('foo', 15);
        expect(tree.evaluate(scope)).toBe(20);

        tree = new Tree('baz.add(100, 5)');
        expect(tree.evaluate(scope)).toBe(105);
    });

    it("should be able to call nested functions within the scope", () => {
        const tree: Tree = new Tree('baz.add(baz.add(foo, foo), baz.add(bar, bar))');
        expect(tree.evaluate(scope)).toBe(10);

        scope.set('foo', 15);
        scope.set('bar', 33);
        expect(tree.evaluate(scope)).toBe(96);
    });
});
