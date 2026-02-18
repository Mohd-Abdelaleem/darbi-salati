import { Plus } from 'lucide-react';

interface AddTaskPillProps {
  onClick?: () => void;
}

export default function AddTaskPill({ onClick }: AddTaskPillProps) {
  return (
    <div className="px-5 py-2" dir="rtl">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full
          bg-white/[0.05] backdrop-blur-[16px] border border-white/[0.08]
          shadow-[0_4px_20px_rgba(0,0,0,0.25)]
          text-muted-foreground text-sm font-medium
          hover:bg-white/[0.08] hover:border-white/[0.12] transition-all duration-200
          active:scale-[0.98]"
      >
        <span>إضافة محطة جديدة</span>
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
