import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target, Flame, Clock, Zap, Plus, Check, ChevronRight,
  Repeat, Brain, TrendingUp,
  Circle, Play, Calendar, Bot,
} from "lucide-react";
import { useLifeOSData } from "@/lib/lifeos-store";
import { getAuthSession } from "@/lib/auth";
import { cn } from "@/lib/utils";

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
      </div>
    </div>
  );
}

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

  /* day score */
  const dayScore = useMemo(() => {
    let s = 0;
    s += Math.round(taskPct * 0.5);              // 50 pts
    s += Math.round(habitPct * 0.3);             // 30 pts
    s += Math.min(20, Math.round(focusMin / 3)); // 20 pts
    return Math.min(100, s);
  }, [taskPct, habitPct, focusMin]);

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


          {/* ── QUICK ACTIONS ── */}
          <Card className="p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 mb-3 px-1">Tezkor harakatlar</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Maqsad qo'shish",  icon: Target,   to: "/goals" },
                { label: "Odat qo'shish",     icon: Repeat,   to: "/habits" },
                { label: "Fokus boshlash",     icon: Zap,      to: "/focus" },
                { label: "AI so'rash",         icon: Bot,      to: "/assistant" },
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
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
