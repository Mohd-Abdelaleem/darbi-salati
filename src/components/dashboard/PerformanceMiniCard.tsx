import { useMemo, useState, memo } from 'react';
import { format, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Settings } from 'lucide-react';
import { useAnalytics } from '@/hooks/use-analytics';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getArabicMonth(dateStr: string): string {
  return format(parseISO(dateStr), 'MMMM', { locale: ar });
}

function getOpacity(points: number, maxPoints: number): number {
  if (maxPoints === 0) return 0.08;
  const ratio = points / maxPoints;
  if (ratio === 0) return 0.08;
  if (ratio < 0.25) return 0.25;
  if (ratio < 0.5) return 0.5;
  if (ratio < 0.75) return 0.72;
  return 1;
}

function formatArabicDate(dateStr: string): string {
  return format(parseISO(dateStr), 'd MMMM', { locale: ar });
}

// ─── Dot ──────────────────────────────────────────────────────────────────────

interface DotProps {
  date: string;
  points: number;
  opacity: number;
}

const Dot = memo(({ date, points, opacity }: DotProps) => {
  const [pressed, setPressed] = useState(false);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          className="w-full aspect-square rounded-full transition-all duration-200 focus:outline-none"
          style={{
            backgroundColor: `hsl(var(--primary) / ${opacity})`,
            transform: pressed ? 'scale(0.85)' : 'scale(1)',
            boxShadow: opacity > 0.7
              ? `0 0 6px hsl(var(--primary) / 0.4)`
              : undefined,
          }}
          onMouseDown={() => setPressed(true)}
          onMouseUp={() => setPressed(false)}
          onMouseLeave={() => setPressed(false)}
          onTouchStart={() => setPressed(true)}
          onTouchEnd={() => setPressed(false)}
          aria-label={`${formatArabicDate(date)}: ${points} نقطة`}
        />
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="text-xs font-cairo text-center"
      >
        <p className="font-semibold">{formatArabicDate(date)}</p>
        <p className="text-muted-foreground">{points} نقطة</p>
      </TooltipContent>
    </Tooltip>
  );
});
Dot.displayName = 'Dot';

// ─── Main Component ────────────────────────────────────────────────────────────

export const PerformanceMiniCard = memo(function PerformanceMiniCard() {
  const { last30Days, streak, consistencyScore, loading } = useAnalytics();

  // Memoize computed values
  const { maxPoints, monthLabels, columns } = useMemo(() => {
    if (!last30Days.length) return { maxPoints: 0, monthLabels: [], columns: [] };

    const maxPoints = Math.max(...last30Days.map(d => d.points), 1);

    // Derive 3 distinct month labels from real dates
    const seen = new Set<string>();
    const monthLabels: { label: string; index: number }[] = [];
    last30Days.forEach((d, i) => {
      const month = getArabicMonth(d.date);
      if (!seen.has(month)) {
        seen.add(month);
        monthLabels.push({ label: month, index: i });
      }
    });

    // Split 30 days into 3 columns of 10
    const columns: (typeof last30Days)[] = [
      last30Days.slice(0, 10),
      last30Days.slice(10, 20),
      last30Days.slice(20, 30),
    ];

    return { maxPoints, monthLabels, columns };
  }, [last30Days]);

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/[0.08] bg-card/60 backdrop-blur-xl p-4 animate-pulse">
        <div className="h-40 rounded-2xl bg-muted/30" />
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className="rounded-3xl border border-white/[0.08] bg-card/60 backdrop-blur-xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
        dir="rtl"
      >
        {/* ── Month labels ── */}
        <div className="flex justify-between mb-3 px-0.5">
          {monthLabels.slice(0, 3).map(({ label, index }) => (
            <span
              key={`${label}-${index}`}
              className="text-[11px] text-muted-foreground font-cairo tracking-wide"
            >
              {label}
            </span>
          ))}
          {/* Pad to always show 3 labels */}
          {Array.from({ length: Math.max(0, 3 - monthLabels.length) }).map((_, i) => (
            <span key={`pad-${i}`} />
          ))}
        </div>

        {/* ── Dot Heatmap — 3 columns × 10 rows ── */}
        <div className="grid grid-cols-3 gap-x-2 mb-4">
          {columns.map((col, colIdx) => (
            <div
              key={colIdx}
              className="grid grid-rows-10 gap-1.5"
              style={{ gridTemplateRows: `repeat(10, 1fr)` }}
            >
              {col.map((d) => (
                <Dot
                  key={d.date}
                  date={d.date}
                  points={d.points}
                  opacity={getOpacity(d.points, maxPoints)}
                />
              ))}
            </div>
          ))}
        </div>

        {/* ── Bottom summary row ── */}
        <div className="flex items-center justify-between pt-1 border-t border-white/[0.06]">
          {/* Left: streak badge + text */}
          <div className="flex items-center gap-3">
            {/* Circular streak badge */}
            <div
              className="w-10 h-10 rounded-full border border-primary/40 flex items-center justify-center flex-shrink-0"
              style={{
                background: `hsl(var(--primary) / 0.12)`,
              }}
            >
              <span className="text-base font-bold text-primary leading-none tabular-nums">
                {streak.current}
              </span>
            </div>

            {/* Title + subtitle */}
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-foreground font-cairo leading-none">
                أداء العبادة
              </span>
              <span className="text-[11px] text-muted-foreground font-cairo leading-none">
                آخر 30 يومًا • الثبات {consistencyScore}%
              </span>
            </div>
          </div>

          {/* Right: settings button */}
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 active:scale-90"
            style={{
              background: `hsl(var(--muted) / 0.5)`,
              border: `1px solid hsl(var(--border) / 0.5)`,
            }}
            aria-label="الإعدادات"
          >
            <Settings className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </TooltipProvider>
  );
});

export default PerformanceMiniCard;
