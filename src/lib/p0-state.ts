// Shared client-side state hooks for Project 0 (per-user via pstore).
import { useCallback, useEffect, useMemo, useState } from "react";
import type { GoalData } from "@/components/GoalForm";
import type { Roadmap } from "@/lib/roadmap.functions";
import { pget, pset, useUid } from "@/lib/pstore";
import {
  bumpStreakIfComplete,
  completionPercent,
  loadDaily,
  loadStreak,
  saveDaily,
  saveStreak,
  todayKey,
  type DayLog,
  type StreakState,
} from "@/lib/streaks";

export function useP0() {
  const { uid } = useUid();
  const [goals, setGoals] = useState<GoalData | null>(null);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [pillars, setPillars] = useState<string[]>([]);
  const [daily, setDaily] = useState<Record<string, DayLog>>({});
  const [streak, setStreak] = useState<StreakState>({
    current: 0,
    longest: 0,
    lastFullDate: null,
  });

  const today = todayKey();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!uid) {
      setGoals(null);
      setRoadmap(null);
      setPillars([]);
      setDaily({});
      setStreak({ current: 0, longest: 0, lastFullDate: null });
      return;
    }
    const rawGoals = pget("p0_goals");
    const rawRoadmap = pget("p0_roadmap");
    if (rawGoals) setGoals(JSON.parse(rawGoals));
    if (rawRoadmap) setRoadmap(JSON.parse(rawRoadmap));

    const g = rawGoals ? (JSON.parse(rawGoals) as GoalData) : null;
    const p =
      g?.pillars && g.pillars.length
        ? g.pillars
        : JSON.parse(pget("p0_pillars") ?? "[]");
    setPillars(p);

    const d = loadDaily();
    if (!d[today] || d[today].total !== p.length) {
      d[today] = {
        completed: (d[today]?.completed ?? [])
          .slice(0, p.length)
          .concat(
            Array(Math.max(0, p.length - (d[today]?.completed?.length ?? 0))).fill(
              false,
            ),
          ),
        total: p.length,
      };
      saveDaily(d);
    }
    setDaily(d);
    setStreak(loadStreak());
  }, [today, uid]);

  const todayLog: DayLog = useMemo(
    () =>
      daily[today] ?? {
        completed: pillars.map(() => false),
        total: pillars.length,
      },
    [daily, today, pillars],
  );
  const todayPct = completionPercent(todayLog);

  const togglePillar = useCallback(
    (idx: number) => {
      setDaily((prev) => {
        const next = { ...prev };
        const log: DayLog = {
          completed: [...(next[today]?.completed ?? pillars.map(() => false))],
          total: pillars.length,
        };
        log.completed[idx] = !log.completed[idx];
        next[today] = log;
        saveDaily(next);

        const nextStreak = bumpStreakIfComplete(today, log, loadStreak());
        saveStreak(nextStreak);
        setStreak(nextStreak);
        return next;
      });
    },
    [today, pillars],
  );

  return {
    uid,
    goals,
    roadmap,
    pillars,
    daily,
    streak,
    today,
    todayLog,
    todayPct,
    togglePillar,
    setRoadmap: (r: Roadmap) => {
      setRoadmap(r);
      pset("p0_roadmap", JSON.stringify(r));
    },
  };
}

export function builderLevel(longest: number) {
  return Math.floor(longest / 7) + 1;
}
