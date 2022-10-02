import {IntegerProperty, property, Registry, Service} from "../vsn";

@Registry.service('ServiceDemo')
export class ServiceDemo extends Service {
    @property(IntegerProperty)
    public count: number = 0;

    add(num: number): number {
        return this.count += num;
    }
}
