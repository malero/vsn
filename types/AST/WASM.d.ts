import { FunctionSection } from "./Function";
export declare const ieee754: (...args: any[]) => any;
export declare const encodeString: (...args: any[]) => any;
export declare const signedLEB128: (...args: any[]) => any;
export declare const unsignedLEB128: (...args: any[]) => any;
export declare const flatten: (arr: any[]) => any;
export declare enum EValueType {
    i32 = 127,
    f32 = 125
}
export declare enum EBlockType {
    void = 64
}
export declare enum EOpCode {
    block = 2,
    loop = 3,
    br = 12,
    br_if = 13,
    end = 11,
    call = 16,
    get_local = 32,
    set_local = 33,
    i32_store_8 = 58,
    i32_const = 65,
    f32_const = 67,
    i32_add = 106,
    i32_sub = 107,
    i32_mul = 108,
    i32_div = 109,
    i32_eqz = 69,
    i32_eq = 70,
    f32_eq = 91,
    f32_lt = 93,
    f32_gt = 94,
    i32_and = 113,
    f32_add = 146,
    f32_sub = 147,
    f32_mul = 148,
    f32_div = 149,
    i32_trunc_f32_s = 168,
    memory_size = 63,
    memory_grow = 64,
    scope_get = 1024,
    scope_set = 1025
}
export declare enum EExportType {
    func = 0,
    table = 1,
    mem = 2,
    global = 3
}
export declare const functionType = 96;
export declare const emptyArray = 0;
export declare const encodeVector: (data: any[]) => any[];
export declare const encodeLocal: (count: number, type: EValueType) => any[];
export declare const emitter: (functions: FunctionSection[]) => Uint8Array;
export declare function compile(functions: FunctionSection[], memory?: WebAssembly.Memory): Promise<WebAssembly.WebAssemblyInstantiatedSource>;
export declare function run(functions: FunctionSection | FunctionSection[], ...args: any[]): Promise<any>;
