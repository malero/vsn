import {DOM} from "../../src/DOM";
import "../../src/Types";
import "../../src/attributes/_imports";


describe('Bind', () => {
    it("vsn-set to work with a value", (done) => {
        document.body.innerHTML = `
            <span id="test" vsn-name="test" vsn-set:val="hello world">testing</span>
        `;
        const dom = new DOM(document.body);
        dom.once('built', async () => {
            const tag = await dom.getTagForElement(document.getElementById('test'));
            expect(tag).toBeTruthy();
            expect(tag.scope.get('val')).toBe('hello world');
            done();
        });
    });

    it("vsn-set to work with nested scopes", (done) => {
        document.body.innerHTML = `
            <span id="test" vsn-name="test">
                <span id="test-inner-0" vsn-name="testInner0" vsn-set:test.val="hello world"></span>
                <span id="test-inner-1" vsn-name="testInner1" vsn-set:val="hi mom"></span>
            </span>
        `;
        const dom = new DOM(document.body);
        dom.once('built', async () => {
            const tag = await dom.getTagForElement(document.getElementById('test'));
            const inner1 = await dom.getTagForElement(document.getElementById('test-inner-1'));
            expect(tag).toBeTruthy();
            expect(tag.scope.get('val')).toBe('hello world');
            expect(inner1.scope.get('val')).toBe('hi mom');
            done();
        });
    })

    it("vsn-set to work with a typed value", (done) => {
        document.body.innerHTML = `
            <span id="test-int" vsn-set:int|integer="142.3">testing</span>
            <span id="test-float" vsn-set:float|float="142.3">testing</span>
            <span id="test-bool" vsn-set:bool|boolean="false">testing</span>
        `;
        const dom = new DOM(document.body);
        dom.once('built', async () => {
            const intTag = await dom.getTagForElement(document.getElementById('test-int'));
            const floatTag = await dom.getTagForElement(document.getElementById('test-float'));
            const boolTag = await dom.getTagForElement(document.getElementById('test-bool'));
            expect(intTag.scope.get('int')).toBe(142);
            expect(floatTag.scope.get('float')).toBe(142.3);
            expect(boolTag.scope.get('bool')).toBe(false);
            done();
        });
    });
});
