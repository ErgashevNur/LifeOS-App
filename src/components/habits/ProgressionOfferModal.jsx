import { motion } from "framer-motion";
import {
  getCurrentStage,
  getVersionForStage,
} from "@/lib/progressionEngine";

export default function ProgressionOfferModal({ habit, nextStage, onAccept, onDecline }) {
  if (!habit || !nextStage) return null;

  const currentStage = getCurrentStage(habit.streak || 0);
  const currentVersion = getVersionForStage(habit, currentStage.id);
  const nextVersion = getVersionForStage(habit, nextStage.id);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 flex items-end justify-center z-[70]"
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-white rounded-t-2xl w-full max-w-lg p-6 pb-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-8 h-1 bg-black/[0.1] rounded-full mx-auto mb-5" />

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <span className="text-[32px]">{nextStage.emoji}</span>
          <div>
            <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">
              Cloudy taklifi
            </p>
            <h3 className="text-[16px] font-semibold text-gray-900">
              O'sishga tayyormisiz?
            </h3>
          </div>
        </div>

        {/* Current → Next */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 px-3.5 py-3 bg-[#FAFAF9] rounded-xl border border-black/[0.06]">
            <p className="text-[10px] text-gray-400 mb-1">Hozir</p>
            <p className="text-[13px] font-medium text-gray-700">{currentVersion}</p>
          </div>
          <div className="text-gray-300 text-[18px]">→</div>
          <div className="flex-1 px-3.5 py-3 bg-violet-50 rounded-xl border border-violet-200">
            <p className="text-[10px] text-violet-400 mb-1">Keyingi qadam</p>
            <p className="text-[13px] font-medium text-violet-700">{nextVersion}</p>
          </div>
        </div>

        {/* Cloudy message */}
        <div className="flex gap-2.5 px-4 py-3 bg-violet-50 border border-violet-100 rounded-xl mb-5">
          <span className="text-[14px] shrink-0">☁️</span>
          <p className="text-[12px] text-violet-700 leading-relaxed">
            So'nggi 7 kunda {habit.name || habit.title} ni 100% bajardingiz.
            Miya yangi qadam uchun tayyor ko'rinadi.
            Lekin siz bilasiz yaxshiroq — tayyor emassizmi?
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onDecline}
            className="flex-1 py-3 rounded-xl border border-black/[0.08] text-[13px] text-gray-600"
          >
            Hozircha yaxshi
          </button>
          <button
            onClick={onAccept}
            className="flex-1 py-3 rounded-xl bg-violet-600 text-white text-[13px] font-semibold"
          >
            Ha, o'saman →
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
