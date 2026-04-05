import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest, getAuthSession } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Users, Search, RefreshCw, AlertCircle, Calendar, MapPin, Building, Phone } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

function formatDate(value) {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString("uz-UZ");
}

function initialsFromName(name) {
  if (!name) return "U";
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function avatarFromName(name) {
  const initials = initialsFromName(name);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'><rect width='100%' height='100%' fill='%23f1f5f9'/><text x='50%' y='54%' dominant-baseline='middle' text-anchor='middle' font-size='34' font-weight='900' fill='%2364748b' font-family='Inter, sans-serif'>${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export default function UsersPage() {
  const session = getAuthSession();
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    if (session?.role !== "admin") {
      setUsers([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const payload = await apiRequest("/admin/users", {}, { auth: true });
      setUsers(Array.isArray(payload) ? payload : []);
      setError(null);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) {
      return users;
    }

    return users.filter((user) =>
      [
        user.fullName,
        user.email,
        user.phone,
        user.profession,
        user.region,
        user.city,
        user.district,
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(text)),
    );
  }, [query, users]);

  if (session?.role !== "admin") {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <Card className="border-0 shadow-2xl shadow-rose-900/10 ring-1 ring-slate-100 rounded-[2.5rem] bg-white max-w-md w-full text-center p-8">
          <div className="mx-auto w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-6">
            <AlertCircle className="w-10 h-10" />
          </div>
          <CardTitle className="text-2xl font-extrabold tracking-tight mb-2">Ruxsat etilmagan</CardTitle>
          <p className="text-slate-500">Bu bo'lim faqat administratorlar uchun ochiq.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <Card className="border-0 shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 rounded-[2.5rem] bg-white overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between gap-2 px-8 pt-8 pb-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-2xl font-extrabold tracking-tight text-slate-900">Foydalanuvchilar</CardTitle>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Admin Panel</p>
            </div>
          </div>
          <Button 
            onClick={() => void fetchUsers()} 
            disabled={isLoading}
            className="rounded-2xl h-12 px-6 font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/10 transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 hidden sm:flex"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Yangilash
          </Button>
          <Button 
            onClick={() => void fetchUsers()} 
            disabled={isLoading}
            size="icon"
            className="rounded-xl h-11 w-11 bg-slate-900 text-white sm:hidden"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
        </CardHeader>
        <CardContent className="px-8 pb-8 space-y-4">
          <div className="relative group max-w-xl">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
              <Search className="h-5 w-5" />
            </div>
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ism, email, telefon bo'yicha qidiring..."
              className="h-14 w-full pl-12 pr-6 rounded-2xl border-0 ring-1 ring-slate-200 bg-slate-50 font-medium text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all text-base"
            />
          </div>
          <div className="flex items-center gap-4">
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
              Jami: <span className="text-slate-900">{filteredUsers.length}</span>
            </p>
            <div className="w-1 h-1 bg-slate-300 rounded-full" />
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
              Xavfsizlik yoqilgan
            </p>
          </div>
          {error ? (
            <div className="rounded-2xl border-0 bg-red-50 p-4 text-sm font-medium text-red-700 flex items-center ring-1 ring-red-100">
              <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
              {error}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <section className="grid gap-6 md:grid-cols-2">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="border-0 shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 rounded-[2rem] bg-white overflow-hidden hover:-translate-y-1 transition-all duration-300">
            <CardHeader className="flex flex-row items-start justify-between gap-4 px-8 pt-8 pb-4">
              <div className="flex items-center gap-4">
                <img
                  src={avatarFromName(user.fullName)}
                  alt={user.fullName}
                  className="h-14 w-14 rounded-full border-0 shadow-sm ring-2 ring-white object-cover hidden sm:block"
                />
                <div>
                  <CardTitle className="text-xl font-extrabold text-slate-900 line-clamp-1">{user.fullName}</CardTitle>
                  <p className="text-sm font-bold text-slate-400 mt-0.5">{user.email}</p>
                </div>
              </div>
              <Badge 
                variant="outline" 
                className={cn(
                  "rounded-full px-4 py-1.5 text-[9px] uppercase font-black tracking-widest border-0 shadow-sm shadow-black/5 mt-1 sm:mt-0",
                  user.role === "admin" ? "bg-fuchsia-50 text-fuchsia-600 ring-1 ring-fuchsia-200/50" : "bg-slate-50 text-slate-500 ring-1 ring-slate-200/50"
                )}
              >
                {user.role}
              </Badge>
            </CardHeader>
            <CardContent className="px-8 pb-8">
               <div className="grid grid-cols-2 gap-4 mt-2">
                 <div className="flex items-start gap-3">
                   <Phone className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                   <div>
                     <p className="text-[9px] uppercase font-black tracking-widest text-slate-400">Telefon</p>
                     <p className="text-sm font-bold text-slate-700 mt-0.5">{user.phone || "-"}</p>
                   </div>
                 </div>
                 <div className="flex items-start gap-3">
                   <Building className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                   <div>
                     <p className="text-[9px] uppercase font-black tracking-widest text-slate-400">Kasb</p>
                     <p className="text-sm font-bold text-slate-700 mt-0.5">{user.profession || "-"}</p>
                   </div>
                 </div>
                 <div className="flex items-start gap-3 col-span-2">
                   <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                   <div>
                     <p className="text-[9px] uppercase font-black tracking-widest text-slate-400">Manzil</p>
                     <p className="text-sm font-bold text-slate-700 mt-0.5">
                       {[user.region, user.city, user.district].filter(Boolean).join(", ") || user.address || "-"}
                     </p>
                   </div>
                 </div>
                 <div className="flex items-start gap-3 col-span-2 pt-4 border-t border-slate-50 mt-2">
                   <Calendar className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                   <div className="flex justify-between w-full">
                     <div>
                       <p className="text-[9px] uppercase font-black tracking-widest text-slate-400">Qo'shilgan</p>
                       <p className="text-sm font-bold text-slate-700 mt-0.5">{formatDate(user.createdAt)}</p>
                     </div>
                     <p className="text-[9px] uppercase font-black tracking-widest text-slate-300 self-end">ID: {user.id}</p>
                   </div>
                 </div>
               </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
