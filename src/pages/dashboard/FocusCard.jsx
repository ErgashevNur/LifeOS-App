import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLifeOSData } from "@/lib/lifeos-store";

const URGENCY_STYLE = {
  high:   { bg: "bg-red-50",    border: "border-red-200",    dot: "bg-red-500"    },
  medium: { bg: "bg-blue-50",   border: "border-blue-200",   dot: "bg-blue-500"   },
  low:    { bg: "bg-violet-50", border: "border-violet-200", dot: "bg-violet-500" },
};

export default function FocusCard({ focus, today }) {
  const { actions } = useLifeOSData();
  const s = URGENCY_STYLE[focus.urgency] || URGENCY_STYLE.low;

  const label = focus.type === "next_block"
    ? focus.block.label
    : focus.habit?.name;

  const emoji = focus.type === "next_block"
    ? focus.block.emoji
    : focus.habit?.emoji;

  const sublabel = focus.type === "next_block"
    ? `${focus.block.startTime} da boshlanadi`
    : focus.type === "streak_risk"
    ? `🔥 ${focus.habit?.streak} kunlik streak — yo'qolmasin`
    : focus.habit?.minimalVersion;

  return (
    <div className={cn(
      "flex items-center gap-3.5 px-4 py-4 rounded-2xl border",
      s.bg, s.border,
    )}>
      <div className={cn("w-2 h-2 rounded-full shrink-0 animate-pulse", s.dot)} />
      <span className="text-[28px] shrink-0">{emoji || "🎯"}</span>

      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-gray-900 truncate">{label}</p>
        <p className="text-[11px] text-gray-500 mt-0.5">{sublabel}</p>
      </div>

      {focus.type !== "next_block" && focus.habit && (
        <button
          type="button"
          onClick={() => actions.toggleHabitCompletion(focus.habit.id, today)}
          className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center shrink-0"
        >
          <Check className="w-4 h-4 text-white" />
        </button>
      )}
    </div>
  );
}

export function AllDoneCard() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-3 px-4 py-4 bg-green-50 border border-green-200 rounded-2xl"
    >
      <span className="text-[28px]">🎉</span>
      <div>
        <p className="text-[14px] font-semibold text-green-800">Bugun hammasi bajarildi!</p>
        <p className="text-[12px] text-green-600 mt-0.5">Dam oling — ertaga ham bor.</p>
      </div>
    </motion.div>
  );
}
