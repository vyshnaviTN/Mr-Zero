import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MrZeroChat } from "@/components/MrZeroChat";
import { useUid, pget } from "@/lib/pstore";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
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
    if (!hasGoals) navigate({ to: "/welcome" });
    else if (!hasRoadmap) navigate({ to: "/generating" });
  }, [navigate, uid, ready]);

  if (!ready || !uid) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="relative flex-1 overflow-x-hidden">
        <Outlet />
      </main>
      <MrZeroChat />
    </div>
  );
}
