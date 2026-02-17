import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DayData, TimelineItem, Checkpoint, StandaloneTask } from '@/types/worship';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Sunrise, Sun, SunDim, Sunset, Moon, MoonStar, type LucideIcon } from 'lucide-react';
import mosqueIcon from '@/assets/mosque-icon.png';
import beadsIcon from '@/assets/beads-icon.png';
import quranIcon from '@/assets/quran-icon.png';

interface TimelineViewProps {
  day: DayData;
  onUpdate: (day: DayData) => void;
}

const CHECKPOINT_THEME: Record<string, { color: string; Icon: LucideIcon }> = {
  'الفجر': { color: 'text-checkpoint-fajr', Icon: Sunrise },
  'الشروق': { color: 'text-checkpoint-sunrise', Icon: Sun },
  'الظهر': { color: 'text-checkpoint-dhuhr', Icon: SunDim },
  'العصر': { color: 'text-checkpoint-asr', Icon: Sunset },
  'المغرب': { color: 'text-checkpoint-maghrib', Icon: MoonStar },
  'العشاء': { color: 'text-checkpoint-isha', Icon: Moon },
};

const TASK_ICON_MAP: Record<string, string> = {
  'أذكار الصلاة': beadsIcon,
  'قرآن الفجر': quranIcon,
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
    } else if (item.kind === 'checkpoint') {
      const cp = { ...item.data } as Checkpoint;
      if (checklistItemId) {
        cp.checklist = cp.checklist.map(cl =>
          cl.id === checklistItemId ? { ...cl, is_done: !cl.is_done } : cl
        );
      } else if (taskId) {
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
      {day.timeline.map((item, index) => {
        const id = item.data.id;
        const isExpanded = expandedId === id;

        if (item.kind === 'checkpoint') {
          const cp = item.data as Checkpoint;
          const done = isCheckpointDone(cp);
          const hasTasks = cp.tasks.length > 0;
          const theme = CHECKPOINT_THEME[cp.title_ar];

          return (
            <div key={id} className="relative">
              {/* Glowing timeline line */}
              <div className="absolute right-0 top-0 bottom-0 w-[2px] timeline-line rounded-full" />
              
              {/* Timeline dot */}
              <div className={cn(
                "absolute right-[-5px] top-5 w-3 h-3 rounded-full border-2 transition-all duration-300 z-10",
                done
                  ? "bg-success border-success glow-green"
                  : isExpanded
                  ? "bg-primary border-primary glow-blue"
                  : "bg-muted-foreground/30 border-muted-foreground/30"
              )} />

              <div className="mr-4">
                {/* Checkpoint card */}
                <button
                  onClick={() => hasTasks && toggleExpand(id)}
                  className={cn(
                    "w-full text-right py-3 px-4 rounded-2xl transition-all duration-250 mb-2",
                    isExpanded ? "glass-strong" : "glass glass-hover",
                    !hasTasks && "cursor-default"
                  )}
                >
                  {cp.time && (
                    <span className={cn("block text-xs font-medium mb-1 opacity-70", theme?.color || 'text-primary')}>
                      {cp.time}
                    </span>
                  )}
                  <div className="flex items-center gap-2.5">
                    {theme?.Icon && (
                      <theme.Icon className={cn(
                        "w-5 h-5 transition-opacity duration-200",
                        theme?.color,
                        done ? "opacity-40" : "opacity-80"
                      )} />
                    )}
                    <span className={cn(
                      "text-base font-semibold",
                      theme?.color || 'text-foreground',
                      done && "opacity-50"
                    )}>{cp.title_ar}</span>
                  </div>
                </button>

                {/* Expanded tasks */}
                <AnimatePresence>
                  {isExpanded && hasTasks && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className="overflow-hidden"
                    >
                      <div className="pr-4 pb-3 space-y-1.5">
                        {cp.tasks.map(task => {
                          const isMainTask = task.type === 'main_task';
                          const isPrayerExpanded = expandedPrayerId === task.id;
                          const taskIcon = TASK_ICON_MAP[task.title_ar];

                          return (
                            <div key={task.id} className="glass rounded-xl px-3 py-2">
                              <div className="flex items-center gap-3">
                                <div
                                  className={cn(
                                    "flex-1 text-right flex items-center gap-2",
                                    isMainTask && "cursor-pointer"
                                  )}
                                  onClick={isMainTask ? (e) => togglePrayerExpand(task.id, e) : undefined}
                                >
                                  {isMainTask && (
                                    <img src={mosqueIcon} alt="" className={cn(
                                      "w-4 h-4 transition-opacity",
                                      task.is_done ? "opacity-40" : "opacity-70"
                                    )} />
                                  )}
                                  {taskIcon && (
                                    <img src={taskIcon} alt="" className={cn(
                                      "w-4 h-4 transition-opacity",
                                      task.is_done ? "opacity-40" : "opacity-70"
                                    )} />
                                  )}
                                  <span className={cn(
                                    'text-sm font-medium',
                                    isMainTask && (theme?.color || 'text-primary'),
                                    task.type === 'secondary_task' && 'text-muted-foreground',
                                    task.type === 'regular_task' && 'text-foreground/80',
                                    task.is_done && 'opacity-50'
                                  )}>
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
                                    <div className="pr-6 pt-2 pb-1 flex flex-wrap gap-2">
                                      {cp.checklist.map(cl => (
                                        <label
                                          key={cl.id}
                                          className={cn(
                                            'text-xs px-3 py-1.5 rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-1.5 select-none',
                                            'hover:scale-105 active:scale-95',
                                            cl.is_done
                                              ? 'bg-success/20 text-success glow-green'
                                              : 'glass text-foreground/60 glass-hover'
                                          )}
                                        >
                                          <Checkbox
                                            checked={cl.is_done}
                                            onCheckedChange={() => toggleTask(index, undefined, cl.id)}
                                            className="h-3 w-3"
                                          />
                                          <span>{cl.title_ar}</span>
                                        </label>
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

              {/* Subtle divider */}
              <div className="h-px bg-gradient-to-l from-transparent via-white/5 to-transparent my-1" />
            </div>
          );
        }

        // Standalone task
        const task = item.data as StandaloneTask;
        return (
          <div key={id} className="relative">
            <div className="absolute right-0 top-0 bottom-0 w-[2px] timeline-line rounded-full" />
            <div className={cn(
              "absolute right-[-5px] top-4 w-3 h-3 rounded-full border-2 transition-all duration-300 z-10",
              task.is_done
                ? "bg-success border-success glow-green"
                : "bg-muted-foreground/30 border-muted-foreground/30"
            )} />
            <div className="mr-4">
              <div className="flex items-center gap-3 py-2.5 px-4 glass rounded-2xl mb-2 glass-hover">
                <span className={cn(
                  'text-sm font-medium flex-1 text-right',
                  task.type === 'main_task' && 'text-primary',
                  task.type === 'secondary_task' && 'text-muted-foreground',
                  task.type === 'regular_task' && 'text-foreground/80',
                  task.is_done && 'opacity-50'
                )}>
                  {task.title_ar}
                </span>
                <Checkbox
                  checked={task.is_done}
                  onCheckedChange={() => toggleTask(index)}
                  className="h-5 w-5"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
