import {ScopeData} from "../../../src/Scope/ScopeData";
import {ArrayProperty} from "../../../src/Scope/properties/_imports";
import {WrappedArray} from "../../../src/vsn";

describe('ArrayProperty', () => {
    it("Should return a wrapped array when filtered", () => {
        const d = new ScopeData();
        d.createProperty('test', ArrayProperty);
        d['test'] = [1, 2, 3];
        expect(d['test'] instanceof WrappedArray).toBe(true);
        expect(d['test'].indexOf(1)).toBe(0);
        expect(d['test'].indexOf(2)).toBe(1);
        expect(d['test'].indexOf(3)).toBe(2);
        expect(d['test'].indexOf(4)).toBe(-1);
    });
});
