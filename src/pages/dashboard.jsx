<<<<<<< HEAD
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  Check,
  Plus,
  Target,
  Flame,
  Clock,
  Zap,
  TrendingUp,
  Wallet,
  MessageSquare,
  Send,
  BookOpen,
  Repeat,
  MoreHorizontal,
  ChevronRight,
  Activity,
  Trophy,
  Users,
  Sparkles,
  Circle
=======
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target, Flame, Clock, Zap, Plus, Check, ChevronRight,
  ArrowRight, Repeat, Brain, Sun, TrendingUp, Sparkles,
  Circle, Play, Calendar, Edit3, Bot,
>>>>>>> a982465 (man life os loyihasini hamma modullarini ozgartirdm)
} from "lucide-react";
import { useLifeOSData } from "@/lib/lifeos-store";
import { getAuthSession } from "@/lib/auth";
import { cn } from "@/lib/utils";

<<<<<<< HEAD
// ── Reusable Card ──────────────────────────────────────────────
function Card({ children, className }) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-black/[0.06] shadow-soft",
        className
      )}
=======
/* ─────────────────────────────────────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────────────────────────────────────── */
const fade = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

function getGreeting() {
  const h = new Date().getHours();
  if (h < 6)  return "Tun xayrli";
  if (h < 12) return "Xayrli tong";
  if (h < 18) return "Xayrli kun";
  return "Xayrli kech";
}

/* ─────────────────────────────────────────────────────────────────────────────
   Reusable primitives
   ───────────────────────────────────────────────────────────────────────────── */
function Card({ children, className, ...rest }) {
  return (
    <motion.div
      {...fade}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "bg-white rounded-2xl border border-zinc-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
        className,
      )}
      {...rest}
>>>>>>> a982465 (man life os loyihasini hamma modullarini ozgartirdm)
    >
      {children}
    </motion.div>
  );
}

<<<<<<< HEAD
// ── Section Header ─────────────────────────────────────────────
function CardHeader({ title, subtitle, icon: Icon, iconColor, action }) {
  return (
    <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-50">
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${iconColor}18` }}
          >
            <Icon className="w-3.5 h-3.5" style={{ color: iconColor }} strokeWidth={2} />
          </div>
        )}
        <div>
          <p className="text-[13.5px] font-semibold text-gray-800 leading-tight">{title}</p>
          {subtitle && (
            <p className="text-[11px] text-gray-400 mt-0.5">{subtitle}</p>
          )}
        </div>
=======
function CardHeader({ title, subtitle, icon: Icon, to, action }) {
  return (
    <div className="flex items-center justify-between px-5 pt-5 pb-3">
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center flex-shrink-0">
            <Icon className="w-4 h-4 text-zinc-500" strokeWidth={1.8} />
          </div>
        )}
        <div>
          <p className="text-[13px] font-semibold text-zinc-800 leading-tight">{title}</p>
          {subtitle && <p className="text-[11px] text-zinc-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {to && (
        <Link to={to} className="text-[11px] text-zinc-400 font-semibold hover:text-zinc-600 flex items-center gap-0.5 transition-colors">
          Barchasi <ChevronRight className="w-3 h-3" />
        </Link>
      )}
      {action}
    </div>
  );
}

function ProgressBar({ value, className }) {
  return (
    <div className={cn("h-[5px] bg-zinc-100 rounded-full overflow-hidden", className)}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, value)}%` }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="h-full rounded-full bg-zinc-900"
      />
    </div>
  );
}

function CircularScore({ score, size = 110, strokeWidth = 7 }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f4f4f5" strokeWidth={strokeWidth} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="#18181b"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-zinc-900 tabular-nums">{score}</span>
        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">ball</span>
>>>>>>> a982465 (man life os loyihasini hamma modullarini ozgartirdm)
      </div>
      {action && action}
    </div>
  );
}

<<<<<<< HEAD
// ── Stat Card ──────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, change }) {
  return (
    <Card className="p-5 hover:shadow-medium transition-shadow duration-200 cursor-default group">
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="w-4.5 h-4.5" style={{ color }} strokeWidth={2} />
        </div>
        <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
          {change}
        </span>
      </div>
      <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
      <p className="text-[12px] text-gray-500 font-medium mt-1">{label}</p>
    </Card>
  );
}

// ── Progress Bar ───────────────────────────────────────────────
function ProgressBar({ value, color }) {
  return (
    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────
export default function DashboardPage() {
  const { t } = useTranslation();
  const { data, actions, dashboardSummary } = useLifeOSData();
  const session = getAuthSession();
  const [newGoal, setNewGoal] = useState("");
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([
    { id: 1, user: "Asadbek", avatar: "A", color: "#7C3AED", text: "Maqsadlarga yetish uchun reja eng muhimi!", time: "2m ago" },
    { id: 2, user: "Muhammad", avatar: "M", color: "#3B82F6", text: "LifeOS'dagi moliya markazi juda foydali bo'libdi.", time: "10m ago" },
    { id: 3, user: "Sardor", avatar: "S", color: "#10B981", text: "Odatlar bo'limini kunlik ishlataman, juda qulay!", time: "25m ago" },
  ]);

  const today = new Date().toLocaleDateString("uz-UZ", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    setComments([
      {
        id: Date.now(),
        user: session?.firstName ?? "Siz",
        avatar: session?.firstName?.[0] ?? "S",
        color: "#7C3AED",
        text: newComment,
        time: "Hozir",
      },
      ...comments,
    ]);
    setNewComment("");
  };

  const handleAddGoal = () => {
    if (!newGoal.trim()) return;
    actions.addGoal({
      title: newGoal,
      period: "Kunlik",
      targetValue: 1,
      deadline: new Date(new Date().getFullYear(), 11, 31).toISOString().slice(0, 10),
    });
    setNewGoal("");
  };

  const completedTasks = data.dashboard.tasks.filter((t) => t.done).length;
  const totalTasks = data.dashboard.tasks.length;

  return (
    <div className="space-y-5">

      {/* ── Greeting Banner ───────────────────────────── */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 gradient-animated p-6 text-white shadow-medium">
        <div className="absolute right-0 top-0 w-64 h-full opacity-10">
          <div className="absolute top-2 right-8 w-32 h-32 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-2 right-24 w-20 h-20 rounded-full bg-white blur-2xl" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-5">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-violet-200" strokeWidth={1.5} />
              <p className="text-violet-200 text-[13px] font-medium">{today}</p>
            </div>
            <h1 className="text-xl lg:text-2xl font-bold leading-snug">
              Salom, {session?.firstName ?? "Do'stim"}! 👋
            </h1>
            <p className="text-violet-200/80 text-sm mt-1">
              Bugun {completedTasks}/{totalTasks} vazifa bajarildi. Davom eting!
            </p>
          </div>

          <div className="flex gap-2 w-full lg:w-auto">
            <input
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddGoal()}
              placeholder="Yangi maqsad qo'shing..."
              className="flex-1 lg:w-64 h-10 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-[13px] font-medium px-4 outline-none focus:bg-white/15 focus:border-white/40 transition-all"
            />
            <button
              onClick={handleAddGoal}
              className="h-10 px-4 rounded-lg bg-white text-violet-700 text-[13px] font-bold hover:bg-violet-50 transition-colors flex items-center gap-1.5 flex-shrink-0"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
              Qo'shish
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats Row ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t("dashboard.metrics.productivity")}
          value="88%"
          icon={Zap}
          color="#7C3AED"
          change="+4%"
        />
        <StatCard
          label={t("dashboard.metrics.streaks")}
          value={`${dashboardSummary.streak}🔥`}
          icon={Flame}
          color="#F97316"
          change="+2"
        />
        <StatCard
          label={t("dashboard.metrics.focus")}
          value="6.4h"
          icon={Clock}
          color="#0EA5E9"
          change="+1.2h"
        />
        <StatCard
          label={t("dashboard.metrics.goals")}
          value={dashboardSummary.goalsCount}
          icon={Target}
          color="#10B981"
          change="Active"
        />
      </div>

      {/* ── Main Grid ─────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* Left Column (2 cols) */}
        <div className="lg:col-span-2 space-y-5">

          {/* Tasks Widget */}
          <Card>
            <CardHeader
              title={t("dashboard.tasks.header")}
              subtitle={`${completedTasks}/${totalTasks} ${t("dashboard.tasks.completed")}`}
              icon={Check}
              iconColor="#7C3AED"
              action={
                <Link
                  to="/goals"
                  className="flex items-center gap-1 text-[12px] text-violet-600 font-semibold hover:text-violet-700 transition-colors"
                >
                  Barchasi
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              }
            />

            <div className="px-5 py-3 border-b border-gray-50">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-gray-500 font-medium">Kunlik progress</span>
                <span className="text-[11px] font-bold text-gray-700">
                  {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
                </span>
              </div>
              <ProgressBar
                value={totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}
                color="#7C3AED"
              />
            </div>

            <div className="p-3 space-y-1">
              <AnimatePresence mode="popLayout">
                {data.dashboard.tasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer group transition-colors",
                      task.done ? "hover:bg-gray-50/80" : "hover:bg-gray-50"
                    )}
                    onClick={() => actions.toggleDashboardTask(task.id)}
                  >
                    <div
                      className={cn(
                        "w-4.5 h-4.5 rounded-[5px] border-2 flex items-center justify-center transition-all duration-150 flex-shrink-0",
                        task.done
                          ? "bg-violet-600 border-violet-600"
                          : "border-gray-300 group-hover:border-gray-400"
                      )}
                    >
                      {task.done && (
                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                      )}
                    </div>

                    <span
                      className={cn(
                        "text-[13.5px] font-medium flex-1 transition-colors",
                        task.done ? "line-through text-gray-400" : "text-gray-700"
                      )}
                    >
                      {task.title}
                    </span>

                    {task.done && (
                      <span className="text-[10px] text-gray-400 font-medium">Bajarildi ✓</span>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {data.dashboard.tasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                  <Circle className="w-8 h-8 mb-2 opacity-30" strokeWidth={1} />
                  <p className="text-[13px] font-medium">Hali vazifa yo'q</p>
                </div>
              )}
            </div>
          </Card>

          {/* Modules Quick View */}
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: "Kitoblar", icon: BookOpen, color: "#F59E0B", to: "/books", stat: `${data.books?.length ?? 0} kitob`, sub: "kuzatilmoqda" },
              { label: "Odatlar", icon: Repeat, color: "#10B981", to: "/habits", stat: `${data.habits?.length ?? 0} odat`, sub: "faol" },
              { label: "Mahorat", icon: Trophy, color: "#9333EA", to: "/mastery", stat: "Focus", sub: "yozing" },
            ].map((mod) => (
              <Link to={mod.to} key={mod.to}>
                <Card className="p-4 hover:shadow-medium transition-all duration-200 cursor-pointer group hover:-translate-y-0.5">
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${mod.color}15` }}
                    >
                      <mod.icon className="w-4 h-4" style={{ color: mod.color }} strokeWidth={2} />
                    </div>
                    <ArrowUpRight
                      className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors"
                    />
                  </div>
                  <p className="text-[15px] font-bold text-gray-800">{mod.stat}</p>
                  <p className="text-[11px] text-gray-400 font-medium mt-0.5">{mod.sub}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Right Column (1 col) */}
        <div className="space-y-5">

          {/* Finance Widget */}
          <Card>
            <CardHeader
              title={t("dashboard.finance.header")}
              icon={Wallet}
              iconColor="#14B8A6"
              action={
                <Link to="/finance">
                  <ArrowUpRight className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors" />
                </Link>
              }
            />
            <div className="p-5 space-y-4">
              <div>
                <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider mb-1">
                  {t("dashboard.finance.wealth")}
                </p>
                <div className="flex items-end gap-2">
                  <p className="text-3xl font-bold text-gray-900">92%</p>
                  <span className="text-[11px] text-emerald-600 font-semibold mb-1 bg-emerald-50 px-2 py-0.5 rounded-full">
                    +3%
                  </span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[11px] text-gray-500 font-medium">
                    {t("dashboard.finance.debt")}
                  </span>
                  <span className="text-[11px] font-semibold text-gray-600">$1,200</span>
                </div>
                <ProgressBar value={70} color="#14B8A6" />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                {[
                  { label: "Daromad", value: "$4,200", color: "#10B981" },
                  { label: "Xarajat", value: "$1,800", color: "#F43F5E" },
                ].map((item) => (
                  <div key={item.label} className="bg-gray-50/70 rounded-lg p-3">
                    <p className="text-[11px] text-gray-500 font-medium">{item.label}</p>
                    <p
                      className="text-[15px] font-bold mt-0.5"
                      style={{ color: item.color }}
                    >
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Community Pulse */}
          <Card>
            <CardHeader
              title={t("dashboard.community_pulse.header")}
              subtitle={t("dashboard.community_pulse.subtitle")}
              icon={MessageSquare}
              iconColor="#EC4899"
            />

            <div className="flex flex-col" style={{ height: 320 }}>
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 no-scrollbar">
                <AnimatePresence>
                  {comments.map((comment, i) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex gap-2.5"
                    >
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: comment.color }}
                      >
                        {comment.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[12px] font-semibold text-gray-700">
                            {comment.user}
                          </span>
                          <span className="text-[10px] text-gray-400">{comment.time}</span>
                        </div>
                        <div className="bg-gray-50 rounded-lg px-3 py-2">
                          <p className="text-[12.5px] text-gray-600 leading-relaxed">
                            {comment.text}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="px-4 pb-4 pt-2 border-t border-gray-50">
                <div className="flex gap-2">
                  <input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                    placeholder={t("dashboard.community_pulse.comment_placeholder")}
                    className="flex-1 h-9 rounded-lg bg-gray-50 border border-gray-100 text-[13px] text-gray-700 placeholder:text-gray-400 px-3 outline-none focus:border-violet-300 focus:bg-white transition-all"
                  />
                  <button
                    onClick={handleAddComment}
                    className="w-9 h-9 rounded-lg bg-violet-600 text-white flex items-center justify-center hover:bg-violet-700 transition-colors flex-shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" strokeWidth={2} />
                  </button>
                </div>
              </div>
=======
function Checkbox({ checked, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-[18px] h-[18px] rounded-[5px] border-[1.5px] flex items-center justify-center transition-all flex-shrink-0",
        checked ? "bg-zinc-900 border-zinc-900" : "border-zinc-300 hover:border-zinc-400",
      )}
    >
      {checked && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 25 }}>
          <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
        </motion.div>
      )}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main Dashboard
   ───────────────────────────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const { data, actions, selectors, dashboardSummary } = useLifeOSData();
  const session = getAuthSession();
  const [newTask, setNewTask] = useState("");
  const [reflectionWin, setReflectionWin] = useState("");
  const [reflectionBlock, setReflectionBlock] = useState("");
  const [reflectionTomorrow, setReflectionTomorrow] = useState("");

  const today = new Date();
  const dateStr = today.toLocaleDateString("uz-UZ", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const firstName = session?.firstName ?? "Do'stim";

  /* ── Computed ── */
  const tasks = data.dashboard?.tasks || [];
  const completedTasks = tasks.filter((t) => t.done).length;
  const totalTasks = tasks.length;
  const taskPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const habits = data.habits || [];
  const completedHabits = habits.filter((h) => h.completedToday).length;
  const habitPct = habits.length > 0 ? Math.round((completedHabits / habits.length) * 100) : 0;

  const focusMin = useMemo(() => {
    const sessions = data.mastery?.focusSessions || [];
    const d = today.toISOString().slice(0, 10);
    return sessions.filter((s) => s.date === d).reduce((s, x) => s + (x.durationMin || 0), 0);
  }, [data.mastery?.focusSessions]);

  const goals = selectors.goalsWithMeta || [];
  const activeGoals = goals.filter((g) => g.progress < 100);
  const streak = dashboardSummary?.streak ?? 0;

  const hasReflection = reflectionWin.trim() || reflectionBlock.trim() || reflectionTomorrow.trim();

  /* day score */
  const dayScore = useMemo(() => {
    let s = 0;
    s += Math.round(taskPct * 0.4);          // 40 pts
    s += Math.round(habitPct * 0.3);         // 30 pts
    s += Math.min(20, Math.round(focusMin / 3)); // 20 pts
    if (hasReflection) s += 10;              // 10 pts
    return Math.min(100, s);
  }, [taskPct, habitPct, focusMin, hasReflection]);

  const dayLabel =
    dayScore >= 80 ? "Ajoyib kun!" :
    dayScore >= 50 ? "Yaxshi davom eting" :
    dayScore > 0  ? "Boshlang'ich qadamlar" :
    "Yangi kun — yangi imkoniyat";

  const handleAddTask = () => {
    if (!newTask.trim()) return;
    actions.addDashboardTask(newTask.trim());
    setNewTask("");
  };

  /* ─────────────────────────────────────────────────────────────────────────── */
  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-10 max-w-[1260px] mx-auto space-y-5">

      {/* ═══════════════════════════════════════════════════════════════════════
         1 · HERO — Identity greeting
         ═══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        {...fade}
        className="rounded-2xl bg-zinc-900 p-6 lg:p-8 text-white relative overflow-hidden"
      >
        {/* ambient glow */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-zinc-700/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          {/* left */}
          <div className="space-y-1">
            <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-[0.18em]">{dateStr}</p>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight leading-tight">
              {getGreeting()}, {firstName}
            </h1>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-md">
              Siz <span className="text-white font-semibold">intizomli</span> va <span className="text-white font-semibold">fokusli</span> insonga aylanmoqdasiz.
              <br className="hidden lg:block" />
              Bugun tizimingizni ishga tushiring.
            </p>
          </div>

          {/* right CTAs */}
          <div className="flex gap-2.5">
            <Link
              to="/focus"
              className="h-10 px-5 rounded-xl bg-white text-zinc-900 text-[13px] font-bold flex items-center gap-2 hover:bg-zinc-100 transition-colors"
            >
              <Play className="w-3.5 h-3.5" fill="currentColor" /> Deep Work
            </Link>
            <Link
              to="/planner"
              className="h-10 px-5 rounded-xl bg-zinc-800 text-zinc-300 text-[13px] font-semibold flex items-center gap-2 hover:bg-zinc-700 transition-colors border border-zinc-700"
            >
              <Calendar className="w-3.5 h-3.5" /> Kun rejasi
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════════
         2 · SCORE + STATS row
         ═══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* day score */}
        <Card className="col-span-2 lg:col-span-1 flex flex-col items-center justify-center py-6 px-4">
          <CircularScore score={dayScore} />
          <p className="text-[11px] font-bold text-zinc-500 mt-3">{dayLabel}</p>
        </Card>

        {/* stat cards */}
        {[
          { label: "Vazifalar",   value: `${completedTasks}/${totalTasks}`, sub: `${taskPct}%`,   icon: Target },
          { label: "Odatlar",     value: `${completedHabits}/${habits.length}`, sub: `${habitPct}%`,  icon: Repeat },
          { label: "Fokus",       value: `${focusMin}m`,    sub: "bugun",         icon: Zap },
          { label: "Streak",      value: streak,            sub: "kun",           icon: Flame },
        ].map((s) => (
          <Card key={s.label} className="p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center">
                <s.icon className="w-4 h-4 text-zinc-500" strokeWidth={1.8} />
              </div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{s.sub}</span>
            </div>
            <p className="text-xl font-bold text-zinc-900 tracking-tight">{s.value}</p>
            <p className="text-[11px] text-zinc-400 font-medium mt-0.5">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
         3 · MAIN 2-COL GRID
         ═══════════════════════════════════════════════════════════════════════ */}
      <div className="grid lg:grid-cols-12 gap-5">

        {/* ─── LEFT 8 cols ─── */}
        <div className="lg:col-span-8 space-y-5">

          {/* ── TODAY'S PRIORITIES ── */}
          <Card>
            <CardHeader title="Bugungi vazifalar" subtitle={`${completedTasks}/${totalTasks} bajarildi`} icon={Target} to="/planner" />
            <div className="px-5 pb-1"><ProgressBar value={taskPct} /></div>

            <div className="px-3 pt-2 pb-1">
              <AnimatePresence mode="popLayout">
                {tasks.map((task, i) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -12, transition: { duration: 0.15 } }}
                    transition={{ duration: 0.25, delay: i * 0.03 }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer group hover:bg-zinc-50 transition-colors"
                    onClick={() => actions.toggleDashboardTask(task.id)}
                  >
                    <Checkbox checked={task.done} />
                    <span className={cn(
                      "text-[13px] font-medium flex-1 transition-colors",
                      task.done ? "line-through text-zinc-400" : "text-zinc-700",
                    )}>
                      {task.title}
                    </span>
                    {task.done && (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-zinc-400">
                        ✓
                      </motion.span>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {totalTasks === 0 && (
                <div className="flex flex-col items-center py-10 text-zinc-300">
                  <Circle className="w-10 h-10 mb-2 opacity-30" strokeWidth={1} />
                  <p className="text-sm font-medium">Birinchi vazifangizni qo'shing</p>
                </div>
              )}
            </div>

            <div className="px-4 pb-4 pt-1">
              <div className="flex gap-2">
                <input
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                  placeholder="Yangi vazifa qo'shish..."
                  className="flex-1 h-10 rounded-xl bg-zinc-50 border border-zinc-200 text-[13px] px-4 outline-none focus:border-zinc-400 focus:bg-white transition-all placeholder:text-zinc-400"
                />
                <button
                  onClick={handleAddTask}
                  className="h-10 w-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center hover:bg-zinc-800 transition-colors flex-shrink-0"
                >
                  <Plus className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>
            </div>
          </Card>

          {/* ── HABIT CHECK-IN ── */}
          <Card>
            <CardHeader title="Odatlar" subtitle={`${completedHabits}/${habits.length} bajarildi`} icon={Repeat} to="/habits" />
            <div className="px-5 pb-2"><ProgressBar value={habitPct} /></div>

            <div className="px-3 pb-4 space-y-0.5">
              {habits.slice(0, 6).map((habit, i) => (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-50 cursor-pointer transition-colors group"
                  onClick={() => actions.toggleHabitCheckIn(habit.id)}
                >
                  <Checkbox checked={habit.completedToday} />
                  <span className={cn(
                    "text-[13px] font-medium flex-1",
                    habit.completedToday ? "text-zinc-400 line-through" : "text-zinc-700",
                  )}>
                    {habit.title}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Flame className="w-3 h-3" />
                    <span className="font-semibold tabular-nums">{habit.streak}</span>
                  </div>
                </motion.div>
              ))}

              {habits.length === 0 && (
                <div className="text-center py-8 text-zinc-300">
                  <p className="text-sm font-medium">Odat qo'shing</p>
                  <Link to="/habits" className="text-[12px] text-zinc-500 underline mt-1 inline-block">Odatlar sahifasi →</Link>
                </div>
              )}
            </div>
          </Card>

          {/* ── FOCUS SESSION ── */}
          <Card>
            <CardHeader title="Deep Work" subtitle={`${focusMin} daqiqa bugun`} icon={Zap} to="/focus" />
            <div className="p-5 pt-2">
              <div className="flex flex-col sm:flex-row gap-3">
                {[
                  { label: "Pomodoro", mins: 25, sub: "25 / 5" },
                  { label: "Deep Work", mins: 50, sub: "50 / 10" },
                  { label: "Study", mins: 90, sub: "90 / 15" },
                ].map((s) => (
                  <Link
                    key={s.label}
                    to="/focus"
                    className="flex-1 rounded-xl border border-zinc-200 p-4 hover:border-zinc-400 hover:shadow-sm transition-all group cursor-pointer"
                  >
                    <p className="text-[13px] font-bold text-zinc-800">{s.label}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{s.sub} daqiqa</p>
                    <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500 group-hover:text-zinc-800 transition-colors">
                      <Play className="w-3 h-3" fill="currentColor" /> Boshlash
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* ─── RIGHT 4 cols ─── */}
        <div className="lg:col-span-4 space-y-5">

          {/* ── GOALS SNAPSHOT ── */}
          <Card>
            <CardHeader title="Maqsadlar" icon={Target} to="/goals" />
            <div className="px-5 pb-5 space-y-4">
              {activeGoals.slice(0, 3).map((goal) => (
                <div key={goal.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[13px] font-medium text-zinc-700 truncate flex-1 pr-2">{goal.title}</p>
                    <span className="text-[11px] font-bold text-zinc-500 tabular-nums">{goal.progress}%</span>
                  </div>
                  <ProgressBar value={goal.progress} />
                  {goal.deadline && (
                    <p className="text-[10px] text-zinc-400">
                      Muddat: {new Date(goal.deadline).toLocaleDateString("uz-UZ")}
                    </p>
                  )}
                </div>
              ))}

              {activeGoals.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-zinc-300 font-medium">Maqsad qo'shing</p>
                  <Link to="/goals" className="text-[12px] text-zinc-500 underline mt-1 inline-block">Maqsadlar →</Link>
                </div>
              )}
            </div>
          </Card>

          {/* ── AI COACH INSIGHT ── */}
          <Card className="bg-zinc-50/80">
            <CardHeader title="AI Murabbiy" icon={Bot} to="/assistant" />
            <div className="px-5 pb-5 space-y-3">
              <div className="space-y-2.5">
                {[
                  habitPct > 70
                    ? "Odatlaringiz bugun kuchli — momentum qurilmoqda."
                    : "Odatlaringizga e'tibor qarating — kichik qadamlar muhim.",
                  focusMin > 60
                    ? `${focusMin} daqiqa chuqur ish — natijalar ko'rina boshlaydi.`
                    : "Bugun 1 ta fokus session bajaring — 25 daqiqa kifoya.",
                  streak > 5
                    ? `${streak} kunlik izchillik — identityingiz mustahkamlanmoqda.`
                    : "Har kuni bir qadam — bu tizimning kuchi.",
                ].map((tip, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="flex gap-2.5 items-start"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 mt-[7px] flex-shrink-0" />
                    <p className="text-[12.5px] text-zinc-600 leading-relaxed">{tip}</p>
                  </motion.div>
                ))}
              </div>

              <div className="flex gap-2 pt-1">
                <Link
                  to="/assistant"
                  className="flex-1 text-center py-2.5 rounded-xl bg-zinc-900 text-white text-[12px] font-semibold hover:bg-zinc-800 transition-colors"
                >
                  AI bilan suhbat
                </Link>
              </div>
            </div>
          </Card>

          {/* ── REFLECTION ── */}
          <Card>
            <CardHeader title="Kechki refleksiya" icon={Edit3} to="/reflection" />
            <div className="px-5 pb-5 space-y-3">
              <div className="space-y-2.5">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1 block">
                    <Sun className="w-3 h-3 inline mr-1" />Bugungi yutug'im
                  </label>
                  <input
                    value={reflectionWin}
                    onChange={(e) => setReflectionWin(e.target.value)}
                    placeholder="Eng yaxshi qilgan ishim..."
                    className="w-full h-9 rounded-xl bg-zinc-50 border border-zinc-200 text-[12px] px-3 outline-none focus:border-zinc-400 transition-colors placeholder:text-zinc-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1 block">
                    <Sparkles className="w-3 h-3 inline mr-1" />Nima to'sqinlik qildi
                  </label>
                  <input
                    value={reflectionBlock}
                    onChange={(e) => setReflectionBlock(e.target.value)}
                    placeholder="Eng katta to'siq..."
                    className="w-full h-9 rounded-xl bg-zinc-50 border border-zinc-200 text-[12px] px-3 outline-none focus:border-zinc-400 transition-colors placeholder:text-zinc-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1 block">
                    <ArrowRight className="w-3 h-3 inline mr-1" />Ertaga nima muhim
                  </label>
                  <input
                    value={reflectionTomorrow}
                    onChange={(e) => setReflectionTomorrow(e.target.value)}
                    placeholder="Ertaga eng muhim ish..."
                    className="w-full h-9 rounded-xl bg-zinc-50 border border-zinc-200 text-[12px] px-3 outline-none focus:border-zinc-400 transition-colors placeholder:text-zinc-400"
                  />
                </div>
              </div>

              <Link
                to="/reflection"
                className="block text-center py-2.5 rounded-xl bg-zinc-100 text-zinc-600 text-[12px] font-semibold hover:bg-zinc-200 transition-colors"
              >
                To'liq refleksiya →
              </Link>
            </div>
          </Card>

          {/* ── QUICK ACTIONS ── */}
          <Card className="p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 mb-3 px-1">Tezkor harakatlar</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Maqsad qo'shish",  icon: Target,   to: "/goals" },
                { label: "Odat qo'shish",     icon: Repeat,   to: "/habits" },
                { label: "Fokus boshlash",     icon: Zap,      to: "/focus" },
                { label: "AI so'rash",         icon: Bot,      to: "/assistant" },
                { label: "Refleksiya",         icon: Edit3,    to: "/reflection" },
                { label: "Kun rejasi",         icon: Calendar, to: "/planner" },
              ].map((a) => (
                <Link
                  key={a.label}
                  to={a.to}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-zinc-100 transition-colors group"
                >
                  <a.icon className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-600 transition-colors" strokeWidth={1.8} />
                  <span className="text-[11px] font-medium text-zinc-500 group-hover:text-zinc-700 transition-colors">{a.label}</span>
                </Link>
              ))}
>>>>>>> a982465 (man life os loyihasini hamma modullarini ozgartirdm)
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
