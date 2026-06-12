import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useP0 } from "@/lib/p0-state";
import { RoadmapCard } from "@/components/RoadmapCard";
import { pget, pset } from "@/lib/pstore";
import { Map, ChevronRight, Sparkles, TrendingUp, Clock } from "lucide-react";

export const Route = createFileRoute("/_app/roadmap")({
  head: () => ({ meta: [{ title: "Roadmap — Project Zero" }] }),
  component: RoadmapPage,
});

function RoadmapPage() {
  const { roadmap, goals } = useP0();
  const [completed, setCompleted] = useState<Set<string>>(() => {
    try {
      const raw = pget("p0_completed");
      return new Set(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set();
    }
  });
  const [expandedWeek, setExpandedWeek] = useState<number | null>(0);

  const toggleMission = (id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      pset("p0_completed", JSON.stringify([...next]));
      return next;
    });
  };

  if (!roadmap) {
    return (
      <div className="relative p-8 lg:p-12">
        <div className="mx-auto max-w-2xl text-center">
          <div className="glass-card rounded-3xl p-10">
            <Map className="mx-auto h-10 w-10 text-primary/50" />
            <h2 className="mt-4 text-xl font-bold">No roadmap yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Complete the discovery process and Mr. Zero will build your personalized roadmap.
            </p>
            <Link
              to="/discovery"
              className="mt-6 inline-block rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/40"
            >
              Start discovery →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalMissions = roadmap.weeks.reduce(
    (acc, w) => acc + w.days.reduce((a, d) => a + d.missions.length, 0),
    0,
  );
  const completedCount = completed.size;
  const overallPct = totalMissions > 0 ? Math.round((completedCount / totalMissions) * 100) : 0;

  return (
    <div className="relative p-8 lg:p-12">
      <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-pink-300/30 blur-3xl" />
      <div className="relative mx-auto max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            Your Plan
          </div>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">
            {goals?.goal ?? "Learning Roadmap"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{roadmap.summary}</p>
        </motion.div>

        {/* Stats row */}
        <div className="mb-8 grid gap-3 sm:grid-cols-3">
          <StatCard
            icon={<Clock className="h-5 w-5" />}
            label="Total Hours"
            value={`${roadmap.totalHours}h`}
          />
          <StatCard
            icon={<TrendingUp className="h-5 w-5" />}
            label="Overall Progress"
            value={`${overallPct}%`}
          />
          <StatCard
            icon={<Sparkles className="h-5 w-5" />}
            label="Weeks"
            value={`${roadmap.weeks.length} weeks`}
          />
        </div>

        {/* Overall progress bar */}
        <div className="mb-8 glass-card rounded-3xl p-5">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-semibold">Mission Progress</span>
            <span className="font-bold text-primary">{completedCount} / {totalMissions} tasks</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-primary/10">
            <motion.div
              className="h-full rounded-full bg-primary"
              animate={{ width: `${overallPct}%` }}
              transition={{ type: "spring", stiffness: 80, damping: 20 }}
            />
          </div>
          <p className="mt-3 text-xs font-medium italic text-muted-foreground">
            "{roadmap.encouragement}"
          </p>
        </div>

        {/* Topic effort breakdown */}
        {roadmap.topics && roadmap.topics.length > 0 && (
          <div className="mb-8 glass-card rounded-3xl p-5">
            <div className="mb-4 text-xs font-bold uppercase tracking-widest text-primary">
              Time Allocation
            </div>
            <div className="space-y-3">
              {roadmap.topics.map((t) => (
                <div key={t.name}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{t.name}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          t.difficulty === "Hard"
                            ? "bg-rose-100 text-rose-600"
                            : t.difficulty === "Medium"
                            ? "bg-amber-100 text-amber-600"
                            : "bg-emerald-100 text-emerald-600"
                        }`}
                      >
                        {t.difficulty}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {t.hours}h · {t.percent}%
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-primary/10">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${t.percent}%` }}
                      transition={{ type: "spring", stiffness: 60, damping: 20, delay: 0.1 }}
                    />
                  </div>
                  {t.reason && (
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{t.reason}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Week cards — collapsible */}
        <div className="space-y-4">
          {roadmap.weeks.map((week, i) => (
            <motion.div
              key={week.week}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <button
                onClick={() => setExpandedWeek(expandedWeek === i ? null : i)}
                className="glass-card flex w-full items-center justify-between rounded-3xl px-6 py-4 text-left transition-all hover:shadow-lg hover:shadow-primary/10"
              >
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-primary">
                    Week {week.week}
                  </div>
                  <div className="mt-0.5 text-base font-bold tracking-tight">{week.theme}</div>
                </div>
                <ChevronRight
                  className={`h-5 w-5 text-primary transition-transform ${expandedWeek === i ? "rotate-90" : ""}`}
                />
              </button>
              <AnimatePresence>
                {expandedWeek === i && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 26 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-3">
                      <RoadmapCard
                        week={week}
                        index={i}
                        completed={completed}
                        onToggle={toggleMission}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="glass-card rounded-3xl p-5">
      <div className="flex items-center gap-2 text-primary">{icon}
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <div className="mt-2 text-2xl font-bold tracking-tight">{value}</div>
    </div>
  );
}
