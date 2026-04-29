import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLifeOSData } from "@/lib/lifeos-store";
import SectionLabel from "@/components/shared/SectionLabel";
import HabitRing from "./HabitRing";

export default function HabitsTodaySection({ habits, doneHabits, today }) {
  const { actions } = useLifeOSData();
  const doneIds = new Set((doneHabits || []).map(h => h.id));

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
    >
      <SectionLabel
        label="Bugungi odatlar"
        badge={`${doneHabits.length}/${habits.length}`}
        linkTo="/goals"
      />

      <div className="flex items-center gap-4 mt-3 mb-3">
        <HabitRing done={doneHabits.length} total={habits.length} />
        <div>
          <p className="text-[20px] font-bold text-gray-900">
            {doneHabits.length}/{habits.length}
          </p>
          <p className="text-[12px] text-gray-400">bajarildi</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {habits.map((habit, i) => {
          const done = doneIds.has(habit.id);
          return (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i }}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all",
                done
                  ? "bg-[#FAFAF9] border-black/[0.05] opacity-60"
                  : "bg-white border-black/[0.08]",
              )}
            >
              <span className="text-[20px]">{habit.emoji || "🌱"}</span>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-[13px] font-medium",
                  done ? "text-gray-400 line-through" : "text-gray-900",
                )}>
                  {habit.name}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {habit.scheduledTime || "—"} · {habit.minimalVersion || "minimal versiya"}
                </p>
              </div>

              {(habit.streak || 0) > 0 && (
                <span className="text-[11px] text-orange-500 font-medium shrink-0">
                  🔥{habit.streak}
                </span>
              )}

              <button
                type="button"
                onClick={() => actions.toggleHabitCompletion(habit.id, today)}
                className={cn(
                  "w-7 h-7 rounded-full border-[1.5px] flex items-center justify-center shrink-0 transition-all",
                  done
                    ? "bg-violet-600 border-violet-600"
                    : "border-gray-300 hover:border-violet-400",
                )}
              >
                {done && <Check className="w-3.5 h-3.5 text-white" />}
              </button>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
