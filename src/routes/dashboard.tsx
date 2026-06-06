import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import { Sidebar } from "@/components/Sidebar";
import { MrZero } from "@/components/MrZero";
import { SpeechBubble, speak } from "@/components/SpeechBubble";
import { RoadmapCard } from "@/components/RoadmapCard";
import { MrZeroChat } from "@/components/MrZeroChat";
import { StreakHeatmap } from "@/components/StreakHeatmap";
import { generateRoadmap, type Roadmap } from "@/lib/roadmap.functions";
import {
  BADGES,
  bumpStreakIfComplete,
  completionPercent,
  loadDaily,
  loadStreak,
  monthlyConsistency,
  saveDaily,
  saveStreak,
  todayKey,
  type DayLog,
  type StreakState,
} from "@/lib/streaks";
import {
  Volume2,
  Zap,
  Frown,
  AlertTriangle,
  RefreshCw,
  Flame,
  Trophy,
  Check,
  Lock,
  Target,
} from "lucide-react";
import type { GoalData } from "@/components/GoalForm";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Project 0" }] }),
  component: Dashboard,
});

const diffColor: Record<string, string> = {
  Easy: "bg-emerald-100 text-emerald-700",
  Medium: "bg-amber-100 text-amber-700",
  Hard: "bg-rose-100 text-rose-700",
};

function Dashboard() {
  const navigate = useNavigate();
  const regenerate = useServerFn(generateRoadmap);
  const [goals, setGoals] = useState<GoalData | null>(null);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [msg, setMsg] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [adapting, setAdapting] = useState(false);

  // Daily pillar tracking
  const [pillars, setPillars] = useState<string[]>([]);
  const [daily, setDaily] = useState<Record<string, DayLog>>({});
  const [streak, setStreak] = useState<StreakState>({
    current: 0,
    longest: 0,
    lastFullDate: null,
  });

  const today = todayKey();
  const todayLog: DayLog = useMemo(
    () =>
      daily[today] ?? {
        completed: pillars.map(() => false),
        total: pillars.length,
      },
    [daily, today, pillars],
  );
  const todayPct = completionPercent(todayLog);

  useEffect(() => {
    const rawGoals = localStorage.getItem("p0_goals");
    const rawRoadmap = localStorage.getItem("p0_roadmap");
    if (!rawGoals || !rawRoadmap) {
      navigate({ to: rawGoals ? "/generating" : "/discovery" });
      return;
    }
    const g = JSON.parse(rawGoals) as GoalData;
    const r = JSON.parse(rawRoadmap) as Roadmap;
    setGoals(g);
    setRoadmap(r);

    const rawDone = localStorage.getItem("p0_completed");
    if (rawDone) setCompleted(new Set(JSON.parse(rawDone)));

    const p =
      g.pillars && g.pillars.length
        ? g.pillars
        : JSON.parse(localStorage.getItem("p0_pillars") ?? "[]");
    setPillars(p);

    const d = loadDaily();
    // Ensure today's log shape matches the pillars
    if (!d[today] || d[today].total !== p.length) {
      d[today] = {
        completed: (d[today]?.completed ?? []).slice(0, p.length).concat(
          Array(Math.max(0, p.length - (d[today]?.completed?.length ?? 0))).fill(false),
        ),
        total: p.length,
      };
      saveDaily(d);
    }
    setDaily(d);
    setStreak(loadStreak());

    setTimeout(() => {
      const welcome =
        r.summary || `Here's your plan for ${g.goal}. Let's build, one zero at a time!`;
      setMsg(welcome);
      setSpeaking(true);
      speak(welcome);
      setTimeout(() => setSpeaking(false), 3200);
    }, 400);
  }, [navigate, today]);

  const togglePillar = (idx: number) => {
    setDaily((prev) => {
      const next = { ...prev };
      const log: DayLog = {
        completed: [...(next[today]?.completed ?? pillars.map(() => false))],
        total: pillars.length,
      };
      log.completed[idx] = !log.completed[idx];
      next[today] = log;
      saveDaily(next);

      // Streak bump
      const nextStreak = bumpStreakIfComplete(today, log, loadStreak());
      saveStreak(nextStreak);
      setStreak(nextStreak);
      return next;
    });
  };

  const toggleMission = (id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem("p0_completed", JSON.stringify([...next]));
      return next;
    });
  };

  const totalMissions = useMemo(
    () =>
      roadmap?.weeks?.reduce(
        (a, w) => a + w.days.reduce((b, d) => b + d.missions.length, 0),
        0,
      ) ?? 0,
    [roadmap],
  );
  const completionRate = totalMissions
    ? Math.round((completed.size / totalMissions) * 100)
    : 0;

  const replay = () => {
    if (!goals) return;
    const m = `You're aiming for ${goals.goal} in ${goals.duration}, ${goals.hours} hours a day. Today: ${todayPct}% — keep going!`;
    setMsg(m);
    setSpeaking(true);
    speak(m);
    setTimeout(() => setSpeaking(false), 3500);
  };

  const adapt = async (note: string) => {
    if (!goals || adapting) return;
    setAdapting(true);
    setMsg("Recalculating your roadmap…");
    speak("Recalculating your roadmap");
    try {
      const next = await regenerate({
        data: {
          ...goals,
          adaptation: {
            note,
            completed: [...completed],
            missedDays: note.toLowerCase().includes("missed") ? 3 : 0,
          },
        },
      });
      setRoadmap(next);
      localStorage.setItem("p0_roadmap", JSON.stringify(next));
      setMsg(next.summary || "Updated! Your plan has been rebalanced.");
      speak("Your plan has been rebalanced.");
    } catch (e) {
      console.error(e);
      setMsg("Couldn't rebalance right now. Try again in a moment.");
    } finally {
      setAdapting(false);
    }
  };

  const consistency = useMemo(() => monthlyConsistency(daily), [daily]);

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="relative flex-1 overflow-hidden p-8 lg:p-12">
        <div className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-pink-300/30 blur-3xl" />

        <div className="relative mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex flex-wrap items-start justify-between gap-6"
          >
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Your Mission
              </div>
              <h1 className="mt-2 text-4xl font-bold tracking-tight">{goals?.goal}</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {goals?.duration} · {goals?.hours}h/day · {goals?.skillLevel} ·{" "}
                {roadmap?.totalHours ?? 0}h planned
              </p>
            </div>
            <button
              onClick={replay}
              className="flex items-center gap-2 rounded-2xl border border-primary/30 bg-white/60 px-4 py-2.5 text-sm font-semibold text-primary shadow-sm transition-all hover:bg-primary hover:text-primary-foreground"
            >
              <Volume2 className="h-4 w-4" />
              Hear from Mr. Zero
            </button>
          </motion.div>

          <div className="mb-10 grid gap-8 lg:grid-cols-[auto_1fr] lg:items-center">
            <HeroZero
              speaking={speaking}
              progress={todayPct}
              onSay={(t) => {
                setMsg(t);
                setSpeaking(true);
                speak(t);
                setTimeout(() => setSpeaking(false), 2400);
              }}
            />

            <div className="space-y-4">
              <SpeechBubble message={msg ?? "Ready when you are."} side="left" />

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
                  label="Longest"
                  value={
                    <span className="inline-flex items-center gap-1">
                      <Trophy className="h-4 w-4 text-primary" />
                      {streak.longest}d
                    </span>
                  }
                />
                <Stat label="This month" value={`${consistency}%`} />
              </div>

              <div className="flex flex-wrap gap-2">
                <AdaptButton
                  icon={Zap}
                  label="I finished early"
                  onClick={() =>
                    adapt(
                      "User finished planned tasks early — accelerate and add stretch goals.",
                    )
                  }
                  disabled={adapting}
                />
                <AdaptButton
                  icon={Frown}
                  label="I missed a few days"
                  onClick={() =>
                    adapt(
                      "User missed about 3 days — redistribute remaining workload without overload.",
                    )
                  }
                  disabled={adapting}
                />
                <AdaptButton
                  icon={AlertTriangle}
                  label="This topic is hard"
                  onClick={() =>
                    adapt(
                      "User finds the current focus topic difficult — allocate more time, slow pace, add foundational practice.",
                    )
                  }
                  disabled={adapting}
                />
                <AdaptButton
                  icon={RefreshCw}
                  label="Priorities changed"
                  onClick={() =>
                    adapt(
                      "User's priorities changed — rebalance remaining plan accordingly without restarting.",
                    )
                  }
                  disabled={adapting}
                />
              </div>
            </div>
          </div>

          {/* Daily Pillars */}
          {pillars.length > 0 && (
            <section className="glass-card mb-8 rounded-3xl p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-widest text-primary">
                    Today · {today}
                  </div>
                  <h2 className="mt-1 text-xl font-bold tracking-tight">
                    Your daily pillars
                  </h2>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">{todayPct}%</div>
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    progress
                  </div>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {pillars.map((p, i) => {
                  const done = todayLog.completed[i];
                  return (
                    <motion.button
                      key={p + i}
                      whileHover={{ y: -3 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => togglePillar(i)}
                      className={`group relative overflow-hidden rounded-2xl border p-5 text-left transition-all ${
                        done
                          ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/40"
                          : "border-border bg-white/70 hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">
                          Task {i + 1}
                        </span>
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-full ${
                            done ? "bg-white text-primary" : "bg-primary/10 text-primary"
                          }`}
                        >
                          {done ? <Check className="h-3.5 w-3.5" /> : <Target className="h-3.5 w-3.5" />}
                        </div>
                      </div>
                      <div className="mt-2 text-lg font-bold tracking-tight">{p}</div>
                    </motion.button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Streak Heatmap */}
          <section className="glass-card mb-8 rounded-3xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-primary">
                  Consistency
                </div>
                <h2 className="mt-1 text-xl font-bold tracking-tight">
                  Your streak heatmap
                </h2>
              </div>
              <div className="text-right text-[11px] font-medium text-muted-foreground">
                Hover any square to see daily progress.
              </div>
            </div>
            <div className="overflow-x-auto">
              <StreakHeatmap daily={daily} days={91} />
            </div>
          </section>

          {/* Badges */}
          <section className="glass-card mb-10 rounded-3xl p-6">
            <div className="mb-4">
              <div className="text-xs font-semibold uppercase tracking-widest text-primary">
                Badges
              </div>
              <h2 className="mt-1 text-xl font-bold tracking-tight">
                Earn them by showing up.
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {BADGES.map((b) => {
                const unlocked = streak.longest >= b.days;
                return (
                  <motion.div
                    key={b.id}
                    whileHover={{ y: -3 }}
                    className={`relative overflow-hidden rounded-2xl border p-4 text-center ${
                      unlocked
                        ? "border-primary/40 bg-gradient-to-br from-white/80 to-primary/10"
                        : "border-border bg-white/60 opacity-70"
                    }`}
                  >
                    <div
                      className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${
                        unlocked ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary/60"
                      }`}
                    >
                      {unlocked ? <Trophy className="h-6 w-6" /> : <Lock className="h-5 w-5" />}
                    </div>
                    <div className="mt-2 text-sm font-bold tracking-tight">{b.label}</div>
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      {b.days} days
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* Topic effort with weakness reasoning */}
          {roadmap?.topics && roadmap.topics.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-foreground/60">
                Weakness-weighted time allocation
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {roadmap.topics.map((t) => (
                  <div key={t.name} className="glass-card rounded-2xl p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-sm font-bold">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            diffColor[t.difficulty] ?? ""
                          }`}
                        >
                          {t.difficulty}
                        </span>
                        {t.name}
                      </div>
                      <div className="text-sm font-bold text-primary">
                        {t.percent ?? 0}%
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-primary/10">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${t.percent ?? 0}%` }}
                      />
                    </div>
                    <div className="mt-2 text-[11px] text-muted-foreground">
                      {t.hours}h · {t.reason}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Your weekly roadmap</h2>
            <div className="text-xs font-medium text-muted-foreground">
              {completed.size}/{totalMissions} missions · {completionRate}% total
            </div>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            {roadmap?.weeks?.map((w, i) => (
              <RoadmapCard
                key={w.week}
                week={w}
                index={i}
                completed={completed}
                onToggle={toggleMission}
              />
            ))}
          </div>

          {roadmap?.encouragement && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-10 text-center text-sm italic text-primary/80"
            >
              "{roadmap.encouragement}"
            </motion.p>
          )}
        </div>
      </main>
      <MrZeroChat />
    </div>
  );
}

const HOVER_MESSAGES = [
  "You only need one task to move forward.",
  "Builders are made through consistency.",
  "Today's progress becomes tomorrow's confidence.",
  "Small reps. Every single day. That's the formula.",
  "Done beats perfect. Always.",
  "The roadmap waits. You don't have to.",
];

function HeroZero({
  speaking,
  progress,
  onSay,
}: {
  speaking: boolean;
  progress: number;
  onSay: (t: string) => void;
}) {
  const hover = () => {
    const m = HOVER_MESSAGES[Math.floor(Math.random() * HOVER_MESSAGES.length)];
    onSay(m);
  };
  const size = 280;
  const r = size / 2 - 8;
  const c = 2 * Math.PI * r;
  return (
    <div
      onMouseEnter={hover}
      className="relative mx-auto"
      style={{ width: size, height: size }}
    >
      <svg className="absolute inset-0 -rotate-90" width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#FFC1D6" strokeWidth="6" fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#FF4D94"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (c * progress) / 100 }}
          transition={{ type: "spring", stiffness: 60, damping: 20 }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <MrZero size={size - 60} speaking={speaking} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="glass-card rounded-2xl px-4 py-3">
      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-lg font-bold text-foreground">{value}</div>
    </div>
  );
}

function AdaptButton({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: typeof Zap;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1.5 rounded-full border border-border bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-foreground/80 transition-all hover:border-primary hover:text-primary disabled:opacity-50"
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
