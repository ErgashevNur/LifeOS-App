import { motion, AnimatePresence } from "framer-motion";
import { COLOR_MAP } from "@/lib/milestoneConfig";

export default function MilestoneModal({ milestone, habit, config, onClose }) {
  if (!config || !habit) return null;

  const colors = COLOR_MAP[config.color] || COLOR_MAP.violet;
  const isIdentity = config.identity;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-[3px] z-[70] flex items-center justify-center px-5"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.88, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 10 }}
          transition={{ type: "spring", stiffness: 340, damping: 28 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-[360px] bg-white rounded-3xl border border-black/[0.06] shadow-2xl overflow-hidden"
        >
          {/* Color header */}
          <div className={`${colors.bg} px-6 pt-8 pb-6 flex flex-col items-center text-center gap-3 border-b ${colors.border}`}>
            <motion.div
              initial={{ scale: 0.3 }}
              animate={{ scale: [0.3, 1.3, 1] }}
              transition={{ duration: 0.55, times: [0, 0.65, 1] }}
              className="text-[64px]"
            >
              {config.emoji}
            </motion.div>
            <div>
              <p className={`text-[11px] font-bold uppercase tracking-wider ${colors.text} mb-1`}>
                Nishon
              </p>
              <h2 className="text-[20px] font-black text-zinc-900">{config.title}</h2>
              <p className="text-[13px] text-zinc-500 mt-1 leading-relaxed">{config.message}</p>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5 flex flex-col gap-4">
            {/* 66-day identity section */}
            {isIdentity && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-violet-50 border border-violet-100 rounded-2xl px-5 py-4"
              >
                <p className="text-[11px] text-violet-400 font-semibold uppercase tracking-wide mb-2">
                  66 kun oldin siz yozdingiz
                </p>
                <p className="text-[15px] font-bold text-violet-700 italic leading-snug">
                  "Men {habit.identityStatement || habit.identity || "rivojlanib boraman"}"
                </p>
                <p className="text-[12px] text-violet-400 mt-2">Bu endi — haqiqat.</p>
              </motion.div>
            )}

            {/* Habit name + streak */}
            <div className="flex items-center gap-3 px-4 py-3 bg-zinc-50 rounded-xl border border-zinc-100">
              <span className="text-[22px]">{habit.emoji || "✨"}</span>
              <div>
                <p className="text-[13px] font-bold text-zinc-800">
                  {habit.name || habit.title}
                </p>
                <p className="text-[11px] text-zinc-400">{milestone} kun streak</p>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={onClose}
              className={`w-full py-3.5 rounded-xl ${colors.btn} text-white text-[14px] font-bold hover:opacity-90 active:scale-[0.98] transition-all`}
            >
              {isIdentity ? "Qabul qilaman ✓" : "Davom etaman →"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
