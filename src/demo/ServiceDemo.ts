import {IntegerProperty, property, Registry, Service} from "../vsn";

@Registry.service('ServiceDemo')
export class ServiceDemo extends Service {
    @property(IntegerProperty)
    public count: number = 0;

    async add(num: number=1): Promise<number> {
        console.log('ServiceDemo.add', this, num);
        return this.count += num;
    }
}
