import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DayData, TimelineItem, Checkpoint, StandaloneTask } from '@/types/worship';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Sunrise, Sun, SunDim, Sunset, Moon, MoonStar, Plus, type LucideIcon } from 'lucide-react';
import mosqueIcon from '@/assets/mosque-icon.png';
import beadsIcon from '@/assets/beads-icon.png';
import quranIcon from '@/assets/quran-icon.png';
import AddTaskSheet from '@/components/AddTaskSheet';

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
  'الثلث الأخير من الليل': { color: 'text-checkpoint-isha', Icon: Moon },
};

const TASK_ICON_MAP: Record<string, string> = {
  'أذكار الصلاة': beadsIcon,
  'قرآن الفجر': quranIcon,
};

let _userTaskId = 0;
const userUid = () => `user-task-${++_userTaskId}-${Date.now().toString(36)}`;

export default function TimelineView({ day, onUpdate }: TimelineViewProps) {
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const [expandedPrayerId, setExpandedPrayerId] = useState<string | null>(null);
  const [addTaskForCheckpoint, setAddTaskForCheckpoint] = useState<{
    checkpointId: string;
    checkpointTitle: string;
    checkpointTime?: string;
    nextCheckpointTime?: string;
  } | null>(null);

  const toggleExpand = (id: string) => {
    setCollapsedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        setExpandedPrayerId(null);
      }
      return next;
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

  const openAddTask = (e: React.MouseEvent, checkpointIndex: number, cp: Checkpoint) => {
    e.stopPropagation();
    // Find next checkpoint time
    let nextCheckpointTime: string | undefined;
    for (let i = checkpointIndex + 1; i < day.timeline.length; i++) {
      const next = day.timeline[i];
      if (next.kind === 'checkpoint' && next.data.time) {
        nextCheckpointTime = next.data.time;
        break;
      }
    }
    setAddTaskForCheckpoint({
      checkpointId: cp.id,
      checkpointTitle: cp.title_ar,
      checkpointTime: cp.time,
      nextCheckpointTime,
    });
  };

  const handleAddTask = (taskData: {
    title_ar: string;
    time?: string;
    customPoints?: number;
    icon: string;
    color: string;
  }) => {
    if (!addTaskForCheckpoint) return;

    const newTask: StandaloneTask = {
      id: userUid(),
      type: 'regular_task',
      title_ar: taskData.title_ar,
      is_done: false,
      time: taskData.time,
      customPoints: taskData.customPoints,
      icon: taskData.icon,
      color: taskData.color,
      parentCheckpointId: addTaskForCheckpoint.checkpointId,
      isUserCreated: true,
    };

    // Insert the new task right after the checkpoint (and its children) — before the next checkpoint
    const newTimeline = [...day.timeline];
    const cpIndex = newTimeline.findIndex(
      item => item.kind === 'checkpoint' && item.data.id === addTaskForCheckpoint.checkpointId
    );

    // Find insertion point: after cpIndex, skip existing standalone tasks belonging to this group
    let insertAt = cpIndex + 1;
    while (insertAt < newTimeline.length && newTimeline[insertAt].kind === 'task') {
      insertAt++;
    }

    newTimeline.splice(insertAt, 0, { kind: 'task', data: newTask });
    updateTimeline(newTimeline);
    setAddTaskForCheckpoint(null);
  };

  return (
    <div className="relative pr-6 pl-4 pb-20" dir="rtl">
      {day.timeline.map((item, index) => {
        const id = item.data.id;

        if (item.kind === 'checkpoint') {
          const cp = item.data as Checkpoint;
          const done = isCheckpointDone(cp);
          const hasTasks = cp.tasks.length > 0;
          const theme = CHECKPOINT_THEME[cp.title_ar];
          const isExpanded = !collapsedIds.has(id);

          return (
            <div key={id} className="relative">
              {/* Glowing timeline line */}
              <div className="absolute right-0 top-0 bottom-0 w-[2px] timeline-line rounded-full" />

              {/* Timeline dot — ONLY for checkpoints */}
              <div className={cn(
                "absolute right-[-5px] top-[18px] w-3 h-3 rounded-full border-2 transition-all duration-300 z-10",
                done
                  ? "bg-success border-success glow-green"
                  : isExpanded
                  ? "bg-primary border-primary glow-blue"
                  : "bg-muted-foreground/30 border-muted-foreground/30"
              )} />

              {/* Separator line + floating pill */}
              <div className="relative w-full flex items-center py-3 mr-4">
                {/* Horizontal separator line */}
                <div className="absolute left-0 right-4 top-1/2 h-px bg-gradient-to-l from-white/10 via-white/6 to-transparent" />

                {/* Floating pill label — clickable for collapse */}
                <button
                  onClick={() => hasTasks && toggleExpand(id)}
                  className={cn(
                    "relative z-10 flex items-center gap-2 px-3.5 py-1.5 rounded-full",
                    "bg-white/[0.06] backdrop-blur-[16px] shadow-[0_4px_20px_rgba(0,0,0,0.3)]",
                    "transition-all duration-200",
                    hasTasks && "hover:bg-white/[0.1] hover:shadow-[0_4px_24px_rgba(0,0,0,0.4)]",
                    done && "opacity-60"
                  )}
                >
                  {theme?.Icon && (
                    <theme.Icon className={cn(
                      "w-4 h-4 transition-opacity duration-200",
                      theme?.color,
                      done ? "opacity-60" : "opacity-100"
                    )} />
                  )}
                  {/* Emoji icon for user-created checkpoints */}
                  {!theme && (cp as any).icon && (
                    <span className="text-base leading-none">{(cp as any).icon}</span>
                  )}
                  <span className={cn(
                    "text-sm font-semibold",
                    theme?.color || (cp as any).color || 'text-foreground'
                  )}>{cp.title_ar}</span>
                  {cp.time && (
                    <span className={cn(
                      "text-[11px] font-medium opacity-60 tabular-nums",
                      theme?.color || 'text-muted-foreground'
                    )}>
                      {cp.time}
                    </span>
                  )}
                </button>

                {/* + Add Task button (RTL: sits to the left of the pill) */}
                <button
                  onClick={(e) => openAddTask(e, index, cp)}
                  className={cn(
                    "relative z-10 mr-2 w-7 h-7 rounded-full flex items-center justify-center",
                    "bg-white/[0.06] backdrop-blur-sm",
                    "hover:bg-primary/20 hover:text-primary transition-all duration-200",
                    "text-muted-foreground/60 active:scale-90"
                  )}
                  title="إضافة مهمة"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Children tasks — expanded by default, collapsible */}
              <AnimatePresence initial={false}>
                {isExpanded && hasTasks && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="overflow-hidden"
                  >
                    <div className="mr-6 pb-3 space-y-1.5">
                      {cp.tasks.map(task => {
                        const isMainTask = task.type === 'main_task';
                        const isPrayerExpanded = expandedPrayerId === task.id;
                        const taskIcon = TASK_ICON_MAP[task.title_ar];

                        return (
                          <div key={task.id} className="relative">
                            <div className="glass rounded-2xl px-4 min-h-[56px] flex flex-col justify-center">
                              <div className="flex items-center gap-3 py-3">
                                <Checkbox
                                  checked={task.is_done}
                                  onCheckedChange={() => toggleTask(index, task.id)}
                                  className="h-[22px] w-[22px] shrink-0"
                                />
                                <div
                                  className={cn(
                                    "flex-1 text-right flex items-center gap-2",
                                    isMainTask && "cursor-pointer"
                                  )}
                                  onClick={isMainTask ? (e) => togglePrayerExpand(task.id, e) : undefined}
                                >
                                  {isMainTask && (
                                    <img src={mosqueIcon} alt="" className={cn(
                                      "w-5 h-5 transition-opacity brightness-125",
                                      task.is_done ? "opacity-50" : "opacity-100"
                                    )} />
                                  )}
                                  {taskIcon && (
                                    <img src={taskIcon} alt="" className={cn(
                                      "w-5 h-5 transition-opacity brightness-125",
                                      task.is_done ? "opacity-50" : "opacity-100"
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
                                    <div className="pr-6 pt-1 pb-2 flex flex-wrap gap-2">
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
                                            className="h-3.5 w-3.5"
                                          />
                                          <span>{cl.title_ar}</span>
                                        </label>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
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

        // Standalone task — no dot, just indented row under previous checkpoint
        const task = item.data as StandaloneTask;
        const isUserTask = task.isUserCreated;

        return (
          <div key={id} className="relative">
            <div className="absolute right-0 top-0 bottom-0 w-[2px] timeline-line rounded-full" />
            {/* No timeline dot for standalone tasks */}
            <div className="mr-6">
              <div className={cn(
                "flex items-center gap-3 min-h-[56px] py-3 px-4 rounded-2xl mb-2 glass-hover",
                isUserTask ? "glass border border-white/[0.08]" : "glass"
              )}>
                <Checkbox
                  checked={task.is_done}
                  onCheckedChange={() => toggleTask(index)}
                  className="h-[22px] w-[22px] shrink-0"
                />
                <div className="flex-1 text-right flex items-center gap-2">
                  {/* User-created task icon */}
                  {isUserTask && task.icon && (
                    <span className={cn("text-base leading-none", task.is_done && "opacity-50")}>
                      {task.icon}
                    </span>
                  )}
                  <span className={cn(
                    'text-sm font-medium flex-1',
                    isUserTask && (task.color || 'text-teal-400'),
                    !isUserTask && task.type === 'main_task' && 'text-primary',
                    !isUserTask && task.type === 'secondary_task' && 'text-muted-foreground',
                    !isUserTask && task.type === 'regular_task' && 'text-foreground/80',
                    task.is_done && 'opacity-50'
                  )}>
                    {task.title_ar}
                  </span>
                  {/* Show time badge if set */}
                  {isUserTask && task.time && (
                    <span className="text-[10px] tabular-nums text-muted-foreground/60 bg-white/[0.06] px-1.5 py-0.5 rounded-md">
                      {task.time}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Add Task Sheet */}
      {addTaskForCheckpoint && (
        <AddTaskSheet
          open={!!addTaskForCheckpoint}
          onClose={() => setAddTaskForCheckpoint(null)}
          onAdd={handleAddTask}
          checkpointTitle={addTaskForCheckpoint.checkpointTitle}
          checkpointTime={addTaskForCheckpoint.checkpointTime}
          nextCheckpointTime={addTaskForCheckpoint.nextCheckpointTime}
        />
      )}
    </div>
  );
}
