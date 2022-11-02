"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = exports.compile = exports.emitter = exports.encodeLocal = exports.encodeVector = exports.emptyArray = exports.functionType = exports.EExportType = exports.EOpCode = exports.EBlockType = exports.EValueType = exports.flatten = exports.unsignedLEB128 = exports.signedLEB128 = exports.encodeString = exports.ieee754 = void 0;
var VisionHelper_1 = require("../helpers/VisionHelper");
var Function_1 = require("./WASM/Function");
var dummyFunc = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return null;
};
var dummyVal = null;
var _ieee754 = dummyFunc;
var _encodeString = dummyFunc;
var _signedLEB128 = dummyFunc;
var _unsignedLEB128 = dummyFunc;
_ieee754 = function (n) {
    var buf = Buffer.allocUnsafe(4);
    buf.writeFloatLE(n, 0);
    return Uint8Array.from(buf);
};
_encodeString = function (str) { return __spreadArray([
    str.length
], __read(str.split("").map(function (s) { return s.charCodeAt(0); }))); };
_signedLEB128 = function (n) {
    var buffer = [];
    var more = true;
    var isNegative = n < 0;
    var bitCount = Math.ceil(Math.log2(Math.abs(n))) + 1;
    while (more) {
        var byte = n & 0x7f;
        n >>= 7;
        if (isNegative) {
            n = n | -(1 << (bitCount - 8));
        }
        if ((n === 0 && (byte & 0x40) === 0) || (n === -1 && (byte & 0x40) !== 0x40)) {
            more = false;
        }
        else {
            byte |= 0x80;
        }
        buffer.push(byte);
    }
    return buffer;
};
_unsignedLEB128 = function (n) {
    var buffer = [];
    do {
        var byte = n & 0x7f;
        n >>>= 7;
        if (n !== 0) {
            byte |= 0x80;
        }
        buffer.push(byte);
    } while (n !== 0);
    return buffer;
};
exports.ieee754 = _ieee754;
exports.encodeString = _encodeString;
exports.signedLEB128 = _signedLEB128;
exports.unsignedLEB128 = _unsignedLEB128;
var flatten = function (arr) {
    return [].concat.apply([], arr);
};
exports.flatten = flatten;
var ESectionType;
(function (ESectionType) {
    ESectionType[ESectionType["custom"] = 0] = "custom";
    ESectionType[ESectionType["type"] = 1] = "type";
    ESectionType[ESectionType["import"] = 2] = "import";
    ESectionType[ESectionType["func"] = 3] = "func";
    ESectionType[ESectionType["table"] = 4] = "table";
    ESectionType[ESectionType["memory"] = 5] = "memory";
    ESectionType[ESectionType["global"] = 6] = "global";
    ESectionType[ESectionType["export"] = 7] = "export";
    ESectionType[ESectionType["start"] = 8] = "start";
    ESectionType[ESectionType["element"] = 9] = "element";
    ESectionType[ESectionType["code"] = 10] = "code";
    ESectionType[ESectionType["data"] = 11] = "data";
})(ESectionType || (ESectionType = {}));
// https://webassembly.github.io/spec/core/binary/types.html
var EValueType;
(function (EValueType) {
    EValueType[EValueType["i32"] = 127] = "i32";
    EValueType[EValueType["f32"] = 125] = "f32";
})(EValueType = exports.EValueType || (exports.EValueType = {}));
// https://webassembly.github.io/spec/core/binary/types.html#binary-blocktype
var EBlockType;
(function (EBlockType) {
    EBlockType[EBlockType["void"] = 64] = "void";
})(EBlockType = exports.EBlockType || (exports.EBlockType = {}));
// https://webassembly.github.io/spec/core/binary/instructions.html
var EOpCode;
(function (EOpCode) {
    EOpCode[EOpCode["block"] = 2] = "block";
    EOpCode[EOpCode["loop"] = 3] = "loop";
    EOpCode[EOpCode["br"] = 12] = "br";
    EOpCode[EOpCode["br_if"] = 13] = "br_if";
    EOpCode[EOpCode["end"] = 11] = "end";
    EOpCode[EOpCode["call"] = 16] = "call";
    EOpCode[EOpCode["get_local"] = 32] = "get_local";
    EOpCode[EOpCode["set_local"] = 33] = "set_local";
    EOpCode[EOpCode["i32_store_8"] = 58] = "i32_store_8";
    EOpCode[EOpCode["i32_const"] = 65] = "i32_const";
    EOpCode[EOpCode["f32_const"] = 67] = "f32_const";
    EOpCode[EOpCode["i32_add"] = 106] = "i32_add";
    EOpCode[EOpCode["i32_sub"] = 107] = "i32_sub";
    EOpCode[EOpCode["i32_mul"] = 108] = "i32_mul";
    EOpCode[EOpCode["i32_div"] = 109] = "i32_div";
    EOpCode[EOpCode["i32_eqz"] = 69] = "i32_eqz";
    EOpCode[EOpCode["i32_eq"] = 70] = "i32_eq";
    EOpCode[EOpCode["f32_eq"] = 91] = "f32_eq";
    EOpCode[EOpCode["f32_lt"] = 93] = "f32_lt";
    EOpCode[EOpCode["f32_gt"] = 94] = "f32_gt";
    EOpCode[EOpCode["i32_and"] = 113] = "i32_and";
    EOpCode[EOpCode["f32_add"] = 146] = "f32_add";
    EOpCode[EOpCode["f32_sub"] = 147] = "f32_sub";
    EOpCode[EOpCode["f32_mul"] = 148] = "f32_mul";
    EOpCode[EOpCode["f32_div"] = 149] = "f32_div";
    EOpCode[EOpCode["i32_trunc_f32_s"] = 168] = "i32_trunc_f32_s";
    EOpCode[EOpCode["memory_size"] = 63] = "memory_size";
    EOpCode[EOpCode["memory_grow"] = 64] = "memory_grow";
    // Vision op codes
    EOpCode[EOpCode["scope_get"] = 1024] = "scope_get";
    EOpCode[EOpCode["scope_set"] = 1025] = "scope_set";
})(EOpCode = exports.EOpCode || (exports.EOpCode = {}));
var binaryOpcode = {
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
var EExportType;
(function (EExportType) {
    EExportType[EExportType["func"] = 0] = "func";
    EExportType[EExportType["table"] = 1] = "table";
    EExportType[EExportType["mem"] = 2] = "mem";
    EExportType[EExportType["global"] = 3] = "global";
})(EExportType = exports.EExportType || (exports.EExportType = {}));
// http://webassembly.github.io/spec/core/binary/types.html#function-types
exports.functionType = 0x60;
exports.emptyArray = 0x0;
// https://webassembly.github.io/spec/core/binary/modules.html#binary-module
var magicModuleHeader = [0x00, 0x61, 0x73, 0x6d];
var moduleVersion = [0x01, 0x00, 0x00, 0x00];
// https://webassembly.github.io/spec/core/binary/conventions.html#binary-vec
// Vectors are encoded with their length followed by their element sequence
var encodeVector = function (data) { return __spreadArray(__spreadArray([], __read(exports.unsignedLEB128(data.length))), __read(exports.flatten(data))); };
exports.encodeVector = encodeVector;
// https://webassembly.github.io/spec/core/binary/modules.html#code-section
var encodeLocal = function (count, type) { return __spreadArray(__spreadArray([], __read(exports.unsignedLEB128(count))), [
    type
]); };
exports.encodeLocal = encodeLocal;
// https://webassembly.github.io/spec/core/binary/modules.html#sections
// sections are encoded by their type followed by their vector contents
var createSection = function (sectionType, data) { return __spreadArray([
    sectionType
], __read(exports.encodeVector(data))); };
/*
    Building a WASM program...
    Based off of Chasm:
    https://github.com/ColinEberhardt/chasm/blob/master/src/emitter.ts
    https://webassembly.github.io/wabt/demo/wat2wasm/
*/
var emitter = function (functions) {
    // Types section
    var typesSection = createSection(ESectionType.type, __spreadArray([
        functions.length
    ], __read(exports.flatten(functions.map(function (func) { return func.sectionTypes; })))));
    // Functions section
    var functionsSection = createSection(ESectionType.func, __spreadArray([
        functions.length
    ], __read(functions.map(function (func, i) { return i; }))));
    // Export section
    var exportSection = createSection(ESectionType.export, exports.encodeVector(functions.map(function (func, i) { return __spreadArray(__spreadArray([], __read(func.sectionExport)), [i]); })));
    var codeSection = createSection(ESectionType.code, __spreadArray([
        functions.length
    ], __read(exports.flatten(functions.map(function (func) { return func.sectionCode; })))));
    return Uint8Array.from(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], __read(magicModuleHeader)), __read(moduleVersion)), __read(typesSection)), __read(functionsSection)), __read(exportSection)), __read(codeSection)));
};
exports.emitter = emitter;
var defaultMemory = new WebAssembly.Memory({ initial: 10, maximum: 100, shared: true });
function compile(functions, memory) {
    return __awaiter(this, void 0, void 0, function () {
        var wasm;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    memory = memory || defaultMemory;
                    wasm = exports.emitter(functions);
                    return [4 /*yield*/, WebAssembly.instantiate(wasm, {
                            js: {
                                memory: memory
                            }
                        })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.compile = compile;
function run(functions) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return __awaiter(this, void 0, void 0, function () {
        var memory, wasm;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    memory = args[0] instanceof WebAssembly.Memory && args[0] || defaultMemory;
                    if (functions instanceof Function_1.FunctionSection)
                        functions = [functions];
                    return [4 /*yield*/, compile(functions, memory)];
                case 1:
                    wasm = _b.sent();
                    return [2 /*return*/, 'main' in wasm.instance.exports ? (_a = wasm.instance.exports).main.apply(_a, __spreadArray([], __read(args))) : wasm];
            }
        });
    });
}
exports.run = run;
if (VisionHelper_1.VisionHelper.window)
    window['wasm'] = {
        compile: compile
    };
//# sourceMappingURL=WASM.js.map