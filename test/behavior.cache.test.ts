import { describe, expect, it } from "vitest";

import { Engine } from "../src/index";

describe("behavior AST cache", () => {
  it("reuses cache entries for identical behaviors", () => {
    const source = `
      behavior .card {
        count: 1;
        on click() { count = count + 1; }
      }
    `;

    const engine = new Engine();
    engine.registerBehaviors(source);
    engine.registerBehaviors(source);

    const stats = engine.getRegistryStats();
    expect(stats.behaviorCacheSize).toBe(1);
    expect(stats.behaviorCount).toBe(1);
  });

  it("adds cache entries for distinct behaviors", () => {
    const first = `
      behavior .card {
        count: 1;
      }
    `;
    const second = `
      behavior .card {
        count: 2;
      }
    `;

    const engine = new Engine();
    engine.registerBehaviors(first);
    engine.registerBehaviors(second);

    const stats = engine.getRegistryStats();
    expect(stats.behaviorCacheSize).toBe(2);
  });
});
