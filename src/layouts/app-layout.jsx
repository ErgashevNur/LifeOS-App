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
    "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition",
    isActive
      ? "border-slate-900 bg-slate-900 text-white"
      : "border-slate-300 bg-white text-slate-700 hover:border-slate-900 hover:text-slate-900",
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
    <div className="min-h-screen bg-white text-slate-950">
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-6 md:px-6">
        <aside className="hidden w-64 shrink-0 lg:flex lg:flex-col lg:gap-6">
          <div className="rounded-xl border border-slate-900 bg-slate-950 p-5 text-white">
            <p className="text-xs tracking-[0.18em] uppercase">LifeOS</p>
            <p className="mt-2 text-lg font-semibold">Mahsuldorlik paneli</p>
            <p className="mt-2 text-sm text-slate-300">
              {session.fullName ?? "User"} · {session.email}
            </p>
            <p className="mt-1 text-xs text-slate-400 uppercase">
              {session.role === "admin" ? "Admin" : "User"}
            </p>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isRouteActive(location.pathname, item.to);

              return (
                <NavLink key={item.to} to={item.to} className={navItemClassName(active)}>
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <Button variant="outline" className="justify-start" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Chiqish
          </Button>
        </aside>

        <div className="min-w-0 flex-1 space-y-4">
          <header className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-300 bg-white p-4">
            <div>
              <p className="text-xs tracking-[0.18em] text-slate-500 uppercase">LifeOS</p>
              <h1 className="text-xl font-semibold">{currentPage}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-slate-300 text-slate-600">
                Oq-qora minimal UI
              </Badge>
              <Badge variant={backendHealth.ok ? "default" : "destructive"}>
                {backendHealth.ok ? "Xizmat ishlayapti" : "Xizmat vaqtincha uzilgan"}
              </Badge>
              {isLoading ? <Badge variant="secondary">API yuklanmoqda...</Badge> : null}
              {error ? <Badge variant="destructive">Xizmat vaqtincha mavjud emas</Badge> : null}
              <Button variant="outline" onClick={() => navigate("/")}>
                Bosh sahifa
              </Button>
            </div>
          </header>

          <nav className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isRouteActive(location.pathname, item.to);

              return (
                <NavLink key={item.to} to={item.to} className={navItemClassName(active)}>
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
            <Button variant="outline" className="shrink-0" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </nav>

          <main>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
