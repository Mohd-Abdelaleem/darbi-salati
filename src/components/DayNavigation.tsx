import { useRef, useEffect } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { getHijriDate } from '@/lib/hijri';
import { DayData } from '@/types/worship';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { CalendarDays } from 'lucide-react';
import { getPrayerCompletionStatus } from '@/lib/points';

const DayCardFrame = ({ className, strokeColor = 'currentColor' }: { className?: string; strokeColor?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke={strokeColor}
    strokeWidth={0.85}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    preserveAspectRatio="none"
  >
    <path d="M5 22V11 C5 9.8 6 9.2 7 9.2 C7 7 8.7 5.3 11 5.3 C11.6 4.3 12.1 3.5 12 3.5 C11.9 3.5 12.4 4.3 13 5.3 C15.3 5.3 17 7 17 9.2 C18 9.2 19 9.8 19 11 V22Z" />
    <path d="M5 22H19" />
  </svg>
);

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
                  'relative flex flex-col items-center justify-center w-12 h-[5.8rem] transition-all duration-300 shrink-0',
                  isSelected && 'scale-105'
                )}
              >
                {/* SVG frame background */}
                <DayCardFrame
                  className="absolute inset-0 w-full h-full"
                  strokeColor={
                    isSelected
                      ? 'hsl(var(--primary))'
                      : isToday
                      ? 'hsl(var(--primary) / 0.5)'
                      : 'hsl(var(--muted-foreground) / 0.25)'
                  }
                />
                {/* Selected glow filter */}
                {isSelected && (
                  <div className="absolute inset-0 w-full h-full blur-md opacity-40 pointer-events-none">
                    <DayCardFrame
                      className="w-full h-full"
                      strokeColor="hsl(var(--accent))"
                    />
                  </div>
                )}
                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-center gap-0.5">
                  <span className={cn(
                    "text-[9px] font-medium leading-none",
                    isSelected ? "text-primary-foreground" : "text-muted-foreground"
                  )}>{dayShort}</span>
                  <span className={cn(
                    "text-base font-bold leading-tight",
                    isSelected ? "text-primary-foreground" : isToday ? "text-primary" : "text-foreground/60"
                  )}>{hijri.day}</span>
                  {/* Prayer dots */}
                  <div className="flex gap-[3px] mt-0.5">
                    {prayerDots.map((done, i) => (
                      <div
                        key={i}
                        className={cn(
                          'w-1 h-1 rounded-full transition-all duration-300',
                          done
                            ? isSelected ? 'bg-primary-foreground' : 'bg-success'
                            : isSelected ? 'bg-primary-foreground/25' : 'bg-muted-foreground/25'
                        )}
                      />
                    ))}
                  </div>
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
