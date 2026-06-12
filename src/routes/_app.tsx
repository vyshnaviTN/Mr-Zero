import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MrZeroChat } from "@/components/MrZeroChat";
import { useAuth } from "@clerk/tanstack-react-start";
import { pget } from "@/lib/pstore";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const navigate = useNavigate();
  const { userId, isLoaded } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;
    if (!userId) {
      navigate({ to: "/auth" });
      return;
    }
    const hasGoals = !!pget("p0_goals");
    const hasRoadmap = !!pget("p0_roadmap");
    if (!hasGoals) navigate({ to: "/welcome" });
    else if (!hasRoadmap) navigate({ to: "/generating" });
  }, [navigate, userId, isLoaded]);

  if (!isLoaded || !userId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="relative flex-1 overflow-x-hidden pb-20 md:pb-0">
        <Outlet />
      </main>
      <MrZeroChat />
    </div>
  );
}
