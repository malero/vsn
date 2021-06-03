import {DOM} from "../../src/DOM";
import {ListItem} from "../../src/attributes/ListItem";
import {vision} from "../../src/Vision";

class TestItem {}

describe('ListItem', () => {
    it("v-list-item should find it's parent list or complain", async () => {
        document.body.innerHTML = `
            <ul id="test"><li v-list-item:item="TestItem" id="test-item"></li></ul>
        `;
        let errorThrown: boolean = false;
        try {
            const dom = new DOM(document, false);
            await dom.buildFrom(document);
        } catch (e) {
            expect(e.message).toBe(ListItem.ERROR_NO_PARENT);
            errorThrown = true;
        }
        expect(errorThrown).toBeTrue();
    });

    it("v-list-item should find it's parent list", (done) => {
        document.body.innerHTML = `
            <ul v-list:list id="test"><li v-list-item:item="TestItem" id="test-item"></li></ul>
        `;
        vision.registerClass(TestItem, 'TestItem');

        const dom = new DOM(document);
        dom.once('built', () => {
            const list = dom.getTagForElement(document.getElementById('test'));
            const listItem = dom.getTagForElement(document.getElementById('test-item'));
            const listItemAttr: ListItem = listItem.getAttribute('v-list-item') as ListItem;

            expect(listItemAttr.list).toBe(list);
            done();
        });
    });
});
