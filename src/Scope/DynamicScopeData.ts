import {IScopeData, ScopeDataAbstract} from "./ScopeDataAbstract";

export class DynamicScopeData extends ScopeDataAbstract {
    constructor(data: IScopeData | string[]) {
        super();
        if(data instanceof Array) {
            for (const field of data)
                this.createProperty(field);
        } else {
            this.setData(data);
        }
    }

    setData(data: IScopeData) {
        for(const field of Object.keys(data))
            if(!this.hasProperty(field)) {
                this.createProperty(field);
            }
        super.setData(data);
    }

    on(event: string, fct: (...args: any[]) => any, context?: any, once?: boolean): number {
        if(event.indexOf('change:') == 0)
            this.createProperty(event.substr(7));
        return super.on(event, fct, context, once);
    }
}
