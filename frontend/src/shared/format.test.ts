import { describe, expect, it } from "vitest";
import { formatPriceRub } from "./format";

describe("formatPriceRub", () => {
  it("formats with Russian locale and ruble sign", () => {
    expect(formatPriceRub(9900)).toContain("9");
    expect(formatPriceRub(9900)).toContain("₽");
  });
});
