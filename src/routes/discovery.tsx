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

type FieldKey = keyof GoalData;

type StepKind = "text" | "number" | "chips" | "multi" | "pillars";

interface Step {
  field: FieldKey;
  question: string;
  placeholder?: string;
  suggestions?: string[];
  kind: StepKind;
  max?: number; // for multi
}

const BASE: Step[] = [
  {
    field: "goal",
    question: "First — what is your goal?",
    placeholder: "e.g. Crack product-based placements",
    suggestions: [
      "Placement Preparation",
      "Learn AI",
      "Constitutional Law",
      "Learn Frontend Development",
    ],
    kind: "chips",
  },
  {
    field: "duration",
    question: "How much time do you have?",
    placeholder: "60 Days",
    suggestions: ["30 Days", "60 Days", "90 Days", "120 Days"],
    kind: "chips",
  },
  {
    field: "hours",
    question: "How many hours can you dedicate daily?",
    placeholder: "4",
    suggestions: ["1", "2", "3", "4", "6"],
    kind: "number",
  },
];

const PLACEMENT_STEPS: Step[] = [
  {
    field: "target",
    question: "What is your target?",
    suggestions: [
      "Product Based Companies",
      "Service Based Companies",
      "FAANG",
      "Startups",
      "Any Placement",
    ],
    kind: "chips",
  },
  {
    field: "dsaLevel",
    question: "Rate your DSA level.",
    suggestions: ["Beginner", "Intermediate", "Advanced"],
    kind: "chips",
  },
  {
    field: "leetcode",
    question: "How many LeetCode problems have you solved?",
    suggestions: ["0-25", "25-100", "100-300", "300+"],
    kind: "chips",
  },
  {
    field: "projects",
    question: "What projects are you working on? (pick all that apply)",
    suggestions: [
      "Smart Cane",
      "Portfolio Website",
      "AI Chatbot",
      "Krishi Sakhi",
      "No Projects Yet",
    ],
    kind: "multi",
    max: 6,
  },
  {
    field: "communication",
    question: "Rate your communication skills.",
    suggestions: ["Poor", "Average", "Good", "Excellent"],
    kind: "chips",
  },
  {
    field: "hasResume",
    question: "Do you already have a resume?",
    suggestions: ["Yes", "No"],
    kind: "chips",
  },
  {
    field: "aptitude",
    question: "How comfortable are you with aptitude?",
    suggestions: ["Poor", "Average", "Good"],
    kind: "chips",
  },
  {
    field: "weakSkills",
    question: "Which skills need the most improvement? (pick all that apply)",
    suggestions: [
      "DSA",
      "Communication",
      "Projects",
      "Resume",
      "Interview Preparation",
      "Aptitude",
    ],
    kind: "multi",
    max: 6,
  },
];

const GENERIC_STEPS: Step[] = [
  {
    field: "skillLevel",
    question: "What is your current level?",
    suggestions: ["Beginner", "Intermediate", "Advanced"],
    kind: "chips",
  },
  {
    field: "experience",
    question: "Any existing experience I should know about?",
    placeholder: "e.g. built 2 small projects, took an intro course — or 'none'",
    kind: "text",
  },
  {
    field: "weakAreas",
    question: "Any weak areas I should plan around?",
    placeholder: "e.g. theory-heavy topics, math — or 'none'",
    kind: "text",
  },
];

const FINAL_PILLARS: Step = {
  field: "pillars",
  question: "Pick up to 3 daily focus pillars. These become your daily ritual.",
  kind: "pillars",
  max: 3,
};

const isPlacementGoal = (g: string) =>
  /placement|interview|faang|company/i.test(g);

function buildSteps(data: Partial<GoalData>): Step[] {
  const out = [...BASE];
  if (data.goal) {
    if (isPlacementGoal(data.goal)) {
      out.push(...PLACEMENT_STEPS);
    } else {
      out.push(...GENERIC_STEPS);
    }
    out.push({ ...FINAL_PILLARS, suggestions: defaultPillars(data) });
  }
  return out;
}

function defaultPillars(data: Partial<GoalData>): string[] {
  if (data.goal && isPlacementGoal(data.goal)) {
    return [
      "DSA",
      "Communication",
      "Interview Preparation",
      "Projects",
      "Resume",
      "Aptitude",
      "System Design",
    ];
  }
  // Generic suggested pillars
  return ["Learn", "Practice", "Build", "Revise", "Reflect"];
}

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
    projects: [],
    weakSkills: [],
    pillars: [],
  });
  const [input, setInput] = useState("");
  const [multiSel, setMultiSel] = useState<string[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [history, setHistory] = useState<ChatMsg[]>([]);
  const scroller = useRef<HTMLDivElement>(null);
  const initRef = useRef(false);

  const steps = useMemo(() => buildSteps(data), [data]);
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
    setTimeout(() => ask(BASE[0].question), 400);
  }, [navigate]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [history]);

  const advance = (nextData: GoalData, displayValue: string) => {
    setHistory((h) => [...h, { from: "user", text: displayValue }]);
    setInput("");
    setMultiSel([]);
    setData(nextData);
    const nextSteps = buildSteps(nextData);
    const nextStep = step + 1;

    if (nextStep >= nextSteps.length) {
      setStep(nextStep);
      setTimeout(() => {
        ask("Perfect. Let me design a roadmap weighted to your weak spots.");
        setTimeout(() => {
          localStorage.setItem("p0_goals", JSON.stringify(nextData));
          localStorage.setItem(
            "p0_pillars",
            JSON.stringify(nextData.pillars ?? []),
          );
          navigate({ to: "/generating" });
        }, 1800);
      }, 500);
    } else {
      setTimeout(() => {
        setStep(nextStep);
        ask(nextSteps[nextStep].question);
      }, 600);
    }
  };

  const submitSingle = (value: string) => {
    const v = value.trim();
    if (!v) return;
    const nextData = { ...data, [current.field]: v };
    advance(nextData as GoalData, v);
  };

  const submitMulti = () => {
    if (multiSel.length === 0) return;
    const nextData = { ...data, [current.field]: multiSel };
    advance(nextData as GoalData, multiSel.join(", "));
  };

  const toggleMulti = (s: string) => {
    setMultiSel((prev) => {
      if (prev.includes(s)) return prev.filter((x) => x !== s);
      const max = current?.max ?? 99;
      if (prev.length >= max) return prev;
      return [...prev, s];
    });
  };

  const progress = useMemo(
    () => Math.round((step / Math.max(steps.length, 1)) * 100),
    [step, steps.length],
  );

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
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
              className="h-full rounded-full bg-primary"
            />
          </div>
        </div>
      </div>

      {/* Chat panel */}
      <div className="relative flex flex-1 flex-col px-6 py-8 lg:px-14">
        <div className="mb-4 flex justify-center lg:hidden">
          <MrZero size={140} speaking={speaking} />
        </div>

        <div className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
          Discovery
        </div>
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

        {!done && current && (
          <div className="space-y-3">
            {(current.kind === "chips" ||
              current.kind === "number" ||
              current.kind === "text") &&
              current.suggestions && (
                <div className="flex flex-wrap gap-2">
                  {current.suggestions.map((s) => (
                    <motion.button
                      key={s}
                      whileHover={{ y: -2, scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => submitSingle(s)}
                      className="rounded-full border border-primary/30 bg-white/70 px-4 py-2 text-xs font-semibold text-primary transition-all hover:bg-primary hover:text-primary-foreground"
                    >
                      {s}
                    </motion.button>
                  ))}
                </div>
              )}

            {(current.kind === "multi" || current.kind === "pillars") && (
              <>
                <div className="flex flex-wrap gap-2">
                  {(current.suggestions ?? []).map((s) => {
                    const active = multiSel.includes(s);
                    return (
                      <motion.button
                        key={s}
                        whileHover={{ y: -2, scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => toggleMulti(s)}
                        className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                          active
                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/40"
                            : "border border-primary/30 bg-white/70 text-primary hover:bg-primary/10"
                        }`}
                      >
                        {active ? "✓ " : ""}
                        {s}
                      </motion.button>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-muted-foreground">
                    {multiSel.length}/{current.max ?? "—"} selected
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    disabled={multiSel.length === 0}
                    onClick={submitMulti}
                    className="rounded-2xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-md shadow-primary/40 disabled:opacity-50"
                  >
                    Continue →
                  </motion.button>
                </div>
              </>
            )}

            {(current.kind === "text" ||
              current.kind === "number" ||
              current.kind === "chips") && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submitSingle(input);
                }}
                className="flex gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={current.placeholder ?? "Type your answer…"}
                  type={current.kind === "number" ? "number" : "text"}
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
            )}
          </div>
        )}
      </div>
    </div>
  );
}
