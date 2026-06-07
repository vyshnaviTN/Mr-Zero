import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Trophy, Lock, Sparkles } from "lucide-react";
import { useP0 } from "@/lib/p0-state";
import { BADGES } from "@/lib/streaks";
import { speak } from "@/components/SpeechBubble";

export const Route = createFileRoute("/_app/badges")({
  head: () => ({ meta: [{ title: "Badges — Project 0" }] }),
  component: BadgesPage,
});

function BadgesPage() {
  const { streak } = useP0();
  const [celebrate, setCelebrate] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen: string[] = JSON.parse(localStorage.getItem("p0_badges_seen") ?? "[]");
    const newly = BADGES.find((b) => streak.longest >= b.days && !seen.includes(b.id));
    if (newly) {
      setCelebrate(newly.label);
      localStorage.setItem("p0_badges_seen", JSON.stringify([...seen, newly.id]));
      speak(`You unlocked ${newly.label}!`);
      setTimeout(() => setCelebrate(null), 4500);
    }
  }, [streak.longest]);

  return (
    <div className="relative p-8 lg:p-12">
      <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-pink-300/30 blur-3xl" />
      <div className="relative mx-auto max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            Achievements
          </div>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">Badges</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Unlock badges automatically by maintaining your streak.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BADGES.map((b, i) => {
            const unlocked = streak.longest >= b.days;
            const remaining = Math.max(0, b.days - streak.longest);
            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -4 }}
                className={`relative overflow-hidden rounded-3xl border p-6 text-center transition-all ${
                  unlocked
                    ? "border-primary/40 bg-gradient-to-br from-white to-primary/15 shadow-lg shadow-primary/20"
                    : "border-border bg-white/60"
                }`}
              >
                {unlocked && (
                  <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/30 blur-2xl" />
                )}
                <div
                  className={`mx-auto grid h-16 w-16 place-items-center rounded-full ${
                    unlocked
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/40"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {unlocked ? <Trophy className="h-8 w-8" /> : <Lock className="h-7 w-7" />}
                </div>
                <div className="mt-4 text-lg font-bold tracking-tight">{b.label}</div>
                <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {b.days} days
                </div>
                <div
                  className={`mt-3 text-xs font-medium ${
                    unlocked ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {unlocked
                    ? "Unlocked ✨"
                    : `${remaining} day${remaining === 1 ? "" : "s"} to go`}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {celebrate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm"
            onClick={() => setCelebrate(null)}
          >
            <motion.div
              initial={{ scale: 0.6, rotate: -8 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 18 }}
              className="glass-card relative max-w-sm rounded-3xl p-8 text-center"
            >
              <Sparkles className="absolute right-4 top-4 h-5 w-5 text-primary" />
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/50">
                <Trophy className="h-10 w-10" />
              </div>
              <h2 className="mt-4 text-2xl font-bold tracking-tight">Badge unlocked!</h2>
              <p className="mt-2 text-lg font-bold text-primary">{celebrate}</p>
              <p className="mt-3 text-sm text-muted-foreground">
                Mr. Zero says: showing up every day is the real skill.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
