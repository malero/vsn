import "../../src/Types";
import "../../src/attributes/_imports";
import {DOM} from "../../src/DOM";
import {ListItem} from "../../src/attributes/ListItem";
import {Registry} from "../../src/Registry";
import {List} from "../../src/attributes/List";
import {Model} from "../../src/Model";
import {property} from "../../src/Scope/properties/Property";

@Registry.controller('ListItemController')
class ListItemController{
    items: ListItemSpecTestItem[] = [];

    do() {}
}

@Registry.model('ListItemSpecTestItem')
class ListItemSpecTestItem extends Model {
    @property()
    test: number = null;

    @property()
    v: number;
}

describe('ListItem', () => {
    it("vsn-list-item should find it's parent list or complain", async () => {
        document.body.innerHTML = `
            <ul  id="test"><li vsn-list-item:item id="test-item"></li></ul>
        `;
        let errorThrown: boolean = false;
        try {
            const dom = new DOM(document.body, false);
            await dom.buildFrom(document.body);
        } catch (e) {
            expect(e.message).toBe(ListItem.ERROR_NO_PARENT);
            errorThrown = true;
        }
        expect(errorThrown).toBeTrue();
    });

    it("vsn-list-item should find it's parent list", (done) => {
        document.body.innerHTML = `
            <ul vsn-list:list list-item-model="ListItemSpecTestItem" id="test"><li vsn-list-item id="test-item"></li></ul>
        `;

        const dom = new DOM(document.body);
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
                <ul vsn-list:controller.items list-item-model="ListItemSpecTestItem" id="test">
                    <li vsn-template vsn-list-item:item></li>
                </ul>
            </div>
        `;
        const dom = new DOM(document.body);
        dom.once('built', async () => {
            const list = await dom.getTagForElement(document.getElementById('test'));
            const controller: ListItemController = list.scope.get('controller').wrapped;
            const listAttr: List = await list.getAttribute('vsn-list') as List;

            list.on('add', () => {
                const listItem = listAttr.tags[0];

                expect(listItem.scope.get('item').data instanceof ListItemSpecTestItem).toBeTrue();
                expect(controller.items.length).toBe(1);
                expect(controller.items[0] instanceof ListItemSpecTestItem).toBeTrue();

                done();
            });

            listAttr.items.length = 0;
            listAttr.items.push(new ListItemSpecTestItem({
                test: 1,
                v: 555
            }));
        });
    });

    it("vsn-list-item should work with vsn-set", (done) => {
        document.body.innerHTML = `
            <ul vsn-list:list list-item-model="ListItemSpecTestItem" id="test"><li vsn-list-item id="test-item" vsn-set:item.testing|integer="1"></li></ul>
        `;

        const dom = new DOM(document.body);
        dom.once('built', async () => {
            const listItem = await dom.getTagForElement(document.getElementById('test-item'));
            expect(listItem.scope.get('item').get('testing')).toBe(1);
            done();
        });
    });

    it("vsn-list-item should work with vsn-exec", (done) => {
        document.body.innerHTML = `
            <ul vsn-list:list list-item-model="ListItemSpecTestItem" id="test">
                <li vsn-list-item id="test-item" vsn-exec="item.test = 1"></li>
            </ul>
        `;

        const dom = new DOM(document.body);
        dom.once('built', async () => {
            const listItem = await dom.getTagForElement(document.getElementById('test-item'));
            console.log('test keys', listItem.scope.keys);
            expect(listItem.scope.get('test')).toBe(1);
            done();
        });
    });
});
