import {DOM} from "../../src/DOM";
import "../../src/Types";
import "../../src/attributes/_imports";
import {Registry} from "../../src/Registry";
import {Service} from "../../src/Service";
import {property} from "../../src/Scope/properties/Property";


@Registry.service('TestService')
class TestService extends Service {
    @property()
    public test: string;

    constructor() {
        super();
    }

}


describe('ServiceAttribute', () => {
    it("vsn-styles to just work", (done) => {
        document.body.innerHTML = `
            <div vsn-service:test1="TestService" id="test"></div>
            <div vsn-service:test2="TestService" vsn-set:test2.test="testing"></div>
        `;
        const dom = new DOM(document);
        dom.once('built', async () => {
            expect(TestService.instance.test).toBe('testing');
            expect(await dom.exec('#test.test1.test')).toBe('testing');
            done();
        });
    });
});
