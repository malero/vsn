import { describe, expect, it } from "vitest";
import type {
  AttributeHandler,
  BehaviorModifierHandler,
  EngineOptions,
  EventBindPatch,
  EventFlagContext,
  FlagApplyContext,
  FlagHandler,
  HydrationOptions,
  RegisteredBehavior
} from "../src";

describe("public extension types", () => {
  it("can type-check extension implementations from the package root", () => {
    const options: EngineOptions = { diagnostics: true };
    const hydration: HydrationOptions = { state: { ready: true } };
    const attribute: AttributeHandler = {
      id: "example",
      match: (name) => name === "vsn-example",
      handle: (_element, _name, _value, _scope) => true
    };
    const flag: FlagHandler = {
      onApply: (context: FlagApplyContext) => {
        void context.element;
      },
      onEventBind: (context: EventFlagContext): EventBindPatch => ({
        options: { passive: Boolean(context.event) }
      })
    };
    const modifier: BehaviorModifierHandler = {
      onBind: ({ behavior }) => {
        const id: RegisteredBehavior["id"] = behavior.id;
        void id;
      }
    };

    expect([options, hydration, attribute, flag, modifier]).toHaveLength(5);
  });
});
