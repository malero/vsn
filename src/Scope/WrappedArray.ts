import {EventDispatcher, EventDispatcherCallback} from "../EventDispatcher";

export class WrappedArray<T> extends Array<T> {
    public readonly dispatcher: EventDispatcher;
    public readonly $wrapped: boolean = true;

    constructor(...items: T[]) {
        super(...items);
        Object.setPrototypeOf(this, WrappedArray.prototype);
        this.dispatcher = new EventDispatcher();
    }

    dispatch(event: string, ...args: any[]) {
        this.dispatcher.dispatch(event, ...args);
    }

    on(event: string, callback: EventDispatcherCallback, ctx?: any) {
        this.dispatcher.on(event, callback, ctx);
    }

    off(event: string, key?: number) {
        this.dispatcher.off(event, key);
    }

    once(event: string, callback: EventDispatcherCallback) {
        this.dispatcher.once(event, callback);
    }

    push(...items: T[]): number {
        const num: number = super.push(...items);

        this.dispatch('push', ...items);
        this.dispatch('change', {
            'added': items
        });
        for (const item of items) {
            this.dispatch('add', item);
        }
        return num;
    }

    remove(item: T): boolean {
        const index: number = this.indexOf(item);
        if (index === -1) {
            return false;
        }
        this.splice(index, 1);
        return true;
    }

    pop(): T {
        const item: T = super.pop();
        this.dispatch('pop', item);
        this.dispatch('change', {
            'removed': [item]
        });
        this.dispatch('remove', item);
        return item;
    }

    shift(): T {
        const item: T = super.shift();
        this.dispatch('shift', item);
        this.dispatch('change', {
            'removed': [item]
        });
        this.dispatch('remove', item);
        return item;
    }

    splice(start: number, deleteCount?: number): T[] {
        const removed: T[] = super.splice(start, deleteCount);

        this.dispatch('change', {
            'removed': removed
        });
        for (const item of removed) {
            this.dispatch('remove', item);
        }

        return removed;
    }

    concat(...items: any[]): T[] {
        const concat: T[] = super.concat(...items);

        this.dispatch('change', {
            'added': concat
        });
        for (const item of concat) {
            this.dispatch('add', item);
        }
        return concat;
    }

    filter(callback: (value: T, index: number, array: T[]) => boolean, thisArg?: any): T[] {
        const filtered: T[] = super.filter(callback, thisArg);
        return new WrappedArray(...filtered);
    }

    get(key: string) {
        const keys: string[] = [
            'length'
        ];
        return keys.indexOf(key) > -1 ? this[key] : undefined;
    }

    get length(): number {
        let c: number = 0;
        for (const item of this) {
            c += 1;
        }
        return c;
    }

    set length(num: number) {
        this.setLength(num);
    }

    setLength(num: number) {
        let c: number = 0;
        const toRemove: T[] = [];
        for (const item of this) {
            c += 1;
            if (c >= num) {
                toRemove.push(item);
            }
        }

        for (const item of toRemove) {
            this.splice(this.indexOf(item), 1);
        }
    }
}
