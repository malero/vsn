import { DOMObject } from "./DOMObject";
export declare class WrappedWindow extends DOMObject {
    protected _window: Window;
    constructor(_window: Window, ...props: any[]);
    onScroll(e: any): void;
}
