import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import { MrZero } from "@/components/MrZero";
import { speak } from "@/components/SpeechBubble";
import { generateRoadmap } from "@/lib/roadmap.functions";
import type { GoalData } from "@/components/GoalForm";
import { pget, pset, premove, useUid } from "@/lib/pstore";

export const Route = createFileRoute("/generating")({
  head: () => ({ meta: [{ title: "Building your roadmap — Project 0" }] }),
  component: Generating,
});

const stages = [
  "Analyzing your mission...",
  "Identifying the sub-skills you need...",
  "Estimating effort and difficulty...",
  "Distributing your hours across days...",
  "Creating milestones...",
];

function Generating() {
  const navigate = useNavigate();
  const generate = useServerFn(generateRoadmap);
  const [stage, setStage] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const raw = localStorage.getItem("p0_goals");
    if (!raw) {
      navigate({ to: "/discovery" });
      return;
    }
    const goals = JSON.parse(raw) as GoalData;

    let i = 0;
    speak(stages[0]);
    setStage(0);
    const stageId = setInterval(() => {
      i = Math.min(i + 1, stages.length - 1);
      setStage(i);
      speak(stages[i]);
    }, 1800);

    const minDelay = new Promise((r) => setTimeout(r, 6500));

    (async () => {
      try {
        const [, roadmap] = await Promise.all([minDelay, generate({ data: goals })]);
        localStorage.setItem("p0_roadmap", JSON.stringify(roadmap));
        localStorage.removeItem("p0_completed");
        clearInterval(stageId);
        speak("Your personalized roadmap is ready!");
        setTimeout(() => navigate({ to: "/dashboard" }), 900);
      } catch (e) {
        console.error(e);
        clearInterval(stageId);
        speak("Something went wrong. Let's try again.");
        setTimeout(() => navigate({ to: "/discovery" }), 1500);
      }
    })();

    return () => clearInterval(stageId);
  }, [navigate, generate]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </div>

      <div className="relative">
        {/* Orbiting dots */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary"
            animate={{ rotate: 360 }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: `${160 + i * 30}px center` }}
          />
        ))}
        <MrZero size={260} speaking />
      </div>

      <motion.div
        key={stage}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-12 text-center"
      >
        <div className="text-lg font-bold tracking-tight text-foreground">{stages[stage]}</div>
        <div className="mt-4 flex justify-center gap-1.5">
          {stages.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-8 rounded-full transition-all ${i <= stage ? "bg-primary" : "bg-primary/15"}`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
