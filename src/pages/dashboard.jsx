import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  Flame,
  Zap,
  Plus,
  Check,
  ChevronRight,
  ArrowRight,
  Repeat,
  Sun,
  Sparkles,
  Circle,
  Play,
  Calendar,
  Edit3,
  Bot,
} from "lucide-react";

import { useLifeOSData } from "@/lib/lifeos-store";
import { getAuthSession } from "@/lib/auth";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────────────────── */
const fade = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 6) return "Tun xayrli";
  if (h < 12) return "Xayrli tong";
  if (h < 18) return "Xayrli kun";
  return "Xayrli kech";
}

function formatDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const stagger = (i = 0, base = 0.05) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: base * i },
});

/* ─────────────────────────────────────────────────────────────────────────────
   UI Primitives
───────────────────────────────────────────────────────────────────────────── */
function Card({ children, className, ...rest }) {
  return (
    <motion.div
      {...fade}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "bg-white rounded-2xl border border-zinc-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
        className
      )}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

function CardHeader({ title, subtitle, icon: Icon, to, action }) {
  return (
    <div className="flex items-center justify-between px-5 pt-5 pb-3">
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center">
            <Icon className="w-4 h-4 text-zinc-500" />
          </div>
        )}
        <div>
          <p className="text-[13px] font-semibold text-zinc-800">{title}</p>
          {subtitle && (
            <p className="text-[11px] text-zinc-400">{subtitle}</p>
          )}
        </div>
      </div>

      {to && (
        <Link
          to={to}
          className="text-[11px] text-zinc-400 font-semibold flex items-center gap-0.5 hover:text-zinc-600"
        >
          Barchasi <ChevronRight className="w-3 h-3" />
        </Link>
      )}

      {action}
    </div>
  );
}

function ProgressBar({ value, color = "#4F46E5", className }) {
  return (
    <div
      className={cn(
        "h-[5px] bg-zinc-100 rounded-full overflow-hidden",
        className
      )}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, value)}%` }}
        transition={{ duration: 1 }}
        className="h-full bg-zinc-900 rounded-full"
      />
    </div>
  );
}

function Checkbox({ checked, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-[18px] h-[18px] rounded-[5px] border flex items-center justify-center transition-all flex-shrink-0 cursor-pointer",
        checked
          ? "bg-[#6366F1] border-[#4F46E5]"
          : "border-slate-200 hover:border-[#6366F1]/60 bg-transparent"
      )}
    >
      {checked && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
        >
          <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
        </motion.div>
      )}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Circular Day Score
   ───────────────────────────────────────────────────────────────────────────── */
function CircularScore({ score, size = 96, strokeWidth = 6 }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "#22C55E" : score >= 50 ? "#6366F1" : "#F59E0B";

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#f4f4f5"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#18181b"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold">{score}</span>
        <span className="text-[10px] text-zinc-400 uppercase">ball</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Dashboard
───────────────────────────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const { data, actions, selectors, dashboardSummary } = useLifeOSData();
  const navigate = useNavigate();
  const session = getAuthSession();

  const [newTask, setNewTask] = useState("");
  const [reflectionWin, setReflectionWin] = useState("");
  const [reflectionBlock, setReflectionBlock] = useState("");
  const [reflectionTomorrow, setReflectionTomorrow] = useState("");

  const today = new Date();
  const dateStr = today.toLocaleDateString("uz-UZ", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const firstName = session?.firstName ?? "Do'stim";

  const tasks = data.dashboard?.tasks || [];
  const habits = data.habits || [];

  const completedTasks = tasks.filter((t) => t.done).length;
  const taskPct = tasks.length
    ? Math.round((completedTasks / tasks.length) * 100)
    : 0;

  const completedHabits = habits.filter((h) => h.completedToday).length;
  const habitPct = habits.length
    ? Math.round((completedHabits / habits.length) * 100)
    : 0;

  const focusMin = useMemo(() => {
    const sessions = data.mastery?.focusSessions || [];
    const d = today.toISOString().slice(0, 10);
    return sessions
      .filter((s) => s.date === d)
      .reduce((a, b) => a + (b.durationMin || 0), 0);
  }, [data.mastery?.focusSessions]);

  const streak = dashboardSummary?.streak ?? 0;

  const hasReflection =
    reflectionWin || reflectionBlock || reflectionTomorrow;

  const dayScore = useMemo(() => {
    let s = 0;
    s += Math.round(taskPct * 0.4);
    s += Math.round(habitPct * 0.3);
    s += Math.min(20, Math.round(focusMin / 3));
    if (hasReflection) s += 10;
    return Math.min(100, s);
  }, [taskPct, habitPct, focusMinToday, healthPct]);

  const handleAddTask = () => {
    if (!newTask.trim()) return;
    actions.addDashboardTask(newTask.trim());
    setNewTask("");
  };

  return (
    <div className="p-4 max-w-[1200px] mx-auto space-y-5">
      {/* HERO */}
      <motion.div
        {...fade}
        className="rounded-2xl bg-zinc-900 text-white p-6"
      >
        <p className="text-zinc-400 text-sm">{dateStr}</p>
        <h1 className="text-2xl font-bold">
          {getGreeting()}, {firstName}
        </h1>
        <p className="text-zinc-400 text-sm mt-2">
          Bugun tizimingizni ishga tushiring.
        </p>
      </motion.div>

      {/* SCORE */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="flex items-center justify-center p-4">
          <CircularScore score={dayScore} />
        </Card>

        <Card className="p-4 space-y-2">
          <p className="text-sm font-medium">Tasklar</p>
          <ProgressBar value={taskPct} />
          <p className="text-xs text-zinc-400">{taskPct}%</p>
        </Card>
      </div>

      {/* TASKS */}
      <Card>
        <CardHeader title="Vazifalar" subtitle="Bugungi ro'yxat" icon={Target} />
        <div className="px-5 space-y-2">
          {tasks.map((t) => (
            <div
              key={t.id}
              onClick={() => actions.toggleDashboardTask(t.id)}
              className="flex items-center gap-2 py-2"
            >
              <Checkbox checked={t.done} />
              <span className={t.done ? "line-through text-zinc-400" : ""}>
                {t.title}
              </span>
            </div>
          ))}
        </div>

        <div className="p-4 flex gap-2">
          <input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="flex-1 border rounded px-3 text-sm"
            placeholder="Yangi vazifa"
          />
          <button
            onClick={handleAddTask}
            className="bg-zinc-900 text-white px-3 rounded"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </Card>
    </div>
  );
}