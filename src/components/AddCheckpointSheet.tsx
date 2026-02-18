import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AddCheckpointSheetProps {
  open: boolean;
  onClose: () => void;
  onAdd: (checkpoint: {
    title_ar: string;
    time?: string;
    icon: string;
    color: string;
  }) => void;
}

const ICON_OPTIONS = [
  { value: '🌙', label: 'قمر' },
  { value: '⭐', label: 'نجمة' },
  { value: '🕌', label: 'مسجد' },
  { value: '📖', label: 'قراءة' },
  { value: '🤲', label: 'دعاء' },
  { value: '💧', label: 'ماء' },
  { value: '🏃', label: 'رياضة' },
  { value: '📝', label: 'ملاحظة' },
];

const COLOR_OPTIONS = [
  { value: 'text-teal-400', bg: 'bg-teal-400' },
  { value: 'text-cyan-400', bg: 'bg-cyan-400' },
  { value: 'text-emerald-400', bg: 'bg-emerald-400' },
  { value: 'text-amber-400', bg: 'bg-amber-400' },
  { value: 'text-violet-400', bg: 'bg-violet-400' },
  { value: 'text-rose-400', bg: 'bg-rose-400' },
];

export default function AddCheckpointSheet({ open, onClose, onAdd }: AddCheckpointSheetProps) {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🌙');
  const [selectedColor, setSelectedColor] = useState('text-teal-400');

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAdd({
      title_ar: title.trim(),
      time: time || undefined,
      icon: selectedIcon,
      color: selectedColor,
    });
    setTitle('');
    setTime('');
    setSelectedIcon('🌙');
    setSelectedColor('text-teal-400');
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

          {/* Time */}
          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">وقت المحطة (اختياري)</Label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="bg-white/[0.05] border-white/10 rounded-xl focus-visible:ring-primary/50"
            />
            <p className="text-[11px] text-muted-foreground">
              {time ? 'ستُرتَّب المحطة حسب الوقت تلقائياً' : 'بدون وقت: ستُضاف في نهاية اليوم'}
            </p>
          </div>

          {/* Icon picker */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">الأيقونة</Label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map((ico) => (
                <button
                  key={ico.value}
                  onClick={() => setSelectedIcon(ico.value)}
                  className={cn(
                    'w-10 h-10 rounded-xl text-lg flex items-center justify-center transition-all',
                    selectedIcon === ico.value
                      ? 'bg-primary/30 ring-2 ring-primary scale-110'
                      : 'bg-white/[0.06] hover:bg-white/[0.1]'
                  )}
                >
                  {ico.value}
                </button>
              ))}
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
