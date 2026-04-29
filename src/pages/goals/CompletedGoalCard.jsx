import { motion } from "framer-motion";
import { parseISODate } from "@/lib/dashboardEngine";

const UZ_MONTHS = [
  "yanvar", "fevral", "mart", "aprel", "may", "iyun",
  "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr",
];

function formatUzDate(iso) {
  const d = parseISODate(iso);
  if (!d) return null;
  return `${d.getDate()} ${UZ_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export default function CompletedGoalCard({ goal }) {
  const completedDate = formatUzDate(goal.completedAt);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-3 px-4 py-3.5 bg-white border border-black/[0.07] rounded-2xl mb-2 opacity-70"
    >
      <span className="text-[24px]">{goal.emoji || "🎯"}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-gray-700 truncate line-through">
          {goal.title}
        </p>
        {completedDate && (
          <p className="text-[10px] text-gray-400 mt-0.5">
            {completedDate} da yutildi
          </p>
        )}
      </div>
      <span className="text-[18px]">🏆</span>
    </motion.div>
  );
}
