import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { CarbonRecord, User } from "@/lib/carbon";

const userDocument = (uid: string) => doc(db, "users", uid);
const settingsDocument = (uid: string) => doc(userDocument(uid), "settings", "account");
const recordsCollection = (uid: string) => collection(userDocument(uid), "records");
const recordDocument = (uid: string, recordId: string) => doc(recordsCollection(uid), recordId);

function isProfile(value: unknown): value is User {
  return typeof value === "object" && value !== null &&
    typeof (value as User).name === "string" &&
    typeof (value as User).email === "string" &&
    typeof (value as User).joined === "string";
}

export function watchRecords(
  uid: string,
  onRecords: (records: CarbonRecord[]) => void,
  onError: (error: Error) => void,
) {
  return onSnapshot(
    query(recordsCollection(uid), orderBy("date", "desc")),
    (snapshot) => onRecords(snapshot.docs.map((record) => ({ ...record.data(), id: record.id }) as CarbonRecord)),
    onError,
  );
}

export function watchAccount(
  uid: string,
  onAccount: (account: { profile?: User; goal?: number; monthlyGoal?: number }) => void,
  onError: (error: Error) => void,
) {
  return onSnapshot(settingsDocument(uid), (snapshot) => {
    const data = snapshot.data() ?? {};
    onAccount({
        ...(isProfile(data["profile"]) ? { profile: data["profile"] } : {}),
        ...(typeof data["goal"] === "number" ? { goal: data["goal"] } : {}),
        ...(typeof data["monthlyGoal"] === "number" ? { monthlyGoal: data["monthlyGoal"] } : {}),
    });
  }, onError);
}

export async function saveCloudRecord(uid: string, record: CarbonRecord) {
  await setDoc(recordDocument(uid, record.id), record);
}

export async function deleteCloudRecord(uid: string, recordId: string) {
  await deleteDoc(recordDocument(uid, recordId));
}

export async function saveCloudAccount(
  uid: string,
  updates: { profile?: User; goal?: number; monthlyGoal?: number },
) {
  await setDoc(settingsDocument(uid), updates, { merge: true });
}

export async function migrateLocalAccountToCloud(uid: string) {
  const settingsRef = settingsDocument(uid);
  const existingSettings = await getDoc(settingsRef);
  const prefix = `carbontracker.${encodeURIComponent(uid)}`;
  const migrationKey = `${prefix}.cloudMigrationComplete`;
  if (localStorage.getItem(migrationKey) === "true") return;

  const rawRecords = localStorage.getItem(`${prefix}.records`);
  const localRecords = rawRecords ? JSON.parse(rawRecords) as CarbonRecord[] : [];
  const cloudRecords = await getDocs(recordsCollection(uid));
  const cloudRecordIds = new Set(cloudRecords.docs.map((record) => record.id));
  const recordsToMigrate = localRecords.filter((record) => !cloudRecordIds.has(record.id));

  if (recordsToMigrate.length) {
    for (let start = 0; start < recordsToMigrate.length; start += 450) {
      const batch = writeBatch(db);
      for (const record of recordsToMigrate.slice(start, start + 450)) {
        batch.set(recordDocument(uid, record.id), record);
      }
      await batch.commit();
    }
  }

  const existingData = existingSettings.data() ?? {};
  const localProfileRaw = localStorage.getItem(`${prefix}.user`);
  const localProfile = localProfileRaw ? JSON.parse(localProfileRaw) as User : undefined;
  const goal = localStorage.getItem(`${prefix}.goal`);
  const monthlyGoal = localStorage.getItem(`${prefix}.monthlyGoal`);

  await setDoc(settingsRef, {
    ...(existingData["profile"] === undefined && localProfile ? { profile: localProfile } : {}),
    ...(existingData["goal"] === undefined && goal !== null ? { goal: Number(goal) } : {}),
    ...(existingData["monthlyGoal"] === undefined && monthlyGoal !== null ? { monthlyGoal: Number(monthlyGoal) } : {}),
  }, { merge: true });
  localStorage.setItem(migrationKey, "true");
}
