import {ScopeDataAbstract} from "./ScopeDataAbstract";

export class ScopeData extends ScopeDataAbstract {
    constructor() {
        super();
        const properties = this.__properties__.splice(0, this.__properties__.length);
        for(const property of properties) {
            (function(_self, name) {
                if(!_self['__'+name+'__'])
                    return;

                _self.__properties__.push(name);
                const _property = _self['__'+name+'__'],
                    propertyType = _property[0],
                    config = _property[1] || {};

                _self.createProperty(name, propertyType, config);
            })(this, property);
        }
    }
}
