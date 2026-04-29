import { useLifeOSData } from "@/lib/lifeos-store";
import { cn } from "@/lib/utils";
import { clearAuthSession, getAuthSession } from "@/lib/auth";
import {
  Bot,
  Brain,
  Calendar,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Shield,
  Target,
  X,
  Zap,
} from "lucide-react";
import { Navigate, Outlet, useLocation, useNavigate, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   Navigation config
   ───────────────────────────────────────────────────────────────────────────── */
const NAV_ITEMS = [
  { to: "/dashboard",  label: "Dashboard",  icon: LayoutDashboard },
  { to: "/goals",      label: "Goals",      icon: Target },
  { to: "/planner",    label: "Planner",    icon: Calendar },
  { to: "/focus",      label: "Deep Work",  icon: Zap },
  { to: "/reflection", label: "Reflection", icon: Brain },
  { to: "/assistant",  label: "AI Coach",   icon: Bot },
  { to: "/settings",   label: "Settings",   icon: Settings },
];

const ADMIN_ITEM = { to: "/users", label: "Users", icon: Shield };

const BOTTOM_TABS = [
  { to: "/dashboard", label: "Home",    icon: LayoutDashboard },
  { to: "/planner",   label: "Planner", icon: Calendar },
  { to: "/focus",     label: "Focus",   icon: Zap },
  { to: "/assistant", label: "Coach",   icon: Bot },
  { to: "/settings",  label: "Settings",icon: Settings },
];

function isActive(current, target) {
  return current === target || current.startsWith(`${target}/`);
}

function getInitials(session) {
  const f = session?.firstName?.[0] ?? "";
  const l = session?.lastName?.[0] ?? "";
  return (f + l).toUpperCase() || "U";
}

function SidebarContent({ navItems, location, session, handleLogout, onNavClick }) {
  const initials = getInitials(session);

  return (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-[52px] border-b border-white/[0.07] flex-shrink-0">
        <div className="w-6 h-6 rounded-[7px] bg-violet-600 flex items-center justify-center flex-shrink-0">
          <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
        </div>
        <span className="text-[#111827] font-bold text-[15px] tracking-tight">LifeOS</span>
      </div>

      {/* User */}
      <div className="px-3 py-2.5 border-b border-white/[0.07] flex-shrink-0">
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] hover:bg-white/[0.06] cursor-pointer transition-colors">
          <div className="w-7 h-7 rounded-full bg-slate-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-md">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[#111827] text-[13px] font-semibold leading-tight truncate">
              {session?.firstName ?? "User"}&apos;s Life OS
            </p>
            <p className="text-white/35 text-[11px] mt-0.5">
              {session?.role === "admin" ? "Admin" : "Free Plan"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5 sidebar-scroll">
        <p className="text-white/25 text-[10px] font-semibold uppercase tracking-[0.1em] px-2.5 mb-2">
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
                  strokeWidth={active ? 2.2 : 1.8}
                />
                <span className={cn("font-medium truncate flex-1", active && "font-semibold")}>{label}</span>
                {active && (
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                )}
              </div>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-2.5 border-t border-white/[0.07] flex-shrink-0">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-xl text-[#9CA3AF] hover:bg-red-50 hover:text-red-500 transition-all text-[13px] font-medium"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} />
          Sign out
        </button>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   App Layout
   ───────────────────────────────────────────────────────────────────────────── */
export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const session = getAuthSession();
  const { backendHealth } = useLifeOSData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!session) return <Navigate to="/auth?tab=login" replace />;

  const navItems = session.role === "admin" ? [...NAV_ITEMS, ADMIN_ITEM] : NAV_ITEMS;
  const currentItem = navItems.find((item) => isActive(location.pathname, item.to));
  const currentLabel = currentItem?.label ?? "LifeOS";

  const handleLogout = () => {
    clearAuthSession();
    navigate("/auth?tab=login", { replace: true });
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex w-[220px] flex-shrink-0 bg-[#191919] flex-col h-full border-r border-white/[0.04]">
        <SidebarContent
          navItems={navItems}
          location={location}
          session={session}
          handleLogout={handleLogout}
          onNavClick={undefined}
        />
      </aside>

      {/* ── Mobile Sidebar Overlay ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              key="sidebar"
              initial={{ x: -220 }}
              animate={{ x: 0 }}
              exit={{ x: -220 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="fixed left-0 top-0 h-full w-[220px] bg-white flex flex-col z-50 lg:hidden border-r border-slate-100"
            >
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-3.5 right-3 text-white/40 hover:text-white/80 transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>
              <SidebarContent
                navItems={navItems}
                location={location}
                session={session}
                handleLogout={handleLogout}
                onNavClick={() => setMobileMenuOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Top header bar */}
        <header className="h-[52px] border-b border-black/[0.06] bg-[#F5F5F4] flex items-center px-4 lg:px-5 flex-shrink-0 gap-3">

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden text-gray-400 hover:text-gray-700 p-1 -ml-1 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1 text-[13px] select-none">
            <span className="text-gray-400 font-medium">LifeOS</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
            <span
              className="text-gray-700 font-semibold"
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
          <button
            onClick={() => navigate("/settings")}
            className="w-8 h-8 rounded-full bg-[#6366F1]/10 border border-[#6366F1]/15 flex items-center justify-center text-[#6366F1] text-[11px] font-bold flex-shrink-0 cursor-pointer hover:bg-[#6366F1]/15 transition-colors"
          >
            {getInitials(session)}
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
          <div className="max-w-[1400px] page-enter">
            <Outlet />
          </div>
        </main>

        {/* ── Mobile bottom tabs ── */}
        <nav className="lg:hidden flex h-14 border-t border-slate-100 bg-white flex-shrink-0">
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
                    className="h-5 w-5 transition-colors duration-150"
                    style={{ color: active ? "#6366F1" : "#9CA3AF" }}
                    strokeWidth={active ? 2.2 : 1.8}
                  />
                </motion.div>
                <span
                  className="text-[10px] font-semibold transition-colors duration-150"
                  style={{ color: active ? "#6366F1" : "#9CA3AF" }}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}