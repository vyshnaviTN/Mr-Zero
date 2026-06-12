import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MrZero } from "@/components/MrZero";
import { SpeechBubble, speak } from "@/components/SpeechBubble";
import { SignIn } from "@clerk/tanstack-react-start";
import { useAuth } from "@clerk/tanstack-react-start";
import { useUid, pget } from "@/lib/pstore";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Project 0" },
      { name: "description", content: "Sign in to meet Mr. Zero and start your mission." },
    ],
  }),
  component: AuthPage,
});

const intro = ["Hello.", "I'm Mr. Zero.", "Every builder starts from zero."];

function AuthPage() {
  const navigate = useNavigate();
  const { uid, ready } = useUid();
  const [waving, setWaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(intro[0]);
  const [speaking, setSpeaking] = useState(false);
  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (isSignedIn) {
      const hasGoals = !!pget("p0_goals");
      const hasRoadmap = !!pget("p0_roadmap");
      if (hasGoals && hasRoadmap) navigate({ to: "/dashboard" });
      else if (hasGoals) navigate({ to: "/generating" });
      else navigate({ to: "/welcome" });
    }
  }, [isSignedIn, navigate]);

  useEffect(() => {
    let i = 0;
    const tick = () => {
      setMsg(intro[i]);
      setSpeaking(true);
      speak(intro[i]);
      setTimeout(() => setSpeaking(false), 2200);
      i = (i + 1) % intro.length;
    };
    tick();
    const id = setInterval(tick, 4500);
    return () => clearInterval(id);
  }, []);



  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
      <div className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-pink-300/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-pink-400/30 blur-3xl" />

      <div className="relative grid w-full max-w-5xl items-center gap-12 lg:grid-cols-[1fr_1fr]">
        <div className="flex flex-col items-center gap-6 lg:items-end lg:pr-8">
          <SpeechBubble message={msg} side="left" />
          <MrZero size={300} speaking={speaking} waving={waving} />
        </div>

        <motion.div
          initial={{ opacity: 0, x: 30, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 140, damping: 18 }}
          className="glass-card rounded-[2rem] p-8 sm:p-10"
        >
          <div className="flex justify-center w-full">
            <SignIn 
              routing="hash"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "w-full shadow-none bg-transparent m-0 p-0",
                  headerTitle: "text-2xl font-bold tracking-tight text-foreground",
                  headerSubtitle: "text-sm text-muted-foreground",
                  socialButtonsBlockButton: "rounded-2xl border-border bg-white/70 shadow-sm",
                  formButtonPrimary: "rounded-2xl bg-primary shadow-lg shadow-primary/40 hover:bg-primary/90 transition-all",
                  formFieldInput: "rounded-2xl border-border bg-white/70 px-4 py-3 text-sm focus:ring-4 focus:ring-primary/20",
                }
              }} 
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
