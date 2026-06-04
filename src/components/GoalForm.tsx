import { useState } from "react";
import { motion } from "framer-motion";

export interface GoalData {
  goal: string;
  duration: string;
  hours: string;
  skillLevel: string;
  experience: string;
  weakAreas: string;
  learningStyle: string;
}

const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced"];
const STYLES = ["Videos", "Reading", "Projects", "Mixed"];

export function GoalForm({ onSubmit }: { onSubmit: (d: GoalData) => void }) {
  const [data, setData] = useState<GoalData>({
    goal: "",
    duration: "",
    hours: "",
    skillLevel: "Beginner",
    experience: "",
    weakAreas: "",
    learningStyle: "Mixed",
  });

  const set = <K extends keyof GoalData>(k: K, v: GoalData[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  const text: { key: keyof GoalData; label: string; placeholder: string; textarea?: boolean }[] = [
    { key: "goal", label: "What is your goal?", placeholder: "Crack product-based company placements" },
    { key: "duration", label: "Duration", placeholder: "60 days" },
    { key: "hours", label: "Hours available per day", placeholder: "4" },
    { key: "experience", label: "Existing experience (optional)", placeholder: "Solved ~50 LeetCode problems, built 2 React apps", textarea: true },
    { key: "weakAreas", label: "Weak areas (optional)", placeholder: "Dynamic programming, system design", textarea: true },
  ];

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (data.goal && data.duration && data.hours) onSubmit(data);
      }}
      className="flex flex-col gap-5"
    >
      {text.map((f, i) => (
        <motion.div
          key={f.key}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
        >
          <label className="mb-2 block text-sm font-semibold text-foreground/80">{f.label}</label>
          {f.textarea ? (
            <textarea
              value={data[f.key] as string}
              onChange={(e) => set(f.key, e.target.value as never)}
              placeholder={f.placeholder}
              rows={2}
              className="w-full resize-none rounded-2xl border border-border bg-white/60 px-5 py-3 text-sm outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/20"
            />
          ) : (
            <input
              value={data[f.key] as string}
              onChange={(e) => set(f.key, e.target.value as never)}
              placeholder={f.placeholder}
              className="w-full rounded-2xl border border-border bg-white/60 px-5 py-3.5 text-sm outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/20"
            />
          )}
        </motion.div>
      ))}

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <label className="mb-2 block text-sm font-semibold text-foreground/80">Current skill level</label>
        <div className="flex flex-wrap gap-2">
          {SKILL_LEVELS.map((l) => (
            <button
              type="button"
              key={l}
              onClick={() => set("skillLevel", l)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                data.skillLevel === l
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/40"
                  : "border border-border bg-white/60 text-foreground/70 hover:border-primary/40"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}>
        <label className="mb-2 block text-sm font-semibold text-foreground/80">Preferred learning style</label>
        <div className="flex flex-wrap gap-2">
          {STYLES.map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => set("learningStyle", s)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                data.learningStyle === s
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/40"
                  : "border border-border bg-white/60 text-foreground/70 hover:border-primary/40"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.button
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        className="mt-2 rounded-2xl bg-primary px-6 py-4 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/40 transition-shadow hover:shadow-xl hover:shadow-primary/50"
      >
        Build my roadmap →
      </motion.button>
    </form>
  );
}
