import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { classifyGoalStatus, getGoalMeta } from "@/lib/goalProgressEngine";
import GoalCardExpanded from "./GoalCardExpanded";

const STATUS_CONFIG = {
  onTrack:  { bg: "bg-white",     border: "border-black/[0.08]",  label: "To'g'ri yo'lda ✓",  labelColor: "text-green-600", bar: "bg-violet-500" },
  normal:   { bg: "bg-white",     border: "border-black/[0.08]",  label: "",                    labelColor: "",               bar: "bg-violet-500" },
  atRisk:   { bg: "bg-amber-50",  border: "border-amber-200",     label: "Orqada qolmoqda",     labelColor: "text-amber-600", bar: "bg-amber-400" },
  critical: { bg: "bg-red-50",    border: "border-red-200",       label: "Shoshilish kerak!",   labelColor: "text-red-600",   bar: "bg-red-500"   },
  overdue:  { bg: "bg-gray-50",   border: "border-gray-200",      label: "Muddat o'tdi",        labelColor: "text-gray-500",  bar: "bg-gray-400"  },
};

export default function GoalCard({ goal, habits, expanded, onToggle, index = 0 }) {
  const status = classifyGoalStatus(goal);
  const { daysLeft, timePct } = getGoalMeta(goal);
  const s = STATUS_CONFIG[status] || STATUS_CONFIG.normal;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className={cn("rounded-2xl border overflow-hidden", s.bg, s.border)}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left px-4 py-4"
      >
        <div className="flex items-start gap-3">
          <span className="text-[28px] mt-0.5">{goal.emoji || "🎯"}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[14px] font-semibold text-gray-900 leading-snug">
                {goal.title}
              </p>
              {status !== "normal" && s.label && (
                <span className={cn(
                  "text-[10px] font-medium shrink-0 mt-0.5",
                  s.labelColor,
                )}>
                  {s.label}
                </span>
              )}
            </div>

            <div className="mt-2.5 h-2 bg-black/[0.06] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${goal.progress || 0}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={cn("h-full rounded-full", s.bar)}
              />
            </div>

            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[11px] text-gray-400">
                {daysLeft === null
                  ? ""
                  : daysLeft >= 0
                  ? `${daysLeft} kun qoldi`
                  : `${Math.abs(daysLeft)} kun o'tdi`}
              </span>
              <span className="text-[12px] font-semibold text-gray-700">
                {goal.progress || 0}%
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-2">
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-gray-300" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <GoalCardExpanded
              goal={goal}
              habits={habits}
              status={status}
              daysLeft={daysLeft ?? 0}
              timePct={timePct}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
