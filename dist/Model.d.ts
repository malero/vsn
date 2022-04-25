import { MessageList } from "./MessageList";
import { ScopeData } from "./Scope/ScopeData";
import { IScopeData } from "./Scope/ScopeDataAbstract";
export declare class Model extends ScopeData {
    _errors: MessageList;
    _hasErrors: boolean;
    constructor(data?: IScopeData | null | undefined);
    _constructor(): void;
    validate(): MessageList;
    hasErrors(): boolean;
    get errors(): MessageList;
}
