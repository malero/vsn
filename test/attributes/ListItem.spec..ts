import {DOM} from "../../src/DOM";
import {ListItem} from "../../src/attributes/ListItem";
import {vision} from "../../src/Vision";
import {List} from "../../types/attributes/List";
import {WrappedArray} from "../../types/Scope";

class TestItem {
    test: number = null;

    constructor(
        public readonly v: number = 123,
        test: number
    ) {
        this.test = test;
    }

    getValue() {
        return this.v
    }
}

describe('ListItem', () => {
    it("vsn-list-item should find it's parent list or complain", async () => {
        document.body.innerHTML = `
            <ul id="test"><li vsn-list-item:item="TestItem" id="test-item"></li></ul>
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

    it("vsn-list-item should find it's parent list", (done) => {
        document.body.innerHTML = `
            <ul vsn-list:list id="test"><li vsn-list-item:item="TestItem" id="test-item"></li></ul>
        `;
        vision.registerClass(TestItem, 'TestItem');

        const dom = new DOM(document);
        dom.once('built', async () => {
            const list = await dom.getTagForElement(document.getElementById('test'));
            const listItem = await dom.getTagForElement(document.getElementById('test-item'));
            const listItemAttr: ListItem = listItem.getAttribute('vsn-list-item') as ListItem;

            expect(listItemAttr.list).toBe(list);
            done();
        });
    });

    it("should properly wrap list item class", (done) => {
        document.body.innerHTML = `
            <ul vsn-list:list id="test">
                <li vsn-list-item:item="TestItem"></li>
            </ul>
        `;
        vision.registerClass(TestItem, 'TestItem');

        const dom = new DOM(document);
        dom.once('built', async () => {
            const list = await dom.getTagForElement(document.getElementById('test'));
            const listAttr: List = list.getAttribute('vsn-list') as List;
            (listAttr.items as WrappedArray<TestItem>).bind('add', () => {
                const listItem = listAttr.tags[0];

                expect(listItem.scope.wrapped instanceof TestItem).toBe(true);
                expect(listItem.scope.get('test')).toBe(555);
                expect(listItem.scope.get('v')).toBe(1);
                done();
            })

            listAttr.items.length = 0;
            listAttr.items.push(new TestItem(555, 1));
        });
    });
});
