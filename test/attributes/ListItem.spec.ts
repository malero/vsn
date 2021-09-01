import "../../src/Types";
import "../../src/attributes/_imports";
import {DOM} from "../../src/DOM";
import {ListItem} from "../../src/attributes/ListItem";
import {List} from "../../types/attributes/List";
import {Registry} from "../../src/Registry";

@Registry.class('ListItemController')
class ListItemController{
    items: ListItemSpecTestItem[] = [];

    do() {}
}

@Registry.class('ListItemSpecTestItem')
class ListItemSpecTestItem {
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
            <ul id="test"><li vsn-list-item:item="ListItemSpecTestItem" id="test-item"></li></ul>
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
            <ul vsn-list:list id="test"><li vsn-list-item:item="ListItemSpecTestItem" id="test-item"></li></ul>
        `;

        const dom = new DOM(document);
        dom.once('built', async () => {
            const list = await dom.getTagForElement(document.getElementById('test'));
            const listItem = await dom.getTagForElement(document.getElementById('test-item'));
            const listItemAttr: ListItem = await listItem.getAttribute('vsn-list-item') as ListItem;

            expect(listItemAttr.list).toBe(list);
            done();
        });
    });

    it("should properly wrap list item class", (done) => {
        document.body.innerHTML = `
            <div vsn-controller:controller="ListItemController">
                <ul vsn-list:controller.items id="test">
                    <li vsn-template vsn-list-item:item="ListItemSpecTestItem"></li>
                </ul>
            </div>
        `;
        const dom = new DOM(document);
        dom.once('built', async () => {
            const list = await dom.getTagForElement(document.getElementById('test'));
            const controller: ListItemController = list.scope.get('controller').wrapped;
            const listAttr: List = await list.getAttribute('vsn-list') as List;

            list.bind('add', () => {
                const listItem = listAttr.tags[0];

                expect(listItem.scope.wrapped instanceof ListItemSpecTestItem).toBeTrue();
                expect(controller.items[0] instanceof ListItemSpecTestItem).toBeTrue();
                expect(listItem.scope.wrapped === controller.items[0]).toBeTrue();
                expect(controller.items.length).toBe(1);
                expect(controller.items.indexOf(listItem.scope.wrapped) > -1).toBeTrue();
                expect(controller.items.indexOf(listItem.scope.wrapped) > -1).toBeTrue();
                expect(listItem.scope.get('test')).toBe(1);
                expect(listItem.scope.get('v')).toBe(555);
                done();
            });

            listAttr.items.length = 0;
            listAttr.items.push(new ListItemSpecTestItem(555, 1));
        });
    });

    it("vsn-list-item should work with vsn-set", (done) => {
        document.body.innerHTML = `
            <ul vsn-list:list id="test"><li vsn-list-item:item="ListItemSpecTestItem" id="test-item" vsn-set:item.testing="1|integer"></li></ul>
        `;

        const dom = new DOM(document);
        dom.once('built', async () => {
            const list = await dom.getTagForElement(document.getElementById('test'));
            const listItem = await dom.getTagForElement(document.getElementById('test-item'));
            const listItemAttr: ListItem = await listItem.getAttribute('vsn-list-item') as ListItem;

            expect(listItem.scope.get('testing')).toBe(1);
            done();
        });
    });

    it("vsn-list-item should work with vsn-exec", (done) => {
        document.body.innerHTML = `
            <ul vsn-list:list id="test"><li vsn-list-item:item="ListItemSpecTestItem" id="test-item" vsn-exec="item.testing = 1"></li></ul>
        `;

        const dom = new DOM(document);
        dom.once('built', async () => {
            const list = await dom.getTagForElement(document.getElementById('test'));
            const listItem = await dom.getTagForElement(document.getElementById('test-item'));
            const listItemAttr: ListItem = await listItem.getAttribute('vsn-list-item') as ListItem;

            expect(listItem.scope.get('testing')).toBe(1);
            done();
        });
    });
});
