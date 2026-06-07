import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MrZeroChat } from "@/components/MrZeroChat";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const navigate = useNavigate();
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem("p0_user")) {
      navigate({ to: "/" });
      return;
    }
    if (!localStorage.getItem("p0_goals") || !localStorage.getItem("p0_roadmap")) {
      navigate({ to: localStorage.getItem("p0_goals") ? "/generating" : "/welcome" });
    }
  }, [navigate]);

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
