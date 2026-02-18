/**
 * useAnalytics — Dashboard data hook.
 *
 * Queries the IndexedDB snapshot collection and returns:
 *   - streak (current + longest)
 *   - weekly / monthly points
 *   - per-prayer completion rates
 *   - consistency score (% days with all 5 prayers done)
 *   - achievements (unlocked flags + progress)
 *
 * All queries run in the background; data is null until resolved.
 */

import { useState, useEffect } from 'react';
import { getAllSnapshots, SnapshotDocument } from '@/lib/db';
import { format, subDays, parseISO, differenceInCalendarDays } from 'date-fns';

// ─── Return shape ─────────────────────────────────────────────────────────────

export interface StreakInfo {
  current: number;
  longest: number;
}

export interface PrayerStats {
  name: string;
  rate: number;      // 0–100 %
  totalDone: number;
  totalDays: number;
}

export interface DailyPointSair {
  date: string;       // YYYY-MM-DD
  points: number;
  max: number;
}

export interface Achievement {
  id: string;
  title_ar: string;
  description_ar: string;
  icon: string;          // lucide icon name key
  unlocked: boolean;
  progress: number;      // 0–100
  threshold: number;     // unit count required
  current: number;       // current unit count
}

export interface AnalyticsData {
  snapshots: SnapshotDocument[];
  streak: StreakInfo;
  consistencyScore: number;          // % of days with all 5 prayers done
  totalPoints: number;
  last7Days: DailyPointSair[];
  last30Days: DailyPointSair[];
  prayerStats: PrayerStats[];
  achievements: Achievement[];
  loading: boolean;
}

// ─── Prayer labels (index matches prayers_done array) ────────────────────────
const PRAYER_NAMES = ['الفجر', 'الظهر', 'العصر', 'المغرب', 'العشاء'];

// ─── Achievement definitions ─────────────────────────────────────────────────
function buildAchievements(
  snaps: SnapshotDocument[],
  streak: StreakInfo,
): Achievement[] {
  const totalPrayersDone = snaps.reduce((s, d) => s + d.prayers_count, 0);
  const perfectDays = snaps.filter(d => d.prayers_count === 5).length;
  const daysWithCustom = snaps.filter(d => d.custom_tasks_done > 0).length;
  const totalPoints = snaps.reduce((s, d) => s + d.points_earned, 0);

  const def = (
    id: string, title_ar: string, description_ar: string,
    icon: string, threshold: number, current: number,
  ): Achievement => ({
    id, title_ar, description_ar, icon, threshold, current,
    unlocked: current >= threshold,
    progress: Math.min(100, Math.round((current / threshold) * 100)),
  });

  return [
    def('first_prayer', 'أول خطوة', 'أكمل أول صلاة', 'Sunrise', 1, totalPrayersDone),
    def('streak_3', 'ثلاثة أيام متتالية', 'حافظ على الصلوات ٣ أيام متتالية', 'Flame', 3, streak.current),
    def('streak_7', 'أسبوع كامل', 'حافظ على الصلوات أسبوعاً كاملاً', 'Flame', 7, streak.longest),
    def('streak_30', 'شهر التميز', 'حافظ على الصلوات ٣٠ يوماً متتالية', 'Trophy', 30, streak.longest),
    def('perfect_day', 'يوم مثالي', 'أكمل جميع الصلوات الخمس في يوم واحد', 'Star', 1, perfectDays),
    def('perfect_10', 'عشرة أيام مثالية', 'أكمل جميع الصلوات في ١٠ أيام', 'Stars', 10, perfectDays),
    def('custom_task', 'منجز', 'أضف مهمة مخصصة وأكملها', 'CheckSquare', 1, daysWithCustom),
    def('points_100', 'مئة نقطة', 'اجمع ١٠٠ نقطة', 'Award', 100, totalPoints),
    def('points_500', 'خمسمائة نقطة', 'اجمع ٥٠٠ نقطة', 'Award', 500, totalPoints),
    def('prayers_50', 'خمسون صلاة', 'أكمل ٥٠ صلاة', 'BookOpen', 50, totalPrayersDone),
  ];
}

// ─── Streak calculator ────────────────────────────────────────────────────────
function calcStreak(snaps: SnapshotDocument[]): StreakInfo {
  if (!snaps.length) return { current: 0, longest: 0 };

  // Sort ascending
  const sorted = [...snaps]
    .filter(s => s.prayers_count > 0)
    .sort((a, b) => a.date_gregorian.localeCompare(b.date_gregorian));

  const today = format(new Date(), 'yyyy-MM-dd');

  let current = 0;
  let longest = 0;
  let run = 0;

  for (let i = 0; i < sorted.length; i++) {
    if (i === 0) { run = 1; }
    else {
      const prev = parseISO(sorted[i - 1].date_gregorian);
      const curr = parseISO(sorted[i].date_gregorian);
      if (differenceInCalendarDays(curr, prev) === 1) { run++; }
      else { run = 1; }
    }
    if (run > longest) longest = run;
  }

  // Current streak: count back from today
  const dateSet = new Set(sorted.map(s => s.date_gregorian));
  let cursor = today;
  while (dateSet.has(cursor)) {
    current++;
    cursor = format(subDays(parseISO(cursor), 1), 'yyyy-MM-dd');
  }

  return { current, longest };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAnalytics(): AnalyticsData {
  const [data, setData] = useState<AnalyticsData>({
    snapshots: [],
    streak: { current: 0, longest: 0 },
    consistencyScore: 0,
    totalPoints: 0,
    last7Days: [],
    last30Days: [],
    prayerStats: [],
    achievements: [],
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;
    getAllSnapshots().then(snaps => {
      if (cancelled) return;

      const streak = calcStreak(snaps);
      const totalPoints = snaps.reduce((s, d) => s + d.points_earned, 0);
      const perfectDays = snaps.filter(d => d.prayers_count === 5).length;
      const consistencyScore = snaps.length
        ? Math.round((perfectDays / snaps.length) * 100) : 0;

      // Per-prayer stats
      const prayerStats: PrayerStats[] = PRAYER_NAMES.map((name, i) => {
        const totalDone = snaps.filter(s => s.prayers_done[i]).length;
        return {
          name, totalDone, totalDays: snaps.length,
          rate: snaps.length ? Math.round((totalDone / snaps.length) * 100) : 0,
        };
      });

      // Build date-keyed map for last N days
      const snapMap = new Map(snaps.map(s => [s.date_gregorian, s]));
      const buildRange = (n: number): DailyPointSair[] =>
        Array.from({ length: n }, (_, i) => {
          const date = format(subDays(new Date(), n - 1 - i), 'yyyy-MM-dd');
          const s = snapMap.get(date);
          return { date, points: s?.points_earned ?? 0, max: s?.points_max ?? 0 };
        });

      const achievements = buildAchievements(snaps, streak);

      setData({
        snapshots: snaps,
        streak, consistencyScore, totalPoints,
        last7Days: buildRange(7),
        last30Days: buildRange(30),
        prayerStats,
        achievements,
        loading: false,
      });
    }).catch(() => {
      if (!cancelled) setData(prev => ({ ...prev, loading: false }));
    });
    return () => { cancelled = true; };
  }, []);

  return data;
}
