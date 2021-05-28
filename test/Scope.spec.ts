import {Scope} from "../src/Scope";

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
