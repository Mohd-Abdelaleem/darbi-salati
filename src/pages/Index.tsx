import DayNavigation from '@/components/DayNavigation';
import TimelineView from '@/components/TimelineView';
import { useDayStore } from '@/hooks/use-day-store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { calculateDayPoints, calculateMaxPoints } from '@/lib/points';

const Index = () => {
  const { currentDay, selectedDate, setSelectedDate, updateDay, allDays, getDay } = useDayStore();
  const points = calculateDayPoints(currentDay);
  const maxPoints = calculateMaxPoints(currentDay);

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto" dir="rtl">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm sticky top-0 z-20">
        <DayNavigation
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          allDays={allDays}
          getDay={getDay}
        />
      </header>

      {/* Points counter */}
      <div className="px-4 py-2 bg-card border-b border-border flex items-center justify-between">
        <span className="text-sm font-bold text-primary">{points} / {maxPoints}</span>
        <span className="text-xs text-muted-foreground">نقاط اليوم</span>
      </div>

      {/* Timeline */}
      <ScrollArea className="flex-1">
        <div className="pt-4">
          <TimelineView day={currentDay} onUpdate={updateDay} />
        </div>
      </ScrollArea>
    </div>
  );
};

export default Index;
