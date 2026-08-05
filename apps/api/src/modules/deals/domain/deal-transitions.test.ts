import { describe, expect, it } from "vitest";

import { canTransitionDeal, isClosedDealStatus } from "./deal-transitions.js";

describe("deal transitions", () => {
  it("accepts allowed open funnel transitions", () => {
    expect(canTransitionDeal("NEW", "IN_PROGRESS")).toBe(true);
    expect(canTransitionDeal("IN_PROGRESS", "PROPOSAL")).toBe(true);
    expect(canTransitionDeal("PROPOSAL", "WON")).toBe(true);
  });

  it("rejects transitions from closed deals outside reopen", () => {
    expect(canTransitionDeal("WON", "IN_PROGRESS")).toBe(false);
    expect(canTransitionDeal("LOST", "NEW")).toBe(false);
  });

  it("identifies closed statuses", () => {
    expect(isClosedDealStatus("WON")).toBe(true);
    expect(isClosedDealStatus("LOST")).toBe(true);
    expect(isClosedDealStatus("PROPOSAL")).toBe(false);
  });
});
