import {Scope, WrappedArray} from "../src/Scope";

class Test {
    public testing: string = 'test';

    constructor() {
    }

    test(): boolean {
        return this.testing === 'test';
    }
}

describe('Scope', () => {
    it("should wrap objects correctly", async () => {
        const scope = new Scope();
        const obj = new Test();
        scope.wrap(obj);

        expect(obj.test()).toBe(true);
        scope.set('testing', 'yes');
        expect(obj.test()).toBe(false);
        obj.testing = 'test';
        expect(scope.get('testing')).toBe('test');
        expect(scope.get('test').call(scope.wrapped)).toBe(true);
    });
});

describe('WrappedArray', () => {
    it("should behave like an array", async () => {
        const a = new WrappedArray();
        let removes: number = 0;
        a.on('remove', (e) => {
             removes += 1;
        });
        a.push(1);
        a.push(2);
        a.push(3);
        a.splice(1, 2);
        expect(removes).toBe(2);
        expect(a.length).toBe(1);
    });

    it("should trigger change events", async () => {
        const a = new WrappedArray();
        let changes: number = 0;
        a.on('change', (e) => {
             changes += 1;
        });
        a.push(1);
        a.push(2);
        a.push(3);
        a.setLength(0);
        expect(changes).toBe(6);
        expect(a.length).toBe(0);
    });
});
