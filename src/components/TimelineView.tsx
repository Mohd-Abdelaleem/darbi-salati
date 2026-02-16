import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DayData, TimelineItem, Checkpoint, StandaloneTask, Task, ChecklistItem } from '@/types/worship';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface TimelineViewProps {
  day: DayData;
  onUpdate: (day: DayData) => void;
}

export default function TimelineView({ day, onUpdate }: TimelineViewProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
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
    <div className="relative pr-6 pl-4 pb-20" dir="rtl">
      {/* Timeline line */}
      <div className="absolute right-[18px] top-0 bottom-0 w-[2px] bg-border" />

      {day.timeline.map((item, index) => {
        const id = item.kind === 'checkpoint' ? item.data.id : item.data.id;
        const isExpanded = expandedId === id;

        if (item.kind === 'checkpoint') {
          const cp = item.data as Checkpoint;
          const done = isCheckpointDone(cp);

          return (
            <div key={id} className="relative mb-1">
              {/* Dot */}
              <div
                className={cn(
                  'absolute right-[-18px] top-[14px] w-3 h-3 rounded-full border-2 z-10 transition-colors',
                  done
                    ? 'bg-primary border-primary'
                    : 'bg-background border-primary/40'
                )}
              />

              {/* Checkpoint header */}
              <button
                onClick={() => toggleExpand(id)}
                className="w-full text-right py-3 pr-2 flex items-center gap-2 group"
              >
                <span className="text-base font-bold text-foreground">{cp.title_ar}</span>
                {cp.time && (
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {cp.time}
                  </span>
                )}
                <svg
                  className={cn(
                    'w-4 h-4 text-muted-foreground mr-auto transition-transform duration-200',
                    isExpanded && 'rotate-180'
                  )}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Expanded content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="pr-4 pb-3 space-y-2">
                      {/* Tasks */}
                      {cp.tasks.map(task => (
                        <TaskRow
                          key={task.id}
                          task={task}
                          onToggle={() => toggleTask(index, task.id)}
                        />
                      ))}

                      {/* Checklist */}
                      {cp.checklist.length > 0 && (
                        <div className="pr-2 pt-1 space-y-1.5">
                          {cp.checklist.map(cl => (
                            <div key={cl.id} className="flex items-center gap-3">
                              <span
                                className={cn(
                                  'text-sm flex-1 text-right',
                                  cl.is_done ? 'text-muted-foreground line-through' : 'text-foreground/80'
                                )}
                              >
                                {cl.title_ar}
                              </span>
                              <Checkbox
                                checked={cl.is_done}
                                onCheckedChange={() => toggleTask(index, undefined, cl.id)}
                                className="h-4 w-4"
                              />
                            </div>
                          ))}
                        </div>
                      )}
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
            {/* Dot */}
            <div
              className={cn(
                'absolute right-[-18px] top-[14px] w-2.5 h-2.5 rounded-full border-2 z-10 transition-colors',
                task.is_done
                  ? 'bg-primary border-primary'
                  : task.type === 'secondary_task'
                  ? 'bg-background border-muted-foreground/30'
                  : 'bg-background border-primary/30'
              )}
            />

            <button
              onClick={() => toggleExpand(id)}
              className="w-full text-right py-2.5 pr-2 flex items-center gap-2"
            >
              <span
                className={cn(
                  'text-sm',
                  task.type === 'main_task' && 'font-bold text-foreground',
                  task.type === 'secondary_task' && 'text-muted-foreground',
                  task.type === 'regular_task' && 'text-foreground/80',
                  task.is_done && 'line-through opacity-50'
                )}
              >
                {task.title_ar}
              </span>
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pr-4 pb-2 flex items-center gap-3">
                    <span className="text-sm text-muted-foreground flex-1 text-right">
                      {task.is_done ? 'تم ✓' : 'لم يتم بعد'}
                    </span>
                    <Checkbox
                      checked={task.is_done}
                      onCheckedChange={() => toggleTask(index)}
                      className="h-5 w-5"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

function TaskRow({ task, onToggle }: { task: Task; onToggle: () => void }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={cn(
          'flex-1 text-right',
          task.type === 'main_task' && 'text-sm font-semibold text-foreground',
          task.type === 'secondary_task' && 'text-sm text-muted-foreground',
          task.type === 'regular_task' && 'text-sm text-foreground/80',
          task.is_done && 'line-through opacity-50'
        )}
      >
        {task.title_ar}
      </span>
      <Checkbox
        checked={task.is_done}
        onCheckedChange={onToggle}
        className="h-5 w-5"
      />
    </div>
  );
}
