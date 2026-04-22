import { cn } from "@/lib/utils";
import { clearAuthSession, getAuthSession } from "@/lib/auth";
import { useLifeOSData } from "@/lib/lifeos-store";
import {
  Bot, LayoutDashboard,
  LogOut, Repeat, Settings, Shield, Target,
  Zap, ChevronRight, Menu, X, Calendar,
} from "lucide-react";
import { Navigate, Outlet, useLocation, useNavigate, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const NAV_ITEMS = [
  { to: "/dashboard",  label: "Dashboard",    icon: LayoutDashboard, color: "#64748B" },
  { to: "/planner",    label: "Kun rejasi",   icon: Calendar,        color: "#64748B" },
  { to: "/goals",      label: "Maqsadlar",    icon: Target,          color: "#64748B" },
  { to: "/habits",     label: "Odatlar",      icon: Repeat,          color: "#64748B" },
  { to: "/focus",      label: "Deep Work",    icon: Zap,             color: "#64748B" },
  { to: "/assistant",  label: "AI Murabbiy",  icon: Bot,             color: "#64748B" },
  { to: "/settings",   label: "Sozlamalar",   icon: Settings,        color: "#64748B" },
];

const ADMIN_ITEM = { to: "/users", label: "Foydalanuvchilar", icon: Shield, color: "#EF4444" };

const BOTTOM_TABS = [
  { to: "/dashboard", label: "Home",     icon: LayoutDashboard, color: "#334155" },
  { to: "/planner",   label: "Reja",     icon: Calendar,        color: "#334155" },
  { to: "/focus",     label: "Fokus",    icon: Zap,             color: "#334155" },
  { to: "/assistant", label: "Coach",    icon: Bot,             color: "#334155" },
  { to: "/settings",  label: "Sozlama",  icon: Settings,        color: "#64748B" },
];

function isActive(current, target) {
  return current === target || current.startsWith(`${target}/`);
}

function getInitials(session) {
  const f = session?.firstName?.[0] ?? "";
  const l = session?.lastName?.[0] ?? "";
  return (f + l).toUpperCase() || "U";
}

function SidebarNav({ navItems, location, session, handleLogout, onNavClick }) {
  const initials = getInitials(session);

  return (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-[56px] border-b border-white/[0.07] flex-shrink-0">
        <div className="w-7 h-7 rounded-[7px] bg-black flex items-center justify-center flex-shrink-0 shadow-md ring-1 ring-white/10">
          <span className="text-white font-extrabold text-[16px] leading-none">L</span>
        </div>
        <span className="text-white font-bold text-[15px] tracking-tight">LifeOS</span>
      </div>

      {/* Workspace / User */}
      <div className="px-3 py-2.5 border-b border-white/[0.07] flex-shrink-0">
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] hover:bg-white/[0.06] cursor-pointer transition-colors">
          <div className="w-7 h-7 rounded-full bg-slate-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-md">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white/90 text-[13px] font-semibold leading-tight truncate">
              {session?.firstName ?? "User"}'s Workspace
            </p>
            <p className="text-white/35 text-[11px] mt-0.5">
              {session?.role === "admin" ? "Admin" : "Free Plan"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5 sidebar-scroll">
        <p className="text-white/25 text-[10px] font-semibold uppercase tracking-[0.12em] px-2.5 mb-2">
          Menu
        </p>
        {navItems.map(({ to, label, icon: Icon, color }) => {
          const active = isActive(location.pathname, to);
          return (
            <NavLink key={to} to={to} onClick={onNavClick} className="block">
              <div className={cn(
                "flex items-center gap-2.5 px-2.5 py-[7px] rounded-[7px] text-[13px] cursor-pointer transition-all duration-150 mb-[2px]",
                active
                  ? "bg-white/[0.11] text-white"
                  : "text-white/50 hover:bg-white/[0.06] hover:text-white/80"
              )}>
                <Icon
                  className="w-4 h-4 flex-shrink-0 transition-colors"
                  style={{ color: active ? color : undefined }}
                  strokeWidth={active ? 2 : 1.75}
                />
                <span className="font-medium truncate flex-1">{label}</span>
                {active && (
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                )}
              </div>
            </NavLink>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-2.5 border-t border-white/[0.07] flex-shrink-0">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-[7px] text-white/35 hover:bg-red-500/10 hover:text-red-400 transition-all text-[13px] font-medium"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} />
          Chiqish
        </button>
      </div>
    </>
  );
}

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const session = getAuthSession();
  const { backendHealth } = useLifeOSData();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!session) return <Navigate to="/auth?tab=login" replace />;

  const navItems = session.role === "admin" ? [...NAV_ITEMS, ADMIN_ITEM] : NAV_ITEMS;
  const currentItem = navItems.find((item) => isActive(location.pathname, item.to));
  const currentLabel = currentItem?.label ?? "LifeOS";

  const handleLogout = () => {
    clearAuthSession();
    navigate("/auth?tab=login", { replace: true });
  };

  return (
    <div className="flex h-screen bg-[#F5F5F4] overflow-hidden">

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex w-[220px] flex-shrink-0 bg-[#191919] flex-col h-full border-r border-white/[0.04]">
        <SidebarNav
          navItems={navItems}
          location={location}
          session={session}
          handleLogout={handleLogout}
          onNavClick={undefined}
        />
      </aside>

      {/* ── Mobile Sidebar Overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              key="sidebar"
              initial={{ x: -220 }}
              animate={{ x: 0 }}
              exit={{ x: -220 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="fixed left-0 top-0 h-full w-[220px] bg-[#191919] flex flex-col z-50 lg:hidden border-r border-white/[0.04]"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-3.5 right-3 text-white/40 hover:text-white/80 transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>
              <SidebarNav
                navItems={navItems}
                location={location}
                session={session}
                handleLogout={handleLogout}
                onNavClick={() => setMobileOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Top header bar */}
        <header className="h-[52px] border-b border-black/[0.06] bg-[#F5F5F4] flex items-center px-4 lg:px-5 flex-shrink-0 gap-3">

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-gray-400 hover:text-gray-700 p-1 -ml-1 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1 text-[13px] select-none">
            <span className="text-gray-400 font-medium">LifeOS</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
            <span
              className="font-semibold"
              style={{ color: currentItem?.color ?? "#374151" }}
            >
              {currentLabel}
            </span>
          </div>

          <div className="flex-1" />

          {/* Status pill */}
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border",
            backendHealth.ok
              ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
              : "bg-red-50 text-red-600 border-red-200/60"
          )}>
            <span className={cn("w-1.5 h-1.5 rounded-full", backendHealth.ok ? "bg-emerald-500" : "bg-red-500")} />
            {backendHealth.ok ? "Online" : "Offline"}
          </div>

          {/* Avatar */}
          <div
            onClick={() => navigate("/settings")}
            className="w-7 h-7 rounded-full bg-slate-600 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
          >
            {getInitials(session)}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1400px]">
            <Outlet />
          </div>
        </main>

        {/* ── Mobile bottom tabs ── */}
        <nav className="lg:hidden flex h-14 border-t border-black/[0.06] bg-white/90 backdrop-blur-md flex-shrink-0">
          {BOTTOM_TABS.map(({ to, label, icon: Icon, color }) => {
            const active = isActive(location.pathname, to);
            return (
              <button
                key={to}
                onClick={() => navigate(to)}
                className="flex flex-1 flex-col items-center justify-center gap-1 focus:outline-none"
              >
                <motion.div whileTap={{ scale: 0.85 }}>
                  <Icon
                    className="h-5 w-5 transition-colors duration-150"
                    style={{ color: active ? color : undefined }}
                    strokeWidth={active ? 2.5 : 1.8}
                  />
                </motion.div>
                <span
                  className="text-[10px] font-bold transition-colors duration-150"
                  style={{ color: active ? color : "#94A3B8" }}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </nav>
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
