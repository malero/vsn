
export interface EventCallbackList {
	[index: string]: EventCallback[];
}


export class EventCallback {
    public calls: number;
    constructor(
        public readonly fnc: any,
        public readonly key: number,
        public readonly once: boolean,
        public readonly context?: any,
    ) {
        this.calls = 0;
    }

    call(...args: any[]): boolean {
        if(this.once && this.calls > 0)
            return false;

        this.fnc.apply(this.context, ...args);
        this.calls += 1;
        return true;
    }
}

export type EventDispatcherCallback = (...args: any[]) => any;


export class EventDispatcher  {
    private static sources: EventDispatcher[] = [];
    private readonly _listeners: EventCallbackList;
    private readonly _relays: EventDispatcher[] = [];
    private _lastKey: number;

    constructor() {
        this._lastKey = 0;
        this._listeners = {};
        EventDispatcher.sources.push(this);
    }

    deconstruct() {
        this.dispatch('deconstruct', this);
        EventDispatcher.sources.splice(EventDispatcher.sources.indexOf(this), 1);
        for (const k in this._listeners) {
            delete this._listeners[k];
        }
    }

    addRelay(relay: EventDispatcher) {
        this._relays.push(relay);
    }

    removeRelay(relay: EventDispatcher) {
        if (this._relays.indexOf(relay) > -1)
            this._relays.splice(this._relays.indexOf(relay), 1);
    }

    on(event: string, fct: EventDispatcherCallback, context?: any, once?: boolean): number {
        once = once || false;
        this._lastKey++;
        this._listeners[event] = this._listeners[event] || [];
        this._listeners[event].push(new EventCallback(fct, this._lastKey, once, context));
        return this._lastKey;
    }

    once(event: string, fct: EventDispatcherCallback, context?: any): number {
        return this.on(event, fct, context, true);
    }

    off(event: string, key?: number): boolean {
        if(event in this._listeners === false) return false;
        if(key) {
            for(const cb of this._listeners[event]) {
                if(key == cb.key) {
                    this._listeners[event].splice(this._listeners[event].indexOf(cb), 1);
                    return true;
                }
            }
        } else {
            this._listeners[event] = [];
            return true;
        }
        return false;
    }

    offWithContext(event: string, context: any): number {
        if(!(event in this._listeners)) return 0;
        let toRemove: EventCallback[] = [],
            cnt = 0;

        for(const cb of this._listeners[event]) {
            if(context == cb.context) {
                toRemove.push(cb);
            }
        }

        for(const cb of toRemove) {
            this._listeners[event].splice(this._listeners[event].indexOf(cb), 1);
            cnt++;
        }
        return cnt;
    }

    getListener(event: string, key: number): EventCallback | undefined {
        for(const cb of this._listeners[event]) {
            if(key == cb.key)
                return cb;
        }
    }

    dispatch(event: string, ...args: any[]): void {
        if(event in this._listeners) {
            for (let i = 0; i < this._listeners[event].length; i++) {
                const cb: EventCallback = this._listeners[event][i];

                // We need to unbind callbacks before they're called to prevent
                // infinite loops if the event is somehow triggered within the
                // callback
                if (cb.once) {
                    this.off(event, cb.key);
                    i--;
                }

                cb.call(args);
            }
        }

        for (const relay of this._relays) {
            relay.dispatch(event, ...args);
        }
    }
}