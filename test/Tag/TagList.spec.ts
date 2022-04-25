import {DOM} from "../../src/DOM";
import {Query} from "../../src/Query";
import {TagList} from "../../src/Tag/List";
import {DOMObject} from "../../src/DOM/DOMObject";

describe('TagList', () => {
    it("should be able to fail properly", (done) => {
        document.body.innerHTML = `
            <p class="testing test">Test 1</p>
            <div class="testing test">Test 2</div>
            <p class="test">Test 3</p>
            <p class="testing">Test 4</p>
        `;
        const dom = new DOM(document);
        dom.once('built', async () => {
            let tags: TagList | DOMObject = await Query('p.test', dom) as TagList;
            expect(tags.length).toBe(2);
            done();
        });
    });
});
