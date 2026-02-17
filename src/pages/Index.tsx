import AppHeader from '@/components/AppHeader';
import AddTaskPill from '@/components/AddTaskPill';
import DayNavigation from '@/components/DayNavigation';
import TimelineView from '@/components/TimelineView';
import { useDayStore } from '@/hooks/use-day-store';
import { ScrollArea } from '@/components/ui/scroll-area';

const Index = () => {
  const { currentDay, selectedDate, setSelectedDate, updateDay, allDays, getDay } = useDayStore();

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto relative" dir="rtl">
      {/* Islamic ornament - top right corner */}
      <div className="fixed top-0 right-0 w-96 h-96 pointer-events-none z-0 opacity-[0.07]">
        <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <g stroke="hsl(217 91% 70%)" strokeWidth="0.7">
            {/* 8-point star pattern */}
            <polygon points="200,40 230,170 360,170 250,240 280,370 200,280 120,370 150,240 40,170 170,170" />
            <polygon points="200,80 220,170 320,170 240,220 260,320 200,260 140,320 160,220 80,170 180,170" />
            <polygon points="200,120 210,170 280,170 230,200 240,270 200,240 160,270 170,200 120,170 190,170" />
            {/* Interlaced lines */}
            <line x1="100" y1="100" x2="300" y2="300" />
            <line x1="300" y1="100" x2="100" y2="300" />
            <line x1="200" y1="50" x2="200" y2="350" />
            <line x1="50" y1="200" x2="350" y2="200" />
            <circle cx="200" cy="200" r="120" />
            <circle cx="200" cy="200" r="80" />
          </g>
        </svg>
      </div>

      {/* Header area */}
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
