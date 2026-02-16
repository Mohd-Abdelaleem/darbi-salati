import { DayData, Checkpoint } from '@/types/worship';

const PRAYER_CHECKPOINTS = ['الفجر', 'الظهر', 'العصر', 'المغرب', 'العشاء'];

export function getPrayerCompletionStatus(day: DayData): boolean[] {
  return PRAYER_CHECKPOINTS.map(name => {
    const cp = day.timeline.find(
      item => item.kind === 'checkpoint' && item.data.title_ar === name
    );
    if (!cp || cp.kind !== 'checkpoint') return false;
    const mainTask = (cp.data as Checkpoint).tasks.find(t => t.type === 'main_task');
    return mainTask?.is_done ?? false;
  });
}

export function calculateDayPoints(day: DayData): number {
  let points = 0;

  for (const item of day.timeline) {
    if (item.kind === 'checkpoint') {
      const cp = item.data as Checkpoint;
      if (!PRAYER_CHECKPOINTS.includes(cp.title_ar)) continue;

      // Main prayer task = 4 points
      const mainTask = cp.tasks.find(t => t.type === 'main_task');
      if (mainTask?.is_done) points += 4;

      // Checklist: جماعة=3, في الوقت=3, أذكار الصلاة=2
      for (const cl of cp.checklist) {
        if (!cl.is_done) continue;
        if (cl.title_ar === 'جماعة') points += 3;
        else if (cl.title_ar === 'في الوقت') points += 3;
        else if (cl.title_ar === 'أذكار الصلاة') points += 2;
      }

      // Other tasks in checkpoint (sunnahs etc) = 5 each
      for (const task of cp.tasks) {
        if (task.type !== 'main_task' && task.is_done) points += 5;
      }
    } else {
      // Standalone tasks = 5 each
      if (item.data.is_done) points += 5;
    }
  }

  return points;
}

export function calculateMaxPoints(day: DayData): number {
  let max = 0;

  for (const item of day.timeline) {
    if (item.kind === 'checkpoint') {
      const cp = item.data as Checkpoint;
      if (!PRAYER_CHECKPOINTS.includes(cp.title_ar)) continue;
      max += 12; // 4 + 3 + 3 + 2
      // Other tasks in checkpoint
      max += cp.tasks.filter(t => t.type !== 'main_task').length * 5;
    } else {
      max += 5;
    }
  }

  return max;
}
