import { Link, useRouterState } from "@tanstack/react-router";
import { Home, ListChecks, Flame, Award, Settings, Map } from "lucide-react";
import { motion } from "framer-motion";
import { useP0 } from "@/lib/p0-state";

const items = [
  { to: "/dashboard", icon: Home, label: "Home" },
  { to: "/tasks", icon: ListChecks, label: "Tasks" },
  { to: "/roadmap", icon: Map, label: "Roadmap" },
  { to: "/streaks", icon: Flame, label: "Streaks" },
  { to: "/badges", icon: Award, label: "Badges" },
  { to: "/settings", icon: Settings, label: "Settings" },
] as const;

export function Sidebar() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { todayPct, streak } = useP0();

  return (
    <>
      <aside className="hidden md:flex sticky top-0 h-screen w-64 shrink-0 flex-col gap-2 border-r border-border/60 bg-sidebar/70 p-5 backdrop-blur-xl z-40">
        <div className="mb-6 flex items-center gap-3 px-2">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-lg shadow-primary/20 border border-primary/10">
            <img src="/logo.png" alt="Project Zero Logo" className="h-full w-full object-cover scale-[1.15]" />
          </div>
          <div className="min-w-0">
            <div className="text-lg font-bold tracking-tight">Project Zero</div>
            <div className="text-xs text-muted-foreground">with Mr. Zero</div>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {items.map((item) => {
            const active = path === item.to || path.startsWith(item.to + "/");
            return (
              <motion.div key={item.label} whileHover={{ x: 4 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to={item.to}
                  className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                    active
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Today's quick stats */}
        <div className="mt-auto space-y-2">
          {streak.current > 0 && (
            <div className="flex items-center justify-between rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-xs">
              <span className="font-semibold text-foreground">🔥 Streak</span>
              <span className="font-bold text-primary">{streak.current}d</span>
            </div>
          )}
          <div className="flex items-center justify-between rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-xs">
            <span className="font-semibold text-foreground">Today</span>
            <span className="font-bold text-primary">{todayPct}%</span>
          </div>
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs text-muted-foreground">
            <div className="mb-1 font-semibold text-foreground">Every builder</div>
            starts from zero. ✨
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-sidebar/90 backdrop-blur-xl border-t border-border/60 py-2 px-2 pb-4">
        {items.map((item) => {
          const active = path === item.to || path.startsWith(item.to + "/");
          return (
            <Link
              to={item.to}
              key={item.label}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                active ? "text-primary scale-110" : "text-muted-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-bold">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
