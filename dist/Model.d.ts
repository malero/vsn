import { ModelAbstract, ModelData } from "./Model/ModelAbstract";
import MessageList from "./MessageList";
export declare class Model extends ModelAbstract {
    _errors: MessageList;
    _hasErrors: boolean;
    constructor(data?: ModelData | null | undefined);
    _constructor(): void;
    validate(): MessageList;
    hasErrors(): boolean;
    get errors(): MessageList;
}
