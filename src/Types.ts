import {Registry} from "./Registry";

export class Types {
    @Registry.type('any')
    public static any(value: any): any {
        return value as any;
    }

    @Registry.type('string')
    public static string(value: string) {
        return value;
    }

    @Registry.type('integer')
    public static integer(value: string) {
        return parseInt(value);
    }

    @Registry.type('float')
    public static float(value: string) {
        value = `${value}`.replace(/[^0-9.]+/, '');
        return parseFloat(value);
    }

    @Registry.type('boolean')
    public static boolean(value: string) {
        return [0, '0', 'false', ''].indexOf(value) === -1;
    }

    @Registry.type('date')
    public static date(value: string) {
        return new Date(Date.parse(value));
    }
}
