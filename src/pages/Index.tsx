import { useState } from 'react';
import islamicBg from '@/assets/islamic-bg.png';
import AppHeader from '@/components/AppHeader';
import AddTaskPill from '@/components/AddTaskPill';
import AddCheckpointSheet from '@/components/AddCheckpointSheet';
import DayNavigation from '@/components/DayNavigation';
import TimelineView from '@/components/TimelineView';
import PointsBadge from '@/components/PointsBadge';
import { useDayStore } from '@/hooks/use-day-store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkpoint, TimelineItem } from '@/types/worship';

let _cpId = 0;
const cpUid = () => `user-cp-${++_cpId}-${Date.now().toString(36)}`;

const Index = () => {
  const { currentDay, selectedDate, setSelectedDate, updateDay, allDays, getDay } = useDayStore();
  const [showAddCheckpoint, setShowAddCheckpoint] = useState(false);

  const handleAddCheckpoint = (data: {
    title_ar: string;
    time?: string;
    icon: string;
    color: string;
  }) => {
    const newCheckpoint: Checkpoint = {
      id: cpUid(),
      type: 'checkpoint',
      title_ar: data.title_ar,
      time: data.time,
      is_locked: false,
      tasks: [],
      checklist: [],
      // store icon/color on the object
      ...({ icon: data.icon, color: data.color } as any),
    };

    const newItem: TimelineItem = { kind: 'checkpoint', data: newCheckpoint };
    let newTimeline = [...currentDay.timeline];

    if (data.time) {
      // Insert ordered by time
      const insertIdx = newTimeline.findIndex(item => {
        const t = item.kind === 'checkpoint' ? item.data.time : (item.data as any).time;
        return t && t > data.time!;
      });
      if (insertIdx === -1) {
        newTimeline.push(newItem);
      } else {
        newTimeline.splice(insertIdx, 0, newItem);
      }
    } else {
      newTimeline.push(newItem);
    }

    updateDay({ ...currentDay, timeline: newTimeline });
    setShowAddCheckpoint(false);
  };

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
        <AddTaskPill onClick={() => setShowAddCheckpoint(true)} />
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

      {/* Add Checkpoint Sheet */}
      <AddCheckpointSheet
        open={showAddCheckpoint}
        onClose={() => setShowAddCheckpoint(false)}
        onAdd={handleAddCheckpoint}
      />
    </div>
  );
};

export default Index;
