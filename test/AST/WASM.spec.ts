import {compile, EOpCode, EValueType, run} from "../../src/AST/WASM";
import {VisionHelper} from "../../src/helpers/VisionHelper";
import {FunctionSection} from "../../src/AST/Function";

describe('WASM', () => {
    it("should support wasm", async () => {
        expect(VisionHelper.wasmSupport).toBe(true);
    });

    it("should allow a simple addition function to be made", async () => {
        const main = new FunctionSection("main");
        main.addParam(EValueType.i32);
        main.addParam(EValueType.i32);
        main.addResult(EValueType.i32);
        main.addCode([
            0x00, // local declare count
            EOpCode.get_local,
            0x00, // local var 0
            EOpCode.get_local,
            0x01, // local var 1
            EOpCode.i32_add,
            EOpCode.end
        ]);
        expect(await run(main, 10, 15)).toBe(25);
    });

    it("should allow a simple subtraction function to be made", async () => {
        const main = new FunctionSection("main");
        main.addParam(EValueType.i32);
        main.addParam(EValueType.i32);
        main.addResult(EValueType.i32);
        main.addCode([
            0x00, // local declare count
            EOpCode.get_local,
            0x00, // local var 0
            EOpCode.get_local,
            0x01, // local var 1
            EOpCode.i32_sub,
            EOpCode.end
        ]);
        expect(await run(main, 10, 15)).toBe(-5);
    });

    it("should allow a simple function to be made", async () => {
        const main = new FunctionSection("main");
        main.addParam(EValueType.i32);
        main.addParam(EValueType.i32);
        main.addResult(EValueType.i32);
        main.addCode([
            0x00, // local declare count
            EOpCode.get_local,
            0x00, // local var 0
            EOpCode.get_local,
            0x01, // local var 1
            EOpCode.i32_sub,
            EOpCode.get_local,
            0x00, // local var 0
            EOpCode.i32_mul,
            EOpCode.end
        ]);
        expect(await run(main, 100, 15)).toBe(8500);
    });
});
