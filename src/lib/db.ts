/**
 * db.ts — NoSQL document store (Realm-compatible schema) using IndexedDB via idb.
 *
 * Collections (object stores):
 *   days          — one document per calendar day  (PK: date_gregorian)
 *   checkpoints   — one document per checkpoint    (PK: id, index: date)
 *   tasks         — one document per task          (PK: id, index: date, parentCheckpointId)
 *   snapshots     — immutable daily analytics snap (PK: date_gregorian)
 *
 * The schema intentionally mirrors what you would use in MongoDB Realm so
 * the data layer can be swapped to Realm React Native SDK with minimal changes.
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { DayData, Checkpoint, StandaloneTask } from '@/types/worship';
import { calculateDayPoints, calculateMaxPoints, getPrayerCompletionStatus } from '@/lib/points';

// ─── Realm-like document types ──────────────────────────────────────────────

export interface DayDocument {
  /** Primary key — YYYY-MM-DD */
  date_gregorian: string;
  date_hijri: { year: number; month: number; day: number };
  prayer_times: {
    fajr: string;
    sunrise: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
  };
  /** Ordered list of IDs (checkpoints + tasks) for timeline reconstruction */
  timeline_ids: Array<{ kind: 'checkpoint' | 'task'; id: string }>;
  /** ISO timestamp of last mutation */
  updated_at: string;
}

export interface CheckpointDocument {
  id: string;
  /** FK → days.date_gregorian */
  date: string;
  type: 'checkpoint';
  title_ar: string;
  time?: string;
  is_locked: boolean;
  /** Icon key from ICON_MAP */
  icon?: string;
  /** Tailwind color token string */
  color?: string;
  /** true if created by the user (not system-generated) */
  is_user_created: boolean;
  tasks: Array<{
    id: string;
    type: string;
    title_ar: string;
    is_done: boolean;
  }>;
  checklist: Array<{
    id: string;
    title_ar: string;
    is_done: boolean;
  }>;
  updated_at: string;
}

export interface TaskDocument {
  id: string;
  /** FK → days.date_gregorian */
  date: string;
  type: string;
  title_ar: string;
  is_done: boolean;
  time?: string;
  customPoints?: number;
  icon?: string;
  color?: string;
  /** FK → checkpoints.id  (null = standalone) */
  parentCheckpointId?: string;
  is_user_created: boolean;
  updated_at: string;
}

/** Immutable snapshot written at end-of-day or whenever we want to record progress */
export interface SnapshotDocument {
  /** PK — same as day date */
  date_gregorian: string;
  date_hijri: { year: number; month: number; day: number };
  points_earned: number;
  points_max: number;
  /** [fajr, dhuhr, asr, maghrib, isha] */
  prayers_done: boolean[];
  prayers_count: number;
  tasks_total: number;
  tasks_done: number;
  /** user-created tasks completed on this day */
  custom_tasks_done: number;
  created_at: string;
}

// ─── DB schema ───────────────────────────────────────────────────────────────

interface DarbiDB extends DBSchema {
  days: {
    key: string;
    value: DayDocument;
  };
  checkpoints: {
    key: string;
    value: CheckpointDocument;
    indexes: { by_date: string };
  };
  tasks: {
    key: string;
    value: TaskDocument;
    indexes: { by_date: string; by_parent: string };
  };
  snapshots: {
    key: string;
    value: SnapshotDocument;
  };
}

// ─── Singleton DB promise ─────────────────────────────────────────────────────

let _db: IDBPDatabase<DarbiDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<DarbiDB>> {
  if (_db) return _db;
  _db = await openDB<DarbiDB>('darbi-salati-db', 1, {
    upgrade(db) {
      // days
      if (!db.objectStoreNames.contains('days')) {
        db.createObjectStore('days', { keyPath: 'date_gregorian' });
      }
      // checkpoints
      if (!db.objectStoreNames.contains('checkpoints')) {
        const cpStore = db.createObjectStore('checkpoints', { keyPath: 'id' });
        cpStore.createIndex('by_date', 'date');
      }
      // tasks
      if (!db.objectStoreNames.contains('tasks')) {
        const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
        taskStore.createIndex('by_date', 'date');
        taskStore.createIndex('by_parent', 'parentCheckpointId');
      }
      // snapshots
      if (!db.objectStoreNames.contains('snapshots')) {
        db.createObjectStore('snapshots', { keyPath: 'date_gregorian' });
      }
    },
  });
  return _db;
}

// ─── Write helpers ────────────────────────────────────────────────────────────

/**
 * Persist a full DayData object into the three collections atomically.
 * Called every time the day is mutated.
 */
export async function persistDay(day: DayData): Promise<void> {
  const db = await getDB();
  const now = new Date().toISOString();
  const date = day.date_gregorian;

  const timeline_ids: DayDocument['timeline_ids'] = [];
  const checkpointDocs: CheckpointDocument[] = [];
  const taskDocs: TaskDocument[] = [];

  for (const item of day.timeline) {
    if (item.kind === 'checkpoint') {
      const cp = item.data as Checkpoint;
      timeline_ids.push({ kind: 'checkpoint', id: cp.id });
      checkpointDocs.push({
        id: cp.id,
        date,
        type: 'checkpoint',
        title_ar: cp.title_ar,
        time: cp.time,
        is_locked: cp.is_locked,
        icon: (cp as any).icon,
        color: (cp as any).color,
        is_user_created: !cp.is_locked,
        tasks: cp.tasks.map(t => ({ id: t.id, type: t.type, title_ar: t.title_ar, is_done: t.is_done })),
        checklist: cp.checklist.map(cl => ({ id: cl.id, title_ar: cl.title_ar, is_done: cl.is_done })),
        updated_at: now,
      });
    } else {
      const task = item.data as StandaloneTask;
      timeline_ids.push({ kind: 'task', id: task.id });
      taskDocs.push({
        id: task.id,
        date,
        type: task.type,
        title_ar: task.title_ar,
        is_done: task.is_done,
        time: task.time,
        customPoints: task.customPoints,
        icon: task.icon,
        color: task.color,
        parentCheckpointId: task.parentCheckpointId,
        is_user_created: task.isUserCreated ?? false,
        updated_at: now,
      });
    }
  }

  const dayDoc: DayDocument = {
    date_gregorian: date,
    date_hijri: day.date_hijri,
    prayer_times: day.prayer_times,
    timeline_ids,
    updated_at: now,
  };

  // Use a single transaction across all three stores
  const tx = db.transaction(['days', 'checkpoints', 'tasks'], 'readwrite');
  await tx.objectStore('days').put(dayDoc);
  for (const cp of checkpointDocs) await tx.objectStore('checkpoints').put(cp);
  for (const t of taskDocs) await tx.objectStore('tasks').put(t);
  await tx.done;
}

/**
 * Write (or overwrite) a snapshot for analytics.
 */
export async function saveSnapshot(day: DayData): Promise<void> {
  const db = await getDB();
  const prayers = getPrayerCompletionStatus(day);
  const prayersCount = prayers.filter(Boolean).length;

  let tasksTotal = 0;
  let tasksDone = 0;
  let customDone = 0;

  for (const item of day.timeline) {
    if (item.kind === 'task') {
      tasksTotal++;
      if (item.data.is_done) {
        tasksDone++;
        if ((item.data as StandaloneTask).isUserCreated) customDone++;
      }
    } else {
      // Count tasks inside checkpoints
      const cp = item.data as Checkpoint;
      for (const t of cp.tasks) {
        tasksTotal++;
        if (t.is_done) tasksDone++;
      }
    }
  }

  const snap: SnapshotDocument = {
    date_gregorian: day.date_gregorian,
    date_hijri: day.date_hijri,
    points_earned: calculateDayPoints(day),
    points_max: calculateMaxPoints(day),
    prayers_done: prayers,
    prayers_count: prayersCount,
    tasks_total: tasksTotal,
    tasks_done: tasksDone,
    custom_tasks_done: customDone,
    created_at: new Date().toISOString(),
  };

  await db.put('snapshots', snap);
}

// ─── Read helpers ─────────────────────────────────────────────────────────────

export async function getAllSnapshots(): Promise<SnapshotDocument[]> {
  const db = await getDB();
  return db.getAll('snapshots');
}

export async function getSnapshot(date: string): Promise<SnapshotDocument | undefined> {
  const db = await getDB();
  return db.get('snapshots', date);
}

export async function getSnapshotRange(from: string, to: string): Promise<SnapshotDocument[]> {
  const db = await getDB();
  const all = await db.getAll('snapshots');
  return all.filter(s => s.date_gregorian >= from && s.date_gregorian <= to);
}

/** Return all checkpoint documents for a date (useful for per-prayer analytics) */
export async function getCheckpointsForDate(date: string): Promise<CheckpointDocument[]> {
  const db = await getDB();
  return db.getAllFromIndex('checkpoints', 'by_date', date);
}

/** Return all task documents for a date */
export async function getTasksForDate(date: string): Promise<TaskDocument[]> {
  const db = await getDB();
  return db.getAllFromIndex('tasks', 'by_date', date);
}
