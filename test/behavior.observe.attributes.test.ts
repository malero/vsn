/* @vitest-environment jsdom */
import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

const tick = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));

describe("behavior selector attribute changes", () => {
  it("binds and unbinds ID and attribute selectors when attributes change", async () => {
    document.body.innerHTML = `
      <div id="id-candidate"></div>
      <div id="attribute-candidate"></div>
    `;

    const engine = new Engine();
    engine.registerBehaviors(`
      behavior #dropdown {
        construct { idMatched = true; }
        destruct { idMatched = false; }
      }

      behavior [data-active] {
        construct { attributeMatched = true; }
        destruct { attributeMatched = false; }
      }
    `);

    await engine.mount(document.body);

    const idCandidate = document.getElementById("id-candidate") as HTMLDivElement;
    const attributeCandidate = document.getElementById("attribute-candidate") as HTMLDivElement;
    const idScope = engine.getScope(idCandidate);
    const attributeScope = engine.getScope(attributeCandidate);

    idCandidate.id = "dropdown";
    attributeCandidate.setAttribute("data-active", "");
    await tick(25);

    expect(idScope.get("idMatched")).toBe(true);
    expect(attributeScope.get("attributeMatched")).toBe(true);

    idCandidate.id = "id-candidate";
    attributeCandidate.removeAttribute("data-active");
    await tick(25);

    expect(idScope.get("idMatched")).toBe(false);
    expect(attributeScope.get("attributeMatched")).toBe(false);
  });
});
