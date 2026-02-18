import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ICON_OPTIONS, COLOR_OPTIONS } from '@/lib/icon-map';

interface AddTaskSheetProps {
  open: boolean;
  onClose: () => void;
  onAdd: (task: {
    title_ar: string;
    time?: string;
    customPoints?: number;
    icon: string;
    color: string;
  }) => void;
  checkpointTitle: string;
  checkpointTime?: string;
  nextCheckpointTime?: string;
}

export default function AddTaskSheet({
  open,
  onClose,
  onAdd,
  checkpointTitle,
  checkpointTime,
  nextCheckpointTime,
}: AddTaskSheetProps) {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [customPointsEnabled, setCustomPointsEnabled] = useState(false);
  const [customPoints, setCustomPoints] = useState(5);
  const [selectedIcon, setSelectedIcon] = useState('star');
  const [selectedColor, setSelectedColor] = useState('text-teal-400');

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAdd({
      title_ar: title.trim(),
      time: time || undefined,
      customPoints: customPointsEnabled ? customPoints : undefined,
      icon: selectedIcon,
      color: selectedColor,
    });
    setTitle('');
    setTime('');
    setCustomPointsEnabled(false);
    setCustomPoints(5);
    setSelectedIcon('star');
    setSelectedColor('text-teal-400');
    onClose();
  };

  const SelectedIconComponent = ICON_OPTIONS.find(i => i.value === selectedIcon)?.Icon;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl border-t border-white/10 bg-background/95 backdrop-blur-2xl pb-10 max-h-[92vh] overflow-y-auto" dir="rtl">
        <SheetHeader className="mb-5">
          <SheetTitle className="text-right text-base font-bold">
            إضافة مهمة — {checkpointTitle}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-5">
          {/* Task name */}
          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">اسم المهمة *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: قراءة الأذكار"
              className="text-right bg-white/[0.05] border-white/10 rounded-xl focus-visible:ring-primary/50"
              dir="rtl"
            />
          </div>

          {/* Time picker */}
          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">الوقت (اختياري)</Label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              min={checkpointTime}
              max={nextCheckpointTime}
              className="text-right bg-white/[0.05] border-white/10 rounded-xl focus-visible:ring-primary/50"
              dir="rtl"
            />
            {checkpointTime && (
              <p className="text-[11px] text-muted-foreground">
                النطاق الزمني: {checkpointTime}{nextCheckpointTime ? ` ← ${nextCheckpointTime}` : ''}
              </p>
            )}
          </div>

          {/* Custom points */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Switch checked={customPointsEnabled} onCheckedChange={setCustomPointsEnabled} />
              <Label className="text-sm text-muted-foreground cursor-pointer">تخصيص نقاط</Label>
            </div>
            {customPointsEnabled && (
              <div className="flex items-center gap-3">
                <Input
                  type="number" min={0} max={999}
                  value={customPoints}
                  onChange={(e) => setCustomPoints(Math.max(0, Math.min(999, Number(e.target.value))))}
                  className="w-24 text-center bg-white/[0.05] border-white/10 rounded-xl"
                />
                <span className="text-sm text-muted-foreground">نقطة</span>
              </div>
            )}
            {!customPointsEnabled && (
              <p className="text-[11px] text-muted-foreground">سيتم استخدام القيمة الافتراضية: 5 نقاط</p>
            )}
          </div>

          {/* Icon picker — Lucide mono icons */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">الأيقونة</Label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map((ico) => {
                const IcoComp = ico.Icon;
                const colorClass = selectedColor;
                return (
                  <button
                    key={ico.value}
                    onClick={() => setSelectedIcon(ico.value)}
                    className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center transition-all',
                      selectedIcon === ico.value
                        ? 'bg-primary/30 ring-2 ring-primary scale-110'
                        : 'bg-white/[0.06] hover:bg-white/[0.1]'
                    )}
                    title={ico.label}
                  >
                    <IcoComp className={cn(
                      'w-5 h-5',
                      selectedIcon === ico.value ? colorClass : 'text-muted-foreground'
                    )} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color picker */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">اللون</Label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((col) => (
                <button
                  key={col.value}
                  onClick={() => setSelectedColor(col.value)}
                  className={cn(
                    'w-8 h-8 rounded-full transition-all',
                    col.bg,
                    selectedColor === col.value ? 'ring-2 ring-white scale-125' : 'opacity-60 hover:opacity-90'
                  )}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.04]">
            {SelectedIconComponent && <SelectedIconComponent className={cn('w-5 h-5', selectedColor)} />}
            <span className={cn('text-sm font-medium', selectedColor)}>{title || 'معاينة'}</span>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="w-full rounded-2xl gradient-primary text-white font-semibold mt-2"
          >
            إضافة المهمة
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
