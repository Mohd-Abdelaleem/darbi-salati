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

  useEffect(() => {
    todayRef.current?.scrollIntoView({ inline: 'center', block: 'nearest' });
  }, []);

  return (
    <div className="w-full">
      {/* Hijri month header */}
      <div className="flex items-center justify-between py-4 px-5">
        <button
          onClick={scrollToToday}
          className={cn(
            'text-xs font-semibold px-4 py-2 rounded-full transition-all duration-200 flex items-center gap-1.5',
            selectedDate === todayStr
              ? 'glass text-muted-foreground'
              : 'gradient-primary text-white glow-blue'
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
        <div className="flex gap-3 px-5 pb-5" dir="rtl">
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
                  'flex flex-col items-center min-w-[68px] rounded-2xl px-3 py-3.5 transition-all duration-200',
                  isSelected
                    ? 'gradient-primary text-white glow-blue scale-105'
                    : isToday
                    ? 'glass text-primary'
                    : 'glass text-foreground/70 glass-hover'
                )}
              >
                <span className={cn(
                  "text-[10px] font-medium",
                  isSelected ? "text-white/80" : "opacity-60"
                )}>{dayName}</span>
                <span className="text-xl font-bold leading-tight">{hijri.day}</span>
                <span className={cn(
                  "text-[9px]",
                  isSelected ? "text-white/60" : "opacity-40"
                )}>
                  {date.getDate()}/{date.getMonth() + 1}
                </span>
                {/* Prayer dots */}
                <div className="flex gap-1.5 mt-1.5">
                  {prayerDots.map((done, i) => (
                    <div
                      key={i}
                      className={cn(
                        'w-1.5 h-1.5 rounded-full transition-all duration-300',
                        done
                          ? isSelected ? 'bg-white glow-green' : 'bg-success glow-green'
                          : isSelected ? 'bg-white/25' : 'bg-muted-foreground/25'
                      )}
                    />
                  ))}
                </div>
                {points > 0 && (
                  <span className={cn(
                    'text-[8px] font-bold mt-1',
                    isSelected ? 'text-white/70' : 'text-primary/60'
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
