import { Link, useRouterState } from "@tanstack/react-router";
import { Home, ListChecks, Flame, Award, Settings } from "lucide-react";
import { motion } from "framer-motion";

const items = [
  { to: "/dashboard", icon: Home, label: "Home" },
  { to: "/dashboard", icon: ListChecks, label: "Tasks", hash: "tasks" },
  { to: "/dashboard", icon: Flame, label: "Streaks", hash: "streaks" },
  { to: "/dashboard", icon: Award, label: "Badges", hash: "badges" },
  { to: "/dashboard", icon: Settings, label: "Settings", hash: "settings" },
];

export function Sidebar() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  return (
    <aside className="sticky top-0 flex h-screen w-64 flex-col gap-2 border-r border-border/60 bg-sidebar/70 p-5 backdrop-blur-xl">
      <div className="mb-6 flex items-center gap-3 px-2">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/30">
          0
        </div>
        <div>
          <div className="text-lg font-bold tracking-tight">Project 0</div>
          <div className="text-xs text-muted-foreground">with Mr. Zero</div>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {items.map((item, i) => {
          const active = path === item.to && !item.hash;
          return (
            <motion.div key={item.label} whileHover={{ x: 4 }} whileTap={{ scale: 0.97 }}>
              <Link
                to={item.to}
                hash={item.hash}
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

      <div className="mt-auto rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs text-muted-foreground">
        <div className="mb-1 font-semibold text-foreground">Every builder</div>
        starts from zero. ✨
      </div>
    </aside>
  );
}
