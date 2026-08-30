/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine, OnBlockNode, Parser } from "../src/index";

describe("on flag arguments", () => {
  it("keeps flag arguments separate from event arguments", () => {
    const program = new Parser(`
      behavior .card {
        on click!foo(bar) { }
        on keyup!foo(1)() { }
        on focus!foo() { }
        on blur()!foo() { }
      }
    `, { customFlags: new Set(["foo"]) }).parseProgram();

    const blocks = program.behaviors[0]!.body.statements.filter(
      (statement): statement is OnBlockNode => statement instanceof OnBlockNode
    );

    expect(blocks[0]!.flagArgs.foo).toBe("bar");
    expect(blocks[0]!.args).toEqual([]);
    expect(blocks[1]!.flagArgs.foo).toBe(1);
    expect(blocks[1]!.args).toEqual([]);
    expect(blocks[2]!.flagArgs.foo).toBeUndefined();
    expect(blocks[2]!.args).toEqual([]);
    expect(blocks[3]!.flagArgs.foo).toBeUndefined();
    expect(blocks[3]!.args).toEqual([]);
  });

  it("passes identifier flag arguments to custom handlers", async () => {
    document.body.innerHTML = `<button class="card"></button>`;
    let received: unknown;

    const engine = new Engine();
    engine.registerFlag("foo", {
      onEventBefore: ({ args }) => {
        received = args;
      }
    });
    engine.registerBehaviors(`
      behavior .card {
        on click!foo(bar) { clicked = true; }
      }
    `);
    await engine.mount(document.body);

    const card = document.querySelector(".card") as HTMLButtonElement;
    card.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(received).toBe("bar");
    expect(engine.getScope(card).get("clicked")).toBe(true);
  });
});
