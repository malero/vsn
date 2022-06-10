import {ControllerAttribute} from "./ControllerAttribute";
import {Registry} from "../Registry";

@Registry.attribute('vsn-model')
export class ModelAttribute extends ControllerAttribute {
    public static readonly canDefer: boolean = false;
    public readonly registryName: string = 'models'
}
