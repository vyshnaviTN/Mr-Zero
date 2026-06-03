import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { MrZero } from "@/components/MrZero";
import { SpeechBubble, speak } from "@/components/SpeechBubble";
import { GoalForm, type GoalData } from "@/components/GoalForm";

export const Route = createFileRoute("/setup")({
  head: () => ({ meta: [{ title: "Setup — Project 0" }] }),
  component: Setup,
});

function Setup() {
  const navigate = useNavigate();
  const [msg, setMsg] = useState<string | null>("Tell me your goal and I'll help you build a plan.");
  const [speaking, setSpeaking] = useState(false);
  const [waving, setWaving] = useState(false);

  const say = (text: string) => {
    setMsg(text);
    setSpeaking(true);
    speak(text);
    setTimeout(() => setSpeaking(false), 2200);
  };

  const handleSubmit = (data: GoalData) => {
    setWaving(true);
    localStorage.setItem("p0_goals", JSON.stringify(data));
    say("Analyzing your mission...");
    setTimeout(() => say("Creating your roadmap..."), 1800);
    setTimeout(() => navigate({ to: "/dashboard" }), 3600);
  };

  return (
    <div className="relative min-h-screen overflow-hidden px-6 py-12">
      <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-pink-300/40 blur-3xl" />

      <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-[1fr_1fr]">
        <div className="flex flex-col items-center gap-6 lg:items-start">
          <SpeechBubble message={msg} side="right" />
          <MrZero size={300} speaking={speaking} waving={waving} />
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
          </div>
          <GoalForm onSubmit={handleSubmit} />
        </motion.div>
      </div>
    </div>
  );
}
