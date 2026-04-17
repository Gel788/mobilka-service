import { describe, expect, it } from "vitest";
import { calculateScore, distanceKm } from "../src/ranking";

describe("ranking", () => {
  it("returns non-negative distance for same point", () => {
    expect(distanceKm(43.2, 76.8, 43.2, 76.8)).toBe(0);
  });

  it("prefers better mix of price and eta", () => {
    const lowScore = calculateScore({ bestPrice: 70000, etaMinutes: 120, distanceKm: 4, rating: 4.2 });
    const highScore = calculateScore({ bestPrice: 50000, etaMinutes: 60, distanceKm: 2, rating: 4.8 });
    expect(highScore).toBeGreaterThan(lowScore);
  });
});
