import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function TransformationPromptModal({ milestone, question, onAnswer, onLater }) {
  const [answer, setAnswer] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-[70] p-5"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
        className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center text-[14px]">
            ☁️
          </div>
          <div>
            <p className="text-[10px] text-gray-400">Cloudy · {milestone} kun</p>
            <p className="text-[13px] font-semibold text-gray-900">Sizga savol bor</p>
          </div>
        </div>

        {/* Question */}
        <div className="px-4 py-3.5 bg-violet-50 border border-violet-100 rounded-xl mb-4">
          <p className="text-[13px] text-violet-700 leading-relaxed whitespace-pre-line">
            {question}
          </p>
        </div>

        {/* Answer textarea */}
        <textarea
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          placeholder="O'z so'zlaringiz bilan..."
          rows={4}
          autoFocus
          className="w-full px-3.5 py-3 rounded-xl border border-black/[0.08] bg-[#FAFAF9] text-[13px] text-gray-800 placeholder:text-gray-300 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 resize-none transition-all mb-4"
        />

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onLater}
            className="flex-1 py-3 rounded-xl border border-black/[0.08] text-[12px] text-gray-500"
          >
            Keyinroq
          </button>
          <button
            onClick={() => answer.trim() && onAnswer(answer.trim())}
            disabled={!answer.trim()}
            className={cn(
              "flex-1 py-3 rounded-xl text-[13px] font-semibold transition-all",
              answer.trim()
                ? "bg-violet-600 text-white"
                : "bg-black/[0.05] text-gray-300",
            )}
          >
            Saqlash →
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
