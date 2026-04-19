import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  Repeat,
  BookOpen,
  HeartPulse,
  Wallet,
  Brain,
  Zap,
  Trophy,
  Clock,
  Sun,
  Droplets,
  Dumbbell,
  Moon,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
} from "lucide-react";

// ── Step transition variants ─────────────────────────────────────────────────
const stepVariants = {
  enter: (dir) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

// ── Data ─────────────────────────────────────────────────────────────────────
const PROBLEMS = [
  { id: "focus", label: "Diqqatim tez chalg'iydi", icon: Zap },
  { id: "habits", label: "Odat ushlay olmayman", icon: Repeat },
  { id: "plans", label: "Rejam bo'lsa ham bajarmayman", icon: Target },
  { id: "order", label: "Kunlarim tartibsiz", icon: Clock },
  { id: "finish", label: "Ko'p narsa boshlayman, tugatmayman", icon: Brain },
  { id: "phone", label: "Telefon ko'p vaqtimni oladi", icon: Moon },
];

const IDENTITIES = [
  { id: "focused", label: "Fokusli inson", icon: Target },
  { id: "disciplined", label: "Intizomli inson", icon: Zap },
  { id: "healthy", label: "Sog'lom inson", icon: HeartPulse },
  { id: "financial", label: "Moliyaviy tartibli inson", icon: Wallet },
  { id: "reader", label: "Ko'proq o'qiydigan inson", icon: BookOpen },
];

const LIFE_AREAS = [
  { id: "focus", label: "Focus", icon: Target },
  { id: "habits", label: "Habits", icon: Repeat },
  { id: "health", label: "Health", icon: HeartPulse },
  { id: "finance", label: "Finance", icon: Wallet },
  { id: "reading", label: "Reading", icon: BookOpen },
  { id: "skills", label: "Skills", icon: Brain },
];

const STARTER_HABITS = [
  { id: "wake", label: "Erta turish", icon: Sun },
  { id: "water", label: "Suv ichish", icon: Droplets },
  { id: "read", label: "Kitob o'qish", icon: BookOpen },
  { id: "deepwork", label: "Deep work session", icon: Brain },
  { id: "exercise", label: "Jismoniy mashq", icon: Dumbbell },
  { id: "sleep", label: "Vaqtida uxlash", icon: Moon },
];

const TOTAL_STEPS = 9;

// ── Reusable selectable card ─────────────────────────────────────────────────
const SelectCard = ({ icon: Icon, label, selected, onToggle }) => (
  <motion.button
    type="button"
    whileTap={{ scale: 0.97 }}
    onClick={onToggle}
    className={`relative flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left text-sm font-medium transition-colors
      ${
        selected
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
      }`}
  >
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
        selected ? "bg-white/15" : "bg-slate-100"
      }`}
    >
      <Icon className="h-4 w-4" />
    </span>
    <span className="flex-1">{label}</span>
    {selected && (
      <Check className="h-4 w-4 shrink-0 text-white" />
    )}
  </motion.button>
);

// ── Toggle habit card ────────────────────────────────────────────────────────
const HabitToggle = ({ icon: Icon, label, active, onToggle }) => (
  <motion.button
    type="button"
    whileTap={{ scale: 0.97 }}
    onClick={onToggle}
    className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left text-sm font-medium transition-colors
      ${
        active
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
      }`}
  >
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
        active ? "bg-white/15" : "bg-slate-100"
      }`}
    >
      <Icon className="h-4 w-4" />
    </span>
    <span className="flex-1">{label}</span>
    <span
      className={`flex h-6 w-10 items-center rounded-full p-0.5 transition-colors ${
        active ? "justify-end bg-white/25" : "justify-start bg-slate-200"
      }`}
    >
      <span
        className={`h-5 w-5 rounded-full transition-colors ${
          active ? "bg-white" : "bg-slate-400"
        }`}
      />
    </span>
  </motion.button>
);

// ── Progress bar ─────────────────────────────────────────────────────────────
const ProgressBar = ({ current, total }) => (
  <div className="flex items-center gap-1.5">
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
          i <= current ? "bg-slate-900" : "bg-slate-200"
        }`}
      />
    ))}
  </div>
);

// ── Main component ───────────────────────────────────────────────────────────
const WelcomePage = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [language, setLanguage] = useState("uz");
  const [problems, setProblems] = useState([]);
  const [identities, setIdentities] = useState([]);
  const [lifeAreas, setLifeAreas] = useState([]);
  const [yearlyDirection, setYearlyDirection] = useState("");
  const [habits, setHabits] = useState(["wake", "water", "read"]);

  const goNext = () => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  };

  const toggleItem = (list, setList, id) => {
    setList((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // ── Step renderers ───────────────────────────────────────────────────────

  const renderStep0 = () => (
    <div className="flex flex-col items-center text-center space-y-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="h-20 w-20 rounded-2xl bg-slate-950 flex items-center justify-center shadow-2xl shadow-slate-900/25"
      >
        <span className="text-3xl font-black text-white tracking-tighter">L</span>
      </motion.div>

      <div className="space-y-3">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
          LifeOS
        </h1>
        <p className="text-sm text-slate-500 font-medium">
          Shaxsiy hayot operatsion tizimi
        </p>
      </div>

      <p className="text-slate-600 text-sm leading-relaxed max-w-xs">
        Fokus, odat, tartib va progress quramiz.
      </p>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={goNext}
        className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-slate-900/20 transition-transform hover:scale-[1.02]"
      >
        Boshlash
        <ArrowRight className="h-4 w-4" />
      </motion.button>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
          Tilni tanlang
        </h2>
        <p className="text-sm text-slate-500">
          Keyinroq ham o'zgartirish mumkin
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { id: "uz", label: "O'zbekcha", sub: "Asosiy" },
          { id: "en", label: "English", sub: "Secondary" },
        ].map((lang) => (
          <motion.button
            key={lang.id}
            whileTap={{ scale: 0.97 }}
            onClick={() => setLanguage(lang.id)}
            className={`flex flex-col items-center gap-1 rounded-2xl border px-6 py-6 transition-colors
              ${
                language === lang.id
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
              }`}
          >
            <span className="text-base font-bold">{lang.label}</span>
            <span
              className={`text-xs ${
                language === lang.id ? "text-slate-300" : "text-slate-400"
              }`}
            >
              {lang.sub}
            </span>
          </motion.button>
        ))}
      </div>

      <div className="flex justify-end">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={goNext}
          className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-900/15 transition-transform hover:scale-[1.02]"
        >
          Davom etish
          <ArrowRight className="h-4 w-4" />
        </motion.button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
          Sizni eng ko'p nima qiynayapti?
        </h2>
        <p className="text-sm text-slate-500">
          Bir yoki bir nechta tanlang
        </p>
      </div>

      <div className="grid gap-2.5">
        {PROBLEMS.map((p) => (
          <SelectCard
            key={p.id}
            icon={p.icon}
            label={p.label}
            selected={problems.includes(p.id)}
            onToggle={() => toggleItem(problems, setProblems, p.id)}
          />
        ))}
      </div>

      <div className="flex justify-end">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={goNext}
          disabled={problems.length === 0}
          className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-900/15 transition-transform hover:scale-[1.02] disabled:opacity-40 disabled:pointer-events-none"
        >
          Davom etish
          <ArrowRight className="h-4 w-4" />
        </motion.button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
          Kim bo'lishni xohlaysiz?
        </h2>
        <p className="text-sm text-slate-500">
          O'zingizni qanday ko'rmoqchisiz?
        </p>
      </div>

      <div className="grid gap-2.5">
        {IDENTITIES.map((item) => (
          <SelectCard
            key={item.id}
            icon={item.icon}
            label={item.label}
            selected={identities.includes(item.id)}
            onToggle={() => toggleItem(identities, setIdentities, item.id)}
          />
        ))}
      </div>

      <div className="flex justify-end">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={goNext}
          disabled={identities.length === 0}
          className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-900/15 transition-transform hover:scale-[1.02] disabled:opacity-40 disabled:pointer-events-none"
        >
          Davom etish
          <ArrowRight className="h-4 w-4" />
        </motion.button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
          Qaysi sohalarni rivojlantirmoqchisiz?
        </h2>
        <p className="text-sm text-slate-500">
          Tizimingiz shu sohalar asosida quriladi
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {LIFE_AREAS.map((area) => (
          <motion.button
            key={area.id}
            whileTap={{ scale: 0.97 }}
            onClick={() => toggleItem(lifeAreas, setLifeAreas, area.id)}
            className={`flex flex-col items-center gap-2 rounded-2xl border px-4 py-5 transition-colors
              ${
                lifeAreas.includes(area.id)
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
              }`}
          >
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                lifeAreas.includes(area.id) ? "bg-white/15" : "bg-slate-100"
              }`}
            >
              <area.icon className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold">{area.label}</span>
          </motion.button>
        ))}
      </div>

      <div className="flex justify-end">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={goNext}
          disabled={lifeAreas.length === 0}
          className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-900/15 transition-transform hover:scale-[1.02] disabled:opacity-40 disabled:pointer-events-none"
        >
          Davom etish
          <ArrowRight className="h-4 w-4" />
        </motion.button>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
          2026 yilgi asosiy yo'nalishingiz
        </h2>
        <p className="text-sm text-slate-500">
          Bir jumla bilan yozing
        </p>
      </div>

      <div className="space-y-3">
        <textarea
          value={yearlyDirection}
          onChange={(e) => setYearlyDirection(e.target.value)}
          placeholder="Masalan: Sog'lom turmush tarzi va moliyaviy erkinlikka erishish"
          rows={3}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 resize-none"
        />
        <div className="flex flex-wrap gap-2">
          {[
            "Intizomli hayot qurishni boshlayman",
            "Kasbiy ko'nikmalarimni oshiraman",
            "Sog'lom turmush tarziga o'taman",
          ].map((hint) => (
            <button
              key={hint}
              type="button"
              onClick={() => setYearlyDirection(hint)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500 transition-colors hover:border-slate-400 hover:text-slate-700"
            >
              {hint}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={goNext}
          disabled={yearlyDirection.trim().length === 0}
          className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-900/15 transition-transform hover:scale-[1.02] disabled:opacity-40 disabled:pointer-events-none"
        >
          Davom etish
          <ArrowRight className="h-4 w-4" />
        </motion.button>
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
          Boshlang'ich odatlaringizni tanlang
        </h2>
        <p className="text-sm text-slate-500">
          Kichikdan boshlang, keyin kengaytiring
        </p>
      </div>

      <div className="grid gap-2.5">
        {STARTER_HABITS.map((h) => (
          <HabitToggle
            key={h.id}
            icon={h.icon}
            label={h.label}
            active={habits.includes(h.id)}
            onToggle={() => toggleItem(habits, setHabits, h.id)}
          />
        ))}
      </div>

      <div className="flex justify-end">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={goNext}
          disabled={habits.length === 0}
          className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-900/15 transition-transform hover:scale-[1.02] disabled:opacity-40 disabled:pointer-events-none"
        >
          Davom etish
          <ArrowRight className="h-4 w-4" />
        </motion.button>
      </div>
    </div>
  );

  const activeHabits = STARTER_HABITS.filter((h) => habits.includes(h.id));

  const renderStep7 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
          Birinchi kun tizimingiz
        </h2>
        <p className="text-sm text-slate-500">
          Sizning kunlik ritualingiz tayyor
        </p>
      </div>

      <div className="space-y-3">
        {/* Top 3 tasks */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Target className="h-3.5 w-3.5" />
            Top 3 vazifa
          </div>
          {["Asosiy vazifa #1", "Asosiy vazifa #2", "Asosiy vazifa #3"].map(
            (task, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-600"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-slate-300 text-[10px] font-bold text-slate-400">
                  {i + 1}
                </span>
                {task}
              </div>
            )
          )}
        </div>

        {/* Deep work block */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Brain className="h-3.5 w-3.5" />
            1 Deep work blok
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
            <Clock className="h-4 w-4 text-slate-400" />
            90 daqiqa — chuqur ish sessiyasi
          </div>
        </div>

        {/* Selected habits */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Repeat className="h-3.5 w-3.5" />
            Tanlangan odatlar
          </div>
          <div className="flex flex-wrap gap-2">
            {activeHabits.map((h) => (
              <span
                key={h.id}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-medium text-white"
              >
                <h.icon className="h-3 w-3" />
                {h.label}
              </span>
            ))}
          </div>
        </div>

        {/* Evening reflection */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Moon className="h-3.5 w-3.5" />
            Kechki refleksiya
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
            <Sparkles className="h-4 w-4 text-slate-400" />
            Kunni baholash va ertaga reja
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={goNext}
          className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-900/15 transition-transform hover:scale-[1.02]"
        >
          Yakunlash
          <ArrowRight className="h-4 w-4" />
        </motion.button>
      </div>
    </div>
  );

  const renderStep8 = () => (
    <div className="flex flex-col items-center text-center space-y-8">
      {/* Animated celebration */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.1 }}
        className="relative"
      >
        <div className="h-24 w-24 rounded-3xl bg-slate-950 flex items-center justify-center shadow-2xl shadow-slate-900/30">
          <Trophy className="h-10 w-10 text-white" />
        </div>

        {/* Sparkle dots */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <motion.span
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.2, 0], opacity: [0, 1, 0] }}
            transition={{
              duration: 1.4,
              delay: 0.3 + i * 0.12,
              repeat: Infinity,
              repeatDelay: 2,
            }}
            className="absolute h-2 w-2 rounded-full bg-slate-400"
            style={{
              top: `${50 + 52 * Math.sin((i * Math.PI * 2) / 6)}%`,
              left: `${50 + 52 * Math.cos((i * Math.PI * 2) / 6)}%`,
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="space-y-3"
      >
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
          Siz tayyor!
        </h2>
        <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">
          Tizimingiz qurildi. Endi har kuni LifeOS bilan hayotingizni boshqaring.
        </p>
      </motion.div>

      {/* Summary badges */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="flex flex-wrap justify-center gap-2"
      >
        {problems.length > 0 && (
          <span className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
            <Zap className="h-3 w-3" />
            {problems.length} muammo aniqlandi
          </span>
        )}
        {identities.length > 0 && (
          <span className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
            <Target className="h-3 w-3" />
            {identities.length} identifikatsiya
          </span>
        )}
        {habits.length > 0 && (
          <span className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
            <Repeat className="h-3 w-3" />
            {habits.length} odat tanlandi
          </span>
        )}
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate("/dashboard")}
        className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-slate-900/20 transition-transform hover:scale-[1.02]"
      >
        Dashboardga o'tish
        <ArrowRight className="h-4 w-4" />
      </motion.button>
    </div>
  );

  const STEP_RENDERERS = [
    renderStep0,
    renderStep1,
    renderStep2,
    renderStep3,
    renderStep4,
    renderStep5,
    renderStep6,
    renderStep7,
    renderStep8,
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top bar with progress and back button */}
      {step > 0 && step < TOTAL_STEPS - 1 && (
        <div className="sticky top-0 z-50 bg-slate-50/80 backdrop-blur-md border-b border-slate-100">
          <div className="mx-auto max-w-lg px-5 py-3 space-y-3">
            <div className="flex items-center justify-between">
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={goBack}
                className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Orqaga
              </motion.button>
              <span className="text-xs font-semibold text-slate-400 tabular-nums">
                {step + 1} / {TOTAL_STEPS}
              </span>
            </div>
            <ProgressBar current={step} total={TOTAL_STEPS} />
          </div>
        </div>
      )}

      {/* Step content */}
      <div className="flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {STEP_RENDERERS[step]()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
