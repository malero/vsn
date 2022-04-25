import {Controller} from '../src/Controller';
import {DOM} from "../src/DOM";
import {SimplePromise} from "../src/SimplePromise";
import {Registry} from "../src/Registry";
import {property} from "../src/Scope/properties/Property";
import {Property} from "../src/vsn";

@Registry.controller('ControllerTestController')
class TestController extends Controller {
    @property()
    public test: string;

    @property(Property, {
        type: 'integer',
        min: 0,
        max: 100,
        validators: [
            'positive',
        ]
    })
    public positive_integer: number;

    isValid(): boolean {
        return this.test === 'test';
    }
}

describe('Controller', () => {
    it("methods should be callable from vsn-script", async () => {
        document.body.innerHTML = `
            <div vsn-controller:test="ControllerTestController" vsn-set:test.test="notTest" vsn-bind="test.test"></div>
        `;
        const dom = new DOM(document);
        const deferred = SimplePromise.defer();
        dom.once('built', async () => {
            expect(await dom.eval('test.test')).toBe('notTest');
            expect(await dom.eval('test.isValid()')).toBe(false);
            await dom.eval('test.test = "test"');
            expect(await dom.eval('test.isValid()')).toBe(true);
            deferred.resolve();
        });
        await deferred.promise;
    });
});