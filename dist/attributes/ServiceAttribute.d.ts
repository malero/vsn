import { ControllerAttribute } from "./ControllerAttribute";
export declare class ServiceAttribute extends ControllerAttribute {
    static readonly canDefer: boolean;
    readonly registryName: string;
    readonly assignToParent: boolean;
    protected instantiateClass(cls: any): any;
}
