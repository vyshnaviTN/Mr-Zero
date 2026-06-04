import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MrZero } from "@/components/MrZero";
import { SpeechBubble, speak } from "@/components/SpeechBubble";

export const Route = createFileRoute("/welcome")({
  head: () => ({ meta: [{ title: "Welcome — Project 0" }] }),
  component: Welcome,
});

const lines = [
  "Welcome to Project 0.",
  "My job is to help you build consistency.",
  "Before I create your roadmap, I need to understand your mission.",
];

function Welcome() {
  const navigate = useNavigate();
  const [idx, setIdx] = useState(0);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("p0_user")) {
      navigate({ to: "/" });
      return;
    }
    let i = 0;
    const tick = () => {
      setIdx(i);
      setSpeaking(true);
      speak(lines[i]);
      setTimeout(() => setSpeaking(false), 2200);
      i = (i + 1) % lines.length;
    };
    tick();
    const id = setInterval(tick, 3400);
    return () => clearInterval(id);
  }, [navigate]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
      <div className="pointer-events-none absolute -left-32 top-0 h-[28rem] w-[28rem] rounded-full bg-pink-300/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-[28rem] w-[28rem] rounded-full bg-pink-400/30 blur-3xl" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <SpeechBubble message={lines[idx]} side="left" />
      </motion.div>

      <MrZero size={380} speaking={speaking} waving />

      <motion.button
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, type: "spring", stiffness: 160, damping: 18 }}
        whileHover={{ scale: 1.04, y: -3 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate({ to: "/discovery" })}
        className="mt-12 rounded-full bg-primary px-10 py-4 text-base font-bold text-primary-foreground shadow-xl shadow-primary/50"
      >
        Start Mission Setup →
      </motion.button>

      <p className="mt-6 text-xs uppercase tracking-[0.3em] text-primary/70">Every builder starts from zero</p>
    </div>
  );
}
