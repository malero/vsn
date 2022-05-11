import {DOM} from "../../src/DOM";
import "../../src/Types";
import "../../src/attributes/_imports";


describe('Styles', () => {
    it("vsn-styles to just work", (done) => {
        document.body.innerHTML = `
            <div vsn-name="testing">
                <span id="styling" vsn-styles="testing.styles" style="margin-top: 50px;">testing</span>
                <span id="styling-dupe" vsn-styles="testing.styles" style="margin-top: 50px;">testing 2</span>
            </div>
        `;
        const dom = new DOM(document);
        dom.once('built', async () => {
            const ele1 = (await dom.get('#styling'))[0];
            const ele2 = (await dom.get('#styling-dupe'))[0];
            const scope = ele1.scope;
            const container = scope.get('testing');
            const styles = container.get('styles');
            expect(container).toBeTruthy();
            expect(styles).toBeTruthy();
            expect(ele1.element.style.marginTop).toBe('50px');
            expect(ele2.element.style.marginTop).toBe('50px');
            styles.set('$marginTop', '-50px');
            expect(ele1.element.style.marginTop).toBe('-50px');
            expect(ele2.element.style.marginTop).toBe('-50px');
            done();
        });
    });

    it("$ operator should work", (done) => {
        document.body.innerHTML = `
            <span id="styling">testing</span>
        `;
        const dom = new DOM(document);
        dom.once('built', async () => {
            await dom.exec('?(#styling).$marginTop = "50px"');
            expect((await dom.get('#styling'))[0].element.style.marginTop).toBe('50px');
            done();
        });
    });
});
