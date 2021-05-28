import {DOM} from "../src/DOM";
import {vision} from "../src/Vision";

class TestController {}

describe('DOM', () => {
    it("should be able to set up tags correctly", (done) => {
        document.body.innerHTML = `
            <div v-controller:test="TestController"></div>
        `;
        const dom = new DOM(document);
        dom.once('built', () => {
            const bodyTag = dom.getTagForElement(document.body);
            expect(bodyTag.hasAttribute('v-root')).toBe(true)
            done();
        });

        setTimeout(() => {
            vision.registerClass(TestController, 'TestController');
        }, 500);
    });
});
