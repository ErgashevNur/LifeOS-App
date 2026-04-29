import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { isPositive, adjustSystem } from "@/lib/goalParser";
import { analyzeGoal, generateSystem } from "@/lib/cloudyAI";
import { useLifeOSData } from "@/lib/lifeos-store";

// Phases: intro → goal → analyzing → system → confirm → adjust → name → done
const PHASES = ["intro", "goal", "analyzing", "system", "confirm", "name", "done"];

function phaseDotIndex(phase) {
  // Treat "analyzing" as still being on "goal" step for progress dots,
  // and "adjust" (if used) as still on "confirm".
  if (phase === "analyzing") return PHASES.indexOf("goal");
  return PHASES.indexOf(phase);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Header with progress dots ──────────────────────────────────────────────
function OnboardingHeader({ phase }) {
  const visibleSteps = ["intro", "goal", "system", "confirm", "name", "done"];
  const activeIdx = visibleSteps.indexOf(phase === "analyzing" ? "goal" : phase);

  return (
    <header className="sticky top-0 z-20 bg-[#FAFAF9]/85 backdrop-blur-md border-b border-black/[0.04]">
      <div className="max-w-md mx-auto px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-[14px]">☁️</div>
          <p className="text-[13px] font-semibold text-zinc-900 tracking-tight">Cloudy</p>
        </div>
        <div className="flex items-center gap-1.5">
          {visibleSteps.map((s, i) => (
            <div
              key={s}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === activeIdx ? "bg-violet-500 w-6" : i < activeIdx ? "bg-violet-300 w-1.5" : "bg-zinc-200 w-1.5",
              )}
            />
          ))}
        </div>
      </div>
    </header>
  );
}

// ─── Typing indicator ────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-[12px] shrink-0">☁️</div>
      <div className="px-4 py-3 bg-white border border-black/[0.06] rounded-2xl rounded-bl-sm shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-violet-400"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Chat message bubble ─────────────────────────────────────────────────────
function OnboardingMessage({ role, children }) {
  if (role === "system_preview") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="my-2"
      >
        {children}
      </motion.div>
    );
  }

  const isUser = role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn("flex items-end gap-2", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-[12px] shrink-0">☁️</div>
      )}
      <div
        className={cn(
          "max-w-[78%] px-4 py-2.5 text-[14px] leading-relaxed",
          isUser
            ? "bg-violet-600 text-white rounded-2xl rounded-br-sm"
            : "bg-white border border-black/[0.06] text-zinc-900 rounded-2xl rounded-bl-sm shadow-[0_1px_2px_rgba(0,0,0,0.03)]",
        )}
      >
        {children}
      </div>
    </motion.div>
  );
}

// ─── Analyzing animation (4 sequential steps) ───────────────────────────────
const ANALYZING_STEPS = [
  "Maqsadingni o'qiyapman...",
  "Toifani aniqlayapman...",
  "Fan-asosli odatlarni jamlayapman...",
  "Sizga mos rejani tuzayapman...",
];

function AnalyzingAnimation({ onDone }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      for (let i = 0; i < ANALYZING_STEPS.length; i++) {
        if (cancelled) return;
        setStep(i);
        await delay(700);
      }
      if (!cancelled) onDone?.();
    };
    void run();
    return () => { cancelled = true; };
  }, [onDone]);

  return (
    <div className="flex items-end gap-2">
      <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-[12px] shrink-0">☁️</div>
      <div className="px-4 py-3 bg-white border border-black/[0.06] rounded-2xl rounded-bl-sm shadow-[0_1px_2px_rgba(0,0,0,0.03)] min-w-[220px]">
        <div className="flex flex-col gap-1.5">
          {ANALYZING_STEPS.slice(0, step + 1).map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-2 text-[12.5px]"
            >
              {i < step ? (
                <Check className="w-3.5 h-3.5 text-violet-500" strokeWidth={3} />
              ) : (
                <motion.div
                  className="w-3 h-3 rounded-full border-2 border-violet-400 border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                />
              )}
              <span className={cn(i < step ? "text-zinc-500" : "text-zinc-900 font-medium")}>{s}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── System preview card ────────────────────────────────────────────────────
function SystemPreviewCard({ system }) {
  if (!system) return null;
  return (
    <div className="w-full p-4 rounded-2xl bg-violet-50/70 border border-violet-100">
      <div className="flex items-start gap-3 mb-3">
        <div className="text-[28px] leading-none">{system.goalEmoji}</div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-violet-600 uppercase tracking-wider">Maqsad</p>
          <p className="text-[14px] font-semibold text-zinc-900 leading-snug">{system.goalTitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="p-2.5 rounded-xl bg-white/70 border border-violet-100">
          <p className="text-[10px] font-semibold text-violet-500 uppercase tracking-wider">Haftalik</p>
          <p className="text-[13px] font-bold text-zinc-900 mt-0.5">{system.weeklyTime}</p>
        </div>
        <div className="p-2.5 rounded-xl bg-white/70 border border-violet-100">
          <p className="text-[10px] font-semibold text-violet-500 uppercase tracking-wider">Kunlik</p>
          <p className="text-[13px] font-bold text-zinc-900 mt-0.5">{system.dailyTime}</p>
        </div>
      </div>

      <div className="mb-3">
        <p className="text-[11px] font-semibold text-violet-600 uppercase tracking-wider mb-1.5">Odatlar</p>
        <div className="flex flex-col gap-1.5">
          {system.habits.map((h, i) => (
            <div key={i} className="flex items-center gap-2.5 p-2 rounded-lg bg-white/80 border border-violet-100/60">
              <span className="text-[16px]">{h.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[12.5px] font-semibold text-zinc-900 truncate">{h.name}</p>
                <p className="text-[11px] text-zinc-500 truncate">
                  {h.scheduledTime} · {h.minimalVersion}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-3">
        <p className="text-[11px] font-semibold text-violet-600 uppercase tracking-wider mb-1.5">Bosqichlar</p>
        <div className="flex flex-col gap-1">
          {system.milestones.map((m, i) => (
            <div key={i} className="flex items-center gap-2 text-[12px]">
              <span className="px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 font-bold text-[10px]">{m.day}-kun</span>
              <span className="text-zinc-700">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-2.5 rounded-xl bg-white border border-violet-200">
        <p className="text-[10px] font-semibold text-violet-500 uppercase tracking-wider mb-0.5">Birinchi qadam (bugun)</p>
        <p className="text-[12.5px] text-zinc-800 leading-relaxed">{system.firstStep}</p>
      </div>
    </div>
  );
}

// ─── Generic chip row ───────────────────────────────────────────────────────
function ChipRow({ options, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2 px-1">
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => onSelect(opt)}
          className="px-3.5 py-2 rounded-full bg-white border border-black/[0.08] text-[12.5px] font-semibold text-zinc-700 hover:border-violet-300 hover:bg-violet-50 transition-all"
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ─── Composer (text input) ──────────────────────────────────────────────────
function Composer({ value, onChange, onSubmit, placeholder, disabled }) {
  return (
    <div className="sticky bottom-0 z-30 bg-gradient-to-t from-[#FAFAF9] via-[#FAFAF9]/90 to-transparent pt-4 pb-4">
      <div className="max-w-md mx-auto px-5">
        <form
          onSubmit={e => { e.preventDefault(); if (!disabled && value.trim()) onSubmit(); }}
          className="flex items-end gap-2"
        >
          <textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            rows={1}
            disabled={disabled}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (!disabled && value.trim()) onSubmit();
              }
            }}
            className="flex-1 resize-none px-4 py-3 rounded-2xl border border-black/[0.08] bg-white text-[14px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300 transition-all disabled:opacity-50 max-h-[120px]"
          />
          <button
            type="submit"
            disabled={disabled || !value.trim()}
            className={cn(
              "w-11 h-11 rounded-2xl flex items-center justify-center transition-all shrink-0",
              value.trim() && !disabled
                ? "bg-violet-600 text-white shadow-[0_4px_12px_rgba(124,107,219,0.35)]"
                : "bg-zinc-100 text-zinc-400",
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Main page
// ────────────────────────────────────────────────────────────────────────────
export default function GoalOnboarding() {
  const navigate = useNavigate();
  const { actions } = useLifeOSData();

  const [phase, setPhase] = useState("intro");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [goalData, setGoalData] = useState(null);
  const [system, setSystem] = useState(null);
  const [userName, setUserName] = useState("");
  const [aiHistory, setAiHistory] = useState([]); // Claude conversation context
  const scrollRef = useRef(null);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const pushCloudy = async (text, typingMs = 600) => {
    setIsTyping(true);
    await delay(typingMs);
    setIsTyping(false);
    setMessages(prev => [...prev, { role: "cloudy", text }]);
  };

  const pushUser = (text) => {
    setMessages(prev => [...prev, { role: "user", text }]);
  };

  const pushSystemPreview = (sys) => {
    setMessages(prev => [...prev, { role: "system_preview", system: sys }]);
  };

  // ─── Intro on mount ───────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      await delay(300);
      if (cancelled) return;
      await pushCloudy("Salom! Men Cloudyman ☁️", 500);
      if (cancelled) return;
      await pushCloudy("Sizning maqsadingizni eshitishni juda istardim. Ayting — nimaga erishmoqchisiz?", 900);
      if (cancelled) return;
      setPhase("goal");
    };
    void run();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Phase: goal / clarify ────────────────────────────────────────────────
  const runAnalyze = async (text, history) => {
    setPhase("analyzing");
    const result = await analyzeGoal(text, history);

    // Need clarification?
    if (result?.needsClarification && result.clarifyingQuestions?.length) {
      setAiHistory([...history, { role: "user", content: text }]);
      setPhase("clarify");
      for (const q of result.clarifyingQuestions) {
        await pushCloudy(q, 600);
      }
      return;
    }

    if (!result?.parsed) {
      await pushCloudy("Hmm, maqsadni tushuna olmadim. Boshqacha qilib ayting?", 600);
      setPhase("goal");
      return;
    }

    setGoalData(result.parsed);
    if (result.parsed.motivation) {
      await pushCloudy(result.parsed.motivation, 700);
    }
    if (result.parsed.warning) {
      await pushCloudy(`⚠️ ${result.parsed.warning}`, 600);
    }
    await pushCloudy("Sizga mos shaxsiy tizimni tuzayapman...", 500);

    const sys = await generateSystem(result.parsed);
    if (!sys) {
      await pushCloudy("Tizim tuzilmadi. Qayta urinib ko'ramizmi?", 600);
      setPhase("goal");
      return;
    }
    setSystem(sys);

    await pushCloudy(`${result.parsed.emoji} ${result.parsed.label} — ajoyib maqsad! Mana shaxsiy reja:`, 600);
    pushSystemPreview(sys);
    if (sys.philosophy) {
      await pushCloudy(sys.philosophy, 800);
    }
    await pushCloudy("Bu reja sizga to'g'rimi? Yoki o'zgartirish kerakmi?", 700);
    setPhase("confirm");
  };

  const handleGoalSubmit = async () => {
    const text = input.trim();
    if (!text) return;
    pushUser(text);
    setInput("");
    await runAnalyze(text, []);
  };

  const handleClarifySubmit = async () => {
    const text = input.trim();
    if (!text) return;
    pushUser(text);
    setInput("");
    await runAnalyze(text, aiHistory);
  };

  // Kept for compatibility with AnalyzingAnimation; new flow no longer relies on it.
  const handleAnalyzingDone = () => {};

  // ─── Phase: confirm ──────────────────────────────────────────────────────
  const handleConfirmChip = async (choice) => {
    pushUser(choice);
    if (isPositive(choice) || choice === "Ha, boshlay" || choice === "Ajoyib") {
      await pushCloudy("Zo'r! Oxirgi savol — sizni qanday chaqirishim mumkin?", 600);
      setPhase("name");
    } else {
      await pushCloudy("Yaxshi. Nimani o'zgartiramiz? Masalan: \"kech vaqt\" yoki \"kam vaqt\"", 600);
      setPhase("adjust");
    }
  };

  // ─── Phase: adjust (free-text) ────────────────────────────────────────────
  const handleAdjustSubmit = async () => {
    const text = input.trim();
    if (!text) return;
    pushUser(text);
    setInput("");

    const updated = adjustSystem(system, text);
    setSystem(updated);
    await pushCloudy("Mana, men rejani moslashtirdim:", 700);
    pushSystemPreview(updated);
    await pushCloudy("Endi bo'ladimi?", 700);
    setPhase("confirm");
  };

  // ─── Phase: name ──────────────────────────────────────────────────────────
  const handleNameSubmit = async () => {
    const name = input.trim();
    if (!name) return;
    pushUser(name);
    setUserName(name);
    setInput("");

    // Persist user + goal + habits
    if (system) {
      const goalId = crypto.randomUUID();
      const goalRecord = {
        id: goalId,
        title: system.goalTitle,
        category: system.goalCategory,
        emoji: system.goalEmoji,
        timeframe: system.timeframe,
        weeklyTime: system.weeklyTime,
        dailyTime: system.dailyTime,
        milestones: system.milestones,
        firstStep: system.firstStep,
        createdAt: new Date().toISOString(),
        period: "Maqsad",
        targetValue: 100,
        currentValue: 0,
      };
      actions.addLocalGoal?.(goalRecord);

      // Add each habit locally with full required shape
      for (const h of system.habits) {
        const habitId = crypto.randomUUID();
        actions.addLocalHabit({
          id: habitId,
          emoji: h.emoji,
          name: h.name,
          title: h.name,
          minimalVersion: h.minimalVersion,
          fullVersion: h.fullVersion,
          scheduledTime: h.scheduledTime,
          identityStatement: h.identityStatement,
          category: h.category,
          frequency: "daily",
          customDays: [],
          cueType: h.cueType || "time",
          cueValue: h.scheduledTime,
          completedDates: [],
          achievedMilestones: [],
          recordStreak: 0,
          streak: 0,
          totalMinutes: 0,
          isAutomatic: false,
          completedToday: false,
          linkedGoalId: goalId,
          createdAt: new Date().toISOString(),
        });
      }
    }

    actions.setUser?.({ name });
    actions.completeOnboarding();

    await pushCloudy(`Tanishganimdan xursandman, ${name}! 🌱`, 600);
    await pushCloudy("Reja saqlandi. Endi birinchi qadamni qilish vaqti.", 700);
    setPhase("done");

    await delay(1400);
    navigate("/dashboard", { replace: true });
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  const placeholder = (() => {
    switch (phase) {
      case "goal": return "masalan: 6 oyda ingliz tilini B1 darajasiga olib chiqish";
      case "clarify": return "javobingiz...";
      case "adjust": return "nimani o'zgartirsam?";
      case "name": return "ismingiz";
      default: return "...";
    }
  })();

  const composerDisabled = !["goal", "clarify", "adjust", "name"].includes(phase);
  const onComposerSubmit = () => {
    if (phase === "goal") void handleGoalSubmit();
    else if (phase === "clarify") void handleClarifySubmit();
    else if (phase === "adjust") void handleAdjustSubmit();
    else if (phase === "name") void handleNameSubmit();
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col">
      <OnboardingHeader phase={phase} />

      <main
        ref={scrollRef}
        className="flex-1 overflow-y-auto"
        style={{ scrollBehavior: "smooth" }}
      >
        <div className="max-w-md mx-auto px-5 py-6 flex flex-col gap-3">
          <AnimatePresence initial={false}>
            {messages.map((m, i) => {
              if (m.role === "system_preview") {
                return (
                  <OnboardingMessage key={i} role="system_preview">
                    <SystemPreviewCard system={m.system} />
                  </OnboardingMessage>
                );
              }
              return (
                <OnboardingMessage key={i} role={m.role}>
                  {m.text}
                </OnboardingMessage>
              );
            })}
          </AnimatePresence>

          {phase === "analyzing" && <TypingIndicator />}

          {isTyping && phase !== "analyzing" && <TypingIndicator />}

          {phase === "confirm" && !isTyping && (
            <div className="pt-1">
              <ChipRow
                options={["Ha, boshlay", "O'zgartir"]}
                onSelect={handleConfirmChip}
              />
            </div>
          )}

          {phase === "done" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-2 py-6"
            >
              <div className="w-14 h-14 rounded-full bg-violet-100 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-violet-600" />
              </div>
              <p className="text-[13px] font-semibold text-zinc-700">Boshlanmoqda...</p>
            </motion.div>
          )}
        </div>
      </main>

      {!composerDisabled && (
        <Composer
          value={input}
          onChange={setInput}
          onSubmit={onComposerSubmit}
          placeholder={placeholder}
          disabled={isTyping}
        />
      )}
    </div>
  );
}
