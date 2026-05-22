import { openDB, type DBSchema, type IDBPDatabase } from "idb";

export interface JournalEntry {
  id: string;
  transcript: string;
  summary: string;
  tags: string[];
  mood: "neutral" | "positive" | "reflective" | "urgent";
  audioDurationSec: number;
  recordedAt: string;
  status: "complete" | "pending";
  createdAt: number;
}

interface VoicePWADB extends DBSchema {
  entries: {
    key: string;
    value: JournalEntry;
    indexes: { "by-date": number };
  };
}

let _db: IDBPDatabase<VoicePWADB> | undefined;

async function getDB() {
  if (_db) return _db;
  _db = await openDB<VoicePWADB>("voice-pwa", 1, {
    upgrade(db) {
      const store = db.createObjectStore("entries", { keyPath: "id" });
      store.createIndex("by-date", "createdAt");
    },
  });
  return _db;
}

export async function saveEntry(entry: JournalEntry) {
  return (await getDB()).put("entries", entry);
}

export async function getAllEntries(): Promise<JournalEntry[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex("entries", "by-date");
  return all.reverse();
}

export async function deleteEntry(id: string) {
  return (await getDB()).delete("entries", id);
}

export async function getEntry(id: string): Promise<JournalEntry | undefined> {
  return (await getDB()).get("entries", id);
}

export async function getPendingEntries(): Promise<JournalEntry[]> {
  const all = await getAllEntries();
  return all.filter((e) => e.status === "pending");
}

export async function updateEntryStatus(
  id: string,
  status: "complete" | "pending"
) {
  const db = await getDB();
  const entry = await db.get("entries", id);
  if (entry) {
    await db.put("entries", { ...entry, status });
  }
}
