// Streak + daily-progress storage utilities.
// Storage:
//  p0_pillars: string[]  (max 3 daily focus pillars)
//  p0_daily:   { [yyyy-mm-dd]: { completed: boolean[]; total: number } }
//  p0_streak:  { current: number; longest: number; lastFullDate: string | null }

export interface DayLog {
  completed: boolean[];
  total: number;
}
export interface StreakState {
  current: number;
  longest: number;
  lastFullDate: string | null;
}

export const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const dateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const loadDaily = (): Record<string, DayLog> => {
  try {
    return JSON.parse(localStorage.getItem("p0_daily") ?? "{}");
  } catch {
    return {};
  }
};
export const saveDaily = (m: Record<string, DayLog>) =>
  localStorage.setItem("p0_daily", JSON.stringify(m));

export const loadStreak = (): StreakState => {
  try {
    return (
      JSON.parse(localStorage.getItem("p0_streak") ?? "null") ?? {
        current: 0,
        longest: 0,
        lastFullDate: null,
      }
    );
  } catch {
    return { current: 0, longest: 0, lastFullDate: null };
  }
};
export const saveStreak = (s: StreakState) =>
  localStorage.setItem("p0_streak", JSON.stringify(s));

export const completionPercent = (log?: DayLog) => {
  if (!log || log.total === 0) return 0;
  const done = log.completed.filter(Boolean).length;
  return Math.round((done / log.total) * 100);
};

export const heatColor = (pct: number) => {
  if (pct >= 100) return "bg-[#FF1F7A]";
  if (pct >= 75) return "bg-[#FF4D94]";
  if (pct >= 50) return "bg-[#FF85B5]";
  if (pct >= 25) return "bg-[#FFC1D6]";
  return "bg-pink-100/60";
};

// Recompute streak after a day reaches 100% completion.
export const bumpStreakIfComplete = (
  date: string,
  log: DayLog,
  prev: StreakState,
): StreakState => {
  if (completionPercent(log) < 100) {
    // If today was previously 100% and is now reduced, leave streak alone (don't punish toggling).
    return prev;
  }
  if (prev.lastFullDate === date) return prev;
  const yesterday = (() => {
    const d = new Date(date + "T00:00:00");
    d.setDate(d.getDate() - 1);
    return dateKey(d);
  })();
  const current = prev.lastFullDate === yesterday ? prev.current + 1 : 1;
  return {
    current,
    longest: Math.max(prev.longest, current),
    lastFullDate: date,
  };
};

// Last N days of cells, oldest first.
export const recentDays = (n: number) => {
  const out: string[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    out.push(dateKey(d));
  }
  return out;
};

export const monthlyConsistency = (daily: Record<string, DayLog>) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const dayOfMonth = now.getDate();
  let full = 0;
  for (let i = 1; i <= dayOfMonth; i++) {
    const k = dateKey(new Date(year, month, i));
    if (completionPercent(daily[k]) >= 100) full++;
  }
  return Math.round((full / dayOfMonth) * 100);
};

export interface Badge {
  id: string;
  label: string;
  days: number;
}
export const BADGES: Badge[] = [
  { id: "starter", label: "Consistency Starter", days: 7 },
  { id: "builder", label: "Builder", days: 15 },
  { id: "momentum", label: "Momentum Master", days: 30 },
  { id: "discipline", label: "Discipline Engine", days: 60 },
  { id: "legend", label: "Project Zero Legend", days: 100 },
];
