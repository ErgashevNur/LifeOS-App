import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TimeBlock({ block, onDone }) {
  const isHabit = block.type === "habit";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative ml-3 mb-2 rounded-xl border px-3 py-2.5 cursor-pointer transition-all select-none",
        isHabit
          ? "bg-violet-50/80 border-violet-200 border-l-[3px] border-l-violet-500 hover:bg-violet-50"
          : "bg-white border-black/[0.08] hover:border-black/20 hover:shadow-sm",
        block.done && "opacity-50"
      )}
      onClick={() => onDone?.(block.id)}
    >
      {/* Lock icon for habits */}
      {isHabit && (
        <div className="absolute top-2 right-2">
          <Lock className="w-2.5 h-2.5 text-violet-400" />
        </div>
      )}

      <div className="flex items-center gap-2.5 pr-5">
        {/* Emoji */}
        <span className="text-[16px] shrink-0">{block.emoji || "📌"}</span>

        {/* Label + time */}
        <div className="flex-1 min-w-0">
          <div className={cn(
            "text-[13px] font-medium truncate",
            isHabit ? "text-violet-700" : "text-zinc-800",
            block.done && "line-through"
          )}>
            {block.label}
          </div>
          <div className="text-[10px] text-zinc-400 mt-0.5 flex items-center gap-1.5">
            <span>{block.startTime} – {block.endTime}</span>
            {isHabit && (
              <span className="text-violet-400 font-medium">· odat</span>
            )}
          </div>
        </div>

        {/* Done checkbox */}
        <div className={cn(
          "w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center shrink-0 transition-all",
          block.done
            ? isHabit
              ? "bg-violet-600 border-violet-600"
              : "bg-zinc-700 border-zinc-700"
            : "border-zinc-300"
        )}>
          {block.done && (
            <span className="text-white text-[9px] font-bold">✓</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
