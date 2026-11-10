import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

export type CarbonRecord = {
  id: string;
  date: string; // yyyy-mm-dd
  transport: number;
  energy: number;
  lpg: number;
  food: number;
  householdMembers?: number;
};

export const FACTORS = {
  transport: { Car: { Petrol: 0.212, Diesel: 0.171, CNG: 0.16, Electric: 0.05 }, Bus: 0.089, Train: 0.041, Bike: 0.11, Bicycle: 0 } as const,
  electricityPerKwh: 0.82,
  lpgPerKg: 2.98,
  food: { Vegan: 1.5, Vegetarian: 1.7, Mixed: 2.5, "Heavy meat": 3.3 } as const,
};

export const dailyElectricityEmissions = (units: number, billingDays: number) =>
  billingDays > 0 ? (units / billingDays) * FACTORS.electricityPerKwh : 0;

export const totalOf = (r: CarbonRecord) => +(r.transport + r.energy + r.lpg + r.food).toFixed(2);

export type MonthlyPerPersonTotal = { month: string; value: number };
export type EcoGrade = "A" | "B" | "C" | "D" | "E";

export function monthlyPerPersonTotals(records: CarbonRecord[]): MonthlyPerPersonTotal[] {
  const totals = new Map<string, number>();
  for (const record of records) {
    const householdMembers = Math.max(1, Math.floor(record.householdMembers ?? 1));
    const perPerson =
      record.transport + record.food + (record.energy + record.lpg) / householdMembers;
    const month = record.date.slice(0, 7);
    totals.set(month, (totals.get(month) ?? 0) + perPerson);
  }
  return [...totals.entries()]
    .map(([month, value]) => ({ month, value: +value.toFixed(1) }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

export function ecoGradeForMonthlyEmissions(kgPerPerson: number): EcoGrade {
  if (kgPerPerson < 100) return "A";
  if (kgPerPerson < 200) return "B";
  if (kgPerPerson < 300) return "C";
  if (kgPerPerson < 400) return "D";
  return "E";
}

export function monthlyGoalStreak(
  monthlyTotals: MonthlyPerPersonTotal[],
  goal: number,
  currentMonth: string,
): number {
  const totals = new Map(monthlyTotals.map(({ month, value }) => [month, value]));
  let streak = 0;
  const monthDate = new Date(`${currentMonth}-01T00:00:00`);

  while (true) {
    const month = monthDate.toISOString().slice(0, 7);
    const total = totals.get(month);
    if (total === undefined || total > goal) return streak;
    streak += 1;
    monthDate.setUTCMonth(monthDate.getUTCMonth() - 1);
  }
}

const LEGACY_KEYS = {
  records: "carbontracker.records",
  user: "carbontracker.user",
  goal: "carbontracker.goal",
  monthlyGoal: "carbontracker.monthlyGoalPerPerson",
};
type DataKey = keyof typeof LEGACY_KEYS;
const accountKey = (uid: string, key: DataKey) => `carbontracker.${encodeURIComponent(uid)}.${key}`;
const listeners = new Set<() => void>();
const EMPTY: CarbonRecord[] = [];
const EMPTY_USER: User = { name: "", email: "", joined: "" };

function load(): CarbonRecord[] {
  const uid = auth.currentUser?.uid;
  if (typeof window === "undefined" || !uid) return EMPTY;
  const raw = localStorage.getItem(accountKey(uid, "records"));
  return raw ? JSON.parse(raw) as CarbonRecord[] : EMPTY;
}
function save(next: CarbonRecord[]) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Cannot save carbon records without a signed-in user.");
  localStorage.setItem(accountKey(uid, "records"), JSON.stringify([...next].sort((a, b) => b.date.localeCompare(a.date))));
  listeners.forEach((l) => l());
}

export function useRecords() {
  const [recs, setRecs] = useState<CarbonRecord[]>(EMPTY);
  useEffect(() => {
    const l = () => setRecs(load());
    l();
    listeners.add(l);
    const unsubscribe = onAuthStateChanged(auth, l);
    window.addEventListener("storage", l);
    return () => {
      listeners.delete(l);
      unsubscribe();
      window.removeEventListener("storage", l);
    };
  }, []);
  return recs;
}
export function useUser() {
  const [u, setU] = useState<User>(EMPTY_USER);
  useEffect(() => {
    const l = () => setU(getUser());
    l();
    listeners.add(l);
    const unsubscribe = onAuthStateChanged(auth, l);
    return () => {
      listeners.delete(l);
      unsubscribe();
    };
  }, []);
  return u;
}
export const addRecord = (r: Omit<CarbonRecord, "id">) => save([{ ...r, id: crypto.randomUUID() }, ...load()]);
export const deleteRecord = (id: string) => save(load().filter((r) => r.id !== id));

export type User = { name: string; email: string; joined: string };
export function getUser(): User {
  const firebaseUser = auth.currentUser;
  if (typeof window === "undefined" || !firebaseUser) return EMPTY_USER;
  const raw = localStorage.getItem(accountKey(firebaseUser.uid, "user"));
  return raw
    ? JSON.parse(raw) as User
    : {
        name: firebaseUser.displayName ?? firebaseUser.email?.split("@")[0] ?? "",
        email: firebaseUser.email ?? "",
        joined: firebaseUser.metadata.creationTime?.slice(0, 10) ?? "",
      };
}
export const setUser = (u: User) => {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Cannot save a profile without a signed-in user.");
  localStorage.setItem(accountKey(uid, "user"), JSON.stringify(u));
  listeners.forEach((l) => l());
};

export function migrateLegacyUserData(uid: string, email: string) {
  if (typeof window === "undefined") return;
  const legacyProfile = localStorage.getItem(LEGACY_KEYS.user);
  if (!legacyProfile) return;

  const legacyUser = JSON.parse(legacyProfile) as User;
  if (legacyUser.email.trim().toLowerCase() !== email.trim().toLowerCase()) return;

  for (const key of Object.keys(LEGACY_KEYS) as DataKey[]) {
    const legacyValue = localStorage.getItem(LEGACY_KEYS[key]);
    const destinationKey = accountKey(uid, key);
    if (legacyValue !== null && localStorage.getItem(destinationKey) === null) {
      localStorage.setItem(destinationKey, legacyValue);
    }
    localStorage.removeItem(LEGACY_KEYS[key]);
  }
}

function readGoal(key: "goal" | "monthlyGoal", fallback: number) {
  const uid = auth.currentUser?.uid;
  if (typeof window === "undefined" || !uid) return fallback;
  const value = localStorage.getItem(accountKey(uid, key));
  return value === null ? fallback : Number(value);
}
function setGoalValue(key: "goal" | "monthlyGoal", value: number) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Cannot save goals without a signed-in user.");
  localStorage.setItem(accountKey(uid, key), String(value));
}
export const getGoal = () => readGoal("goal", 20);
export const setGoal = (g: number) => setGoalValue("goal", g);
export const getMonthlyGoal = () => readGoal("monthlyGoal", 100);
export const setMonthlyGoal = (g: number) => setGoalValue("monthlyGoal", g);

export function stats(records: CarbonRecord[]) {
  const now = new Date();
  const ym = now.toISOString().slice(0, 7);
  const last = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 7);
  const sum = (rs: CarbonRecord[]) => +rs.reduce((a, r) => a + totalOf(r), 0).toFixed(1);
  const thisMonth = sum(records.filter((r) => r.date.startsWith(ym)));
  const lastMonth = sum(records.filter((r) => r.date.startsWith(last)));
  const cats = {
    Transport: records.reduce((a, r) => a + r.transport, 0),
    Energy: records.reduce((a, r) => a + r.energy, 0),
    LPG: records.reduce((a, r) => a + r.lpg, 0),
    Food: records.reduce((a, r) => a + r.food, 0),
  };
  const all = Object.values(cats).reduce((a, b) => a + b, 0) || 1;
  const breakdown = Object.entries(cats).map(([name, v]) => ({ name, value: +v.toFixed(1), pct: Math.round((v / all) * 100) }));
  const top = [...breakdown].sort((a, b) => b.value - a.value)[0];
  const latest = records[0] ? totalOf(records[0]) : 0;
  const change = lastMonth ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : 0;
  const avgDaily = records.length ? sum(records) / records.length : 0;
  const score = Math.max(0, Math.min(100, Math.round(100 - (avgDaily - 5) * 6)));
  const monthly: { month: string; value: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const k = d.toISOString().slice(0, 7);
    monthly.push({ month: d.toLocaleString("en", { month: "short" }), value: sum(records.filter((r) => r.date.startsWith(k))) });
  }
  const daily = records.slice(0, 7).reverse().map((r) => ({ day: new Date(r.date).toLocaleString("en", { weekday: "short" }), value: totalOf(r) }));
  return { thisMonth, lastMonth, change, breakdown, top, latest, score, monthly, daily, total: sum(records) };
}
