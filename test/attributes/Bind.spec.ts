import "../../src/Types";
import "../../src/attributes/_imports";
import {DOM} from "../../src/DOM";


describe('Bind', () => {
    it("vsn-bind to work with inner text", (done) => {
        document.body.innerHTML = `
            <span id="test" vsn-name="test" vsn-bind="test.value">testing</span>
        `;
        const dom = new DOM(document);
        dom.once('built', async () => {
            const tag = await dom.getTagForElement(document.getElementById('test'));
            expect(tag).toBeTruthy();
            expect(tag.getParsedAttributeValue('vsn-name', 1)).toBe('test');
            expect(tag.scope.get('value')).toBe('testing');
            done();
        });
    });

    it("vsn-bind to work with inner text with @text", (done) => {
        document.body.innerHTML = `
            <span id="test" test="testing" vsn-bind="@test"></span>
        `;
        const dom = new DOM(document);
        dom.once('built', async () => {
            const tag = await dom.getTagForElement(document.getElementById('test'));
            expect(tag).toBeTruthy();
            expect(tag.scope.get('@test')).toBe('testing');
            done();
        });
    });

    it("vsn-bind order of execution to be left to right and top to bottom", (done) => {
        document.body.innerHTML = `
            <span id="test" vsn-name="test" vsn-bind:id="test.id" vsn-bind="test.id">testing</span>
            <span id="test2" vsn-bind="test.id">arg</span>
        `;

        const dom = new DOM(document);
        dom.once('built', async () => {
            const test = document.getElementById('arg');
            const tag = await dom.getTagForElement(test);
            const test2 = document.getElementById('test2');
            expect(tag).toBeTruthy();
            expect(tag.scope.get('id')).toBe('arg');
            expect(test.innerText).toBe('arg');
            expect(test2.innerText).toBe('arg');
            done();
        });
    });

    it("vsn-bind attribute changes trigger updating scope with new value", (done) => {
        document.body.innerHTML = `
            <span id="test" vsn-name="test" vsn-bind:id="test.id"></span>
        `;

        const dom = new DOM(document);
        dom.once('built', async () => {
            const test = document.getElementById('test');
            const tag = await dom.getTagForElement(test);

            tag.scope.on('change:id', () => {
                expect(test.getAttribute('id')).toBe('new-id');
                expect(tag.scope.get('id')).toBe('new-id');
                done();
            });

            test.setAttribute('id', 'new-id');
        });
    });

    it("vsn-bind innerHTML changes trigger updating scope with new value", (done) => {
        document.body.innerHTML = `
            <span id="test" vsn-name="test" vsn-bind="test.val">testing</span>
        `;

        const dom = new DOM(document, false);
        dom.once('built', async () => {
            const test = document.getElementById('test');
            const tag = await dom.getTagForElement(test);
            expect(tag.scope.get('val')).toBe('testing');

            tag.scope.get('test').on('change:val', () => {
                expect(tag.scope.get('val')).toBe('new-val');
                done();
            });

            test.innerHTML = 'new-val';
        });
        dom.buildFrom(document, true);
    });

    it("vsn-bind input value changes trigger updating scope with new value", (done) => {
        document.body.innerHTML = `
            <input id="test" value="testing" vsn-name="test" vsn-bind="test.val"/>
        `;

        const dom = new DOM(document, false);
        dom.once('built', async () => {
            const test = document.getElementById('test');
            const tag = await dom.getTagForElement(test);
            expect(tag.scope.get('val')).toBe('testing');

            tag.scope.get('test').on('change:val', () => {
                expect(tag.scope.get('val')).toBe('new-val');
                done();
            });

            test.setAttribute('value', 'new-val');
            (test as any).value = 'new-val';
            test.dispatchEvent(new Event('focus'));
            test.dispatchEvent(new KeyboardEvent('keyup', {key: 'w'}));
        });

        dom.buildFrom(document, true);
    });

    it("vsn-bind element innerHTML should change when scope value is changed", (done) => {
        document.body.innerHTML = `
            <span id="test" vsn-name="test" vsn-bind="test.val">testing</span>
        `;

        const dom = new DOM(document, false);
        dom.once('built', async () => {
            const test = document.getElementById('test');
            const tag = await dom.getTagForElement(test);
            expect(tag.scope.get('val')).toBe('testing');

             tag.scope.get('test').on('change:val', () => {
                expect(test.innerHTML).toBe('new-val');
                done();
            });

            tag.scope.get('test').set('val', 'new-val');
        });
        dom.buildFrom(document, true);
    });

    it("vsn-bind input value should change when scope value is changed", (done) => {
        document.body.innerHTML = `
            <input id="test" value="testing" vsn-name="test" vsn-bind="test.val" />
        `;

        const dom = new DOM(document);
        dom.once('built', async () => {
            const test = document.getElementById('test');
            const tag = await dom.getTagForElement(test);
            expect(tag.scope.get('val')).toBe('testing');

            tag.on('mutate', () => {
                expect(test.getAttribute('value')).toBe('new-val');
                done();
            });

            tag.scope.set('val', 'new-val');
        });
    });

    it("vsn-bind should work with currency formatter", (done) => {
        document.body.innerHTML = `
            <span id="test" vsn-name="test" vsn-bind="test.value" vsn-format="currency" vsn-type:test.value="float">1.5</span>
        `;
        const dom = new DOM(document);
        dom.once('built', async () => {
            const tag = await dom.getTagForElement(document.getElementById('test'));
            expect(tag).toBeTruthy();
            expect(tag.getParsedAttributeValue('vsn-name', 1)).toBe('test');
            expect(tag.scope.get('value')).toBe(1.5);
            expect(tag.element.innerText).toBe('$1.50');
            done();
        });
    });
});
