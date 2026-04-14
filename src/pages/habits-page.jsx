import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLifeOSData } from "@/lib/lifeos-store";
import { cn } from "@/lib/utils";
import {
  Plus, Trash2, Check, Flame, Zap, RotateCcw,
  ChevronDown, AlertCircle, Target, Clock,
  X,
} from "lucide-react";

// ── Atomic Habits: Identity links ──
const IDENTITY_OPTIONS = [
  "Intizomli inson",
  "Fokusli inson",
  "Sog'lom inson",
  "Muntazam o'qiydigan inson",
  "Moliyaviy tartibli inson",
  "Aktiv inson",
];

// ── Habit Grid (40 kun) ──
function HabitGrid({ completedDays }) {
  return (
    <div className="grid grid-cols-10 gap-1.5">
      {Array.from({ length: 40 }, (_, i) => (
        <div
          key={i}
          className={cn(
            "h-4 rounded-sm transition-all duration-300",
            i < completedDays ? "bg-slate-900" : "bg-slate-100"
          )}
        />
      ))}
    </div>
  );
}

// ── Missed Day Handler ──
function MissedDayPrompt({ onDismiss }) {
  const [reason, setReason] = useState("");
  const reasons = [
    { key: "forgot", label: "Unutdim" },
    { key: "no_time", label: "Vaqt yo'q edi" },
    { key: "low_energy", label: "Kuch yo'q edi" },
    { key: "distracted", label: "Chalg'idim" },
    { key: "unrealistic", label: "Maqsad og'ir edi" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
        <p className="text-sm font-semibold text-slate-700">
          Bugun bajarilmadi. Sababi nima?
        </p>
        <p className="text-xs text-slate-400">
          Bir o'tkazib yuborish tizimni buzmaydi. Ertaga qayta boshlang.
        </p>
        <div className="flex flex-wrap gap-2">
          {reasons.map((r) => (
            <button
              key={r.key}
              onClick={() => setReason(r.key)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all",
                reason === r.key
                  ? "bg-slate-900 text-white"
                  : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-100"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => onDismiss(reason)}
          className="w-full py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 inline mr-1.5" />
          Ertaga davom etaman
        </button>
      </div>
    </motion.div>
  );
}

// ── Habit Card ──
function HabitCard({ habit, onCheckIn, onDelete }) {
  const [showMissed, setShowMissed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const completionRate = habit.completedDays > 0
    ? Math.round((habit.completedDays / 40) * 100)
    : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Main Row */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 pr-3">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">{habit.title}</h3>
            <div className="flex items-center gap-3 mt-1.5">
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
                <Flame className="w-3 h-3" />
                {habit.streak} kun
              </div>
              <div className="text-[11px] font-semibold text-slate-400">
                Eng uzun: {habit.longestStreak}
              </div>
              <div className="text-[11px] font-semibold text-slate-400">
                {completionRate}%
              </div>
            </div>
          </div>

          {/* Check-in button */}
          <button
            onClick={() => onCheckIn(habit.id)}
            className={cn(
              "h-11 px-5 rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center gap-2",
              habit.completedToday
                ? "bg-slate-100 text-slate-500 hover:bg-slate-200"
                : "bg-slate-900 text-white hover:bg-slate-800"
            )}
          >
            {habit.completedToday ? (
              <>Bajarildi</>
            ) : (
              <><Check className="w-4 h-4" /> Check-in</>
            )}
          </button>
        </div>

        {/* Grid */}
        <HabitGrid completedDays={habit.completedDays} />

        {/* Footer */}
        <div className="flex items-center justify-between mt-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <span className="text-slate-700">{habit.completedDays}</span> / 40 kun
            <span className="mx-2 opacity-40">·</span>
            <span className={habit.completedToday ? "text-slate-600" : "text-slate-400"}>
              {habit.completedToday ? "Bugun bajarilgan" : "Kutilmoqda"}
            </span>
          </div>

          <div className="flex gap-2">
            {!habit.completedToday && (
              <button
                onClick={() => setShowMissed(!showMissed)}
                className="text-[11px] text-slate-400 hover:text-slate-600 font-semibold transition-colors"
              >
                O'tkazib yuborish
              </button>
            )}
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <ChevronDown className={cn("w-4 h-4 transition-transform", expanded && "rotate-180")} />
            </button>
          </div>
        </div>
      </div>

      {/* Missed Day Prompt */}
      <AnimatePresence>
        {showMissed && !habit.completedToday && (
          <div className="px-5 pb-4">
            <MissedDayPrompt onDismiss={() => setShowMissed(false)} />
          </div>
        )}
      </AnimatePresence>

      {/* Expanded Details: Atomic Habits Model */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 border-t border-slate-100 space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                ATOMIC HABITS MODEL
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">CUE</p>
                  <p className="text-xs text-slate-600">Qachon boshlanadi?</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">REWARD</p>
                  <p className="text-xs text-slate-600">Mukofot nima?</p>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">IDENTITY</p>
                <p className="text-xs text-slate-600">
                  "Har safar buni qilsangiz, siz <span className="font-bold text-slate-800">intizomli inson</span>ga aylanyapsiz."
                </p>
              </div>

              <button
                onClick={() => onDelete(habit.id)}
                className="flex items-center gap-2 text-xs text-red-500 hover:text-red-600 font-semibold transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                O'chirish
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main Habits Page ──
export default function HabitsPage() {
  const { data, actions } = useLifeOSData();
  const [newTitle, setNewTitle] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedIdentity, setSelectedIdentity] = useState("");

  const todayDone = useMemo(
    () => data.habits.filter((h) => h.completedToday).length,
    [data.habits]
  );

  const longestStreak = useMemo(
    () => data.habits.reduce((max, h) => Math.max(max, h.longestStreak), 0),
    [data.habits]
  );

  const consistency = useMemo(() => {
    if (data.habits.length === 0) return 0;
    const total = data.habits.reduce((sum, h) => sum + h.completedDays, 0);
    return Math.round((total / (data.habits.length * 40)) * 100);
  }, [data.habits]);

  const addHabit = () => {
    if (!newTitle.trim()) return;
    if (data.habits.length >= 8) return;
    actions.addHabit(newTitle.trim());
    setNewTitle("");
    setSelectedIdentity("");
    setShowForm(false);
  };

  return (
    <div className="flex flex-col gap-5 p-4 lg:p-6 max-w-[900px]">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-400">
            SYSTEM
          </p>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-0.5">Odatlar</h1>
          <p className="text-sm text-slate-400 mt-1">Kichik qadamlar. Katta o'zgarish.</p>
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
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Aktiv", value: data.habits.length },
          { label: "Bugun", value: `${todayDone}/${data.habits.length}` },
          { label: "Eng uzun", value: longestStreak },
          { label: "Barqarorlik", value: `${consistency}%` },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-2xl p-4 bg-white border border-slate-200">
            <p className="text-xl font-black text-slate-900">{value}</p>
            <p className="text-[9px] font-bold uppercase tracking-wide mt-1 text-slate-400">{label}</p>
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
            <div className="rounded-2xl p-5 bg-white border border-slate-200 space-y-4">
              <p className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-500">
                YANGI ODAT — ATOMIC HABITS MODEL
              </p>

              {data.habits.length >= 8 && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 text-slate-500 text-[11px]">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Yangi userga 3-5 ta odatdan boshlash tavsiya etiladi. Maksimum 8 ta.
                </div>
              )}

              {/* Title */}
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest mb-1 text-slate-400">Odat nomi</p>
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Masalan: Har kuni 10 bet o'qish"
                  className="w-full text-sm font-semibold outline-none border-b border-slate-200 pb-2 text-slate-800 placeholder:text-slate-300 focus:border-slate-400 transition-colors"
                />
              </div>

              {/* Atomic Habits: Cue, Craving, Response, Reward */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                    <Clock className="w-3 h-3 inline mr-1" />CUE
                  </p>
                  <p className="text-[11px] text-slate-500">Qachon boshlanadi?</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                    <Zap className="w-3 h-3 inline mr-1" />RESPONSE
                  </p>
                  <p className="text-[11px] text-slate-500">Eng kichik qadam</p>
                </div>
              </div>

              {/* Identity Link */}
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest mb-2 text-slate-400">
                  <Target className="w-3 h-3 inline mr-1" />QAYSI IDENTITYGA XIZMAT QILADI?
                </p>
                <div className="flex flex-wrap gap-2">
                  {IDENTITY_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setSelectedIdentity(selectedIdentity === opt ? "" : opt)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all",
                        selectedIdentity === opt
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {selectedIdentity && (
                <div className="rounded-xl bg-slate-900 p-3 text-white">
                  <p className="text-xs">
                    "Har safar buni qilsangiz, siz <span className="font-bold">{selectedIdentity}</span>ga aylanyapsiz."
                  </p>
                </div>
              )}

              <button
                onClick={addHabit}
                disabled={!newTitle.trim() || data.habits.length >= 8}
                className={cn(
                  "w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all active:scale-[0.98]",
                  newTitle.trim() && data.habits.length < 8
                    ? "bg-slate-900 text-white hover:bg-slate-800"
                    : "bg-slate-100 text-slate-300 cursor-not-allowed"
                )}
              >
                QO'SHISH
              </button>

              <p className="text-[10px] text-slate-400 text-center">
                Boshlang'ich tavsiya: Suv ichish, Kitob o'qish, Jismoniy mashq, Deep work, Vaqtida uxlash
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Habit Cards */}
      <div className="space-y-4">
        <AnimatePresence>
          {data.habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onCheckIn={actions.toggleHabitCheckIn}
              onDelete={actions.removeHabit}
            />
          ))}
        </AnimatePresence>

        {data.habits.length === 0 && (
          <div className="flex flex-col items-center py-16 text-slate-300">
            <Zap className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-lg font-bold text-slate-400">Hali odat yo'q</p>
            <p className="text-sm text-slate-400 mt-1">Birinchi odatingizni qo'shing</p>
          </div>
        )}
      </div>
    </div>
  );
}
