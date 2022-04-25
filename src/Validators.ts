import {Registry} from "./Registry";

export class Validators {
    public static readonly _emailRegex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

    @Registry.validator('email')
    public static email(value: any): string[] {
        const errors: string[] = [];

        if(value != null && !this._emailRegex.test(value))
            errors.push('Please enter a valid email address');

        return errors;
    }
}
