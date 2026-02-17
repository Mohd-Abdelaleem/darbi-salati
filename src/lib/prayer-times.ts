import { Coordinates, CalculationMethod, PrayerTimes as AdhanPrayerTimes } from 'adhan';
import type { PrayerTimes } from '@/types/worship';

function fmt(d: Date): string {
  return d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true });
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

/**
 * Calculate the start of the last third of the night.
 * Night = Maghrib(today) → Fajr(tomorrow)
 * LastThirdStart = Fajr(tomorrow) - NightDuration / 3
 */
export function calculateLastThirdOfNight(date: Date, lat: number, lon: number): string {
  const coords = new Coordinates(lat, lon);
  const params = CalculationMethod.UmmAlQura();

  const today = new AdhanPrayerTimes(coords, date, params);
  const tomorrow = new Date(date);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextDay = new AdhanPrayerTimes(coords, tomorrow, params);

  const maghribMs = today.maghrib.getTime();
  const fajrNextMs = nextDay.fajr.getTime();
  const nightDuration = fajrNextMs - maghribMs;
  const lastThirdStart = new Date(fajrNextMs - nightDuration / 3);

  return fmt(lastThirdStart);
}

// Default: Mecca
export const DEFAULT_COORDS = { lat: 21.4225, lon: 39.8262 };
