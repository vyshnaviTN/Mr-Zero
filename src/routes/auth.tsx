import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MrZero } from "@/components/MrZero";
import { SpeechBubble, speak } from "@/components/SpeechBubble";
import { supabase } from "@/integrations/supabase/client";
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
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [name, setName] = useState("");
  const [waving, setWaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(intro[0]);
  const [speaking, setSpeaking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (ready && uid) {
      const hasGoals = !!pget("p0_goals");
      const hasRoadmap = !!pget("p0_roadmap");
      if (hasGoals && hasRoadmap) navigate({ to: "/dashboard" });
      else if (hasGoals) navigate({ to: "/generating" });
      else navigate({ to: "/welcome" });
    }
  }, [ready, uid, navigate]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !pw || busy) return;
    setBusy(true);
    setErr(null);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password: pw,
          options: {
            emailRedirectTo: window.location.origin,
            data: { name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
        if (error) throw error;
      }
      setWaving(true);
      setMsg("Welcome aboard!");
      speak("Welcome aboard!");
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : "Something went wrong.";
      setErr(m);
      setMsg("Hmm, try again?");
      speak("Hmm, try again?");
    } finally {
      setBusy(false);
    }
  };

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
          <div className="mb-6">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Project 0
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              {mode === "signup" ? "Create your account" : "Welcome back"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "signup"
                ? "Mr. Zero will build your roadmap from zero."
                : "Sign in to continue your mission."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === "signup" && (
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground/70">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="What should Mr. Zero call you?"
                  className="w-full rounded-2xl border border-border bg-white/70 px-5 py-3.5 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/20"
                />
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground/70">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-border bg-white/70 px-5 py-3.5 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/20"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground/70">Password</label>
              <input
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                className="w-full rounded-2xl border border-border bg-white/70 px-5 py-3.5 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/20"
                required
              />
            </div>

            {err && (
              <div className="rounded-xl bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                {err}
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={busy}
              className="mt-2 rounded-2xl bg-primary px-6 py-4 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/40 transition-shadow hover:shadow-xl hover:shadow-primary/60 disabled:opacity-50"
            >
              {busy ? "…" : mode === "signup" ? "Create account" : "Continue"}
            </motion.button>

            <button
              type="button"
              onClick={() => {
                setErr(null);
                setMode(mode === "signin" ? "signup" : "signin");
              }}
              className="text-center text-xs font-medium text-primary hover:underline"
            >
              {mode === "signin"
                ? "New here? Create an account"
                : "Already have an account? Sign in"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
