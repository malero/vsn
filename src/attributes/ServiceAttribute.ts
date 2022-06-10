import {ControllerAttribute} from "./ControllerAttribute";
import {Registry} from "../Registry";

@Registry.attribute('vsn-service')
export class ServiceAttribute extends ControllerAttribute {
    public static readonly canDefer: boolean = false;
    public readonly registryName: string = 'services'
    public readonly assignToParent: boolean = false;

    protected instantiateClass(cls): any {
        return cls.instance.scope;
    }
}
