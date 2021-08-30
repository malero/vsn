import {EventDispatcher} from "simple-ts-event-dispatcher";
import {IDeferred, IPromise, Promise as SimplePromise} from "simple-ts-promise";
import {VisionHelper} from "./helpers/VisionHelper";
import {benchmark} from "./Bencmark";

export function register(store: string, key: string = null, setup: () => void = null) {
    return function(target: any, _key: string = null) {
        key = key || target.prototype.constructor.name;
        if (_key !== null)
            target = target[_key];
        Registry.instance[store].register(key, target);
        if (setup)
            setup();
    }
}

export class RegistryStore extends EventDispatcher {
    private timeouts = {};
    private readonly store: {[key: string]: any};

    constructor(defaults = null) {
        super();
        this.store = defaults || {};
    }

    register(key: string, item: any) {
        this.store[key] = item;
        this.trigger(`registered:${key}`, item);
    }

    @benchmark('RegistryStore.get')
    get(key: string): IPromise<any> {
        const deferred: IDeferred<any> = SimplePromise.defer();

        if (!!this.store[key]) {
            deferred.resolve(this.store[key]);
        } else {
            console.warn(`Waiting for ${key} to be registered.`);
            this.timeouts[key] = setTimeout(() => {
                console.warn(`RegistryStore.get timed out after 5 seconds trying to find ${key}. Make sure the item is registered.`);
            }, 5000);
            this.once(`registered:${key}`, (cls) => {
                clearTimeout(this.timeouts[key]);
                deferred.resolve(cls);
            })
        }

        return deferred.promise;
    }

    getSynchronous(key: string) {
        return this.store[key];
    }
}

export class Registry extends EventDispatcher {
    protected static _instance: Registry;
    public readonly classes: RegistryStore;
    public readonly models: RegistryStore;
    public readonly templates: RegistryStore;
    public readonly types: RegistryStore;
    public readonly formats: RegistryStore;
    public readonly attributes: RegistryStore;

    constructor() {
        super();

        const w = VisionHelper.window || {};
        this.classes = new RegistryStore(w['$classes'] || {});
        this.models = new RegistryStore(w['$models'] || {});
        this.templates = new RegistryStore(w['$templates'] || {});
        this.types = new RegistryStore(w['$types'] || {});
        this.formats = new RegistryStore(w['$formats'] || {});
        this.attributes = new RegistryStore(w['$attributes'] || {});
    }

    public static class(key: string = null, setup = null) {
        return register('classes', key, setup);
    }

    public static model(key: string = null, setup = null) {
        return register('models', key, setup);
    }

    public static template(key: string = null, setup = null) {
        return register('templates', key, setup);
    }

    public static type(key: string = null, setup = null) {
        return register('types', key, setup);
    }

    public static format(key: string = null, setup = null) {
        return register('formats', key, setup);
    }

    public static attribute(attributeName: string = null, setup = null) {
        return register('attributes', attributeName, setup);
    }

    public static get instance() {
        if (!Registry._instance)
            Registry._instance = new Registry();

        return Registry._instance;
    }
}
