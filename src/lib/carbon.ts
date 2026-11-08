import { useEffect, useState } from "react";

export type CarbonRecord = {
  id: string;
  date: string; // yyyy-mm-dd
  transport: number;
  energy: number;
  lpg: number;
  food: number;
};

export const FACTORS = {
  transport: { Car: { Petrol: 0.212, Diesel: 0.171, CNG: 0.16, Electric: 0.05 }, Bus: 0.089, Train: 0.041, Bike: 0.11, Bicycle: 0 } as const,
  electricityPerKwh: 0.82,
  lpgPerKg: 2.98,
  food: { Vegan: 1.5, Vegetarian: 1.7, Mixed: 2.5, "Heavy meat": 3.3 } as const,
};

export const totalOf = (r: CarbonRecord) => +(r.transport + r.energy + r.lpg + r.food).toFixed(2);

const KEY = "carbontracker.records";
const USER_KEY = "carbontracker.user";
const GOAL_KEY = "carbontracker.goal";

function seed(): CarbonRecord[] {
  const out: CarbonRecord[] = [];
  const today = new Date();
  for (let i = 0; i < 180; i += 3) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const s = Math.sin(i) * 0.5 + 1;
    out.push({
      id: crypto.randomUUID(),
      date: d.toISOString().slice(0, 10),
      transport: +(4 * s + 1).toFixed(1),
      energy: +(3 + Math.cos(i) * 0.6).toFixed(1),
      lpg: +(1.4 + Math.sin(i / 2) * 0.3).toFixed(1),
      food: +(2.5 + Math.cos(i / 3) * 0.6).toFixed(1),
    });
  }
  return out;
}

let cache: CarbonRecord[] | null = null;
const listeners = new Set<() => void>();
const EMPTY: CarbonRecord[] = [];

function load(): CarbonRecord[] {
  if (typeof window === "undefined") return EMPTY;
  if (cache) return cache;
  const raw = localStorage.getItem(KEY);
  cache = raw ? JSON.parse(raw) : seed();
  if (!raw) localStorage.setItem(KEY, JSON.stringify(cache));
  return cache!;
}
function save(next: CarbonRecord[]) {
  cache = [...next].sort((a, b) => b.date.localeCompare(a.date));
  localStorage.setItem(KEY, JSON.stringify(cache));
  listeners.forEach((l) => l());
}

export function useRecords() {
  const [recs, setRecs] = useState<CarbonRecord[]>(EMPTY);
  useEffect(() => {
    const l = () => setRecs(load());
    l();
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);
  return recs;
}
export function useUser() {
  const [u, setU] = useState<User>({ name: "", email: "", joined: "" });
  useEffect(() => setU(getUser()), []);
  return u;
}
export const addRecord = (r: Omit<CarbonRecord, "id">) => save([{ ...r, id: crypto.randomUUID() }, ...load()]);
export const deleteRecord = (id: string) => save(load().filter((r) => r.id !== id));

export type User = { name: string; email: string; joined: string };
export function getUser(): User {
  if (typeof window === "undefined") return { name: "Guest", email: "", joined: "" };
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : { name: "Priya Sharma", email: "priya@example.com", joined: new Date().toISOString().slice(0, 10) };
}
export const setUser = (u: User) => localStorage.setItem(USER_KEY, JSON.stringify(u));
export const getGoal = () => (typeof window === "undefined" ? 20 : Number(localStorage.getItem(GOAL_KEY) ?? 20));
export const setGoal = (g: number) => localStorage.setItem(GOAL_KEY, String(g));

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
