import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DayData, TimelineItem, Checkpoint, StandaloneTask } from '@/types/worship';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

import fajrIcon from '@/assets/praying.png';
import sunriseIcon from '@/assets/star.png';
import dhuhrIcon from '@/assets/nabawi-mosque.png';
import asrIcon from '@/assets/frame-design.png';
import maghribIcon from '@/assets/islam.png';
import ishaIcon from '@/assets/islam.png';

interface TimelineViewProps {
  day: DayData;
  onUpdate: (day: DayData) => void;
}

const CHECKPOINT_THEME: Record<string, { color: string; icon: string }> = {
  'الفجر': { color: 'text-checkpoint-fajr', icon: fajrIcon },
  'الشروق': { color: 'text-checkpoint-sunrise', icon: sunriseIcon },
  'الظهر': { color: 'text-checkpoint-dhuhr', icon: dhuhrIcon },
  'العصر': { color: 'text-checkpoint-asr', icon: asrIcon },
  'المغرب': { color: 'text-checkpoint-maghrib', icon: maghribIcon },
  'العشاء': { color: 'text-checkpoint-isha', icon: ishaIcon },
};


export default function TimelineView({ day, onUpdate }: TimelineViewProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedPrayerId, setExpandedPrayerId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => {
      if (prev === id) {
        setExpandedPrayerId(null);
        return null;
      }
      return id;
    });
  };

  const togglePrayerExpand = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedPrayerId(prev => (prev === taskId ? null : taskId));
  };

  const updateTimeline = (newTimeline: TimelineItem[]) => {
    onUpdate({ ...day, timeline: newTimeline });
  };

  const toggleTask = (itemIndex: number, taskId?: string, checklistItemId?: string) => {
    const newTimeline = [...day.timeline];
    const item = newTimeline[itemIndex];

    if (item.kind === 'task' && !taskId) {
      item.data = { ...item.data, is_done: !item.data.is_done };
    } else if (item.kind === 'checkpoint' && taskId) {
      const cp = { ...item.data } as Checkpoint;
      if (checklistItemId) {
        cp.checklist = cp.checklist.map(cl =>
          cl.id === checklistItemId ? { ...cl, is_done: !cl.is_done } : cl
        );
      } else {
        cp.tasks = cp.tasks.map(t =>
          t.id === taskId ? { ...t, is_done: !t.is_done } : t
        );
      }
      item.data = cp;
    }

    updateTimeline(newTimeline);
  };

  const isCheckpointDone = (cp: Checkpoint): boolean => {
    const mainTask = cp.tasks.find(t => t.type === 'main_task');
    return mainTask?.is_done ?? false;
  };

  return (
    <div className="relative px-4 pb-20" dir="rtl">
      {day.timeline.map((item, index) => {
        const id = item.data.id;
        const isExpanded = expandedId === id;

        if (item.kind === 'checkpoint') {
          const cp = item.data as Checkpoint;
          const done = isCheckpointDone(cp);
          const hasTasks = cp.tasks.length > 0;
          const theme = CHECKPOINT_THEME[cp.title_ar];

          return (
            <div key={id} className="relative mb-2">

              {/* Checkpoint header */}
              <button
                onClick={() => hasTasks && toggleExpand(id)}
                className={cn("w-full text-right py-2 pr-2", !hasTasks && "cursor-default")}
              >
                {cp.time && (
                  <span className={cn("block text-sm font-medium mb-0.5", theme?.color || 'text-primary')}>
                    {cp.time}
                  </span>
                )}
                <div className="flex items-center gap-2">
                  {theme?.icon && (
                    <img src={theme.icon} alt="" className={cn("w-5 h-5 opacity-70", done && "opacity-30")} />
                  )}
                  <span className={cn(
                    "text-base font-medium",
                    theme?.color || 'text-foreground',
                    done && "line-through opacity-50"
                  )}>{cp.title_ar}</span>
                </div>
              </button>

              {/* Expanded: tasks (sunnahs + main prayer) */}
              <AnimatePresence>
                {isExpanded && hasTasks && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="pr-4 pb-3 space-y-1">
                      {cp.tasks.map(task => {
                        const isMainTask = task.type === 'main_task';
                        const isPrayerExpanded = expandedPrayerId === task.id;

                        return (
                          <div key={task.id}>
                            <div className="flex items-center gap-3 py-1.5">
                              <div
                                className={cn(
                                  "flex-1 text-right",
                                  isMainTask && "cursor-pointer"
                                )}
                                onClick={isMainTask ? (e) => togglePrayerExpand(task.id, e) : undefined}
                              >
                                <span
                                  className={cn(
                                    'text-sm font-normal',
                                    isMainTask && (theme?.color || 'text-primary'),
                                    task.type === 'secondary_task' && 'text-muted-foreground',
                                    task.type === 'regular_task' && 'text-foreground/80',
                                    task.is_done && 'line-through opacity-50'
                                  )}
                                >
                                  {task.title_ar}
                                </span>
                              </div>
                              <Checkbox
                                checked={task.is_done}
                                onCheckedChange={() => toggleTask(index, task.id)}
                                className="h-4 w-4"
                              />
                            </div>

                            {/* Checklist under main prayer */}
                            <AnimatePresence>
                              {isMainTask && isPrayerExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                                  className="overflow-hidden"
                                >
                                  <div className="pr-6 pb-2 space-y-1.5">
                                    {cp.checklist.map(cl => (
                                      <div key={cl.id} className="flex items-center gap-3">
                                        <span
                                          className={cn(
                                            'text-xs flex-1 text-right',
                                            cl.is_done ? 'text-muted-foreground line-through' : 'text-foreground/70'
                                          )}
                                        >
                                          {cl.title_ar}
                                        </span>
                                        <Checkbox
                                          checked={cl.is_done}
                                          onCheckedChange={() => toggleTask(index, undefined, cl.id)}
                                          className="h-3.5 w-3.5"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        }

        // Standalone task
        const task = item.data as StandaloneTask;
        return (
          <div key={id} className="relative mb-1">

            <div className="flex items-center gap-3 py-2.5 pr-2">
              <span
                className={cn(
                  'text-sm font-normal flex-1 text-right',
                  task.type === 'main_task' && 'text-primary',
                  task.type === 'secondary_task' && 'text-muted-foreground',
                  task.type === 'regular_task' && 'text-foreground/80',
                  task.is_done && 'line-through opacity-50'
                )}
              >
                {task.title_ar}
              </span>
              <Checkbox
                checked={task.is_done}
                onCheckedChange={() => toggleTask(index)}
                className="h-5 w-5"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
