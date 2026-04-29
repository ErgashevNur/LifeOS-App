import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { differenceInDaysFrom, parseISODate } from "@/lib/dashboardEngine";

export default function GoalProgressCard({ goal, index = 0 }) {
  const deadline = parseISODate(goal.deadline);
  const daysLeft = deadline ? differenceInDaysFrom(deadline) : null;

  // timeframeDays — explicit yoki timeframe.value+unit dan hisoblab olamiz
  const daysTotal = goal.timeframeDays
    || (goal.timeframe?.value
      ? goal.timeframe.value * (goal.timeframe.unit === "month" ? 30 : goal.timeframe.unit === "week" ? 7 : 1)
      : 90);

  const timeProgress = deadline && daysTotal > 0
    ? Math.max(0, 1 - daysLeft / daysTotal)
    : 0;
  const progress = (goal.progress || 0) / 100;
  const isAtRisk = deadline && progress < timeProgress - 0.15;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.05 }}
      className={cn(
        "px-4 py-3.5 rounded-2xl border",
        isAtRisk
          ? "bg-amber-50 border-amber-200"
          : "bg-white border-black/[0.07]",
      )}
    >
      <div className="flex items-center gap-3">
        <span className="text-[22px]">{goal.emoji || "🎯"}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[13px] font-medium text-gray-900 truncate">
              {goal.title}
            </p>
            <span className={cn(
              "text-[12px] font-semibold shrink-0",
              isAtRisk ? "text-amber-600" : "text-violet-600",
            )}>
              {goal.progress || 0}%
            </span>
          </div>

          <div className="mt-2 h-1.5 bg-black/[0.06] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${goal.progress || 0}%` }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className={cn(
                "h-full rounded-full",
                isAtRisk ? "bg-amber-400" : "bg-violet-500",
              )}
            />
          </div>

          <div className="flex items-center justify-between mt-1.5">
            <p className="text-[10px] text-gray-400">
              {daysLeft === null
                ? ""
                : daysLeft > 0
                ? `${daysLeft} kun qoldi`
                : "Muddat o'tdi"}
            </p>
            {isAtRisk && (
              <p className="text-[10px] text-amber-600 font-medium">
                ⚠️ Orqada qolmoqda
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
