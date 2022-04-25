import {IPropertyConfig, Property} from "./properties/Property";
import {EventDispatcher} from "../EventDispatcher";

export interface IScopeData {
    [key: string]: any;
}

export class ScopeDataAbstract extends EventDispatcher {
    [key: string]: any;
    __properties__: string[];
    protected _lastData: any;

    constructor() {
        super();

        // Objects may have __properties__ from prototype
        if(!this['__properties__'])
            this.__properties__ = [];
    }

    createProperty(name: string, propertyType = Property, config?: IPropertyConfig): Property {
        config = config || {};
        const instance = new propertyType(config.default, config),
            propDesc = Object.getOwnPropertyDescriptor(this, name);
        this['__'+name] = instance;

        // property getter
        const propertyGetter = function() {
            return instance.value;
        };
        const getter = propDesc ? propDesc.get : propertyGetter,
            propertySetter = function(newVal: any) {
                instance.value = newVal;
            },
            setter = propDesc ? propDesc.set : propertySetter;

        // Delete the original property
        delete this[name];

        // Create new property with getter and setter
        Object.defineProperty(this, name, {
            get: getter,
            set: setter,
            enumerable: true,
            configurable: true
        });

        instance.on('change', (...args: any[]) => {
            this.dispatch('change', name, ...args);
            this.dispatch('change:' + name, ...args);
        });
        return instance;
    }

    hasProperty(name: string): boolean {
        return this.__properties__.indexOf(name) !== -1;
    }

    get keys(): string[] {
        return [...this.__properties__];
    }

    setData(data: IScopeData) {
        const properties = this.getProperties();
        for (const key in data) {
            if (properties.indexOf(key) > -1) {
                this[key] = data[key];
            }
        }
    }

    getData(): IScopeData {
        const data: IScopeData = {};
        for (const key of this.getProperties()) {
            const property = this['__'+key];
            if(this[key] == null || !property)
                continue;

            data[key] = property.getData();
        }
        return data;
    }

    getProperties(): string[] {
        return this.__properties__;
    }

    getProperty(name: string, create: boolean = false): Property {
        let property = this['__'+name];
        if (create && !property) {
            property = this.createProperty(name);
        }
        return property;
    }

    bindToProperties(event:string, properties:string[], callback: (...args: any[]) => any) {
        for(const name of properties) {
            const _property = this['__'+ name];
            if(_property)
                _property.on(event, callback);

        }
    }

    setLastData() {
        this._lastData = this.getData();
    }

    /*
     * Revert data to the last setData() call. Useful for forms that edit a
     * list of items and then hit cancel rather than saving the list.
     */
    revert() {
        this.setData(this._lastData);
    }

    isModified() {
        const oData = this._lastData,
            nData = this.getData();
        for(const key of this.getProperties()) {
            if(nData[key] != oData[key])
                return true;
        }
        return false;
    }
}
