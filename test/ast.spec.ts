
import {Promise as SimplePromise, IDeferred} from 'simple-ts-promise';
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

        scope2.set('generate', (a, b) => {
            const _scope: Scope = new Scope();
            _scope.set(a, b);
            return _scope;
        });
    });

    it("should evaluate scope variables correctly", async () => {
        let tree: Tree = new Tree('foo');
        expect(await tree.evaluate(scope)).toBe(2);

        tree = new Tree('bar');
        expect(await tree.evaluate(scope)).toBe(3);
    });

    it("should be able to call functions within the scope", async () => {
        const tree: Tree = new Tree('baz.add(foo, bar)');
        expect(await tree.evaluate(scope)).toBe(5);

        scope.set('foo', 15);
        scope.set('bar', 33);
        expect(await tree.evaluate(scope)).toBe(48);
    });

    it("should be able to call functions with literals", async () => {
        let tree: Tree = new Tree('baz.add(foo, 5)');
        expect(await tree.evaluate(scope)).toBe(7);

        scope.set('foo', 15);
        expect(await tree.evaluate(scope)).toBe(20);

        tree = new Tree('baz.add(100, 5)');
        expect(await tree.evaluate(scope)).toBe(105);
    });

    it("should be able to call member variable of value returned from function call", async () => {
        const tree: Tree = new Tree('baz.generate("test", foo).test');
        expect(await tree.evaluate(scope)).toBe(2);

        scope.set('foo', 15);
        expect(await tree.evaluate(scope)).toBe(15);
    });

    it("should be able to call nested functions within the scope", async () => {
        const tree: Tree = new Tree('baz.add(baz.add(foo, foo), baz.add(bar, bar))');
        expect(await tree.evaluate(scope)).toBe(10);

        scope.set('foo', 15);
        scope.set('bar', 33);
        expect(await tree.evaluate(scope)).toBe(96);
    });

    it("should be able to execute multiple statments properly", async () => {
        const tree: Tree = new Tree(`
            1;
            2;
            baz.add(100, 5);
            5;
        `);
        expect(await tree.evaluate(scope)).toBe(5);
    });

    it("should be able to compare properly", async () => {
        let tree: Tree = new Tree(`1!='1'`);
        expect(await tree.evaluate(scope)).toBe(true);
        tree = new Tree(`1==1`);
        expect(await tree.evaluate(scope)).toBe(true);
        tree = new Tree(`1>1`);
        expect(await tree.evaluate(scope)).toBe(false);
        tree = new Tree(`2>1`);
        expect(await tree.evaluate(scope)).toBe(true);
    });

    it("should be able to execute if statements properly",async () => {
        let tree: Tree = new Tree('if (true) { return true; } else { return false; }');
        expect(await tree.evaluate(scope)).toBe(true);
        tree = new Tree('if (false) { return true; } else { return false; }');
        expect(await tree.evaluate(scope)).toBe(false);
        tree = new Tree('if (false) { return true; } else if (true) { return 15; } else { return false; }');
        expect(await tree.evaluate(scope)).toBe(15);
        const innerScope: Scope = new Scope();
        innerScope.wrap({method: () => { return 15; }});
        scope.set('test', innerScope);
        tree = new Tree(`
            if (false) {
                return true;
            } else if (test.method() == 15) {
                test.method() + 5;
                return test.method(); 
            } else {
                return false;
            }`);
        expect(await tree.evaluate(scope)).toBe(15);
        tree = new Tree(`
            test = 11;
            if (test == 11) {
                return true;
            } else if (true) {
                return false; 
            } else {
                return null;
            }`);
        expect(await tree.evaluate(scope)).toBe(true);
        // Multiple if statements
        tree = new Tree(`
            poop = 15;
            if (poop > 5) {
                poop = 3;
            } else if (true) {
                poop = 5;
            } else {
                poop = false;
            }
            if (poop == 3) {
                poop = 5;
            }`);
        await tree.evaluate(scope);
        expect(scope.get('poop')).toBe(5);
        console.log('=========================');
    });

    it("should be able to assign variables properly", async () => {
        let tree: Tree = new Tree(`something = 5;return something;`);
        expect(await tree.evaluate(scope)).toBe(5);
        expect(scope.get('something')).toBe(5);
        tree = new Tree(`something = somethingElse = 5;return something;`);
        expect(await tree.evaluate(scope)).toBe(5);
        expect(scope.get('something')).toBe(5);
        expect(scope.get('somethingElse')).toBe(5);
        tree = new Tree(`something = null;`);
        await tree.evaluate(scope);
        expect(scope.get('something')).toBe(null);
    });

    it("should be able to execute basic arithmetic", async () => {
        let tree: Tree = new Tree('5 + 3');
        expect(await tree.evaluate(scope)).toBe(8);
        tree = new Tree('8 - 3');
        expect(await tree.evaluate(scope)).toBe(5);
    });

    it("should be able to assign with incrementing/decrementing variables properly", async () => {
        let tree: Tree = new Tree(`something = 5;something += 10;`);
        expect(await tree.evaluate(scope)).toBe(15);
        expect(scope.get('something')).toBe(15);
        tree = new Tree(`something = 5;something -= 10;`);
        expect(await tree.evaluate(scope)).toBe(-5);
        expect(scope.get('something')).toBe(-5);
        tree = new Tree(`something = 5;something *= 10;`);
        expect(await tree.evaluate(scope)).toBe(50);
        expect(scope.get('something')).toBe(50);
        tree = new Tree(`something = 10;something /= 10;`);
        expect(await tree.evaluate(scope)).toBe(1);
        expect(scope.get('something')).toBe(1);
    });

    it("should be able to block properly with promises", async (done) => {
        scope.set('blockingFunction', async (num, toAdd, fin: boolean = false) => {
            const deferred: IDeferred<number> = SimplePromise.defer();
            expect(scope.get('test')).toBe(num);

            setTimeout(() => {
                deferred.resolve(num + toAdd);
            }, 1);

            if (fin)
                done();

            return deferred.promise;
        });

        let tree: Tree = new Tree(`
            test = 1;
            if (true) {
                test = blockingFunction(test, 2);
                test = blockingFunction(test, 5);
                test = blockingFunction(test, 1, true);
            }
        `);
        await tree.evaluate(scope);
    });

    it("should be able to execute for loops", async () => {
        scope.set('loopTest', [1,2,3,4,5,6,7,8,9]);
        let tree: Tree = new Tree(`
            test = 1;
            for (var of loopTest) {
                test += var;
            }
        `);
        await tree.evaluate(scope);
        expect(scope.get('test')).toBe(46);
    });
});
