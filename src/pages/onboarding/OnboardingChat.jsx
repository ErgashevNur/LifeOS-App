import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  analyzePain,
  analyzeEnergy,
  generateHabitSuggestions,
  getPainResponse,
  buildSuggestionMessage,
} from "@/lib/onboardingEngine";
import {
  analyzeSocial,
  analyzeMotivation,
  detectPersonality,
} from "@/lib/personalityEngine";
import { useLifeOSData } from "@/lib/lifeos-store";

// Extended phases including personality questions
const PHASES = ["intro", "identity", "future", "energy", "social", "motivation", "suggest"];

function phaseIndex(phase) {
  return PHASES.indexOf(phase);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Typing indicator ───────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-[12px] shrink-0">☁️</div>
      <div className="px-4 py-3 bg-violet-50 border border-violet-100 rounded-2xl rounded-bl-sm">
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

// ─── Single message bubble ───────────────────────────────────────────────────

function MessageBubble({ message }) {
  const isCloudy = message.role === "cloudy";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex items-end gap-2", isCloudy ? "" : "flex-row-reverse")}
    >
      {isCloudy && (
        <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-[12px] shrink-0">☁️</div>
      )}
      <div className={cn(
        "px-4 py-3 rounded-2xl max-w-[78%] text-[13px] leading-relaxed whitespace-pre-wrap",
        isCloudy
          ? "bg-violet-50 border border-violet-100 rounded-bl-sm text-gray-800"
          : "bg-white border border-black/[0.07] rounded-br-sm text-gray-800",
      )}>
        {message.text}
      </div>
    </motion.div>
  );
}

// ─── Text input ──────────────────────────────────────────────────────────────

function OnboardingInput({ onSend }) {
  const [value, setValue] = useState("");

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue("");
  };

  return (
    <div className="px-4 pb-6 pt-2 border-t border-black/[0.05]">
      <div className="flex gap-2">
        <input
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Yozing..."
          autoFocus
          className="flex-1 px-4 py-3 rounded-xl bg-white border border-black/[0.08] text-[13px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-violet-400 transition-colors"
        />
        <button
          onClick={handleSend}
          disabled={!value.trim()}
          className="w-11 h-11 rounded-xl bg-violet-600 flex items-center justify-center disabled:opacity-40 transition-opacity"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}

// ─── Habit suggestion cards ──────────────────────────────────────────────────

function HabitSuggestionCards({ suggestions, onAccept, onCustom }) {
  const [selected, setSelected] = useState(suggestions.map(s => s.id));

  const toggleSelected = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    );
  };

  const chosenHabits = suggestions.filter(s => selected.includes(s.id));

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="px-4 pb-6 pt-3 border-t border-black/[0.05]"
    >
      <p className="text-[12px] text-gray-400 mb-3 text-center">
        Sizga mos odatlar — tanlang yoki hammasi
      </p>

      {suggestions.map(habit => (
        <button
          key={habit.id}
          onClick={() => toggleSelected(habit.id)}
          className={cn(
            "flex items-center gap-3 px-4 py-3.5 rounded-xl border mb-2 w-full text-left transition-all",
            selected.includes(habit.id)
              ? "bg-violet-50 border-violet-300"
              : "bg-white border-black/[0.08]",
          )}
        >
          <span className="text-[24px]">{habit.emoji}</span>
          <div className="flex-1">
            <div className="text-[13px] font-medium text-gray-900">{habit.name}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">
              {habit.minimalVersion} · {habit.scheduledTime}
            </div>
          </div>
          <div className={cn(
            "w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center transition-all",
            selected.includes(habit.id)
              ? "bg-violet-600 border-violet-600"
              : "border-gray-300",
          )}>
            {selected.includes(habit.id) && <Check className="w-3 h-3 text-white" />}
          </div>
        </button>
      ))}

      <button
        onClick={() => onAccept(chosenHabits)}
        disabled={chosenHabits.length === 0}
        className="w-full py-3.5 rounded-xl bg-violet-600 text-white text-[14px] font-semibold mt-2 disabled:opacity-40 transition-opacity"
      >
        Boshlash → {chosenHabits.length} ta odat
      </button>
      <button onClick={onCustom} className="w-full py-2.5 text-[12px] text-gray-400 mt-1">
        O'zim tanlayман
      </button>
    </motion.div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function OnboardingChat() {
  const navigate = useNavigate();
  const { actions } = useLifeOSData();
  const [messages, setMessages] = useState([]);
  const [phase, setPhase] = useState("intro");
  const [typing, setTyping] = useState(false);
  const [userProfile, setUserProfile] = useState({
    painPoint: "",
    identity: "",
    future: "",
    energyTime: "",
    socialStyle: "",
    motivationType: "",
    personality: null,
  });
  const [suggestions, setSuggestions] = useState(null);
  const bottomRef = useRef(null);

  const addCloudyMessage = (text) => {
    setMessages(prev => [...prev, { id: Date.now(), role: "cloudy", text }]);
  };

  const addUserMessage = (text) => {
    setMessages(prev => [...prev, { id: Date.now() + 1, role: "user", text }]);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // Initial greeting
  useEffect(() => {
    const t = setTimeout(() => {
      addCloudyMessage(
        "Salom. Men Cloudy — sizning shaxsiy hayot murabbiyingiz.\n\nBir savol: hozir hayotingizda eng ko'p nima sizni to'xtatib turibdi?",
      );
    }, 600);
    return () => clearTimeout(t);
  }, []);

  const handleUserInput = async (input) => {
    addUserMessage(input);
    setTyping(true);
    await delay(900);

    if (phase === "intro") {
      const painPoint = analyzePain(input);
      setUserProfile(p => ({ ...p, painPoint }));
      setPhase("identity");
      setTyping(false);
      addCloudyMessage(getPainResponse(painPoint));

    } else if (phase === "identity") {
      setUserProfile(p => ({ ...p, identity: input }));
      setPhase("future");
      setTyping(false);
      addCloudyMessage(
        "Kuchli. Endi bir yildan keyin:\n\nAgar hamma narsa to'g'ri ketsa — siz qanday hayot yashamoqchisiz?",
      );

    } else if (phase === "future") {
      setUserProfile(p => ({ ...p, future: input }));
      setPhase("energy");
      setTyping(false);
      addCloudyMessage(
        "Tushundim. Yana bir savol:\n\nKun davomida qachon eng ko'p energiyangiz bo'ladi?\n(Tong, tush, kech?)",
      );

    } else if (phase === "energy") {
      const energyTime = analyzeEnergy(input);
      setUserProfile(p => ({ ...p, energyTime }));
      setPhase("social");
      setTyping(false);
      addCloudyMessage(
        "Tushundim. Yana bir narsa:\n\nYangi narsalarni o'rganayotganda — yolg'iz yaxshimi yoki birov bilan birga?",
      );

    } else if (phase === "social") {
      const socialStyle = analyzeSocial(input);
      setUserProfile(p => ({ ...p, socialStyle }));
      setPhase("motivation");
      setTyping(false);
      addCloudyMessage(
        "Oxirgi savol:\n\nSiz uchun muhimroq qaysi — o'sish va rivojlanish, yoki aniq natija va yutuq?",
      );

    } else if (phase === "motivation") {
      const motivationType = analyzeMotivation(input);
      setTyping(false);
      addCloudyMessage("Tahlil qilyapman...");
      setPhase("analysis");

      await delay(1800);

      const finalProfile = { ...userProfile, motivationType };

      const personalityKey = detectPersonality({
        energy: finalProfile.energyTime || "morning",
        social: finalProfile.socialStyle || "solo",
        motivation: motivationType,
      });

      setUserProfile(p => ({ ...p, motivationType, personality: personalityKey }));

      const suggs = generateHabitSuggestions(finalProfile);
      setSuggestions(suggs);
      addCloudyMessage(buildSuggestionMessage(suggs));
      setPhase("suggest");
    }
  };

  const handleAccept = (chosen) => {
    chosen.forEach(h => actions.addLocalHabit(h));
    actions.completeOnboarding(userProfile.personality);
    navigate("/goals");
  };

  const handleCustom = () => {
    actions.completeOnboarding(userProfile.personality);
    navigate("/goals");
  };

  const showInput = phase !== "analysis" && phase !== "suggest";

  return (
    <div className="flex flex-col h-full bg-[#F5F5F4]">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 h-[52px] border-b border-black/[0.06] bg-white/60">
        <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-[14px]">☁️</div>
        <div>
          <div className="text-[13px] font-semibold text-gray-900">Cloudy</div>
          <div className="text-[10px] text-gray-400">Shaxsiy murabbiy</div>
        </div>
        {/* Progress dots — excluding "suggest" */}
        <div className="ml-auto flex gap-1.5">
          {PHASES.filter(p => p !== "suggest").map((p, i) => (
            <div
              key={p}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-all duration-300",
                phaseIndex(phase) > i
                  ? "bg-violet-600"
                  : phaseIndex(phase) === i
                  ? "bg-violet-300"
                  : "bg-black/[0.08]",
              )}
            />
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-3">
        <AnimatePresence>
          {messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {typing && (
            <motion.div key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <TypingIndicator />
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input / Suggestions */}
      <AnimatePresence mode="wait">
        {showInput && (
          <motion.div key="input" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <OnboardingInput onSend={handleUserInput} />
          </motion.div>
        )}
        {phase === "suggest" && suggestions && (
          <motion.div key="suggest" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <HabitSuggestionCards
              suggestions={suggestions}
              onAccept={handleAccept}
              onCustom={handleCustom}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
