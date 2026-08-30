import { describe, expect, it } from "vitest";

import { Parser } from "../src/index";

describe("parser declarations", () => {
  it("parses declaration zone with bindings and flags", () => {
    const source = `behavior .card {
  active: false !important;
  @aria-pressed := active !debounce(50);
  $background-color :< theme.cardBg;
  @data-id :> id !debounce;
  @html : response;

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
    expect(statements[3].flagArgs.debounce).toBe(undefined);

    expect(statements[4].target.type).toBe("Directive");
  });

  it("parses object-valued class declarations", () => {
    const source = `behavior .card {
  @class:< {
    "is-active": active,
    disabled: !enabled
  };
}`;

    const program = new Parser(source).parseProgram();
    const declaration = program.behaviors[0]?.body.statements[0] as any;

    expect(declaration.type).toBe("Declaration");
    expect(declaration.target.name).toBe("class");
    expect(declaration.operator).toBe(":<");
    expect(declaration.value.type).toBe("ObjectExpression");
    expect(declaration.value.entries.map((entry: any) => entry.key)).toEqual(["is-active", "disabled"]);
  });

  it("rejects declarations after construct/on blocks", () => {
    const source = `behavior .card {
  on click() { active = !active; }
  active: false;
}`;

    expect(() => new Parser(source).parseProgram()).toThrow();
  });
});
