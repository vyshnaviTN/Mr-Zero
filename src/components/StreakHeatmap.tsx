import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  completionPercent,
  heatColor,
  recentDays,
  type DayLog,
} from "@/lib/streaks";

interface Props {
  daily: Record<string, DayLog>;
  days?: number; // total cells (default 91 = 13 weeks)
}

export function StreakHeatmap({ daily, days = 91 }: Props) {
  const cells = useMemo(() => recentDays(days), [days]);
  return (
    <div>
      <div
        className="grid auto-cols-min grid-flow-col gap-1.5"
        style={{ gridTemplateRows: "repeat(7, minmax(0, 1fr))" }}
      >
        {cells.map((d, i) => {
          const log = daily[d];
          const pct = completionPercent(log);
          const done = log?.completed.filter(Boolean).length ?? 0;
          const total = log?.total ?? 0;
          return (
            <motion.div
              key={d}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.min(i * 0.004, 0.4) }}
              title={
                total > 0
                  ? `${d} — Completed ${done}/${total} tasks · ${pct}% Progress`
                  : `${d} — No activity`
              }
              className={`h-3.5 w-3.5 rounded-[5px] ${heatColor(pct)} transition-transform hover:scale-125`}
            />
          );
        })}
      </div>
      <div className="mt-3 flex items-center gap-2 text-[10px] font-semibold text-muted-foreground">
        <span>Less</span>
        <span className="h-3 w-3 rounded-[4px] bg-pink-100/60" />
        <span className="h-3 w-3 rounded-[4px] bg-[#FFC1D6]" />
        <span className="h-3 w-3 rounded-[4px] bg-[#FF85B5]" />
        <span className="h-3 w-3 rounded-[4px] bg-[#FF4D94]" />
        <span className="h-3 w-3 rounded-[4px] bg-[#FF1F7A]" />
        <span>More</span>
      </div>
    </div>
  );
}
