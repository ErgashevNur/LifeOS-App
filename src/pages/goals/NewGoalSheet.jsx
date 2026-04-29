import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLifeOSData } from "@/lib/lifeos-store";
import { analyzeGoal, generateSystem, isCloudyEnabled } from "@/lib/cloudyAI";
import SystemPreviewCard from "@/components/shared/SystemPreviewCard";

function daysFromTimeframe(tf) {
  if (!tf?.value) return 90;
  if (tf.unit === "month") return tf.value * 30;
  if (tf.unit === "week") return tf.value * 7;
  if (tf.unit === "day") return tf.value;
  return 90;
}

export default function NewGoalSheet({ onClose }) {
  const { actions } = useLifeOSData();
  // input | analyzing | clarifying | systeming | preview | done
  const [phase, setPhase] = useState("input");
  const [goalText, setGoalText] = useState("");
  const [goalData, setGoalData] = useState(null);
  const [system, setSystem] = useState(null);
  const [clarifyQuestions, setClarifyQuestions] = useState([]);
  const [clarifyAnswer, setClarifyAnswer] = useState("");
  const [conversation, setConversation] = useState([]); // for Claude history
  const [errorMsg, setErrorMsg] = useState("");

  const runAnalyze = async (text, history) => {
    setErrorMsg("");
    setPhase("analyzing");
    const result = await analyzeGoal(text, history);

    if (result?.needsClarification && result.clarifyingQuestions?.length) {
      setClarifyQuestions(result.clarifyingQuestions);
      setConversation([...history, { role: "user", content: text }]);
      setPhase("clarifying");
      return;
    }

    if (!result?.parsed) {
      setErrorMsg("Maqsadni tushuna olmadim. Qaytadan yozib ko'ring.");
      setPhase("input");
      return;
    }

    setGoalData(result.parsed);
    setPhase("systeming");
    const sys = await generateSystem(result.parsed);
    if (!sys) {
      setErrorMsg("Tizim tuzilmadi. Qaytadan urinib ko'ring.");
      setPhase("input");
      return;
    }
    setSystem(sys);
    setPhase("preview");
  };

  const handleAnalyze = () => {
    if (!goalText.trim()) return;
    runAnalyze(goalText.trim(), []);
  };

  const handleClarifySubmit = () => {
    if (!clarifyAnswer.trim()) return;
    const answer = clarifyAnswer.trim();
    setClarifyAnswer("");
    runAnalyze(answer, conversation);
  };

  const handleSave = () => {
    if (!goalData || !system) return;
    const goalId = crypto.randomUUID();
    const totalDays = daysFromTimeframe(goalData.timeframe);
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + totalDays);

    actions.addLocalGoal({
      id: goalId,
      title: goalData.title,
      emoji: goalData.emoji,
      category: goalData.category,
      timeframe: goalData.timeframe,
      timeframeDays: totalDays,
      deadline: deadline.toISOString(),
      progress: 0,
      milestones: system.milestones,
      firstStep: system.firstStep,
      weeklyTime: system.weeklyTime,
      dailyTime: system.dailyTime,
      motivation: goalData.motivation || "",
      philosophy: system.philosophy || "",
      createdAt: new Date().toISOString(),
      period: "Maqsad",
      targetValue: 100,
      currentValue: 0,
    });

    system.habits.forEach(h => {
      const habitId = crypto.randomUUID();
      actions.addLocalHabit({
        id: habitId,
        emoji: h.emoji,
        name: h.name,
        title: h.name,
        minimalVersion: h.minimalVersion,
        fullVersion: h.fullVersion,
        scheduledTime: h.scheduledTime,
        location: h.location || "",
        afterCue: h.afterCue || "",
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
    });

    setPhase("done");
    setTimeout(onClose, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 z-50 flex items-end"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 32 }}
        className="bg-white rounded-t-2xl w-full pb-8 max-h-[90vh] overflow-y-auto"
      >
        <div className="w-8 h-1 bg-black/[0.1] rounded-full mx-auto mt-3 mb-4" />

        <div className="px-5">
          {phase === "input" && (
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-[16px] font-semibold text-gray-900">
                  Yangi maqsad
                </h3>
                <p className="text-[12px] text-gray-400 mt-0.5">
                  {isCloudyEnabled()
                    ? "Cloudy AI sizga shaxsiy tizim tuzib beradi"
                    : "Cloudy tizim tuzib beradi"}
                </p>
              </div>

              <textarea
                value={goalText}
                onChange={(e) => setGoalText(e.target.value)}
                placeholder="Masalan: 6 oyda ingliz tilini o'rganib IELTS 7.0 olaman"
                rows={3}
                autoFocus
                className="w-full px-4 py-3.5 rounded-2xl border border-black/[0.09] bg-[#FAFAF9] text-[14px] text-gray-900 placeholder:text-gray-300 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 resize-none transition-all"
              />

              {errorMsg && (
                <p className="text-[11px] text-red-500">{errorMsg}</p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl border border-black/[0.08] text-[13px] text-gray-500"
                >
                  Bekor
                </button>
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={!goalText.trim()}
                  className={cn(
                    "flex-1 py-3 rounded-xl text-[13px] font-semibold transition-all",
                    goalText.trim()
                      ? "bg-violet-600 text-white"
                      : "bg-black/[0.05] text-gray-300",
                  )}
                >
                  Cloudy tahlil qilsin →
                </button>
              </div>
            </div>
          )}

          {phase === "analyzing" && (
            <LoadingState
              title="Maqsad tahlil qilinmoqda..."
              subtitle="Cloudy savolingizni tushunmoqda"
            />
          )}

          {phase === "systeming" && (
            <LoadingState
              title="Shaxsiy tizim tuzilmoqda..."
              subtitle="Sizga moslashtirilgan odatlar va milestonelar"
            />
          )}

          {phase === "clarifying" && (
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-[15px] font-semibold text-gray-900">
                  Cloudy aniqlik so'rayapti
                </h3>
                <p className="text-[12px] text-gray-400 mt-0.5">
                  Yaxshi tizim tuzish uchun
                </p>
              </div>

              <div className="flex flex-col gap-2.5 px-4 py-3 rounded-2xl bg-violet-50 border border-violet-100">
                <div className="flex items-start gap-2">
                  <span className="text-[16px] leading-none mt-0.5">☁️</span>
                  <div className="flex flex-col gap-1.5">
                    {clarifyQuestions.map((q, i) => (
                      <p key={i} className="text-[13px] text-violet-900 leading-snug">
                        {q}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              <textarea
                value={clarifyAnswer}
                onChange={(e) => setClarifyAnswer(e.target.value)}
                placeholder="Javobingiz..."
                rows={3}
                autoFocus
                className="w-full px-4 py-3.5 rounded-2xl border border-black/[0.09] bg-[#FAFAF9] text-[14px] text-gray-900 placeholder:text-gray-300 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 resize-none transition-all"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPhase("input")}
                  className="flex-1 py-3 rounded-xl border border-black/[0.08] text-[13px] text-gray-500"
                >
                  Ortga
                </button>
                <button
                  type="button"
                  onClick={handleClarifySubmit}
                  disabled={!clarifyAnswer.trim()}
                  className={cn(
                    "flex-1 py-3 rounded-xl text-[13px] font-semibold transition-all",
                    clarifyAnswer.trim()
                      ? "bg-violet-600 text-white"
                      : "bg-black/[0.05] text-gray-300",
                  )}
                >
                  Davom →
                </button>
              </div>
            </div>
          )}

          {phase === "preview" && system && goalData && (
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-[15px] font-semibold text-gray-900">
                  Tizim tayyor
                </h3>
                <p className="text-[12px] text-gray-400 mt-0.5">
                  {goalData.motivation || "Qabul qilasizmi?"}
                </p>
              </div>

              {goalData.warning && (
                <div className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-200">
                  <p className="text-[11px] text-amber-700">⚠️ {goalData.warning}</p>
                </div>
              )}

              <SystemPreviewCard system={system} />

              {system.philosophy && (
                <div className="px-3 py-2.5 rounded-xl bg-violet-50/60 border border-violet-100">
                  <p className="text-[11px] text-violet-800 leading-relaxed">
                    ☁️ {system.philosophy}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setPhase("input"); setSystem(null); setGoalData(null); }}
                  className="flex-1 py-3 rounded-xl border border-black/[0.08] text-[13px] text-gray-500"
                >
                  O'zgartirish
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex-1 py-3 rounded-xl bg-violet-600 text-white text-[13px] font-semibold"
                >
                  Saqlash →
                </button>
              </div>
            </div>
          )}

          {phase === "done" && (
            <div className="flex flex-col items-center gap-3 py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="text-[48px]"
              >
                {goalData?.emoji || "🎯"}
              </motion.div>
              <p className="text-[15px] font-semibold text-gray-900">
                Maqsad qo'shildi!
              </p>
              <p className="text-[12px] text-gray-400 text-center">
                Odatlar va planner bloklari yaratildi
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function LoadingState({ title, subtitle }) {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center">
        <span className="text-[20px]">☁️</span>
      </div>
      <div className="text-center">
        <p className="text-[14px] font-semibold text-gray-900">{title}</p>
        <p className="text-[12px] text-gray-400 mt-1">{subtitle}</p>
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-violet-400 rounded-full"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}
