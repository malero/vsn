export interface IMessageHash {
    [key: string]: string[] | null | undefined;
}
export declare class MessageList {
    [key: string]: any;
    private _cachedList;
    constructor(messages?: IMessageHash);
    reset(): void;
    add(field: string, errors: string[] | string, replace?: boolean): void;
    merge(messages: IMessageHash | null | undefined, replace?: boolean): void;
    get list(): IMessageHash;
    get keys(): string[];
    get length(): number;
    get isEmpty(): boolean;
}
