import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun,
  AlertCircle,
  X,
  Target,
  Calendar,
  ChevronDown,
  ChevronUp,
  Save,
  BookOpen,
  Brain,
  TrendingUp,
  Clock,
} from "lucide-react";

// ── Constants ────────────────────────────────────────────────────────────────

const DAILY_PROMPTS = [
  { key: "best", label: "Bugun eng yaxshi qilgan ishingiz nima?", Icon: Sun },
  { key: "distraction", label: "Nima sizni chalg'itdi?", Icon: AlertCircle },
  { key: "undone", label: "Nima bajarilmadi va nega?", Icon: X },
  { key: "tomorrow", label: "Ertaga bitta eng muhim ish nima?", Icon: Target },
];

const WEEKLY_PROMPTS = [
  { key: "worked", label: "Bu hafta nima ishladi?" },
  { key: "strongHabit", label: "Qaysi odat eng kuchli bo'ldi?" },
  { key: "brokenHabit", label: "Qaysi odat eng ko'p buzildi?" },
  { key: "deepWork", label: "Necha soat deep work qildingiz?" },
  { key: "change", label: "Keyingi hafta nima o'zgarishi kerak?" },
];

const MOODS = [
  { value: 1, label: "Juda yomon", emoji: "😞" },
  { value: 2, label: "Yomon", emoji: "😕" },
  { value: 3, label: "O'rtacha", emoji: "😐" },
  { value: 4, label: "Yaxshi", emoji: "🙂" },
  { value: 5, label: "Ajoyib", emoji: "😄" },
];

const TABS = [
  { key: "daily", label: "Kunlik" },
  { key: "weekly", label: "Haftalik" },
];

function todayStr() {
  return new Date().toLocaleDateString("uz-UZ", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function shortDate(iso) {
  return new Date(iso).toLocaleDateString("uz-UZ", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ── Animation variants ───────────────────────────────────────────────────────

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.3, ease: "easeOut" },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.06 } },
};

// ── Sub-components ───────────────────────────────────────────────────────────

function TabToggle({ activeTab, onChange }) {
  return (
    <div className="inline-flex rounded-xl bg-slate-100 p-1">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`relative px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
            activeTab === tab.key
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function PromptTextarea({ Icon, label, value, onChange, index }) {
  return (
    <motion.div
      variants={fadeUp}
      className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3"
    >
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
            <Icon className="h-4 w-4 text-slate-600" />
          </div>
        )}
        <label className="text-sm font-semibold text-slate-700">{label}</label>
      </div>
      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Yozing..."
        className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all duration-200"
      />
    </motion.div>
  );
}

function MoodSelector({ mood, onChange }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
          <Brain className="h-4 w-4 text-slate-600" />
        </div>
        <span className="text-sm font-semibold text-slate-700">Kayfiyat</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {MOODS.map((m) => (
          <button
            key={m.value}
            onClick={() => onChange(m.value)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 ${
              mood === m.value
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <span>{m.emoji}</span>
            <span>{m.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ProductivityScore({ score, onChange }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
          <TrendingUp className="h-4 w-4 text-slate-600" />
        </div>
        <span className="text-sm font-semibold text-slate-700">
          Unumdorlik bahosi
        </span>
        {score > 0 && (
          <span className="ml-auto text-lg font-bold text-slate-900">
            {score}/10
          </span>
        )}
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all duration-200 ${
              score === n
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

function ReflectionCard({ reflection, defaultExpanded = false }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const moodObj = MOODS.find((m) => m.value === reflection.mood);
  const firstAnswer =
    reflection.type === "daily"
      ? reflection.answers?.best
      : reflection.answers?.worked;
  const preview =
    firstAnswer && firstAnswer.length > 80
      ? firstAnswer.slice(0, 80) + "..."
      : firstAnswer || "—";

  return (
    <motion.div
      variants={fadeUp}
      className="rounded-2xl border border-slate-200 bg-white overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 shrink-0">
            <Calendar className="h-4 w-4 text-slate-500" />
          </div>
          <div className="text-left min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-slate-800">
                {shortDate(reflection.date)}
              </p>
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                {reflection.type === "daily" ? "Kunlik" : "Haftalik"}
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate mt-0.5">{preview}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 ml-3">
          {moodObj && <span className="text-lg">{moodObj.emoji}</span>}
          {reflection.productivityScore > 0 && (
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
              {reflection.productivityScore}/10
            </span>
          )}
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-slate-100 pt-3">
              {reflection.type === "daily"
                ? DAILY_PROMPTS.map((p) => (
                    <div key={p.key}>
                      <p className="text-xs font-semibold text-slate-500 mb-1">
                        {p.label}
                      </p>
                      <p className="text-sm text-slate-700">
                        {reflection.answers[p.key] || "—"}
                      </p>
                    </div>
                  ))
                : WEEKLY_PROMPTS.map((p) => (
                    <div key={p.key}>
                      <p className="text-xs font-semibold text-slate-500 mb-1">
                        {p.label}
                      </p>
                      <p className="text-sm text-slate-700">
                        {reflection.answers[p.key] || "—"}
                      </p>
                    </div>
                  ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function PatternsSection({ reflections }) {
  const dailyReflections = reflections.filter((r) => r.type === "daily");

  const averageMood = useMemo(() => {
    const withMood = dailyReflections.filter((r) => r.mood > 0);
    if (withMood.length === 0) return 0;
    return (
      withMood.reduce((sum, r) => sum + r.mood, 0) / withMood.length
    ).toFixed(1);
  }, [dailyReflections]);

  const streak = useMemo(() => {
    if (dailyReflections.length === 0) return 0;
    const sorted = [...dailyReflections].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    let count = 1;
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1].date);
      const curr = new Date(sorted[i].date);
      const diffDays = Math.round((prev - curr) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        count++;
      } else {
        break;
      }
    }
    return count;
  }, [dailyReflections]);

  const commonDistraction = useMemo(() => {
    const distractions = dailyReflections
      .map((r) => r.answers?.distraction)
      .filter(Boolean)
      .filter((d) => d.trim().length > 0);
    if (distractions.length === 0) return "—";
    // Simple: return most recent one as representative
    return distractions[0];
  }, [dailyReflections]);

  const moodEmoji = MOODS.find(
    (m) => m.value === Math.round(Number(averageMood))
  );

  return (
    <motion.div variants={fadeUp} className="space-y-4">
      <div className="flex items-center gap-2">
        <Brain className="h-5 w-5 text-slate-400" />
        <h2 className="text-lg font-bold text-slate-800">Tahlil</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
            O'rtacha kayfiyat
          </p>
          <div className="flex items-center gap-2">
            {moodEmoji && <span className="text-2xl">{moodEmoji.emoji}</span>}
            <span className="text-2xl font-bold text-slate-900">
              {averageMood > 0 ? averageMood : "—"}
            </span>
            <span className="text-xs text-slate-400">/5</span>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
            Refleksiya seriyasi
          </p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-slate-900">{streak}</span>
            <span className="text-xs text-slate-400">kun</span>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
            Eng so'nggi chalg'ish
          </p>
          <p className="text-sm font-medium text-slate-700 line-clamp-2">
            {commonDistraction}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function ReflectionPage() {
  const [activeTab, setActiveTab] = useState("daily");

  // Daily state
  const [dailyAnswers, setDailyAnswers] = useState({
    best: "",
    distraction: "",
    undone: "",
    tomorrow: "",
  });
  const [mood, setMood] = useState(0);
  const [productivityScore, setProductivityScore] = useState(0);

  // Weekly state
  const [weeklyAnswers, setWeeklyAnswers] = useState({
    worked: "",
    strongHabit: "",
    brokenHabit: "",
    deepWork: "",
    change: "",
  });

  // Saved reflections
  const [savedReflections, setSavedReflections] = useState([]);

  const updateDailyAnswer = (key, value) =>
    setDailyAnswers((prev) => ({ ...prev, [key]: value }));

  const updateWeeklyAnswer = (key, value) =>
    setWeeklyAnswers((prev) => ({ ...prev, [key]: value }));

  const canSaveDaily =
    Object.values(dailyAnswers).some((v) => v.trim().length > 0) ||
    mood > 0 ||
    productivityScore > 0;

  const canSaveWeekly = Object.values(weeklyAnswers).some(
    (v) => v.trim().length > 0
  );

  function handleSaveDaily() {
    if (!canSaveDaily) return;
    const entry = {
      id: Date.now(),
      type: "daily",
      date: new Date().toISOString(),
      answers: { ...dailyAnswers },
      mood,
      productivityScore,
    };
    setSavedReflections((prev) => [entry, ...prev]);
    setDailyAnswers({ best: "", distraction: "", undone: "", tomorrow: "" });
    setMood(0);
    setProductivityScore(0);
  }

  function handleSaveWeekly() {
    if (!canSaveWeekly) return;
    const entry = {
      id: Date.now(),
      type: "weekly",
      date: new Date().toISOString(),
      answers: { ...weeklyAnswers },
      mood: 0,
      productivityScore: 0,
    };
    setSavedReflections((prev) => [entry, ...prev]);
    setWeeklyAnswers({
      worked: "",
      strongHabit: "",
      brokenHabit: "",
      deepWork: "",
      change: "",
    });
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Refleksiya
            </h1>
          </div>
          <TabToggle activeTab={activeTab} onChange={setActiveTab} />
        </div>

        {/* ── Active form ─────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {activeTab === "daily" ? (
            <motion.div
              key="daily"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              {/* Date */}
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Calendar className="h-4 w-4" />
                <span>{todayStr()}</span>
              </div>

              {/* Prompts */}
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="space-y-4"
              >
                {DAILY_PROMPTS.map((prompt, i) => (
                  <PromptTextarea
                    key={prompt.key}
                    Icon={prompt.Icon}
                    label={prompt.label}
                    value={dailyAnswers[prompt.key]}
                    onChange={(val) => updateDailyAnswer(prompt.key, val)}
                    index={i}
                  />
                ))}
              </motion.div>

              {/* Mood + Productivity */}
              <MoodSelector mood={mood} onChange={setMood} />
              <ProductivityScore
                score={productivityScore}
                onChange={setProductivityScore}
              />

              {/* Save */}
              <button
                onClick={handleSaveDaily}
                disabled={!canSaveDaily}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                Saqlash
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="weekly"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              {/* Date range hint */}
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Clock className="h-4 w-4" />
                <span>Haftalik refleksiya</span>
              </div>

              {/* Prompts */}
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="space-y-4"
              >
                {WEEKLY_PROMPTS.map((prompt) => (
                  <PromptTextarea
                    key={prompt.key}
                    label={prompt.label}
                    value={weeklyAnswers[prompt.key]}
                    onChange={(val) => updateWeeklyAnswer(prompt.key, val)}
                  />
                ))}
              </motion.div>

              {/* Summary stats placeholder */}
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-6 text-center">
                <TrendingUp className="h-6 w-6 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">
                  Haftalik statistika tez orada qo'shiladi
                </p>
              </div>

              {/* Save */}
              <button
                onClick={handleSaveWeekly}
                disabled={!canSaveWeekly}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                Saqlash
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Patterns ────────────────────────────────────────────────── */}
        {savedReflections.length > 0 && (
          <PatternsSection reflections={savedReflections} />
        )}

        {/* ── Past reflections journal ────────────────────────────────── */}
        {savedReflections.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-slate-400" />
              <h2 className="text-lg font-bold text-slate-800">Jurnal</h2>
              <span className="ml-auto text-xs font-semibold text-slate-400">
                {savedReflections.length} ta yozuv
              </span>
            </div>
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="space-y-3"
            >
              {savedReflections.map((ref) => (
                <ReflectionCard key={ref.id} reflection={ref} />
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* ── Empty state ─────────────────────────────────────────────── */}
        {savedReflections.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <BookOpen className="h-8 w-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-500">
              Hali refleksiya yozilmagan
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Yuqoridagi savollarni to'ldiring va saqlang
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
