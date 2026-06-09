import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useUid, pget } from "@/lib/pstore";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Project 0 — Meet Mr. Zero" },
      { name: "description", content: "Your friendly AI companion that builds your roadmap from zero." },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const { uid, ready } = useUid();

  useEffect(() => {
    if (!ready) return;
    if (!uid) {
      navigate({ to: "/auth" });
      return;
    }
    const hasGoals = !!pget("p0_goals");
    const hasRoadmap = !!pget("p0_roadmap");
    if (hasGoals && hasRoadmap) navigate({ to: "/dashboard" });
    else if (hasGoals) navigate({ to: "/generating" });
    else navigate({ to: "/welcome" });
  }, [ready, uid, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-sm text-muted-foreground">Loading…</div>
    </div>
  );
}
