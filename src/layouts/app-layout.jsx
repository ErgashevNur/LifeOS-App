import { Badge } from "@/components/ui/badge";
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
  MessageSquare,
  Wallet
} from "lucide-react";
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

const BASE_NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/goals", label: "Maqsadlar", icon: Target },
  { to: "/finance", label: "Moliya", icon: Wallet },
  { to: "/community", label: "Cemmuniti", icon: MessageSquare },
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
      : "bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-900",
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
    <div className="min-h-screen bg-slate-50 text-slate-950 selection:bg-slate-900 selection:text-white">
      <div className="mx-auto flex w-full max-w-[1440px] gap-8 px-4 py-8 md:px-8">
        
        {/* Sidebar */}
        <aside className="hidden w-72 shrink-0 lg:flex lg:flex-col lg:gap-8">
          
          {/* User Profile Card */}
          <div className="rounded-[2.5rem] bg-white p-8 shadow-premium ring-1 ring-slate-100/50 relative overflow-hidden group hover:-translate-y-1 transition-all duration-500">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-indigo-500 to-cyan-400 opacity-50 group-hover:opacity-100 transition-opacity" />
            <p className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">LifeOS Platform</p>
            <p className="mt-4 text-2xl font-black tracking-tighter text-slate-900">Salom, {session.firstName ?? "User"}!</p>
            <p className="mt-1 text-slate-500 font-medium leading-relaxed truncate">
              Bugun unumdorlik vaqti.
            </p>
            <div className="mt-8 flex items-center justify-between">
              <span className="inline-flex items-center rounded-lg bg-indigo-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-indigo-600 ring-1 ring-indigo-500/10">
                {session.role === "admin" ? "Admin" : "Premium Member"}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-1.5 p-2 rounded-[2.5rem] bg-white shadow-premium ring-1 ring-slate-100/50">
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
            
            <div className="my-3 border-t border-slate-50 mx-4" />
            
            <button onClick={handleLogout} className="flex items-center gap-3 rounded-[1rem] px-4 py-3.5 text-[0.95rem] font-bold tracking-tight text-red-500 hover:bg-red-50 hover:text-red-600 transition-all text-left w-full">
              <LogOut className="h-5 w-5" />
              Chiqish
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className="min-w-0 flex-1 flex flex-col gap-8">
          
          {/* Top Header */}
          <header className="flex flex-col gap-4 sm:flex-row sm:items-end justify-between bg-white rounded-[2.5rem] p-8 shadow-premium ring-1 ring-slate-100/50">
            <div>
              <p className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase mb-2">OS <span className="opacity-50">/</span> {currentPage}</p>
              <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-slate-900">{currentPage}.</h1>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-0 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-lg px-4 py-1.5 font-bold tracking-widest text-[9px] uppercase transition-colors">
                Clean Vision UI
              </Badge>
              <Badge variant={backendHealth.ok ? "default" : "destructive"} className="rounded-lg px-4 py-1.5 font-bold tracking-widest text-[9px] uppercase shadow-none border-0 ring-1 ring-slate-900/5">
                {backendHealth.ok ? "Sys Active" : "Sys Down"}
              </Badge>
            </div>
          </header>

          {/* Mobile Nav */}
          <nav className="flex gap-2 overflow-x-auto pb-4 lg:hidden no-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isRouteActive(location.pathname, item.to);

              return (
                <NavLink key={item.to} to={item.to} className={cn("flex shrink-0 items-center gap-2 rounded-xl px-5 py-3 font-bold text-sm transition-all shadow-sm", active ? "bg-slate-900 text-white scale-[1.05]" : "bg-white text-slate-500 ring-1 ring-slate-200/50")}>
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Outlet Main Container */}
          <main className="flex-1 rounded-[3rem] bg-white p-6 shadow-premium ring-1 ring-slate-100 lg:p-12 relative min-h-[600px]">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
