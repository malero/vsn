import {Registry} from "./Registry";

export class Types {
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
        return parseFloat(value);
    }

    @Registry.type('boolean')
    public static boolean(value: string) {
        return [0, '0', 'false', ''].indexOf(value) === -1;
    }
}
