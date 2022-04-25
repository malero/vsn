import {IPropertyConfig, Property} from "../Scope/properties/Property";
import {Registry} from "../Registry";

export interface IFieldConfig extends IPropertyConfig {
    validators?: string[];
}

export class Field extends Property {
    config: IFieldConfig;

    validate() {
        const errors = [];
        for(const validatorName of this.config.validators || []) {
            const validator = Registry.instance.validators.getSynchronous(validatorName);
            errors.concat(validator(this.value));
        }

        return errors;
    }
}
