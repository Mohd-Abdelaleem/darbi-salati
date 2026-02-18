import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type: 'task' | 'checkpoint';
}

export default function DeleteConfirmDialog({ open, onClose, onConfirm, type }: DeleteConfirmDialogProps) {
  const isCheckpoint = type === 'checkpoint';

  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && onClose()}>
      <AlertDialogContent className="max-w-sm rounded-2xl bg-background/95 backdrop-blur-2xl border-white/10" dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-right">
            {isCheckpoint ? 'حذف المحطة' : 'حذف المهمة'}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-right">
            {isCheckpoint
              ? 'سيتم حذف المحطة وجميع المهام التابعة لها. هل تريد المتابعة؟'
              : 'هل تريد حذف هذه المهمة؟'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row-reverse gap-2 sm:flex-row-reverse">
          <AlertDialogCancel className="rounded-xl">إلغاء</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            حذف
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
