import {Controller} from '../src/Controller';
import {DOM} from "../src/DOM";
import {SimplePromise} from "../src/SimplePromise";


describe('Controller', () => {
    it("methods should be callable from vsn-script", async () => {
        document.body.innerHTML = `
            <div vsn-controller:testy="ControllerTestController" vsn-set:testy.test="notTest" vsn-bind="testy.test"></div>
        `;
        const dom = new DOM(document);
        const deferred = SimplePromise.defer();
        dom.once('built', async () => {
            expect(await dom.eval('testy.test')).toBe('notTest');
            expect(await dom.eval('testy.isValid()')).toBe(false);
            await dom.eval('testy.test = "test"');
            expect(await dom.eval('testy.isValid()')).toBe(true);
            deferred.resolve();
        });
        await deferred.promise;
    });
});
