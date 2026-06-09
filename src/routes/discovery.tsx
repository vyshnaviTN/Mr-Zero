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

// ---------------- Pillar suggestions by goal type ----------------

const PILLAR_SUGGESTIONS: { match: RegExp; pillars: string[] }[] = [
  {
    match: /placement|interview|faang|company|job/i,
    pillars: ["DSA", "Communication", "Projects", "Aptitude", "Resume", "System Design", "Interview Prep"],
  },
  {
    match: /frontend|react|web/i,
    pillars: ["HTML/CSS", "JavaScript", "React", "Projects", "Design Systems", "TypeScript"],
  },
  {
    match: /law|upsc|constitution/i,
    pillars: ["Concept Learning", "Case Studies", "Revision", "Mock Tests", "Current Affairs", "Answer Writing"],
  },
  {
    match: /ai|ml|machine|data/i,
    pillars: ["Math Foundations", "Python", "ML Theory", "Projects", "Papers", "Practice"],
  },
  {
    match: /cat|gmat|gre/i,
    pillars: ["Quant", "Verbal", "Data Interpretation", "Mock Tests", "Revision"],
  },
  {
    match: /ielts|toefl/i,
    pillars: ["Listening", "Reading", "Writing", "Speaking", "Mock Tests"],
  },
];

function pillarSuggestions(goal: string): string[] {
  for (const s of PILLAR_SUGGESTIONS) if (s.match.test(goal)) return s.pillars;
  return ["Learn", "Practice", "Build", "Revise", "Reflect"];
}

// ---------------- Step model ----------------

type StepKind = "text" | "number" | "chips" | "pillars" | "pillar-levels";

interface Step {
  id: string;
  kind: StepKind;
  question: string;
  placeholder?: string;
  suggestions?: string[];
  apply: (value: any, data: GoalData) => GoalData;
  display?: (value: any) => string;
}

const STATIC_STEPS: Step[] = [
  {
    id: "goal",
    kind: "chips",
    question: "First — what is your main goal?",
    placeholder: "e.g. Crack product-based placements",
    suggestions: [
      "Placement Preparation",
      "Frontend Development",
      "AI / ML",
      "UPSC",
      "Law",
      "CAT",
      "IELTS",
    ],
    apply: (v: string, d) => ({ ...d, goal: v }),
  },
  {
    id: "duration",
    kind: "chips",
    question: "How many days do you have?",
    placeholder: "60",
    suggestions: ["30 Days", "60 Days", "90 Days", "180 Days"],
    apply: (v: string, d) => ({ ...d, duration: v }),
  },
  {
    id: "hours",
    kind: "number",
    question: "How many hours can you dedicate daily?",
    placeholder: "4",
    suggestions: ["1", "2", "3", "4", "6"],
    apply: (v: string, d) => ({ ...d, hours: v }),
  },
];

const TAIL_STEPS: Step[] = [
  {
    id: "projectStatus",
    kind: "chips",
    question: "Current project status?",
    suggestions: ["No Project", "Building Project", "Completed Project"],
    apply: (v: string, d) => ({ ...d, projectStatus: v }),
  },
  {
    id: "communication",
    kind: "chips",
    question: "How would you rate your communication?",
    suggestions: ["Poor", "Average", "Good", "Excellent"],
    apply: (v: string, d) => ({ ...d, communication: v }),
  },
  {
    id: "notes",
    kind: "text",
    question: "Anything else I should know?",
    placeholder: "e.g. I work better at night, weak in math, prefer videos — or 'nothing'",
    apply: (v: string, d) => ({ ...d, notes: v }),
  },
];

interface ChatMsg {
  from: "zero" | "user";
  text: string;
}

function Discovery() {
  const navigate = useNavigate();
  const [data, setData] = useState<GoalData>({
    goal: "",
    duration: "",
    hours: "",
    skillLevel: "Beginner",
    experience: "",
    weakAreas: "",
    learningStyle: "Mixed",
    pillars: [],
    pillarLevels: {},
  });
  const [step, setStep] = useState(0);
  const [input, setInput] = useState("");
  const [multiSel, setMultiSel] = useState<string[]>([]);
  const [levelDraft, setLevelDraft] = useState<Record<string, string>>({});
  const [speaking, setSpeaking] = useState(false);
  const [history, setHistory] = useState<ChatMsg[]>([]);
  const scroller = useRef<HTMLDivElement>(null);
  const initRef = useRef(false);

  // Build the full step list dynamically based on captured data
  const steps = useMemo<Step[]>(() => {
    const out: Step[] = [...STATIC_STEPS];
    if (data.goal) {
      out.push({
        id: "pillars",
        kind: "pillars",
        question:
          "Choose your 4 daily pillars. These become your daily ritual — exactly four.",
        suggestions: pillarSuggestions(data.goal),
        apply: (v: string[], d) => ({ ...d, pillars: v }),
        display: (v: string[]) => v.join(" · "),
      });
    }
    if (data.pillars && data.pillars.length === 4) {
      out.push({
        id: "pillarLevels",
        kind: "pillar-levels",
        question: "What is your current level for each pillar?",
        apply: (v: Record<string, string>, d) => ({ ...d, pillarLevels: v }),
        display: (v: Record<string, string>) =>
          Object.entries(v)
            .map(([k, lvl]) => `${k}: ${lvl}`)
            .join(", "),
      });
      out.push({
        id: "weakestPillar",
        kind: "chips",
        question: "Which pillar is your weakest?",
        suggestions: data.pillars,
        apply: (v: string, d) => ({ ...d, weakestPillar: v, weakAreas: v }),
      });
      out.push({
        id: "strongestPillar",
        kind: "chips",
        question: "And which is your strongest?",
        suggestions: data.pillars,
        apply: (v: string, d) => ({ ...d, strongestPillar: v }),
      });
      out.push(...TAIL_STEPS);
    }
    return out;
  }, [data.goal, data.pillars]);

  const current = steps[step];
  const done = step >= steps.length;

  const ask = (text: string) => {
    setHistory((h) => [...h, { from: "zero", text }]);
    setSpeaking(true);
    speak(text);
    setTimeout(() => setSpeaking(false), Math.min(3500, 1200 + text.length * 35));
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (authReady && !uid) {
      navigate({ to: "/auth" });
      return;
    }
    if (initRef.current) return;
    initRef.current = true;
    setTimeout(() => ask(STATIC_STEPS[0].question), 400);
  }, [navigate, authReady, uid]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [history]);

  const advance = (nextData: GoalData, displayValue: string) => {
    setHistory((h) => [...h, { from: "user", text: displayValue }]);
    setInput("");
    setMultiSel([]);
    setLevelDraft({});
    setData(nextData);

    // Recompute steps with the new data to know if we're done
    const recomputed: Step[] = [...STATIC_STEPS];
    if (nextData.goal) {
      recomputed.push({ ...steps[3] ?? { id: "pillars", kind: "pillars", question: "", apply: (v: any, d) => d } });
    }
    // Just rely on the memo-driven length on next render; use a simple counter
    const nextStep = step + 1;
    const projectedTotal = projectedTotalLength(nextData);

    if (nextStep >= projectedTotal) {
      setStep(nextStep);
      setTimeout(() => {
        ask("Perfect. Let me build a roadmap weighted to your weak spots.");
        setTimeout(() => {
          localStorage.setItem("p0_goals", JSON.stringify(nextData));
          localStorage.setItem("p0_pillars", JSON.stringify(nextData.pillars ?? []));
          navigate({ to: "/generating" });
        }, 1600);
      }, 500);
    } else {
      setTimeout(() => {
        setStep(nextStep);
        // The next step's question depends on the new step list
        const nextSteps = rebuildSteps(nextData);
        const nq = nextSteps[nextStep]?.question;
        if (nq) ask(nq);
      }, 500);
    }
  };

  const submitSingle = (value: string) => {
    const v = value.trim();
    if (!v || !current) return;
    const nextData = current.apply(v, data);
    advance(nextData, current.display ? current.display(v) : v);
  };

  const submitPillars = () => {
    if (multiSel.length !== 4 || !current) return;
    const nextData = current.apply(multiSel, data);
    advance(nextData, multiSel.join(" · "));
  };

  const submitLevels = () => {
    if (!current || !data.pillars) return;
    if (data.pillars.some((p) => !levelDraft[p])) return;
    const nextData = current.apply(levelDraft, data);
    advance(
      nextData,
      data.pillars.map((p) => `${p}: ${levelDraft[p]}`).join(", "),
    );
  };

  const togglePillar = (s: string) => {
    setMultiSel((prev) => {
      if (prev.includes(s)) return prev.filter((x) => x !== s);
      if (prev.length >= 4) return prev;
      return [...prev, s];
    });
  };

  const totalProjected = projectedTotalLength(data);
  const progress = Math.round((step / Math.max(totalProjected, 1)) * 100);

  return (
    <div className="relative flex min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-pink-300/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-pink-400/30 blur-3xl" />

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
            {/* Chip / number / text suggestions */}
            {(current.kind === "chips" || current.kind === "number" || current.kind === "text") && (
              <>
                {current.suggestions && (
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
              </>
            )}

            {/* Pillar picker — exactly 4 */}
            {current.kind === "pillars" && (
              <>
                <div className="flex flex-wrap gap-2">
                  {(current.suggestions ?? []).map((s) => {
                    const active = multiSel.includes(s);
                    return (
                      <motion.button
                        key={s}
                        whileHover={{ y: -2, scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => togglePillar(s)}
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
                    {multiSel.length}/4 selected — pick exactly four
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    disabled={multiSel.length !== 4}
                    onClick={submitPillars}
                    className="rounded-2xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-md shadow-primary/40 disabled:opacity-50"
                  >
                    Continue →
                  </motion.button>
                </div>
              </>
            )}

            {/* Pillar-levels */}
            {current.kind === "pillar-levels" && data.pillars && (
              <>
                <div className="space-y-2">
                  {data.pillars.map((p) => (
                    <div
                      key={p}
                      className="glass-card flex flex-wrap items-center justify-between gap-2 rounded-2xl px-4 py-3"
                    >
                      <span className="text-sm font-semibold">{p}</span>
                      <div className="flex gap-1.5">
                        {["Beginner", "Intermediate", "Advanced"].map((lvl) => {
                          const active = levelDraft[p] === lvl;
                          return (
                            <button
                              key={lvl}
                              onClick={() => setLevelDraft((d) => ({ ...d, [p]: lvl }))}
                              className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition-all ${
                                active
                                  ? "bg-primary text-primary-foreground"
                                  : "border border-primary/30 text-primary hover:bg-primary/10"
                              }`}
                            >
                              {lvl}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-end">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    disabled={data.pillars.some((p) => !levelDraft[p])}
                    onClick={submitLevels}
                    className="rounded-2xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-md shadow-primary/40 disabled:opacity-50"
                  >
                    Continue →
                  </motion.button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- helpers ----------

function projectedTotalLength(d: GoalData): number {
  // Mirrors the memo's step computation
  let n = STATIC_STEPS.length;
  if (d.goal) n += 1; // pillars
  if (d.pillars && d.pillars.length === 4) {
    n += 3; // pillarLevels + weakest + strongest
    n += TAIL_STEPS.length;
  }
  return n;
}

function rebuildSteps(d: GoalData): Step[] {
  // Mirror of the useMemo for use inside callbacks (just the questions)
  const out: Step[] = [...STATIC_STEPS];
  if (d.goal) {
    out.push({
      id: "pillars",
      kind: "pillars",
      question: "Choose your 4 daily pillars. These become your daily ritual — exactly four.",
      suggestions: pillarSuggestions(d.goal),
      apply: (v: string[], data) => ({ ...data, pillars: v }),
    });
  }
  if (d.pillars && d.pillars.length === 4) {
    out.push({
      id: "pillarLevels",
      kind: "pillar-levels",
      question: "What is your current level for each pillar?",
      apply: (v: Record<string, string>, data) => ({ ...data, pillarLevels: v }),
    });
    out.push({
      id: "weakestPillar",
      kind: "chips",
      question: "Which pillar is your weakest?",
      suggestions: d.pillars,
      apply: (v: string, data) => ({ ...data, weakestPillar: v, weakAreas: v }),
    });
    out.push({
      id: "strongestPillar",
      kind: "chips",
      question: "And which is your strongest?",
      suggestions: d.pillars,
      apply: (v: string, data) => ({ ...data, strongestPillar: v }),
    });
    out.push(...TAIL_STEPS);
  }
  return out;
}
