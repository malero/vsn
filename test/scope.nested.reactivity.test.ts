/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("nested scope reactivity", () => {
  it("reacts when nested object properties are changed directly", async () => {
    document.body.innerHTML = `<div class="card"></div>`;

    const engine = new Engine();
    engine.registerBehaviors(`
      behavior .card {
        @data-name :< user.profile.name;
      }
    `);
    await engine.mount(document.body);

    const card = document.querySelector(".card") as HTMLDivElement;
    const scope = engine.getScope(card);
    scope.set("user", { profile: { name: "Ada" } });
    await tick();

    expect(card.getAttribute("data-name")).toBe("Ada");

    const user = scope.get("user") as { profile: { name: string } };
    user.profile.name = "Grace";
    await tick();

    expect(card.getAttribute("data-name")).toBe("Grace");

    scope.setPath("user.profile", { name: "Lin" });
    await tick();

    expect(card.getAttribute("data-name")).toBe("Lin");
  });

  it("reacts to array mutations and nested item changes", async () => {
    document.body.innerHTML = `<div class="card"></div>`;

    const engine = new Engine();
    engine.registerBehaviors(`
      behavior .card {
        @data-count :< items.length;
        @data-first :< items[0].name;
      }
    `);
    await engine.mount(document.body);

    const card = document.querySelector(".card") as HTMLDivElement;
    const scope = engine.getScope(card);
    scope.set("items", [{ name: "one" }]);
    await tick();

    expect(card.getAttribute("data-count")).toBe("1");
    expect(card.getAttribute("data-first")).toBe("one");

    const items = scope.get("items") as Array<{ name: string }>;
    items.push({ name: "two" });
    await tick();

    expect(card.getAttribute("data-count")).toBe("2");

    items[0]!.name = "updated";
    await tick();

    expect(card.getAttribute("data-first")).toBe("updated");

    items[0] = { name: "replaced" };
    await tick();

    expect(card.getAttribute("data-first")).toBe("replaced");

    items.pop();
    await tick();

    expect(card.getAttribute("data-count")).toBe("1");
  });

  it("tracks array methods called from CFS", async () => {
    document.body.innerHTML = `<button class="card"></button>`;

    const engine = new Engine();
    engine.registerBehaviors(`
      behavior .card {
        @data-count :< items.length;

        on click() {
          items.push("next");
        }
      }
    `);
    await engine.mount(document.body);

    const card = document.querySelector(".card") as HTMLButtonElement;
    const scope = engine.getScope(card);
    scope.set("items", ["first"]);
    await tick();

    card.click();
    await tick();

    expect(scope.get("items")).toEqual(["first", "next"]);
    expect(card.getAttribute("data-count")).toBe("2");
  });
});
