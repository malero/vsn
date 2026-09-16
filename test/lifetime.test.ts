/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine, Lifetime } from "../src";

const tick = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));

describe("lifetimes", () => {
  it("runs disposers once in reverse registration order", () => {
    const lifetime = new Lifetime();
    const calls: string[] = [];

    lifetime.onCleanup(() => calls.push("first"));
    const removeSecond = lifetime.onCleanup(() => calls.push("second"));
    removeSecond();
    lifetime.onCleanup(() => calls.push("third"));

    lifetime.dispose();
    lifetime.dispose();

    expect(calls).toEqual(["third", "first"]);
  });

  it("runs cleanup registered after disposal immediately", () => {
    const lifetime = new Lifetime();
    const calls: string[] = [];

    lifetime.dispose();
    const remove = lifetime.onCleanup(() => calls.push("late"));

    expect(calls).toEqual(["late"]);
    remove();
  });

  it("does not duplicate inline listeners after an unmount and remount", async () => {
    document.body.innerHTML = `
      <button id="button" vsn-on:click="count = count + 1">Click</button>
    `;
    const engine = new Engine();
    await engine.mount(document.body);

    const button = document.getElementById("button") as HTMLButtonElement;
    const scope = engine.getScope(button);
    const initialLifetime = engine.getLifetime(button);
    scope.set("count", 0);

    engine.unmount(button);
    expect(initialLifetime.isDisposed).toBe(true);
    expect(engine.getLifetime(button)).toBe(initialLifetime);
    await engine.mount(document.body);
    expect(engine.getLifetime(button)).not.toBe(initialLifetime);

    button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await tick();

    expect(scope.get("count")).toBe(1);
    engine.dispose();
  });

  it("cleans up behavior modifier resources when a behavior unbinds", async () => {
    document.body.innerHTML = `<div id="card"></div>`;
    const engine = new Engine();
    let eventCalls = 0;
    let cleanupCalls = 0;
    const event = new Event("lifetime-test");

    engine.registerBehaviorModifier("resource", {
      onBind: ({ onCleanup }) => {
        const handler = () => {
          eventCalls += 1;
        };
        window.addEventListener("lifetime-test", handler);
        onCleanup(() => {
          window.removeEventListener("lifetime-test", handler);
          cleanupCalls += 1;
        });
      }
    });
    engine.registerBehaviors(`behavior #card !resource {}`);
    await engine.mount(document.body);

    window.dispatchEvent(event);
    const card = document.getElementById("card") as HTMLDivElement;
    engine.unmount(card);
    window.dispatchEvent(event);

    expect(eventCalls).toBe(1);
    expect(cleanupCalls).toBe(1);
    engine.dispose();
  });

  it("gives custom attributes the element lifetime", async () => {
    document.body.innerHTML = `<div id="node" vsn-resource></div>`;
    const engine = new Engine();
    let eventCalls = 0;

    engine.registerAttributeHandler({
      id: "vsn-resource",
      match: (name) => name === "vsn-resource",
      handle: (element, _name, _value, _scope, context) => {
        const handler = () => {
          eventCalls += 1;
        };
        element.addEventListener("lifetime-attribute", handler);
        context?.onCleanup(() => element.removeEventListener("lifetime-attribute", handler));
      }
    });
    await engine.mount(document.body);

    const node = document.getElementById("node") as HTMLDivElement;
    node.dispatchEvent(new Event("lifetime-attribute"));
    engine.unmount(node);
    node.dispatchEvent(new Event("lifetime-attribute"));

    expect(eventCalls).toBe(1);
    engine.dispose();
  });

  it("lets CFS register cleanup for the current element", async () => {
    document.body.innerHTML = `
      <div id="card" vsn-construct="onCleanup(() => { cleaned = cleaned + 1; });"></div>
    `;
    const engine = new Engine();
    await engine.mount(document.body);
    const card = document.getElementById("card") as HTMLDivElement;
    const scope = engine.getScope(card);
    scope.set("cleaned", 0);

    engine.unmount(card);
    await tick();

    expect(scope.get("cleaned")).toBe(1);
    engine.dispose();
  });

  it("cancels debounced inline handlers when unmounted", async () => {
    document.body.innerHTML = `
      <button id="button" vsn-on:click!debounce(20)="count = count + 1">Click</button>
    `;
    const engine = new Engine();
    await engine.mount(document.body);
    const button = document.getElementById("button") as HTMLButtonElement;
    const scope = engine.getScope(button);
    scope.set("count", 0);

    button.click();
    engine.unmount(button);
    await tick(30);

    expect(scope.get("count")).toBe(0);
    engine.dispose();
  });
});
