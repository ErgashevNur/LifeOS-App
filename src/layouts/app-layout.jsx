import { cn } from "@/lib/utils";
import { clearAuthSession, getAuthSession } from "@/lib/auth";
import { useLifeOSData } from "@/lib/lifeos-store";
import {
  BookOpen, Bot, HeartPulse, LayoutDashboard, LineChart,
  LogOut, Repeat, Settings, Shield, Target, Trophy,
  Users, MessageSquare, Wallet, TrendingUp, Map,
} from "lucide-react";
import { Navigate, Outlet, useLocation, useNavigate, NavLink } from "react-router-dom";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { to: "/dashboard",  label: "Dashboard",   icon: LayoutDashboard },
  { to: "/goals",      label: "Maqsadlar",   icon: Target },
  { to: "/habits",     label: "Odatlar",     icon: Repeat },
  { to: "/books",      label: "Kitoblar",    icon: BookOpen },
  { to: "/health",     label: "Sog'liq",     icon: HeartPulse },
  { to: "/mastery",    label: "Mahorat",     icon: Trophy },
  { to: "/networking", label: "Networking",  icon: Users },
  { to: "/analytics",  label: "Tahlil",      icon: LineChart },
  { to: "/assistant",  label: "AI Murabbiy", icon: Bot },
  { to: "/finance",    label: "Moliya",      icon: Wallet },
  { to: "/community",  label: "Jamiyat",     icon: MessageSquare },
  { to: "/settings",   label: "Sozlamalar",  icon: Settings },
];

const ADMIN_ITEM = { to: "/users", label: "Foydalanuvchilar", icon: Shield };

const BOTTOM_TABS = [
  { to: "/dashboard", label: "Home",     icon: LayoutDashboard },
  { to: "/analytics", label: "Progress", icon: TrendingUp },
  { to: "/goals",     label: "Plan",     icon: Map },
  { to: "/assistant", label: "Coach",    icon: Bot },
  { to: "/settings",  label: "Settings", icon: Settings },
];

function isActive(current, target) {
  return current === target || current.startsWith(`${target}/`);
}

function getInitials(session) {
  const f = session?.firstName?.[0] ?? "";
  const l = session?.lastName?.[0] ?? "";
  return (f + l).toUpperCase() || "U";
}

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const session = getAuthSession();
  useLifeOSData();

  if (!session) return <Navigate to="/auth?tab=login" replace />;

  const navItems = session.role === "admin" ? [...NAV_ITEMS, ADMIN_ITEM] : NAV_ITEMS;

  const handleLogout = () => {
    clearAuthSession();
    navigate("/auth?tab=login", { replace: true });
  };

  const initials = getInitials(session);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ─── Desktop sidebar ───────────────────────────────────── */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-100 bg-white lg:flex">

        {/* Brand */}
        <div className="flex h-16 items-center gap-3 px-5 border-b border-slate-100">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600">
            <span className="text-[11px] font-black text-white tracking-tight">LOS</span>
          </div>
          <span className="text-sm font-black tracking-tight text-slate-900">LifeOS</span>
        </div>

        {/* User card */}
        <div className="px-4 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
              <span className="text-xs font-black text-white">{initials}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">
                {session.firstName ?? "User"}
              </p>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                {session.role === "admin" ? "Admin" : "Member"}
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = isActive(location.pathname, to);
            return (
              <NavLink
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150",
                  active
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", active ? "text-indigo-600" : "text-slate-400")} />
                {label}
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut className="h-4 w-4" />
            Chiqish
          </button>
        </div>
      </aside>

      {/* ─── Main area ─────────────────────────────────────────── */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <main className="flex-1 pb-20 lg:pb-0">
          <Outlet />
        </main>
      </div>

      {/* ─── Mobile bottom tabs ─────────────────────────────────── */}
      <nav className="fixed bottom-0 inset-x-0 z-40 flex h-16 border-t border-slate-200 bg-white/90 backdrop-blur-md lg:hidden">
        {BOTTOM_TABS.map(({ to, label, icon: Icon }) => {
          const active = isActive(location.pathname, to);
          return (
            <button
              key={to}
              onClick={() => navigate(to)}
              className="flex flex-1 flex-col items-center justify-center gap-1 focus:outline-none"
            >
              <motion.div whileTap={{ scale: 0.85 }}>
                <Icon
                  className={cn(
                    "h-5 w-5 transition-colors duration-150",
                    active ? "text-indigo-600" : "text-slate-400",
                  )}
                  strokeWidth={active ? 2.5 : 1.8}
                />
              </motion.div>
              <span
                className={cn(
                  "text-[10px] font-bold transition-colors duration-150",
                  active ? "text-indigo-600" : "text-slate-400",
                )}
              >
                {label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
