import {MessageList} from "./MessageList";
import {ScopeData} from "./Scope/ScopeData";
import {IScopeData} from "./Scope/ScopeDataAbstract";
import {Registry} from "./Registry";

@Registry.model('Model')
export class Model extends ScopeData {
    _errors!: MessageList;
    _hasErrors: boolean;

    constructor(data: IScopeData | null | undefined = null) {
        super();

        this._hasErrors = false;
        if (data)
            this.setData(data);
        this._lastData = this.getData();
        this._constructor();
    }

    _constructor() {}

    validate(): MessageList {
        this._hasErrors = false;
        this._errors = new MessageList;
        for(const property of this.getProperties()) {
            const errors = this['__'+property].validate();
            if(errors.length > 0) {
                this._errors.add(property, errors, true);
                this._hasErrors = true;
            }
        }
        return this._errors;
    }

    hasErrors(): boolean {
        this.validate();
        return this._hasErrors;
    }

    get errors(): MessageList {
        return this._errors;
    }
}
