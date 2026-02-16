import { Coordinates, CalculationMethod, PrayerTimes as AdhanPrayerTimes } from 'adhan';
import type { PrayerTimes } from '@/types/worship';

function fmt(d: Date): string {
  return d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function calculatePrayerTimes(date: Date, lat: number, lon: number): PrayerTimes {
  const coords = new Coordinates(lat, lon);
  const params = CalculationMethod.UmmAlQura();
  const pt = new AdhanPrayerTimes(coords, date, params);

  return {
    fajr: fmt(pt.fajr),
    sunrise: fmt(pt.sunrise),
    dhuhr: fmt(pt.dhuhr),
    asr: fmt(pt.asr),
    maghrib: fmt(pt.maghrib),
    isha: fmt(pt.isha),
  };
}

// Default: Mecca
export const DEFAULT_COORDS = { lat: 21.4225, lon: 39.8262 };
