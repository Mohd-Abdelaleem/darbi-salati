import {
  Star, CheckCircle, BookOpen, HandHelping, Droplets, Dumbbell, FileText, Building,
  Moon, Sun, Heart, Clock, Flame, Leaf, Eye, type LucideIcon,
} from 'lucide-react';

export interface IconOption {
  value: string; // key name
  label: string; // Arabic label
  Icon: LucideIcon;
}

export const ICON_OPTIONS: IconOption[] = [
  { value: 'star', label: 'نجمة', Icon: Star },
  { value: 'check', label: 'إتمام', Icon: CheckCircle },
  { value: 'book', label: 'قراءة', Icon: BookOpen },
  { value: 'dua', label: 'دعاء', Icon: HandHelping },
  { value: 'water', label: 'ماء', Icon: Droplets },
  { value: 'sport', label: 'رياضة', Icon: Dumbbell },
  { value: 'note', label: 'ملاحظة', Icon: FileText },
  { value: 'mosque', label: 'مسجد', Icon: Building },
  { value: 'moon', label: 'قمر', Icon: Moon },
  { value: 'sun', label: 'شمس', Icon: Sun },
  { value: 'heart', label: 'قلب', Icon: Heart },
  { value: 'clock', label: 'ساعة', Icon: Clock },
  { value: 'flame', label: 'همّة', Icon: Flame },
  { value: 'leaf', label: 'طبيعة', Icon: Leaf },
  { value: 'eye', label: 'تأمل', Icon: Eye },
];

export const ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(
  ICON_OPTIONS.map(o => [o.value, o.Icon])
);

export const COLOR_OPTIONS = [
  { value: 'text-teal-400', bg: 'bg-teal-400', hex: '#2dd4bf' },
  { value: 'text-cyan-400', bg: 'bg-cyan-400', hex: '#22d3ee' },
  { value: 'text-emerald-400', bg: 'bg-emerald-400', hex: '#34d399' },
  { value: 'text-amber-400', bg: 'bg-amber-400', hex: '#fbbf24' },
  { value: 'text-violet-400', bg: 'bg-violet-400', hex: '#a78bfa' },
  { value: 'text-rose-400', bg: 'bg-rose-400', hex: '#fb7185' },
];
