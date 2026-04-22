import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLifeOSData } from "@/lib/lifeos-store";
import { cn } from "@/lib/utils";
import {
  Send, Trash2, Brain, Target, Repeat, Zap, Flame,
  TrendingUp, Clock,
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

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col bg-slate-50" style={{ height: "calc(100dvh - 64px)" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center">
            <Brain className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">AI Murabbiy</h1>
            <p className="text-[11px] text-slate-400">Shaxsiy coach</p>
          </div>
        </div>
        {hasMessages && (
          <button
            onClick={actions.clearAssistantMessages}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        <AnimatePresence>
          {messages.map((msg) => (
            <Message key={msg.id} msg={msg} />
          ))}
        </AnimatePresence>
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 bg-white border-t border-slate-200 flex gap-2 items-center">
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(prompt)}
          placeholder="Savol yozing..."
          className="flex-1 h-11 rounded-xl bg-slate-50 border border-slate-200 px-4 text-sm outline-none"
        />
        <button
          onClick={() => send(prompt)}
          disabled={!prompt.trim()}
          className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center disabled:opacity-30"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}