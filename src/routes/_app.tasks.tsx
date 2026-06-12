import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Check, Target, Clock, BookOpen, Wrench, Hammer, RotateCcw, CheckCircle2 } from "lucide-react";
import { useP0 } from "@/lib/p0-state";
import { speak } from "@/components/SpeechBubble";
import { pget, pset } from "@/lib/pstore";
import type { Mission, DayPlan, WeekPlan } from "@/lib/roadmap.functions";

const typeMeta: Record<Mission["type"], { icon: typeof BookOpen; label: string; color: string }> = {
  learn: { icon: BookOpen, label: "Learn", color: "text-sky-600 bg-sky-100" },
  practice: { icon: Wrench, label: "Practice", color: "text-violet-600 bg-violet-100" },
  project: { icon: Hammer, label: "Project", color: "text-amber-600 bg-amber-100" },
  revision: { icon: RotateCcw, label: "Revision", color: "text-rose-600 bg-rose-100" },
  assessment: { icon: CheckCircle2, label: "Assessment", color: "text-emerald-600 bg-emerald-100" },
};

export const Route = createFileRoute("/_app/tasks")({
  head: () => ({ meta: [{ title: "Tasks — Project 0" }] }),
  component: TasksPage,
});

const REACTIONS = [
  "Locked in.",
  "That's how it's done.",
  "One closer to today.",
  "Streak is safer now.",
  "Builder mode: on.",
];

function TasksPage() {
  const { goals, pillars, roadmap, todayLog, todayPct, togglePillar } = useP0();
  const [lastReaction, setLastReaction] = useState<string | null>(null);
  const [completedMissions, setCompletedMissions] = useState<Set<string>>(() => {
    try {
      const raw = pget("p0_completed");
      return new Set(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set();
    }
  });

  const toggleMission = (id: string) => {
    setCompletedMissions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      pset("p0_completed", JSON.stringify([...next]));
      return next;
    });
  };

  // Find the first day that has incomplete missions
  let activeWeek: WeekPlan | null = null;
  let activeDay: DayPlan | null = null;
  let isAllDone = false;

  if (roadmap) {
    for (const week of roadmap.weeks) {
      for (const day of week.days) {
        const allDone = day.missions.every((m, i) => completedMissions.has(`w${week.week}d${day.day}m${i}`));
        if (!allDone) {
          if (!activeDay) {
            activeWeek = week;
            activeDay = day;
          }
        }
      }
    }
    if (!activeDay && roadmap.weeks.length > 0) {
      // If we finished everything, just show the very last day
      activeWeek = roadmap.weeks[roadmap.weeks.length - 1];
      activeDay = activeWeek.days[activeWeek.days.length - 1];
      isAllDone = true;
    }
  }

  useEffect(() => {
    if (todayPct === 100) {
      setLastReaction("Today is 100% complete. Streak protected.");
      speak("Today is locked in.");
    }
  }, [todayPct]);

  const hours = parseFloat(goals?.hours ?? "0") || 0;
  const perTask = pillars.length ? Math.round((hours / pillars.length) * 10) / 10 : 0;

  return (
    <div className="relative p-8 lg:p-12">
      <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-pink-300/30 blur-3xl" />
      <div className="relative mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            Today's Tasks
          </div>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">Your 4 daily pillars</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Check each off as you complete it. Hitting 100% protects your streak.
          </p>
        </motion.div>

        <div className="mb-6 flex items-center justify-between rounded-3xl border border-primary/20 bg-primary/5 px-5 py-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-primary">
              Today
            </div>
            <div className="text-2xl font-bold">{todayPct}% complete</div>
          </div>
          <div className="h-2 w-48 overflow-hidden rounded-full bg-primary/10">
            <motion.div
              className="h-full rounded-full bg-primary"
              animate={{ width: `${todayPct}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
          </div>
        </div>

        <div className="space-y-3">
          {pillars.length === 0 && (
            <div className="glass-card rounded-3xl p-8 text-center text-sm text-muted-foreground">
              No pillars set yet. Complete onboarding first.
            </div>
          )}
          {pillars.map((p, i) => {
            const done = todayLog.completed[i];
            return (
              <motion.button
                key={p + i}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  togglePillar(i);
                  if (!done) {
                    const r = REACTIONS[Math.floor(Math.random() * REACTIONS.length)];
                    setLastReaction(r);
                    speak(r);
                  }
                }}
                className={`group flex w-full items-center gap-4 rounded-3xl border p-5 text-left transition-all ${
                  done
                    ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/40"
                    : "border-border bg-white/70 hover:border-primary/50"
                }`}
              >
                <div
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl transition-all ${
                    done ? "bg-white text-primary" : "bg-primary/10 text-primary"
                  }`}
                >
                  {done ? <Check className="h-5 w-5" /> : <Target className="h-5 w-5" />}
                </div>
                <div className="flex-1">
                  <div className="text-[10px] font-bold uppercase tracking-widest opacity-70">
                    Pillar {i + 1}
                  </div>
                  <div className="mt-0.5 text-lg font-bold tracking-tight">{p}</div>
                  <div
                    className={`mt-1 text-xs ${
                      done ? "text-white/85" : "text-muted-foreground"
                    }`}
                  >
                    {p.toLowerCase().includes("project")
                      ? "Build · ship something small today."
                      : "Learn · Practice · Revise."}
                  </div>
                </div>
                {perTask > 0 && (
                  <div
                    className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
                      done ? "bg-white/20" : "bg-primary/10 text-primary"
                    }`}
                  >
                    <Clock className="h-3.5 w-3.5" />
                    {perTask}h
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {activeDay && activeWeek && (
          <div className="mt-12">
            <div className="mb-4">
              <div className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
                Your Roadmap
              </div>
              <h2 className="mt-2 text-2xl font-bold tracking-tight">
                {isAllDone ? "Roadmap Complete! 🎉" : `Week ${activeWeek.week}, Day ${activeDay.day}`}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {activeDay.focus}
              </p>
            </div>
            
            <div className="space-y-4">
              {activeDay.missions.map((m, i) => {
                const id = `w${activeWeek!.week}d${activeDay!.day}m${i}`;
                const done = completedMissions.has(id);
                const meta = typeMeta[m.type] ?? typeMeta.learn;
                const Icon = meta.icon;
                
                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`glass-card relative flex items-start gap-4 rounded-3xl p-6 transition-all ${
                      done ? "opacity-70" : ""
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleMission(id)}
                      className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-all ${
                        done
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-white hover:border-primary shadow-sm"
                      }`}
                    >
                      {done && <CheckCircle2 className="h-4 w-4" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className={`text-base font-bold ${done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                        {m.title}
                      </div>
                      {m.details && (
                        <div className={`mt-2 text-sm leading-relaxed ${done ? "text-muted-foreground" : "text-foreground/80"}`}>
                          {m.details}
                        </div>
                      )}
                      <div className="mt-4 flex items-center gap-2 text-xs">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold ${meta.color}`}>
                          <Icon className="h-3.5 w-3.5" />
                          {meta.label}
                        </span>
                        <span className="text-muted-foreground font-medium flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {m.hours}h
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {lastReaction && (
          <motion.div
            key={lastReaction}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card mt-8 rounded-3xl p-4 text-sm font-medium text-foreground/80"
          >
            <span className="font-bold text-primary">Mr. Zero:</span> {lastReaction}
          </motion.div>
        )}
      </div>
    </div>
  );
}
