import { useState, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Plus, Check, X, Clock, Flame, Target, Zap, Brain, Sun,
  Moon, Coffee, ChevronDown, Edit3, Inbox, Calendar, TrendingUp,
  Star, AlarmClock, Layers, ArrowRight, ChevronRight, Activity,
  CheckCircle2, Circle, AlertCircle, Award, Repeat, List,
  Timer, Sparkles, Lock, Sunset
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════════ */

const ENERGY_LEVELS = [
  { value: 1, label: "Holdan"  },
  { value: 2, label: "Past"    },
  { value: 3, label: "O'rta"  },
  { value: 4, label: "Yaxshi" },
  { value: 5, label: "Cho'qq" },
];

const BLOCK_TYPES = [
  { value: "focus",   label: "Deep Work",  icon: Brain,    color: "bg-zinc-900 text-white" },
  { value: "meeting", label: "Uchrashuv", icon: Calendar, color: "bg-zinc-700 text-white" },
  { value: "task",    label: "Vazifa",    icon: Check,    color: "bg-zinc-200 text-zinc-900" },
  { value: "break",   label: "Dam",       icon: Coffee,   color: "bg-zinc-100 text-zinc-600" },
  { value: "habit",   label: "Odat",      icon: Repeat,   color: "bg-zinc-100 text-zinc-600" },
];

const GOAL_LINKS = [
  "Ingliz tili B2",
  "Startup launch",
  "30kg vazn yo'qotish",
  "Kitob yozish",
  "Marathonga tayyorgarlik",
];

const SEED_HABITS = [
  { id: "h1", title: "Ertalab mashq",   icon: "🏃", completedToday: true,  streak: 12 },
  { id: "h2", title: "30 daqiqa o'qish", icon: "📚", completedToday: false, streak: 5  },
  { id: "h3", title: "Meditatsiya",     icon: "🧘", completedToday: false, streak: 0  },
  { id: "h4", title: "Jurnal yozish",   icon: "📝", completedToday: false, streak: 3  },
  { id: "h5", title: "Suv 2L",          icon: "💧", completedToday: true,  streak: 8  },
];

const CAPTURE_TAGS = ["g'oya", "vazifa", "savol", "yod olish", "keyinroq"];

function getToday() {
  const d = new Date();
  const days   = ["Yakshanba","Dushanba","Seshanba","Chorshanba","Payshanba","Juma","Shanba"];
  const months = ["Yanvar","Fevral","Mart","Aprel","May","Iyun","Iyul","Avgust","Sentabr","Oktabr","Noyabr","Dekabr"];
  const start  = new Date(d.getFullYear(), 0, 1);
  const weekNum = Math.ceil((((d - start) / 86400000) + start.getDay() + 1) / 7);
  return { dayName: days[d.getDay()], day: d.getDate(), month: months[d.getMonth()], year: d.getFullYear(), weekNum, hour: d.getHours() };
}

const TODAY = getToday();

function greeting(h) {
  if (h < 6)  return "Tungi seans";
  if (h < 12) return "Xayrli tong";
  if (h < 17) return "Xayrli kun";
  if (h < 21) return "Xayrli kech";
  return "Tungi seans";
}

function getScoreMessage(score) {
  if (score >= 90) return { msg: "Ajoyib kun! 🏆", sub: "Mukammal natija" };
  if (score >= 75) return { msg: "Zo'r ish! 🔥",   sub: "Maqsad yo'lida davom et" };
  if (score >= 55) return { msg: "Yaxshi boshlang'ich", sub: "Yana bir qadamga qodir" };
  if (score >= 35) return { msg: "Davom eting!",    sub: "Har qadam muhim" };
  return { msg: "Boshla!",                           sub: "Birinchi qadamni qo'y" };
}

/* ═══════════════════════════════════════════════════════════════════
   ANIMATIONS
   ═══════════════════════════════════════════════════════════════════ */

const fadeUp  = { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35, ease: "easeOut" } };
const slideIn = { initial: { opacity: 0, x: -10 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 10 }, transition: { duration: 0.2 } };

/* ═══════════════════════════════════════════════════════════════════
   SCORE RING
   ═══════════════════════════════════════════════════════════════════ */

function ScoreRing({ score, size = 96 }) {
  const r    = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const off  = circ - (score / 100) * circ;
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e4e4e7" strokeWidth={7} />
        <motion.circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke={score >= 80 ? "#18181b" : score >= 50 ? "#52525b" : "#a1a1aa"}
          strokeWidth={7} strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: off }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-zinc-900 leading-none">{score}</span>
        <span className="text-[9px] font-bold text-zinc-400 tracking-widest uppercase mt-0.5">Ball</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION
   ═══════════════════════════════════════════════════════════════════ */

function Section({ children, className = "", noPad = false }) {
  return (
    <motion.div {...fadeUp} className={cn("bg-white border border-zinc-200 rounded-2xl", noPad ? "" : "p-5", className)}>
      {children}
    </motion.div>
  );
}

function SectionHead({ icon: Icon, title, badge, action }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-zinc-600" strokeWidth={2.2} />
        </div>
        <span className="text-sm font-semibold text-zinc-900">{title}</span>
        {badge !== undefined && (
          <span className="text-xs font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">{badge}</span>
        )}
      </div>
      {action}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CHECKBOX
   ═══════════════════════════════════════════════════════════════════ */

function CB({ checked, onChange, size = "md" }) {
  const cls = size === "lg" ? "w-6 h-6 rounded-md" : size === "sm" ? "w-4 h-4 rounded" : "w-5 h-5 rounded-md";
  const ico = size === "lg" ? "w-3.5 h-3.5" : size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3";
  return (
    <button
      onClick={onChange}
      className={cn("border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200", cls,
        checked ? "bg-zinc-900 border-zinc-900" : "border-zinc-300 hover:border-zinc-500"
      )}
    >
      {checked && <Check className={cn(ico, "text-white")} strokeWidth={3} />}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MIT TASK ITEM
   ═══════════════════════════════════════════════════════════════════ */

function MITItem({ task, index, onToggle, onRemove }) {
  const numColors = ["text-zinc-900", "text-zinc-500", "text-zinc-400"];
  return (
    <motion.div layout {...slideIn} className="flex items-center gap-3 group py-1">
      <span className={cn("text-lg font-black w-5 text-center leading-none", numColors[index] ?? "text-zinc-400")}>
        {index + 1}
      </span>
      <CB checked={task.done} onChange={() => onToggle(task.id)} size="lg" />
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium leading-tight transition-all", task.done ? "line-through text-zinc-400" : "text-zinc-900")}>
          {task.text}
        </p>
        {task.goal && (
          <p className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-1">
            <Target className="w-2.5 h-2.5" />{task.goal}
          </p>
        )}
      </div>
      {task.estimate && (
        <span className="text-[11px] text-zinc-400 flex items-center gap-0.5 flex-shrink-0">
          <Clock className="w-3 h-3" />{task.estimate}m
        </span>
      )}
      <button onClick={() => onRemove(task.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded">
        <X className="w-3.5 h-3.5 text-zinc-400 hover:text-zinc-700" />
      </button>
    </motion.div>
  );
}

function MITAddForm({ onAdd }) {
  const [text, setText]         = useState("");
  const [goal, setGoal]         = useState("");
  const [estimate, setEstimate] = useState("");
  const [showExtra, setShowExtra] = useState(false);

  const handleAdd = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd({ text: trimmed, goal: goal || null, estimate: estimate ? Number(estimate) : null });
    setText(""); setGoal(""); setEstimate(""); setShowExtra(false);
  };

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center gap-2">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAdd()}
          placeholder="Bugungi eng muhim vazifa..."
          className="flex-1 text-sm bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 outline-none focus:border-zinc-500 transition-colors placeholder:text-zinc-300"
        />
        <button
          onClick={() => setShowExtra(v => !v)}
          className="w-9 h-9 rounded-xl border border-zinc-200 bg-white flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:border-zinc-400 transition-colors"
        >
          <ChevronDown className={cn("w-4 h-4 transition-transform", showExtra && "rotate-180")} />
        </button>
        <button
          onClick={handleAdd}
          disabled={!text.trim()}
          className="w-9 h-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <AnimatePresence>
        {showExtra && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex gap-2 pt-1">
              <select
                value={goal}
                onChange={e => setGoal(e.target.value)}
                className="flex-1 text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1.5 outline-none focus:border-zinc-400 text-zinc-600"
              >
                <option value="">Maqsadga bog'lash...</option>
                {GOAL_LINKS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={estimate}
                  onChange={e => setEstimate(e.target.value)}
                  placeholder="min"
                  min="5" max="240"
                  className="w-16 text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1.5 outline-none focus:border-zinc-400 text-center"
                />
                <span className="text-[11px] text-zinc-400">min</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TIME BLOCK
   ═══════════════════════════════════════════════════════════════════ */

function TimeBlock({ block, onToggle, onRemove }) {
  const type = BLOCK_TYPES.find(t => t.value === block.type) ?? BLOCK_TYPES[0];
  const Icon = type.icon;
  return (
    <motion.div layout {...slideIn}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 group border transition-all",
        block.done ? "border-zinc-100 bg-zinc-50 opacity-60" : "border-zinc-200 bg-white"
      )}
    >
      <CB checked={block.done} onChange={() => onToggle(block.id)} size="sm" />
      <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0", type.color)}>
        <Icon className="w-3 h-3" strokeWidth={2.5} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium", block.done && "line-through text-zinc-400")}>{block.title}</p>
        <p className="text-[11px] text-zinc-400">{type.label}</p>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {block.start && <span className="text-[11px] text-zinc-400">{block.start}</span>}
        <Clock className="w-3 h-3 text-zinc-400" />
        <span className="text-[11px] font-medium text-zinc-500">{block.duration}m</span>
      </div>
      <button onClick={() => onRemove(block.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1">
        <X className="w-3 h-3 text-zinc-400 hover:text-zinc-700" />
      </button>
    </motion.div>
  );
}

function BlockAddForm({ onAdd }) {
  const [title,    setTitle]    = useState("");
  const [type,     setType]     = useState("focus");
  const [duration, setDuration] = useState(50);
  const [start,    setStart]    = useState("");

  const handleAdd = () => {
    if (!title.trim()) return;
    onAdd({ title: title.trim(), type, duration, start: start || null });
    setTitle(""); setStart("");
  };

  return (
    <div className="mt-3 space-y-2.5 pt-3 border-t border-zinc-100">
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => e.key === "Enter" && handleAdd()}
        placeholder="Blok nomi..."
        className="w-full text-sm bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 outline-none focus:border-zinc-400 placeholder:text-zinc-300"
      />
      <div className="flex gap-1 flex-wrap">
        {BLOCK_TYPES.map(bt => (
          <button
            key={bt.value}
            onClick={() => setType(bt.value)}
            className={cn(
              "text-[11px] font-medium px-2.5 py-1.5 rounded-lg border transition-colors",
              type === bt.value ? "bg-zinc-900 text-white border-zinc-900" : "border-zinc-200 text-zinc-500 hover:border-zinc-400"
            )}
          >
            {bt.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        {[25, 50, 90].map(d => (
          <button
            key={d}
            onClick={() => setDuration(d)}
            className={cn(
              "text-[11px] font-medium px-2.5 py-1.5 rounded-lg border transition-colors",
              duration === d ? "bg-zinc-800 text-white border-zinc-800" : "border-zinc-200 text-zinc-500 hover:border-zinc-300"
            )}
          >
            {d}m
          </button>
        ))}
        <input
          type="time"
          value={start}
          onChange={e => setStart(e.target.value)}
          className="flex-1 text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1.5 outline-none focus:border-zinc-400 text-zinc-600"
        />
        <button
          onClick={handleAdd}
          disabled={!title.trim()}
          className="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center hover:bg-zinc-700 disabled:opacity-30 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ENERGY CHECK-IN
   ═══════════════════════════════════════════════════════════════════ */

function EnergyCheckIn({ label, icon: Icon, value, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5 w-32">
        <Icon className="w-3.5 h-3.5 text-zinc-400" />
        <span className="text-xs text-zinc-500">{label}</span>
      </div>
      <div className="flex gap-1.5">
        {ENERGY_LEVELS.map(lvl => (
          <button
            key={lvl.value}
            onClick={() => onChange(value === lvl.value ? null : lvl.value)}
            className={cn(
              "w-7 h-7 rounded-lg border-2 text-[10px] font-bold transition-all",
              value === lvl.value
                ? "border-zinc-900 bg-zinc-900 text-white scale-105"
                : "border-zinc-200 text-zinc-400 hover:border-zinc-400"
            )}
          >
            {lvl.value}
          </button>
        ))}
      </div>
      {value !== null && value !== undefined && (
        <span className="text-xs text-zinc-500">{ENERGY_LEVELS.find(l => l.value === value)?.label}</span>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SCORE BREAKDOWN
   ═══════════════════════════════════════════════════════════════════ */

function ScoreBreakdown({ items }) {
  return (
    <div className="space-y-2 mt-4">
      {items.map(item => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="text-[11px] text-zinc-400 w-28 flex-shrink-0">{item.label}</span>
          <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-zinc-900 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${item.pct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <span className="text-[11px] font-semibold text-zinc-600 w-10 text-right flex-shrink-0">
            {item.score}/{item.max}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CAPTURE INBOX ITEM
   ═══════════════════════════════════════════════════════════════════ */

function CaptureItem({ item, onRemove }) {
  return (
    <motion.div layout {...slideIn} className="flex items-start gap-2.5 group py-1.5">
      <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 mt-1.5 flex-shrink-0" />
      <p className="flex-1 text-sm text-zinc-700 leading-snug">{item.text}</p>
      {item.tag && (
        <span className="text-[10px] font-medium bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full flex-shrink-0">
          {item.tag}
        </span>
      )}
      <button onClick={() => onRemove(item.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 mt-0.5">
        <X className="w-3 h-3 text-zinc-400 hover:text-zinc-700" />
      </button>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */

export default function DailyPlannerPage() {
  /* MITs */
  const [mitTasks, setMITTasks] = useState([]);
  const addMIT    = useCallback((task) => {
    if (mitTasks.length >= 3) return;
    setMITTasks(prev => [...prev, { id: Date.now(), done: false, ...task }]);
  }, [mitTasks.length]);
  const toggleMIT = useCallback(id => setMITTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t)), []);
  const removeMIT = useCallback(id => setMITTasks(prev => prev.filter(t => t.id !== id)), []);

  /* Supporting tasks */
  const [tasks,     setTasks]     = useState([
    { id: 1, text: "Email inbox tozalash",         done: false },
    { id: 2, text: "Haftalik hisobot tayyorlash",  done: true  },
  ]);
  const [taskInput, setTaskInput] = useState("");
  const addTask    = useCallback(() => {
    const t = taskInput.trim(); if (!t) return;
    setTasks(prev => [...prev, { id: Date.now(), text: t, done: false }]);
    setTaskInput("");
  }, [taskInput]);
  const toggleTask = useCallback(id => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t)), []);
  const removeTask = useCallback(id => setTasks(prev => prev.filter(t => t.id !== id)), []);

  /* Time blocks */
  const [blocks, setBlocks] = useState([
    { id: 1, title: "Ingliz tili darsi",  type: "focus",   duration: 50, start: "09:00", done: false },
    { id: 2, title: "Jamoa uchrashuvi",  type: "meeting", duration: 60, start: "10:30", done: false },
    { id: 3, title: "Deep work — loyiha", type: "focus",   duration: 90, start: "14:00", done: false },
  ]);
  const addBlock    = useCallback((block) => setBlocks(prev => [...prev, { id: Date.now(), done: false, ...block }]), []);
  const toggleBlock = useCallback(id => setBlocks(prev => prev.map(b => b.id === id ? { ...b, done: !b.done } : b)), []);
  const removeBlock = useCallback(id => setBlocks(prev => prev.filter(b => b.id !== id)), []);

  /* Habits */
  const [habits, setHabits] = useState(SEED_HABITS);
  const toggleHabit = useCallback(id => setHabits(prev => prev.map(h => h.id === id ? { ...h, completedToday: !h.completedToday } : h)), []);

  /* Energy */
  const [energyMorning,   setEnergyMorning]   = useState(null);
  const [energyAfternoon, setEnergyAfternoon] = useState(null);
  const [energyEvening,   setEnergyEvening]   = useState(null);

  /* Capture inbox */
  const [captures,    setCaptures]    = useState([
    { id: 1, text: "Yangi kitob g'oyasi — The Art of Possibility", tag: "g'oya"  },
    { id: 2, text: "Haftasiga 3 marta yugurish jadvalini tuzish",  tag: "vazifa" },
  ]);
  const [captureInput, setCaptureInput] = useState("");
  const [captureTag,   setCaptureTag]   = useState("g'oya");
  const addCapture    = useCallback(() => {
    const t = captureInput.trim(); if (!t) return;
    setCaptures(prev => [...prev, { id: Date.now(), text: t, tag: captureTag }]);
    setCaptureInput("");
  }, [captureInput, captureTag]);
  const removeCapture = useCallback(id => setCaptures(prev => prev.filter(c => c.id !== id)), []);

  /* Intention + reflection */
  const [intention,    setIntention]    = useState("");
  const [reflWin,      setReflWin]      = useState("");
  const [reflBlock,    setReflBlock]    = useState("");
  const [reflTomorrow, setReflTomorrow] = useState("");

  /* Daily Score */
  const { score, breakdown } = useMemo(() => {
    const mitDone  = mitTasks.filter(t => t.done).length;
    const mitTotal = Math.max(mitTasks.length, 1);
    const mitScore = Math.round((mitDone / mitTotal) * 35);

    const habDone  = habits.filter(h => h.completedToday).length;
    const habTotal = habits.length;
    const habScore = Math.round((habDone / habTotal) * 25);

    const blkDone  = blocks.filter(b => b.done).length;
    const blkTotal = Math.max(blocks.length, 1);
    const blkScore = Math.round((blkDone / blkTotal) * 25);

    const reflFilled = [reflWin, reflBlock, reflTomorrow].filter(v => v.trim().length > 10).length;
    const reflScore  = Math.round((reflFilled / 3) * 15);

    return {
      score: mitScore + habScore + blkScore + reflScore,
      breakdown: [
        { label: "Muhim vazifalar", score: mitScore, max: 35, pct: (mitScore / 35) * 100 },
        { label: "Odatlar",         score: habScore, max: 25, pct: (habScore / 25) * 100 },
        { label: "Fokus bloklari",  score: blkScore, max: 25, pct: (blkScore / 25) * 100 },
        { label: "Refleksiya",      score: reflScore, max: 15, pct: (reflScore / 15) * 100 },
      ],
    };
  }, [mitTasks, habits, blocks, reflWin, reflBlock, reflTomorrow]);

  const { msg: scoreMsg, sub: scoreSub } = getScoreMessage(score);

  /* UI state */
  const [showBlockForm,    setShowBlockForm]    = useState(false);
  const [showCapturePanel, setShowCapturePanel] = useState(false);

  /* Avg energy helper */
  const energyVals   = [energyMorning, energyAfternoon, energyEvening].filter(Boolean);
  const avgEnergy    = energyVals.length ? (energyVals.reduce((a, b) => a + b, 0) / energyVals.length).toFixed(1) : null;

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-4">

        {/* ── HEADER ── */}
        <motion.div {...fadeUp} className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest">
              {TODAY.dayName}, {TODAY.day} {TODAY.month} · {TODAY.weekNum}-hafta
            </p>
            <h1 className="text-2xl font-black text-zinc-900 mt-0.5 tracking-tight">Kunlik reja</h1>
            <p className="text-xs text-zinc-400 mt-0.5">{greeting(TODAY.hour)}</p>
          </div>
          <button
            onClick={() => setShowCapturePanel(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 bg-white text-xs font-medium text-zinc-600 hover:border-zinc-400 transition-colors mt-1"
          >
            <Inbox className="w-3.5 h-3.5" />
            Capture
            {captures.length > 0 && (
              <span className="bg-zinc-900 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {captures.length}
              </span>
            )}
          </button>
        </motion.div>

        {/* ── DAILY SCORE HERO ── */}
        <Section noPad>
          <div className="p-5 flex items-center gap-5">
            <ScoreRing score={score} size={100} />
            <div className="flex-1 min-w-0">
              <p className="text-lg font-black text-zinc-900 leading-tight">{scoreMsg}</p>
              <p className="text-xs text-zinc-400 mt-0.5">{scoreSub}</p>
              {intention && (
                <div className="mt-2 flex items-start gap-1.5">
                  <Star className="w-3 h-3 text-zinc-400 mt-0.5 flex-shrink-0" />
                  <p className="text-[12px] text-zinc-600 italic leading-snug">"{intention}"</p>
                </div>
              )}
            </div>
          </div>
          <div className="border-t border-zinc-100 px-5 pb-4">
            <ScoreBreakdown items={breakdown} />
          </div>
        </Section>

        {/* ── MORNING INTENTION ── */}
        <Section>
          <SectionHead icon={Sparkles} title="Bugungi niyat" />
          <input
            value={intention}
            onChange={e => setIntention(e.target.value)}
            placeholder="Bugun men ... qilaman / bo'laman"
            className="w-full text-sm bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:border-zinc-500 transition-colors placeholder:text-zinc-300 font-medium"
          />
        </Section>

        {/* ── CAPTURE INBOX (collapsible) ── */}
        <AnimatePresence>
          {showCapturePanel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <Section>
                <SectionHead
                  icon={Inbox}
                  title="Tezkor qo'lga olish"
                  badge={captures.length}
                  action={
                    <button onClick={() => setShowCapturePanel(false)} className="text-zinc-400 hover:text-zinc-700">
                      <X className="w-4 h-4" />
                    </button>
                  }
                />
                <AnimatePresence mode="popLayout">
                  {captures.map(item => <CaptureItem key={item.id} item={item} onRemove={removeCapture} />)}
                </AnimatePresence>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-zinc-100">
                  <input
                    value={captureInput}
                    onChange={e => setCaptureInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addCapture()}
                    placeholder="G'oya, vazifa, eslatma..."
                    className="flex-1 text-sm bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 outline-none focus:border-zinc-400 placeholder:text-zinc-300"
                  />
                  <select
                    value={captureTag}
                    onChange={e => setCaptureTag(e.target.value)}
                    className="text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-2 outline-none focus:border-zinc-400 text-zinc-600"
                  >
                    {CAPTURE_TAGS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <button
                    onClick={addCapture}
                    disabled={!captureInput.trim()}
                    className="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center hover:bg-zinc-700 disabled:opacity-30 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Section>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── MIT — BIG 3 ── */}
        <Section>
          <SectionHead
            icon={Zap}
            title="Bugungi Big 3"
            badge={`${mitTasks.filter(t => t.done).length}/${mitTasks.length}`}
          />
          {mitTasks.length === 0 ? (
            <p className="text-sm text-zinc-400 py-2">Bugungi 3 ta eng muhim vazifani kiriting.</p>
          ) : (
            <div className="space-y-0.5">
              <AnimatePresence mode="popLayout">
                {mitTasks.map((task, idx) => (
                  <MITItem key={task.id} task={task} index={idx} onToggle={toggleMIT} onRemove={removeMIT} />
                ))}
              </AnimatePresence>
            </div>
          )}
          {mitTasks.length < 3 && <MITAddForm onAdd={addMIT} />}
          {mitTasks.length >= 3 && (
            <p className="text-[11px] text-zinc-400 mt-3 text-center">✓ Big 3 to'ldirildi</p>
          )}
        </Section>

        {/* ── TIME BLOCKS ── */}
        <Section>
          <SectionHead
            icon={Layers}
            title="Vaqt bloklari"
            badge={`${blocks.reduce((s, b) => s + b.duration, 0)} min`}
            action={
              <button
                onClick={() => setShowBlockForm(v => !v)}
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Qo'shish
              </button>
            }
          />
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {blocks
                .slice()
                .sort((a, b) => (a.start ?? "99:99").localeCompare(b.start ?? "99:99"))
                .map(block => (
                  <TimeBlock key={block.id} block={block} onToggle={toggleBlock} onRemove={removeBlock} />
                ))}
            </AnimatePresence>
          </div>
          <AnimatePresence>
            {showBlockForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <BlockAddForm onAdd={b => { addBlock(b); setShowBlockForm(false); }} />
              </motion.div>
            )}
          </AnimatePresence>
        </Section>

        {/* ── TODAY'S HABITS ── */}
        <Section>
          <SectionHead
            icon={Repeat}
            title="Bugungi odatlar"
            badge={`${habits.filter(h => h.completedToday).length}/${habits.length}`}
          />
          <div className="space-y-2">
            {habits.map(habit => (
              <motion.div key={habit.id} layout className="flex items-center gap-3 py-1 group">
                <CB checked={habit.completedToday} onChange={() => toggleHabit(habit.id)} size="sm" />
                <span className="text-base leading-none">{habit.icon}</span>
                <span className={cn("flex-1 text-sm font-medium transition-all", habit.completedToday ? "line-through text-zinc-400" : "text-zinc-800")}>
                  {habit.title}
                </span>
                {habit.streak > 0 && (
                  <div className="flex items-center gap-1">
                    <Flame className="w-3 h-3 text-zinc-400" />
                    <span className="text-[11px] font-bold text-zinc-400">{habit.streak}d</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </Section>

        {/* ── SUPPORTING TASKS ── */}
        <Section>
          <SectionHead
            icon={List}
            title="Qo'shimcha vazifalar"
            badge={`${tasks.filter(t => t.done).length}/${tasks.length}`}
          />
          <div className="space-y-1.5">
            <AnimatePresence mode="popLayout">
              {tasks.map(task => (
                <motion.div key={task.id} layout {...slideIn} className="flex items-center gap-2.5 group py-0.5">
                  <CB checked={task.done} onChange={() => toggleTask(task.id)} size="sm" />
                  <span className={cn("flex-1 text-sm transition-all", task.done ? "line-through text-zinc-400" : "text-zinc-700")}>
                    {task.text}
                  </span>
                  <button onClick={() => removeTask(task.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1">
                    <X className="w-3 h-3 text-zinc-400 hover:text-zinc-700" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-zinc-100">
            <input
              value={taskInput}
              onChange={e => setTaskInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addTask()}
              placeholder="Vazifa qo'shing..."
              className="flex-1 text-sm bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 outline-none focus:border-zinc-400 placeholder:text-zinc-300"
            />
            <button
              onClick={addTask}
              disabled={!taskInput.trim()}
              className="w-8 h-8 rounded-xl bg-zinc-800 text-white flex items-center justify-center hover:bg-zinc-700 disabled:opacity-30 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </Section>

        {/* ── ENERGY TRACKER ── */}
        <Section>
          <SectionHead icon={Activity} title="Energiya darajasi" />
          <div className="space-y-3">
            <EnergyCheckIn label="Ertalab"       icon={Sun}    value={energyMorning}   onChange={setEnergyMorning}   />
            <EnergyCheckIn label="Tushdan keyin" icon={Zap}    value={energyAfternoon} onChange={setEnergyAfternoon} />
            <EnergyCheckIn label="Kechqurun"     icon={Moon}   value={energyEvening}   onChange={setEnergyEvening}   />
          </div>
          {avgEnergy && (
            <div className="mt-3 pt-3 border-t border-zinc-100 text-[11px] text-zinc-400 text-center">
              O'rtacha energiya: <span className="font-bold text-zinc-700">{avgEnergy}</span>/5
            </div>
          )}
        </Section>

        {/* ── END-OF-DAY REFLECTION ── */}
        <Section>
          <SectionHead icon={Brain} title="Kunlik tahlil" />
          <div className="space-y-3">
            {[
              { key: "win",      label: "Bugungi g'alaba nima?",         val: reflWin,      set: setReflWin      },
              { key: "block",    label: "Nima to'sqinlik qildi?",        val: reflBlock,    set: setReflBlock    },
              { key: "tomorrow", label: "Ertangi eng muhim qadam nima?", val: reflTomorrow, set: setReflTomorrow },
            ].map(({ key, label, val, set }) => (
              <div key={key}>
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block">
                  {label}
                </label>
                <textarea
                  value={val}
                  onChange={e => set(e.target.value)}
                  rows={2}
                  placeholder="..."
                  className="w-full text-sm bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 outline-none focus:border-zinc-400 transition-colors placeholder:text-zinc-200 resize-none"
                />
              </div>
            ))}
          </div>
          {reflWin && reflBlock && reflTomorrow && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center gap-2 bg-zinc-900 text-white rounded-xl px-4 py-3"
            >
              <Award className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium">Kun yopildi! Ajoyib ish.</span>
            </motion.div>
          )}
        </Section>

        <div className="h-4" />
      </div>
    </div>
  );
}
