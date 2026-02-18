import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ICON_OPTIONS, COLOR_OPTIONS } from '@/lib/icon-map';

interface AddCheckpointSheetProps {
  open: boolean;
  onClose: () => void;
  onAdd: (checkpoint: {
    title_ar: string;
    time: string;
    icon: string;
    color: string;
  }) => void;
}

export default function AddCheckpointSheet({ open, onClose, onAdd }: AddCheckpointSheetProps) {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('moon');
  const [selectedColor, setSelectedColor] = useState('text-teal-400');
  const [timeError, setTimeError] = useState(false);

  const handleSubmit = () => {
    if (!title.trim()) return;
    if (!time) {
      setTimeError(true);
      return;
    }
    onAdd({
      title_ar: title.trim(),
      time,
      icon: selectedIcon,
      color: selectedColor,
    });
    setTitle('');
    setTime('');
    setSelectedIcon('moon');
    setSelectedColor('text-teal-400');
    setTimeError(false);
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl border-t border-white/10 bg-background/95 backdrop-blur-2xl pb-10" dir="rtl">
        <SheetHeader className="mb-5">
          <SheetTitle className="text-right text-base font-bold">إضافة محطة جديدة</SheetTitle>
        </SheetHeader>

        <div className="space-y-5">
          {/* Name */}
          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">اسم المحطة *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: وقت التأمل"
              className="text-right bg-white/[0.05] border-white/10 rounded-xl focus-visible:ring-primary/50"
              dir="rtl"
            />
          </div>

          {/* Time — MANDATORY */}
          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">وقت المحطة *</Label>
            <Input
              type="time"
              value={time}
              onChange={(e) => { setTime(e.target.value); setTimeError(false); }}
              className={cn(
                "bg-white/[0.05] border-white/10 rounded-xl focus-visible:ring-primary/50",
                timeError && "border-destructive ring-1 ring-destructive"
              )}
            />
            {timeError && (
              <p className="text-[11px] text-destructive font-medium">الوقت مطلوب</p>
            )}
          </div>

          {/* Icon picker — Lucide mono icons */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">الأيقونة</Label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map((ico) => {
                const IcoComp = ico.Icon;
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
                      selectedIcon === ico.value ? selectedColor : 'text-muted-foreground'
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

          <Button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="w-full rounded-2xl gradient-primary text-white font-semibold"
          >
            إضافة المحطة
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
