import { motion } from "framer-motion";
import { Sparkles, BookOpen, Wrench, Hammer, RotateCcw, CheckCircle2 } from "lucide-react";
import type { WeekPlan, Mission } from "@/lib/roadmap.functions";

const typeMeta: Record<Mission["type"], { icon: typeof BookOpen; label: string; color: string }> = {
  learn: { icon: BookOpen, label: "Learn", color: "text-sky-600 bg-sky-100" },
  practice: { icon: Wrench, label: "Practice", color: "text-violet-600 bg-violet-100" },
  project: { icon: Hammer, label: "Project", color: "text-amber-600 bg-amber-100" },
  revision: { icon: RotateCcw, label: "Revision", color: "text-rose-600 bg-rose-100" },
  assessment: { icon: CheckCircle2, label: "Assessment", color: "text-emerald-600 bg-emerald-100" },
};

export function RoadmapCard({
  week,
  index,
  completed,
  onToggle,
}: {
  week: WeekPlan;
  index: number;
  completed: Set<string>;
  onToggle: (id: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, type: "spring", stiffness: 180, damping: 22 }}
      className="glass-card group relative overflow-hidden rounded-3xl p-6"
    >
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-primary/20 blur-2xl transition-opacity group-hover:opacity-70" />
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-primary">
            Week {week.week}
          </div>
          <h3 className="mt-1 text-lg font-bold tracking-tight">{week.theme}</h3>
        </div>
        <Sparkles className="h-4 w-4 text-primary" />
      </div>

      {week.goals?.length > 0 && (
        <ul className="mt-4 space-y-1.5">
          {week.goals.map((g) => (
            <li key={g} className="flex items-start gap-2 text-xs font-medium text-foreground/70">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              {g}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 space-y-4">
        {week.days?.map((day) => (
          <div key={day.day} className="rounded-2xl border border-border/60 bg-white/50 p-4">
            <div className="mb-2 flex items-baseline justify-between">
              <div className="text-xs font-bold uppercase tracking-wider text-primary/80">
                Day {day.day}
              </div>
              <div className="text-[11px] font-medium text-muted-foreground">{day.focus}</div>
            </div>
            <ul className="space-y-2">
              {day.missions?.map((m, i) => {
                const id = `w${week.week}d${day.day}m${i}`;
                const meta = typeMeta[m.type] ?? typeMeta.learn;
                const Icon = meta.icon;
                const done = completed.has(id);
                return (
                  <li key={id} className="flex items-start gap-2">
                    <button
                      type="button"
                      onClick={() => onToggle(id)}
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all ${
                        done
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-white hover:border-primary"
                      }`}
                      aria-label="Toggle complete"
                    >
                      {done && <CheckCircle2 className="h-3.5 w-3.5" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className={`text-sm font-bold ${done ? "text-muted-foreground line-through" : "text-foreground/90"}`}>
                        {m.title}
                      </div>
                      {m.details && (
                        <div className={`mt-1 text-xs leading-relaxed ${done ? "text-muted-foreground line-through" : "text-muted-foreground"}`}>
                          {m.details}
                        </div>
                      )}
                      <div className="mt-2 flex items-center gap-2 text-[10px]">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${meta.color}`}>
                          <Icon className="h-3 w-3" />
                          {meta.label}
                        </span>
                        <span className="text-muted-foreground">{m.hours}h</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
