import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLifeOSData } from "@/lib/lifeos-store";
import { cn } from "@/lib/utils";
import { Plus, Trash2, ChevronDown, Target, AlertCircle } from "lucide-react";

const PERIODS = ["Yillik", "Oylik", "Haftalik", "Kunlik"];
const PERIOD_LABELS = { Yillik: "YILLIK", Oylik: "OYLIK", Haftalik: "HAFTALIK", Kunlik: "KUNLIK" };
const PERIOD_LIMITS = { Yillik: 5, Oylik: 7, Haftalik: 3, Kunlik: 3 };
const PERIOD_DESC = {
  Yillik: "Eng katta strategik maqsadlar",
  Oylik: "Yillik maqsadga olib boradigan qadamlar",
  Haftalik: "Bu haftadagi asosiy fokus",
  Kunlik: "Bugungi eng muhim vazifalar",
};

const IDENTITY_OPTIONS = [
  "Intizomli inson",
  "Fokusli inson",
  "Sog'lom inson",
  "Moliyaviy tartibli",
  "Ko'p o'qiydigan inson",
  "Muvaffaqiyatli inson",
];

function ProgressBar({ value }) {
  return (
    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full bg-slate-900"
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, value)}%` }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      />
    </div>
  );
}

function GoalCard({ goal, onDelete, onIncrement, onDecrement }) {
  const progress = goal.targetValue > 0
    ? Math.round((goal.currentValue / goal.targetValue) * 100)
    : 0;
  const isDone = progress >= 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-xl p-4 border transition-colors",
        isDone
          ? "bg-slate-50 border-slate-200"
          : "bg-white border-slate-200 hover:border-slate-300"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 pr-3">
          <p className={cn(
            "text-sm font-bold leading-snug",
            isDone ? "text-slate-400 line-through" : "text-slate-800"
          )}>
            {goal.title}
          </p>
          {goal.deadline && (
            <p className="text-[10px] mt-1 font-semibold text-slate-400">
              Muddat: {new Date(goal.deadline).toLocaleDateString("uz-UZ")}
            </p>
          )}
        </div>
        <button
          onClick={() => onDelete(goal.id)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <ProgressBar value={progress} />

      <div className="flex items-center justify-between mt-2">
        <span className="text-xs font-bold text-slate-500">
          {goal.currentValue} / {goal.targetValue}
          {isDone && <span className="ml-2 text-slate-400">Bajarildi</span>}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => onDecrement(goal.id)}
            className="w-7 h-7 rounded-lg text-sm font-black flex items-center justify-center bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
          >
            −
          </button>
          <button
            onClick={() => onIncrement(goal.id)}
            className="w-7 h-7 rounded-lg text-sm font-black flex items-center justify-center bg-slate-900 text-white hover:bg-slate-800 transition-all active:scale-90"
          >
            +
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function PeriodSection({ period, goals, limit, onDelete, onIncrement, onDecrement }) {
  const [open, setOpen] = useState(true);
  const isOverLimit = goals.length >= limit;

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-slate-900" />
          <div className="text-left">
            <span className="text-[11px] font-black tracking-[0.2em] uppercase text-slate-700">
              {PERIOD_LABELS[period]}
            </span>
            <p className="text-[10px] text-slate-400 mt-0.5">{PERIOD_DESC[period]}</p>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
            {goals.length}/{limit}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-slate-400 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 flex flex-col gap-3">
              {goals.length === 0 && (
                <p className="text-xs text-center py-4 text-slate-300">
                  Bu davrda maqsad yo'q
                </p>
              )}
              {goals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onDelete={onDelete}
                  onIncrement={onIncrement}
                  onDecrement={onDecrement}
                />
              ))}
              {isOverLimit && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 text-slate-400 text-[11px]">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Maksimum {limit} ta maqsad. Ko'p maqsad = kam progress.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function GoalsPage() {
  const { actions, selectors } = useLifeOSData();
  const [title, setTitle] = useState("");
  const [period, setPeriod] = useState("Oylik");
  const [target, setTarget] = useState("10");
  const [deadline, setDeadline] = useState("");
  const [why, setWhy] = useState("");
  const [identity, setIdentity] = useState("");
  const [showForm, setShowForm] = useState(false);

  const byPeriod = useMemo(() => {
    const map = { Yillik: [], Oylik: [], Haftalik: [], Kunlik: [] };
    selectors.goalsWithMeta.forEach((g) => {
      if (map[g.period]) map[g.period].push(g);
    });
    return map;
  }, [selectors.goalsWithMeta]);

  const total = selectors.goalsWithMeta.length;
  const completed = selectors.goalsWithMeta.filter((g) => g.progress >= 100).length;
  const canAdd = byPeriod[period].length < PERIOD_LIMITS[period];

  const addGoal = () => {
    if (!title.trim()) return;
    if (!canAdd) return;
    actions.addGoal({
      title: title.trim(),
      period,
      targetValue: Number(target) || 10,
      deadline: deadline || "2026-12-31",
    });
    setTitle("");
    setTarget("10");
    setDeadline("");
    setWhy("");
    setIdentity("");
    setShowForm(false);
  };

  return (
    <div className="flex flex-col gap-5 p-4 lg:p-6 max-w-[900px]">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-400">
            PLANNING
          </p>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-0.5">Maqsadlar</h1>
          <p className="text-sm text-slate-400 mt-1">Yillik → Oylik → Haftalik → Kunlik</p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90",
            showForm
              ? "bg-slate-200 text-slate-600"
              : "bg-slate-900 text-white hover:bg-slate-800"
          )}
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Jami", value: total },
          { label: "Bajarildi", value: completed },
          { label: "Faol", value: total - completed },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-2xl p-4 bg-white border border-slate-200">
            <p className="text-2xl font-black text-slate-900">{value}</p>
            <p className="text-[10px] font-bold uppercase tracking-wide mt-1 text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl p-5 flex flex-col gap-4 bg-white border border-slate-200">
              <p className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-500">
                YANGI MAQSAD
              </p>

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Maqsad nomi..."
                className="w-full bg-transparent text-sm font-semibold outline-none border-b border-slate-200 pb-2 text-slate-800 placeholder:text-slate-300 focus:border-slate-400 transition-colors"
              />

              {/* Why */}
              <input
                value={why}
                onChange={(e) => setWhy(e.target.value)}
                placeholder="Nega bu muhim? (ixtiyoriy)"
                className="w-full bg-transparent text-sm outline-none border-b border-slate-200 pb-2 text-slate-600 placeholder:text-slate-300 focus:border-slate-400 transition-colors"
              />

              {/* Period */}
              <div className="flex gap-2">
                {PERIODS.map((p) => {
                  const atLimit = byPeriod[p].length >= PERIOD_LIMITS[p];
                  return (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
                      disabled={atLimit}
                      className={cn(
                        "flex-1 py-2 rounded-xl text-[10px] font-black tracking-wide transition-all",
                        period === p
                          ? "bg-slate-900 text-white"
                          : atLimit
                            ? "bg-slate-50 text-slate-300 cursor-not-allowed"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      )}
                    >
                      {PERIOD_LABELS[p].slice(0, 3)}
                      <span className="ml-1 text-[8px] opacity-60">{byPeriod[p].length}/{PERIOD_LIMITS[p]}</span>
                    </button>
                  );
                })}
              </div>

              {/* Identity link */}
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest mb-2 text-slate-400">Qaysi identityga xizmat qiladi?</p>
                <div className="flex flex-wrap gap-2">
                  {IDENTITY_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setIdentity(identity === opt ? "" : opt)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all",
                        identity === opt
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <p className="text-[9px] font-black uppercase tracking-widest mb-1 text-slate-400">Maqsad qiymati</p>
                  <input
                    type="number"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    className="w-full bg-transparent text-sm font-bold outline-none border-b border-slate-200 pb-1 text-slate-700 focus:border-slate-400 transition-colors"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-[9px] font-black uppercase tracking-widest mb-1 text-slate-400">Muddat</p>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-transparent text-sm font-bold outline-none border-b border-slate-200 pb-1 text-slate-700 focus:border-slate-400 transition-colors"
                  />
                </div>
              </div>

              {!canAdd && (
                <p className="text-[11px] text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {PERIOD_LABELS[period]} uchun limit ({PERIOD_LIMITS[period]}) to'ldi
                </p>
              )}

              <button
                onClick={addGoal}
                disabled={!canAdd || !title.trim()}
                className={cn(
                  "w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all active:scale-[0.98]",
                  canAdd && title.trim()
                    ? "bg-slate-900 text-white hover:bg-slate-800"
                    : "bg-slate-100 text-slate-300 cursor-not-allowed"
                )}
              >
                QO'SHISH
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Period Sections */}
      <div className="flex flex-col gap-3">
        {PERIODS.map((p) => (
          <PeriodSection
            key={p}
            period={p}
            goals={byPeriod[p]}
            limit={PERIOD_LIMITS[p]}
            onDelete={actions.removeGoal}
            onIncrement={(id) => actions.updateGoalProgress(id, 1)}
            onDecrement={(id) => actions.updateGoalProgress(id, -1)}
          />
        ))}
      </div>
    </div>
  );
}
