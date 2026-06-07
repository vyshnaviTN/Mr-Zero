import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { Flame, Trophy, TrendingUp } from "lucide-react";
import { useP0 } from "@/lib/p0-state";
import { StreakHeatmap } from "@/components/StreakHeatmap";
import { monthlyConsistency } from "@/lib/streaks";

export const Route = createFileRoute("/_app/streaks")({
  head: () => ({ meta: [{ title: "Streaks — Project 0" }] }),
  component: StreaksPage,
});

function StreaksPage() {
  const { streak, daily } = useP0();
  const consistency = useMemo(() => monthlyConsistency(daily), [daily]);

  return (
    <div className="relative p-8 lg:p-12">
      <div className="pointer-events-none absolute -right-32 top-10 h-96 w-96 rounded-full bg-pink-300/30 blur-3xl" />
      <div className="relative mx-auto max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            Consistency
          </div>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">Your streak heatmap</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Complete all 4 daily pillars to grow your streak. The heatmap updates automatically.
          </p>
        </motion.div>

        <div className="mb-8 grid gap-3 sm:grid-cols-3">
          <StatBig
            label="Current streak"
            value={`${streak.current}d`}
            icon={<Flame className="h-5 w-5" />}
          />
          <StatBig
            label="Longest streak"
            value={`${streak.longest}d`}
            icon={<Trophy className="h-5 w-5" />}
          />
          <StatBig
            label="This month"
            value={`${consistency}%`}
            icon={<TrendingUp className="h-5 w-5" />}
          />
        </div>

        <div className="glass-card rounded-3xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-primary">
                Last 91 days
              </div>
              <h2 className="mt-1 text-xl font-bold tracking-tight">Activity</h2>
            </div>
            <div className="text-[11px] font-medium text-muted-foreground">
              Hover a square to see daily progress.
            </div>
          </div>
          <div className="overflow-x-auto">
            <StreakHeatmap daily={daily} days={91} />
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          The heatmap is never editable — it reflects your actual task completion.
        </p>
      </div>
    </div>
  );
}

function StatBig({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="glass-card rounded-3xl p-5">
      <div className="flex items-center gap-2 text-primary">{icon}
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <div className="mt-2 text-3xl font-bold tracking-tight">{value}</div>
    </div>
  );
}
