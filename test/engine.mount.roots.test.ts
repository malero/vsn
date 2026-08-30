/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

const tick = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));

describe("engine mounted roots", () => {
  it("observes every root mounted on the same engine", async () => {
    document.body.innerHTML = `
      <section id="first-root"></section>
      <section id="second-root"></section>
    `;

    const engine = new Engine();
    engine.registerBehaviors(`
      behavior .card {
        construct { ready = true; }
      }
    `);

    const firstRoot = document.getElementById("first-root") as HTMLElement;
    const secondRoot = document.getElementById("second-root") as HTMLElement;
    await engine.mount(firstRoot);
    await engine.mount(secondRoot);

    const card = document.createElement("div");
    card.className = "card";
    secondRoot.append(card);
    await tick(25);

    expect(engine.getScope(card).get("ready")).toBe(true);
  });

  it("keeps remaining roots observed when one root is unmounted", async () => {
    document.body.innerHTML = `
      <section id="first-root"></section>
      <section id="second-root"></section>
    `;

    const engine = new Engine();
    engine.registerBehaviors(`
      behavior .card {
        construct { ready = true; }
      }
    `);

    const firstRoot = document.getElementById("first-root") as HTMLElement;
    const secondRoot = document.getElementById("second-root") as HTMLElement;
    await engine.mount(firstRoot);
    await engine.mount(secondRoot);
    engine.unmount(firstRoot);

    const card = document.createElement("div");
    card.className = "card";
    secondRoot.append(card);
    await tick(25);

    expect(engine.getScope(card).get("ready")).toBe(true);
  });

  it("tears down behavior resources when another engine takes over the document", async () => {
    document.body.innerHTML = `
      <section id="first-root"><button class="card"></button></section>
      <section id="second-root"></section>
    `;

    const firstEngine = new Engine();
    firstEngine.registerBehaviors(`
      behavior .card {
        clicks: 0;
        on click() { clicks += 1; }
      }
    `);
    const firstRoot = document.getElementById("first-root") as HTMLElement;
    await firstEngine.mount(firstRoot);

    const secondEngine = new Engine();
    const secondRoot = document.getElementById("second-root") as HTMLElement;
    await secondEngine.mount(secondRoot);

    const card = firstRoot.querySelector(".card") as HTMLButtonElement;
    const scope = firstEngine.getScope(card);
    card.click();
    await tick();

    expect(scope.get("clicks")).toBe(0);
  });
});
