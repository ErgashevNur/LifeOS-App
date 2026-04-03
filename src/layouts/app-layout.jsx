import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLifeOSData } from "@/lib/lifeos-store";
import { cn } from "@/lib/utils";
import { clearAuthSession, getAuthSession } from "@/lib/auth";
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
} from "lucide-react";
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

const BASE_NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/goals", label: "Maqsadlar", icon: Target },
  { to: "/habits", label: "Odatlar", icon: Repeat },
  { to: "/assistant", label: "Assistant", icon: Bot },
  { to: "/books", label: "Kitoblar", icon: BookOpen },
  { to: "/healthy-life", label: "Healthy Life", icon: HeartPulse },
  { to: "/mastery", label: "Mahorat", icon: Trophy },
  { to: "/networking", label: "Networking", icon: Users },
  { to: "/analytics", label: "Analytics", icon: LineChart },
  { to: "/settings", label: "Sozlamalar", icon: Settings },
];

const ADMIN_NAV_ITEM = { to: "/users", label: "Users", icon: Shield };

function isRouteActive(currentPath, targetPath) {
  return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
}

function navItemClassName(isActive) {
  return cn(
    "flex items-center gap-3 rounded-[1rem] px-4 py-3.5 text-[0.95rem] font-bold tracking-tight transition-all duration-300",
    isActive
      ? "bg-slate-900 text-white shadow-xl shadow-slate-900/10 scale-[1.02]"
      : "bg-transparent text-slate-500 hover:bg-slate-200/50 hover:text-slate-900",
  );
}

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const session = getAuthSession();
  const { isLoading, error, backendHealth } = useLifeOSData();

  if (!session) {
    return <Navigate to="/auth?tab=login" replace />;
  }

  const navItems =
    session.role === "admin" ? [...BASE_NAV_ITEMS, ADMIN_NAV_ITEM] : BASE_NAV_ITEMS;

  const currentPage =
    navItems.find((item) => isRouteActive(location.pathname, item.to))?.label ??
    "LifeOS";

  const handleLogout = () => {
    clearAuthSession();
    navigate("/auth?tab=login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 selection:bg-slate-900 selection:text-white">
      <div className="mx-auto flex w-full max-w-[1400px] gap-8 px-4 py-8 md:px-8">
        
        {/* Sidebar */}
        <aside className="hidden w-72 shrink-0 lg:flex lg:flex-col lg:gap-8">
          
          {/* User Profile Card */}
          <div className="rounded-[2rem] bg-white p-8 shadow-2xl shadow-indigo-900/5 ring-1 ring-slate-200/50 relative overflow-hidden group hover:ring-indigo-500/20 transition-all duration-500">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 to-cyan-400 opacity-50 group-hover:opacity-100 transition-opacity" />
            <p className="text-[10px] font-black tracking-[0.25em] text-slate-400 uppercase">LifeOS</p>
            <p className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">Assalomu alaykum,</p>
            <p className="mt-1 text-slate-500 font-medium leading-relaxed truncate">
              {session.fullName ?? "User"}
            </p>
            <div className="mt-6 flex items-center justify-between">
              <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-600">
                {session.role === "admin" ? "Admin" : "Premium"}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-1.5 p-2 rounded-[2rem] bg-white shadow-xl shadow-slate-200/40 ring-1 ring-slate-100/50">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isRouteActive(location.pathname, item.to);

              return (
                <NavLink key={item.to} to={item.to} className={navItemClassName(active)}>
                  <Icon className="h-5 w-5" />
                  {item.label}
                </NavLink>
              );
            })}
            
            <div className="my-2 border-t border-slate-100" />
            
            <button onClick={handleLogout} className="flex items-center gap-3 rounded-[1rem] px-4 py-3.5 text-[0.95rem] font-bold tracking-tight text-red-500 hover:bg-red-50 hover:text-red-600 transition-all text-left w-full">
              <LogOut className="h-5 w-5" />
              Chiqish
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className="min-w-0 flex-1 flex flex-col gap-8">
          
          {/* Top Header */}
          <header className="flex flex-col gap-4 sm:flex-row sm:items-end justify-between bg-white rounded-[2rem] p-8 shadow-2xl shadow-indigo-900/5 ring-1 ring-slate-200/50">
            <div>
              <p className="text-[10px] font-black tracking-[0.25em] text-slate-400 uppercase mb-2">LifeOS <span className="opacity-50">/</span> {currentPage}</p>
              <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tighter text-slate-900">{currentPage}.</h1>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-0 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full px-4 py-1.5 font-bold tracking-widest text-[9px] uppercase transition-colors">
                Ultra-Clean UI
              </Badge>
              <Badge variant={backendHealth.ok ? "default" : "destructive"} className="rounded-full px-4 py-1.5 font-bold tracking-widest text-[9px] uppercase shadow-none border-0">
                {backendHealth.ok ? "Sys Active" : "Sys Down"}
              </Badge>
              {isLoading && <Badge variant="secondary" className="rounded-full font-bold">API Sync</Badge>}
            </div>
          </header>

          {/* Mobile Nav */}
          <nav className="flex gap-2 overflow-x-auto pb-2 lg:hidden no-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isRouteActive(location.pathname, item.to);

              return (
                <NavLink key={item.to} to={item.to} className={cn("flex shrink-0 items-center gap-2 rounded-[1rem] px-4 py-2 font-bold text-sm", active ? "bg-slate-900 text-white" : "bg-white text-slate-500 shadow-sm ring-1 ring-slate-200/50")}>
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Outlet Container */}
          <main className="flex-1 rounded-[2.5rem] bg-white p-6 shadow-2xl shadow-slate-200/30 ring-1 ring-slate-100 lg:p-10 relative overflow-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
