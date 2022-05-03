import {ScopeData} from "../../src/Scope/ScopeData";
import {Property} from "../../src/Scope/properties/Property";


describe('ScopeData', () => {
    it("should set tags correctly", async () => {
        const data = new ScopeData();
        data.createProperty('test', Property, {
            labels: ['test']
        });

        data.createProperty('test_int', Property, {
            labels: ['test']
        });

        data.createProperty('not_test', Property, {
            labels: ['not_test']
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

        const notTestProp = data.getProperty('not_test');
        notTestProp.addLabel('test');
        const taggedNotTestData2 = data.getData('test');
        expect(taggedNotTestData2).toEqual({
            test: 'test',
            test_int: 1,
            not_test: 'not_test'
        });

        notTestProp.removeLabel('test');
        const taggedNotTestData3 = data.getData('test');
        expect(taggedNotTestData3).toEqual({
            test: 'test',
            test_int: 1
        });
    });
});
