import {EventDispatcher, EventDispatcherCallback} from "../EventDispatcher";

export class WrappedArray<T> extends Array<T> {
    private dispatcher: EventDispatcher;
    public readonly $wrapped: boolean = true;

    constructor(...items: T[]) {
        super(...items);
        Object.setPrototypeOf(this, WrappedArray.prototype);
        this.dispatcher = new EventDispatcher();
    }

    dispatch(event: string, ...args: any[]) {
        this.dispatcher.dispatch(event, ...args);
    }

    on(event: string, callback: EventDispatcherCallback) {
        this.dispatcher.on(event, callback);
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
