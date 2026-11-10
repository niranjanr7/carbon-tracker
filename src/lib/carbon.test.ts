import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";

import {
  addRecord,
  dailyElectricityEmissions,
  ecoGradeForMonthlyEmissions,
  getMonthlyGoal,
  getUser,
  monthlyGoalStreak,
  monthlyPerPersonTotals,
  migrateLegacyUserData,
  setMonthlyGoal,
  setUser,
  useRecords,
} from "@/lib/carbon";

const { mockAuth, mockCloud } = vi.hoisted(() => ({
  mockAuth: {
    currentUser: null as null | {
      uid: string;
      email: string;
      displayName: string;
      metadata: { creationTime: string };
    },
  },
  mockCloud: {
    saveCloudAccount: vi.fn().mockResolvedValue(undefined),
    saveCloudRecord: vi.fn().mockResolvedValue(undefined),
    deleteCloudRecord: vi.fn().mockResolvedValue(undefined),
    watchAccount: vi.fn(() => () => {}),
    watchRecords: vi.fn(() => () => {}),
  },
}));

vi.mock("@/lib/firebase", () => ({
  auth: { get currentUser() { return mockAuth.currentUser; } },
}));
vi.mock("firebase/auth", () => ({ onAuthStateChanged: () => () => {} }));
vi.mock("@/lib/cloud-data", () => mockCloud);

beforeEach(() => {
  localStorage.clear();
  mockAuth.currentUser = {
    uid: "rakshitha-uid",
    email: "rakshitha@example.com",
    displayName: "Rakshitha",
    metadata: { creationTime: "2026-11-10T00:00:00.000Z" },
  };
});

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

describe("account data storage", () => {
  it("starts a new account with no seeded records", async () => {
    const { result } = renderHook(() => useRecords());

    expect(result.current).toEqual([]);
    await act(async () => addRecord({ date: "2026-11-10", transport: 1, energy: 2, lpg: 3, food: 4 }));
    expect(result.current).toHaveLength(1);
    expect(mockCloud.saveCloudRecord).toHaveBeenCalledWith(
      "rakshitha-uid",
      expect.objectContaining({ date: "2026-11-10" }),
    );
  });

  it("keeps new users' records, profile, and goals separate", async () => {
    await addRecord({ date: "2026-11-10", transport: 1, energy: 2, lpg: 3, food: 4 });
    await setUser({ name: "Rakshitha", email: "rakshitha@example.com", joined: "2026-11-10" });
    await setMonthlyGoal(75);

    const rakshithaRecords = JSON.parse(localStorage.getItem("carbontracker.rakshitha-uid.records") ?? "[]");
    expect(rakshithaRecords).toHaveLength(1);
    expect(getUser().name).toBe("Rakshitha");
    expect(getMonthlyGoal()).toBe(75);

    mockAuth.currentUser = {
      uid: "niranjan-uid",
      email: "niranjan@example.com",
      displayName: "Niranjan",
      metadata: { creationTime: "2025-01-01T00:00:00.000Z" },
    };

    expect(getUser().name).toBe("Niranjan");
    expect(getMonthlyGoal()).toBe(100);
    await addRecord({ date: "2026-11-10", transport: 5, energy: 6, lpg: 7, food: 8 });
    expect(JSON.parse(localStorage.getItem("carbontracker.niranjan-uid.records") ?? "[]")).toHaveLength(1);

    mockAuth.currentUser = {
      uid: "rakshitha-uid",
      email: "rakshitha@example.com",
      displayName: "Rakshitha",
      metadata: { creationTime: "2026-11-10T00:00:00.000Z" },
    };
    expect(JSON.parse(localStorage.getItem("carbontracker.rakshitha-uid.records") ?? "[]")).toHaveLength(1);
  });

  it("migrates existing data only for the matching saved profile", () => {
    localStorage.setItem("carbontracker.user", JSON.stringify({
      name: "Niranjan",
      email: "niranjan@example.com",
      joined: "2025-01-01",
    }));
    localStorage.setItem("carbontracker.records", JSON.stringify([{ id: "legacy" }]));
    localStorage.setItem("carbontracker.monthlyGoalPerPerson", "80");

    migrateLegacyUserData("niranjan-uid", "NIRANJAN@example.com");

    expect(localStorage.getItem("carbontracker.niranjan-uid.records")).toBe('[{"id":"legacy"}]');
    expect(localStorage.getItem("carbontracker.niranjan-uid.monthlyGoal")).toBe("80");
    expect(localStorage.getItem("carbontracker.records")).toBeNull();
    expect(localStorage.getItem("carbontracker.user")).toBeNull();
  });

  it("does not copy legacy data to a different user's account", () => {
    localStorage.setItem("carbontracker.user", JSON.stringify({
      name: "Niranjan",
      email: "niranjan@example.com",
      joined: "2025-01-01",
    }));
    localStorage.setItem("carbontracker.records", JSON.stringify([{ id: "legacy" }]));

    migrateLegacyUserData("rakshitha-uid", "rakshitha@example.com");

    expect(localStorage.getItem("carbontracker.rakshitha-uid.records")).toBeNull();
    expect(localStorage.getItem("carbontracker.records")).toBe('[{"id":"legacy"}]');
  });
});
