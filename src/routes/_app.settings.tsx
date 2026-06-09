import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { LogOut, RefreshCw, Zap, Frown, AlertTriangle } from "lucide-react";
import { useP0 } from "@/lib/p0-state";
import { generateRoadmap } from "@/lib/roadmap.functions";
import { speak } from "@/components/SpeechBubble";
import { pget, pclearAll } from "@/lib/pstore";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — Project 0" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const { goals, roadmap, setRoadmap } = useP0();
  const regenerate = useServerFn(generateRoadmap);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const adapt = async (note: string) => {
    if (!goals || busy) return;
    setBusy(true);
    setStatus("Recalculating your roadmap…");
    speak("Recalculating your roadmap.");
    try {
      const completed: string[] = JSON.parse(localStorage.getItem("p0_completed") ?? "[]");
      const next = await regenerate({
        data: {
          ...goals,
          adaptation: {
            note,
            completed,
            missedDays: note.toLowerCase().includes("missed") ? 3 : 0,
          },
        },
      });
      setRoadmap(next);
      setStatus("Your plan has been rebalanced.");
      speak("Your plan has been rebalanced.");
    } catch (e) {
      console.error(e);
      setStatus("Couldn't rebalance right now. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    if (!confirm("Start over? Your roadmap, streaks, and progress will be cleared.")) return;
    ["p0_user", "p0_goals", "p0_roadmap", "p0_pillars", "p0_completed", "p0_daily", "p0_streak", "p0_badges_seen", "p0_chat"].forEach(
      (k) => localStorage.removeItem(k),
    );
    navigate({ to: "/" });
  };

  return (
    <div className="relative p-8 lg:p-12">
      <div className="pointer-events-none absolute -right-32 top-10 h-96 w-96 rounded-full bg-pink-300/30 blur-3xl" />
      <div className="relative mx-auto max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            Settings
          </div>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">Your profile</h1>
        </motion.div>

        <div className="glass-card mb-6 rounded-3xl p-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-primary">Mission</h2>
          <div className="mt-3 space-y-2 text-sm">
            <Row label="Goal" value={goals?.goal} />
            <Row label="Duration" value={goals?.duration} />
            <Row label="Hours / day" value={goals?.hours} />
            <Row label="Pillars" value={goals?.pillars?.join(" · ")} />
            <Row label="Weakest" value={goals?.weakestPillar} />
            <Row label="Strongest" value={goals?.strongestPillar} />
            <Row label="Total planned" value={roadmap ? `${roadmap.totalHours}h` : "—"} />
          </div>
        </div>

        <div className="glass-card mb-6 rounded-3xl p-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-primary">
            Adapt your roadmap
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Mr. Zero rebalances the remaining plan — never a full restart.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <AdaptButton
              icon={Zap}
              label="I finished early"
              onClick={() =>
                adapt("User finished planned tasks early — accelerate and add stretch goals.")
              }
              disabled={busy}
            />
            <AdaptButton
              icon={Frown}
              label="I missed a few days"
              onClick={() =>
                adapt("User missed about 3 days — redistribute remaining workload without overload.")
              }
              disabled={busy}
            />
            <AdaptButton
              icon={AlertTriangle}
              label="This topic is hard"
              onClick={() =>
                adapt(
                  "User finds the current focus topic difficult — allocate more time, slow pace, add foundational practice.",
                )
              }
              disabled={busy}
            />
            <AdaptButton
              icon={RefreshCw}
              label="Priorities changed"
              onClick={() =>
                adapt("User's priorities changed — rebalance remaining plan accordingly without restarting.")
              }
              disabled={busy}
            />
          </div>
          {status && (
            <div className="mt-4 rounded-2xl bg-primary/10 px-4 py-2 text-xs font-medium text-primary">
              {status}
            </div>
          )}
        </div>

        <div className="glass-card rounded-3xl p-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-destructive">
            Danger zone
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Clears your mission, streaks, and progress.
          </p>
          <button
            onClick={reset}
            className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-destructive/30 bg-white px-4 py-2.5 text-sm font-bold text-destructive transition-all hover:bg-destructive hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Reset & log out
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/50 py-1.5 last:border-0">
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <span className="text-right font-medium">{value || "—"}</span>
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
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-white/70 px-4 py-3 text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-primary-foreground disabled:opacity-50"
    >
      <Icon className="h-4 w-4" />
      {label}
    </motion.button>
  );
}
