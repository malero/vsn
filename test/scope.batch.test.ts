/* @vitest-environment jsdom */
import { describe, expect, it, vi } from "vitest";

import { batch, Engine } from "../src";

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("scope batches", () => {
  it("coalesces multiple scope writes into one reactive evaluation", async () => {
    document.body.innerHTML = `<div class="card"></div>`;
    const format = vi.fn((first: number, second: number) => `${first}:${second}`);

    const engine = new Engine();
    engine.registerGlobal("format", format);
    engine.registerBehaviors(`
      behavior .card {
        first: 0;
        second: 0;
        @data-value :< format(first, second);
      }
    `);
    await engine.mount(document.body);
    await tick();

    const card = document.querySelector(".card") as HTMLDivElement;
    const scope = engine.getScope(card);
    const initialCalls = format.mock.calls.length;

    batch(() => {
      scope.set("first", 1);
      scope.set("second", 2);
    });
    await tick();

    expect(card.getAttribute("data-value")).toBe("1:2");
    expect(format).toHaveBeenCalledTimes(initialCalls + 1);
  });

  it("batches synchronous writes made by CFS event blocks", async () => {
    document.body.innerHTML = `<button class="card"></button>`;
    const format = vi.fn((first: number, second: number) => `${first}:${second}`);

    const engine = new Engine();
    engine.registerGlobal("format", format);
    engine.registerBehaviors(`
      behavior .card {
        first: 0;
        second: 0;
        @data-value :< format(first, second);

        on click() {
          first = 1;
          second = 2;
        }
      }
    `);
    await engine.mount(document.body);
    await tick();

    const card = document.querySelector(".card") as HTMLButtonElement;
    const initialCalls = format.mock.calls.length;
    card.click();
    await tick();

    expect(card.getAttribute("data-value")).toBe("1:2");
    expect(format).toHaveBeenCalledTimes(initialCalls + 1);
  });

  it("exposes batching to CFS and to the engine API", async () => {
    document.body.innerHTML = `<button class="card"></button>`;

    const engine = new Engine();
    engine.registerBehaviors(`
      behavior .card {
        first: 0;
        second: 0;

        on click() {
          batch(() => {
            first = 1;
            second = 2;
          });
        }
      }
    `);
    await engine.mount(document.body);

    const card = document.querySelector(".card") as HTMLButtonElement;
    const scope = engine.getScope(card);
    engine.batch(() => {
      scope.set("first", 3);
      scope.set("second", 4);
    });

    card.click();
    await tick();

    expect(scope.get("first")).toBe(1);
    expect(scope.get("second")).toBe(2);
  });
});
