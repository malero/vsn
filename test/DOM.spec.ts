import "../src/vsn";
import {DOM} from "../src/DOM";
import {Registry} from "../src/Registry";

@Registry.controller('TestController')
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
            <div id="parent" vsn-set:asd|integer="123">
                <div id="testing" vsn-controller:test="TestController" vsn-set:asd="234|integer">
                    <div vsn-set:asd|integer="345"></div>
                </div>
            </div>
        `;
        const dom = new DOM(document);
        dom.once('built', async () => {
            expect(await dom.exec('?(#parent).asd')).toBe(123);
            expect(await dom.exec('?(#testing).asd')).toBe(345);
            done();
        });
    });

    it("should be able to query elements in all directions", (done) => {
        document.body.innerHTML = `
            <div id="root" vsn-set:asd|integer="1">
                <main id="parent" vsn-set:asd|integer="123">
                    <div id="testing" vsn-controller:test="TestController" vsn-set:asd="234|integer">
                        <div id="child" vsn-set:asd|integer="345">
                            <ul>
                                <li vsn-set:asd|integer="456"></li>
                                <li id="grandchild" vsn-set:asd|integer="567"></li>
                            </ul>
                        </div>
                    </div>
                </main>
            </div>
        `;
        const dom = new DOM(document);
        dom.once('built', async () => {
            const root = await dom.exec('#root');
            const child = await dom.exec('#child');
            const grandchild = await dom.exec('#grandchild');
            expect(await child.exec('?<(main).asd')).toBe(123);
            expect(await child.exec('?>(li)[0].asd')).toBe(456);
            expect(await dom.exec('?(#grandchild)[0]')).toBe(grandchild);
            done();
        });
    });
});
