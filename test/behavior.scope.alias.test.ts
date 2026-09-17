/* @vitest-environment jsdom */
import { describe, expect, it, vi } from "vitest";

import { Engine } from "../src/index";

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("behavior-tree scope aliases and groups", () => {
  it("exposes !as aliases to descendants and keeps !group on the parent scope", async () => {
    document.body.innerHTML = `
      <section class="dialog">
        <button class="panel"></button>
      </section>
    `;

    const engine = new Engine();
    engine.registerBehaviors(`
      behavior .dialog !as(dialog) {
        open: false;
        refreshed: false;
        aliasReady: dialog.open;

        refresh() {
          refreshed = true;
        }

        on click() {
          dialog.open = panels.length > 0;
        }

        behavior .panel !as(panel) !group("panels") {
          active: false;
          aliasReady: panel.active;

          on click() {
            dialog.refresh();
            dialog.open = true;
            panel.active = true;
          }
        }
      }
    `);
    await engine.mount(document.body);

    const dialog = document.querySelector(".dialog") as HTMLElement;
    const panel = document.querySelector(".panel") as HTMLButtonElement;
    const dialogScope = engine.getScope(dialog);
    const panelScope = engine.getScope(panel);

    expect(dialogScope.get("aliasReady")).toBe(false);
    expect(panelScope.get("aliasReady")).toBe(false);
    expect(dialogScope.get("panels")).toHaveLength(1);

    panel.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await tick();

    expect(dialogScope.get("open")).toBe(true);
    expect(dialogScope.get("refreshed")).toBe(true);
    expect(panelScope.get("active")).toBe(true);
  });

  it("creates a group on the exact parent behavior scope", async () => {
    document.body.innerHTML = `
      <div class="outer">
        <section class="dialog">
          <button class="panel"></button>
        </section>
      </div>
    `;

    const engine = new Engine();
    engine.registerBehaviors(`
      behavior .outer {
        panels: ["outer"];

        behavior .dialog {
          behavior .panel !group("panels") { }
        }
      }
    `);
    await engine.mount(document.body);

    const outer = document.querySelector(".outer") as HTMLElement;
    const dialog = document.querySelector(".dialog") as HTMLElement;
    const panel = document.querySelector(".panel") as HTMLElement;

    expect(engine.getScope(outer).get("panels")).toEqual(["outer"]);
    expect(engine.getScope(dialog).get("panels")).toHaveLength(1);

    engine.unmount(panel);
    await tick();

    expect(engine.getScope(dialog).get("panels")).toHaveLength(0);
    expect(engine.getScope(outer).get("panels")).toEqual(["outer"]);
  });

  it("removes an alias when its behavior unbinds", async () => {
    document.body.innerHTML = `<div class="root"><button class="panel"></button></div>`;

    const engine = new Engine();
    engine.registerBehaviors(`
      behavior .root {
        behavior .panel !as(panel) { }
      }
    `);
    await engine.mount(document.body);

    const panel = document.querySelector(".panel") as HTMLButtonElement;
    const scope = engine.getScope(panel);
    expect(scope.get("panel")).toBeDefined();

    panel.classList.remove("panel");
    await new Promise((resolve) => setTimeout(resolve, 25));
    expect(scope.get("panel")).toBeUndefined();

    panel.classList.add("panel");
    await new Promise((resolve) => setTimeout(resolve, 25));
    expect(scope.get("panel")).toBeDefined();
  });

  it("reports aliases that collide with state names", async () => {
    document.body.innerHTML = `<section class="dialog"></section>`;
    const warn = vi.fn();
    const engine = new Engine({ diagnostics: true, logger: { warn } });
    engine.registerBehaviors(`
      behavior .dialog !as(dialog) {
        dialog: false;
      }
    `);

    await expect(engine.mount(document.body)).rejects.toThrow("behavior scope alias 'dialog'");
    expect(warn).toHaveBeenCalledWith("vsn:collision", expect.objectContaining({
      scopeAlias: "dialog"
    }));
  });
});
