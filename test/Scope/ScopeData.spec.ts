import {ScopeData} from "../../src/Scope/ScopeData";
import {Property} from "../../src/Scope/properties/Property";


describe('ScopeData', () => {
    it("should set tags correctly", async () => {
        const data = new ScopeData();
        data.createProperty('test', Property, {
            tags: ['test']
        });

        data.createProperty('test_int', Property, {
            tags: ['test']
        });

        data.createProperty('not_test', Property, {
            tags: ['not_test']
        });

        data['test'] = 'test';
        data['test_int'] = 1;
        data['not_test'] = 'not_test';

        const taggedTestData = data.getData('test');
        expect(taggedTestData).toEqual({
            test: 'test',
            test_int: 1
        });

        const taggedNotTestData = data.getData('not_test');
        expect(taggedNotTestData).toEqual({
            not_test: 'not_test'
        });

        const allData = data.getData();
        expect(allData).toEqual({
            test: 'test',
            test_int: 1,
            not_test: 'not_test'
        });
    });
});
