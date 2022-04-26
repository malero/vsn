import { EventDispatcher } from "../src/EventDispatcher";


describe('EventDispatcher', () => {
    let dispatcher: EventDispatcher,
        dummy: any = null,
        dummy2: any = null;

    beforeEach(() => {
        dispatcher = new EventDispatcher();
        dummy = jasmine.createSpyObj('dummy', ['callback']);
        dummy2 = jasmine.createSpyObj('dummy2', ['callback']);
    });

    it("should bind and be called properly", () => {
        dispatcher.on('event', dummy.callback.bind(dummy));
        expect(dummy.callback).not.toHaveBeenCalled();
        dispatcher.dispatch('event', 1, 2, 'three');
        expect(dummy.callback).toHaveBeenCalled();
    });

    it("should unbind and not be called", () => {
        const key: number = dispatcher.on('event', dummy.callback.bind(dummy));
        expect(dispatcher.off('event', key)).toEqual(true);
        dispatcher.dispatch('event', 1, 2, 'three');
        expect(dummy.callback).not.toHaveBeenCalled();
    });

    it("should not unbind events that don't exist", () => {
        const key: number = dispatcher.on('event', dummy.callback.bind(dummy));
        expect(dispatcher.off('fake_event', -1)).toEqual(false);
        dispatcher.dispatch('event', 1, 2, 'three');
        expect(dummy.callback).toHaveBeenCalled();
    });

    it("should bind and be called properly", () => {
        dispatcher.on('event', dummy.callback.bind(dummy));
        expect(dummy.callback).not.toHaveBeenCalled();
        dispatcher.dispatch('event', 1, 2, 'three');
        expect(dummy.callback).toHaveBeenCalled();
    });

    it("should unbind all", () => {
        dispatcher.on('event', dummy.callback, dummy);
        dispatcher.on('event', dummy.callback, dummy);
        dispatcher.on('event', dummy2.callback, dummy2);
        expect(dispatcher.off('event')).toEqual(true);
        expect(dispatcher.offWithContext('event', dummy)).toBe(0);
        expect(dispatcher.offWithContext('event', dummy2)).toBe(0);
        dispatcher.dispatch('event');
        expect(dummy.callback).not.toHaveBeenCalled();
    });

    it("should unbind all with matching context", () => {
        dispatcher.on('event', dummy.callback, dummy);
        dispatcher.on('event', dummy.callback, dummy);
        dispatcher.on('event', dummy2.callback, dummy2);
        expect(dispatcher.offWithContext('event', dummy)).toBe(2);
        dispatcher.dispatch('event');
        expect(dummy.callback).not.toHaveBeenCalled();
    });

    it("should unbind the correct listeners by key", () => {
        let key1 = dispatcher.on('event', dummy.callback, dummy),
            key2 = dispatcher.on('event', dummy.callback, dummy),
            key3 = dispatcher.on('event', dummy.callback, dummy),
            key4 = dispatcher.on('event', dummy.callback, dummy),
            key5 = dispatcher.on('event', dummy.callback, dummy);

        expect(dispatcher.off('event', key2)).toBe(true);
        expect(dispatcher.off('event', key4)).toBe(true);
        expect(dispatcher.off('event', key1)).toBe(true);
        expect(dispatcher.off('event', key3)).toBe(true);
        expect(dispatcher.off('event', key5)).toBe(true);
    });

    it("should fail to unbind the once listeners", () => {
        let key1: number = dispatcher.once('event', dummy.callback, dummy),
            cb1: any = dispatcher.getListener('event', key1),
            key2: number = dispatcher.once('event', dummy.callback, dummy),
            cb2: any = dispatcher.getListener('event', key2),
            key3: number = dispatcher.once('event', dummy.callback, dummy),
            cb3: any = dispatcher.getListener('event', key3),
            key4: number = dispatcher.on('event', dummy.callback, dummy),
            cb4: any = dispatcher.getListener('event', key4),
            key5: number = dispatcher.once('event', dummy.callback, dummy),
            cb5: any = dispatcher.getListener('event', key5);

        dispatcher.dispatch('event');
        dispatcher.dispatch('event');
        dispatcher.dispatch('event');
        dispatcher.dispatch('event');
        expect(dispatcher.off('event', key2)).toBe(false);
        expect(cb2.calls).toBe(1);
        expect(dispatcher.off('event', key4)).toBe(true);
        expect(cb4.calls).toBe(4);
        expect(dispatcher.off('event', key1)).toBe(false);
        expect(cb1.calls).toBe(1);
        expect(dispatcher.off('event', key3)).toBe(false);
        expect(cb3.calls).toBe(1);
        expect(dispatcher.off('event', key5)).toBe(false);
        expect(cb5.calls).toBe(1);
        expect(dispatcher.off('event', key4)).toBe(false);
    });

    it("should only be called once", () => {
        let onceCalls = 0,
            normalCalls = 0;
        dispatcher.once('event', () => {
            // empty
        });
        dispatcher.once('event', () => {
            onceCalls += 1;
        });
        dispatcher.once('event', () => {
            // empty
        });
        dispatcher.on('event', () => {
            normalCalls += 1;
        });
        dispatcher.dispatch('event');
        dispatcher.dispatch('event');
        dispatcher.dispatch('event');
        dispatcher.dispatch('event');
        expect(onceCalls).toBe(1);
        expect(normalCalls).toBe(4);
    });

    it("should only be called once with nested event triggers", () => {
        let onceCalls = 0,
            normalCalls = 0;
        const key: number = dispatcher.once('event', () => {
                dispatcher.dispatch('event');
            }),
            cb: any = dispatcher.getListener('event', key);
        dispatcher.dispatch('event');
        expect(cb.calls).toBe(1);
    });

    it("should pass arguments", () => {
        const key = dispatcher.once('event', (num, arr, obj) => {
                expect(num).toBe(1);
                expect(arr[0]).toBe(1);
                expect(arr[1]).toBe(2);
                expect(arr[2]).toBe(3);
                expect(obj.foo).toBe('bar');
            }),
            cb = dispatcher.getListener('event', key);
        dispatcher.dispatch('event', 1, [1,2,3], {foo:'bar'});
    });

    it("cannot call a once event more than once", () => {
        const key: number = dispatcher.once('event', () => {}),
            cb: any = dispatcher.getListener('event', key);
        dispatcher.dispatch('event');
        expect(cb.call()).toBe(false);
        expect(cb.calls).toBe(1);
    });

    it("should not unbind anything and return 0", () => {
        expect(dispatcher.offWithContext('event', null)).toBe(0);
    });

    it("should not trigger events that don't exist", () => {
        expect(dispatcher.dispatch('event')).toBe(undefined);
    });

    it("should trigger events in the correct order", () => {
        let check: number = 1;
        dispatcher.on('event', () => {
            expect(check).toBe(1);
            check++;
        });
        dispatcher.on('event', () => {
            expect(check).toBe(2);
            check++;
        });
        dispatcher.on('event', () => {
            expect(check).toBe(3);
            check++;
        });
        dispatcher.on('event', () => {
            expect(check).toBe(4);
            check++;
        });
        dispatcher.on('event', () => {
            expect(check).toBe(5);
        });
        dispatcher.dispatch('event');
    });
});
