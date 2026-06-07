import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Check, Target, Clock } from "lucide-react";
import { useP0 } from "@/lib/p0-state";
import { speak } from "@/components/SpeechBubble";

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
  const { goals, pillars, todayLog, todayPct, togglePillar } = useP0();
  const [lastReaction, setLastReaction] = useState<string | null>(null);

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

        {lastReaction && (
          <motion.div
            key={lastReaction}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card mt-6 rounded-3xl p-4 text-sm font-medium text-foreground/80"
          >
            <span className="font-bold text-primary">Mr. Zero:</span> {lastReaction}
          </motion.div>
        )}
      </div>
    </div>
  );
}
