import { useState } from "react";
import { motion } from "framer-motion";

export interface GoalData {
  goal: string;
  duration: string;
  hours: string;
}

export function GoalForm({ onSubmit }: { onSubmit: (d: GoalData) => void }) {
  const [data, setData] = useState<GoalData>({ goal: "", duration: "", hours: "" });

  const fields: { key: keyof GoalData; label: string; placeholder: string }[] = [
    { key: "goal", label: "What is your goal?", placeholder: "Get placement in 2 months" },
    { key: "duration", label: "What is your duration?", placeholder: "60 days" },
    { key: "hours", label: "How many hours daily?", placeholder: "5 hours per day" },
  ];

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (data.goal && data.duration && data.hours) onSubmit(data);
      }}
      className="flex flex-col gap-5"
    >
      {fields.map((f, i) => (
        <motion.div
          key={f.key}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <label className="mb-2 block text-sm font-semibold text-foreground/80">{f.label}</label>
          <input
            value={data[f.key]}
            onChange={(e) => setData({ ...data, [f.key]: e.target.value })}
            placeholder={f.placeholder}
            className="w-full rounded-2xl border border-border bg-white/60 px-5 py-3.5 text-sm outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/20"
          />
        </motion.div>
      ))}
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
