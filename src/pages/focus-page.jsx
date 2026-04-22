import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLifeOSData } from "@/lib/lifeos-store";
import {
  Play, Pause, Square, Plus, Check, X, Clock, Flame,
  Target, Zap, Brain, BarChart3, MoreHorizontal,
  Edit3, Trash2, Eye, TrendingUp, Award,
  AlertTriangle, Sparkles, AlarmClock, Timer, Coffee,
  ChevronDown, RefreshCw, Lock, Activity,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════
   CONSTANTS & SEED DATA
   ═══════════════════════════════════════════════════════════════════ */

const DURATIONS = [
  { value: 25,  label: "25 min", desc: "Pomodoro"  },
  { value: 50,  label: "50 min", desc: "Deep Work"  },
  { value: 90,  label: "90 min", desc: "Flow State" },
];

const SAMPLE_TASKS = [
  "Ingliz tili darsi",
  "Loyiha arxitekturasi",
  "Kod yozish — auth moduli",
  "Kitob o'qish",
  "Biznes-plan tayyorlash",
  "UI dizayn",
  "Maqola yozish",
  "Tadqiqot",
];

const AI_INSIGHTS = [
  {
    icon: Clock,
    title: "Eng samarali vaqt",
    body: "Ma'lumotlarga ko'ra, siz ertalab 9–11 orasida eng yuqori diqqat ko'rsatasiz. Eng muhim ishlarni shu vaqtga rejalashtiring.",
  },
  {
    icon: TrendingUp,
    title: "Haftalik o'sish",
    body: "Bu hafta o'tgan haftaga qaraganda 40 daqiqa ko'proq chuqur ish vaqti qayd etildi. Shu sur'atni saqlang.",
  },
  {
    icon: AlertTriangle,
    title: "Uzilishlar",
    body: "Har sessiyada o'rtacha 2.3 ta uzilish qayd qilingan. Telefon bildirishnomalarini o'chirib qo'ying.",
  },
  {
    icon: Award,
    title: "Eng uzun sessiya",
    body: "Bugungi eng uzun sessiyangiz 90 daqiqa. Bu chuqur ish uchun ideal muddat — davom eting!",
  },
];

const AI_SUGGESTIONS = [
  "Har sessiyadan oldin 2 daqiqa meditatsiya qiling — diqqatni keskin oshiradi.",
  "90 daqiqadan keyin 20 daqiqa dam oling — bu miya ritmi bilan mos keladi.",
  "Eng muhim vazifani ertalab birinchi sessiyaga qo'ying.",
  "Har kuni bir xil vaqtda fokus sessiyasini boshlash odatini shakllantiring.",
];

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function generateSeedSessions() {
  const result = [];
  const today = new Date();
  const tasks = [...SAMPLE_TASKS];

  // Past 7 days
  for (let daysAgo = 6; daysAgo >= 0; daysAgo--) {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    const dateStr = d.toISOString().slice(0, 10);
    const count = daysAgo === 0 ? 2 : (daysAgo % 3 === 0 ? 1 : daysAgo % 2 === 0 ? 3 : 2);

    for (let j = 0; j < count; j++) {
      const dur = DURATIONS[j % DURATIONS.length].value;
      const startHour = 8 + Math.floor(j * 2.5 + daysAgo % 3);
      result.push({
        id: `seed-${dateStr}-${j}`,
        task: tasks[(daysAgo * 3 + j) % tasks.length],
        goal: "Bugungi muhim qadamni bajaring",
        duration: dur,
        date: dateStr,
        startHour: startHour % 22,
        focusRating: 3 + (j % 3),
        goalCompleted: j % 3 !== 2,
        distractions: j % 2 === 0 ? [{ id: 1, text: "Telefon" }] : [],
        notes: j === 0 ? "Juda samarali bo'ldi." : "",
      });
    }
  }
  return result;
}

const SEED_SESSIONS = generateSeedSessions();

/* ═══════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════ */

function fmt(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function clockNow() {
  return new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
}

/* ═══════════════════════════════════════════════════════════════════
   FULL-SCREEN FOCUS MODE
   ═══════════════════════════════════════════════════════════════════ */

function FocusMode({
  session,        // { task, goal, duration }
  timeLeft,
  totalTime,
  isRunning,
  isPaused,
  distractions,
  onPause,
  onResume,
  onExtend,
  onFinish,
  onAbort,
  onAddDistraction,
}) {
  const [distInput, setDistInput] = useState("");
  const [showControls, setShowControls] = useState(true);
  const [clock, setClock] = useState(clockNow());
  const pct = totalTime > 0 ? (timeLeft / totalTime) * 100 : 0;

  useEffect(() => {
    const t = setInterval(() => setClock(clockNow()), 10000);
    return () => clearInterval(t);
  }, []);

  // Auto-hide controls after 4 seconds of running
  useEffect(() => {
    if (!isRunning || isPaused) { setShowControls(true); return; }
    const t = setTimeout(() => setShowControls(false), 4000);
    return () => clearTimeout(t);
  }, [isRunning, isPaused]);

  const handleAddDist = () => {
    const t = distInput.trim();
    if (!t) return;
    onAddDistraction(t);
    setDistInput("");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 bg-white flex flex-col"
      onClick={() => setShowControls(v => !v)}
    >
      {/* Top bar */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center justify-between px-6 pt-5 pb-2"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-zinc-900 animate-pulse" />
              <span className="text-xs font-bold text-zinc-400 tracking-widest uppercase">
                {isPaused ? "Pauzada" : "Deep Work"}
              </span>
            </div>
            <span className="text-xs text-zinc-400 font-medium">{clock}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
        {/* Progress bar — thin, at top */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-zinc-100">
          <motion.div
            className="h-full bg-zinc-900"
            initial={{ width: "100%" }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5, ease: "linear" }}
          />
        </div>

        {/* Breathing bg when running */}
        {isRunning && !isPaused && (
          <motion.div
            className="absolute inset-0 bg-zinc-50 rounded-full scale-150"
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        {/* Timer */}
        <div className="relative z-10 text-center">
          <motion.div
            key={Math.floor(timeLeft / 60)}
            initial={{ opacity: 0.7, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "text-[96px] sm:text-[128px] font-black tracking-tighter tabular-nums leading-none",
              isPaused ? "text-zinc-400" : "text-zinc-900"
            )}
          >
            {fmt(timeLeft)}
          </motion.div>
        </div>

        {/* Task + goal */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="text-center space-y-1 z-10"
            >
              <p className="text-base font-semibold text-zinc-700">{session.task}</p>
              {session.goal && (
                <p className="text-sm text-zinc-400 flex items-center justify-center gap-1.5">
                  <Target className="w-3.5 h-3.5" />
                  {session.goal}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="px-6 pb-8 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            {/* Main controls */}
            <div className="flex items-center justify-center gap-3">
              {isPaused ? (
                <button
                  onClick={onResume}
                  className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-2xl font-semibold text-sm hover:bg-zinc-700 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  Davom etish
                </button>
              ) : (
                <button
                  onClick={onPause}
                  className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-2xl font-semibold text-sm hover:bg-zinc-700 transition-colors"
                >
                  <Pause className="w-4 h-4" />
                  Pauza
                </button>
              )}
              <button
                onClick={() => onExtend(10)}
                className="px-4 py-3 border border-zinc-200 text-zinc-700 rounded-2xl font-semibold text-sm hover:border-zinc-400 transition-colors"
              >
                +10m
              </button>
              <button
                onClick={() => onExtend(25)}
                className="px-4 py-3 border border-zinc-200 text-zinc-700 rounded-2xl font-semibold text-sm hover:border-zinc-400 transition-colors"
              >
                +25m
              </button>
            </div>

            {/* Finish / Stop row */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={onFinish}
                className="flex items-center gap-2 px-5 py-2.5 border border-zinc-200 text-zinc-700 rounded-xl text-sm font-medium hover:border-zinc-400 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                Yakunlash
              </button>
              <button
                onClick={onAbort}
                className="flex items-center gap-2 px-5 py-2.5 border border-zinc-200 text-zinc-500 rounded-xl text-sm hover:border-red-200 hover:text-red-500 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Bekor qilish
              </button>
            </div>

            {/* Distraction log */}
            <div className="max-w-sm mx-auto">
              <p className="text-[11px] text-zinc-400 text-center mb-2 uppercase tracking-wider">
                Uzilish qayd qilish ({distractions.length})
              </p>
              <div className="flex items-center gap-2">
                <input
                  value={distInput}
                  onChange={e => setDistInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleAddDist()}
                  placeholder="Nima uzilish berdi?"
                  className="flex-1 text-sm bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 outline-none focus:border-zinc-400 placeholder:text-zinc-300"
                />
                <button
                  onClick={handleAddDist}
                  disabled={!distInput.trim()}
                  className="w-9 h-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center hover:bg-zinc-700 disabled:opacity-30 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {distractions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {distractions.map(d => (
                    <span key={d.id} className="text-[11px] bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full">
                      {d.text}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   POST-SESSION REFLECTION MODAL
   ═══════════════════════════════════════════════════════════════════ */

function ReflectionModal({ session, onSave, onSkip }) {
  const [goalCompleted, setGoalCompleted] = useState(null);
  const [rating,        setRating]        = useState(null);
  const [notes,         setNotes]         = useState("");

  const canSave = goalCompleted !== null && rating !== null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4"
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="bg-white rounded-2xl w-full max-w-md p-6 space-y-5"
      >
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-base font-black text-zinc-900">Sessiya yakunlandi</h2>
          </div>
          <p className="text-xs text-zinc-400 ml-10">
            {session.task} · {session.duration} daqiqa
          </p>
        </div>

        {/* Goal completed */}
        <div>
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Maqsadga erishdingizmi?
          </p>
          {session.goal && (
            <p className="text-sm text-zinc-600 italic mb-3">"{session.goal}"</p>
          )}
          <div className="flex gap-2">
            {[{ val: true, label: "✓  Ha, bajardim" }, { val: false, label: "✗  Bajarilmadi" }].map(({ val, label }) => (
              <button
                key={String(val)}
                onClick={() => setGoalCompleted(val)}
                className={cn(
                  "flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-all",
                  goalCompleted === val
                    ? val ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-400 bg-zinc-100 text-zinc-700"
                    : "border-zinc-200 text-zinc-500 hover:border-zinc-400"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Focus rating */}
        <div>
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Diqqat darajasi qanday edi?
          </p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => setRating(n)}
                className={cn(
                  "flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all",
                  rating === n ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 text-zinc-400 hover:border-zinc-400"
                )}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-zinc-300 mt-1 px-0.5">
            <span>Past</span><span>Juda yuqori</span>
          </div>
        </div>

        {/* Notes */}
        <div>
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Izohlar (ixtiyoriy)
          </p>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Bu sessiya haqida fikrlar..."
            rows={2}
            className="w-full text-sm bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 outline-none focus:border-zinc-400 resize-none placeholder:text-zinc-300"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={onSkip} className="flex-1 py-3 border border-zinc-200 text-zinc-500 rounded-xl text-sm hover:border-zinc-400 transition-colors">
            O'tkazib yuborish
          </button>
          <button
            disabled={!canSave}
            onClick={() => onSave({ goalCompleted, rating, notes })}
            className="flex-1 py-3 bg-zinc-900 text-white rounded-xl text-sm font-semibold hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Saqlash
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   STAT CARD
   ═══════════════════════════════════════════════════════════════════ */

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-zinc-200 rounded-2xl p-4"
    >
      <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center mb-3">
        <Icon className="w-3.5 h-3.5 text-zinc-600" strokeWidth={2.2} />
      </div>
      <p className="text-2xl font-black text-zinc-900 leading-none">{value}</p>
      <p className="text-xs font-medium text-zinc-500 mt-1">{label}</p>
      {sub && <p className="text-[11px] text-zinc-400 mt-0.5">{sub}</p>}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ANALYTICS — WEEKLY BAR CHART
   ═══════════════════════════════════════════════════════════════════ */

function WeeklyChart({ sessions }) {
  const days = useMemo(() => {
    const result = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });
      const mins = sessions.filter(s => s.date === dateStr).reduce((s, e) => s + e.duration, 0);
      result.push({ label: dayLabel, mins, dateStr, isToday: i === 0 });
    }
    return result;
  }, [sessions]);

  const maxMins = Math.max(...days.map(d => d.mins), 1);

  return (
    <div>
      <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-3">
        Haftalik fokus vaqti (daqiqa)
      </p>
      <div className="flex items-end gap-1.5 h-24">
        {days.map(day => (
          <div key={day.dateStr} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex flex-col justify-end h-20">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(day.mins / maxMins) * 100}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={cn(
                  "w-full rounded-t-md",
                  day.isToday ? "bg-zinc-900" : "bg-zinc-200"
                )}
              />
            </div>
            <span className={cn("text-[10px] font-medium", day.isToday ? "text-zinc-900" : "text-zinc-400")}>
              {day.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ANALYTICS — BEST HOURS
   ═══════════════════════════════════════════════════════════════════ */

function BestHours({ sessions }) {
  const hourBuckets = useMemo(() => {
    const buckets = Array.from({ length: 6 }, (_, i) => ({
      label: `${(i * 4).toString().padStart(2, "0")}–${((i + 1) * 4).toString().padStart(2, "0")}`,
      mins: 0,
    }));
    sessions.forEach(s => {
      const bucket = Math.floor(s.startHour / 4);
      if (bucket < 6) buckets[bucket].mins += s.duration;
    });
    return buckets;
  }, [sessions]);

  const maxMins = Math.max(...hourBuckets.map(b => b.mins), 1);

  return (
    <div>
      <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-3">
        Eng samarali soatlar
      </p>
      <div className="space-y-2">
        {hourBuckets.map(b => (
          <div key={b.label} className="flex items-center gap-3">
            <span className="text-[11px] text-zinc-400 w-12 flex-shrink-0">{b.label}</span>
            <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-zinc-900 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(b.mins / maxMins) * 100}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
            <span className="text-[11px] font-semibold text-zinc-500 w-12 text-right">{b.mins}m</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PLAN SESSION CARD
   ═══════════════════════════════════════════════════════════════════ */

function PlanCard({ plan, onStart, onDelete }) {
  const dur = DURATIONS.find(d => d.value === plan.duration) ?? DURATIONS[1];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      className="flex items-center gap-3 bg-white border border-zinc-200 rounded-xl px-4 py-3 group"
    >
      <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center flex-shrink-0">
        <Brain className="w-3.5 h-3.5 text-zinc-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-zinc-900 truncate">{plan.task}</p>
        {plan.goal && <p className="text-[11px] text-zinc-400 truncate">{plan.goal}</p>}
      </div>
      <span className="text-[11px] font-medium text-zinc-500 flex-shrink-0">{dur.label}</span>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onStart(plan)}
          className="w-7 h-7 rounded-lg bg-zinc-900 text-white flex items-center justify-center hover:bg-zinc-700 transition-colors"
        >
          <Play className="w-3 h-3" />
        </button>
        <button
          onClick={() => onDelete(plan.id)}
          className="w-7 h-7 rounded-lg border border-zinc-200 text-zinc-400 flex items-center justify-center hover:border-red-200 hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   COMPLETED SESSION ROW
   ═══════════════════════════════════════════════════════════════════ */

function SessionRow({ session }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-zinc-50 transition-colors"
      >
        <div className={cn(
          "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0",
          session.goalCompleted ? "bg-zinc-900" : "bg-zinc-200"
        )}>
          {session.goalCompleted
            ? <Check className="w-3.5 h-3.5 text-white" />
            : <X className="w-3.5 h-3.5 text-zinc-500" />
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-900 truncate">{session.task}</p>
          <p className="text-[11px] text-zinc-400">
            {session.duration}m
            {session.focusRating && ` · Diqqat: ${session.focusRating}/5`}
            {session.distractions?.length > 0 && ` · ${session.distractions.length} uzilish`}
          </p>
        </div>
        <ChevronDown className={cn("w-4 h-4 text-zinc-400 transition-transform", expanded && "rotate-180")} />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-zinc-100"
          >
            <div className="px-4 py-3 space-y-2">
              {session.goal && (
                <p className="text-xs text-zinc-500">
                  <span className="font-semibold">Maqsad:</span> {session.goal}
                </p>
              )}
              {session.notes && (
                <p className="text-xs text-zinc-500">
                  <span className="font-semibold">Izoh:</span> {session.notes}
                </p>
              )}
              {session.distractions?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {session.distractions.map((d, i) => (
                    <span key={i} className="text-[11px] bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full">
                      {d.text ?? d}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */

export default function FocusPage() {
  const { data, actions: storeActions } = useLifeOSData();

  /* — Completed sessions — */
  const [sessions, setSessions] = useState(SEED_SESSIONS);

  /* — Planned sessions — */
  const [plans, setPlans] = useState([
    { id: "p1", task: "Ingliz tili — Speaking practice", goal: "30 ta yangi so'z", duration: 50 },
    { id: "p2", task: "Loyiha kodi — API modul",         goal: "CRUD endpointlarni tugatish", duration: 90 },
  ]);

  /* — Active session state — */
  const [activeSession, setActiveSession] = useState(null); // { task, goal, duration, distractions }
  const [timeLeft,      setTimeLeft]      = useState(0);
  const [totalTime,     setTotalTime]     = useState(0);
  const [isRunning,     setIsRunning]     = useState(false);
  const [isPaused,      setIsPaused]      = useState(false);
  const [isFocusMode,   setIsFocusMode]   = useState(false);
  const [distractions,  setDistractions]  = useState([]);

  /* — Reflection — */
  const [showReflection, setShowReflection] = useState(false);
  const [finishedSession, setFinishedSession] = useState(null);

  /* — Session setup form — */
  const [setupTask,     setSetupTask]     = useState("");
  const [setupGoal,     setSetupGoal]     = useState("");
  const [setupDuration, setSetupDuration] = useState(50);

  /* — Tab — */
  const [tab, setTab] = useState("today"); // today | analytics | ai

  /* — Timer interval — */
  const intervalRef = useRef(null);

  /* — Timer logic — */
  const stopTimer = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, []);

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) { stopTimer(); return 0; }
          return prev - 1;
        });
      }, 1000);
    } else {
      stopTimer();
    }
    return stopTimer;
  }, [isRunning, isPaused, stopTimer]);

  // Watch for timer hitting zero
  useEffect(() => {
    if (timeLeft === 0 && isRunning && activeSession) {
      handleFinish();
    }
  }, [timeLeft]); // eslint-disable-line react-hooks/exhaustive-deps

  /* — Start session — */
  const startSession = useCallback((session) => {
    const secs = session.duration * 60;
    setActiveSession(session);
    setTimeLeft(secs);
    setTotalTime(secs);
    setDistractions([]);
    setIsRunning(true);
    setIsPaused(false);
    setIsFocusMode(true);
  }, []);

  /* — Pause / Resume — */
  const handlePause  = () => { setIsPaused(true);  setIsRunning(false); };
  const handleResume = () => { setIsPaused(false); setIsRunning(true);  };

  /* — Extend — */
  const handleExtend = (mins) => {
    setTimeLeft(prev => prev + mins * 60);
    setTotalTime(prev => prev + mins * 60);
  };

  /* — Finish session (natural end or manual) — */
  const handleFinish = useCallback(() => {
    stopTimer();
    setIsRunning(false);
    setIsFocusMode(false);
    setIsPaused(false);
    if (activeSession) {
      setFinishedSession({ ...activeSession, distractions: [...distractions] });
      setShowReflection(true);
    }
  }, [activeSession, distractions, stopTimer]);

  /* — Abort session — */
  const handleAbort = () => {
    stopTimer();
    setIsRunning(false);
    setIsPaused(false);
    setIsFocusMode(false);
    setActiveSession(null);
  };

  /* — Save reflection — */
  const handleSaveReflection = useCallback((reflection) => {
    const completed = {
      id: Date.now(),
      task: finishedSession.task,
      goal: finishedSession.goal,
      duration: finishedSession.duration,
      date: getTodayKey(),
      startHour: new Date().getHours(),
      distractions: finishedSession.distractions,
      ...reflection,
    };
    setSessions(prev => [completed, ...prev]);

    // Backend ga saqlash
    const skills = data.mastery?.skills || [];
    const skill = skills[0];
    if (skill) {
      storeActions.addFocusSession({ skillId: skill.id, minutes: finishedSession.duration });
    } else {
      // Skill yo'q bo'lsa "Deep Work" skill yaratib, keyin sessiya qo'shamiz
      storeActions.addSkill("Deep Work");
    }

    setShowReflection(false);
    setFinishedSession(null);
    setActiveSession(null);
    if (finishedSession.planId) {
      setPlans(prev => prev.filter(p => p.id !== finishedSession.planId));
    }
  }, [finishedSession, data.mastery, storeActions]);

  const handleSkipReflection = useCallback(() => {
    const completed = {
      id: Date.now(),
      task: finishedSession.task,
      goal: finishedSession.goal,
      duration: finishedSession.duration,
      date: getTodayKey(),
      startHour: new Date().getHours(),
      distractions: finishedSession.distractions,
      goalCompleted: null,
      focusRating: null,
      notes: "",
    };
    setSessions(prev => [completed, ...prev]);
    setShowReflection(false);
    setFinishedSession(null);
    setActiveSession(null);
  }, [finishedSession]);

  /* — Plan actions — */
  const startFromPlan = useCallback((plan) => {
    startSession({ ...plan, planId: plan.id });
  }, [startSession]);

  const deletePlan = useCallback((id) => {
    setPlans(prev => prev.filter(p => p.id !== id));
  }, []);

  const addPlan = () => {
    if (!setupTask.trim()) return;
    setPlans(prev => [...prev, {
      id: `p-${Date.now()}`,
      task: setupTask.trim(),
      goal: setupGoal.trim(),
      duration: setupDuration,
    }]);
    setSetupTask("");
    setSetupGoal("");
  };

  /* — Stats — */
  const todaySessions = useMemo(() => sessions.filter(s => s.date === getTodayKey()), [sessions]);
  const todayMins     = useMemo(() => todaySessions.reduce((s, e) => s + e.duration, 0), [todaySessions]);

  const streak = useMemo(() => {
    const dates = [...new Set(sessions.map(s => s.date))].sort().reverse();
    const today = getTodayKey();
    let count = 0;
    let d = new Date(today);
    for (const dateStr of dates) {
      if (dateStr === d.toISOString().slice(0, 10)) { count++; d.setDate(d.getDate() - 1); }
      else break;
    }
    return count;
  }, [sessions]);

  const deepWorkScore = useMemo(() => {
    const last7 = sessions.filter(s => {
      const d = new Date(); d.setDate(d.getDate() - 7);
      return new Date(s.date) >= d;
    });
    const totalMins = last7.reduce((s, e) => s + e.duration, 0);
    const avgRating = last7.filter(s => s.focusRating).reduce((s, e, _, a) => s + e.focusRating / a.length, 0);
    return Math.min(100, Math.round((totalMins / 5) * (avgRating / 5 || 0.7)));
  }, [sessions]);

  return (
    <>
      {/* ── FOCUS MODE OVERLAY ── */}
      <AnimatePresence>
        {isFocusMode && activeSession && (
          <FocusMode
            session={activeSession}
            timeLeft={timeLeft}
            totalTime={totalTime}
            isRunning={isRunning}
            isPaused={isPaused}
            distractions={distractions}
            onPause={handlePause}
            onResume={handleResume}
            onExtend={handleExtend}
            onFinish={handleFinish}
            onAbort={handleAbort}
            onAddDistraction={(text) => setDistractions(prev => [...prev, { id: Date.now(), text }])}
          />
        )}
      </AnimatePresence>

      {/* ── REFLECTION MODAL ── */}
      <AnimatePresence>
        {showReflection && finishedSession && (
          <ReflectionModal
            session={finishedSession}
            onSave={handleSaveReflection}
            onSkip={handleSkipReflection}
          />
        )}
      </AnimatePresence>

      {/* ── NORMAL VIEW ── */}
      <div className="min-h-screen bg-zinc-50">
        <div className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-5">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest">SYSTEM</p>
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight mt-0.5">Deep Work</h1>
            <p className="text-xs text-zinc-400 mt-0.5">Har bir sessiya — identitingizga ovoz berish</p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard icon={Clock}     label="Bugungi vaqt"  value={`${todayMins}m`} />
            <StatCard icon={Zap}       label="Sessiyalar"    value={todaySessions.length} sub="bugun" />
            <StatCard icon={Flame}     label="Streak"        value={`${streak}k`} sub="ketma-ket kun" />
            <StatCard icon={Brain}     label="DW Score"      value={deepWorkScore} sub="oxirgi 7 kun" />
          </div>

          {/* Session setup */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center">
                <Play className="w-3.5 h-3.5 text-zinc-600" strokeWidth={2.5} />
              </div>
              <span className="text-sm font-semibold text-zinc-900">Yangi sessiya</span>
            </div>

            <div className="space-y-2.5">
              <input
                value={setupTask}
                onChange={e => setSetupTask(e.target.value)}
                placeholder="Nima ustida ishlaysiz?"
                className="w-full text-sm bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:border-zinc-500 transition-colors placeholder:text-zinc-300 font-medium"
              />
              <input
                value={setupGoal}
                onChange={e => setSetupGoal(e.target.value)}
                placeholder="Bu sessiyaning maqsadi nima?"
                className="w-full text-sm bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 outline-none focus:border-zinc-400 transition-colors placeholder:text-zinc-300"
              />
            </div>

            {/* Duration */}
            <div className="flex gap-2">
              {DURATIONS.map(d => (
                <button
                  key={d.value}
                  onClick={() => setSetupDuration(d.value)}
                  className={cn(
                    "flex-1 py-3 rounded-xl border-2 text-center transition-all",
                    setupDuration === d.value
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 text-zinc-600 hover:border-zinc-400"
                  )}
                >
                  <p className="text-sm font-bold">{d.label}</p>
                  <p className={cn("text-[10px] mt-0.5", setupDuration === d.value ? "text-zinc-400" : "text-zinc-400")}>{d.desc}</p>
                </button>
              ))}
            </div>

            {/* Start buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setupTask.trim() && startSession({ task: setupTask.trim(), goal: setupGoal.trim(), duration: setupDuration })}
                disabled={!setupTask.trim()}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-zinc-900 text-white rounded-xl font-semibold text-sm hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Play className="w-4 h-4" />
                Sessiyani boshlash
              </button>
              <button
                onClick={addPlan}
                disabled={!setupTask.trim()}
                className="px-4 py-3.5 border border-zinc-200 text-zinc-600 rounded-xl text-sm hover:border-zinc-400 disabled:opacity-40 transition-colors"
                title="Rejaga qo'shish"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* Focus plan */}
          {plans.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider px-1">
                Bugungi reja · {plans.length} ta sessiya
              </p>
              <AnimatePresence mode="popLayout">
                {plans.map(plan => (
                  <PlanCard key={plan.id} plan={plan} onStart={startFromPlan} onDelete={deletePlan} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Tabs */}
          <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
            <div className="flex border-b border-zinc-100">
              {[
                { key: "today",     label: "Bugun" },
                { key: "analytics", label: "Tahlil" },
                { key: "ai",        label: "AI Coach" },
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={cn(
                    "flex-1 py-3 text-sm font-semibold transition-colors",
                    tab === t.key ? "text-zinc-900 border-b-2 border-zinc-900 -mb-px" : "text-zinc-400 hover:text-zinc-700"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="p-5">
              {/* Today's sessions */}
              {tab === "today" && (
                <div className="space-y-2">
                  {todaySessions.length === 0 ? (
                    <div className="text-center py-8">
                      <Timer className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                      <p className="text-sm text-zinc-400">Hali sessiya yo'q. Birinchi sessiyani boshlang!</p>
                    </div>
                  ) : (
                    todaySessions.map(session => (
                      <SessionRow key={session.id} session={session} />
                    ))
                  )}
                </div>
              )}

              {/* Analytics */}
              {tab === "analytics" && (
                <div className="space-y-6">
                  <WeeklyChart sessions={sessions} />
                  <div className="border-t border-zinc-100 pt-5">
                    <BestHours sessions={sessions} />
                  </div>
                  <div className="border-t border-zinc-100 pt-5">
                    <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                      Sessiya sifati
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "O'rta muddati", value: `${Math.round(sessions.reduce((s, e) => s + e.duration, 0) / Math.max(sessions.length, 1))}m` },
                        { label: "Maqsad %",       value: `${Math.round(sessions.filter(s => s.goalCompleted).length / Math.max(sessions.length, 1) * 100)}%` },
                        { label: "O'rt. diqqat",   value: `${(sessions.filter(s => s.focusRating).reduce((s, e, _, a) => s + e.focusRating / a.length, 0)).toFixed(1)}/5` },
                      ].map(item => (
                        <div key={item.label} className="bg-zinc-50 rounded-xl p-3 text-center">
                          <p className="text-lg font-black text-zinc-900">{item.value}</p>
                          <p className="text-[10px] text-zinc-400 mt-0.5">{item.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* AI Coach */}
              {tab === "ai" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-zinc-500" />
                    <p className="text-sm font-semibold text-zinc-700">Shaxsiy tahlil</p>
                  </div>
                  {AI_INSIGHTS.map(insight => {
                    const Icon = insight.icon;
                    return (
                      <div key={insight.title} className="flex gap-3 p-3 bg-zinc-50 rounded-xl">
                        <div className="w-7 h-7 rounded-lg bg-white border border-zinc-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Icon className="w-3.5 h-3.5 text-zinc-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-zinc-800 mb-0.5">{insight.title}</p>
                          <p className="text-xs text-zinc-500 leading-relaxed">{insight.body}</p>
                        </div>
                      </div>
                    );
                  })}
                  <div className="border-t border-zinc-100 pt-4">
                    <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                      Tavsiyalar
                    </p>
                    <div className="space-y-2.5">
                      {AI_SUGGESTIONS.map((s, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <div className="w-5 h-5 rounded-full bg-zinc-900 text-white flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5">
                            {i + 1}
                          </div>
                          <p className="text-xs text-zinc-600 leading-relaxed">{s}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="h-4" />
        </div>
      </div>
    </>
  );
}
