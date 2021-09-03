import {VisionHelper} from "../helpers/VisionHelper";
import {FunctionSection} from "./Function";


const dummyFunc = (...args: any[]): any => null;
const dummyVal = null;

let _ieee754 = dummyFunc;
let _encodeString = dummyFunc;
let _signedLEB128 = dummyFunc;
let _unsignedLEB128 = dummyFunc;

if (VisionHelper.doWASM) {
    _ieee754 = (n: number) => {
        const buf = Buffer.allocUnsafe(4);
        buf.writeFloatLE(n, 0);
        return Uint8Array.from(buf);
    };

    _encodeString = (str: string) => [
        str.length,
        ...str.split("").map(s => s.charCodeAt(0))
    ];

    _signedLEB128 = (n: number) => {
        const buffer = [];
        let more = true;
        const isNegative = n < 0;
        const bitCount = Math.ceil(Math.log2(Math.abs(n))) + 1;
        while (more) {
            let byte = n & 0x7f;
            n >>= 7;
            if (isNegative) {
                n = n | -(1 << (bitCount - 8));
            }
            if ((n === 0 && (byte & 0x40) === 0) || (n === -1 && (byte & 0x40) !== 0x40)) {
                more = false;
            } else {
                byte |= 0x80;
            }
            buffer.push(byte);
        }
        return buffer;
    };

    _unsignedLEB128 = (n: number) => {
        const buffer = [];
        do {
            let byte = n & 0x7f;
            n >>>= 7;
            if (n !== 0) {
                byte |= 0x80;
            }
            buffer.push(byte);
        } while (n !== 0);
        return buffer;
    };
}

export const ieee754 = _ieee754;
export const encodeString = _encodeString;
export const signedLEB128 = _signedLEB128;
export const unsignedLEB128 = _unsignedLEB128;

export const flatten = (arr: any[]) => {
    return [].concat.apply([], arr);
}

enum ESectionType {
    custom = 0,
    type = 1,
    import = 2,
    func = 3,
    table = 4,
    memory = 5,
    global = 6,
    export = 7,
    start = 8,
    element = 9,
    code = 10,
    data = 11
}

// https://webassembly.github.io/spec/core/binary/types.html
export enum EValueType {
    i32 = 0x7f,
    f32 = 0x7d
}

// https://webassembly.github.io/spec/core/binary/types.html#binary-blocktype
export enum EBlockType {
    void = 0x40
}

// https://webassembly.github.io/spec/core/binary/instructions.html
export enum EOpCode {
    block = 0x02,
    loop = 0x03,
    br = 0x0c,
    br_if = 0x0d,
    end = 0x0b,
    call = 0x10,
    get_local = 0x20,
    set_local = 0x21,
    i32_store_8 = 0x3a,
    i32_const = 0x41,
    f32_const = 0x43,
    i32_add = 0x6a,
    i32_sub = 0x6B,
    i32_mul = 0x6C,
    i32_div = 0x6D,
    i32_eqz = 0x45,
    i32_eq = 0x46,
    f32_eq = 0x5b,
    f32_lt = 0x5d,
    f32_gt = 0x5e,
    i32_and = 0x71,
    f32_add = 0x92,
    f32_sub = 0x93,
    f32_mul = 0x94,
    f32_div = 0x95,
    i32_trunc_f32_s = 0xa8,
    memory_size = 0x3f,
    memory_grow = 0x40,

    // Vision op codes
    scope_get = 0x400,
    scope_set = 0x401
}

const binaryOpcode = {
    "+": EOpCode.f32_add,
    "-": EOpCode.f32_sub,
    "*": EOpCode.f32_mul,
    "/": EOpCode.f32_div,
    "==": EOpCode.f32_eq,
    ">": EOpCode.f32_gt,
    "<": EOpCode.f32_lt,
    "&&": EOpCode.i32_and
};

// http://webassembly.github.io/spec/core/binary/modules.html#export-section
export enum EExportType {
    func = 0x00,
    table = 0x01,
    mem = 0x02,
    global = 0x03
}

// http://webassembly.github.io/spec/core/binary/types.html#function-types
export const functionType = 0x60;

export const emptyArray = 0x0;

// https://webassembly.github.io/spec/core/binary/modules.html#binary-module
const magicModuleHeader = [0x00, 0x61, 0x73, 0x6d];
const moduleVersion = [0x01, 0x00, 0x00, 0x00];

// https://webassembly.github.io/spec/core/binary/conventions.html#binary-vec
// Vectors are encoded with their length followed by their element sequence
export const encodeVector = (data: any[]) => [
    ...unsignedLEB128(data.length),
    ...flatten(data)
];

// https://webassembly.github.io/spec/core/binary/modules.html#code-section
export const encodeLocal = (count: number, type: EValueType) => [
    ...unsignedLEB128(count),
    type
];

// https://webassembly.github.io/spec/core/binary/modules.html#sections
// sections are encoded by their type followed by their vector contents
const createSection = (sectionType: ESectionType, data: any[]) => [
    sectionType,
    ...encodeVector(data)
];

/*
    Building a WASM program...
    Based off of Chasm:
    https://github.com/ColinEberhardt/chasm/blob/master/src/emitter.ts
    https://webassembly.github.io/wabt/demo/wat2wasm/
*/

export const emitter = (functions: FunctionSection[]) => {
    // Types section
    const typesSection = createSection(ESectionType.type, [
        functions.length, // Number of types
        ...flatten(functions.map((func) => func.sectionTypes))
    ]);

    // Functions section
    const functionsSection = createSection(ESectionType.func, [
        functions.length, // number of functions
        ...functions.map((func, i) => i)
    ]);

    // Export section
    const exportSection = createSection(
        ESectionType.export,
        encodeVector(functions.map((func,i) => [...func.sectionExport, i]))
    );

    const codeSection = createSection(ESectionType.code, [
        functions.length, // Number of functions
        ...flatten(functions.map((func) => func.sectionCode))
    ]);

    return Uint8Array.from([
        ...magicModuleHeader,
        ...moduleVersion,
        ...typesSection,
        ...functionsSection,
        ...exportSection,
        ...codeSection
    ]);
}

const defaultMemory: WebAssembly.Memory = new WebAssembly.Memory({initial: 10, maximum: 100, shared: true} as WebAssembly.MemoryDescriptor);

export async function compile(functions: FunctionSection[], memory?: WebAssembly.Memory) {
    memory = memory || defaultMemory;
    const wasm = emitter(functions);
    return await WebAssembly.instantiate(wasm, {
        js: {
            memory: memory
        }
    });
}

export async function run(functions: FunctionSection | FunctionSection[], ...args) {
    const memory = args[0] instanceof WebAssembly.Memory && args[0] || defaultMemory;
    if (functions instanceof FunctionSection)
        functions = [functions];

    const wasm = await compile(functions, memory);
    return 'main' in wasm.instance.exports ? (wasm.instance.exports.main as any)(...args) : wasm;
}

if (VisionHelper.window)
    window['wasm'] = {
        compile: compile
    }
