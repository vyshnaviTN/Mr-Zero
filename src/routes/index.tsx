import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MrZero } from "@/components/MrZero";
import { SpeechBubble, speak } from "@/components/SpeechBubble";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Project 0 — Meet Mr. Zero" },
      { name: "description", content: "Your friendly AI companion that builds your roadmap from zero." },
    ],
  }),
  component: Login,
});

const intro = [
  "Hello! I'm Mr. Zero.",
  "Every builder starts from zero.",
  "Sign in and let's begin your journey.",
];

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [waving, setWaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(intro[0]);
  const [speaking, setSpeaking] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !pw) return;
    setWaving(true);
    setMsg("Welcome aboard! Let's set things up.");
    speak("Welcome aboard! Let's set things up.");
    localStorage.setItem("p0_user", email);
    setTimeout(() => navigate({ to: "/setup" }), 1100);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-pink-300/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-pink-400/30 blur-3xl" />

      <div className="relative grid w-full max-w-5xl items-center gap-12 lg:grid-cols-[1fr_1fr]">
        {/* Mr. Zero side */}
        <div className="flex flex-col items-center gap-6 lg:items-end lg:pr-8">
          <SpeechBubble message={msg} side="left" />
          <MrZero size={300} speaking={speaking} waving={waving} />
        </div>

        {/* Login card */}
        <motion.div
          initial={{ opacity: 0, x: 30, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 140, damping: 18 }}
          className="glass-card rounded-[2rem] p-8 sm:p-10"
        >
          <div className="mb-6">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Project 0
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Welcome back</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to talk with Mr. Zero.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground/70">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-border bg-white/70 px-5 py-3.5 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground/70">Password</label>
              <input
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-border bg-white/70 px-5 py-3.5 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/20"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="mt-2 rounded-2xl bg-primary px-6 py-4 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/40 transition-shadow hover:shadow-xl hover:shadow-primary/60"
            >
              Continue
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
