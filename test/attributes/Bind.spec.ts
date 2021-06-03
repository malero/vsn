import {DOM} from "../../src/DOM";

describe('Bind', () => {
    it("v-bind to work with inner text", (done) => {
        document.body.innerHTML = `
            <span id="test" v-name="test" v-bind="test.value">testing</span>
        `;
        const dom = new DOM(document);
        dom.once('built', () => {
            const tag = dom.getTagForElement(document.getElementById('test'));
            expect(tag).toBeTruthy();
            expect(tag.getParsedAttributeValue('v-name', 1)).toBe('test');
            expect(tag.scope.get('value')).toBe('testing');
            done();
        });
    });

    it("v-bind order of execution to be left to right and top to bottom", (done) => {
        document.body.innerHTML = `
            <span id="test" v-name="test" v-bind:id="test.id" v-bind="test.id">testing</span>
            <span id="test2" v-bind="test.id">arg</span>
        `;

        const dom = new DOM(document);
        dom.once('built', () => {
            const test = document.getElementById('arg');
            const tag = dom.getTagForElement(test);
            const test2 = document.getElementById('test2');
            expect(tag).toBeTruthy();
            expect(tag.scope.get('id')).toBe('arg');
            expect(test.innerText).toBe('arg');
            expect(test2.innerText).toBe('arg');
            done();
        });
    });

    it("v-bind attribute changes trigger updating scope with new value", (done) => {
        document.body.innerHTML = `
            <span id="test" v-name="test" v-bind:id="test.id"></span>
        `;

        const dom = new DOM(document);
        dom.once('built', () => {
            const test = document.getElementById('test');
            const tag = dom.getTagForElement(test);

            tag.scope.bind('change:id', () => {
                expect(test.getAttribute('id')).toBe('new-id');
                expect(tag.scope.get('id')).toBe('new-id');
                done();
            });

            test.setAttribute('id', 'new-id');
        });
    });

    it("v-bind innerText changes trigger updating scope with new value", (done) => {
        document.body.innerHTML = `
            <span id="test" v-name="test" v-bind="test.val">testing</span>
        `;

        const dom = new DOM(document, false);
        dom.once('built', () => {
            const test = document.getElementById('test');
            const tag = dom.getTagForElement(test);
            expect(tag.scope.get('val')).toBe('testing');

            tag.scope.get('test').bind('change:val', () => {
                expect(tag.scope.get('val')).toBe('new-val');
                done();
            });

            test.innerHTML = 'new-val';
        });
        dom.buildFrom(document);
    });

    it("v-bind input value changes trigger updating scope with new value", (done) => {
        document.body.innerHTML = `
            <input id="test" value="testing" v-name="test" v-bind="test.val"/>
        `;

        const dom = new DOM(document, false);
        dom.once('built', () => {
            const test = document.getElementById('test');
            const tag = dom.getTagForElement(test);
            expect(tag.scope.get('val')).toBe('testing');

            tag.scope.get('test').bind('change:val', () => {
                expect(tag.scope.get('val')).toBe('new-val');
                done();
            });

            test.setAttribute('value', 'new-val');
            (test as any).value = 'new-val';
            test.dispatchEvent(new Event('focus'));
            test.dispatchEvent(new KeyboardEvent('keyup', {key: 'w'}));
        });

        dom.buildFrom(document);
    });

    it("v-bind element innerText should change when scope value is changed", (done) => {
        document.body.innerHTML = `
            <span id="test" v-name="test" v-bind="test.val">testing</span>
        `;

        const dom = new DOM(document, false);
        dom.once('built', () => {
            const test = document.getElementById('test');
            const tag = dom.getTagForElement(test);
            expect(tag.scope.get('val')).toBe('testing');

            tag.bind('mutate', () => {
                expect(test.innerText).toBe('new-val');
                done();
            });

            tag.scope.set('val', 'new-val');
        });
        dom.buildFrom(document);
    });

    it("v-bind input value should change when scope value is changed", (done) => {
        document.body.innerHTML = `
            <input id="test" value="testing" v-name="test" v-bind="test.val" />
        `;

        const dom = new DOM(document);
        dom.once('built', () => {
            const test = document.getElementById('test');
            const tag = dom.getTagForElement(test);
            expect(tag.scope.get('val')).toBe('testing');

            tag.bind('mutate', () => {
                expect(test.getAttribute('value')).toBe('new-val');
                done();
            });

            tag.scope.set('val', 'new-val');
        });
    });
});
