import { DayData } from '@/types/worship';
import { calculateDayPoints } from '@/lib/points';
import { Star } from 'lucide-react';

interface PointsBadgeProps {
  day: DayData;
}

export default function PointsBadge({ day }: PointsBadgeProps) {
  const points = calculateDayPoints(day);

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass">
      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
      <span className="text-sm font-bold tabular-nums text-foreground">{points}</span>
    </div>
  );
}
