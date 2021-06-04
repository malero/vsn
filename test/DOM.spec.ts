import {DOM} from "../src/DOM";
import {vision} from "../src/Vision";

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

        setTimeout(() => {
            vision.registerClass(TestController, 'TestController');
        }, 500);
    });
});
