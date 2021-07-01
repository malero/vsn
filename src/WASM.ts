export const ieee754 = (n: number) => {
    const buf = Buffer.allocUnsafe(4);
    buf.writeFloatLE(n, 0);
    return Uint8Array.from(buf);
};

export const encodeString = (str: string) => [
    str.length,
    ...str.split("").map(s => s.charCodeAt(0))
];

export const signedLEB128 = (n: number) => {
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

export const unsignedLEB128 = (n: number) => {
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

const flatten = (arr: any[]) => [].concat.apply([], arr);

enum Section {
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
enum Valtype {
    i32 = 0x7f,
    f32 = 0x7d
}

// https://webassembly.github.io/spec/core/binary/types.html#binary-blocktype
enum Blocktype {
    void = 0x40
}

// https://webassembly.github.io/spec/core/binary/instructions.html
enum Opcodes {
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
    i32_trunc_f32_s = 0xa8
}

const binaryOpcode = {
    "+": Opcodes.f32_add,
    "-": Opcodes.f32_sub,
    "*": Opcodes.f32_mul,
    "/": Opcodes.f32_div,
    "==": Opcodes.f32_eq,
    ">": Opcodes.f32_gt,
    "<": Opcodes.f32_lt,
    "&&": Opcodes.i32_and
};

// http://webassembly.github.io/spec/core/binary/modules.html#export-section
enum ExportType {
    func = 0x00,
    table = 0x01,
    mem = 0x02,
    global = 0x03
}

// http://webassembly.github.io/spec/core/binary/types.html#function-types
const functionType = 0x60;

const emptyArray = 0x0;

// https://webassembly.github.io/spec/core/binary/modules.html#binary-module
const magicModuleHeader = [0x00, 0x61, 0x73, 0x6d];
const moduleVersion = [0x01, 0x00, 0x00, 0x00];

// https://webassembly.github.io/spec/core/binary/conventions.html#binary-vec
// Vectors are encoded with their length followed by their element sequence
const encodeVector = (data: any[]) => [
    ...unsignedLEB128(data.length),
    ...flatten(data)
];

// https://webassembly.github.io/spec/core/binary/modules.html#code-section
const encodeLocal = (count: number, type: Valtype) => [
    ...unsignedLEB128(count),
    type
];

// https://webassembly.github.io/spec/core/binary/modules.html#sections
// sections are encoded by their type followed by their vector contents
const createSection = (sectionType: Section, data: any[]) => [
    sectionType,
    ...encodeVector(data)
];

/*
    Building a WASM program...
    Based off of Chasm:
    https://github.com/ColinEberhardt/chasm/blob/master/src/emitter.ts
    https://webassembly.github.io/wabt/demo/wat2wasm/
*/
export const emitter = () => {
    // Types section
    const typesSection = createSection(Section.type, [
        0x01, // Number of types
        functionType,
        0x02, // Number of params
        Valtype.i32, // Param 0 type
        Valtype.i32, // Param 1 type
        0x01, // Number of results
        Valtype.i32 // result 0 type
    ]);

    // Functions section
    const functionsSection = createSection(Section.func, [
        0x01, // number of functions
        0x00, // function 0 index
    ]);

    // Export section
    const exportSection = createSection(
        Section.export,
        encodeVector([
            [
                ...encodeString("addTwo"),
                ExportType.func,
                0x00
            ]
        ])
    );

    const codeSection = createSection(Section.code, [
        0x01, // Number of functions
        ...encodeVector([
            0x00, // local declare count
            Opcodes.get_local,
            0x00, // local var 0
            Opcodes.get_local,
            0x01, // local var 1
            Opcodes.i32_add,
            Opcodes.end
        ])
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

async function run() {
    const wasm = emitter();
    const instance = await WebAssembly.instantiate(wasm);
    return instance;
}

window['run'] = run;
