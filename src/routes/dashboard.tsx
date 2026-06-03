import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/Sidebar";
import { MrZero } from "@/components/MrZero";
import { SpeechBubble, speak } from "@/components/SpeechBubble";
import { RoadmapCard, generateRoadmap, type Week } from "@/components/RoadmapCard";
import { Volume2 } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Project 0" }] }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const [goals, setGoals] = useState<{ goal: string; duration: string; hours: string } | null>(null);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("p0_goals");
    if (!raw) {
      navigate({ to: "/setup" });
      return;
    }
    const g = JSON.parse(raw);
    setGoals(g);
    setWeeks(generateRoadmap(g.goal));
    const welcome = `Here's your roadmap for ${g.goal}. Let's build, one zero at a time!`;
    setTimeout(() => {
      setMsg(welcome);
      setSpeaking(true);
      speak(welcome);
      setTimeout(() => setSpeaking(false), 3000);
    }, 400);
  }, [navigate]);

  const replay = () => {
    if (!goals) return;
    const m = `You're aiming for ${goals.goal} in ${goals.duration}, with ${goals.hours} daily. You've got this!`;
    setMsg(m);
    setSpeaking(true);
    speak(m);
    setTimeout(() => setSpeaking(false), 3500);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="relative flex-1 overflow-hidden p-8 lg:p-12">
        <div className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-pink-300/30 blur-3xl" />

        <div className="relative mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 flex flex-wrap items-start justify-between gap-6"
          >
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Your Mission
              </div>
              <h1 className="mt-2 text-4xl font-bold tracking-tight">{goals?.goal}</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {goals?.duration} · {goals?.hours} daily
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

          <div className="mb-10 flex items-end gap-6 rounded-[2rem] glass-card p-6">
            <MrZero size={160} speaking={speaking} />
            <div className="flex-1 pb-2">
              <SpeechBubble message={msg ?? "Ready when you are."} side="left" />
            </div>
          </div>

          <h2 className="mb-5 text-2xl font-bold tracking-tight">Your roadmap</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {weeks.map((w, i) => (
              <RoadmapCard key={w.week} week={w} index={i} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
