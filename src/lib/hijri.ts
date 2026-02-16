import { toHijri } from 'hijri-converter';

export function getHijriDate(date: Date): { year: number; month: number; day: number } {
  const result = toHijri(date.getFullYear(), date.getMonth() + 1, date.getDate());
  return { year: result.hy, month: result.hm, day: result.hd };
}
