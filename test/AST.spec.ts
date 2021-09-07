import {Promise as SimplePromise, IDeferred} from 'simple-ts-promise';
import {Scope} from "../src/Scope";
import {Tree} from "../src/AST";
import {DOM} from "../src/DOM";

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

    it("should parse number literals correctly", async () => {
        scope = new Scope();
        let tree: Tree = new Tree('foo = 5;baz=-15;');
        const dom: DOM = new DOM(document, false);
        await tree.evaluate(scope, dom)
        expect(scope.get('baz')).toBe(-15);
        expect(scope.get('foo')).toBe(5);

        tree = new Tree('bar = 1.5;nitch=-1.5;');
        await tree.evaluate(scope, dom);
        expect(scope.get('bar')).toBe(1.5);
        expect(scope.get('nitch')).toBe(-1.5);
    });

    it("should evaluate scope variables correctly", async () => {
        let tree: Tree = new Tree('foo');
        const dom: DOM = new DOM(document, false);
        expect(await tree.evaluate(scope, dom)).toBe(2);

        tree = new Tree('bar');
        expect(await tree.evaluate(scope, dom)).toBe(3);
    });

    it("should be able to call functions within the scope", async () => {
        const tree: Tree = new Tree('baz.add(foo, bar)');
        const dom: DOM = new DOM(document, false);
        expect(await tree.evaluate(scope, dom)).toBe(5);

        scope.set('foo', 15);
        scope.set('bar', 33);
        expect(await tree.evaluate(scope, dom)).toBe(48);
    });

    it("should be able to call functions with literals", async () => {
        let tree: Tree = new Tree('baz.add(foo, 5)');
        const dom: DOM = new DOM(document, false);
        expect(await tree.evaluate(scope, dom)).toBe(7);

        scope.set('foo', 15);
        expect(await tree.evaluate(scope, dom)).toBe(20);

        tree = new Tree('baz.add(100, 5)');
        expect(await tree.evaluate(scope, dom)).toBe(105);
    });

    it("should be able to call member variable of value returned from function call", async () => {
        const tree: Tree = new Tree('baz.generate("test", foo).test');
        const dom: DOM = new DOM(document, false);
        expect(await tree.evaluate(scope, dom)).toBe(2);

        scope.set('foo', 15);
        expect(await tree.evaluate(scope, dom)).toBe(15);
    });

    it("should be able to call nested functions within the scope", async () => {
        const tree: Tree = new Tree('baz.add(baz.add(foo, foo), baz.add(bar, bar))');
        const dom: DOM = new DOM(document, false);
        expect(await tree.evaluate(scope, dom)).toBe(10);

        scope.set('foo', 15);
        scope.set('bar', 33);
        expect(await tree.evaluate(scope, dom)).toBe(96);
    });

    it("should be able to execute multiple statments properly", async () => {
        const tree: Tree = new Tree(`
            1;
            2;
            baz.add(100, 5);
            5;
        `);
        const dom: DOM = new DOM(document, false);
        expect(await tree.evaluate(scope, dom)).toBe(5);
    });

    it("should be able to compare properly", async () => {
        let tree: Tree = new Tree(`1!='1'`);
        const dom: DOM = new DOM(document, false);
        expect(await tree.evaluate(scope, dom)).toBe(true);
        tree = new Tree(`1==1`);
        expect(await tree.evaluate(scope, dom)).toBe(true);
        tree = new Tree(`1>1`);
        expect(await tree.evaluate(scope, dom)).toBe(false);
        tree = new Tree(`2>1`);
        expect(await tree.evaluate(scope, dom)).toBe(true);
    });

    it("should be able to execute if statements properly",async () => {
        let tree: Tree = new Tree('if (true) { return true; } else { return false; }');
        const dom: DOM = new DOM(document, false);
        expect(await tree.evaluate(scope, dom)).toBe(true);
        tree = new Tree('if (false) { return true; } else { return false; }');
        expect(await tree.evaluate(scope, dom)).toBe(false);
        tree = new Tree('if (false) { return true; } else if (true) { return 15; } else { return false; }');
        expect(await tree.evaluate(scope, dom)).toBe(15);
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
        expect(await tree.evaluate(scope, dom)).toBe(15);
        tree = new Tree(`
            test = 11;
            if (test == 11) {
                return true;
            } else if (true) {
                return false; 
            } else {
                return null;
            }`);
        expect(await tree.evaluate(scope, dom)).toBe(true);
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
        await tree.evaluate(scope, dom);
        expect(scope.get('poop')).toBe(5);
        console.log('=========================');
    });

    it("should be able to assign variables properly", async () => {
        let tree: Tree = new Tree(`something = 5;somethingElse=6;return something;`);
        const dom: DOM = new DOM(document, false);
        expect(await tree.evaluate(scope, dom)).toBe(5);
        expect(scope.get('something')).toBe(5);
        tree = new Tree(`something = somethingElse = 5;return something;`);
        expect(await tree.evaluate(scope, dom)).toBe(5);
        expect(scope.get('something')).toBe(5);
        expect(scope.get('somethingElse')).toBe(5);
        tree = new Tree(`something = null;`);
        await tree.evaluate(scope, dom);
        expect(scope.get('something')).toBe(null);
    });

    it("should be able to execute basic arithmetic", async () => {
        let tree: Tree = new Tree('5 + 3');
        const dom: DOM = new DOM(document, false);
        expect(await tree.evaluate(scope, dom)).toBe(8);
        tree = new Tree('8 - 3');
        expect(await tree.evaluate(scope, dom)).toBe(5);
    });

    it("should be able to assign with incrementing/decrementing variables properly", async () => {
        let tree: Tree = new Tree(`something = 5;something += 10;`);
        const dom: DOM = new DOM(document, false);
        expect(await tree.evaluate(scope, dom)).toBe(15);
        expect(scope.get('something')).toBe(15);
        tree = new Tree(`something = 5;something -= 10;`);
        expect(await tree.evaluate(scope, dom)).toBe(-5);
        expect(scope.get('something')).toBe(-5);
        tree = new Tree(`something = 5;something *= 10;`);
        expect(await tree.evaluate(scope, dom)).toBe(50);
        expect(scope.get('something')).toBe(50);
        tree = new Tree(`something = 10;something /= 10;`);
        expect(await tree.evaluate(scope, dom)).toBe(1);
        expect(scope.get('something')).toBe(1);
    });

    it("should be able to assign arrays with incrementing/decrementing variables properly", async () => {
        let tree: Tree = new Tree(`something = [5,6];something += 10;`);
        const dom: DOM = new DOM(document, false);
        await tree.evaluate(scope, dom);
        const something = scope.get('something');
        expect(something).toEqual([5,6,10]);

        tree = new Tree(`something -= 5;`);
        await tree.evaluate(scope, dom);
        expect(something).toEqual([6,10]);
    });

    it("should be able to block properly with promises", async () => {
        scope.set('blockingFunction', async (num, toAdd, fin: boolean = false) => {
            const deferred: IDeferred<number> = SimplePromise.defer();
            expect(scope.get('test')).toBe(num);

            setTimeout(() => {
                deferred.resolve(num + toAdd);
            }, 1);

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
        const dom: DOM = new DOM(document, false);
        await tree.evaluate(scope, dom);
    });

    it("should be able to execute for loops", async () => {
        scope.set('loopTest', [1,2,3,4,5,6,7,8,9]);
        let tree: Tree = new Tree(`
            test = 1;
            for (var of loopTest) {
                test += var;
            }
        `);
        const dom: DOM = new DOM(document, false);
        await tree.evaluate(scope, dom);
        expect(scope.get('test')).toBe(46);
    });

    it("should be able parse an array of numbers", async () => {
        let tree: Tree = new Tree(`test = [0,1,2,3,4,5];`);
        const dom: DOM = new DOM(document, false);
        await tree.evaluate(scope, dom);

        expect(scope.get('test').length).toBe(6);
        for (let i = 0; i<=5; i++) {
            expect(scope.get('test')[i]).toBe(i);
        }
    });

    it("should be able parse an object literal", async () => {
        let tree: Tree = new Tree(`test = {"x":0,"y":1,"z":2};`);
        const dom: DOM = new DOM(document, false);
        await tree.evaluate(scope, dom);
        expect(scope.get('test').get('x')).toBe(0);
        expect(scope.get('test').get('y')).toBe(1);
        expect(scope.get('test').get('z')).toBe(2);
    });

    it("should be able parse an object literal with a key from the scope", async () => {
        let tree: Tree = new Tree(`xKey = 'x'; test = {xKey:120,"y":1,"z":2};`);
        const dom: DOM = new DOM(document, false);
        await tree.evaluate(scope, dom);
        expect(scope.get('test').get('y')).toBe(1);
        expect(scope.get('test').get('z')).toBe(2);
        expect(scope.get('test').get('x')).toBe(120);
    });
    
    it("should be able to check if item is in an array", async () => {
        let tree: Tree = new Tree(`a in [1,2,3]`);
        const dom: DOM = new DOM(document, false);
        scope.set('a', 1);
        expect(await tree.evaluate(scope, dom)).toBe(true);
        scope.set('a', 4);
        expect(await tree.evaluate(scope, dom)).toBe(false);

        tree = new Tree(`a in b`);
        scope.set('a', 'test');
        scope.set('b', [1,2,3]);
        expect(await tree.evaluate(scope, dom)).toBe(false);

        tree = new Tree(`a not in b`);
        scope.set('a', 'test');
        scope.set('b', [1,2,3]);
        expect(await tree.evaluate(scope, dom)).toBe(true);
        scope.set('a', 1);
        scope.set('b', [1,2,3]);
        expect(await tree.evaluate(scope, dom)).toBe(false);
        scope.set('a', 4);
        scope.set('b', [1,2,3]);
        expect(await tree.evaluate(scope, dom)).toBe(true);
    });
});
