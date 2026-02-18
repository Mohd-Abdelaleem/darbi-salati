import { useState, useCallback, useEffect, useRef } from 'react';
import { DayData } from '@/types/worship';
import { generateDefaultDay } from '@/lib/default-day';
import { calculatePrayerTimes, calculateLastThirdOfNight, DEFAULT_COORDS } from '@/lib/prayer-times';
import { getHijriDate } from '@/lib/hijri';
import { format } from 'date-fns';
import { persistDay, saveSnapshot } from '@/lib/db';

const STORAGE_KEY = 'worship-days';

function loadAll(): Record<string, DayData> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveAll(data: Record<string, DayData>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getOrCreateDay(dateStr: string, all: Record<string, DayData>, coords: { lat: number; lon: number }): DayData {
  if (all[dateStr]) return all[dateStr];
  const date = new Date(dateStr);
  const hijri = getHijriDate(date);
  const prayerTimes = calculatePrayerTimes(date, coords.lat, coords.lon);
  const lastThirdTime = calculateLastThirdOfNight(date, coords.lat, coords.lon);
  return generateDefaultDay(dateStr, hijri, prayerTimes, lastThirdTime);
}

/**
 * Debounce a callback — only fires after `delay` ms of silence.
 */
function useDebounced<T extends (...args: any[]) => void>(fn: T, delay: number): T {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  return useCallback((...args: Parameters<T>) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => fn(...args), delay);
  }, [fn, delay]) as T;
}

export function useDayStore() {
  const [allDays, setAllDays] = useState<Record<string, DayData>>(loadAll);
  const [coords, setCoords] = useState(DEFAULT_COORDS);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // Try geolocation once
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => { /* keep defaults */ }
    );
  }, []);

  // ── Fast path: keep localStorage in sync (synchronous, no flicker) ──────────
  useEffect(() => { saveAll(allDays); }, [allDays]);

  // ── Durable path: persist changed days to IndexedDB (NoSQL / Realm-like) ───
  // We track which dates were mutated so we only write what changed.
  const dirtyDates = useRef<Set<string>>(new Set());

  const flushDirty = useCallback(async () => {
    const dates = Array.from(dirtyDates.current);
    dirtyDates.current.clear();
    // Read the latest allDays snapshot from state via a ref below
    for (const date of dates) {
      const day = latestAllDays.current[date];
      if (day) {
        // Fire-and-forget; errors are non-fatal (localStorage is the fallback)
        persistDay(day).catch(console.warn);
        saveSnapshot(day).catch(console.warn);
      }
    }
  }, []);

  // Keep a ref to the latest allDays so flushDirty closure always sees current data
  const latestAllDays = useRef(allDays);
  useEffect(() => { latestAllDays.current = allDays; }, [allDays]);

  // Debounce IndexedDB writes — only flush 800 ms after the last mutation
  const debouncedFlush = useDebounced(flushDirty, 800);

  const getDay = useCallback((dateStr: string): DayData => {
    return getOrCreateDay(dateStr, allDays, coords);
  }, [allDays, coords]);

  const updateDay = useCallback((day: DayData) => {
    dirtyDates.current.add(day.date_gregorian);
    setAllDays(prev => ({ ...prev, [day.date_gregorian]: day }));
    debouncedFlush();
  }, [debouncedFlush]);

  const currentDay = getDay(selectedDate);

  // Ensure current day is saved (both stores)
  useEffect(() => {
    if (!allDays[selectedDate]) {
      updateDay(currentDay);
    }
  }, [selectedDate, allDays, currentDay, updateDay]);

  return { currentDay, selectedDate, setSelectedDate, updateDay, coords, allDays, getDay };
}
