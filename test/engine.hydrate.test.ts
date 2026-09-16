/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

const tick = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));

describe("engine hydration", () => {
  it("seeds root state before behavior initializers and keeps it authoritative", async () => {
    document.body.innerHTML = `
      <main id="app">
        <h1 id="title" vsn-text="title">Server title</h1>
        <input id="name" value="Server name" vsn-bind="name" />
        <button id="increment" vsn-on:click="count += 1;">Increment</button>
      </main>
    `;

    const engine = new Engine();
    engine.registerBehaviors(`
      behavior #app {
        title: "Default title";
        name: "Default name";
        count: 0;
        construct { constructed = true; }
      }
    `);

    const root = document.getElementById("app") as HTMLElement;
    await engine.hydrate(root, {
      state: { title: "Client title", name: "Client name", count: 4 }
    });

    const scope = engine.getScope(root);
    const title = document.getElementById("title") as HTMLHeadingElement;
    const name = document.getElementById("name") as HTMLInputElement;
    const button = document.getElementById("increment") as HTMLButtonElement;

    expect(title.textContent).toBe("Client title");
    expect(name.value).toBe("Client name");
    expect(scope.get("title")).toBe("Client title");
    expect(scope.get("count")).toBe(4);
    expect(scope.get("constructed")).toBe(true);

    button.click();
    expect(scope.get("count")).toBe(5);
  });

  it("preserves SSR values until client state is available", async () => {
    document.body.innerHTML = `
      <main id="app">
        <input id="name" value="Server name" vsn-bind="name" />
        <p id="message" vsn-text="message">Server message</p>
        <section id="panel" vsn-show="visible">Server panel</section>
        <aside id="conditional" vsn-if="open">Server conditional</aside>
      </main>
    `;

    const engine = new Engine();
    const root = document.getElementById("app") as HTMLElement;
    await engine.hydrate(root);

    const input = document.getElementById("name") as HTMLInputElement;
    const message = document.getElementById("message") as HTMLParagraphElement;
    const panel = document.getElementById("panel") as HTMLElement;
    const conditional = document.getElementById("conditional") as HTMLElement;
    const inputScope = engine.getScope(input);
    const rootScope = engine.getScope(root);

    expect(input.value).toBe("Server name");
    expect(inputScope.get("name")).toBe("Server name");
    expect(message.textContent).toBe("Server message");
    expect(panel.hidden).toBe(false);
    expect(conditional.isConnected).toBe(true);

    rootScope.set("message", "Client message");
    rootScope.set("visible", false);
    rootScope.set("open", false);
    await tick();

    expect(message.textContent).toBe("Client message");
    expect(panel.hidden).toBe(true);
    expect(conditional.isConnected).toBe(false);
  });

  it("does not run an initial enter hook for already-rendered conditional DOM", async () => {
    document.body.innerHTML = `
      <main id="app">
        <section id="panel" vsn-if="open" vsn-enter="entered = true;">Server panel</section>
      </main>
    `;

    const engine = new Engine();
    const root = document.getElementById("app") as HTMLElement;
    await engine.hydrate(root, { state: { open: true } });

    const panel = document.getElementById("panel") as HTMLElement;
    expect(engine.getScope(panel).get("entered")).toBeUndefined();

    engine.getScope(root).set("open", false);
    await tick();
    engine.getScope(root).set("open", true);
    await tick();

    expect(engine.getScope(panel).get("entered")).toBe(true);
  });

  it("marks extension hooks that run during hydration", async () => {
    document.body.innerHTML = `<main id="app" vsn-probe="yes"></main>`;

    let attributeHydrating: boolean | undefined;
    let modifierHydrating: boolean | undefined;
    const engine = new Engine();
    engine.registerAttributeHandler({
      id: "vsn-probe",
      match: (name) => name === "vsn-probe",
      handle: (_element, _name, _value, _scope, context) => {
        attributeHydrating = context?.hydrating;
      }
    });
    engine.registerBehaviorModifier("probe", {
      onBind: ({ hydrating }) => {
        modifierHydrating = hydrating;
      }
    });
    engine.registerBehaviors(`behavior #app !probe {}`);

    await engine.hydrate(document.getElementById("app") as HTMLElement);

    expect(attributeHydrating).toBe(true);
    expect(modifierHydrating).toBe(true);
  });
});
