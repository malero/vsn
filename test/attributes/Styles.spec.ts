import {DOM} from "../../src/DOM";
import "../../src/Types";
import "../../src/attributes/_imports";


describe('Styles', () => {
    it("vsn-styles to just work", (done) => {
        document.body.innerHTML = `
            <span vsn-styles="testing.styles" style="margin-top: 50px;">testing</span>
        `;
        const dom = new DOM(document);
        dom.once('built', async () => {
            const scope = dom.root.scope;
            console.log(scope.get('testing'));
            expect(scope.get('testing')).toBeTruthy();
            expect(scope.get('testing').get('styles')).toBeTruthy();
            done();
        });
    });

    it("$ operator should work", (done) => {
        document.body.innerHTML = `
            <span id="styling">testing</span>
        `;
        const dom = new DOM(document);
        dom.once('built', async () => {
            await dom.eval('?(#styling).$marginTop = "50px"');
            expect((await dom.get('#styling'))[0].element.style.marginTop).toBe('50px');
            done();
        });
    });
});
