import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MrZero } from "@/components/MrZero";
import { speak } from "@/components/SpeechBubble";
import type { GoalData } from "@/components/GoalForm";

export const Route = createFileRoute("/discovery")({
  head: () => ({ meta: [{ title: "Discovery — Project 0" }] }),
  component: Discovery,
});

type Field = keyof GoalData;

interface Step {
  field: Field;
  question: string;
  placeholder: string;
  suggestions?: string[];
  type?: "text" | "chips" | "number";
}

const steps: Step[] = [
  {
    field: "goal",
    question: "First — what is your goal?",
    placeholder: "e.g. Crack product-based placements",
    suggestions: ["Placement Preparation", "Learn AI", "Constitutional Law", "Learn Frontend Development"],
  },
  {
    field: "duration",
    question: "How much time do you have?",
    placeholder: "e.g. 60 days",
    suggestions: ["30 Days", "60 Days", "90 Days"],
    type: "chips",
  },
  {
    field: "hours",
    question: "How many hours can you dedicate daily?",
    placeholder: "e.g. 4",
    type: "number",
  },
  {
    field: "skillLevel",
    question: "What is your current level?",
    placeholder: "Beginner / Intermediate / Advanced",
    suggestions: ["Beginner", "Intermediate", "Advanced"],
    type: "chips",
  },
  {
    field: "weakAreas",
    question: "Any weak areas I should plan around?",
    placeholder: "e.g. Dynamic programming, system design — or 'none'",
  },
];

interface ChatMsg {
  from: "zero" | "user";
  text: string;
}

function Discovery() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<GoalData>({
    goal: "",
    duration: "",
    hours: "",
    skillLevel: "Beginner",
    experience: "",
    weakAreas: "",
    learningStyle: "Mixed",
  });
  const [input, setInput] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [history, setHistory] = useState<ChatMsg[]>([]);
  const scroller = useRef<HTMLDivElement>(null);
  const initRef = useRef(false);

  const current = steps[step];
  const done = step >= steps.length;

  const ask = (text: string) => {
    setHistory((h) => [...h, { from: "zero", text }]);
    setSpeaking(true);
    speak(text);
    setTimeout(() => setSpeaking(false), Math.min(3500, 1200 + text.length * 35));
  };

  useEffect(() => {
    if (!localStorage.getItem("p0_user")) {
      navigate({ to: "/" });
      return;
    }
    if (initRef.current) return;
    initRef.current = true;
    setTimeout(() => ask(steps[0].question), 400);
  }, [navigate]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [history]);

  const submit = (value: string) => {
    const v = value.trim();
    if (!v) return;
    setHistory((h) => [...h, { from: "user", text: v }]);
    setInput("");
    const nextData = { ...data, [current.field]: v };
    setData(nextData);

    const nextStep = step + 1;
    if (nextStep >= steps.length) {
      setStep(nextStep);
      setTimeout(() => {
        ask("Got everything I need. Let me build your roadmap.");
        setTimeout(() => {
          localStorage.setItem("p0_goals", JSON.stringify(nextData));
          navigate({ to: "/generating" });
        }, 1800);
      }, 500);
    } else {
      setTimeout(() => {
        setStep(nextStep);
        ask(steps[nextStep].question);
      }, 600);
    }
  };

  const progress = useMemo(() => Math.round((step / steps.length) * 100), [step]);

  return (
    <div className="relative flex min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-pink-300/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-pink-400/30 blur-3xl" />

      {/* Mr. Zero panel */}
      <div className="relative hidden w-[42%] flex-col items-center justify-center gap-6 p-10 lg:flex">
        <MrZero size={300} speaking={speaking} />
        <div className="w-64">
          <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
            <span className="text-foreground/70">Discovery</span>
            <span className="text-primary">{progress}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-primary/10">
            <motion.div animate={{ width: `${progress}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} className="h-full rounded-full bg-primary" />
          </div>
        </div>
      </div>

      {/* Chat panel */}
      <div className="relative flex flex-1 flex-col px-6 py-8 lg:px-14">
        <div className="mb-4 lg:hidden flex justify-center">
          <MrZero size={140} speaking={speaking} />
        </div>

        <div className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Discovery</div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Tell me your mission</h1>

        <div ref={scroller} className="my-6 flex-1 space-y-3 overflow-y-auto pr-2">
          <AnimatePresence initial={false}>
            {history.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-3xl px-4 py-3 text-sm shadow-sm ${
                    m.from === "user"
                      ? "bg-primary text-primary-foreground"
                      : "glass-card text-foreground"
                  }`}
                >
                  {m.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {!done && (
          <div className="space-y-3">
            {current.suggestions && (
              <div className="flex flex-wrap gap-2">
                {current.suggestions.map((s) => (
                  <motion.button
                    key={s}
                    whileHover={{ y: -2, scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => submit(s)}
                    className="rounded-full border border-primary/30 bg-white/70 px-4 py-2 text-xs font-semibold text-primary transition-all hover:bg-primary hover:text-primary-foreground"
                  >
                    {s}
                  </motion.button>
                ))}
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit(input);
              }}
              className="flex gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={current.placeholder}
                type={current.type === "number" ? "number" : "text"}
                autoFocus
                className="flex-1 rounded-2xl border border-border bg-white/70 px-5 py-3.5 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/20"
              />
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                type="submit"
                className="rounded-2xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/40"
              >
                Send
              </motion.button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
