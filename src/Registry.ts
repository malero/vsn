import {EventDispatcher} from "./EventDispatcher";
import {IDeferred, IPromise, SimplePromise} from "./SimplePromise";
import {ClassNode} from "./AST/ClassNode";

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

export class RegistryStore<T = any> extends EventDispatcher {
    private timeouts = {};
    private readonly store: {[key: string]: T};

    constructor(defaults = null) {
        super();
        this.store = defaults || {};
    }

    register(key: string, item: any) {
        this.store[key] = item;
        this.dispatch('register', key, item);
        this.dispatch(`registered:${key}`, item);
    }

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

    has(key: string) {
        return !!this.store[key];
    }

    get keys(): string[] {
        return Object.keys(this.store);
    }
}

export class Registry extends EventDispatcher {
    protected static _instance: Registry;
    public readonly components: RegistryStore;
    public readonly functions: RegistryStore;
    public readonly controllers: RegistryStore;
    public readonly classes: RegistryStore;
    public readonly models: RegistryStore;
    public readonly templates: RegistryStore;
    public readonly services: RegistryStore;
    public readonly types: RegistryStore;
    public readonly validators: RegistryStore;
    public readonly formats: RegistryStore;
    public readonly attributes: RegistryStore;

    constructor() {
        super();
        this.components = new RegistryStore();
        this.functions = new RegistryStore();
        this.controllers = new RegistryStore();
        this.classes = new RegistryStore();
        this.models = new RegistryStore();
        this.templates = new RegistryStore<HTMLTemplateElement>();
        this.services = new RegistryStore();
        this.types = new RegistryStore();
        this.validators = new RegistryStore();
        this.formats = new RegistryStore();
        this.attributes = new RegistryStore();
    }

    public static component(key: string = null, setup = null) {
        return register('components', key, setup);
    }

    public static function(key: string = null, setup = null) {
        return register('functions', key, setup);
    }

    public static class(cls: ClassNode) {
        Registry.instance.classes.register(cls.fullSelector, cls);
    }

    public static controller(key: string = null, setup = null) {
        return register('controllers', key, setup);
    }

    public static model(key: string = null, setup = null) {
        return register('models', key, setup);
    }

    public static template(key: string = null, setup = null) {
        return register('templates', key, setup);
    }

    public static service(key: string = null, setup = null) {
        return register('services', key, setup);
    }

    public static type(key: string = null, setup = null) {
        return register('types', key, setup);
    }

    public static validator(key: string = null, setup = null) {
        return register('validators', key, setup);
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
