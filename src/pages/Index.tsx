import islamicBg from '@/assets/islamic-bg.png';
import AppHeader from '@/components/AppHeader';
import AddTaskPill from '@/components/AddTaskPill';
import DayNavigation from '@/components/DayNavigation';
import TimelineView from '@/components/TimelineView';
import PointsBadge from '@/components/PointsBadge';
import { useDayStore } from '@/hooks/use-day-store';
import { ScrollArea } from '@/components/ui/scroll-area';

const Index = () => {
  const { currentDay, selectedDate, setSelectedDate, updateDay, allDays, getDay } = useDayStore();

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto relative" dir="rtl">
      {/* Islamic ornament background */}
      <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center">
        <img src={islamicBg} alt="" className="w-full h-full object-cover opacity-[0.35]" />
      </div>

      {/* Header area */}
      <div className="sticky top-0 z-20 backdrop-blur-xl border-b border-white/[0.06] bg-transparent">
        <AppHeader>
          <PointsBadge day={currentDay} />
        </AppHeader>
        <AddTaskPill />
        <DayNavigation
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          allDays={allDays}
          getDay={getDay} />

      </div>

      {/* Timeline */}
      <ScrollArea className="flex-1">
        <div className="pt-2">
          <TimelineView day={currentDay} onUpdate={updateDay} />
        </div>
      </ScrollArea>
    </div>);

};

export default Index;