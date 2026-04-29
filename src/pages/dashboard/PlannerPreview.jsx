import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import SectionLabel from "@/components/shared/SectionLabel";
import { formatDate } from "@/lib/dashboardEngine";

export default function PlannerPreview({ blocks }) {
  const now = formatDate(new Date(), "HH:mm");

  const upcoming = (blocks || [])
    .filter(b => b.startTime >= now && !b.done)
    .slice(0, 3);

  if (upcoming.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <SectionLabel label="Keyingi bloklar" linkTo="/planner" />
      <div className="flex flex-col gap-2 mt-2.5">
        {upcoming.map((block) => (
          <div
            key={block.id}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl border",
              block.type === "habit"
                ? "bg-violet-50/60 border-violet-200 border-l-[3px] border-l-violet-500"
                : "bg-white border-black/[0.07]",
            )}
          >
            <span className="text-[18px]">{block.emoji || "📌"}</span>
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-[12px] font-medium truncate",
                block.type === "habit" ? "text-violet-700" : "text-gray-800",
              )}>
                {block.label}
              </p>
            </div>
            <span className="text-[11px] text-gray-400 shrink-0">
              {block.startTime}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
