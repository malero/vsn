/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("reactive expression dependencies", () => {
  it("does not re-evaluate for unrelated scope changes", async () => {
    document.body.innerHTML = `<div class="card"></div>`;

    let evaluations = 0;
    const engine = new Engine();
    engine.registerGlobal("formatSelection", (selected: boolean) => {
      evaluations += 1;
      return selected ? "selected" : "not-selected";
    });
    engine.registerBehaviors(`
      behavior .card {
        selected: false;
        @data-state :< formatSelection(selected);
      }
    `);
    await engine.mount(document.body);

    const card = document.querySelector(".card") as HTMLDivElement;
    const scope = engine.getScope(card);
    await new Promise((resolve) => setTimeout(resolve, 0));
    const initialEvaluations = evaluations;

    scope.set("unrelated", true);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(evaluations).toBe(initialEvaluations);

    scope.set("selected", true);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(evaluations).toBeGreaterThan(initialEvaluations);
    expect(card.getAttribute("data-state")).toBe("selected");
  });

  it("tracks the selected item for dynamic indexes", async () => {
    document.body.innerHTML = `<div class="card"></div>`;

    let evaluations = 0;
    const engine = new Engine();
    engine.registerGlobal("readLabel", (item: { label?: string } | undefined) => {
      evaluations += 1;
      return item?.label ?? "missing";
    });
    engine.registerBehaviors(`
      behavior .card {
        selected: 0;
        items: [];
        @data-label :< readLabel(items[selected]);
      }
    `);
    await engine.mount(document.body);

    const card = document.querySelector(".card") as HTMLDivElement;
    const scope = engine.getScope(card);
    scope.set("items", [{ label: "one" }, { label: "two" }]);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(card.getAttribute("data-label")).toBe("one");
    const initialEvaluations = evaluations;
    const items = scope.get("items") as Array<{ label: string }>;

    items[1]!.label = "two updated";
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(evaluations).toBe(initialEvaluations);
    expect(card.getAttribute("data-label")).toBe("one");

    items[0]!.label = "one updated";
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(evaluations).toBe(initialEvaluations + 1);
    expect(card.getAttribute("data-label")).toBe("one updated");

    scope.set("selected", 1);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(card.getAttribute("data-label")).toBe("two updated");

    const selectedEvaluations = evaluations;
    items[0]!.label = "ignored";
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(evaluations).toBe(selectedEvaluations);

    items[1]!.label = "two final";
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(evaluations).toBe(selectedEvaluations + 1);
    expect(card.getAttribute("data-label")).toBe("two final");
  });

  it("tracks only the active branch of conditional expressions", async () => {
    document.body.innerHTML = `<div class="card"></div>`;

    let evaluations = 0;
    const engine = new Engine();
    engine.registerGlobal("readValue", (value: string) => {
      evaluations += 1;
      return value;
    });
    engine.registerBehaviors(`
      behavior .card {
        active: false;
        primary: "primary";
        secondary: "secondary";
        @data-value :< readValue(active ? primary : secondary);
      }
    `);
    await engine.mount(document.body);

    const card = document.querySelector(".card") as HTMLDivElement;
    const scope = engine.getScope(card);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(card.getAttribute("data-value")).toBe("secondary");
    const initialEvaluations = evaluations;

    scope.set("primary", "ignored");
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(evaluations).toBe(initialEvaluations);
    expect(card.getAttribute("data-value")).toBe("secondary");

    scope.set("secondary", "updated secondary");
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(evaluations).toBe(initialEvaluations + 1);
    expect(card.getAttribute("data-value")).toBe("updated secondary");

    scope.set("active", true);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(card.getAttribute("data-value")).toBe("ignored");

    const activeEvaluations = evaluations;
    scope.set("secondary", "ignored again");
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(evaluations).toBe(activeEvaluations);

    scope.set("primary", "updated primary");
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(evaluations).toBe(activeEvaluations + 1);
    expect(card.getAttribute("data-value")).toBe("updated primary");
  });
});
