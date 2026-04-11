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
        </div>
      )}

      {/* Input */}
      <div
        className="px-4 py-3 flex gap-3 items-center"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(prompt)}
          placeholder="Savol yoki vaziyatni yozing..."
          className="flex-1 rounded-2xl px-4 py-3 text-sm font-semibold outline-none"
          style={{
            background: "#111",
            color: "#ccc",
            border: "1px solid #1d1d1d",
          }}
        />
        <button
          onClick={() => send(prompt)}
          disabled={!prompt.trim()}
          className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all active:scale-90 disabled:opacity-30"
          style={{ background: "#00FFAA" }}
        >
          <Send className="w-4 h-4" style={{ color: "#000" }} />
        </button>
      </div>
    </div>
  );
}
