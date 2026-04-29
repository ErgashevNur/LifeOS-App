import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import HabitBuilder from "./habits/HabitBuilder";
import { useLifeOSData } from "@/lib/lifeos-store";
import InsightsSection from "@/components/habits/InsightsSection";
import ActiveHabitTimer from "@/components/habits/ActiveHabitTimer";
import StreakRecoverySheet from "@/components/habits/StreakRecoverySheet";
import MilestoneModal from "@/components/habits/MilestoneModal";
import LifeEventSheet from "@/components/habits/LifeEventSheet";
import ProgressionOfferModal from "@/components/habits/ProgressionOfferModal";
import TransformationPromptModal from "@/pages/reflection/TransformationPromptModal";
import { useStreakRecovery } from "@/hooks/useStreakRecovery";
import { useMilestones } from "@/hooks/useMilestones";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { getStreakStatus, todayISO, applyFreeze } from "@/lib/streakEngine";
import { LIFE_EVENTS } from "@/lib/lifeEvents";
import { shouldOfferProgression, getNextStage, getCurrentStage, getProgressToNext } from "@/lib/progressionEngine";
import { shouldAskTransformation, buildTransformationQuestion } from "@/lib/transformationEngine";
import { recordIdentityAction, buildReinforcementMessage } from "@/lib/identityTracker";
import { toast } from "sonner";
import {
  Plus, Check, X, Clock, Flame, Target, BarChart3,
  ChevronDown, MoreHorizontal, Edit3, Trash2, Eye,
  Zap, Repeat, Brain, Calendar, TrendingUp, AlertTriangle,
  Sun, Moon, Coffee, Sparkles, CheckCircle2, ArrowRight,
  RefreshCw, StickyNote, SkipForward, AlarmClock, Star,
  Circle, Activity, Hash, Layers, Filter, ArrowUpDown,
  LayoutGrid, List, Bell, Lock, Unlock, Award, Play, Timer,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════════ */

const CATEGORIES = [
  { value: "health",     label: "Health",     icon: "🏃", color: "text-zinc-700" },
  { value: "mind",       label: "Mind",       icon: "🧠", color: "text-zinc-700" },
  { value: "work",       label: "Work",       icon: "💼", color: "text-zinc-700" },
  { value: "learning",   label: "Learning",   icon: "📚", color: "text-zinc-700" },
  { value: "spiritual",  label: "Spiritual",  icon: "🧘", color: "text-zinc-700" },
  { value: "social",     label: "Social",     icon: "🤝", color: "text-zinc-700" },
  { value: "creative",   label: "Creative",   icon: "🎨", color: "text-zinc-700" },
  { value: "finance",    label: "Finance",    icon: "💰", color: "text-zinc-700" },
];

const HABIT_TYPES = [
  { value: "essential", label: "Essential", desc: "Core to your identity. Max 3–5.", icon: Lock },
  { value: "optional",  label: "Optional",  desc: "Good to have, flexible.",         icon: Unlock },
  { value: "recovery",  label: "Recovery",  desc: "Rebuild after a setback.",        icon: RefreshCw },
];

const FREQUENCIES = [
  { value: "daily",    label: "Every day" },
  { value: "weekdays", label: "Weekdays only" },
  { value: "3x",       label: "3× per week" },
  { value: "custom",   label: "Custom" },
];

const TIMES = [
  { value: "morning",   label: "Morning",   icon: Sun    },
  { value: "afternoon", label: "Afternoon", icon: Coffee },
  { value: "evening",   label: "Evening",   icon: Moon   },
  { value: "flexible",  label: "Flexible",  icon: Clock  },
];

const DIFFICULTIES = [
  { value: "easy",   label: "Easy",   desc: "< 5 min" },
  { value: "medium", label: "Medium", desc: "5–20 min" },
  { value: "hard",   label: "Hard",   desc: "20+ min" },
];

const IDENTITIES = [
  "I am a disciplined person",
  "I am a healthy person",
  "I am a focused person",
  "I am a lifelong learner",
  "I am a calm person",
  "I am a productive person",
  "I am a creative person",
];

const SKIP_REASONS = [
  { key: "forgot",      label: "Forgot" },
  { key: "no_time",     label: "No time" },
  { key: "low_energy",  label: "Low energy" },
  { key: "distracted",  label: "Got distracted" },
  { key: "sick",        label: "Sick/unwell" },
  { key: "too_hard",    label: "Too hard today" },
];

const VIEWS = [
  { key: "today",     label: "Today" },
  { key: "all",       label: "All Habits" },
  { key: "analytics", label: "Analytics" },
];

/* ═══════════════════════════════════════════════════════════════════
   DUMMY DATA GENERATION
   ═══════════════════════════════════════════════════════════════════ */

function generateHistory(days, consistency) {
  const history = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().slice(0, 10);
    const rand = Math.random();
    if (i === 0) {
      history.push({ date: dateStr, done: false, skipped: false });
    } else if (rand < consistency) {
      history.push({ date: dateStr, done: true, skipped: false });
    } else if (rand < consistency + 0.05) {
      history.push({ date: dateStr, done: false, skipped: true, reason: "low_energy" });
    } else {
      history.push({ date: dateStr, done: false, skipped: false });
    }
  }
  return history;
}

function computeStreak(history) {
  let streak = 0;
  const sorted = [...history].sort((a, b) => b.date.localeCompare(a.date));
  // Skip today (index 0) when computing streak
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].done) streak++;
    else break;
  }
  return streak;
}

function computeConsistency(history) {
  const active = history.slice(0, -1); // exclude today
  if (!active.length) return 0;
  return Math.round((active.filter(d => d.done).length / active.length) * 100);
}

const SEED_HABITS = [
  {
    id: "h1", title: "Morning exercise", category: "health", type: "essential",
    frequency: "daily", time: "morning", difficulty: "medium",
    identity: "I am a healthy person",
    cue: "After waking up, before checking phone",
    completedToday: true, recoveryMode: false,
    consistencyTarget: 0.82,
    notes: ["Starting to notice more energy by midday.", "Skipped 2 days during travel — back on track."],
  },
  {
    id: "h2", title: "Read 30 minutes", category: "learning", type: "essential",
    frequency: "daily", time: "evening", difficulty: "easy",
    identity: "I am a lifelong learner",
    cue: "After dinner, before screen time",
    completedToday: false, recoveryMode: false,
    consistencyTarget: 0.75,
    notes: ["Finished Atomic Habits. Now on Deep Work."],
  },
  {
    id: "h3", title: "Deep work block", category: "work", type: "essential",
    frequency: "weekdays", time: "morning", difficulty: "hard",
    identity: "I am a focused person",
    cue: "9 AM, after morning routine",
    completedToday: false, recoveryMode: false,
    consistencyTarget: 0.68,
    notes: [],
  },
  {
    id: "h4", title: "10-min meditation", category: "spiritual", type: "optional",
    frequency: "daily", time: "morning", difficulty: "easy",
    identity: "I am a calm person",
    cue: "Right after exercise",
    completedToday: true, recoveryMode: false,
    consistencyTarget: 0.60,
    notes: ["Noticed less reactive behaviour at work."],
  },
  {
    id: "h5", title: "No phone after 10 PM", category: "health", type: "essential",
    frequency: "daily", time: "evening", difficulty: "medium",
    identity: "I am a disciplined person",
    cue: "Set alarm at 9:50 PM as reminder",
    completedToday: true, recoveryMode: false,
    consistencyTarget: 0.55,
    notes: ["Sleeping much better since starting this."],
  },
  {
    id: "h6", title: "Journaling", category: "mind", type: "optional",
    frequency: "daily", time: "evening", difficulty: "easy",
    identity: "I am a reflective person",
    cue: "Before bed, 5 minutes only",
    completedToday: false, recoveryMode: true,
    consistencyTarget: 0.45,
    notes: ["On recovery after missing 3 days."],
  },
];

function buildHabits() {
  return SEED_HABITS.map(seed => {
    const history = generateHistory(84, seed.consistencyTarget);
    const streak = computeStreak(history);
    const longestStreak = Math.max(streak, Math.floor(streak * 1.4 + 5));
    const consistency = computeConsistency(history);
    return { ...seed, history, streak, longestStreak, consistency };
  });
}

const INITIAL_HABITS = buildHabits();

function toUIHabit(bh) {
  const rate = Math.min(0.95, bh.completedDays / 84);
  const history = generateHistory(84, rate);
  const today = new Date();
  for (let i = 0; i < Math.min(bh.streak, 84); i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const ds = d.toISOString().slice(0, 10);
    const idx = history.findIndex(h => h.date === ds);
    if (idx >= 0) history[idx] = { ...history[idx], done: i > 0 ? true : bh.completedToday };
  }
  return {
    id: bh.id,
    title: bh.title,
    streak: bh.streak,
    longestStreak: bh.longestStreak,
    completedDays: bh.completedDays,
    completedToday: bh.completedToday,
    category: "mind",
    type: "essential",
    frequency: "daily",
    time: "morning",
    difficulty: "medium",
    identity: "I am a disciplined person",
    cue: "",
    reward: "",
    recoveryMode: false,
    history,
    notes: [],
    consistency: computeConsistency(history),
  };
}

/* ═══════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════ */

let _uid = Date.now();
function uid() { return `h_${_uid++}`; }

function todayStr() { return new Date().toISOString().slice(0, 10); }

function formatDateShort(iso) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getDayLabel(i) {
  return ["S", "M", "T", "W", "T", "F", "S"][i];
}

function getWeekDates(weeksBack = 0) {
  const dates = [];
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() - weeksBack * 7);
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

function getHeatmapData(history) {
  // 12 weeks × 7 days, most recent at bottom-right
  const map = {};
  history.forEach(h => { map[h.date] = h; });
  const weeks = [];
  for (let w = 11; w >= 0; w--) {
    weeks.push(getWeekDates(w).map(date => ({ date, ...map[date] })));
  }
  return weeks;
}

function getWeeklyConsistency(habits, weeksBack = 8) {
  const results = [];
  for (let w = weeksBack - 1; w >= 0; w--) {
    const dates = getWeekDates(w);
    let done = 0, total = 0;
    habits.forEach(h => {
      dates.forEach(date => {
        const entry = h.history.find(e => e.date === date);
        if (entry) { total++; if (entry.done) done++; }
      });
    });
    const label = formatDateShort(dates[0]);
    results.push({ label, pct: total > 0 ? Math.round((done / total) * 100) : 0 });
  }
  return results;
}

/* ═══════════════════════════════════════════════════════════════════
   ANIMATION VARIANTS
   ═══════════════════════════════════════════════════════════════════ */

const fade = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.2 } },
};

const slideIn = {
  initial: { x: "100%" },
  animate: { x: 0, transition: { type: "spring", damping: 30, stiffness: 300 } },
  exit: { x: "100%", transition: { duration: 0.22, ease: "easeIn" } },
};

/* ═══════════════════════════════════════════════════════════════════
   REUSABLE PRIMITIVES
   ═══════════════════════════════════════════════════════════════════ */

function Card({ children, className, onClick }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-2xl border border-zinc-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
        onClick && "cursor-pointer hover:border-zinc-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.07)] transition-all duration-200",
        className,
      )}
    >
      {children}
    </div>
  );
}

function Badge({ children, className }) {
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide", className)}>
      {children}
    </span>
  );
}

function IconBtn({ icon: Icon, onClick, label, active, danger, size = "w-8 h-8" }) {
  return (
    <button
      onClick={onClick} title={label}
      className={cn(
        size, "rounded-xl flex items-center justify-center transition-all duration-150 flex-shrink-0",
        active ? "bg-zinc-900 text-white"
          : danger ? "text-red-400 hover:bg-red-50 hover:text-red-600"
          : "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100",
      )}
    >
      <Icon className="w-[15px] h-[15px]" strokeWidth={1.8} />
    </button>
  );
}

function PillRow({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(o => (
        <button key={o.value} onClick={() => onChange(o.value === value ? "" : o.value)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all",
            value === o.value ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200",
          )}
        >
          {o.icon && <o.icon className="w-3 h-3 inline mr-1" strokeWidth={2} />}
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Dropdown({ trigger, children, align = "right" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    if (open) document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  return (
    <div className="relative" ref={ref}>
      <div onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}>{trigger}</div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.13 }}
            onClick={() => setOpen(false)}
            className={cn(
              "absolute z-50 mt-1 min-w-[175px] bg-white border border-zinc-200 rounded-xl shadow-lg py-1",
              align === "right" ? "right-0" : "left-0",
            )}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DropdownItem({ icon: Icon, label, onClick, danger }) {
  return (
    <button onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2.5 px-3 py-2 text-[12px] font-medium transition-colors text-left",
        danger ? "text-red-500 hover:bg-red-50" : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900",
      )}
    >
      {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.8} />}
      {label}
    </button>
  );
}

function FormField({ label, children, hint }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-[10px] text-zinc-400 mt-1">{hint}</p>}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, className, onKeyDown }) {
  return (
    <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      onKeyDown={onKeyDown}
      className={cn(
        "w-full bg-transparent text-sm font-medium outline-none border border-zinc-200 rounded-xl px-3.5 py-2.5",
        "text-zinc-800 placeholder:text-zinc-300 focus:border-zinc-400 transition-all",
        className,
      )}
    />
  );
}

function Modal({ open, onClose, title, subtitle, children, wide }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[60]" onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[61]",
              "bg-white rounded-2xl border border-zinc-200 shadow-2xl flex flex-col max-h-[90vh]",
              wide ? "w-[640px] max-w-[95vw]" : "w-[500px] max-w-[95vw]",
            )}
          >
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-zinc-100 flex-shrink-0">
              <div>
                <h3 className="text-[15px] font-bold text-zinc-900">{title}</h3>
                {subtitle && <p className="text-[11px] text-zinc-400 mt-0.5">{subtitle}</p>}
              </div>
              <IconBtn icon={X} onClick={onClose} label="Close" />
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Drawer({ open, onClose, title, subtitle, headerRight, children }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-[60]" onClick={onClose}
          />
          <motion.aside {...slideIn}
            className="fixed right-0 top-0 h-full w-[500px] max-w-[95vw] bg-white border-l border-zinc-200 shadow-2xl z-[61] flex flex-col"
          >
            <div className="flex items-center justify-between px-5 h-[58px] border-b border-zinc-100 flex-shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <IconBtn icon={X} onClick={onClose} label="Close" />
                <div className="min-w-0">
                  <p className="text-[14px] font-bold text-zinc-900 truncate">{title}</p>
                  {subtitle && <p className="text-[10px] text-zinc-400 truncate">{subtitle}</p>}
                </div>
              </div>
              {headerRight}
            </div>
            <div className="flex-1 overflow-y-auto">{children}</div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function EmptyState({ icon: Icon, title, desc, action }) {
  return (
    <div className="flex flex-col items-center py-14 text-center px-6">
      <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-zinc-400" strokeWidth={1.5} />
      </div>
      <p className="text-sm font-semibold text-zinc-700">{title}</p>
      <p className="text-xs text-zinc-400 mt-1 max-w-[260px]">{desc}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MINI STREAK RING — small SVG circle for cards
   ═══════════════════════════════════════════════════════════════════ */

function MiniRing({ pct, size = 40, stroke = 3 }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f4f4f5" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="#27272a" strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ * (1 - pct / 100) }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   COMPLETION RING — hero large ring
   ═══════════════════════════════════════════════════════════════════ */

function CompletionRing({ done, total }) {
  const pct = total > 0 ? (done / total) * 100 : 0;
  const r = 54;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      <svg viewBox="0 0 128 128" className="absolute inset-0 -rotate-90">
        <circle cx="64" cy="64" r={r} fill="none" stroke="#f4f4f5" strokeWidth="7" />
        <motion.circle
          cx="64" cy="64" r={r} fill="none"
          stroke="#18181b" strokeWidth="7" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - pct / 100) }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="relative flex flex-col items-center">
        <span className="text-2xl font-black text-zinc-900 tabular-nums">{done}/{total}</span>
        <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">today</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   HEATMAP — 12 weeks × 7 days
   ═══════════════════════════════════════════════════════════════════ */

function Heatmap({ history }) {
  const weeks = useMemo(() => getHeatmapData(history), [history]);
  const days = ["S", "M", "T", "W", "T", "F", "S"];
  return (
    <div className="overflow-x-auto">
      <div className="flex gap-0.5 min-w-fit">
        {/* Day labels */}
        <div className="flex flex-col gap-0.5 mr-1 pt-5">
          {days.map((d, i) => (
            <div key={i} className="h-4 flex items-center">
              <span className="text-[9px] font-semibold text-zinc-400 w-3">{i % 2 === 1 ? d : ""}</span>
            </div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-0.5">
            {wi === 0 && <div className="h-4" />}
            {wi > 0 && wi % 4 === 0 && (
              <div className="h-4 flex items-end pb-0.5">
                <span className="text-[8px] text-zinc-400">{formatDateShort(week[0]?.date || "")}</span>
              </div>
            )}
            {wi > 0 && wi % 4 !== 0 && <div className="h-4" />}
            {week.map((cell, di) => (
              <div
                key={di} title={cell?.date}
                className={cn(
                  "w-4 h-4 rounded-[3px] transition-colors",
                  !cell?.date ? "bg-transparent"
                    : cell?.done ? "bg-zinc-800"
                    : cell?.skipped ? "bg-zinc-300"
                    : "bg-zinc-100",
                )}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 mt-2">
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-zinc-100" /><span className="text-[9px] text-zinc-400">None</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-zinc-300" /><span className="text-[9px] text-zinc-400">Skipped</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-zinc-800" /><span className="text-[9px] text-zinc-400">Done</span></div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   WEEKLY BAR CHART
   ═══════════════════════════════════════════════════════════════════ */

function WeeklyChart({ habits }) {
  const data = useMemo(() => getWeeklyConsistency(habits, 8), [habits]);
  const maxPct = Math.max(...data.map(d => d.pct), 1);
  return (
    <div className="flex items-end gap-2 h-28">
      {data.map((w, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-[9px] font-semibold text-zinc-400 tabular-nums">{w.pct}%</span>
          <div className="w-full bg-zinc-100 rounded-t-md flex items-end" style={{ height: "72px" }}>
            <motion.div
              className="w-full bg-zinc-900 rounded-t-md"
              initial={{ height: 0 }}
              animate={{ height: `${(w.pct / maxPct) * 72}px` }}
              transition={{ duration: 0.7, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          <span className="text-[8px] text-zinc-400">{w.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   OVERVIEW HEADER HERO
   ═══════════════════════════════════════════════════════════════════ */

function OverviewHeader({ habits, onAddHabit }) {
  const done = habits.filter(h => h.completedToday).length;
  const total = habits.length;
  const streak = Math.max(...habits.map(h => h.streak), 0);
  const consistency = habits.length > 0
    ? Math.round(habits.reduce((s, h) => s + h.consistency, 0) / habits.length)
    : 0;

  const identityHabits = habits.filter(h => h.completedToday && h.identity);
  const identityMsg = identityHabits.length > 0
    ? identityHabits[0].identity
    : done === total && total > 0
      ? "I am a disciplined person"
      : null;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <Card className="overflow-hidden">
      {/* Top gradient strip */}
      <div className="h-1 bg-gradient-to-r from-zinc-300 via-zinc-700 to-zinc-900" />

      <div className="px-6 py-5 flex items-center gap-6">
        {/* Completion ring */}
        <CompletionRing done={done} total={total} />

        {/* Stats */}
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-zinc-400 mb-1">{greeting}</p>
          <h2 className="text-xl font-black text-zinc-900 mb-3">
            {done === total && total > 0
              ? "All done for today 🎯"
              : `${total - done} habit${total - done !== 1 ? "s" : ""} remaining`}
          </h2>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-zinc-700" strokeWidth={2} />
              <span className="text-sm font-black text-zinc-900 tabular-nums">{streak}</span>
              <span className="text-[11px] text-zinc-400 font-medium">day streak</span>
            </div>
            <div className="w-px h-4 bg-zinc-200" />
            <div className="flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-zinc-400" strokeWidth={1.8} />
              <span className="text-sm font-black text-zinc-900">{consistency}%</span>
              <span className="text-[11px] text-zinc-400 font-medium">consistency</span>
            </div>
            <div className="w-px h-4 bg-zinc-200" />
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-zinc-400" strokeWidth={1.8} />
              <span className="text-sm font-black text-zinc-900">{total}</span>
              <span className="text-[11px] text-zinc-400 font-medium">active</span>
            </div>
          </div>

          {/* Identity statement */}
          {identityMsg && (
            <motion.div {...fade}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 text-white text-[11px] font-semibold"
            >
              <Sparkles className="w-3 h-3" />
              "{identityMsg}"
            </motion.div>
          )}
        </div>

        {/* Add button */}
        <button onClick={onAddHabit}
          className="w-11 h-11 rounded-full bg-zinc-900 text-white flex items-center justify-center hover:bg-zinc-800 active:scale-95 transition-all flex-shrink-0"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TODAY'S HABIT ROW — list view item
   ═══════════════════════════════════════════════════════════════════ */

function TodayHabitRow({ habit, onCheck, onSkip, onDetails, onEdit, onStartTimer, onOpenRecovery, streakStatus }) {
  const cat = CATEGORIES.find(c => c.value === habit.category);
  const timeObj = TIMES.find(t => t.value === habit.time);
  const TimeIcon = timeObj?.icon || Clock;

  const typeMeta = {
    essential: { label: "Essential", className: "bg-zinc-900 text-white" },
    optional:  { label: "Optional",  className: "bg-zinc-100 text-zinc-600" },
    recovery:  { label: "Recovery",  className: "bg-amber-50 text-amber-700" },
  }[habit.type] || {};

  // Streak display
  const currentStreak = habit.streak || 0;
  const recordStreak = habit.recordStreak || habit.longestStreak || currentStreak;
  const streakColorClass = {
    active:   "text-orange-500",
    at_risk:  "text-amber-500",
    missed_1: "text-zinc-400",
    missed_2: "text-zinc-400",
    recovery: "text-zinc-300",
  }[streakStatus] || "text-zinc-400";

  return (
    <motion.div layout {...fade}
      className={cn(
        "flex items-center gap-3 px-5 py-3.5 border-b border-zinc-100 last:border-0 transition-colors",
        habit.completedToday ? "bg-zinc-50/50" : "bg-white hover:bg-zinc-50/30",
      )}
    >
      {/* Checkbox */}
      <button
        onClick={() => !habit.completedToday && onCheck(habit.id)}
        className={cn(
          "w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200",
          habit.completedToday
            ? "bg-zinc-900 border-zinc-900"
            : habit.skippedToday
            ? "bg-zinc-200 border-zinc-300"
            : "border-zinc-300 hover:border-zinc-600",
        )}
      >
        {habit.completedToday && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
        {habit.skippedToday && <SkipForward className="w-3 h-3 text-zinc-500" />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {habit.emoji && <span className="text-[13px]">{habit.emoji}</span>}
          <span className={cn(
            "text-[13px] font-semibold leading-snug",
            habit.completedToday ? "text-zinc-400 line-through" : "text-zinc-900",
          )}>
            {habit.name || habit.title}
          </span>
          <Badge className={typeMeta.className}>{typeMeta.label}</Badge>
          {habit.recoveryMode && (
            <Badge className="bg-amber-50 text-amber-600">
              <RefreshCw className="w-2.5 h-2.5" /> Recovery
            </Badge>
          )}
          {habit.achievedMilestones?.includes(66) && (
            <Badge className="bg-violet-50 text-violet-600">● Avtomatik</Badge>
          )}
        </div>

        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
          <span className="text-[10px] text-zinc-400 flex items-center gap-1">
            {cat?.icon} {cat?.label}
          </span>
          {/* Streak */}
          <span className={cn("text-[10px] font-semibold flex items-center gap-1", streakColorClass)}>
            <Flame className="w-3 h-3" strokeWidth={2} />
            {currentStreak === 0 ? "Muzlatilgan 🧊" : `${currentStreak}d streak`}
          </span>
          {recordStreak > currentStreak && (
            <span className="text-[10px] text-zinc-400 flex items-center gap-1">
              · 🏆 {recordStreak}
            </span>
          )}
          {/* Status badges */}
          {streakStatus === "at_risk" && !habit.completedToday && (
            <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              ⚠️ Bugun bajaring
            </span>
          )}
          {streakStatus === "missed_1" && (
            <span className="text-[10px] font-semibold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
              🧊 Muzlatilgan
            </span>
          )}
        </div>

        {/* Progression bar */}
        {(() => {
          const stage = getCurrentStage(currentStreak);
          const nextStg = getNextStage(currentStreak);
          if (!nextStg) return null;
          const progress = getProgressToNext(currentStreak);
          return (
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px]">{stage.emoji}</span>
              <div className="flex-1 h-1 bg-black/[0.06] rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(2, progress * 100)}%` }}
                />
              </div>
              <span className="text-[9px] text-zinc-400">
                {nextStg.daysRequired - currentStreak}k → {nextStg.emoji}
              </span>
            </div>
          );
        })()}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* Recovery button for 2+ days missed */}
        {(streakStatus === "missed_2" || streakStatus === "recovery") && !habit.completedToday && (
          <button
            onClick={() => onOpenRecovery(habit.id)}
            className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-violet-600 bg-violet-50 hover:bg-violet-100 transition-colors"
          >
            {streakStatus === "recovery" ? "🆘 Qayta" : "🔄 Qayta"}
          </button>
        )}
        {/* Timer button */}
        {!habit.completedToday && !habit.skippedToday && (
          <IconBtn icon={Play} onClick={() => onStartTimer(habit.id)} label="Timer boshla" />
        )}
        {!habit.completedToday && !habit.skippedToday && (
          <Dropdown
            trigger={
              <button className="px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-zinc-400 hover:bg-zinc-100 transition-colors">
                Skip
              </button>
            }
            align="right"
          >
            <div className="px-3 py-2 border-b border-zinc-100">
              <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Skip reason</p>
            </div>
            {SKIP_REASONS.map(r => (
              <DropdownItem key={r.key} label={r.label} onClick={() => onSkip(habit.id, r.key)} />
            ))}
          </Dropdown>
        )}
        <IconBtn icon={Eye} onClick={() => onDetails(habit.id)} label="Details" />
        <Dropdown trigger={<IconBtn icon={MoreHorizontal} label="More" />}>
          <DropdownItem icon={Edit3} label="Edit" onClick={() => onEdit(habit.id)} />
          <DropdownItem icon={Eye} label="View Details" onClick={() => onDetails(habit.id)} />
        </Dropdown>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   HABIT CARD — grid view
   ═══════════════════════════════════════════════════════════════════ */

function HabitCard({ habit, onCheck, onDetails, onEdit, onDelete }) {
  const cat = CATEGORIES.find(c => c.value === habit.category);
  const pct = habit.consistency;
  const typeMeta = {
    essential: { label: "Essential", className: "bg-zinc-900 text-white" },
    optional:  { label: "Optional",  className: "bg-zinc-100 text-zinc-600" },
    recovery:  { label: "Recovery",  className: "bg-amber-50 text-amber-700" },
  }[habit.type] || {};

  return (
    <Card onClick={() => onDetails(habit.id)} className="flex flex-col">
      <div className="px-4 pt-4 pb-3 flex-1">
        {/* Top row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base">{cat?.icon}</span>
            <Badge className={typeMeta.className}>{typeMeta.label}</Badge>
            {habit.recoveryMode && (
              <Badge className="bg-amber-50 text-amber-700">
                <RefreshCw className="w-2.5 h-2.5" />
              </Badge>
            )}
          </div>
          <Dropdown trigger={<IconBtn icon={MoreHorizontal} size="w-7 h-7" label="More" onClick={e => e.stopPropagation()} />}>
            <DropdownItem icon={Check} label="Check In" onClick={() => onCheck(habit.id)} />
            <DropdownItem icon={Edit3} label="Edit" onClick={() => onEdit(habit.id)} />
            <DropdownItem icon={Eye} label="Details" onClick={() => onDetails(habit.id)} />
            <div className="h-px bg-zinc-100 my-1" />
            <DropdownItem icon={Trash2} label="Delete" danger onClick={() => onDelete(habit.id)} />
          </Dropdown>
        </div>

        {/* Title */}
        <h3 className={cn(
          "text-[13px] font-bold leading-snug mb-1",
          habit.completedToday ? "text-zinc-400 line-through" : "text-zinc-900",
        )}>
          {habit.title}
        </h3>
        {habit.cue && <p className="text-[10px] text-zinc-400 mb-3 line-clamp-1">{habit.cue}</p>}

        {/* Streak + consistency */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-zinc-500" strokeWidth={2} />
            <span className="text-[12px] font-black text-zinc-800 tabular-nums">{habit.streak}</span>
            <span className="text-[10px] text-zinc-400">day streak</span>
          </div>
          <div className="relative">
            <MiniRing pct={pct} size={36} stroke={3} />
            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-zinc-700">
              {pct}%
            </span>
          </div>
        </div>

        {/* 7-day mini history */}
        <div className="flex gap-1 mt-1">
          {habit.history.slice(-7).map((h, i) => (
            <div key={i} title={h.date}
              className={cn(
                "flex-1 h-1.5 rounded-full",
                h.done ? "bg-zinc-900" : h.skipped ? "bg-zinc-300" : "bg-zinc-100",
              )}
            />
          ))}
        </div>
      </div>

      {/* Footer check-in */}
      <div className="border-t border-zinc-100 px-4 py-2.5 flex items-center justify-between">
        <span className="text-[10px] font-semibold text-zinc-400">Best: {habit.longestStreak}d</span>
        <button
          onClick={e => { e.stopPropagation(); onCheck(habit.id); }}
          className={cn(
            "px-3 py-1 rounded-lg text-[11px] font-bold transition-all",
            habit.completedToday
              ? "bg-zinc-100 text-zinc-400"
              : "bg-zinc-900 text-white hover:bg-zinc-800 active:scale-95",
          )}
        >
          {habit.completedToday ? "Done ✓" : "Check In"}
        </button>
      </div>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   HABIT CREATION MODAL — 3 steps
   ═══════════════════════════════════════════════════════════════════ */

const EMPTY_FORM = {
  title: "", category: "", type: "essential", frequency: "daily",
  time: "morning", difficulty: "medium", identity: "", cue: "",
};

function HabitCreationModal({ open, onClose, onSave, editHabit }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);
  const up = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    if (open) {
      setStep(0);
      setForm(editHabit ? { ...EMPTY_FORM, ...editHabit } : EMPTY_FORM);
    }
  }, [open, editHabit]);

  const steps = ["Basics", "Schedule", "Identity"];
  const valid = form.title.trim().length > 0;

  const handleSave = () => {
    if (!valid) return;
    onSave(form);
    onClose();
  };

  const SlideStep = ({ active, children }) => (
    <AnimatePresence mode="wait">
      {active && (
        <motion.div key="s"
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0, transition: { duration: 0.25 } }}
          exit={{ opacity: 0, x: -16, transition: { duration: 0.18 } }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <Modal open={open} onClose={onClose}
      title={editHabit ? "Edit Habit" : "New Habit"}
      subtitle="Build systems, not goals"
    >
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {steps.map((s, i) => (
          <button key={s} onClick={() => i < step + 1 && setStep(i)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all",
              step === i ? "bg-zinc-900 text-white" : i < step ? "bg-zinc-100 text-zinc-500" : "bg-zinc-50 text-zinc-300",
            )}
          >
            <span className={cn(
              "w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black",
              step === i ? "bg-white/20" : i < step ? "bg-zinc-200" : "bg-zinc-200",
            )}>{i + 1}</span>
            {s}
          </button>
        ))}
      </div>

      {/* Step 0: Basics */}
      <SlideStep active={step === 0}>
        <div className="flex flex-col gap-4">
          <FormField label="Habit Name *">
            <TextInput value={form.title} onChange={v => up("title", v)} placeholder="e.g. Morning exercise for 20 min" />
          </FormField>

          <FormField label="Category">
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map(c => (
                <button key={c.value} onClick={() => up("category", c.value === form.category ? "" : c.value)}
                  className={cn(
                    "flex flex-col items-center gap-1 py-2.5 rounded-xl border transition-all text-[11px] font-semibold",
                    form.category === c.value ? "border-zinc-900 bg-zinc-50 text-zinc-900" : "border-zinc-200 text-zinc-500 hover:border-zinc-300",
                  )}
                >
                  <span className="text-base">{c.icon}</span>
                  {c.label}
                </button>
              ))}
            </div>
          </FormField>

          <FormField label="Type" hint={form.type === "essential" ? "Limit to 3–5 essential habits maximum." : ""}>
            <div className="flex flex-col gap-2">
              {HABIT_TYPES.map(t => {
                const Icon = t.icon;
                return (
                  <button key={t.value} onClick={() => up("type", t.value)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all",
                      form.type === t.value ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 hover:border-zinc-300",
                    )}
                  >
                    <Icon className="w-4 h-4 text-zinc-500 flex-shrink-0" strokeWidth={1.8} />
                    <div>
                      <p className="text-[12px] font-semibold text-zinc-800">{t.label}</p>
                      <p className="text-[10px] text-zinc-400">{t.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </FormField>
        </div>
      </SlideStep>

      {/* Step 1: Schedule */}
      <SlideStep active={step === 1}>
        <div className="flex flex-col gap-4">
          <FormField label="Frequency">
            <PillRow options={FREQUENCIES} value={form.frequency} onChange={v => up("frequency", v)} />
          </FormField>

          <FormField label="Time of Day">
            <PillRow options={TIMES} value={form.time} onChange={v => up("time", v)} />
          </FormField>

          <FormField label="Difficulty">
            <div className="grid grid-cols-3 gap-2">
              {DIFFICULTIES.map(d => (
                <button key={d.value} onClick={() => up("difficulty", d.value)}
                  className={cn(
                    "flex flex-col items-center gap-0.5 py-3 rounded-xl border transition-all",
                    form.difficulty === d.value ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 hover:border-zinc-300",
                  )}
                >
                  <span className="text-[12px] font-bold text-zinc-800">{d.label}</span>
                  <span className="text-[10px] text-zinc-400">{d.desc}</span>
                </button>
              ))}
            </div>
          </FormField>

          <FormField label="Cue / Trigger" hint="When or what triggers this habit? Be specific.">
            <TextInput value={form.cue} onChange={v => up("cue", v)} placeholder="After waking up, before coffee..." />
          </FormField>
        </div>
      </SlideStep>

      {/* Step 2: Identity */}
      <SlideStep active={step === 2}>
        <div className="flex flex-col gap-5">
          <div className="rounded-xl bg-zinc-50 p-4 border border-zinc-200">
            <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Atomic Habits Principle</p>
            <p className="text-[13px] text-zinc-700 leading-relaxed">
              Every habit is a vote for the type of person you want to become. Link your habit to an identity.
            </p>
          </div>

          <FormField label="Identity Statement">
            <div className="flex flex-col gap-1.5">
              {IDENTITIES.map(id => (
                <button key={id} onClick={() => up("identity", id === form.identity ? "" : id)}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-left text-[12px] font-medium transition-all",
                    form.identity === id
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50",
                  )}
                >
                  {form.identity === id
                    ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    : <Circle className="w-4 h-4 text-zinc-300 flex-shrink-0" />}
                  {id}
                </button>
              ))}
            </div>
          </FormField>

          {form.identity && (
            <motion.div {...fade}
              className="rounded-xl bg-zinc-900 text-white p-4"
            >
              <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Your Vote</p>
              <p className="text-[13px] leading-relaxed">
                Every time you complete <span className="font-bold text-white">"{form.title || "this habit"}"</span>, you cast a vote for becoming someone who says: <span className="font-bold italic">"{form.identity}"</span>
              </p>
            </motion.div>
          )}

          {/* AI suggestion */}
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 text-[11px] font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors">
            <Sparkles className="w-3.5 h-3.5" />
            Get AI habit suggestions
          </button>
        </div>
      </SlideStep>

      {/* Footer */}
      <div className="flex items-center justify-between pt-5 mt-4 border-t border-zinc-100">
        <div className="flex gap-2">
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)}
              className="px-4 py-2.5 rounded-xl text-[12px] font-semibold text-zinc-500 hover:bg-zinc-100 transition-colors"
            >
              Back
            </button>
          )}
          <button onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-[12px] font-semibold text-zinc-400 hover:bg-zinc-100 transition-colors"
          >
            Cancel
          </button>
        </div>
        <div className="flex gap-2">
          {step < 2 ? (
            <button onClick={() => setStep(s => s + 1)}
              className="px-5 py-2.5 rounded-xl text-[12px] font-bold bg-zinc-900 text-white hover:bg-zinc-800 transition-all"
            >
              Next →
            </button>
          ) : (
            <button onClick={handleSave} disabled={!valid}
              className={cn(
                "px-5 py-2.5 rounded-xl text-[12px] font-bold transition-all",
                valid ? "bg-zinc-900 text-white hover:bg-zinc-800 active:scale-[0.97]" : "bg-zinc-200 text-zinc-400",
              )}
            >
              {editHabit ? "Save Changes" : "Create Habit"}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   HABIT DETAIL DRAWER
   ═══════════════════════════════════════════════════════════════════ */

function HabitDetailDrawer({ habit, open, onClose, onCheck, onSkip, onUpdate }) {
  const [noteText, setNoteText] = useState("");
  const [notes, setNotes] = useState(habit?.notes || []);

  useEffect(() => {
    if (open && habit) setNotes(habit.notes || []);
  }, [open, habit?.id]);

  if (!habit) return null;

  const cat = CATEGORIES.find(c => c.value === habit.category);
  const timeObj = TIMES.find(t => t.value === habit.time);
  const diffObj = DIFFICULTIES.find(d => d.value === habit.difficulty);
  const freqObj = FREQUENCIES.find(f => f.value === habit.frequency);
  const typeObj = HABIT_TYPES.find(t => t.value === habit.type);

  const addNote = () => {
    if (!noteText.trim()) return;
    const updated = [...notes, { id: Date.now(), text: noteText.trim(), date: new Date().toISOString() }];
    setNotes(updated);
    setNoteText("");
    onUpdate(habit.id, { notes: updated });
  };

  const skipStats = habit.history.filter(h => h.skipped);
  const topSkipReason = skipStats.length > 0
    ? SKIP_REASONS.find(r => r.key === skipStats[0].reason)?.label || "Unknown"
    : null;

  // AI insight based on data
  const aiInsight = habit.consistency >= 80
    ? `Strong momentum! Your ${habit.streak}-day streak shows real commitment. Consider raising the difficulty to continue growing.`
    : habit.consistency >= 60
    ? `Solid foundation. You complete this ${habit.consistency}% of the time. Focus on the cue: "${habit.cue}".`
    : habit.recoveryMode
    ? `You're in recovery mode — that's okay. Aim for 3 consecutive days to rebuild momentum. Small is better than nothing.`
    : `This habit needs attention. Try habit stacking: link it to something you already do automatically every day.`;

  const Section = ({ title, icon: Icon, children }) => (
    <div className="px-5 py-4 border-b border-zinc-100">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.8} />
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{title}</span>
      </div>
      {children}
    </div>
  );

  return (
    <Drawer
      open={open} onClose={onClose}
      title={habit.title}
      subtitle={cat ? `${cat.icon} ${cat.label}` : undefined}
      headerRight={
        <button
          onClick={() => onCheck(habit.id)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all",
            habit.completedToday ? "bg-zinc-100 text-zinc-400" : "bg-zinc-900 text-white hover:bg-zinc-800",
          )}
        >
          {habit.completedToday ? "Done ✓" : "Check In"}
        </button>
      }
    >
      {/* Hero stats */}
      <div className="px-5 py-5 bg-zinc-50/50 border-b border-zinc-100">
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: "Current Streak", value: `${habit.streak}d`, icon: Flame },
            { label: "Best Streak", value: `${habit.longestStreak}d`, icon: Award },
            { label: "Consistency", value: `${habit.consistency}%`, icon: BarChart3 },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl p-3 border border-zinc-200 text-center">
              <s.icon className="w-4 h-4 text-zinc-400 mx-auto mb-1" strokeWidth={1.8} />
              <p className="text-lg font-black text-zinc-900 tabular-nums">{s.value}</p>
              <p className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Recovery mode banner */}
        {habit.recoveryMode && (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 mb-3">
            <RefreshCw className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-[12px] font-bold text-amber-800">Recovery Mode Active</p>
              <p className="text-[10px] text-amber-600">Complete 3 days in a row to restore your streak.</p>
            </div>
          </div>
        )}

        {/* 7-day snapshot */}
        <div>
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">Last 7 days</p>
          <div className="flex gap-1.5">
            {habit.history.slice(-7).map((h, i) => {
              const d = new Date(h.date);
              const label = getDayLabel(d.getDay());
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className={cn(
                    "w-full h-7 rounded-lg flex items-center justify-center",
                    h.done ? "bg-zinc-900" : h.skipped ? "bg-zinc-300" : "bg-zinc-100",
                  )}>
                    {h.done && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                    {h.skipped && <SkipForward className="w-3 h-3 text-zinc-500" />}
                  </div>
                  <span className="text-[9px] font-semibold text-zinc-400">{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <Section title="Activity Heatmap (12 weeks)" icon={Calendar}>
        <Heatmap history={habit.history} />
      </Section>

      {/* Atomic Habits breakdown */}
      <Section title="Atomic Habits Model" icon={Layers}>
        <div className="space-y-2.5">
          {[
            { label: "CUE", desc: habit.cue || "Set a specific trigger", icon: Clock },
            { label: "CRAVING", desc: `Become: "${habit.identity || "a better version of yourself"}"`, icon: Star },
            { label: "RESPONSE", desc: `${habit.title} (${diffObj?.desc || ""})`, icon: Zap },
            { label: "REWARD", desc: "Every completion casts a vote for your identity", icon: Award },
          ].map(item => (
            <div key={item.label} className="flex items-start gap-3 px-3 py-2.5 rounded-xl bg-zinc-50">
              <item.icon className="w-3.5 h-3.5 text-zinc-400 mt-0.5 flex-shrink-0" strokeWidth={1.8} />
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-0.5">{item.label}</p>
                <p className="text-[12px] text-zinc-700 font-medium">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        {habit.identity && (
          <div className="mt-3 rounded-xl bg-zinc-900 text-white px-4 py-3">
            <p className="text-[11px] font-semibold text-zinc-300 mb-0.5">Identity vote</p>
            <p className="text-[13px] font-bold">"{habit.identity}"</p>
          </div>
        )}
      </Section>

      {/* Habit meta */}
      <Section title="Details" icon={Hash}>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Type", value: typeObj?.label },
            { label: "Frequency", value: freqObj?.label },
            { label: "Time", value: timeObj?.label },
            { label: "Difficulty", value: `${diffObj?.label} (${diffObj?.desc})` },
          ].map(m => (
            <div key={m.label} className="bg-zinc-50 rounded-lg px-3 py-2">
              <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{m.label}</p>
              <p className="text-[12px] font-semibold text-zinc-700 mt-0.5">{m.value || "—"}</p>
            </div>
          ))}
        </div>
        {topSkipReason && (
          <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg bg-amber-50 border border-amber-100">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            <p className="text-[11px] text-amber-700">
              Most common skip reason: <span className="font-bold">{topSkipReason}</span>
            </p>
          </div>
        )}
      </Section>

      {/* Notes */}
      <Section title={`Notes (${notes.length})`} icon={StickyNote}>
        {notes.length > 0 && (
          <div className="flex flex-col gap-2 mb-3">
            {notes.map(n => (
              <div key={n.id} className="bg-zinc-50 rounded-xl px-3.5 py-2.5">
                <p className="text-[12px] text-zinc-700 leading-relaxed">{n.text}</p>
                <p className="text-[10px] text-zinc-400 mt-1">{formatDateShort(n.date)}</p>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            value={noteText} onChange={e => setNoteText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addNote()}
            placeholder="Add a note..."
            className="flex-1 text-[12px] border border-zinc-200 rounded-lg px-3 py-2 outline-none placeholder:text-zinc-300 focus:border-zinc-400 transition-colors"
          />
          <button onClick={addNote}
            className="px-3 py-2 rounded-lg bg-zinc-100 text-zinc-600 text-[11px] font-semibold hover:bg-zinc-200 transition-colors"
          >
            Add
          </button>
        </div>
      </Section>

      {/* AI Insight */}
      <div className="px-5 py-4 bg-zinc-50 border-t border-zinc-100">
        <div className="flex items-center gap-2 mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">AI Habit Coach</span>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-3.5">
          <p className="text-[12px] text-zinc-600 leading-relaxed">{aiInsight}</p>
        </div>
        <div className="flex flex-wrap gap-2 mt-2.5">
          {["Improve my cue", "Shrink this habit", "Add a reward", "Find a partner"].map(s => (
            <button key={s}
              className="px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-500 text-[10px] font-semibold hover:bg-zinc-200 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </Drawer>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ANALYTICS TAB
   ═══════════════════════════════════════════════════════════════════ */

function AnalyticsTab({ habits }) {
  const avgConsistency = habits.length > 0
    ? Math.round(habits.reduce((s, h) => s + h.consistency, 0) / habits.length)
    : 0;
  const totalCheckins = habits.reduce((s, h) => s + h.history.filter(d => d.done).length, 0);
  const maxStreak = Math.max(...habits.map(h => h.streak), 0);
  const essentials = habits.filter(h => h.type === "essential").length;

  return (
    <motion.div {...fade} className="flex flex-col gap-5">
      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Avg Consistency", value: `${avgConsistency}%`, icon: BarChart3 },
          { label: "Total Check-ins", value: totalCheckins, icon: Check },
          { label: "Best Streak", value: `${maxStreak}d`, icon: Flame },
          { label: "Essential Habits", value: `${essentials}/5`, icon: Lock },
        ].map(s => (
          <Card key={s.label} className="px-4 py-4">
            <div className="w-8 h-8 rounded-xl bg-zinc-50 flex items-center justify-center mb-2">
              <s.icon className="w-4 h-4 text-zinc-500" strokeWidth={1.8} />
            </div>
            <p className="text-xl font-black text-zinc-900 tabular-nums">{s.value}</p>
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Weekly consistency chart */}
      <Card className="px-5 py-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[13px] font-bold text-zinc-900">Weekly Consistency</p>
            <p className="text-[11px] text-zinc-400">All habits combined, last 8 weeks</p>
          </div>
          <TrendingUp className="w-4 h-4 text-zinc-400" />
        </div>
        <WeeklyChart habits={habits} />
      </Card>

      {/* Per-habit heatmaps */}
      <Card className="px-5 py-5">
        <p className="text-[13px] font-bold text-zinc-900 mb-1">Activity Heatmaps</p>
        <p className="text-[11px] text-zinc-400 mb-5">12-week history per habit</p>
        <div className="flex flex-col gap-6 divide-y divide-zinc-100">
          {habits.map(h => {
            const cat = CATEGORIES.find(c => c.value === h.category);
            return (
              <div key={h.id} className="pt-4 first:pt-0">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm">{cat?.icon}</span>
                  <span className="text-[12px] font-bold text-zinc-800">{h.title}</span>
                  <span className="text-[10px] text-zinc-400">{h.consistency}% consistent</span>
                </div>
                <Heatmap history={h.history} />
              </div>
            );
          })}
        </div>
      </Card>

      {/* Habits breakdown */}
      <Card className="px-5 py-5">
        <p className="text-[13px] font-bold text-zinc-900 mb-4">Habit Performance</p>
        <div className="flex flex-col gap-3">
          {[...habits].sort((a, b) => b.consistency - a.consistency).map(h => {
            const cat = CATEGORIES.find(c => c.value === h.category);
            return (
              <div key={h.id} className="flex items-center gap-3">
                <span className="text-sm w-5 text-center">{cat?.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] font-semibold text-zinc-800 truncate">{h.title}</span>
                    <span className="text-[11px] font-black text-zinc-700 tabular-nums ml-2">{h.consistency}%</span>
                  </div>
                  <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-zinc-800"
                      initial={{ width: 0 }}
                      animate={{ width: `${h.consistency}%` }}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 w-14 text-right">
                  <Flame className="w-3 h-3 text-zinc-400" strokeWidth={2} />
                  <span className="text-[11px] font-bold text-zinc-600">{h.streak}d</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* AI Coach summary */}
      <Card className="px-5 py-5">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4 text-zinc-500" strokeWidth={1.8} />
          <p className="text-[13px] font-bold text-zinc-900">AI Habit Coach</p>
        </div>
        <div className="flex flex-col gap-2.5">
          {[
            { icon: TrendingUp, text: `Your consistency is ${avgConsistency}%. ${avgConsistency >= 75 ? "Excellent — you're building a strong foundation." : "Focus on consistency over perfection to improve this."}` },
            { icon: AlertTriangle, text: habits.filter(h => h.recoveryMode).length > 0 ? `${habits.filter(h => h.recoveryMode).length} habit(s) in recovery mode. Prioritise these until streak is restored.` : "All habits are on track. No recovery mode active." },
            { icon: Zap, text: `Your strongest habit: "${[...habits].sort((a, b) => b.consistency - a.consistency)[0]?.title || "—"}". Use this momentum to strengthen weaker ones.` },
            { icon: Star, text: `You have ${essentials} essential habit${essentials !== 1 ? "s" : ""}. ${essentials > 5 ? "Consider reducing to 3–5 for better focus." : "Good — within the recommended limit of 3–5."}` },
          ].map((insight, i) => (
            <div key={i} className="flex items-start gap-3 px-3.5 py-3 rounded-xl bg-zinc-50 border border-zinc-100">
              <insight.icon className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" strokeWidth={1.8} />
              <p className="text-[12px] text-zinc-600 leading-relaxed">{insight.text}</p>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN HABITS PAGE
   ═══════════════════════════════════════════════════════════════════ */

export default function HabitsPage() {
  const { data, actions, completionLogs, activeLifeEvent, journalEntries } = useLifeOSData();
  const navigate = useNavigate();
  const [habits, setHabits] = useState(() =>
    data?.habits?.length > 0 ? data.habits.map(toUIHabit) : INITIAL_HABITS
  );

  useEffect(() => {
    if (!data?.habits?.length) return;
    setHabits(prev => {
      const prevMap = new Map(prev.map(h => [h.id, h]));
      return data.habits.map(bh => {
        const ex = prevMap.get(bh.id);
        return ex
          ? { ...ex, streak: bh.streak, longestStreak: bh.longestStreak, completedDays: bh.completedDays, completedToday: bh.completedToday }
          : toUIHabit(bh);
      });
    });
  }, [data?.habits]);
  const [activeView, setActiveView] = useState("today");
  const [gridView, setGridView] = useState(false);
  const [filterType, setFilterType] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [showBuilder, setShowBuilder] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editHabit, setEditHabit] = useState(null);
  const [detailId, setDetailId] = useState(null);

  // ── Life Event ──
  const [showLifeEventSheet, setShowLifeEventSheet] = useState(false);
  const handleLifeEventSelected = useCallback((event, duration) => {
    actions.setLifeEvent(event, duration);
  }, [actions]);

  // ── Progression ──
  const [progressionHabit, setProgressionHabit] = useState(null);
  const [progressionNextStage, setProgressionNextStage] = useState(null);

  // ── Transformation Journal ──
  const [transformationMilestone, setTransformationMilestone] = useState(null);
  const [transformationQuestion, setTransformationQuestion] = useState("");

  // Check transformation prompt on mount
  useEffect(() => {
    const milestone = shouldAskTransformation(habits, journalEntries);
    if (milestone) {
      setTransformationMilestone(milestone);
      setTransformationQuestion(buildTransformationQuestion(milestone, journalEntries));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── System hooks ──
  const { recoveryHabit, openRecovery, closeRecovery, getStatus, getDaysMissed } = useStreakRecovery(habits);
  const { pendingMilestone, checkAndTrigger, dismissMilestone } = useMilestones();
  const { scheduleHabitNotification } = usePushNotifications();
  const [activeTimerHabitId, setActiveTimerHabitId] = useState(null);
  const activeTimerHabit = habits.find(h => h.id === activeTimerHabitId) || null;

  const today = todayISO();

  /* ── Timer complete ── */
  const handleTimerComplete = useCallback((durationSeconds) => {
    if (!activeTimerHabitId) return;

    // Store action returns { newStreak, newMilestone }
    const result = actions.completeHabitWithTimer(activeTimerHabitId, durationSeconds);

    // Update local habits state
    setHabits(prev => prev.map(h => {
      if (h.id !== activeTimerHabitId) return h;
      const completedDates = [...(h.completedDates || []).filter(d => d !== today), today];
      const newStreak = (h.streak || 0) + 1;
      const todayIdx = (h.history || []).findIndex(e => e.date === today);
      const newHistory = [...(h.history || [])];
      if (todayIdx >= 0) newHistory[todayIdx] = { ...newHistory[todayIdx], done: true };
      const updatedHabit = {
        ...h, completedDates, completedToday: true,
        streak: newStreak,
        recordStreak: Math.max(h.recordStreak || 0, newStreak),
        totalMinutes: (h.totalMinutes || 0) + Math.floor(durationSeconds / 60),
        history: newHistory,
      };
      // Check milestone with updated habit
      checkAndTrigger(updatedHabit, newStreak);
      return updatedHabit;
    }));
  }, [activeTimerHabitId, today, actions, checkAndTrigger]);

  /* ── Timer skip ── */
  const handleTimerSkip = useCallback(() => {
    if (activeTimerHabitId) {
      actions.skipHabit(activeTimerHabitId);
      setHabits(prev => prev.map(h =>
        h.id === activeTimerHabitId ? { ...h, skippedToday: true } : h,
      ));
    }
  }, [activeTimerHabitId, actions]);

  /* ── Simple check-in (no timer) ── */
  const checkIn = useCallback((id) => {
    actions.toggleHabitCompletion(id, today);
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h;
      const todayIdx = (h.history || []).findIndex(e => e.date === today);
      const newHistory = [...(h.history || [])];
      if (todayIdx >= 0) newHistory[todayIdx] = { ...newHistory[todayIdx], done: !newHistory[todayIdx].done };
      const newDone = !h.completedToday;
      const newStreak = newDone ? (h.streak || 0) + 1 : Math.max(0, (h.streak || 0) - 1);
      if (newDone) {
        const completedDates = [...(h.completedDates || []).filter(d => d !== today), today];
        const updated = { ...h, completedToday: true, history: newHistory, streak: newStreak, completedDates };
        checkAndTrigger(updated, newStreak);

        // Identity reinforcement — har complete bo'lgan odat identitet sanoqchisini oshiradi
        if (h.identityStatement) {
          const result = recordIdentityAction(h.identityStatement);
          const msg = buildReinforcementMessage(result);
          if (msg) {
            toast.success(msg, { duration: 3000 });
          }
        }

        return updated;
      }
      return { ...h, completedToday: false, history: newHistory, streak: newStreak };
    }));
  }, [today, actions, checkAndTrigger]);

  /* ── Skip ── */
  const skip = useCallback((id, reason) => {
    actions.skipHabit(id, reason);
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h;
      const todayIdx = (h.history || []).findIndex(e => e.date === today);
      const newHistory = [...(h.history || [])];
      if (todayIdx >= 0) newHistory[todayIdx] = { ...newHistory[todayIdx], skipped: true, reason };
      return { ...h, skippedToday: true, history: newHistory };
    }));
  }, [today, actions]);

  /* ── Recovery restart ── */
  const handleRecoveryRestart = useCallback(() => {
    if (!recoveryHabit) return;
    actions.enterRecoveryMode(recoveryHabit.id);
    setActiveTimerHabitId(recoveryHabit.id);
  }, [recoveryHabit, actions]);

  /* ── Streak Freeze ── */
  const handleUseFreeze = useCallback((habitId) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== habitId) return h;
      const frozen = applyFreeze(h, today);
      // Streakni saqlab qolamiz — completedDates ga "freeze" markeri qo'shilmaydi,
      // lekin freezeUsedDates orqali UX ko'rsatadi
      return frozen;
    }));
    toast.success("❄️ Streak Freeze ishlatildi — rekordingiz saqlanib turibdi", { duration: 3500 });
  }, [today]);

  /* ── Save from quick modal ── */
  const saveHabit = useCallback((formData) => {
    if (editHabit) {
      setHabits(prev => prev.map(h => h.id === editHabit.id ? { ...h, ...formData } : h));
      setEditHabit(null);
    } else {
      storeActions.addHabit(formData.title || formData.name || "Yangi odat");
      const history = generateHistory(84, 0);
      const newHabit = {
        id: uid(), ...formData,
        streak: 0, longestStreak: 0, consistency: 0,
        completedToday: false, skippedToday: false, recoveryMode: false,
        completedDates: [], achievedMilestones: [], recordStreak: 0,
        history, notes: [],
      };
      setHabits(prev => [newHabit, ...prev]);
    }
  }, [editHabit, storeActions]);

  /* ── Save from HabitBuilder wizard ── */
  const handleSaveBuilder = useCallback((habitData) => {
    const history = generateHistory(84, 0);
    const timeStr = habitData.timeOfDay || "";
    const timeVal =
      timeStr.includes("Erta") || timeStr.includes("tong") ? "morning" :
      timeStr.includes("Kech") || timeStr.includes("kech") ? "evening" :
      timeStr.includes("Tushan") || timeStr.includes("keyin") ? "afternoon" : "flexible";

    const newHabit = {
      id: habitData.id || uid(),
      title: habitData.name,
      name: habitData.name,
      category: habitData.category,
      type: "essential",
      frequency: habitData.frequency,
      time: timeVal,
      difficulty: "medium",
      identity: habitData.identityStatement ? `Men — ${habitData.identityStatement}` : "",
      identityStatement: habitData.identityStatement,
      cue: habitData.cueValue || "",
      cueValue: habitData.cueValue || "",
      cueType: habitData.cueType,
      location: habitData.location || "",
      afterCue: habitData.afterCue || "",
      scheduledTime: habitData.scheduledTime,
      customDays: habitData.customDays,
      minimalVersion: habitData.minimalVersion,
      minimalDuration: habitData.minimalDuration,
      emoji: habitData.emoji,
      whys: habitData.whys,
      linkedHabit: habitData.linkedHabit,
      milestoneRewards: habitData.milestoneRewards,
      rewardType: habitData.rewardType,
      rewardDescription: habitData.rewardDescription,
      completedToday: false,
      recoveryMode: false,
      completedDates: [],
      achievedMilestones: [],
      recordStreak: 0,
      totalMinutes: 0,
      skipCount: 0,
      recoveryCount: 0,
      isAutomatic: false,
      streak: 0,
      longestStreak: 0,
      consistency: 0,
      history,
      notes: [],
    };

    setHabits(prev => [newHabit, ...prev]);
    actions.addLocalHabit(newHabit);
    // Schedule notification if time-based
    if (newHabit.cueType === "time" && newHabit.scheduledTime) {
      scheduleHabitNotification(newHabit);
    }
    setShowBuilder(false);
  }, [actions, scheduleHabitNotification]);

  const deleteHabit = useCallback((id) => {
    storeActions.removeHabit(id);
    setHabits(prev => prev.filter(h => h.id !== id));
    if (detailId === id) setDetailId(null);
  }, [detailId, storeActions]);

  const updateHabit = useCallback((id, updates) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
  }, []);

  const handleEdit = useCallback((id) => {
    setEditHabit(habits.find(h => h.id === id) || null);
    setCreateOpen(true);
  }, [habits]);

  /* ── Filtered habits ── */
  const filtered = useMemo(() => {
    let list = [...habits];
    if (activeView === "today") list = list.filter(h => !h.completedToday);
    if (filterType) list = list.filter(h => h.type === filterType);
    if (filterCat)  list = list.filter(h => h.category === filterCat);
    return list;
  }, [habits, activeView, filterType, filterCat]);

  const completedToday = habits.filter(h => h.completedToday);
  const automaticHabits = habits.filter(h => h.isAutomatic || h.achievedMilestones?.includes(66));
  const detailHabit = detailId ? habits.find(h => h.id === detailId) : null;

  return (
    <div className="flex flex-col gap-5 p-4 lg:p-6 max-w-[960px]">

      {/* ── HEADER ── */}
      <motion.div {...fade} className="flex items-end justify-between">
        <div>
          <p className="text-[10px] font-black tracking-[0.3em] uppercase text-zinc-400">System</p>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 mt-0.5">Habits</h1>
          <p className="text-[13px] text-zinc-400 mt-0.5">Small votes. Big identity.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/journal")}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-zinc-100 text-zinc-700 text-[12px] font-semibold hover:bg-zinc-200 active:scale-[0.97] transition-all"
          >
            📖 Jurnal
          </button>
          <button
            onClick={() => setShowLifeEventSheet(true)}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-amber-50 text-amber-700 text-[12px] font-semibold hover:bg-amber-100 active:scale-[0.97] transition-all border border-amber-200"
          >
            ✈️ Hayot
          </button>
          <button
            onClick={() => navigate("/habits/library")}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-zinc-100 text-zinc-700 text-[12px] font-semibold hover:bg-zinc-200 active:scale-[0.97] transition-all"
          >
            📚 Kutubxona
          </button>
          <button onClick={() => setShowBuilder(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-900 text-white text-[12px] font-bold hover:bg-zinc-800 active:scale-[0.97] transition-all"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} /> Yangi odat
          </button>
        </div>
      </motion.div>

      {/* ── OVERVIEW HERO ── */}
      <OverviewHeader habits={habits} onAddHabit={() => setShowBuilder(true)} />

      {/* ── INSIGHTS (shown when enough data) ── */}
      <InsightsSection habits={habits} completionLogs={completionLogs} />

      {/* ── LIFE EVENT BANNER ── */}
      <AnimatePresence>
        {activeLifeEvent && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2.5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl"
          >
            <span className="text-[18px]">{activeLifeEvent.emoji}</span>
            <div className="flex-1">
              <p className="text-[12px] font-semibold text-amber-800">
                {activeLifeEvent.label} rejimi
              </p>
              <p className="text-[11px] text-amber-600 mt-0.5">
                Odatlar moslashtirildi · {activeLifeEvent.endDate
                  ? `${Math.max(0, Math.ceil((new Date(activeLifeEvent.endDate) - new Date()) / (1000*60*60*24)))} kun qoldi`
                  : "Tayyor bo'lganda qaytamiz"}
              </p>
            </div>
            <button
              onClick={() => actions.clearLifeEvent()}
              className="text-[11px] text-amber-600 font-medium px-2.5 py-1.5 bg-amber-100 rounded-lg"
            >
              Qaytish
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── VIEW TABS + CONTROLS ── */}
      <Card className="px-4 py-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-zinc-100 rounded-xl p-1">
            {VIEWS.map(v => (
              <button key={v.key} onClick={() => setActiveView(v.key)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all",
                  activeView === v.key ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700",
                )}
              >
                {v.label}
                {v.key === "today" && habits.filter(h => !h.completedToday).length > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-zinc-900 text-white text-[9px] font-black">
                    {habits.filter(h => !h.completedToday).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          {activeView === "all" && (
            <>
              <Dropdown
                trigger={
                  <button className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all",
                    filterType ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200",
                  )}>
                    <Filter className="w-3.5 h-3.5" />
                    {HABIT_TYPES.find(t => t.value === filterType)?.label || "Type"}
                  </button>
                }
                align="right"
              >
                <DropdownItem label="All types" onClick={() => setFilterType("")} />
                {HABIT_TYPES.map(t => (
                  <DropdownItem key={t.value} label={t.label}
                    icon={filterType === t.value ? Check : undefined}
                    onClick={() => setFilterType(t.value === filterType ? "" : t.value)}
                  />
                ))}
              </Dropdown>
              <div className="flex items-center gap-0.5 bg-zinc-100 rounded-xl p-0.5">
                <IconBtn icon={List} size="w-8 h-8" active={!gridView} onClick={() => setGridView(false)} label="List view" />
                <IconBtn icon={LayoutGrid} size="w-8 h-8" active={gridView} onClick={() => setGridView(true)} label="Grid view" />
              </div>
            </>
          )}
        </div>
      </Card>

      {/* ══════════════════════════════════════════
          TODAY VIEW
         ══════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        {activeView === "today" && (
          <motion.div key="today" {...fade} className="flex flex-col gap-4">
            {filtered.length > 0 ? (
              <Card className="overflow-hidden">
                <div className="px-5 py-3 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                  <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                    Remaining · {filtered.length}
                  </p>
                  <Flame className="w-3.5 h-3.5 text-zinc-400" />
                </div>
                {filtered.map(h => (
                  <TodayHabitRow
                    key={h.id} habit={h}
                    onCheck={checkIn} onSkip={skip}
                    onDetails={setDetailId} onEdit={handleEdit}
                    onStartTimer={setActiveTimerHabitId}
                    onOpenRecovery={openRecovery}
                    streakStatus={getStatus(h)}
                  />
                ))}
              </Card>
            ) : (
              <EmptyState
                icon={CheckCircle2}
                title="Bugun hammasi bajarildi!"
                desc="Ajoyib. Har bir bajarilish o'zingizga bo'lgan ovozdir."
              />
            )}

            {completedToday.length > 0 && (
              <Card className="overflow-hidden">
                <div className="px-5 py-3 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                  <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                    Bajarildi · {completedToday.length}
                  </p>
                  <Check className="w-3.5 h-3.5 text-zinc-400" />
                </div>
                {completedToday.map(h => (
                  <TodayHabitRow
                    key={h.id} habit={h}
                    onCheck={checkIn} onSkip={skip}
                    onDetails={setDetailId} onEdit={handleEdit}
                    onStartTimer={setActiveTimerHabitId}
                    onOpenRecovery={openRecovery}
                    streakStatus={getStatus(h)}
                  />
                ))}
              </Card>
            )}

            {/* Automatic habits section */}
            {automaticHabits.length > 0 && (
              <Card className="overflow-hidden">
                <div className="px-5 py-3 border-b border-zinc-100 bg-violet-50/50 flex items-center justify-between">
                  <p className="text-[11px] font-bold text-violet-500 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500 inline-block" />
                    Avtomatik odatlar · {automaticHabits.length}
                  </p>
                  <span className="text-[10px] text-violet-400">66+ kun</span>
                </div>
                {automaticHabits.map(h => (
                  <TodayHabitRow
                    key={h.id} habit={h}
                    onCheck={checkIn} onSkip={skip}
                    onDetails={setDetailId} onEdit={handleEdit}
                    onStartTimer={setActiveTimerHabitId}
                    onOpenRecovery={openRecovery}
                    streakStatus={getStatus(h)}
                  />
                ))}
              </Card>
            )}
          </motion.div>
        )}

        {/* ══════════════════════════════════════════
            ALL HABITS VIEW
           ══════════════════════════════════════════ */}
        {activeView === "all" && (
          <motion.div key="all" {...fade}>
            {habits.length === 0 ? (
              <EmptyState
                icon={Repeat} title="No habits yet"
                desc="Start small. One habit done consistently beats ten done occasionally."
                action={
                  <button onClick={() => { setEditHabit(null); setCreateOpen(true); }}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-900 text-white text-[12px] font-bold hover:bg-zinc-800 transition-all"
                  >
                    <Plus className="w-4 h-4" strokeWidth={2.5} /> Create First Habit
                  </button>
                }
              />
            ) : gridView ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {habits.map(h => (
                  <HabitCard key={h.id} habit={h}
                    onCheck={checkIn} onDetails={setDetailId}
                    onEdit={handleEdit} onDelete={deleteHabit}
                  />
                ))}
              </div>
            ) : (
              <Card className="overflow-hidden">
                <div className="px-5 py-3 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                  <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                    All Habits · {habits.length}
                  </p>
                  <p className="text-[10px] text-zinc-400">
                    {habits.filter(h => h.type === "essential").length} essential · {habits.filter(h => h.type === "optional").length} optional
                  </p>
                </div>
                {habits.map(h => (
                  <TodayHabitRow
                    key={h.id} habit={h}
                    onCheck={checkIn} onSkip={skip}
                    onDetails={setDetailId} onEdit={handleEdit}
                    onStartTimer={setActiveTimerHabitId}
                    onOpenRecovery={openRecovery}
                    streakStatus={getStatus(h)}
                  />
                ))}
              </Card>
            )}
          </motion.div>
        )}

        {/* ══════════════════════════════════════════
            ANALYTICS VIEW
           ══════════════════════════════════════════ */}
        {activeView === "analytics" && (
          <motion.div key="analytics" {...fade}>
            <AnalyticsTab habits={habits} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MODALS & DRAWERS ── */}
      <HabitCreationModal
        open={createOpen}
        onClose={() => { setCreateOpen(false); setEditHabit(null); }}
        onSave={saveHabit}
        editHabit={editHabit}
      />

      {/* ── Habit Builder Wizard ── */}
      <AnimatePresence>
        {showBuilder && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="fixed inset-0 z-50"
          >
            <HabitBuilder
              onSave={handleSaveBuilder}
              onCancel={() => setShowBuilder(false)}
              existingHabits={habits}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <HabitDetailDrawer
        habit={detailHabit}
        open={!!detailId}
        onClose={() => setDetailId(null)}
        onCheck={checkIn}
        onSkip={skip}
        onUpdate={updateHabit}
      />

      {/* ── ACTIVE HABIT TIMER (Friction Engine) ── */}
      <AnimatePresence>
        {activeTimerHabit && (
          <ActiveHabitTimer
            key={activeTimerHabitId}
            habit={activeTimerHabit}
            onComplete={handleTimerComplete}
            onSkip={handleTimerSkip}
            onClose={() => setActiveTimerHabitId(null)}
          />
        )}
      </AnimatePresence>

      {/* ── STREAK RECOVERY SHEET ── */}
      <AnimatePresence>
        {recoveryHabit && (
          <StreakRecoverySheet
            key={recoveryHabit.id}
            habit={recoveryHabit}
            daysMissed={getDaysMissed(recoveryHabit)}
            onClose={closeRecovery}
            onRestart={handleRecoveryRestart}
            onUseFreeze={() => handleUseFreeze(recoveryHabit.id)}
          />
        )}
      </AnimatePresence>

      {/* ── MILESTONE MODAL (66 kun nishoni) ── */}
      <AnimatePresence>
        {pendingMilestone && (
          <MilestoneModal
            key={pendingMilestone.milestone}
            milestone={pendingMilestone.milestone}
            habit={pendingMilestone.habit}
            config={pendingMilestone.config}
            onClose={() => {
              actions.acknowledgeMilestone(pendingMilestone.habit.id, pendingMilestone.milestone);
              dismissMilestone();
            }}
          />
        )}
      </AnimatePresence>

      {/* ── LIFE EVENT SHEET ── */}
      <AnimatePresence>
        {showLifeEventSheet && (
          <LifeEventSheet
            onClose={() => setShowLifeEventSheet(false)}
            onEventSelected={handleLifeEventSelected}
          />
        )}
      </AnimatePresence>

      {/* ── PROGRESSION OFFER MODAL ── */}
      <AnimatePresence>
        {progressionHabit && progressionNextStage && (
          <ProgressionOfferModal
            habit={progressionHabit}
            nextStage={progressionNextStage}
            onAccept={() => {
              actions.acceptProgression(progressionHabit.id, progressionNextStage.id);
              setProgressionHabit(null);
              setProgressionNextStage(null);
            }}
            onDecline={() => {
              actions.declineProgression(progressionHabit.id, progressionNextStage.id);
              setProgressionHabit(null);
              setProgressionNextStage(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* ── TRANSFORMATION PROMPT MODAL ── */}
      <AnimatePresence>
        {transformationMilestone && (
          <TransformationPromptModal
            milestone={transformationMilestone}
            question={transformationQuestion}
            onAnswer={(answer) => {
              actions.addJournalEntry(transformationMilestone, transformationQuestion, answer);
              setTransformationMilestone(null);
            }}
            onLater={() => {
              actions.snoozeJournalEntry(transformationMilestone);
              setTransformationMilestone(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
