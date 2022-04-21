export interface EventCallbackList {
    [index: string]: EventCallback[];
}
export declare class EventCallback {
    readonly fnc: any;
    readonly key: number;
    readonly once: boolean;
    readonly context?: any;
    calls: number;
    constructor(fnc: any, key: number, once: boolean, context?: any);
    call(...args: any[]): boolean;
}
export declare type EventDispatcherCallback = (...args: any[]) => any;
export declare class EventDispatcher {
    private static sources;
    private readonly _listeners;
    private _lastKey;
    constructor();
    deconstructor(): void;
    on(event: string, fct: EventDispatcherCallback, context?: any, once?: boolean): number;
    once(event: string, fct: EventDispatcherCallback, context?: any): number;
    off(event: string, key?: number): boolean;
    offWithContext(event: string, context: any): number;
    getListener(event: string, key: number): EventCallback | undefined;
    dispatch(event: string, ...args: any[]): void;
}
