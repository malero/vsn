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
    it("vsn-services to just work", (done) => {
        document.body.innerHTML = `
            <div vsn-service:test1="TestService" id="test"></div>
            <div vsn-service:test2="TestService" vsn-set:test2.test="testing" id="test2"></div>
        `;
        const dom = new DOM(document.body);
        dom.once('built', async () => {
            const service1 = await dom.exec('test1');
            const service2 = await dom.exec('test2');
            expect(service1).toBeInstanceOf(TestService);
            expect(service1).toBe(service2);
            expect(TestService.instance).toBe(service1);
            expect(TestService.instance.test).toBe('testing');
            expect(await dom.exec('test1.test')).toBe('testing');
            await dom.exec('test2.test = "testing2"');
            expect(TestService.instance.test).toBe('testing2');
            done();
        });
    });
});
