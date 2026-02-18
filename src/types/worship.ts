export type TaskType = 'main_task' | 'secondary_task' | 'regular_task';

export interface ChecklistItem {
  id: string;
  title_ar: string;
  is_done: boolean;
}

export interface Task {
  id: string;
  type: TaskType;
  title_ar: string;
  is_done: boolean;
}

export interface Checkpoint {
  id: string;
  type: 'checkpoint';
  title_ar: string;
  time?: string; // HH:MM
  is_locked: boolean;
  tasks: Task[];
  checklist: ChecklistItem[];
}

export interface StandaloneTask {
  id: string;
  type: TaskType;
  title_ar: string;
  is_done: boolean;
  time?: string;
  customPoints?: number;
  icon?: string;
  color?: string;
  parentCheckpointId?: string;
  isUserCreated?: boolean;
}

export type TimelineItem =
  | { kind: 'checkpoint'; data: Checkpoint }
  | { kind: 'task'; data: StandaloneTask };

export interface PrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

export interface DayData {
  date_gregorian: string; // YYYY-MM-DD
  date_hijri: { year: number; month: number; day: number };
  prayer_times: PrayerTimes;
  timeline: TimelineItem[];
}

export const HIJRI_MONTHS = [
  'محرّم', 'صفر', 'ربيع الأول', 'ربيع الآخر',
  'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
  'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
];
