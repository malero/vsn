export interface IMessageHash {
    [key: string]: string[] | null | undefined;
}

export class MessageList {
    [key: string]: any; // We're trying to mimic a basic object

    private _cachedList: IMessageHash | undefined;

    constructor(messages?: IMessageHash) {
        this.reset();
        if (messages)
            this.merge(messages);
    }

    reset(): void {
        // Reset the object
        const keys: string[] = this.keys;

        this._cachedList = undefined;

        if (keys.length > 0) {
            for (const field of keys) {
                delete this[field];
            }
        }
    }

    add(field: string, errors: string[] | string, replace: boolean = false) {
        this.merge({
            [field]: typeof errors == 'string' ? [errors] : errors
        }, replace);
    }

    merge(messages: IMessageHash | null | undefined, replace: boolean = false) {
        if (!messages) return;

        this._cachedList = undefined;

        const keys: string[] = this.keys;
        for (const field in messages) {
            if (!messages.hasOwnProperty(field))
                continue;
            const message: string[] | null | undefined = messages[field];

            if (message instanceof Array) {
                if (!replace && keys.indexOf(field) > -1) {
                    message.map((x) => {
                        this[field].push(x);
                    });
                } else if (message.length > 0) {
                    this[field] = message;
                }
            }
        }
    }

    get list(): IMessageHash {
        if (this._cachedList)
            return this._cachedList;

        const list: IMessageHash = {},
            keys: string[] = this.keys;

        for (const field of keys) {
            list[field] = this[field];
        }
        this._cachedList = list;
        return list;
    }

    get keys(): string[] {
        const keys = Object.keys(this);
        keys.splice(keys.indexOf('_cachedList'), 1);
        return keys;
    }

    get length(): number {
        return this.keys.length;
    }

    get isEmpty(): boolean {
        return this.length === 0;
    }
}
