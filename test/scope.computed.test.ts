/* @vitest-environment jsdom */
import { describe, expect, it, vi } from "vitest";

import { computed, effect, Engine, Lifetime, Scope } from "../src";

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("computed state and effects", () => {
  it("memoizes computed values and refreshes dynamic dependencies", () => {
    const scope = new Scope();
    scope.set("state", {
      mode: "active",
      items: [{ visible: true }, { visible: false }]
    });
    let evaluations = 0;
    const visibleCount = computed(scope, (current) => {
      evaluations += 1;
      const mode = current.get("state.mode");
      if (mode !== "active") {
        return 0;
      }
      const items = current.get("state.items") as Array<{ visible: boolean }>;
      return items.filter((item) => item.visible).length;
    });

    expect(evaluations).toBe(0);
    expect(visibleCount.value).toBe(1);
    expect(visibleCount.value).toBe(1);
    expect(evaluations).toBe(1);

    const state = scope.get("state") as { mode: string; items: Array<{ visible: boolean }> };
    state.mode = "inactive";
    expect(visibleCount.value).toBe(0);
    expect(evaluations).toBe(2);

    state.items[0]!.visible = false;
    expect(visibleCount.value).toBe(0);
    expect(evaluations).toBe(2);

    state.mode = "active";
    expect(visibleCount.value).toBe(0);
    expect(evaluations).toBe(3);
  });

  it("runs effects immediately, cleans up before reruns, and can be disposed", () => {
    const scope = new Scope();
    scope.set("value", 1);
    const seen: number[] = [];
    let cleanups = 0;
    const stop = effect(scope, (current) => {
      seen.push(current.get("value"));
      return () => {
        cleanups += 1;
      };
    });

    expect(seen).toEqual([1]);
    expect(cleanups).toBe(0);

    scope.set("value", 2);
    expect(seen).toEqual([1, 2]);
    expect(cleanups).toBe(1);

    stop();
    expect(cleanups).toBe(2);
    scope.set("value", 3);
    expect(seen).toEqual([1, 2]);
    expect(cleanups).toBe(2);
  });

  it("disposes computed values and effects with their lifetime", () => {
    const scope = new Scope();
    const lifetime = new Lifetime();
    scope.set("value", 1);
    let evaluations = 0;
    let runs = 0;
    const doubled = computed(scope, (current) => {
      evaluations += 1;
      return (current.get("value") as number) * 2;
    }, { lifetime });
    effect(scope, (current) => {
      runs += 1;
      doubled.value;
      current.get("value");
    }, { lifetime });

    expect(doubled.value).toBe(2);
    expect(evaluations).toBe(1);
    expect(runs).toBe(1);

    lifetime.dispose();
    scope.set("value", 2);

    expect(doubled.value).toBe(2);
    expect(evaluations).toBe(1);
    expect(runs).toBe(1);
  });

  it("updates named computed state and supports CFS computed/effect helpers", async () => {
    document.body.innerHTML = `<div class="card"></div>`;

    const engine = new Engine();
    const effectRuns = vi.fn();
    engine.registerGlobal("effectRuns", effectRuns);
    engine.registerBehaviors(`
      behavior .card {
        items: [];
        summary: "";
        @data-count :< completedCount;
        @data-summary :< summary;

        construct {
          computed("completedCount", () => items.filter((item) => item.done).length);
          effect(() => {
            summary = completedCount + "/" + items.length;
            effectRuns();
          });
        }
      }
    `);
    await engine.mount(document.body);
    await tick();

    const card = document.querySelector(".card") as HTMLDivElement;
    const scope = engine.getScope(card);
    const initialEffectRuns = effectRuns.mock.calls.length;
    scope.set("items", [{ done: false }, { done: true }]);
    await tick();

    expect(card.getAttribute("data-count")).toBe("1");
    expect(card.getAttribute("data-summary")).toBe("1/2");
    expect(effectRuns).toHaveBeenCalledTimes(initialEffectRuns + 1);

    const items = scope.get("items") as Array<{ done: boolean }>;
    items[0]!.done = true;
    await tick();

    expect(card.getAttribute("data-count")).toBe("2");
    expect(card.getAttribute("data-summary")).toBe("2/2");
    expect(effectRuns).toHaveBeenCalledTimes(initialEffectRuns + 2);
  });
});
