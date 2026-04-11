import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLifeOSData } from "@/lib/lifeos-store";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL, clearAuthSession, getAuthSession } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
  Bell, LogOut, RotateCcw, ChevronRight,
  Shield, Zap, Skull, UploadCloud, User,
  Globe, Camera,
} from "lucide-react";

const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

const DISCIPLINE_MODES = [
  {
    key: "soft",
    label: "Soft",
    icon: Shield,
    desc: "Yumshoq eslatmalar",
    color: "text-sky-600",
    bg: "bg-sky-50",
    border: "ring-sky-200",
    activeBg: "bg-sky-50",
  },
  {
    key: "hard",
    label: "Hard",
    icon: Zap,
    desc: "Qattiq nazorat",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "ring-amber-200",
    activeBg: "bg-amber-50",
  },
  {
    key: "brutal",
    label: "Brutal",
    icon: Skull,
    desc: "Uzr yo'q.",
    color: "text-red-600",
    bg: "bg-red-50",
    border: "ring-red-200",
    activeBg: "bg-red-50",
  },
];

// ── Toggle switch ─────────────────────────────────────────────────────────────
function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={cn(
        "relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ring-1",
        value ? "bg-indigo-600 ring-indigo-600" : "bg-slate-200 ring-slate-200",
      )}
    >
      <motion.div
        className={cn("absolute top-1 w-4 h-4 rounded-full shadow-sm", value ? "bg-white" : "bg-white")}
        animate={{ left: value ? "calc(100% - 20px)" : 4 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  );
}

// ── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <p className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-400 mb-3">
      {children}
    </p>
  );
}

// ── Row ───────────────────────────────────────────────────────────────────────
function Row({ icon: Icon, label, right, last }) {
  return (
    <div className={cn("flex items-center justify-between py-3.5", !last && "border-b border-slate-100")}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
          <Icon className="w-4 h-4 text-slate-500" />
        </div>
        <span className="text-sm font-semibold text-slate-700">{label}</span>
      </div>
      {right}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const navigate = useNavigate();
  const session = getAuthSession();
  const { data, actions } = useLifeOSData();
  const { toast } = useToast();
  const [discipline, setDiscipline] = useState("hard");
  const [isResetting, setIsResetting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");

  const notifs = data.settings.notifications;

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setIsUploading(true);
    const payload = await actions.uploadImage(file);
    setIsUploading(false);
    if (payload?.url) {
      setAvatarUrl(`${API_ORIGIN}${payload.url}`);
      toast({ title: "Rasm muvaffaqiyatli yuklandi" });
    } else {
      toast({ variant: "destructive", title: "Rasm yuklashda xato" });
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    await actions.resetState();
    setIsResetting(false);
    toast({ title: "Reset bajarildi", description: "Barcha ma'lumotlar qaytarildi." });
  };

  const handleLogout = () => {
    clearAuthSession();
    navigate("/auth?tab=login", { replace: true });
  };

  const initials = session
    ? `${session.firstName?.[0] ?? ""}${session.lastName?.[0] ?? ""}`.toUpperCase()
    : "U";

  const fullName = session?.fullName
    ?? [session?.firstName, session?.lastName].filter(Boolean).join(" ")
    ?? "Foydalanuvchi";

  return (
    <div className="min-h-full bg-slate-50">

      {/* ── Page header ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 lg:px-8"
      >
        <div className="mx-auto max-w-2xl flex h-16 items-center">
          <div>
            <p className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">Settings</p>
            <p className="text-base font-black text-slate-900 leading-tight mt-0.5">Sozlamalar</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mx-auto max-w-2xl px-4 lg:px-8 py-6 flex flex-col gap-6"
      >

        {/* ── Profile card ──────────────────────────────────────── */}
        <div className="rounded-3xl bg-white ring-1 ring-slate-100 shadow-sm overflow-hidden">
          {/* cover gradient */}
          <div className="h-20 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />

          <div className="px-6 pb-6">
            {/* avatar */}
            <div className="relative -mt-10 mb-4 inline-block">
              <div className="w-20 h-20 rounded-2xl ring-4 ring-white shadow-md overflow-hidden bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                {avatarUrl
                  ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                  : <span className="text-2xl font-black text-white">{initials}</span>
                }
              </div>
              <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center cursor-pointer transition-colors shadow-md">
                <Camera className="w-3.5 h-3.5 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUpload}
                  disabled={isUploading}
                />
              </label>
            </div>

            <p className="text-lg font-black text-slate-900">{fullName}</p>
            <p className="text-sm text-slate-500 font-medium">{session?.email}</p>

            <div className="flex flex-wrap gap-2 mt-3">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-indigo-600">
                <User className="w-3 h-3" />
                {session?.role === "admin" ? "Admin" : "Member"}
              </span>
              {session?.profession && (
                <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">
                  {session.profession}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Notifications ─────────────────────────────────────── */}
        <div>
          <SectionLabel>Bildirishnomalar</SectionLabel>
          <div className="rounded-2xl bg-white ring-1 ring-slate-100 shadow-sm px-4">
            <Row
              icon={Bell}
              label="Odatlar eslatmasi"
              right={
                <Toggle
                  value={notifs.habits}
                  onChange={(v) => actions.toggleNotification("habits", v)}
                />
              }
            />
            <Row
              icon={Bell}
              label="Maqsadlar eslatmasi"
              right={
                <Toggle
                  value={notifs.goals}
                  onChange={(v) => actions.toggleNotification("goals", v)}
                />
              }
            />
            <Row
              icon={Bell}
              label="AI Murabbiy"
              last
              right={
                <Toggle
                  value={notifs.assistant}
                  onChange={(v) => actions.toggleNotification("assistant", v)}
                />
              }
            />
          </div>
        </div>

        {/* ── Discipline mode ───────────────────────────────────── */}
        <div>
          <SectionLabel>Intizom rejimi</SectionLabel>
          <div className="grid grid-cols-3 gap-3">
            {DISCIPLINE_MODES.map(({ key, label, icon: Icon, desc, color, bg, border, activeBg }) => {
              const active = discipline === key;
              return (
                <motion.button
                  key={key}
                  onClick={() => setDiscipline(key)}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-2xl p-4 ring-1 transition-all duration-150",
                    active
                      ? `${activeBg} ${border} shadow-sm`
                      : "bg-white ring-slate-100 hover:ring-slate-200",
                  )}
                >
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", active ? bg : "bg-slate-100")}>
                    <Icon className={cn("w-5 h-5", active ? color : "text-slate-400")} />
                  </div>
                  <span className={cn("text-xs font-black", active ? color : "text-slate-500")}>
                    {label}
                  </span>
                  <span className="text-[9px] text-center font-medium text-slate-400 leading-tight">
                    {desc}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ── Language ──────────────────────────────────────────── */}
        {data.content.settings.languages?.length > 0 && (
          <div>
            <SectionLabel>Til</SectionLabel>
            <div className="rounded-2xl bg-white ring-1 ring-slate-100 shadow-sm p-2 flex gap-2">
              {data.content.settings.languages.map((lang) => {
                const active = data.settings.language === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => actions.setLanguage(lang.code)}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl text-xs font-black transition-all",
                      active
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-500 hover:bg-slate-50",
                    )}
                  >
                    {lang.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Danger zone ───────────────────────────────────────── */}
        <div>
          <SectionLabel>Xavfli zona</SectionLabel>
          <div className="flex flex-col gap-2">
            <button
              onClick={handleReset}
              disabled={isResetting}
              className="w-full flex items-center justify-between rounded-2xl bg-white ring-1 ring-slate-100 px-5 py-4 hover:ring-red-100 hover:bg-red-50/50 transition-all disabled:opacity-50 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
                  <RotateCcw className="w-4 h-4 text-red-500" />
                </div>
                <span className="text-sm font-semibold text-slate-700 group-hover:text-red-600 transition-colors">
                  {isResetting ? "Tiklanmoqda..." : "Ma'lumotlarni reset qilish"}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between rounded-2xl bg-red-50 ring-1 ring-red-100 px-5 py-4 hover:bg-red-100 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center">
                  <LogOut className="w-4 h-4 text-red-600" />
                </div>
                <span className="text-sm font-bold text-red-600">Tizimdan chiqish</span>
              </div>
              <ChevronRight className="w-4 h-4 text-red-400" />
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
