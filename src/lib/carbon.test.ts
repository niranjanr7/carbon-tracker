import { describe, expect, it } from "vitest";

import {
  dailyElectricityEmissions,
  ecoGradeForMonthlyEmissions,
  monthlyGoalStreak,
  monthlyPerPersonTotals,
} from "@/lib/carbon";

describe("dailyElectricityEmissions", () => {
  it("converts bill units into average daily emissions", () => {
    expect(dailyElectricityEmissions(240, 30)).toBeCloseTo(6.56);
  });

  it("returns zero when the billing period is not positive", () => {
    expect(dailyElectricityEmissions(240, 0)).toBe(0);
  });

  it("calculates monthly emissions per person for shared household energy", () => {
    expect(monthlyPerPersonTotals([
      { id: "1", date: "2026-10-01", transport: 10, energy: 60, lpg: 30, food: 5, householdMembers: 3 },
      { id: "2", date: "2026-10-02", transport: 2, energy: 0, lpg: 0, food: 1 },
    ])).toEqual([{ month: "2026-10", value: 48 }]);
  });

  it("assigns monthly eco grades at the defined per-person thresholds", () => {
    expect(ecoGradeForMonthlyEmissions(99.9)).toBe("A");
    expect(ecoGradeForMonthlyEmissions(100)).toBe("B");
    expect(ecoGradeForMonthlyEmissions(200)).toBe("C");
    expect(ecoGradeForMonthlyEmissions(300)).toBe("D");
    expect(ecoGradeForMonthlyEmissions(400)).toBe("E");
  });

  it("counts only consecutive months at or below the monthly goal", () => {
    expect(monthlyGoalStreak([
      { month: "2026-08", value: 90 },
      { month: "2026-09", value: 95 },
      { month: "2026-10", value: 100 },
      { month: "2026-11", value: 80 },
    ], 100, "2026-11")).toBe(4);
    expect(monthlyGoalStreak([{ month: "2026-11", value: 101 }], 100, "2026-11")).toBe(0);
  });
});
