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

  it("parses all compound operators without spaces while keeping hyphenated names", async () => {
    const block = Parser.parseInline(`
      count = 8;
      count+=2;
      count-=1;
      count*=3;
      count/=3;
      data-value = 4;
      result = data-value;
    `);
    const scope = new Scope();

    await block.evaluate({ scope, rootScope: scope });

    expect(scope.get("count")).toBe(9);
    expect(scope.get("result")).toBe(4);
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

  it("resolves a computed target once before an asynchronous right side", async () => {
    const block = Parser.parseInline(`items[nextIndex()] += changeTarget();`);
    const scope = new Scope();
    const events: string[] = [];
    scope.set("items", [10, 20]);
    scope.set("index", 0);
    let indexCalls = 0;

    await block.evaluate({
      scope,
      rootScope: scope,
      globals: {
        nextIndex: () => {
          indexCalls += 1;
          events.push("index");
          return scope.get("index");
        },
        changeTarget: () => {
          events.push("right");
          scope.setPath("items.0", 100);
          scope.set("index", 1);
          return Promise.resolve(5);
        }
      }
    });

    expect(events).toEqual(["index", "right"]);
    expect(indexCalls).toBe(1);
    expect(scope.get("items")).toEqual([15, 20]);
  });

  it("supports member paths after a computed index and root paths", async () => {
    const block = Parser.parseInline(`
      index = 0;
      items = [{ stats: { score: 2 } }];
      items[index].stats.score += 3;
      ++root.items[index].stats.score;
    `);
    const scope = new Scope();

    await block.evaluate({ scope, rootScope: scope });

    expect(scope.getPath("items.0.stats.score")).toBe(6);
  });

  it("notifies reactive effects for compound and update assignments", async () => {
    const scope = new Scope();
    scope.set("user", { stats: { score: 1 } });
    const seen: number[] = [];
    scope.effect((current) => {
      seen.push(current.get("user.stats.score"));
    });

    await Parser.parseInline(`user.stats.score += 2; user.stats.score++;`)
      .evaluate({ scope, rootScope: scope });

    expect(seen).toEqual([1, 3, 4]);
  });

  it("rejects optional and non-path member targets", async () => {
    expect(() => Parser.parseInline("user?.score += 1;"))
      .toThrow(/Optional chaining/);
    expect(() => Parser.parseInline("user.profile?.score++;"))
      .toThrow(/mutable target/);
    expect(() => Parser.parseInline("makeUser().score += 1;"))
      .toThrow(/mutable identifier/);
  });

  it("rejects unsupported directive compound assignments", async () => {
    const block = Parser.parseInline(`@title += " updated";`);
    const scope = new Scope();

    expect(() => block.evaluate({ scope, rootScope: scope }))
      .toThrow(/not supported for @title/);
  });

  it("supports member assignment after index access", async () => {
    const block = Parser.parseInline(`
      i = 0;
      items = [{ name: "red" }];
      items[i].name = "blue";
    `);
    const scope = new Scope();

    await block.evaluate({ scope, rootScope: scope });

    expect(scope.getPath("items.0.name")).toBe("blue");
  });

  it("allows optional chaining inside a computed index", async () => {
    const block = Parser.parseInline(`items[user?.index] += 2;`);
    const scope = new Scope();
    scope.set("items", [10, 20]);
    scope.set("user", { index: 0 });

    await block.evaluate({ scope, rootScope: scope });

    expect(scope.get("items")).toEqual([12, 20]);
  });
});
