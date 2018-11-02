import { Scope } from "./Scope";
export declare abstract class Tag {
    protected readonly element: HTMLElement;
    protected readonly scope: Scope;
    protected attributes: {
        [key: string]: string;
    };
    protected inputTags: string[];
    constructor(element: HTMLElement, scope: Scope);
    parseAttributes(): void;
    readonly isInput: boolean;
    protected abstract setup(): void;
}
