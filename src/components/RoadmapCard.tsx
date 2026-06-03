import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export interface Week {
  week: string;
  tasks: string[];
}

export function RoadmapCard({ week, index }: { week: Week; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.12, type: "spring", stiffness: 180, damping: 20 }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="glass-card group relative overflow-hidden rounded-3xl p-6"
    >
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-primary/20 blur-2xl transition-opacity group-hover:opacity-70" />
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-widest text-primary">
          {week.week}
        </div>
        <Sparkles className="h-4 w-4 text-primary" />
      </div>
      <ul className="mt-4 space-y-3">
        {week.tasks.map((t) => (
          <li key={t} className="flex items-start gap-3 text-sm">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary shadow-sm shadow-primary/60" />
            <span className="font-medium text-foreground/90">{t}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export function generateRoadmap(goal: string): Week[] {
  const g = goal.toLowerCase();
  if (g.includes("placement") || g.includes("interview") || g.includes("job")) {
    return [
      { week: "Week 1", tasks: ["Arrays & Hashing", "Communication Practice", "Daily LeetCode (3)"] },
      { week: "Week 2", tasks: ["Strings & Two Pointers", "Resume Building", "System Design Basics"] },
      { week: "Week 3", tasks: ["Linked Lists & Trees", "Project Work", "Behavioral Prep"] },
      { week: "Week 4", tasks: ["Dynamic Programming", "Mock Interviews", "Portfolio Polish"] },
    ];
  }
  return [
    { week: "Week 1", tasks: ["Define milestones", "Set up environment", "Foundation reading"] },
    { week: "Week 2", tasks: ["Core practice", "Build mini project", "Daily review"] },
    { week: "Week 3", tasks: ["Advanced topics", "Public showcase", "Feedback loops"] },
    { week: "Week 4", tasks: ["Capstone build", "Reflection & metrics", "Plan next quarter"] },
  ];
}
