import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLifeOSData } from "@/lib/lifeos-store";
import { cn } from "@/lib/utils";
import {
  Plus, Check, Clock, Sun, Zap, Target, X, Flame,
  ChevronRight, ChevronDown, Edit3, Brain, Play,
  ArrowRight, Sparkles, RotateCcw, Moon, Coffee,
  Sunrise, Sunset, Bot, Lightbulb, Tag, Calendar,
  GripVertical, Battery, Droplets,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════════════════════════ */
const TODAY = new Date();
const DATE_LONG = TODAY.toLocaleDateString("uz-UZ", {
  weekday: "long", year: "numeric", month: "long", day: "numeric",
});

const ENERGY_TYPES = [
  { key: "deep",    label: "Chuqur ish",    icon: Brain },
  { key: "light",   label: "Yengil ish",    icon: Coffee },
  { key: "creative", label: "Ijodiy ish",   icon: Lightbulb },
];

const TIME_BLOCKS = [
  { key: "morning",   label: "Ertalab",   sub: "06:00 – 12:00", icon: Sunrise },
  { key: "afternoon", label: "Tushdan keyin", sub: "12:00 – 18:00", icon: Sun },
  { key: "evening",   label: "Kechqurun", sub: "18:00 – 22:00",  icon: Sunset },
];

const CAPTURE_TAGS = [
  { key: "idea",      label: "G'oya",      color: "bg-zinc-200" },
  { key: "distract",  label: "Chalg'ish",  color: "bg-zinc-300" },
  { key: "tomorrow",  label: "Ertaga",     color: "bg-zinc-200" },
  { key: "followup",  label: "Kuzatish",   color: "bg-zinc-300" },
];

const SLEEP_OPTIONS = ["Yomon", "O'rtacha", "Yaxshi", "Ajoyib"];
const ENERGY_LEVELS = ["Past", "O'rta", "Yuqori", "Juda yuqori"];
const MOOD_OPTIONS = ["😔", "😐", "🙂", "😊", "🔥"];

function fade(delay = 0) {
  return {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] },
  };
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Primitives
   ═══════════════════════════════════════════════════════════════════════════════ */
function Card({ children, className }) {
  return (
    <motion.div
      {...fade()}
      className={cn(
        "bg-white rounded-2xl border border-zinc-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

function SectionHead({ icon: Icon, title, subtitle, right }) {
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
      {right}
    </div>
  );
}

function Pill({ children, active, onClick, className }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all",
        active
          ? "bg-zinc-900 text-white border-zinc-900"
          : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300",
        className,
      )}
    >
      {children}
    </button>
  );
}

function Checkbox({ checked, onClick, size = "md" }) {
  const s = size === "sm" ? 16 : 18;
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-[5px] border-[1.5px] flex items-center justify-center flex-shrink-0 transition-all",
        checked ? "bg-zinc-900 border-zinc-900" : "border-zinc-300 hover:border-zinc-400",
      )}
      style={{ width: s, height: s }}
    >
      {checked && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 25 }}>
          <Check className="text-white" style={{ width: s - 6, height: s - 6 }} strokeWidth={3} />
        </motion.div>
      )}
    </button>
  );
}

function ProgressBar({ value }) {
  return (
    <div className="h-[5px] bg-zinc-100 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, value)}%` }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="h-full rounded-full bg-zinc-900"
      />
    </div>
  );
}

function CircularScore({ score, size = 100, sw = 6 }) {
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f4f4f5" strokeWidth={sw} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#18181b" strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (score / 100) * circ }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-zinc-900 tabular-nums">{score}</span>
        <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">ball</span>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, text, action }) {
  return (
    <div className="flex flex-col items-center py-8 text-zinc-300">
      <Icon className="w-8 h-8 mb-2 opacity-30" strokeWidth={1} />
      <p className="text-[13px] font-medium text-zinc-400">{text}</p>
      {action}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════════════════════ */
export default function DailyPlannerPage() {
  const { data, actions } = useLifeOSData();

  /* ── state ── */
  const [mission, setMission] = useState("");
  const [missionLocked, setMissionLocked] = useState(false);

  // priorities
  const [priorities, setPriorities] = useState([]);
  const [prioInput, setPrioInput] = useState("");
  const [prioEnergy, setPrioEnergy] = useState("deep");
  const [prioTime, setPrioTime] = useState("morning");

  // supporting
  const [support, setSupport] = useState([]);
  const [supportInput, setSupportInput] = useState("");

  // focus
  const [focusSessions, setFocusSessions] = useState([]);
  const [focusInput, setFocusInput] = useState("");
  const [focusDur, setFocusDur] = useState(25);

  // energy
  const [sleep, setSleep] = useState(null);
  const [energyLvl, setEnergyLvl] = useState(null);
  const [moodVal, setMoodVal] = useState(null);
  const [hydration, setHydration] = useState(0);

  // capture
  const [captures, setCaptures] = useState([]);
  const [captureInput, setCaptureInput] = useState("");
  const [captureTag, setCaptureTag] = useState("idea");

  // reflection
  const [refWin, setRefWin] = useState("");
  const [refDistract, setRefDistract] = useState("");
  const [refTomorrow, setRefTomorrow] = useState("");

  // habits from store
  const habits = data.habits || [];
  const habitsDone = habits.filter((h) => h.completedToday).length;

  /* ── computed ── */
  const prioDone = priorities.filter((p) => p.done).length;
  const focDone  = focusSessions.filter((f) => f.done).length;
  const hasRef   = refWin.trim() || refDistract.trim() || refTomorrow.trim();

  const dayScore = useMemo(() => {
    let s = 0;
    const pMax = Math.max(priorities.length, 1);
    s += Math.round((prioDone / pMax) * 40);
    const hMax = Math.max(habits.length, 1);
    s += Math.round((habitsDone / hMax) * 30);
    const fMax = Math.max(focusSessions.length, 1);
    s += Math.round((focDone / fMax) * 20);
    if (hasRef) s += 10;
    return Math.min(100, s);
  }, [priorities, prioDone, habits.length, habitsDone, focusSessions, focDone, hasRef]);

  const dayLabel = dayScore >= 80 ? "Ajoyib kun!" : dayScore >= 50 ? "Yaxshi yo'ldasiz" : dayScore > 0 ? "Davom eting" : "Yangi kun — yangi imkoniyat";

  const totalPlannedMin = focusSessions.reduce((s, f) => s + f.dur, 0);

  /* ── actions ── */
  const addPriority = useCallback(() => {
    if (!prioInput.trim() || priorities.length >= 3) return;
    setPriorities((p) => [...p, { id: Date.now(), text: prioInput.trim(), done: false, energy: prioEnergy, time: prioTime, deferred: false }]);
    setPrioInput("");
  }, [prioInput, priorities.length, prioEnergy, prioTime]);

  const togglePrio = useCallback((id) => setPriorities((p) => p.map((x) => x.id === id ? { ...x, done: !x.done } : x)), []);
  const deferPrio = useCallback((id) => setPriorities((p) => p.map((x) => x.id === id ? { ...x, deferred: true } : x)), []);
  const removePrio = useCallback((id) => setPriorities((p) => p.filter((x) => x.id !== id)), []);
  const promoteSup = useCallback((id) => {
    if (priorities.length >= 3) return;
    const item = support.find((s) => s.id === id);
    if (!item) return;
    setPriorities((p) => [...p, { id: Date.now(), text: item.text, done: false, energy: "deep", time: "morning", deferred: false }]);
    setSupport((s) => s.filter((x) => x.id !== id));
  }, [support, priorities.length]);

  const addSupport = useCallback(() => {
    if (!supportInput.trim()) return;
    setSupport((s) => [...s, { id: Date.now(), text: supportInput.trim(), done: false }]);
    setSupportInput("");
  }, [supportInput]);
  const toggleSup = useCallback((id) => setSupport((s) => s.map((x) => x.id === id ? { ...x, done: !x.done } : x)), []);
  const removeSup = useCallback((id) => setSupport((s) => s.filter((x) => x.id !== id)), []);

  const addFocus = useCallback(() => {
    if (!focusInput.trim()) return;
    setFocusSessions((s) => [...s, { id: Date.now(), text: focusInput.trim(), dur: focusDur, done: false }]);
    setFocusInput("");
  }, [focusInput, focusDur]);
  const toggleFocus = useCallback((id) => setFocusSessions((s) => s.map((x) => x.id === id ? { ...x, done: !x.done } : x)), []);
  const removeFocus = useCallback((id) => setFocusSessions((s) => s.filter((x) => x.id !== id)), []);

  const addCapture = useCallback(() => {
    if (!captureInput.trim()) return;
    setCaptures((c) => [{ id: Date.now(), text: captureInput.trim(), tag: captureTag }, ...c]);
    setCaptureInput("");
  }, [captureInput, captureTag]);
  const removeCapture = useCallback((id) => setCaptures((c) => c.filter((x) => x.id !== id)), []);

  /* ═══════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="p-4 lg:p-6 pb-28 lg:pb-10 max-w-[1260px] mx-auto space-y-5">

      {/* ═══════════════════════════════════════════════════════════════════════
         HEADER
         ═══════════════════════════════════════════════════════════════════════ */}
      <motion.div {...fade()} className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400">{DATE_LONG}</p>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-zinc-900 mt-1">Kunlik reja</h1>
          <p className="text-sm text-zinc-400 mt-0.5">Tizimingizni ishga tushiring. Bugun nima muhim?</p>
        </div>
        <div className="flex gap-2">
          <Link to="/focus" className="h-9 px-4 rounded-xl bg-zinc-900 text-white text-[12px] font-semibold flex items-center gap-2 hover:bg-zinc-800 transition-colors">
            <Play className="w-3 h-3" fill="currentColor" /> Deep Work
          </Link>
          <Link to="/assistant" className="h-9 px-4 rounded-xl bg-zinc-100 text-zinc-600 text-[12px] font-semibold flex items-center gap-2 hover:bg-zinc-200 transition-colors border border-zinc-200">
            <Bot className="w-3 h-3" /> AI rejalashtirsin
          </Link>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════════
         SCORE + PROGRESS
         ═══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="col-span-2 lg:col-span-2 flex items-center gap-5 p-5">
          <CircularScore score={dayScore} />
          <div>
            <p className="text-[15px] font-bold text-zinc-800">{dayLabel}</p>
            <div className="mt-2 space-y-1">
              {[
                { label: "Vazifalar", val: `${prioDone}/${priorities.length}`, pct: priorities.length ? (prioDone / priorities.length) * 100 : 0 },
                { label: "Odatlar",   val: `${habitsDone}/${habits.length}`,  pct: habits.length ? (habitsDone / habits.length) * 100 : 0 },
                { label: "Fokus",     val: `${focDone}/${focusSessions.length}`, pct: focusSessions.length ? (focDone / focusSessions.length) * 100 : 0 },
              ].map((b) => (
                <div key={b.label} className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-400 w-14">{b.label}</span>
                  <div className="flex-1 h-1 bg-zinc-100 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-zinc-900 rounded-full" initial={{ width: 0 }} animate={{ width: `${b.pct}%` }} transition={{ duration: 0.8 }} />
                  </div>
                  <span className="text-[10px] font-bold text-zinc-500 tabular-nums w-8 text-right">{b.val}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {[
          { label: "Rejalashtirilgan", value: `${totalPlannedMin}m`, icon: Clock },
          { label: "Odatlar",  value: `${habitsDone}/${habits.length}`, icon: Flame },
          { label: "Streak",   value: `${data.habits?.[0]?.streak ?? 0}`, icon: Zap },
          { label: "Fokus",    value: `${focusSessions.filter(f => f.done).length}`, icon: Brain },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center">
                <s.icon className="w-3.5 h-3.5 text-zinc-500" strokeWidth={1.8} />
              </div>
            </div>
            <p className="text-lg font-bold text-zinc-900 tabular-nums">{s.value}</p>
            <p className="text-[10px] text-zinc-400 font-medium">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
         DAILY MISSION
         ═══════════════════════════════════════════════════════════════════════ */}
      <Card>
        <SectionHead icon={Sparkles} title="Bugungi missiya" subtitle="Bir jumlada bugungi niyatingiz" />
        <div className="px-5 pb-5">
          {missionLocked ? (
            <div className="flex items-center justify-between bg-zinc-50 rounded-xl px-4 py-3">
              <p className="text-[13px] text-zinc-700 italic leading-relaxed">"{mission}"</p>
              <button onClick={() => setMissionLocked(false)} className="text-zinc-400 hover:text-zinc-600 ml-3 flex-shrink-0">
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                value={mission}
                onChange={(e) => setMission(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && mission.trim() && setMissionLocked(true)}
                placeholder="Bugun men fokusimni himoya qilaman va dashboard tuzilmasini tugataman."
                className="flex-1 h-10 rounded-xl bg-zinc-50 border border-zinc-200 text-[13px] px-4 outline-none focus:border-zinc-400 transition-all placeholder:text-zinc-400"
              />
              <button
                onClick={() => mission.trim() && setMissionLocked(true)}
                disabled={!mission.trim()}
                className="h-10 px-4 rounded-xl bg-zinc-900 text-white text-[12px] font-semibold hover:bg-zinc-800 transition-colors disabled:opacity-30"
              >
                Saqlash
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* ═══════════════════════════════════════════════════════════════════════
         MAIN 2-COL
         ═══════════════════════════════════════════════════════════════════════ */}
      <div className="grid lg:grid-cols-12 gap-5">

        {/* ─── LEFT 8 cols ─── */}
        <div className="lg:col-span-8 space-y-5">

          {/* ── TOP 3 PRIORITIES ── */}
          <Card>
            <SectionHead
              icon={Zap}
              title="Eng muhim 3 vazifa"
              subtitle={`${prioDone}/${priorities.length} bajarildi · Faqat eng muhimi`}
            />
            <div className="px-5 pb-2"><ProgressBar value={priorities.length ? (prioDone / priorities.length) * 100 : 0} /></div>

            <div className="px-4 pt-2 pb-1 space-y-1">
              <AnimatePresence mode="popLayout">
                {priorities.map((p, i) => (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -16, transition: { duration: 0.15 } }}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-xl group transition-colors",
                      p.deferred ? "opacity-40" : "hover:bg-zinc-50",
                    )}
                  >
                    <span className="text-[11px] font-bold text-zinc-300 w-4 text-center tabular-nums">{i + 1}</span>
                    <Checkbox checked={p.done} onClick={() => togglePrio(p.id)} />
                    <div className="flex-1 min-w-0">
                      <span className={cn(
                        "text-[13px] font-medium block transition-colors",
                        p.done ? "line-through text-zinc-400" : "text-zinc-700",
                        p.deferred && "line-through",
                      )}>
                        {p.text}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                          {ENERGY_TYPES.find(e => e.key === p.energy)?.label}
                        </span>
                        <span className="text-zinc-200">·</span>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                          {TIME_BLOCKS.find(t => t.key === p.time)?.label}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!p.done && !p.deferred && (
                        <>
                          <Link to="/focus" className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-zinc-100 transition-colors" title="Fokus sessiya">
                            <Play className="w-3 h-3 text-zinc-400" fill="currentColor" />
                          </Link>
                          <button onClick={() => deferPrio(p.id)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-zinc-100 transition-colors" title="Ertaga qoldir">
                            <ArrowRight className="w-3 h-3 text-zinc-400" />
                          </button>
                        </>
                      )}
                      <button onClick={() => removePrio(p.id)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-zinc-100 transition-colors">
                        <X className="w-3 h-3 text-zinc-400" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {priorities.length === 0 && (
                <EmptyState icon={Target} text="Bugun eng muhim 3 ishingizni belgilang" />
              )}
            </div>

            {priorities.length < 3 && (
              <div className="px-5 pb-5 pt-1 space-y-3">
                <div className="flex gap-2">
                  <input
                    value={prioInput}
                    onChange={(e) => setPrioInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addPriority()}
                    placeholder="Muhim vazifa..."
                    className="flex-1 h-10 rounded-xl bg-zinc-50 border border-zinc-200 text-[13px] px-4 outline-none focus:border-zinc-400 transition-all placeholder:text-zinc-400"
                  />
                  <button onClick={addPriority} disabled={!prioInput.trim()} className="h-10 w-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center hover:bg-zinc-800 transition-colors disabled:opacity-30 flex-shrink-0">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {ENERGY_TYPES.map((e) => (
                    <Pill key={e.key} active={prioEnergy === e.key} onClick={() => setPrioEnergy(e.key)}>
                      <e.icon className="w-3 h-3 inline mr-1" />{e.label}
                    </Pill>
                  ))}
                  <div className="w-px bg-zinc-200 mx-1" />
                  {TIME_BLOCKS.map((t) => (
                    <Pill key={t.key} active={prioTime === t.key} onClick={() => setPrioTime(t.key)}>
                      {t.label}
                    </Pill>
                  ))}
                </div>
              </div>
            )}
            {priorities.length >= 3 && (
              <p className="px-5 pb-4 text-[11px] text-zinc-400">3 ta vazifa belgilandi. Ko'p vazifa = kam fokus.</p>
            )}
          </Card>

          {/* ── TIME BLOCK PLANNER ── */}
          <Card>
            <SectionHead icon={Calendar} title="Vaqt bloklari" subtitle="Vazifalarni vaqt bo'yicha joylashtiring" />
            <div className="px-5 pb-5 space-y-3">
              {TIME_BLOCKS.map((block) => {
                const blockPrios = priorities.filter((p) => p.time === block.key && !p.deferred);
                return (
                  <div key={block.key} className="rounded-xl border border-zinc-200 overflow-hidden">
                    <div className="flex items-center gap-2.5 px-4 py-2.5 bg-zinc-50">
                      <block.icon className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="text-[12px] font-semibold text-zinc-700">{block.label}</span>
                      <span className="text-[10px] text-zinc-400">{block.sub}</span>
                      <div className="flex-1" />
                      <span className="text-[10px] font-bold text-zinc-400">{blockPrios.length} vazifa</span>
                    </div>
                    {blockPrios.length > 0 ? (
                      <div className="px-3 py-2 space-y-1">
                        {blockPrios.map((p) => (
                          <div key={p.id} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-zinc-50 transition-colors cursor-pointer" onClick={() => togglePrio(p.id)}>
                            <Checkbox checked={p.done} onClick={() => {}} size="sm" />
                            <span className={cn("text-[12px] flex-1", p.done ? "line-through text-zinc-400" : "text-zinc-600 font-medium")}>{p.text}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="px-4 py-3 text-[11px] text-zinc-300">Bu vaqtda vazifa yo'q</p>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* ── FOCUS SESSIONS ── */}
          <Card>
            <SectionHead icon={Brain} title="Fokus sessiyalar" subtitle={`${totalPlannedMin} daqiqa rejalashtirilgan`} right={
              <Link to="/focus" className="text-[11px] text-zinc-400 font-semibold hover:text-zinc-600 flex items-center gap-0.5">
                Barchasi <ChevronRight className="w-3 h-3" />
              </Link>
            } />
            <div className="px-5 pb-2 space-y-1.5">
              <AnimatePresence mode="popLayout">
                {focusSessions.map((f) => (
                  <motion.div key={f.id} layout initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-3 bg-zinc-50 rounded-xl px-4 py-3 group"
                  >
                    <Checkbox checked={f.done} onClick={() => toggleFocus(f.id)} size="sm" />
                    <span className={cn("text-[13px] flex-1 font-medium", f.done ? "line-through text-zinc-400" : "text-zinc-700")}>{f.text}</span>
                    <span className="text-[11px] font-semibold text-zinc-400 tabular-nums">{f.dur}m</span>
                    {!f.done && (
                      <Link to="/focus" className="w-7 h-7 rounded-lg bg-zinc-900 text-white flex items-center justify-center hover:bg-zinc-800 transition-colors">
                        <Play className="w-3 h-3" fill="currentColor" />
                      </Link>
                    )}
                    <button onClick={() => removeFocus(f.id)} className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg flex items-center justify-center hover:bg-zinc-200 transition-all">
                      <X className="w-3 h-3 text-zinc-400" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {focusSessions.length === 0 && (
                <EmptyState icon={Brain} text="Chuqur ish sessiyasi qo'shing" />
              )}
            </div>

            <div className="px-5 pb-5 pt-1">
              <div className="flex gap-2">
                <input value={focusInput} onChange={(e) => setFocusInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addFocus()}
                  placeholder="Fokus mavzusi..." className="flex-1 h-10 rounded-xl bg-zinc-50 border border-zinc-200 text-[13px] px-4 outline-none focus:border-zinc-400 transition-all placeholder:text-zinc-400" />
                {[25, 50, 90].map((d) => (
                  <Pill key={d} active={focusDur === d} onClick={() => setFocusDur(d)}>{d}m</Pill>
                ))}
                <button onClick={addFocus} disabled={!focusInput.trim()} className="h-10 w-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center hover:bg-zinc-800 transition-colors disabled:opacity-30 flex-shrink-0">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>

          {/* ── SUPPORTING TASKS ── */}
          <Card>
            <SectionHead icon={ChevronRight} title="Qo'shimcha vazifalar" subtitle="Ikkinchi darajali — vizual jihatdan engil" />
            <div className="px-4 pb-2 space-y-0.5">
              <AnimatePresence mode="popLayout">
                {support.map((s) => (
                  <motion.div key={s.id} layout initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -10, height: 0 }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-zinc-50 group transition-colors"
                  >
                    <Checkbox checked={s.done} onClick={() => toggleSup(s.id)} size="sm" />
                    <span className={cn("text-[12px] flex-1", s.done ? "line-through text-zinc-300" : "text-zinc-500")}>{s.text}</span>
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {priorities.length < 3 && !s.done && (
                        <button onClick={() => promoteSup(s.id)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-zinc-100" title="Asosiyga ko'tarish">
                          <Zap className="w-3 h-3 text-zinc-400" />
                        </button>
                      )}
                      <button onClick={() => removeSup(s.id)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-zinc-100">
                        <X className="w-3 h-3 text-zinc-300" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <div className="px-5 pb-5 pt-1">
              <div className="flex gap-2">
                <input value={supportInput} onChange={(e) => setSupportInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addSupport()}
                  placeholder="Qo'shimcha vazifa..." className="flex-1 h-9 rounded-xl bg-zinc-50 border border-zinc-200 text-[12px] px-3 outline-none focus:border-zinc-400 transition-all placeholder:text-zinc-400" />
                <button onClick={addSupport} disabled={!supportInput.trim()} className="h-9 w-9 rounded-xl bg-zinc-800 text-white flex items-center justify-center hover:bg-zinc-700 transition-colors disabled:opacity-30 flex-shrink-0">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* ─── RIGHT 4 cols ─── */}
        <div className="lg:col-span-4 space-y-5">

          {/* ── HABITS ── */}
          <Card>
            <SectionHead icon={Flame} title="Bugungi odatlar" subtitle={`${habitsDone}/${habits.length} bajarildi`} right={
              <Link to="/habits" className="text-[11px] text-zinc-400 font-semibold hover:text-zinc-600 flex items-center gap-0.5">
                Barchasi <ChevronRight className="w-3 h-3" />
              </Link>
            } />
            <div className="px-5 pb-2"><ProgressBar value={habits.length ? (habitsDone / habits.length) * 100 : 0} /></div>
            <div className="px-4 pb-4 space-y-0.5">
              {habits.map((h) => (
                <div key={h.id} className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-zinc-50 cursor-pointer transition-colors" onClick={() => actions.toggleHabitCheckIn(h.id)}>
                  <Checkbox checked={h.completedToday} onClick={() => {}} size="sm" />
                  <span className={cn("text-[12px] flex-1", h.completedToday ? "line-through text-zinc-400" : "text-zinc-600")}>{h.title}</span>
                  <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                    <Flame className="w-2.5 h-2.5" /><span className="tabular-nums font-semibold">{h.streak}</span>
                  </div>
                </div>
              ))}
              {habits.length === 0 && <EmptyState icon={Flame} text="Odat qo'shing" action={<Link to="/habits" className="text-[11px] text-zinc-500 underline mt-1">Odatlar →</Link>} />}
            </div>
          </Card>

          {/* ── ENERGY / HEALTH CHECK ── */}
          <Card>
            <SectionHead icon={Battery} title="Energiya tekshiruvi" subtitle="Reja energiyangizga mos bo'lsin" />
            <div className="px-5 pb-5 space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2"><Moon className="w-3 h-3 inline mr-1" />Uyqu sifati</p>
                <div className="flex gap-1.5">
                  {SLEEP_OPTIONS.map((s) => <Pill key={s} active={sleep === s} onClick={() => setSleep(s)}>{s}</Pill>)}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2"><Zap className="w-3 h-3 inline mr-1" />Energiya</p>
                <div className="flex gap-1.5">
                  {ENERGY_LEVELS.map((e) => <Pill key={e} active={energyLvl === e} onClick={() => setEnergyLvl(e)}>{e}</Pill>)}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2"><Sun className="w-3 h-3 inline mr-1" />Kayfiyat</p>
                <div className="flex gap-2">
                  {MOOD_OPTIONS.map((m, i) => (
                    <button key={m} onClick={() => setMoodVal(i)} className={cn("w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all border", moodVal === i ? "bg-zinc-900 border-zinc-900 scale-110" : "bg-white border-zinc-200 hover:border-zinc-300")}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2"><Droplets className="w-3 h-3 inline mr-1" />Suv ({hydration} stakan)</p>
                <div className="flex gap-1">
                  {Array.from({ length: 8 }, (_, i) => (
                    <button key={i} onClick={() => setHydration(i + 1)}
                      className={cn("w-7 h-7 rounded-lg text-[11px] font-bold transition-all border", i < hydration ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-zinc-400 border-zinc-200 hover:border-zinc-300")}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* ── QUICK CAPTURE ── */}
          <Card>
            <SectionHead icon={Lightbulb} title="Tez yozib qo'yish" subtitle="G'oyalar, chalg'ishlar, eslatmalar" />
            <div className="px-5 pb-5 space-y-3">
              <div className="flex gap-2">
                <input value={captureInput} onChange={(e) => setCaptureInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCapture()}
                  placeholder="Yozib qo'ying..." className="flex-1 h-9 rounded-xl bg-zinc-50 border border-zinc-200 text-[12px] px-3 outline-none focus:border-zinc-400 transition-all placeholder:text-zinc-400" />
                <button onClick={addCapture} disabled={!captureInput.trim()} className="h-9 w-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center hover:bg-zinc-800 disabled:opacity-30 flex-shrink-0">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex gap-1.5">
                {CAPTURE_TAGS.map((t) => <Pill key={t.key} active={captureTag === t.key} onClick={() => setCaptureTag(t.key)}>{t.label}</Pill>)}
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {captures.map((c) => (
                  <div key={c.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-zinc-50 group">
                    <span className={cn("text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded", CAPTURE_TAGS.find(t => t.key === c.tag)?.color || "bg-zinc-200", "text-zinc-500")}>{c.tag}</span>
                    <span className="text-[12px] text-zinc-600 flex-1 truncate">{c.text}</span>
                    <button onClick={() => removeCapture(c.id)} className="opacity-0 group-hover:opacity-100"><X className="w-3 h-3 text-zinc-300" /></button>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* ── REFLECTION ── */}
          <Card>
            <SectionHead icon={Edit3} title="Kechki refleksiya" subtitle="Kunni yoping va ertani rejalashtiring" right={
              <Link to="/reflection" className="text-[11px] text-zinc-400 font-semibold hover:text-zinc-600 flex items-center gap-0.5">
                To'liq <ChevronRight className="w-3 h-3" />
              </Link>
            } />
            <div className="px-5 pb-5 space-y-3">
              {[
                { label: "Bugungi yutug'im", icon: Sun, val: refWin, set: setRefWin, ph: "Eng yaxshi qilgan ishim..." },
                { label: "Eng katta chalg'ish", icon: Sparkles, val: refDistract, set: setRefDistract, ph: "Nima to'sqinlik qildi..." },
                { label: "Ertaga nima muhim", icon: ArrowRight, val: refTomorrow, set: setRefTomorrow, ph: "Ertangi eng muhim ish..." },
              ].map((r) => (
                <div key={r.label}>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1 block">
                    <r.icon className="w-3 h-3 inline mr-1" />{r.label}
                  </label>
                  <input value={r.val} onChange={(e) => r.set(e.target.value)} placeholder={r.ph}
                    className="w-full h-9 rounded-xl bg-zinc-50 border border-zinc-200 text-[12px] px-3 outline-none focus:border-zinc-400 transition-colors placeholder:text-zinc-400" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
