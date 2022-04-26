import { EventDispatcher, EventDispatcherCallback } from "../EventDispatcher";
export declare class WrappedArray<T> extends Array<T> {
    readonly dispatcher: EventDispatcher;
    readonly $wrapped: boolean;
    constructor(...items: T[]);
    dispatch(event: string, ...args: any[]): void;
    on(event: string, callback: EventDispatcherCallback): void;
    off(event: string, key?: number): void;
    once(event: string, callback: EventDispatcherCallback): void;
    push(...items: T[]): number;
    splice(start: number, deleteCount?: number): T[];
    concat(...items: any[]): T[];
    filter(callback: (value: T, index: number, array: T[]) => boolean, thisArg?: any): T[];
    get(key: string): any;
    get length(): number;
    set length(num: number);
    setLength(num: number): void;
}
