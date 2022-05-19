import {DOM} from "../../src/DOM";
import "../../src/Types";
import "../../src/attributes/_imports";


describe('ScopeAttribute', () => {
    it("vsn-scope should set simple values correctly", (done) => {
        document.body.innerHTML = `
            <div vsn-scope="{'asd':123, 'sdf': 'asd'}">
                <span vsn-bind="asd"></span>
            </div>
        `;
        const dom = new DOM(document);
        dom.once('built', async () => {
            const element = (await dom.exec('?(div)'))[0];
            expect(element.scope.get('asd')).toBe(123);
            expect(element.scope.get('sdf')).toBe('asd');
            const span = (await element.exec('?>(:first-child)'))[0];
            expect(span.element.innerText).toBe('123');
            done();
        });
    });

    it("vsn-scope should allow empty value to create a scope", (done) => {
        document.body.innerHTML = `
            <div vsn-scope></div>
        `;
        const dom = new DOM(document);
        dom.once('built', async () => {
            const element = (await dom.exec('?(div)'))[0];
            expect(element.uniqueScope).toBe(true);
            done();
        });
    });
});
