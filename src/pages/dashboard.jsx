import { useState, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, Apple, Bot, Check, CheckCircle2, ChevronRight,
  Clock, Droplets, Flame, MoreHorizontal, Moon, Play,
  Plus, Repeat, Sparkles, Target, TrendingUp, Zap,
} from "lucide-react";
import { useLifeOSData } from "@/lib/lifeos-store";
import { getAuthSession } from "@/lib/auth";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────────────────────────────────────── */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 6)  return "Good night";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
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
   Shared primitives
   ───────────────────────────────────────────────────────────────────────────── */
function Card({ children, className }) {
  return (
    <div className={cn("bg-white rounded-2xl border border-slate-100", className)}>
      {children}
    </div>
  );
}

function SectionHeader({ title, subtitle, icon: Icon, to, action }) {
  return (
    <div className="flex items-center justify-between px-5 pt-5 pb-3">
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
            <Icon className="w-3.5 h-3.5 text-[#4B5563]" strokeWidth={1.8} />
          </div>
        )}
        <div>
          <p className="text-[13px] font-semibold text-[#111827] leading-tight">{title}</p>
          {subtitle && (
            <p className="text-[11px] text-[#4B5563] mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {to && (
        <Link
          to={to}
          className="text-[11px] text-[#4B5563] font-semibold hover:text-[#9CA3AF] flex items-center gap-0.5 transition-colors"
        >
          See all <ChevronRight className="w-3 h-3" />
        </Link>
      )}
      {action}
    </div>
  );
}

function ProgressBar({ value, color = "#4F46E5", className }) {
  return (
    <div className={cn("h-[4px] bg-slate-100 rounded-full overflow-hidden", className)}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
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
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="#F1F5F9" strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[22px] font-bold text-[#111827] tabular-nums leading-none">
          {score}
        </span>
        <span className="text-[9px] font-bold text-[#4B5563] uppercase tracking-widest mt-0.5">
          / 100
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Weekly Bar Chart (SVG-free, pure CSS)
   ───────────────────────────────────────────────────────────────────────────── */
function WeeklyChart({ todayScore }) {
  const todayIdx = new Date().getDay();
  const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const mock = [72, 85, 68, 91, 78, 82, 74];

  const scores = days.map((_, i) => {
    if (i === todayIdx) return todayScore;
    if (i > todayIdx) return 0;
    return mock[i];
  });

  const max = 100;
  const barMaxH = 52;

  return (
    <div className="flex items-end gap-1.5" style={{ height: `${barMaxH + 20}px` }}>
      {days.map((day, i) => {
        const isFuture = i > todayIdx;
        const isToday = i === todayIdx;
        const h = isFuture ? 4 : Math.max(4, (scores[i] / max) * barMaxH);

        return (
          <div key={day} className="flex flex-col items-center gap-1.5 flex-1">
            <div
              className="w-full flex items-end"
              style={{ height: `${barMaxH}px` }}
            >
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${h}px` }}
                transition={{ duration: 0.9, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="w-full rounded-sm"
                style={{
                  backgroundColor: isFuture
                    ? "#F1F5F9"
                    : isToday
                    ? "#6366F1"
                    : "#C7D2FE",
                }}
              />
            </div>
            <span
              className="text-[10px] font-semibold"
              style={{ color: isToday ? "#6366F1" : "#9CA3AF" }}
            >
              {day}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main Dashboard
   ───────────────────────────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const { data, actions, selectors, dashboardSummary } = useLifeOSData();
  const navigate = useNavigate();
  const session = getAuthSession();
  const taskInputRef = useRef(null);

  const [newTask, setNewTask] = useState("");
  const [checkedIn, setCheckedIn] = useState(false);

  /* ── Data ── */
  const firstName = session?.firstName ?? "friend";
  const tasks     = data.dashboard?.tasks ?? [];
  const habits    = data.habits ?? [];
  const health    = data.health ?? {};
  const goals     = selectors.goalsWithMeta ?? [];
  const focusSessions = data.mastery?.focusSessions ?? [];
  const activeGoals   = goals.filter((g) => g.progress < 100);
  const streak        = dashboardSummary?.streak ?? 0;

  /* ── Computed ── */
  const completedTasks = tasks.filter((t) => t.done).length;
  const totalTasks     = tasks.length;
  const taskPct        = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const completedHabits = habits.filter((h) => h.completedToday).length;
  const habitPct        = habits.length > 0 ? Math.round((completedHabits / habits.length) * 100) : 0;

  const todayStr = new Date().toISOString().slice(0, 10);
  const focusMinToday = useMemo(
    () => focusSessions
      .filter((s) => s.date === todayStr)
      .reduce((sum, s) => sum + (s.durationMin || 0), 0),
    [focusSessions, todayStr],
  );

  const healthPct = useMemo(() => {
    let s = 0;
    if ((health.waterMl ?? 0) >= 1500) s += 34;
    else if ((health.waterMl ?? 0) >= 800) s += 18;
    if ((health.sleepHours ?? 0) >= 7) s += 33;
    else if ((health.sleepHours ?? 0) >= 5) s += 18;
    if ((health.calories ?? 0) > 0) s += 33;
    return Math.min(100, s);
  }, [health]);

  const dayScore = useMemo(() => {
    let s = 0;
    s += Math.round(taskPct * 0.4);               // 40 pts
    s += Math.round(habitPct * 0.3);              // 30 pts
    s += Math.min(20, Math.round(focusMinToday / 3)); // 20 pts
    s += Math.round(healthPct * 0.1);             // 10 pts
    return Math.min(100, s);
  }, [taskPct, habitPct, focusMinToday, healthPct]);

  const dayLabel =
    dayScore >= 80 ? "Exceptional day" :
    dayScore >= 60 ? "Strong progress" :
    dayScore >= 40 ? "Keep building" :
    dayScore > 0   ? "Getting started" :
    "New day — own it";

  /* ── Handlers ── */
  const handleAddTask = () => {
    if (!newTask.trim()) return;
    actions.addDashboardTask(newTask.trim());
    setNewTask("");
  };

  const handleCheckIn = () => {
    setCheckedIn(true);
    const nextHabit = habits.find((h) => !h.completedToday);
    if (nextHabit) actions.toggleHabitCheckIn(nextHabit.id);
  };

  /* ══════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="p-4 lg:p-6 pb-20 lg:pb-8 space-y-4">

      {/* ════════════════════════════════════════════════════════════════════
         1 · HERO CARD
         ════════════════════════════════════════════════════════════════════ */}
      <motion.div {...stagger(0)} className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_4px_rgba(0,0,0,0.04)] p-6 lg:p-7 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute -top-28 -right-28 w-72 h-72 bg-[#6366F1]/5 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-12 w-56 h-56 bg-[#6366F1]/3 rounded-full blur-[70px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          {/* Identity block */}
          <div className="space-y-2.5">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9CA3AF]">
              {formatDate()}
            </p>
            <h1 className="text-2xl lg:text-[28px] font-bold text-[#111827] tracking-tight leading-tight">
              {getGreeting()}, {firstName}.
            </h1>
            <p className="text-[#4B5563] text-[14px] leading-relaxed max-w-lg">
              You are becoming{" "}
              <span className="text-[#6366F1] font-medium">disciplined</span> and{" "}
              <span className="text-[#6366F1] font-medium">consistent</span>.
              Today is another opportunity.
            </p>

            {/* Daily mission badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#6366F1]/6 border border-[#6366F1]/12 rounded-xl">
              <Sparkles className="w-3 h-3 text-[#6366F1] flex-shrink-0" strokeWidth={1.8} />
              <span className="text-[12px] font-medium text-[#6366F1]">
                Daily Mission: Build the system. Stay consistent.
              </span>
            </div>
          </div>

          {/* CTA block */}
          <div className="flex flex-col gap-2.5 lg:items-end">
            {/* Primary actions */}
            <div className="flex gap-2.5">
              <Link
                to="/focus"
                className="h-10 px-5 rounded-xl bg-[#6366F1] text-white text-[13px] font-semibold flex items-center gap-2 hover:bg-indigo-600 transition-colors shadow-sm shadow-indigo-100"
              >
                <Play className="w-3.5 h-3.5" fill="currentColor" strokeWidth={0} />
                Start Deep Work
              </Link>
              <button
                onClick={handleCheckIn}
                className={cn(
                  "h-10 px-5 rounded-xl text-[13px] font-semibold flex items-center gap-2 border transition-all",
                  checkedIn
                    ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/25"
                    : "bg-white text-[#4B5563] border-slate-200 hover:border-[#6366F1]/40 hover:text-[#6366F1]"
                )}
              >
                <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
                {checkedIn ? "Checked In ✓" : "Check In Today"}
              </button>
            </div>

            {/* Secondary actions */}
            <div className="flex gap-2">
              <button
                onClick={() => taskInputRef.current?.focus()}
                className="h-8 px-3 rounded-lg bg-slate-50 text-[#4B5563] text-[12px] font-medium flex items-center gap-1.5 hover:text-[#111827] hover:bg-slate-100 transition-colors border border-slate-100"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                Add Task
              </button>
              <Link
                to="/assistant"
                className="h-8 px-3 rounded-lg bg-slate-50 text-[#4B5563] text-[12px] font-medium flex items-center gap-1.5 hover:text-[#111827] hover:bg-slate-100 transition-colors border border-slate-100"
              >
                <Bot className="w-3.5 h-3.5" strokeWidth={1.8} />
                Ask AI
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ════════════════════════════════════════════════════════════════════
         2 · DAY SCORE + STAT STRIP
         ════════════════════════════════════════════════════════════════════ */}
      <motion.div {...stagger(1)} className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Day Score card */}
        <Card className="lg:col-span-4 p-5">
          <div className="flex items-center gap-5">
            <CircularScore score={dayScore} />
            <div className="flex-1 min-w-0 space-y-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#4B5563]">
                  Day Score
                </p>
                <p className="text-[13px] font-semibold text-[#9CA3AF] mt-0.5">{dayLabel}</p>
              </div>

              <div className="space-y-2">
                {[
                  { label: "Priorities", value: taskPct,   color: "#4F46E5" },
                  { label: "Habits",     value: habitPct,  color: "#22C55E" },
                  { label: "Focus",      value: Math.min(100, Math.round(focusMinToday / 1.2)), color: "#F59E0B" },
                  { label: "Health",     value: healthPct, color: "#EC4899" },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] text-[#4B5563] font-medium">{item.label}</span>
                      <span
                        className="text-[10px] font-bold tabular-nums"
                        style={{ color: item.color }}
                      >
                        {item.value}%
                      </span>
                    </div>
                    <ProgressBar value={item.value} color={item.color} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Four stat mini-cards */}
        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: "Priorities",
              value: `${completedTasks}/${totalTasks}`,
              sub: `${taskPct}% done`,
              icon: Target,
              color: "#4F46E5",
            },
            {
              label: "Habits",
              value: `${completedHabits}/${habits.length}`,
              sub: `${habitPct}% today`,
              icon: Repeat,
              color: "#22C55E",
            },
            {
              label: "Focus",
              value: focusMinToday >= 60
                ? `${(focusMinToday / 60).toFixed(1)}h`
                : `${focusMinToday}m`,
              sub: "today",
              icon: Zap,
              color: "#F59E0B",
            },
            {
              label: "Streak",
              value: streak,
              sub: streak === 1 ? "day" : "days",
              icon: Flame,
              color: "#F97316",
            },
          ].map((s, i) => (
            <motion.div key={s.label} {...stagger(i + 2, 0.06)}>
              <Card className="p-4 h-full flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${s.color}15` }}
                  >
                    <s.icon className="w-3.5 h-3.5" style={{ color: s.color }} strokeWidth={2} />
                  </div>
                  <span className="text-[10px] font-bold text-[#4B5563] uppercase tracking-wider">
                    {s.sub}
                  </span>
                </div>
                <p className="text-xl font-bold text-[#111827] tracking-tight tabular-nums">
                  {s.value}
                </p>
                <p className="text-[11px] text-[#4B5563] font-medium mt-0.5">{s.label}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ════════════════════════════════════════════════════════════════════
         MAIN 2-COL GRID
         ════════════════════════════════════════════════════════════════════ */}
      <div className="grid lg:grid-cols-12 gap-4">

        {/* ── LEFT 8 cols ── */}
        <div className="lg:col-span-8 space-y-4">

          {/* 3 · TODAY'S PRIORITIES */}
          <motion.div {...stagger(3)}>
            <Card>
              <SectionHeader
                title="Today's Priorities"
                subtitle={totalTasks > 0 ? `${completedTasks} of ${totalTasks} completed` : "Set your top 3 priorities"}
                icon={Target}
                to="/planner"
              />

              {totalTasks > 0 && (
                <div className="px-5 pb-2">
                  <ProgressBar value={taskPct} color="#4F46E5" />
                </div>
              )}

              <div className="px-3 pt-2 pb-1 min-h-[60px]">
                <AnimatePresence mode="popLayout">
                  {tasks.slice(0, 3).map((task, i) => (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -14, transition: { duration: 0.15 } }}
                      transition={{ duration: 0.25, delay: i * 0.04 }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl group hover:bg-slate-50 transition-colors"
                    >
                      <Checkbox
                        checked={task.done}
                        onClick={() => actions.toggleDashboardTask(task.id)}
                      />

                      <span
                        className={cn(
                          "text-[13px] font-medium flex-1 transition-colors",
                          task.done
                            ? "line-through text-[#4B5563]"
                            : "text-[#111827]"
                        )}
                      >
                        {task.title}
                      </span>

                      {/* Hover actions */}
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] px-2 py-0.5 bg-[#6366F1]/10 text-[#6366F1] rounded-full font-medium border border-[#4F46E5]/15">
                          deep work
                        </span>
                        <span className="text-[10px] text-[#4B5563] font-medium">45m</span>
                        <button className="text-[#4B5563] hover:text-[#9CA3AF] transition-colors p-0.5">
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {task.done && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-[10px] font-semibold text-[#22C55E]"
                        >
                          Done ✓
                        </motion.span>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {tasks.length === 0 && (
                  <div className="flex flex-col items-center py-10 text-[#374151]">
                    <Target className="w-8 h-8 mb-2 opacity-20" strokeWidth={1} />
                    <p className="text-[13px] font-semibold text-[#4B5563]">No priorities yet</p>
                    <p className="text-[11px] text-[#4B5563] mt-0.5">Add up to 3 priorities below</p>
                  </div>
                )}

                {tasks.length > 3 && (
                  <div className="px-3 pt-1 pb-2">
                    <Link
                      to="/planner"
                      className="text-[11px] text-[#4B5563] hover:text-[#9CA3AF] font-medium transition-colors flex items-center gap-1"
                    >
                      +{tasks.length - 3} more <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>

              {/* Add task input */}
              <div className="px-4 pb-4 pt-1">
                <div className="flex gap-2">
                  <input
                    ref={taskInputRef}
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                    placeholder="Add a priority for today..."
                    className="flex-1 h-9 rounded-xl bg-slate-50 border border-slate-100 text-[13px] text-[#111827] px-4 outline-none focus:border-[#6366F1]/40 focus:bg-white transition-all placeholder:text-[#9CA3AF]"
                  />
                  <button
                    onClick={handleAddTask}
                    className="h-9 w-9 rounded-xl bg-[#6366F1] text-white flex items-center justify-center hover:bg-[#4338CA] transition-colors flex-shrink-0"
                  >
                    <Plus className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* 4 · HABITS PREVIEW */}
          <motion.div {...stagger(4)}>
            <Card>
              <SectionHeader
                title="Habits"
                subtitle={`${completedHabits} of ${habits.length} checked in today`}
                icon={Repeat}
                to="/habits"
              />

              {habits.length > 0 && (
                <div className="px-5 pb-2">
                  <ProgressBar value={habitPct} color="#22C55E" />
                </div>
              )}

              <div className="px-3 pb-4 space-y-0.5 min-h-[60px]">
                {habits.slice(0, 5).map((habit, i) => (
                  <motion.div
                    key={habit.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + i * 0.04 }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group"
                    onClick={() => actions.toggleHabitCheckIn(habit.id)}
                  >
                    <Checkbox checked={habit.completedToday} />
                    <span
                      className={cn(
                        "text-[13px] font-medium flex-1 transition-colors select-none",
                        habit.completedToday
                          ? "text-[#4B5563] line-through"
                          : "text-[#111827]"
                      )}
                    >
                      {habit.title}
                    </span>

                    {/* Streak badge */}
                    {habit.streak > 0 && (
                      <div className="flex items-center gap-1 text-[11px]">
                        <Flame className="w-3 h-3 text-[#F97316]" strokeWidth={2} />
                        <span className="font-bold tabular-nums text-[#4B5563]">
                          {habit.streak}
                        </span>
                      </div>
                    )}
                  </motion.div>
                ))}

                {habits.length === 0 && (
                  <div className="text-center py-10">
                    <p className="text-[13px] text-[#4B5563] font-semibold">No habits tracked yet</p>
                    <Link
                      to="/habits"
                      className="text-[12px] text-[#6366F1] mt-1 inline-block hover:text-[#6366F1] transition-colors"
                    >
                      Set up your habits →
                    </Link>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* 5 · FOCUS SESSIONS */}
          <motion.div {...stagger(5)}>
            <Card>
              <SectionHeader
                title="Focus Sessions"
                subtitle={
                  focusMinToday > 0
                    ? `${focusMinToday}min completed today`
                    : "No sessions logged today"
                }
                icon={Zap}
                to="/focus"
              />
              <div className="px-5 pb-5 pt-1">
                <div className="grid sm:grid-cols-3 gap-3">
                  {[
                    { label: "Pomodoro",  mins: 25, desc: "Classic 25/5 rhythm",   sub: "5min break" },
                    { label: "Deep Work", mins: 50, desc: "Extended flow state",    sub: "10min break" },
                    { label: "Study",     mins: 90, desc: "Long-form mastery work", sub: "20min break" },
                  ].map((s) => (
                    <Link
                      key={s.label}
                      to="/focus"
                      className="group rounded-xl border border-slate-100 bg-slate-50 p-4 hover:border-[#6366F1]/25 hover:bg-white hover:shadow-sm transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[13px] font-bold text-[#111827]">{s.label}</p>
                        <span className="text-[11px] font-bold text-[#6366F1] tabular-nums">
                          {s.mins}m
                        </span>
                      </div>
                      <p className="text-[11px] text-[#4B5563] mb-1">{s.desc}</p>
                      <p className="text-[10px] text-[#4B5563] mb-3">{s.sub}</p>
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#4B5563] group-hover:text-[#6366F1] transition-colors">
                        <Play
                          className="w-3 h-3"
                          fill="currentColor"
                          strokeWidth={0}
                        />
                        Start session
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* ── RIGHT 4 cols ── */}
        <div className="lg:col-span-4 space-y-4">

          {/* 6 · AI COACH CARD */}
          <motion.div {...stagger(3)}>
            <Card>
              <SectionHeader title="AI Coach" icon={Bot} to="/assistant" />
              <div className="px-5 pb-5 space-y-4">

                {/* Daily insight */}
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3.5">
                  <div className="flex items-start gap-2.5">
                    <Sparkles
                      className="w-3.5 h-3.5 text-[#6366F1] mt-0.5 flex-shrink-0"
                      strokeWidth={1.8}
                    />
                    <p className="text-[12.5px] text-[#9CA3AF] leading-relaxed">
                      {habitPct >= 70
                        ? `Strong momentum — ${completedHabits} habit${completedHabits !== 1 ? "s" : ""} done. Each day compounds.`
                        : dayScore > 0
                        ? "You've started — that's the hardest part. Keep the chain alive."
                        : "Every system starts with one action. Begin now."}
                    </p>
                  </div>
                </div>

                {/* Suggestions */}
                <div className="space-y-3">
                  {[
                    focusMinToday < 25
                      ? "Start one 25-min Pomodoro — small sessions build the habit."
                      : `${focusMinToday}m of deep work done. One more block compounds the results.`,
                    streak > 5
                      ? `${streak}-day streak. Your identity is shifting — this is who you are now.`
                      : "Consistency beats intensity. Show up every single day.",
                    activeGoals.length > 0
                      ? `${activeGoals.length} active goal${activeGoals.length > 1 ? "s" : ""}. Link each priority to one of them.`
                      : "Define your next goal to give your daily actions direction.",
                  ].map((tip, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.09 }}
                      className="flex gap-2.5 items-start"
                    >
                      <div className="w-1 h-1 rounded-full bg-[#6366F1] mt-[7px] flex-shrink-0" />
                      <p className="text-[12px] text-[#4B5563] leading-relaxed">{tip}</p>
                    </motion.div>
                  ))}
                </div>

                <Link
                  to="/assistant"
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[#4B5563] text-[12px] font-semibold hover:bg-[#6366F1] hover:text-white hover:border-[#6366F1] transition-all"
                >
                  <Bot className="w-3.5 h-3.5" strokeWidth={1.8} />
                  Chat with AI Coach
                </Link>
              </div>
            </Card>
          </motion.div>

          {/* 7 · QUICK STATS */}
          <motion.div {...stagger(4)}>
            <Card>
              <SectionHeader
                title="Health Stats"
                subtitle="Today's vitals"
                icon={Activity}
              />
              <div className="px-5 pb-5 grid grid-cols-2 gap-3">
                {[
                  {
                    label: "Water",
                    value: `${(Math.round((health.waterMl ?? 0) / 100) / 10).toFixed(1)}L`,
                    target: "2.0L goal",
                    icon: Droplets,
                    color: "#0EA5E9",
                    pct: Math.min(100, ((health.waterMl ?? 0) / 2000) * 100),
                    onAdd: () => actions.addWater(250),
                    addLabel: "+250ml",
                  },
                  {
                    label: "Sleep",
                    value: `${health.sleepHours ?? 0}h`,
                    target: "8h goal",
                    icon: Moon,
                    color: "#8B5CF6",
                    pct: Math.min(100, ((health.sleepHours ?? 0) / 8) * 100),
                    onAdd: null,
                    addLabel: null,
                  },
                  {
                    label: "Calories",
                    value: `${health.calories ?? 0}`,
                    target: "kcal logged",
                    icon: Apple,
                    color: "#22C55E",
                    pct: Math.min(100, ((health.calories ?? 0) / 2000) * 100),
                    onAdd: null,
                    addLabel: null,
                  },
                  {
                    label: "Focus",
                    value: focusMinToday >= 60
                      ? `${(focusMinToday / 60).toFixed(1)}h`
                      : `${focusMinToday}m`,
                    target: "120m goal",
                    icon: Clock,
                    color: "#F59E0B",
                    pct: Math.min(100, (focusMinToday / 120) * 100),
                    onAdd: null,
                    addLabel: null,
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="bg-slate-50 rounded-xl p-3 border border-slate-100"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center"
                        style={{ backgroundColor: `${s.color}15` }}
                      >
                        <s.icon
                          className="w-3 h-3"
                          style={{ color: s.color }}
                          strokeWidth={2}
                        />
                      </div>
                      {s.onAdd && (
                        <button
                          onClick={s.onAdd}
                          className="text-[10px] text-[#4B5563] hover:text-[#9CA3AF] font-semibold transition-colors"
                        >
                          {s.addLabel}
                        </button>
                      )}
                    </div>
                    <p className="text-[17px] font-bold text-[#111827] tabular-nums leading-tight">
                      {s.value}
                    </p>
                    <p className="text-[10px] text-[#4B5563] font-medium mb-1.5">{s.target}</p>
                    <ProgressBar value={s.pct} color={s.color} />
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* 8 · WEEKLY CHART */}
          <motion.div {...stagger(5)}>
            <Card>
              <SectionHeader
                title="Week Progress"
                subtitle="Day score trend"
                icon={TrendingUp}
              />
              <div className="px-5 pb-5">
                <WeeklyChart todayScore={dayScore} />
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-sm bg-[#6366F1]" />
                    <span className="text-[10px] text-[#9CA3AF] font-medium">Today</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-sm bg-[#C7D2FE]" />
                    <span className="text-[10px] text-[#9CA3AF] font-medium">Past</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-sm bg-[#F1F5F9]" />
                    <span className="text-[10px] text-[#9CA3AF] font-medium">Upcoming</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
