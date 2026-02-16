import { useRef, useEffect } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { getHijriDate } from '@/lib/hijri';
import { HIJRI_MONTHS, DayData } from '@/types/worship';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { CalendarDays } from 'lucide-react';
import { getPrayerCompletionStatus, calculateDayPoints } from '@/lib/points';

interface DayNavigationProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  allDays: Record<string, DayData>;
  getDay: (dateStr: string) => DayData;
}

export default function DayNavigation({ selectedDate, onSelectDate, allDays, getDay }: DayNavigationProps) {
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const hijriToday = getHijriDate(today);
  const todayRef = useRef<HTMLButtonElement>(null);

  // Generate 15 days around today
  const days = Array.from({ length: 15 }, (_, i) => {
    const d = addDays(subDays(today, 7), i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const hijri = getHijriDate(d);
    return { date: d, dateStr, hijri };
  });

  const scrollToToday = () => {
    onSelectDate(todayStr);
    setTimeout(() => {
      todayRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }, 50);
  };

  // Scroll to today on mount
  useEffect(() => {
    todayRef.current?.scrollIntoView({ inline: 'center', block: 'nearest' });
  }, []);

  return (
    <div className="w-full">
      {/* Hijri month header */}
      <div className="flex items-center justify-between py-3 px-4">
        <button
          onClick={scrollToToday}
          className={cn(
            'text-xs font-medium px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5',
            selectedDate === todayStr
              ? 'bg-muted text-muted-foreground'
              : 'bg-primary text-primary-foreground shadow-sm'
          )}
        >
          <CalendarDays className="w-3.5 h-3.5" />
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
            const dayData = allDays[dateStr];
            const prayerDots = dayData ? getPrayerCompletionStatus(dayData) : [false, false, false, false, false];
            const points = dayData ? calculateDayPoints(dayData) : 0;

            return (
              <button
                key={dateStr}
                ref={isToday ? todayRef : undefined}
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
                {/* Prayer dots */}
                <div className="flex gap-1 mt-1">
                  {prayerDots.map((done, i) => (
                    <div
                      key={i}
                      className={cn(
                        'w-1.5 h-1.5 rounded-full transition-colors',
                        done
                          ? isSelected ? 'bg-primary-foreground' : 'bg-primary'
                          : isSelected ? 'bg-primary-foreground/30' : 'bg-muted-foreground/30'
                      )}
                    />
                  ))}
                </div>
                {/* Points */}
                {points > 0 && (
                  <span className={cn(
                    'text-[8px] font-bold mt-0.5',
                    isSelected ? 'text-primary-foreground/80' : 'text-primary/70'
                  )}>
                    {points}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
