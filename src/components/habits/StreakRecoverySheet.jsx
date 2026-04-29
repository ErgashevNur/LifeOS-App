import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { recoveryMessage, isCloudyEnabled } from "@/lib/cloudyAI";
import { isFreezeAvailable, todayISO } from "@/lib/streakEngine";

export default function StreakRecoverySheet({ habit, daysMissed, onClose, onRestart, onUseFreeze }) {
  const [aiMessage, setAiMessage] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!habit || !isCloudyEnabled()) return;
    let cancelled = false;
    setAiLoading(true);
    recoveryMessage({
      habitName: habit.name || habit.title,
      daysMissed,
      identityStatement: habit.identityStatement,
    })
      .then(msg => { if (!cancelled && msg) setAiMessage(msg); })
      .finally(() => { if (!cancelled) setAiLoading(false); });
    return () => { cancelled = true; };
  }, [habit, daysMissed]);

  if (!habit) return null;

  const record = (habit.completedDates || habit.history?.filter(h => h.done).map(h => h.date) || []).length;
  const today = todayISO();
  const freezeAvailable = isFreezeAvailable(habit, today);
  const canFreeze = daysMissed === 1 && freezeAvailable;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[60]"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 340, damping: 34 }}
        className="fixed inset-x-0 bottom-0 bg-white rounded-t-2xl border-t border-black/[0.06] z-[61] pb-safe"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-8 h-1 bg-black/[0.1] rounded-full mx-auto mt-3 mb-5" />

        <div className="px-6 pb-8 flex flex-col items-center text-center gap-4">
          <div className="text-[52px]">{habit.emoji || "✨"}</div>

          <div>
            <h3 className="text-[18px] font-bold text-zinc-900">
              {daysMissed} kun bo'shliq
            </h3>
            <p className="text-[13px] text-zinc-400 mt-1 leading-relaxed max-w-[280px]">
              Bu normal. Eng yaxshi odamlar ham tushib ketadi. Muhimi — qayta boshlash.
            </p>
          </div>

          {/* Cloudy shaxsiy xabari */}
          {(aiMessage || aiLoading) && (
            <div className="w-full px-4 py-3 rounded-xl bg-violet-50/70 border border-violet-100">
              <div className="flex items-start gap-2 text-left">
                <span className="text-[16px] leading-none mt-0.5">☁️</span>
                {aiLoading && !aiMessage ? (
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
                ) : (
                  <p className="text-[12.5px] text-violet-900 leading-relaxed">{aiMessage}</p>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 px-4 py-3 bg-violet-50 rounded-xl border border-violet-100 w-full">
            <span className="text-[22px]">🏆</span>
            <div className="text-left">
              <p className="text-[12px] font-bold text-violet-700">Rekordingiz saqlanib turibdi</p>
              <p className="text-[11px] text-violet-500">{record} kun · muzlatilgan</p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-3 bg-green-50 rounded-xl border border-green-100 w-full">
            <span className="text-[22px]">⚡</span>
            <div className="text-left">
              <p className="text-[12px] font-bold text-green-700">Minimal versiya</p>
              <p className="text-[11px] text-green-500">
                {habit.minimalVersion || habit.cue || "Qisqa versiyani bajaring"} · {habit.minimalDuration || "5 daq"}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 w-full mt-1">
            <button
              onClick={() => { onRestart?.(); onClose(); }}
              className="w-full py-3.5 rounded-xl bg-violet-600 text-white text-[14px] font-bold hover:bg-violet-700 active:scale-[0.98] transition-all"
            >
              Hozir boshlayman → {habit.minimalDuration || "5 daq"}
            </button>

            {canFreeze && onUseFreeze && (
              <button
                onClick={() => { onUseFreeze(); onClose(); }}
                className="w-full py-3 rounded-xl border border-blue-200 bg-blue-50 text-[13px] text-blue-700 font-semibold hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
              >
                <span>❄️</span>
                <span>Streak Freeze ishlatish (haftalik 1 ta)</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl border border-black/[0.08] text-[13px] text-zinc-500 hover:bg-zinc-50 transition-colors"
            >
              Keyinroq
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
