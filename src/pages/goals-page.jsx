import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLifeOSData } from "@/lib/lifeos-store";
import { cn } from "@/lib/utils";
import { Plus, Trash2, ChevronDown, Target } from "lucide-react";

const PERIODS = ["Yillik", "Oylik", "Haftalik", "Kunlik"];
const PERIOD_EN = { Yillik: "ANNUAL", Oylik: "MONTHLY", Haftalik: "WEEKLY", Kunlik: "DAILY" };
const PERIOD_COLOR = { Yillik: "#00FFAA", Oylik: "#FFB800", Haftalik: "#A78BFA", Kunlik: "#38BDF8" };

function ProgressBar({ value, color }) {
  return (
    <div className="h-[3px] rounded-full overflow-hidden" style={{ background: "#1d1d1d" }}>
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, value)}%` }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      />
    </div>
  );
}

function GoalCard({ goal, color, onDelete, onIncrement, onDecrement }) {
  const progress = goal.targetValue > 0
    ? Math.round((goal.currentValue / goal.targetValue) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-4"
      style={{ background: "#111" }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 pr-3">
          <p className="text-sm font-bold text-white leading-snug">{goal.title}</p>
          {goal.deadline && (
            <p className="text-[10px] mt-1 font-semibold" style={{ color: "#444" }}>
              Muddat: {new Date(goal.deadline).toLocaleDateString("uz-UZ")}
            </p>
          )}
        </div>
        <button
          onClick={() => onDelete(goal.id)}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-red-500/10"
          style={{ color: "#333" }}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <ProgressBar value={progress} color={color} />

      <div className="flex items-center justify-between mt-2">
        <span className="text-xs font-bold" style={{ color }}>
          {goal.currentValue} / {goal.targetValue}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => onDecrement(goal.id)}
            className="w-7 h-7 rounded-lg text-sm font-black flex items-center justify-center transition-colors hover:bg-white/5"
            style={{ color: "#444", background: "#1a1a1a" }}
          >
            −
          </button>
          <button
            onClick={() => onIncrement(goal.id)}
            className="w-7 h-7 rounded-lg text-sm font-black flex items-center justify-center transition-all active:scale-90"
            style={{ color: "#000", background: color }}
          >
            +
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function PeriodSection({ period, goals, onDelete, onIncrement, onDecrement }) {
  const [open, setOpen] = useState(true);
  const color = PERIOD_COLOR[period];

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#0F0F0F", border: "1px solid #1a1a1a" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full" style={{ background: color }} />
          <span className="text-[11px] font-black tracking-[0.3em] uppercase" style={{ color }}>
            {PERIOD_EN[period]}
          </span>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: "#1a1a1a", color: "#555" }}
          >
            {goals.length}
          </span>
        </div>
        <ChevronDown
          className="w-4 h-4 transition-transform duration-200"
          style={{ color: "#444", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
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
                <p className="text-xs text-center py-3" style={{ color: "#333" }}>
                  Bu davrda maqsad yo'q.
                </p>
              )}
              {goals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  color={color}
                  onDelete={onDelete}
                  onIncrement={onIncrement}
                  onDecrement={onDecrement}
                />
              ))}
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

  const addGoal = () => {
    if (!title.trim()) return;
    actions.addGoal({
      title: title.trim(),
      period,
      targetValue: Number(target) || 10,
      deadline: deadline || "2026-12-31",
    });
    setTitle("");
    setTarget("10");
    setDeadline("");
    setShowForm(false);
  };

  return (
    <div
      className="flex flex-col gap-5 px-4 pt-6 pb-4"
      style={{ background: "#0B0B0B", minHeight: "100%" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black tracking-[0.35em] uppercase" style={{ color: "#555" }}>
            PLAN
          </p>
          <h1 className="text-2xl font-black tracking-tight mt-0.5">Maqsadlar.</h1>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
          style={{ background: showForm ? "#1a1a1a" : "#00FFAA", color: showForm ? "#00FFAA" : "#000" }}
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Jami",      value: total,     color: "#fff" },
          { label: "Bajarildi", value: completed,  color: "#00FFAA" },
          { label: "Qoldi",     value: total - completed, color: "#FF3B3B" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl p-4" style={{ background: "#111" }}>
            <p className="text-2xl font-black" style={{ color }}>{value}</p>
            <p className="text-[10px] font-bold uppercase tracking-wide mt-1" style={{ color: "#444" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl p-5 flex flex-col gap-4" style={{ background: "#111" }}>
              <p className="text-[10px] font-black tracking-[0.3em] uppercase" style={{ color: "#00FFAA" }}>
                YANGI MAQSAD
              </p>

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Maqsad nomi..."
                className="w-full bg-transparent text-sm font-semibold outline-none border-b pb-2 placeholder:font-normal"
                style={{ borderColor: "#222", color: "#ccc" }}
              />

              {/* Period selector */}
              <div className="flex gap-2">
                {PERIODS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className="flex-1 py-2 rounded-xl text-[10px] font-black tracking-wide transition-all"
                    style={{
                      background: period === p ? PERIOD_COLOR[p] : "#1a1a1a",
                      color: period === p ? "#000" : "#444",
                    }}
                  >
                    {PERIOD_EN[p].slice(0, 3)}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: "#444" }}>Maqsad</p>
                  <input
                    type="number"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    className="w-full bg-transparent text-sm font-bold outline-none border-b pb-1"
                    style={{ borderColor: "#222", color: "#ccc" }}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: "#444" }}>Muddat</p>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-transparent text-sm font-bold outline-none border-b pb-1"
                    style={{ borderColor: "#222", color: "#ccc", colorScheme: "dark" }}
                  />
                </div>
              </div>

              <button
                onClick={addGoal}
                className="w-full py-3.5 rounded-xl font-black text-sm tracking-widest uppercase transition-all active:scale-98"
                style={{ background: "#00FFAA", color: "#000" }}
              >
                QO'SHISH
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Period sections */}
      <div className="flex flex-col gap-3">
        {PERIODS.map((p) => (
          <PeriodSection
            key={p}
            period={p}
            goals={byPeriod[p]}
            onDelete={actions.deleteGoal}
            onIncrement={(id) => actions.incrementGoal(id, 1)}
            onDecrement={(id) => actions.incrementGoal(id, -1)}
          />
        ))}
      </div>
    </div>
  );
}
