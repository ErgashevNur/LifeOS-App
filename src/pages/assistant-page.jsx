<<<<<<< HEAD
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLifeOSData } from "@/lib/lifeos-store";
import { Send, Trash2, Zap } from "lucide-react";

const QUICK_PROMPTS = [
  "Bugungi rejam qanday?",
  "Nima orqada qoldim?",
  "Motivatsiya ber.",
  "Progress tahlil qil.",
];

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center mr-2 mt-1 shrink-0"
          style={{ background: "#00FFAA" }}
        >
          <Zap className="w-3.5 h-3.5" style={{ color: "#000" }} />
        </div>
      )}
      <div
        className="max-w-[78%] rounded-2xl px-4 py-3 text-sm font-semibold leading-relaxed"
        style={
          isUser
            ? { background: "#1a1a1a", color: "#ccc", borderBottomRightRadius: 6 }
            : { background: "#00FFAA", color: "#000", borderBottomLeftRadius: 6 }
        }
      >
        {msg.text}
      </div>
    </motion.div>
  );
}

export default function AssistantPage() {
  const { data, actions } = useLifeOSData();
  const [prompt, setPrompt] = useState("");
  const endRef = useRef(null);
  const messages = data.assistant.messages ?? [];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (text) => {
    if (!text.trim()) return;
    actions.sendAssistantPrompt(text.trim());
    setPrompt("");
  };

  return (
    <div
      className="flex flex-col"
      style={{ background: "#0B0B0B", minHeight: "100%", height: "calc(100dvh - 64px)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div>
          <p className="text-[10px] font-black tracking-[0.35em] uppercase" style={{ color: "#555" }}>
            COACH
          </p>
          <h1 className="text-lg font-black tracking-tight mt-0.5">AI Murabbiy.</h1>
        </div>
        <button
          onClick={actions.clearAssistantMessages}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-red-500/10"
          style={{ color: "#333" }}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 gap-3 text-center py-10">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "#111" }}
            >
              <Zap className="w-7 h-7" style={{ color: "#00FFAA" }} />
            </div>
            <p className="text-sm font-bold" style={{ color: "#555" }}>
              Murabbiy tayyor. Gapiring.
            </p>
          </div>
        )}
        <AnimatePresence>
          {messages.map((msg) => (
            <Message key={msg.id} msg={msg} />
          ))}
        </AnimatePresence>
        <div ref={endRef} />
      </div>

      {/* Quick prompts */}
      {messages.length === 0 && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
          {QUICK_PROMPTS.map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              className="shrink-0 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95"
              style={{ background: "#111", color: "#555", border: "1px solid #1a1a1a" }}
            >
              {q}
            </button>
          ))}
=======
import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLifeOSData } from "@/lib/lifeos-store";
import { cn } from "@/lib/utils";
import {
  Send, Trash2, Brain, Target, Repeat, Zap, Flame,
  TrendingUp, Clock, ChevronRight,
} from "lucide-react";

// ── AI Coach: data-driven quick prompts ──
const QUICK_PROMPTS = [
  { text: "Bugungi rejam qanday?", icon: Target },
  { text: "Odatlarimni tahlil qil", icon: Repeat },
  { text: "Fokus vaqtimni oshir", icon: Clock },
  { text: "Motivatsiya ber", icon: Zap },
  { text: "Progress tahlil qil", icon: TrendingUp },
  { text: "Nima orqada qoldim?", icon: Flame },
];

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-slate-900 flex items-center justify-center mr-2 mt-1 shrink-0">
          <Brain className="w-3.5 h-3.5 text-white" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-slate-900 text-white rounded-br-md"
            : "bg-slate-100 text-slate-800 rounded-bl-md"
        )}
      >
        {msg.text}
      </div>
    </motion.div>
  );
}

// ── Data-driven insight cards ──
function InsightCards({ data, selectors, dashboardSummary }) {
  const habits = data.habits || [];
  const completedToday = habits.filter((h) => h.completedToday).length;
  const totalHabits = habits.length;
  const streak = dashboardSummary?.streak ?? 0;

  const goals = selectors?.goalsWithMeta || [];
  const activeGoals = goals.filter((g) => g.progress < 100).length;
  const completedGoals = goals.filter((g) => g.progress >= 100).length;

  const focusSessions = data.mastery?.focusSessions || [];
  const today = new Date().toISOString().slice(0, 10);
  const todayMinutes = focusSessions
    .filter((s) => s.date === today)
    .reduce((sum, s) => sum + (s.durationMin || 0), 0);

  const insights = [];

  // Habit insights
  if (totalHabits > 0) {
    const rate = Math.round((completedToday / totalHabits) * 100);
    if (rate >= 80) {
      insights.push({ text: `Odatlar ${rate}% bajarildi — ajoyib natija!`, type: "good" });
    } else if (rate >= 40) {
      insights.push({ text: `Odatlar ${rate}% — davom eting, maqsadga yaqinsiz.`, type: "mid" });
    } else {
      insights.push({ text: `Odatlar ${rate}% — bugun kamida 1 ta odatni bajaring.`, type: "low" });
    }
  }

  // Streak insight
  if (streak > 7) {
    insights.push({ text: `${streak} kunlik streak — intizom shakllanyapti!`, type: "good" });
  } else if (streak > 0) {
    insights.push({ text: `${streak} kunlik streak — har kuni davom eting.`, type: "mid" });
  }

  // Focus insight
  if (todayMinutes > 60) {
    insights.push({ text: `Bugun ${todayMinutes} daqiqa fokus — chuqur ish bajarildi.`, type: "good" });
  } else if (todayMinutes > 0) {
    insights.push({ text: `${todayMinutes} daqiqa fokus. Yana 1 ta session qiling.`, type: "mid" });
  } else {
    insights.push({ text: "Bugun fokus session boshlanmadi. Hozir boshlang!", type: "low" });
  }

  // Goals insight
  if (completedGoals > 0) {
    insights.push({ text: `${completedGoals} ta maqsad bajarildi! Yangilarini qo'shing.`, type: "good" });
  }
  if (activeGoals > 5) {
    insights.push({ text: `${activeGoals} ta faol maqsad — 3 taga kamaytiring, fokus oshadi.`, type: "low" });
  }

  // Weakness detection
  const weakHabit = habits.reduce((weakest, h) => {
    if (!weakest || h.completedDays < weakest.completedDays) return h;
    return weakest;
  }, null);

  if (weakHabit && totalHabits > 1) {
    insights.push({
      text: `"${weakHabit.title}" eng kam bajarilgan odat. Maqsadni kichiklashtiring.`,
      type: "low",
    });
  }

  if (insights.length === 0) {
    insights.push({ text: "Ma'lumot yig'ilmoqda. Odatlar va maqsadlar qo'shing.", type: "mid" });
  }

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-400 px-1">
        BUGUNGI TAHLIL
      </p>
      {insights.slice(0, 4).map((insight, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className={cn(
            "rounded-xl px-4 py-3 text-sm border",
            insight.type === "good" && "bg-slate-50 border-slate-200 text-slate-700",
            insight.type === "mid" && "bg-white border-slate-200 text-slate-600",
            insight.type === "low" && "bg-slate-900 border-slate-800 text-slate-300"
          )}
        >
          <div className="flex items-start gap-2">
            <div className={cn(
              "w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0",
              insight.type === "good" && "bg-slate-600",
              insight.type === "mid" && "bg-slate-400",
              insight.type === "low" && "bg-slate-500"
            )} />
            <span>{insight.text}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ── Stats Summary Bar ──
function StatsSummary({ data, selectors, dashboardSummary }) {
  const habits = data.habits || [];
  const completedToday = habits.filter((h) => h.completedToday).length;
  const streak = dashboardSummary?.streak ?? 0;
  const goals = selectors?.goalsWithMeta || [];
  const goalRate = goals.length > 0
    ? Math.round(goals.filter((g) => g.progress >= 100).length / goals.length * 100)
    : 0;

  return (
    <div className="grid grid-cols-3 gap-2">
      {[
        { label: "Odatlar", value: `${completedToday}/${habits.length}`, icon: Repeat },
        { label: "Streak", value: streak, icon: Flame },
        { label: "Maqsadlar", value: `${goalRate}%`, icon: Target },
      ].map(({ label, value, icon: Icon }) => (
        <div key={label} className="rounded-xl bg-white border border-slate-200 p-3 text-center">
          <Icon className="w-4 h-4 text-slate-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-slate-800">{value}</p>
          <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
        </div>
      ))}
    </div>
  );
}

export default function AssistantPage() {
  const { data, actions, selectors, dashboardSummary } = useLifeOSData();
  const [prompt, setPrompt] = useState("");
  const endRef = useRef(null);
  const messages = data.assistant.messages ?? [];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (text) => {
    if (!text.trim()) return;
    actions.sendAssistantPrompt(text.trim());
    setPrompt("");
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col bg-slate-50" style={{ minHeight: "100%", height: "calc(100dvh - 64px)" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center">
            <Brain className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">AI Murabbiy</h1>
            <p className="text-[11px] text-slate-400">Shaxsiy coach — ma'lumotlarga asoslangan</p>
          </div>
        </div>
        {hasMessages && (
          <button
            onClick={actions.clearAssistantMessages}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Empty State: insights + stats */}
      {!hasMessages && (
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
          <StatsSummary data={data} selectors={selectors} dashboardSummary={dashboardSummary} />
          <InsightCards data={data} selectors={selectors} dashboardSummary={dashboardSummary} />

          {/* Quick prompts */}
          <div className="space-y-2">
            <p className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-400 px-1">
              SO'RANG
            </p>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q.text}
                  onClick={() => send(q.text)}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white border border-slate-200 text-left text-sm font-medium text-slate-600 hover:bg-slate-100 hover:border-slate-300 transition-all active:scale-[0.98]"
                >
                  <q.icon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{q.text}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      {hasMessages && (
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
          <AnimatePresence>
            {messages.map((msg) => (
              <Message key={msg.id} msg={msg} />
            ))}
          </AnimatePresence>
          <div ref={endRef} />
>>>>>>> a982465 (man life os loyihasini hamma modullarini ozgartirdm)
        </div>
      )}

      {/* Input */}
<<<<<<< HEAD
      <div
        className="px-4 py-3 flex gap-3 items-center"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
=======
      <div className="px-4 py-3 bg-white border-t border-slate-200 flex gap-2 items-center">
>>>>>>> a982465 (man life os loyihasini hamma modullarini ozgartirdm)
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(prompt)}
          placeholder="Savol yoki vaziyatni yozing..."
<<<<<<< HEAD
          className="flex-1 rounded-2xl px-4 py-3 text-sm font-semibold outline-none"
          style={{
            background: "#111",
            color: "#ccc",
            border: "1px solid #1d1d1d",
          }}
=======
          className="flex-1 h-11 rounded-xl bg-slate-50 border border-slate-200 px-4 text-sm outline-none focus:border-slate-400 transition-colors"
>>>>>>> a982465 (man life os loyihasini hamma modullarini ozgartirdm)
        />
        <button
          onClick={() => send(prompt)}
          disabled={!prompt.trim()}
<<<<<<< HEAD
          className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all active:scale-90 disabled:opacity-30"
          style={{ background: "#00FFAA" }}
        >
          <Send className="w-4 h-4" style={{ color: "#000" }} />
=======
          className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
>>>>>>> a982465 (man life os loyihasini hamma modullarini ozgartirdm)
        </button>
      </div>
    </div>
  );
}
