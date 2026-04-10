import { useLifeOSData } from "@/lib/lifeos-store";
import { cn } from "@/lib/utils";
import { clearAuthSession, getAuthSession } from "@/lib/auth";
import { useLifeOSData } from "@/lib/lifeos-store";
import {
  BookOpen,
  Bot,
  HeartPulse,
  LayoutDashboard,
  LineChart,
  LogOut,
  Repeat,
  Settings,
  Shield,
  Target,
  Trophy,
  Users,
  MessageSquare,
  Wallet,
  Zap,
  ChevronRight,
  Menu,
  X,
  Bell
} from "lucide-react";
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BASE_NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard",   icon: LayoutDashboard, color: "#7C3AED" },
  { to: "/goals",     label: "Maqsadlar",   icon: Target,          color: "#3B82F6" },
  { to: "/habits",    label: "Odatlar",     icon: Repeat,          color: "#10B981" },
  { to: "/books",     label: "Kitoblar",    icon: BookOpen,        color: "#F59E0B" },
  { to: "/healthy-life", label: "Sog'liq",  icon: HeartPulse,      color: "#F43F5E" },
  { to: "/mastery",   label: "Mahorat",     icon: Trophy,          color: "#9333EA" },
  { to: "/finance",   label: "Moliya",      icon: Wallet,          color: "#14B8A6" },
  { to: "/networking",label: "Networking",  icon: Users,           color: "#6366F1" },
  { to: "/community", label: "Jamiyat",     icon: MessageSquare,   color: "#EC4899" },
  { to: "/assistant", label: "Assistant",   icon: Bot,             color: "#0EA5E9" },
  { to: "/analytics", label: "Analytics",   icon: LineChart,       color: "#F97316" },
  { to: "/settings",  label: "Sozlamalar",  icon: Settings,        color: "#94A3B8" },
];

const ADMIN_NAV_ITEM = { to: "/users", label: "Users", icon: Shield, color: "#EF4444" };

function isActive(current, target) {
  return current === target || current.startsWith(`${target}/`);
}

function SidebarContent({ navItems, location, session, handleLogout, onNavClick }) {
  const initials = (session.firstName?.[0] ?? "") + (session.lastName?.[0] ?? "");

  return (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-[52px] border-b border-white/[0.07] flex-shrink-0">
        <div className="w-6 h-6 rounded-[7px] bg-violet-600 flex items-center justify-center flex-shrink-0">
          <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
        </div>
        <span className="text-white font-bold text-[15px] tracking-tight">LifeOS</span>
      </div>

      {/* User */}
      <div className="px-3 py-2.5 border-b border-white/[0.07] flex-shrink-0">
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] hover:bg-white/[0.06] cursor-pointer transition-colors">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-md">
            {initials || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white/90 text-[13px] font-semibold leading-tight truncate">
              {session.firstName ?? "User"}'s Workspace
            </p>
            <p className="text-white/35 text-[11px] mt-0.5">
              {session.role === "admin" ? "Admin" : "Free Plan"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5 sidebar-scroll">
        <p className="text-white/25 text-[10px] font-semibold uppercase tracking-[0.1em] px-2.5 mb-2">
          Menu
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isRouteActive(location.pathname, item.to);

          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavClick}
              className="block"
            >
              <div
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-[7px] rounded-[7px] text-[13px] cursor-pointer transition-all duration-150 mb-[2px] group",
                  active
                    ? "bg-white/[0.11] text-white"
                    : "text-white/50 hover:bg-white/[0.06] hover:text-white/80"
                )}
              >
                <div
                  className="w-5 h-5 flex items-center justify-center flex-shrink-0"
                >
                  <Icon
                    className="w-4 h-4 transition-colors"
                    style={{ color: active ? item.color : undefined }}
                    strokeWidth={active ? 2 : 1.75}
                  />
                </div>
                <span className="font-medium truncate flex-1">{item.label}</span>
                {active && (
                  <div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!session) {
    return <Navigate to="/auth?tab=login" replace />;
  }

  if (!session) return <Navigate to="/auth?tab=login" replace />;

  const currentItem = navItems.find((item) => isRouteActive(location.pathname, item.to));
  const currentPage = currentItem?.label ?? "LifeOS";

  const handleLogout = () => {
    clearAuthSession();
    navigate("/auth?tab=login", { replace: true });
  };

  const initials = getInitials(session);

  return (
    <div className="flex h-screen bg-[#F5F5F4] overflow-hidden">

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
              className="fixed left-0 top-0 h-full w-[220px] bg-[#191919] flex flex-col z-50 lg:hidden border-r border-white/[0.04]"
            >
              {/* Close button */}
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

        {/* Top Header */}
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
              {currentPage}
            </span>
          </div>
          <span className="text-sm font-black tracking-tight text-slate-900">LifeOS</span>
        </div>

          <div className="flex-1" />

          {/* Status pill */}
          <div
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border",
              backendHealth.ok
                ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                : "bg-red-50 text-red-600 border-red-200/60"
            )}
          >
            <span
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                backendHealth.ok ? "bg-emerald-500" : "bg-red-500"
              )}
            />
            {backendHealth.ok ? "Online" : "Offline"}
          </div>

          {/* Avatar */}
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity">
            {(session.firstName?.[0] ?? "") + (session.lastName?.[0] ?? "") || "U"}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-5 lg:p-7 max-w-[1400px] page-enter">
            <Outlet />
          </div>
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
