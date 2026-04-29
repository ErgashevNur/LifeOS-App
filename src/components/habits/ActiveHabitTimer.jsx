import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import CircularProgress from "./CircularProgress";
import CompletionAnimation from "./CompletionAnimation";
import { parseDurationToSeconds, formatTime } from "@/lib/durationParser";

export default function ActiveHabitTimer({ habit, onComplete, onSkip, onClose }) {
  const [seconds, setSeconds] = useState(0);
  const [phase, setPhase] = useState("active"); // "active" | "done"

  const targetSeconds = parseDurationToSeconds(habit.minimalDuration || "20 daq");

  useEffect(() => {
    if (phase !== "active") return;
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  const handleComplete = () => {
    setPhase("done");
    onComplete(seconds);
  };

  const handleSkip = () => {
    onSkip?.();
    onClose?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#F5F5F4] flex flex-col items-center justify-center z-[60]"
    >
      {/* Close button */}
      {phase === "active" && (
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-xl hover:bg-black/[0.06] transition-colors"
        >
          <X className="w-5 h-5 text-zinc-400" strokeWidth={2} />
        </button>
      )}

      <AnimatePresence mode="wait">
        {phase === "active" ? (
          <motion.div
            key="active"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center gap-0 w-full px-6"
          >
            {/* Emoji */}
            <div className="text-[56px] mb-4">{habit.emoji || "✨"}</div>

            {/* Habit name */}
            <h2 className="text-[22px] font-bold text-zinc-900 mb-1 text-center">
              {habit.name || habit.title}
            </h2>
            <p className="text-[13px] text-zinc-400 mb-12 text-center">
              {habit.minimalVersion || "Minimal versiyani bajaring"}
            </p>

            {/* Circular timer */}
            <CircularProgress
              value={seconds / targetSeconds}
              label={formatTime(seconds)}
              color="#7C3AED"
              size={180}
            />

            <p className="text-[12px] text-zinc-400 mt-8">
              Minimal: {habit.minimalDuration || "20 daq"}
            </p>

            {/* Actions */}
            <div className="flex gap-3 mt-10">
              <button
                onClick={handleSkip}
                className="px-5 py-3 rounded-xl border border-black/[0.08] text-[13px] text-zinc-500 bg-white hover:bg-zinc-50 transition-colors"
              >
                O'tkazib yuborish
              </button>
              <button
                onClick={handleComplete}
                className="px-6 py-3 rounded-xl bg-violet-600 text-white text-[13px] font-bold hover:bg-violet-700 active:scale-95 transition-all"
              >
                Bajarildi ✓
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <CompletionAnimation
              habit={habit}
              seconds={seconds}
              onClose={onClose}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
