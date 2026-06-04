import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import { MrZero } from "@/components/MrZero";
import { SpeechBubble, speak } from "@/components/SpeechBubble";
import { GoalForm, type GoalData } from "@/components/GoalForm";
import { generateRoadmap } from "@/lib/roadmap.functions";

export const Route = createFileRoute("/setup")({
  head: () => ({ meta: [{ title: "Setup — Project 0" }] }),
  component: Setup,
});

function Setup() {
  const navigate = useNavigate();
  const generate = useServerFn(generateRoadmap);
  const [msg, setMsg] = useState<string | null>("Tell me your goal and I'll design a plan just for you.");
  const [speaking, setSpeaking] = useState(false);
  const [waving, setWaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const say = (text: string) => {
    setMsg(text);
    setSpeaking(true);
    speak(text);
    setTimeout(() => setSpeaking(false), 2200);
  };

  const handleSubmit = async (data: GoalData) => {
    setWaving(true);
    setLoading(true);
    localStorage.setItem("p0_goals", JSON.stringify(data));
    say("Decomposing your goal...");
    setTimeout(() => say("Analyzing prerequisites and difficulty..."), 1600);
    setTimeout(() => say("Distributing your hours..."), 3200);
    try {
      const roadmap = await generate({ data });
      localStorage.setItem("p0_roadmap", JSON.stringify(roadmap));
      localStorage.removeItem("p0_completed");
      say("Your personalized roadmap is ready!");
      setTimeout(() => navigate({ to: "/dashboard" }), 900);
    } catch (e) {
      console.error(e);
      say("Something went wrong building your roadmap. Try again?");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden px-6 py-12">
      <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-pink-300/40 blur-3xl" />

      <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-[1fr_1fr]">
        <div className="flex flex-col items-center gap-6 lg:items-start">
          <SpeechBubble message={msg} side="right" />
          <MrZero size={300} speaking={speaking} waving={waving} />
          {loading && (
            <div className="text-xs font-medium text-primary/80">
              Crafting your dynamic roadmap with AI…
            </div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 140, damping: 18 }}
          className="glass-card rounded-[2rem] p-8 sm:p-10"
        >
          <div className="mb-6">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Step 1 · Setup
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Let's plan your mission</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Every roadmap is generated from scratch — no templates.
            </p>
          </div>
          <GoalForm onSubmit={handleSubmit} />
        </motion.div>
      </div>
    </div>
  );
}
