import { format, addDays, subDays } from 'date-fns';
import { getHijriDate } from '@/lib/hijri';
import { HIJRI_MONTHS } from '@/types/worship';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface DayNavigationProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export default function DayNavigation({ selectedDate, onSelectDate }: DayNavigationProps) {
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const hijriToday = getHijriDate(today);

  // Generate 15 days around today
  const days = Array.from({ length: 15 }, (_, i) => {
    const d = addDays(subDays(today, 7), i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const hijri = getHijriDate(d);
    return { date: d, dateStr, hijri };
  });

  const goToToday = () => onSelectDate(todayStr);

  return (
    <div className="w-full">
      {/* Hijri month header */}
      <div className="flex items-center justify-between py-3 px-4">
        <button
          onClick={goToToday}
          className={cn(
            'text-xs font-medium px-3 py-1 rounded-full transition-colors',
            selectedDate === todayStr
              ? 'bg-muted text-muted-foreground'
              : 'bg-primary text-primary-foreground'
          )}
        >
          اليوم
        </button>
        <h2 className="text-lg font-bold text-foreground">
          {HIJRI_MONTHS[hijriToday.month - 1]} {hijriToday.year} هـ
        </h2>
      </div>

      {/* Day cards */}
      <ScrollArea className="w-full" dir="rtl">
        <div className="flex gap-2 px-4 pb-3" dir="rtl">
          {days.map(({ dateStr, hijri, date }) => {
            const isSelected = dateStr === selectedDate;
            const isToday = dateStr === todayStr;
            const dayName = date.toLocaleDateString('ar-EG', { weekday: 'short' });

            return (
              <button
                key={dateStr}
                onClick={() => onSelectDate(dateStr)}
                className={cn(
                  'flex flex-col items-center min-w-[60px] rounded-xl px-3 py-2 transition-all duration-200',
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-md scale-105'
                    : isToday
                    ? 'bg-primary/10 text-primary'
                    : 'bg-card text-foreground hover:bg-secondary'
                )}
              >
                <span className="text-[10px] font-medium opacity-80">{dayName}</span>
                <span className="text-lg font-bold leading-tight">{hijri.day}</span>
                <span className="text-[9px] opacity-60">
                  {date.getDate()}/{date.getMonth() + 1}
                </span>
              </button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
