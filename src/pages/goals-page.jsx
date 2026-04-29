/**
 * Goals Page — Maqsad → AI tizim → Odatlar oqimi
 *
 * Foydalanuvchi maqsadini yozadi → Cloudy AI tahlil qilib
 * odatlar, jadval va milestone tuzadi → tasdiqlaydi → ishlaydi.
 */

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLifeOSData } from "@/lib/lifeos-store";
import { cn } from "@/lib/utils";
import { analyzeGoal, generateSystem, isCloudyEnabled } from "@/lib/cloudyAI";
import {
  Plus, Target, Check, ChevronRight, Trash2,
  Sparkles, Clock, Flame, ArrowRight, X,
  CheckCircle2, Circle, BarChart3, Calendar,
} from "lucide-react";
import { toast } from "sonner";

/* ─── helpers ─────────────────────────────────────────────────────────── */

const todayISO = () => new Date().toISOString().slice(0, 10);

function habitDoneToday(habit) {
  const today = todayISO();
  return (habit.completedDates || []).includes(today);
}

function goalProgress(goal) {
  const habits = goal.habits || [];
  if (!habits.length) return goal.progress ?? 0;
  const today = todayISO();
  const done = habits.filter(h => (h.completedDates || []).includes(today)).length;
  return Math.round((done / habits.length) * 100);
}

function daysLeft(deadline) {
  if (!deadline) return null;
  return Math.ceil((new Date(deadline) - new Date()) / 864e5);
}

/* ─── AI Goal Creator ─────────────────────────────────────────────────── */

const PHASES = {
  INPUT:     "input",
  ANALYZING: "analyzing",
  CLARIFY:   "clarify",
  BUILDING:  "building",
  PREVIEW:   "preview",
};

function GoalCreator({ onSave, onCancel }) {
  const [phase, setPhase]   = useState(PHASES.INPUT);
  const [text, setText]     = useState("");
  const [clarifyQ, setClarifyQ] = useState([]);
  const [clarifyA, setClarifyA] = useState("");
  const [parsed, setParsed] = useState(null);
  const [system, setSystem] = useState(null);
  const [history, setHistory] = useState([]);

  const runAnalyze = useCallback(async (input, hist) => {
    setPhase(PHASES.ANALYZING);
    try {
      const result = await analyzeGoal(input, hist);
      if (result.needsClarification && result.clarifyingQuestions?.length) {
        setClarifyQ(result.clarifyingQuestions);
        setHistory([...hist, { role: "user", content: input }]);
        setPhase(PHASES.CLARIFY);
      } else {
        const goalData = result.parsed;
        setParsed(goalData);
        setPhase(PHASES.BUILDING);
        const sys = await generateSystem(goalData, {});
        setSystem(sys);
        setPhase(PHASES.PREVIEW);
      }
    } catch {
      toast.error("Cloudy javob bermadi, qayta urinib ko'ring");
      setPhase(PHASES.INPUT);
    }
  }, []);

  const handleStart = () => {
    if (!text.trim()) return;
    runAnalyze(text.trim(), []);
  };

  const handleClarify = () => {
    if (!clarifyA.trim()) return;
    const full = `Maqsad: ${text}\nAniqlashtirish: ${clarifyA}`;
    const newHist = [
      ...history,
      { role: "assistant", content: clarifyQ.join("\n") },
      { role: "user", content: clarifyA },
    ];
    runAnalyze(full, newHist);
  };

  const handleSave = () => {
    if (!parsed || !system) return;

    const goalId = crypto.randomUUID();
    const habits = (system.habits || []).map(h => ({
      ...h,
      id: crypto.randomUUID(),
      linkedGoalId: goalId,
      streak: 0,
      completedDates: [],
      createdAt: new Date().toISOString(),
    }));

    const goal = {
      id: goalId,
      title: parsed.title || text,
      emoji: parsed.emoji || "🎯",
      category: parsed.category || "personal",
      deadline: parsed.timeframe
        ? new Date(Date.now() + parseInt(parsed.timeframe) * 30 * 864e5).toISOString().slice(0, 10)
        : "",
      motivation: parsed.motivation || "",
      philosophy: system.philosophy || "",
      milestones: (system.milestones || []).map((m, i) => ({ ...m, id: `ms_${i}`, done: false })),
      habits,
      progress: 0,
      createdAt: new Date().toISOString(),
      firstStep: system.firstStep || "",
    };

    onSave(goal);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-violet-100 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-violet-600" />
            </div>
            <p className="text-[14px] font-bold text-zinc-900">Cloudy bilan maqsad qo'y</p>
          </div>
          <button onClick={onCancel} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-zinc-100">
            <X className="w-4 h-4 text-zinc-400" />
          </button>
        </div>

        <div className="px-5 pb-6">
          <AnimatePresence mode="wait">

            {/* INPUT */}
            {phase === PHASES.INPUT && (
              <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="text-[12px] text-zinc-400 mb-3">
                  Maqsadingizni oddiy so'z bilan yozing — Cloudy qolganini qiladi.
                </p>
                <textarea
                  autoFocus
                  rows={3}
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleStart(); } }}
                  placeholder="masalan: 6 oyda ingliz tilini B1 darajasiga olib chiqish"
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-[14px] text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-400 resize-none"
                />
                <button
                  onClick={handleStart}
                  disabled={!text.trim()}
                  className={cn(
                    "mt-3 w-full py-3 rounded-xl text-[13px] font-bold transition-all",
                    text.trim()
                      ? "bg-violet-600 text-white hover:bg-violet-700"
                      : "bg-zinc-100 text-zinc-300 cursor-not-allowed"
                  )}
                >
                  Tizim tuz →
                </button>
              </motion.div>
            )}

            {/* ANALYZING */}
            {phase === PHASES.ANALYZING && (
              <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="py-8 flex flex-col items-center gap-3"
              >
                <div className="flex gap-1.5">
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} className="w-2 h-2 rounded-full bg-violet-400"
                      animate={{ scale: [1, 1.4, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
                <p className="text-[13px] text-zinc-500">Cloudy tahlil qilyapti...</p>
              </motion.div>
            )}

            {/* CLARIFY */}
            {phase === PHASES.CLARIFY && (
              <motion.div key="clarify" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="mb-3 p-3 rounded-xl bg-violet-50 border border-violet-100">
                  {clarifyQ.map((q, i) => (
                    <p key={i} className="text-[12px] text-violet-700 leading-relaxed">{q}</p>
                  ))}
                </div>
                <textarea
                  autoFocus
                  rows={3}
                  value={clarifyA}
                  onChange={e => setClarifyA(e.target.value)}
                  placeholder="Javobingizni yozing..."
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-[14px] text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-400 resize-none"
                />
                <button
                  onClick={handleClarify}
                  disabled={!clarifyA.trim()}
                  className={cn(
                    "mt-3 w-full py-3 rounded-xl text-[13px] font-bold transition-all",
                    clarifyA.trim()
                      ? "bg-violet-600 text-white hover:bg-violet-700"
                      : "bg-zinc-100 text-zinc-300 cursor-not-allowed"
                  )}
                >
                  Davom →
                </button>
              </motion.div>
            )}

            {/* BUILDING */}
            {phase === PHASES.BUILDING && (
              <motion.div key="building" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="py-8 flex flex-col items-center gap-3"
              >
                <div className="flex gap-1.5">
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} className="w-2 h-2 rounded-full bg-amber-400"
                      animate={{ scale: [1, 1.4, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
                <p className="text-[13px] text-zinc-500">Shaxsiy tizim qurilmoqda...</p>
              </motion.div>
            )}

            {/* PREVIEW */}
            {phase === PHASES.PREVIEW && system && (
              <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-1"
              >
                {/* Goal title */}
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                  <p className="text-[11px] text-zinc-400 uppercase tracking-wider mb-1">Maqsad</p>
                  <p className="text-[14px] font-bold text-zinc-900">
                    {parsed?.emoji} {parsed?.title || text}
                  </p>
                  {parsed?.motivation && (
                    <p className="text-[11px] text-zinc-500 mt-1">{parsed.motivation}</p>
                  )}
                </div>

                {/* Philosophy */}
                {system.philosophy && (
                  <div className="p-3 rounded-xl bg-violet-50 border border-violet-100">
                    <p className="text-[12px] text-violet-700 leading-relaxed">{system.philosophy}</p>
                  </div>
                )}

                {/* Habits */}
                {system.habits?.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                      Kunlik odatlar ({system.habits.length} ta)
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {system.habits.map((h, i) => (
                        <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white border border-zinc-100">
                          <span className="text-lg">{h.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-semibold text-zinc-900 truncate">{h.name}</p>
                            <p className="text-[10px] text-zinc-400">{h.minimalVersion} · {h.scheduledTime || "—"}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Milestones */}
                {system.milestones?.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Milestonelar</p>
                    <div className="flex gap-2 flex-wrap">
                      {system.milestones.map((m, i) => (
                        <div key={i} className="px-3 py-1.5 rounded-lg bg-zinc-50 border border-zinc-100 text-[11px]">
                          <span className="font-bold text-zinc-900">{m.day}-kun</span>
                          <span className="text-zinc-400 ml-1">{m.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* First step */}
                {system.firstStep && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                    <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider mb-1">Bugun aynan hozir</p>
                    <p className="text-[12px] text-amber-800">{system.firstStep}</p>
                  </div>
                )}

                <button
                  onClick={handleSave}
                  className="w-full py-3 rounded-xl bg-zinc-900 text-white text-[13px] font-bold hover:bg-zinc-800 active:scale-[0.98] transition-all"
                >
                  Boshlash ✓
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Goal Card ───────────────────────────────────────────────────────── */

function GoalCard({ goal, onDelete, onToggleHabit }) {
  const [expanded, setExpanded] = useState(false);
  const today = todayISO();
  const pct = goalProgress(goal);
  const days = daysLeft(goal.deadline);
  const habits = goal.habits || [];
  const doneToday = habits.filter(h => (h.completedDates || []).includes(today)).length;
  const nextMilestone = (goal.milestones || []).find(m => !m.done);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-black/[0.07] overflow-hidden"
    >
      {/* Progress bar */}
      <div className="h-1 bg-zinc-100">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="h-full bg-violet-500 rounded-full"
        />
      </div>

      {/* Card header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start gap-3">
          <span className="text-2xl mt-0.5">{goal.emoji || "🎯"}</span>
          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] font-bold text-zinc-900 leading-snug">{goal.title}</h3>
            {goal.motivation && (
              <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-2">{goal.motivation}</p>
            )}
          </div>
          <button
            onClick={() => setExpanded(v => !v)}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-zinc-50 transition-colors shrink-0"
          >
            <ChevronRight className={cn("w-4 h-4 text-zinc-400 transition-transform", expanded && "rotate-90")} />
          </button>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 flex-1 w-20 bg-zinc-100 rounded-full overflow-hidden">
              <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-[11px] font-bold text-zinc-500 tabular-nums">{pct}%</span>
          </div>
          {days !== null && (
            <span className={cn(
              "text-[11px] font-medium flex items-center gap-1",
              days < 7 ? "text-amber-500" : "text-zinc-400"
            )}>
              <Calendar className="w-3 h-3" />
              {days > 0 ? `${days} kun` : "Muddati o'tdi"}
            </span>
          )}
          {habits.length > 0 && (
            <span className="text-[11px] font-medium text-zinc-400">
              {doneToday}/{habits.length} bugun
            </span>
          )}
        </div>

        {/* Next milestone */}
        {nextMilestone && (
          <div className="mt-2 px-2.5 py-1.5 rounded-lg bg-zinc-50 flex items-center gap-2">
            <BarChart3 className="w-3 h-3 text-zinc-400 shrink-0" />
            <span className="text-[11px] text-zinc-500">{nextMilestone.day}-kun: {nextMilestone.label}</span>
          </div>
        )}
      </div>

      {/* Habits section — always visible if any */}
      {habits.length > 0 && (
        <div className="border-t border-zinc-50 px-4 py-3">
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">Bugungi odatlar</p>
          <div className="flex flex-col gap-1.5">
            {habits.map(habit => {
              const done = (habit.completedDates || []).includes(today);
              return (
                <div
                  key={habit.id}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all",
                    done ? "bg-zinc-50 border-zinc-100 opacity-60" : "bg-white border-zinc-100"
                  )}
                >
                  <span className="text-base">{habit.emoji || "📌"}</span>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-[12px] font-medium truncate", done ? "text-zinc-400 line-through" : "text-zinc-800")}>
                      {habit.name}
                    </p>
                    <p className="text-[10px] text-zinc-400">
                      {habit.minimalVersion}
                      {habit.scheduledTime ? ` · ${habit.scheduledTime}` : ""}
                      {(habit.streak || 0) > 0 ? ` · 🔥${habit.streak}` : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => onToggleHabit(goal.id, habit.id)}
                    className={cn(
                      "w-7 h-7 rounded-full border-[1.5px] flex items-center justify-center shrink-0 transition-all",
                      done ? "bg-violet-600 border-violet-600" : "border-zinc-300 hover:border-violet-400"
                    )}
                  >
                    {done && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Expanded: milestones + delete */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-zinc-50"
          >
            <div className="px-4 py-3 flex flex-col gap-2">
              {goal.philosophy && (
                <p className="text-[11px] text-zinc-500 italic">{goal.philosophy}</p>
              )}
              {(goal.milestones || []).length > 0 && (
                <div className="flex flex-col gap-1">
                  {goal.milestones.map((m, i) => (
                    <div key={i} className={cn("flex items-center gap-2 text-[11px]", m.done ? "text-zinc-400" : "text-zinc-600")}>
                      {m.done ? <CheckCircle2 className="w-3 h-3 text-violet-500" /> : <Circle className="w-3 h-3" />}
                      <span className="font-medium">{m.day}-kun:</span>
                      <span>{m.label}</span>
                    </div>
                  ))}
                </div>
              )}
              {goal.firstStep && (
                <div className="px-3 py-2 rounded-lg bg-amber-50 text-[11px] text-amber-700">
                  <span className="font-semibold">Birinchi qadam:</span> {goal.firstStep}
                </div>
              )}
              <button
                onClick={() => onDelete(goal.id)}
                className="flex items-center gap-1.5 text-[11px] text-red-400 hover:text-red-500 transition-colors mt-1 w-fit"
              >
                <Trash2 className="w-3 h-3" /> Maqsadni o'chir
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Empty State ─────────────────────────────────────────────────────── */

function EmptyState({ onAdd }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mb-4">
        <Target className="w-8 h-8 text-violet-400" strokeWidth={1.5} />
      </div>
      <h2 className="text-[17px] font-bold text-zinc-900 mb-2">Hali maqsad yo'q</h2>
      <p className="text-[13px] text-zinc-400 max-w-[240px] leading-relaxed mb-6">
        Maqsadingizni yozing — Cloudy AI unga erishish yo'lini tuzib beradi
      </p>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 px-5 py-3 rounded-xl bg-violet-600 text-white text-[13px] font-bold hover:bg-violet-700 active:scale-[0.97] transition-all"
      >
        <Sparkles className="w-4 h-4" /> Maqsad qo'y
      </button>
    </motion.div>
  );
}

/* ─── Main Page ───────────────────────────────────────────────────────── */

export default function GoalsPage() {
  const { data, actions } = useLifeOSData();
  const [showCreator, setShowCreator] = useState(false);

  // Goals with their habits from store
  const goals = useMemo(() => {
    const storeGoals = data.goals || [];
    const storeHabits = data.habits || [];

    return storeGoals.map(g => {
      // Attach habits that are linked to this goal
      const linked = storeHabits.filter(h => h.linkedGoalId === g.id || h.goalId === g.id);
      return { ...g, habits: linked.length ? linked : (g.habits || []) };
    });
  }, [data.goals, data.habits]);

  const today = todayISO();
  const totalHabits = goals.reduce((s, g) => s + (g.habits || []).length, 0);
  const doneHabits  = goals.reduce((s, g) => s + (g.habits || []).filter(h => (h.completedDates || []).includes(today)).length, 0);

  const handleSaveGoal = useCallback((goal) => {
    // Save goal
    actions.addLocalGoal(goal);
    // Save each habit linked to this goal
    (goal.habits || []).forEach(h => actions.addLocalHabit(h));
    setShowCreator(false);
    toast.success(`${goal.emoji} Maqsad saqlandi! Birinchi odatni boshlang.`);
  }, [actions]);

  const handleDeleteGoal = useCallback((goalId) => {
    actions.deleteLocalGoal(goalId);
  }, [actions]);

  const handleToggleHabit = useCallback((goalId, habitId) => {
    actions.toggleHabitCompletion(habitId, today);
  }, [actions, today]);

  return (
    <div className="flex flex-col gap-5 p-4 lg:p-6 max-w-[680px]">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-end justify-between"
      >
        <div>
          <p className="text-[10px] font-black tracking-[0.3em] uppercase text-zinc-400">Maqsadlar</p>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 mt-0.5">Goals</h1>
          <p className="text-[13px] text-zinc-400 mt-0.5">
            {goals.length > 0
              ? `${doneHabits}/${totalHabits} odat bugun bajarildi`
              : "Maqsadingizni yozing, tizim tuziladi"}
          </p>
        </div>
        <button
          onClick={() => setShowCreator(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 text-white text-[12px] font-bold hover:bg-zinc-800 active:scale-[0.97] transition-all"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} /> Yangi maqsad
        </button>
      </motion.div>

      {/* Summary strip */}
      {goals.length > 0 && totalHabits > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="flex items-center gap-4 px-4 py-3 bg-white rounded-xl border border-black/[0.06]"
        >
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", doneHabits === totalHabits ? "bg-violet-500" : "bg-zinc-300")} />
            <span className="text-[12px] font-semibold text-zinc-700">
              {doneHabits === totalHabits ? "Barchasi bajarildi 🎉" : `${doneHabits}/${totalHabits} bajarildi`}
            </span>
          </div>
          <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${totalHabits ? (doneHabits / totalHabits) * 100 : 0}%` }}
              transition={{ duration: 0.6 }}
              className="h-full bg-violet-500 rounded-full"
            />
          </div>
          <span className="text-[11px] text-zinc-400 tabular-nums">
            {totalHabits ? Math.round((doneHabits / totalHabits) * 100) : 0}%
          </span>
        </motion.div>
      )}

      {/* Goals list */}
      {goals.length === 0 ? (
        <EmptyState onAdd={() => setShowCreator(true)} />
      ) : (
        <div className="flex flex-col gap-3">
          <AnimatePresence>
            {goals.map(goal => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onDelete={handleDeleteGoal}
                onToggleHabit={handleToggleHabit}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Goal Creator Modal */}
      <AnimatePresence>
        {showCreator && (
          <GoalCreator
            onSave={handleSaveGoal}
            onCancel={() => setShowCreator(false)}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
