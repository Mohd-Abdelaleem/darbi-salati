import { Checkpoint, ChecklistItem, DayData, PrayerTimes, StandaloneTask, Task, TimelineItem } from '@/types/worship';

let _id = 0;
const uid = (prefix: string) => `${prefix}-${++_id}-${Date.now().toString(36)}`;

const prayerChecklist = (): ChecklistItem[] => [
  { id: uid('cl'), title_ar: 'جماعة', is_done: false },
  { id: uid('cl'), title_ar: 'في الوقت', is_done: false },
  { id: uid('cl'), title_ar: 'أذكار الصلاة', is_done: false },
];

function makePrayerCheckpoint(
  title: string,
  time: string,
  mainTitle: string,
  sunnahTasks: { title: string; type: 'secondary_task' | 'regular_task' }[] = []
): Checkpoint {
  const tasks: Task[] = [
    { id: uid('t'), type: 'main_task', title_ar: mainTitle, is_done: false },
    ...sunnahTasks.map(s => ({
      id: uid('t'),
      type: s.type as Task['type'],
      title_ar: s.title,
      is_done: false,
    })),
  ];
  return {
    id: uid('cp'),
    type: 'checkpoint',
    title_ar: title,
    time,
    is_locked: true,
    tasks,
    checklist: prayerChecklist(),
  };
}

export function generateDefaultDay(dateGregorian: string, hijri: { year: number; month: number; day: number }, prayerTimes: PrayerTimes): DayData {
  _id = 0;

  const timeline: TimelineItem[] = [
    // السحور
    { kind: 'task', data: { id: uid('st'), type: 'regular_task', title_ar: 'السحور', is_done: false } as StandaloneTask },

    // الفجر
    { kind: 'checkpoint', data: makePrayerCheckpoint('الفجر', prayerTimes.fajr, 'صلاة الفجر', [
      { title: 'سنة الفجر (ركعتان)', type: 'secondary_task' },
    ]) },

    // أذكار الصباح
    { kind: 'task', data: { id: uid('st'), type: 'regular_task', title_ar: 'أذكار الصباح', is_done: false } as StandaloneTask },

    // الشروق
    { kind: 'checkpoint', data: {
      id: uid('cp'),
      type: 'checkpoint',
      title_ar: 'الشروق',
      time: prayerTimes.sunrise,
      is_locked: false,
      tasks: [],
      checklist: [],
    } },

    // الضحى
    { kind: 'task', data: { id: uid('st'), type: 'secondary_task', title_ar: 'الضحى', is_done: false } as StandaloneTask },

    // الظهر
    { kind: 'checkpoint', data: makePrayerCheckpoint('الظهر', prayerTimes.dhuhr, 'صلاة الظهر', [
      { title: 'سنة قبل الظهر (٤ ركعات)', type: 'secondary_task' },
      { title: 'سنة بعد الظهر (ركعتان)', type: 'secondary_task' },
    ]) },

    // سنة قبل العصر (regular task before Asr)
    { kind: 'task', data: { id: uid('st'), type: 'regular_task', title_ar: 'سنة قبل العصر (٤ ركعات)', is_done: false } as StandaloneTask },

    // العصر
    { kind: 'checkpoint', data: makePrayerCheckpoint('العصر', prayerTimes.asr, 'صلاة العصر') },

    // أذكار المساء
    { kind: 'task', data: { id: uid('st'), type: 'regular_task', title_ar: 'أذكار المساء', is_done: false } as StandaloneTask },

    // المغرب
    { kind: 'checkpoint', data: makePrayerCheckpoint('المغرب', prayerTimes.maghrib, 'صلاة المغرب', [
      { title: 'سنة بعد المغرب (ركعتان)', type: 'secondary_task' },
    ]) },

    // العشاء
    { kind: 'checkpoint', data: makePrayerCheckpoint('العشاء', prayerTimes.isha, 'صلاة العشاء', [
      { title: 'سنة بعد العشاء (ركعتان)', type: 'secondary_task' },
    ]) },

    // القيام / التهجد / الوتر
    { kind: 'task', data: { id: uid('st'), type: 'secondary_task', title_ar: 'القيام', is_done: false } as StandaloneTask },
    { kind: 'task', data: { id: uid('st'), type: 'secondary_task', title_ar: 'التهجد', is_done: false } as StandaloneTask },
    { kind: 'task', data: { id: uid('st'), type: 'secondary_task', title_ar: 'الوتر', is_done: false } as StandaloneTask },
  ];

  return {
    date_gregorian: dateGregorian,
    date_hijri: hijri,
    prayer_times: prayerTimes,
    timeline,
  };
}
