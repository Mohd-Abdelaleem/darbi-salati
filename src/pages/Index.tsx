import AppHeader from '@/components/AppHeader';
import AddTaskPill from '@/components/AddTaskPill';
import DayNavigation from '@/components/DayNavigation';
import TimelineView from '@/components/TimelineView';
import { useDayStore } from '@/hooks/use-day-store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { calculateDayPoints, calculateMaxPoints } from '@/lib/points';

const Index = () => {
  const { currentDay, selectedDate, setSelectedDate, updateDay, allDays, getDay } = useDayStore();
  const points = calculateDayPoints(currentDay);
  const maxPoints = calculateMaxPoints(currentDay);
  const progress = maxPoints > 0 ? (points / maxPoints) * 100 : 0;

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto" dir="rtl">
      {/* Header area — no big panel, clean stacked layout */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-white/[0.06]">
        <AppHeader />
        <AddTaskPill />
        <DayNavigation
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          allDays={allDays}
          getDay={getDay}
        />
      </div>

      {/* Points bar */}
      <div className="px-5 py-3 flex items-center gap-3">
        <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full gradient-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-primary">{points}</span>
          <span className="text-xs text-muted-foreground">/ {maxPoints}</span>
        </div>
      </div>

      {/* Timeline */}
      <ScrollArea className="flex-1">
        <div className="pt-2">
          <TimelineView day={currentDay} onUpdate={updateDay} />
        </div>
      </ScrollArea>
    </div>
  );
};

export default Index;
