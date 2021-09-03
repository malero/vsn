import {EValueType} from "./WASM";
import {FunctionSection} from "./Function";

export enum EMemoryType {
    i32,
    i64,
    f32,
    f64,
    i32Array,
    i64Array,
    f32Array,
    f64Array
}

export const memoryVariableIndex = new FunctionSection("memoryVariableIndex");
memoryVariableIndex.addParam(EValueType.i32);
memoryVariableIndex.addParam(EValueType.i32);
memoryVariableIndex.addResult(EValueType.i32);
memoryVariableIndex.addCode([

]);
