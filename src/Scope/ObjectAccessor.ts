import {ScopeAbstract} from "./ScopeAbstract";

export class ObjectAccessor extends ScopeAbstract {
    public readonly data: any;

    constructor(data: any) {
        super();
        this.data = data;
    }

    public get(field: string, fallback = null): any {
        const value = this.data[field];
        if (typeof value === 'object')
            return new ObjectAccessor(value);
        return value === undefined ? fallback : value;
    }

    public set(field: string, value: any): void {
        this.data[field] = value;
    }
}
