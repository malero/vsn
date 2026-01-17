import { describe, expect, it } from "vitest";

import { Parser } from "../src/index";

describe("parser declarations", () => {
  it("parses declaration zone with bindings and flags", () => {
    const source = `behavior .card {
  active: false !important;
  @aria-pressed := active !debounce(50);
  $background-color :< theme.cardBg;
  @data-id :> id !debounce;
  @html : response !trusted;

  construct { }
  on click() { active = !active; }
}`;

    const program = new Parser(source).parseProgram();
    const behavior = program.behaviors[0] as any;
    const statements = behavior.body.statements as any[];

    expect(statements[0].type).toBe("Declaration");
    expect(statements[0].operator).toBe(":");
    expect(statements[0].target.type).toBe("Identifier");
    expect(statements[0].flags.important).toBe(true);

    expect(statements[1].type).toBe("Declaration");
    expect(statements[1].operator).toBe(":=");
    expect(statements[1].target.type).toBe("Directive");
    expect(statements[1].flags.debounce).toBe(true);
    expect(statements[1].flagArgs.debounce).toBe(50);

    expect(statements[2].operator).toBe(":<");
    expect(statements[3].operator).toBe(":>");
    expect(statements[3].flagArgs.debounce).toBe(200);

    expect(statements[4].target.type).toBe("Directive");
    expect(statements[4].flags.trusted).toBe(true);
  });

  it("rejects declarations after construct/on blocks", () => {
    const source = `behavior .card {
  on click() { active = !active; }
  active: false;
}`;

    expect(() => new Parser(source).parseProgram()).toThrow();
  });
});
