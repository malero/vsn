import { describe, expect, it } from "vitest";

import { Parser } from "../src/index";
import { Scope } from "../src/runtime/scope";

describe("compound assignments", () => {
  it("supports +=, -=, *=, /=", async () => {
    const block = Parser.parseInline(`
      count = 1;
      count += 2;
      count *= 3;
      count -= 4;
      count /= 2;
    `);
    const scope = new Scope();

    await block.evaluate({ scope, rootScope: scope });

    expect(scope.get("count")).toBe(2.5);
  });

  it("supports root and member paths", async () => {
    const block = Parser.parseInline(`
      root.count = 1;
      user = { score: 2 };
      root.count += 3;
      user.score += 4;
    `);
    const scope = new Scope();

    await block.evaluate({ scope, rootScope: scope });

    expect(scope.get("count")).toBe(4);
    expect(scope.getPath("user.score")).toBe(6);
  });

  it("supports index paths", async () => {
    const block = Parser.parseInline(`
      items = [1, 2, 3];
      items[1] += 4;
    `);
    const scope = new Scope();

    await block.evaluate({ scope, rootScope: scope });

    expect(scope.getPath("items.1")).toBe(6);
  });

  it("supports computed index paths", async () => {
    const block = Parser.parseInline(`
      idx = 1;
      key = "score";
      items = [10, 20, 30];
      user = { score: 2 };
      items[idx] += 5;
      user[key] += 3;
      root.items[idx] += 2;
    `);
    const scope = new Scope();

    await block.evaluate({ scope, rootScope: scope });

    expect(scope.getPath("items.1")).toBe(27);
    expect(scope.getPath("user.score")).toBe(5);
  });
});
