import { useState, useCallback, useEffect } from 'react';
import { DayData } from '@/types/worship';
import { generateDefaultDay } from '@/lib/default-day';
import { calculatePrayerTimes, DEFAULT_COORDS } from '@/lib/prayer-times';
import { getHijriDate } from '@/lib/hijri';
import { format } from 'date-fns';

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
  return generateDefaultDay(dateStr, hijri, prayerTimes);
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

  // Persist on change
  useEffect(() => { saveAll(allDays); }, [allDays]);

  const getDay = useCallback((dateStr: string): DayData => {
    return getOrCreateDay(dateStr, allDays, coords);
  }, [allDays, coords]);

  const updateDay = useCallback((day: DayData) => {
    setAllDays(prev => {
      const next = { ...prev, [day.date_gregorian]: day };
      return next;
    });
  }, []);

  const currentDay = getDay(selectedDate);

  // Ensure current day is saved
  useEffect(() => {
    if (!allDays[selectedDate]) {
      updateDay(currentDay);
    }
  }, [selectedDate, allDays, currentDay, updateDay]);

  return { currentDay, selectedDate, setSelectedDate, updateDay, coords, allDays, getDay };
}
