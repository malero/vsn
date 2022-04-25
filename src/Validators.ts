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

    @Registry.validator('required')
    public static required(value: any): string[] {
        const errors: string[] = [];

        if(value == null || value.length == 0)
            errors.push('This field is required');

        return errors;
    }

    @Registry.validator('positive')
    public static positive(value: any): string[] {
        const errors: string[] = [];

        if(value != null && value < 0)
            errors.push('Please enter a positive number');

        return errors;
    }

    @Registry.validator('negative')
    public static negative(value: any): string[] {
        const errors: string[] = [];

        if(value != null && value > 0)
            errors.push('Please enter a negative number');

        return errors;
    }
}
