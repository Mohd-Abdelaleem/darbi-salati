import DayNavigation from '@/components/DayNavigation';
import TimelineView from '@/components/TimelineView';
import { useDayStore } from '@/hooks/use-day-store';
import { ScrollArea } from '@/components/ui/scroll-area';

const Index = () => {
  const { currentDay, selectedDate, setSelectedDate, updateDay } = useDayStore();

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto" dir="rtl">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm sticky top-0 z-20">
        <DayNavigation selectedDate={selectedDate} onSelectDate={setSelectedDate} />
      </header>

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
