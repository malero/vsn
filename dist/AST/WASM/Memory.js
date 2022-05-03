"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.memoryVariableIndex = exports.EMemoryType = void 0;
var WASM_1 = require("../WASM");
var Function_1 = require("./Function");
var EMemoryType;
(function (EMemoryType) {
    EMemoryType[EMemoryType["i32"] = 0] = "i32";
    EMemoryType[EMemoryType["i64"] = 1] = "i64";
    EMemoryType[EMemoryType["f32"] = 2] = "f32";
    EMemoryType[EMemoryType["f64"] = 3] = "f64";
    EMemoryType[EMemoryType["i32Array"] = 4] = "i32Array";
    EMemoryType[EMemoryType["i64Array"] = 5] = "i64Array";
    EMemoryType[EMemoryType["f32Array"] = 6] = "f32Array";
    EMemoryType[EMemoryType["f64Array"] = 7] = "f64Array";
})(EMemoryType = exports.EMemoryType || (exports.EMemoryType = {}));
exports.memoryVariableIndex = new Function_1.FunctionSection("memoryVariableIndex");
exports.memoryVariableIndex.addParam(WASM_1.EValueType.i32);
exports.memoryVariableIndex.addParam(WASM_1.EValueType.i32);
exports.memoryVariableIndex.addResult(WASM_1.EValueType.i32);
exports.memoryVariableIndex.addCode([]);
//# sourceMappingURL=Memory.js.map