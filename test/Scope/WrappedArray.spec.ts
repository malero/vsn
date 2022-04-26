import {WrappedArray} from "../../src/Scope/WrappedArray";

describe('WrappedArray', () => {
    it("Should return a wrapped array when filtered", () => {
        const a = new WrappedArray<number>(1, 2, 3, 4, 5);
        const even = a.filter(x => x % 2 === 0);
        const odd = a.filter(x => x % 2 !== 0);
        expect(even.length).toBe(2);
        expect(odd.length).toBe(3);
    });
});
