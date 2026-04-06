import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getAuthSession } from "@/lib/auth";
import { useLifeOSData } from "@/lib/lifeos-store";
import { cn } from "@/lib/utils";
import {
  Flame, Bell, CheckCircle2, Circle, Plus, Zap,
  Clock, TrendingUp, BookOpen, Repeat, HeartPulse,
  Trophy, Wallet, Users, X, Timer, ArrowRight,
  Target, BarChart3, Sparkles,
} from "lucide-react";

// ─── Helpers ────────────────────────────────────────────────────────────────
function getDayCount(createdAt) {
  if (!createdAt) return 1;
  return Math.max(1, Math.floor((Date.now() - new Date(createdAt)) / 86400000) + 1);
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Xayrli tong";
  if (h < 17) return "Xayrli kun";
  return "Xayrli kech";
}

function getStatus(pct) {
  if (pct >= 80) return { label: "ON TRACK",       bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-500" };
  if (pct >= 40) return { label: "FALLING BEHIND",  bg: "bg-amber-50",   text: "text-amber-600",   dot: "bg-amber-500" };
  return           { label: "BEHIND",              bg: "bg-red-50",     text: "text-red-600",     dot: "bg-red-500" };
}

function getInitials(session) {
  return ((session?.firstName?.[0] ?? "") + (session?.lastName?.[0] ?? "")).toUpperCase() || "U";
}

// ─── Animation variants ──────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0 },
};

const stagger = {
  show: { transition: { staggerChildren: 0.07 } },
};

// ─── Focus Timer ─────────────────────────────────────────────────────────────
function FocusTimer({ onClose }) {
  const [secs, setSecs] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!running || done) return;
    const id = setInterval(() => {
      setSecs((s) => {
        if (s <= 1) { clearInterval(id); setDone(true); setRunning(false); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, done]);

  const mm  = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss  = String(secs % 60).padStart(2, "0");
  const r   = 54;
  const circ = 2 * Math.PI * r;
  const progress = secs / (25 * 60);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-sm"
    >
      <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full text-slate-500 hover:text-white hover:bg-white/10 transition-colors">
        <X className="w-5 h-5" />
      </button>

      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }}>
        <p className="text-center text-[10px] font-black tracking-[0.4em] uppercase text-indigo-400 mb-8">
          FOCUS SESSION
        </p>

        <div className="relative w-48 h-48 mx-auto mb-10">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 128 128">
            <circle cx="64" cy="64" r={r} fill="none" stroke="#1e1e2e" strokeWidth="6" />
            <motion.circle
              cx="64" cy="64" r={r} fill="none"
              stroke={done ? "#10B981" : "#6366F1"}
              strokeWidth="6"
              strokeDasharray={circ}
              strokeDashoffset={circ * (1 - progress)}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1s linear, stroke 0.5s" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {done ? (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center gap-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                <span className="text-sm font-black text-white">Bajarildi!</span>
              </motion.div>
            ) : (
              <>
                <span className="text-4xl font-black text-white tabular-nums">{mm}:{ss}</span>
                <span className="text-xs font-semibold text-slate-500 mt-1">daqiqa</span>
              </>
            )}
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          {!done && (
            <button
              onClick={() => setRunning((r) => !r)}
              className={cn(
                "px-8 py-3.5 rounded-2xl text-sm font-black tracking-wide transition-all active:scale-95",
                running
                  ? "bg-white/10 text-white border border-white/20"
                  : "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30",
              )}
            >
              {running ? "PAUSE" : "START"}
            </button>
          )}
          <button
            onClick={() => { setSecs(25 * 60); setRunning(false); setDone(false); }}
            className="px-8 py-3.5 rounded-2xl text-sm font-black text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all"
          >
            RESET
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Progress Ring ────────────────────────────────────────────────────────────
function ProgressRing({ value, size = 64, stroke = 5, color = "#6366F1" }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="-rotate-90" width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F1F5F9" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - value / 100) }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-black text-slate-900">{value}%</span>
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, bg, delay = 0 }) {
  return (
    <motion.div
      variants={fadeUp}
      className="flex items-center gap-3.5 rounded-2xl bg-white p-4 ring-1 ring-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", bg)}>
        <Icon className={cn("w-5 h-5", color)} />
      </div>
      <div>
        <p className="text-xl font-black text-slate-900 leading-none">{value}</p>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-1">{label}</p>
      </div>
    </motion.div>
  );
}

// ─── Module Card ──────────────────────────────────────────────────────────────
function ModuleCard({ icon: Icon, label, to, iconBg, iconColor, navigate }) {
  return (
    <motion.button
      variants={fadeUp}
      onClick={() => navigate(to)}
      whileTap={{ scale: 0.94 }}
      className="flex flex-col items-center gap-2.5 rounded-2xl bg-white p-4 ring-1 ring-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", iconBg)}>
        <Icon className={cn("w-5 h-5", iconColor)} />
      </div>
      <span className="text-[11px] font-bold text-slate-600">{label}</span>
    </motion.button>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const navigate = useNavigate();
  const session = getAuthSession();
  const { data, actions, dashboardSummary } = useLifeOSData();
  const [newTask, setNewTask] = useState("");
  const [focusOpen, setFocusOpen] = useState(false);

  const day      = getDayCount(session?.createdAt);
  const greeting = getGreeting();
  const status   = getStatus(dashboardSummary.goalsCompletion ?? 0);
  const tasks    = data.dashboard.tasks ?? [];
  const done     = tasks.filter((t) => t.done).length;
  const pct      = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const initials = getInitials(session);

  const addTask = () => {
    if (!newTask.trim()) return;
    actions.addDashboardTask(newTask.trim());
    setNewTask("");
  };

  return (
    <div className="min-h-full bg-slate-50">
      <AnimatePresence>{focusOpen && <FocusTimer onClose={() => setFocusOpen(false)} />}</AnimatePresence>

      {/* ── Header ────────────────────────────────────────────────── */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 lg:px-8"
      >
        <div className="mx-auto max-w-5xl flex h-16 items-center justify-between">
          {/* Left */}
          <div>
            <p className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">
              {greeting}
            </p>
            <p className="text-base font-black text-slate-900 leading-tight mt-0.5">
              {session?.firstName ? `${session.firstName}!` : "Xush kelibsiz!"}
            </p>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            {/* Day counter */}
            <div className="hidden sm:flex items-center gap-1.5 rounded-xl bg-indigo-50 px-3 py-1.5">
              <Timer className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-[11px] font-black text-indigo-600">
                Kun {day} / 90
              </span>
            </div>

            {/* Streak */}
            <div className="flex items-center gap-1 rounded-xl bg-orange-50 px-3 py-1.5">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-[11px] font-black text-orange-600">
                {dashboardSummary.streak ?? 0}
              </span>
            </div>

            {/* Notification bell */}
            <button className="relative w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
              <Bell className="w-4 h-4 text-slate-500" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500" />
            </button>

            {/* Avatar */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm cursor-pointer" onClick={() => navigate("/settings")}>
              <span className="text-xs font-black text-white">{initials}</span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* ── Page body ─────────────────────────────────────────────── */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-5xl px-4 lg:px-8 py-6 flex flex-col gap-5"
      >

        {/* ── Hero card ─────────────────────────────── */}
        <motion.div
          variants={fadeUp}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600 p-6 lg:p-8 text-white shadow-xl shadow-indigo-200"
        >
          {/* decorative circles */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -right-4 -bottom-16 h-56 w-56 rounded-full bg-white/5" />

          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black tracking-widest uppercase", "bg-white/20 text-white")}>
                  <span className={cn("w-1.5 h-1.5 rounded-full", status.dot)} />
                  {status.label}
                </span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-black tracking-tight leading-tight">
                Bugungi vazifalar
              </h2>
              <p className="mt-1.5 text-indigo-200 text-sm font-medium">
                {done} / {tasks.length} bajarildi •{" "}
                <span className="text-white font-bold">Kun {day} / 90</span>
              </p>

              {/* Progress bar */}
              <div className="mt-5 h-2 rounded-full bg-white/20 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-white"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                />
              </div>
              <p className="mt-2 text-xs font-bold text-indigo-200">{pct}% yakunlangan</p>
            </div>

            <ProgressRing value={pct} size={76} stroke={6} color="#fff" />
          </div>
        </motion.div>

        {/* ── Two-column grid (tasks + stats) ────────── */}
        <div className="grid gap-5 lg:grid-cols-[1fr_300px]">

          {/* Today's tasks */}
          <motion.div variants={fadeUp} className="rounded-3xl bg-white ring-1 ring-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-black text-slate-900">Bugungi vazifalar</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  TODAY'S MISSION
                </p>
              </div>
              <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                {done}/{tasks.length}
              </span>
            </div>

            {/* Task list */}
            <div className="flex flex-col gap-1 mb-5 min-h-[80px]">
              <AnimatePresence>
                {tasks.length === 0 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-slate-400 text-center py-6"
                  >
                    Hali vazifa yo'q. Birinchisini qo'shing.
                  </motion.p>
                )}
                {tasks.map((task, i) => (
                  <motion.button
                    key={task.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => actions.toggleDashboardTask(task.id)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-slate-50 transition-colors group"
                  >
                    {task.done ? (
                      <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 shrink-0 group-hover:text-slate-400 transition-colors" />
                    )}
                    <span
                      className={cn(
                        "text-sm font-semibold flex-1 transition-all",
                        task.done ? "line-through text-slate-400" : "text-slate-700",
                      )}
                    >
                      {task.title}
                    </span>
                    {task.done && (
                      <span className="text-[10px] font-bold text-indigo-400 shrink-0">✓</span>
                    )}
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>

            {/* Add task */}
            <div className="flex gap-2 items-center rounded-2xl bg-slate-50 ring-1 ring-slate-100 px-4 py-2">
              <input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTask()}
                placeholder="Yangi vazifa qo'shing..."
                className="flex-1 bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
              />
              <motion.button
                onClick={addTask}
                whileTap={{ scale: 0.88 }}
                className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0 hover:bg-indigo-500 transition-colors"
              >
                <Plus className="w-4 h-4 text-white" />
              </motion.button>
            </div>
          </motion.div>

          {/* Quick stats */}
          <motion.div variants={fadeUp} className="flex flex-col gap-3">
            <StatCard icon={Flame}     label="Streak"    value={`${dashboardSummary.streak ?? 0} kun`}  color="text-orange-500" bg="bg-orange-50" />
            <StatCard icon={Target}    label="Maqsadlar" value={`${dashboardSummary.goalsCount ?? 0}`}   color="text-indigo-500" bg="bg-indigo-50" />
            <StatCard icon={Repeat}    label="Odatlar"   value={`${dashboardSummary.completedHabits ?? 0}/${dashboardSummary.habitsCount ?? 0}`} color="text-violet-500" bg="bg-violet-50" />
            <StatCard icon={BarChart3} label="Fokus"     value={`${(dashboardSummary.focusHours ?? 0).toFixed(1)}h`} color="text-emerald-500" bg="bg-emerald-50" />
          </motion.div>
        </div>

        {/* ── START FOCUS button ─────────────────────── */}
        <motion.button
          variants={fadeUp}
          onClick={() => setFocusOpen(true)}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="relative overflow-hidden w-full flex items-center justify-center gap-3 rounded-3xl bg-slate-900 py-5 text-white font-black text-base tracking-widest uppercase shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-colors"
        >
          {/* shimmer effect */}
          <motion.div
            className="pointer-events-none absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/5 to-transparent"
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
          />
          <Zap className="w-5 h-5 text-indigo-400" />
          START FOCUS
          <span className="text-xs font-bold text-slate-500 ml-1">25 min</span>
        </motion.button>

        {/* ── AI suggestion strip ────────────────────── */}
        <motion.div
          variants={fadeUp}
          onClick={() => navigate("/assistant")}
          className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-violet-50 to-indigo-50 ring-1 ring-indigo-100 px-5 py-4 cursor-pointer hover:ring-indigo-200 transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">AI MURABBIY</p>
            <p className="text-sm font-semibold text-slate-700 mt-0.5 truncate">
              Bugungi rejangizni ko'rib chiqing →
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-indigo-400 shrink-0 group-hover:translate-x-1 transition-transform" />
        </motion.div>

        {/* ── Module shortcuts ───────────────────────── */}
        <motion.div variants={fadeUp}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">MODULLAR</p>
          </div>
          <motion.div variants={stagger} className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            <ModuleCard icon={Repeat}     label="Odatlar"  to="/habits"     iconBg="bg-violet-50"  iconColor="text-violet-600"  navigate={navigate} />
            <ModuleCard icon={BookOpen}   label="Kitoblar" to="/books"      iconBg="bg-amber-50"   iconColor="text-amber-600"   navigate={navigate} />
            <ModuleCard icon={HeartPulse} label="Sog'liq"  to="/health"     iconBg="bg-rose-50"    iconColor="text-rose-500"    navigate={navigate} />
            <ModuleCard icon={Trophy}     label="Mahorat"  to="/mastery"    iconBg="bg-emerald-50" iconColor="text-emerald-600" navigate={navigate} />
            <ModuleCard icon={Users}      label="Network"  to="/networking" iconBg="bg-sky-50"     iconColor="text-sky-600"     navigate={navigate} />
            <ModuleCard icon={Wallet}     label="Moliya"   to="/finance"    iconBg="bg-green-50"   iconColor="text-green-600"   navigate={navigate} />
          </motion.div>
        </motion.div>

      </motion.div>
    </div>
  );
}
