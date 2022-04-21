import "../src/vsn";
import {DOM} from "../src/DOM";
import {Registry} from "../src/Registry";

@Registry.class('TestController')
class TestController {}

describe('DOM', () => {
    it("should be able to set up tags correctly", (done) => {
        document.body.innerHTML = `
            <div vsn-controller:test="TestController"></div>
        `;
        const dom = new DOM(document);
        dom.once('built', async () => {
            const bodyTag = await dom.getTagForElement(document.body);
            expect(bodyTag.hasAttribute('vsn-root')).toBe(true)
            done();
        });
    });

    it("should use scopes correctly", (done) => {
        document.body.innerHTML = `
            <div id="parent" vsn-set:asd="123|integer">
                <div id="testing" vsn-controller:test="TestController" vsn-set:asd="234|integer">
                    <div vsn-set:asd="345|integer"></div>
                </div>
            </div>
        `;
        const dom = new DOM(document);
        dom.once('built', async () => {
            expect(await dom.eval('?(#parent).asd')).toBe(123);
            expect(await dom.eval('?(#testing).asd')).toBe(345);
            done();
        });
    });
});
