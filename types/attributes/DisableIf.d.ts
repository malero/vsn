import { If } from "./If";
export declare class DisableIf extends If {
    static readonly canDefer: boolean;
    onChange(): Promise<void>;
}
