import { useRef, useEffect } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { getHijriDate } from '@/lib/hijri';
import { DayData } from '@/types/worship';
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

const WEEKDAY_SHORT: Record<string, string> = {
  'الاثنين': 'اث',
  'الثلاثاء': 'ثل',
  'الأربعاء': 'أر',
  'الخميس': 'خم',
  'الجمعة': 'جم',
  'السبت': 'سب',
  'الأحد': 'أح',
};

export default function DayNavigation({ selectedDate, onSelectDate, allDays, getDay }: DayNavigationProps) {
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
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
      {/* Today button */}
      {selectedDate !== todayStr && (
        <div className="flex justify-end px-5 pb-1">
          <button
            onClick={scrollToToday}
            className="text-[10px] font-semibold px-3 py-1 rounded-full gradient-primary text-white glow-blue flex items-center gap-1 transition-all duration-200"
          >
            <CalendarDays className="w-3 h-3" />
            اليوم
          </button>
        </div>
      )}

      {/* Day chips */}
      <ScrollArea className="w-full" dir="rtl">
        <div className="flex gap-2 px-5 pb-4 pt-1" dir="rtl">
          {days.map(({ dateStr, hijri, date }) => {
            const isSelected = dateStr === selectedDate;
            const isToday = dateStr === todayStr;
            const dayNameFull = date.toLocaleDateString('ar-EG', { weekday: 'long' });
            const dayShort = WEEKDAY_SHORT[dayNameFull] || dayNameFull.slice(0, 2);
            const dayData = allDays[dateStr];
            const prayerDots = dayData ? getPrayerCompletionStatus(dayData) : [false, false, false, false, false];

            return (
              <button
                key={dateStr}
                ref={isToday ? todayRef : undefined}
                onClick={() => onSelectDate(dateStr)}
                className={cn(
                  'flex flex-col items-center justify-center w-11 h-[5.5rem] transition-all duration-300 shrink-0 relative',
                  'day-card-shape',
                  isSelected
                    ? 'gradient-primary text-white scale-105'
                    : isToday
                    ? 'glass text-primary'
                    : 'bg-white/[0.06] text-foreground/60 hover:bg-white/[0.1]'
                )}
              >
                <span className={cn(
                  "text-[9px] font-medium leading-none",
                  isSelected ? "text-white/80" : "opacity-50"
                )}>{dayShort}</span>
                <span className="text-base font-bold leading-tight mt-0.5">{hijri.day}</span>
                {/* Prayer dots */}
                <div className="flex gap-[3px] mt-1">
                  {prayerDots.map((done, i) => (
                    <div
                      key={i}
                      className={cn(
                        'w-1 h-1 rounded-full transition-all duration-300',
                        done
                          ? isSelected ? 'bg-white' : 'bg-success'
                          : isSelected ? 'bg-white/25' : 'bg-muted-foreground/25'
                      )}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
