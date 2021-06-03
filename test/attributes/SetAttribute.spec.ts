import {DOM} from "../../src/DOM";

describe('Bind', () => {
    it("vsn-set to work with a value", (done) => {
        document.body.innerHTML = `
            <span id="test" vsn-name="test" vsn-set:val="hello world">testing</span>
        `;
        const dom = new DOM(document);
        dom.once('built', () => {
            const tag = dom.getTagForElement(document.getElementById('test'));
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
        const dom = new DOM(document);
        dom.once('built', () => {
            const tag = dom.getTagForElement(document.getElementById('test'));
            const inner1 = dom.getTagForElement(document.getElementById('test-inner-1'));
            expect(tag).toBeTruthy();
            expect(tag.scope.get('val')).toBe('hello world');
            expect(inner1.scope.get('val')).toBe('hi mom');
            done();
        });
    })
});
