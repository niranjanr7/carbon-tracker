import { beforeEach, describe, expect, it, vi } from "vitest";

const { documents, firestore } = vi.hoisted(() => {
  const documents = new Map<string, Record<string, unknown>>();
  const firestore = {
    collection: vi.fn((parent: { path?: string }, name: string) => ({ path: `${parent.path ?? ""}/${name}` })),
    deleteDoc: vi.fn(async (ref: { path: string }) => { documents.delete(ref.path); }),
    doc: vi.fn((parent: { path?: string }, ...segments: string[]) => ({ path: `${parent.path ?? ""}/${segments.join("/")}` })),
    getDoc: vi.fn(async (ref: { path: string }) => ({ data: () => documents.get(ref.path) })),
    getDocs: vi.fn(async (ref: { path: string }) => ({
      docs: [...documents.entries()]
        .filter(([path]) => path.startsWith(`${ref.path}/`))
        .map(([path, data]) => ({ id: path.slice(ref.path.length + 1), data: () => data })),
    })),
    onSnapshot: vi.fn(),
    orderBy: vi.fn(),
    query: vi.fn((ref: unknown) => ref),
    setDoc: vi.fn(async (ref: { path: string }, value: Record<string, unknown>, options?: { merge?: boolean }) => {
      documents.set(ref.path, options?.merge ? { ...documents.get(ref.path), ...value } : value);
    }),
    writeBatch: vi.fn(() => {
      const writes: Array<{ path: string; value: Record<string, unknown> }> = [];
      return {
        set: (ref: { path: string }, value: Record<string, unknown>) => writes.push({ path: ref.path, value }),
        commit: async () => {
          for (const write of writes) documents.set(write.path, write.value);
        },
      };
    }),
  };
  return { documents, firestore };
});

vi.mock("@/lib/firebase", () => ({ db: { path: "" } }));
vi.mock("firebase/firestore", () => firestore);

import { migrateLocalAccountToCloud } from "@/lib/cloud-data";

describe("migrateLocalAccountToCloud", () => {
  beforeEach(() => {
    localStorage.clear();
    documents.clear();
    vi.clearAllMocks();
  });

  it("migrates existing local records, profile, and goals once", async () => {
    localStorage.setItem("carbontracker.user-1.records", JSON.stringify([
      { id: "record-1", date: "2026-11-10", transport: 1, energy: 2, lpg: 3, food: 4 },
    ]));
    localStorage.setItem("carbontracker.user-1.user", JSON.stringify({
      name: "User One", email: "one@example.com", joined: "2026-11-10",
    }));
    localStorage.setItem("carbontracker.user-1.monthlyGoal", "75");

    await migrateLocalAccountToCloud("user-1");

    expect(documents.get("/users/user-1/records/record-1")?.["transport"]).toBe(1);
    expect(documents.get("/users/user-1/settings/account")).toMatchObject({
      profile: { email: "one@example.com" },
      monthlyGoal: 75,
    });

    localStorage.setItem("carbontracker.user-1.records", "[]");
    await migrateLocalAccountToCloud("user-1");

    expect(documents.has("/users/user-1/records/record-1")).toBe(true);
    expect(firestore.writeBatch).toHaveBeenCalledTimes(1);
  });

  it("migrates a different browser's local records even when cloud records already exist", async () => {
    documents.set("/users/user-1/records/cloud-record", { id: "cloud-record", transport: 99 });
    localStorage.setItem("carbontracker.user-1.records", JSON.stringify([
      { id: "browser-record", date: "2026-11-10", transport: 1, energy: 2, lpg: 3, food: 4 },
    ]));

    await migrateLocalAccountToCloud("user-1");

    expect(documents.has("/users/user-1/records/cloud-record")).toBe(true);
    expect(documents.get("/users/user-1/records/browser-record")?.["transport"]).toBe(1);
    expect(localStorage.getItem("carbontracker.user-1.cloudMigrationComplete")).toBe("true");
  });

  it("does not overwrite cloud records with a stale local copy", async () => {
    documents.set("/users/user-1/records/record-1", { id: "record-1", transport: 99 });
    localStorage.setItem("carbontracker.user-1.records", JSON.stringify([
      { id: "record-1", date: "2026-11-10", transport: 1, energy: 2, lpg: 3, food: 4 },
      { id: "record-2", date: "2026-11-11", transport: 5, energy: 6, lpg: 7, food: 8 },
    ]));

    await migrateLocalAccountToCloud("user-1");

    expect(documents.get("/users/user-1/records/record-1")?.["transport"]).toBe(99);
    expect(documents.get("/users/user-1/records/record-2")?.["transport"]).toBe(5);
  });
});
