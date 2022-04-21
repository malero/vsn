import {VisionHelper} from "./helpers/VisionHelper";
import {EventDispatcher} from "./EventDispatcher";

export type ConfigurationValue = string | number | boolean | null | undefined;

export class Configuration extends EventDispatcher {
    protected static _instance: Configuration;
    private readonly data: {[key: string]: ConfigurationValue};

    constructor() {
        super();
        this.data = VisionHelper.window && window['$configuration'] || {};
    }

    public get(key: string, defaultValue: ConfigurationValue = null): ConfigurationValue {
        return this.data[key] === undefined ? defaultValue : this.data[key];
    }

    public set(key: string, value: ConfigurationValue) {
        const prev: ConfigurationValue = this.data[key];
        this.data[key] = value;
        this.dispatch(`change:${key}`, {
            value: value,
            previous: prev
        });
        this.dispatch('change', {
            key: key,
            value: value,
            previous: prev
        })
    }

    public static set(key: string, value: ConfigurationValue) {
        Configuration.instance.set(key, value);
    }

    public static get(key: string, defaultValue: ConfigurationValue = null): ConfigurationValue {
        return Configuration.instance.get(key, defaultValue);
    }

    public static get instance() {
        if (!Configuration._instance)
            Configuration._instance = new Configuration();

        return Configuration._instance;
    }
}
