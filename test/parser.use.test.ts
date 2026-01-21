import { describe, expect, it } from "vitest";

import { Parser } from "../src/index";

describe("parser use statements", () => {
  it("parses use statements with alias", () => {
    const source = `
      use Math as math;
      behavior .card { }
    `;
    const program = new Parser(source).parseProgram();

    expect(program.uses).toHaveLength(1);
    expect(program.uses[0]!.name).toBe("Math");
    expect(program.uses[0]!.alias).toBe("math");
  });

  it("parses use statements without alias", () => {
    const source = `
      use console;
      behavior .card { }
    `;
    const program = new Parser(source).parseProgram();

    expect(program.uses).toHaveLength(1);
    expect(program.uses[0]!.name).toBe("console");
    expect(program.uses[0]!.alias).toBe("console");
  });

  it("parses use statements with wait flags", () => {
    const source = `
      use CodeMirror !wait(10000, 100);
      behavior .card { }
    `;
    const program = new Parser(source).parseProgram();

    expect(program.uses).toHaveLength(1);
    expect(program.uses[0]!.flags.wait).toBe(true);
    expect(program.uses[0]!.flagArgs.wait).toEqual({ timeoutMs: 10000, intervalMs: 100 });
  });
});
