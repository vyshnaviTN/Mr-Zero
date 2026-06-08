import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MrZero } from "@/components/MrZero";
import { SpeechBubble, speak } from "@/components/SpeechBubble";
import { useP0, builderLevel } from "@/lib/p0-state";
import { Flame, Trophy, Sparkles, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Home — Project 0" }] }),
  component: DashboardHome,
});

const HOVER_MESSAGES = [
  "Keep building.",
  "One task at a time.",
  "Protect your streak.",
  "Consistency beats intensity.",
  "Today's effort becomes tomorrow's confidence.",
];

function pickMotivation(todayPct: number, streak: number, pillars: number) {
  if (todayPct === 100) return "Today is locked in. Your streak just grew stronger.";
  if (todayPct >= 75) return `You only need one more task to protect today's streak.`;
  if (todayPct >= 50) return "Halfway done. Don't lose the rhythm now.";
  if (streak >= 3 && todayPct === 0) return `${streak}-day streak on the line — start your first task.`;
  if (todayPct > 0) return "Momentum started. Keep moving.";
  return `${pillars} tasks waiting. The first one is always the hardest.`;
}

function ProgressRing({ progress, size = 320 }: { progress: number; size?: number }) {
  const r = (size - 16) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg className="absolute inset-0 -rotate-90" width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke="#FFC1D6" strokeWidth="8" fill="none" />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="#FF4D94"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c - (c * progress) / 100 }}
        transition={{ type: "spring", stiffness: 60, damping: 20 }}
      />
    </svg>
  );
}

function DashboardHome() {
  const { goals, pillars, todayLog, todayPct, streak } = useP0();
  const [speaking, setSpeaking] = useState(false);
  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    if (!pillars.length) return;
    const m = pickMotivation(todayPct, streak.current, pillars.length);
    setMsg(m);
    setSpeaking(true);
    speak(m);
    const t = setTimeout(() => setSpeaking(false), 2800);
    return () => clearTimeout(t);
  }, [todayPct, streak.current, pillars.length]);

  const completedToday = todayLog.completed.filter(Boolean).length;
  const level = builderLevel(streak.longest);

  return (
    <div className="relative p-8 lg:p-12">
      <div className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-pink-300/30 blur-3xl" />
      <div className="relative mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            Your Mission
          </div>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">{goals?.goal ?? "Welcome back"}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {goals ? `${goals.duration} · ${goals.hours}h/day` : "Let's get started."}
          </p>
        </motion.div>

        <div className="grid gap-10 lg:grid-cols-[auto_1fr] lg:items-center">
          {/* Mr. Zero with progress ring */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 140, damping: 20 }}
            className="relative mx-auto"
            style={{ width: 320, height: 320 }}
          >
            <ProgressRing progress={todayPct} />
            <div className="absolute inset-0 grid place-items-center">
              <MrZero
                size={240}
                speaking={speaking}
                interactive
                mood={
                  todayPct === 100
                    ? "celebrate"
                    : todayPct >= 50
                    ? "happy"
                    : streak.current === 0 && todayPct === 0
                    ? "think"
                    : "idle"
                }
                onPoke={(r) => {
                  setMsg(r);
                  setSpeaking(true);
                  speak(r);
                  setTimeout(() => setSpeaking(false), 2000);
                }}
                onHoverMessage={(r) => {
                  setMsg(r);
                  setSpeaking(true);
                  speak(r);
                  setTimeout(() => setSpeaking(false), 1800);
                }}
              />
            </div>
          </motion.div>


          <div className="space-y-5">
            <SpeechBubble message={msg || "Ready when you are."} side="left" />

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Today" value={`${todayPct}%`} />
              <Stat
                label="Streak"
                value={
                  <span className="inline-flex items-center gap-1">
                    <Flame className="h-4 w-4 text-primary" />
                    {streak.current}d
                  </span>
                }
              />
              <Stat
                label="Level"
                value={
                  <span className="inline-flex items-center gap-1">
                    <Trophy className="h-4 w-4 text-primary" />
                    Lv {level}
                  </span>
                }
              />
              <Stat label="Tasks" value={`${completedToday}/${pillars.length || 4}`} />
            </div>

            <div className="glass-card rounded-3xl p-5">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-primary">
                    Today's Summary
                  </div>
                  <p className="mt-1 text-sm font-medium text-foreground/85">{msg}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/tasks"
                className="rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/40 transition-transform hover:-translate-y-0.5"
              >
                Open today's tasks →
              </Link>
              <button
                onClick={() => {
                  const m = "Ask me anything — concepts, your plan, motivation.";
                  setMsg(m);
                  setSpeaking(true);
                  speak(m);
                  setTimeout(() => setSpeaking(false), 2200);
                }}
                className="flex items-center gap-2 rounded-2xl border border-primary/30 bg-white/60 px-5 py-3 text-sm font-semibold text-primary transition-all hover:bg-primary/10"
              >
                <MessageCircle className="h-4 w-4" />
                Quick chat
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-xl font-bold tracking-tight">{value}</div>
    </div>
  );
}
