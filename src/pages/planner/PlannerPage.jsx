import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useLifeOSData } from "@/lib/lifeos-store";
import { buildTodayBlocks, detectConflicts, calcFreeSlots } from "@/lib/scheduleEngine";
import { cn } from "@/lib/utils";
import { Check, Target, ChevronRight } from "lucide-react";

import PlannerHeader  from "./PlannerHeader";
import ConflictBanner from "./ConflictBanner";
import Timeline       from "./Timeline";
import TimeBlock      from "./TimeBlock";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

/* ─── Goal habits without scheduled time (no plannedBlock) ─────────── */
function UnscheduledHabits({ habits, onDone }) {
  const today = todayStr();
  if (!habits.length) return null;

  return (
    <div className="px-4 pb-3">
      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 mt-3">
        Vaqtsiz odatlar
      </p>
      <div className="flex flex-col gap-1.5">
        {habits.map(h => {
          const done = (h.completedDates || []).includes(today);
          return (
            <motion.div
              key={h.id}
              layout
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl border ml-3 cursor-pointer transition-all",
                done
                  ? "bg-zinc-50 border-zinc-100 opacity-50"
                  : "bg-white border-black/[0.08] hover:border-black/20"
              )}
              onClick={() => onDone(h.id)}
            >
              <span className="text-base shrink-0">{h.emoji || "📌"}</span>
              <div className="flex-1 min-w-0">
                <p className={cn("text-[13px] font-medium truncate", done ? "text-zinc-400 line-through" : "text-zinc-800")}>
                  {h.name}
                </p>
                <p className="text-[10px] text-zinc-400">{h.minimalVersion || "—"}</p>
              </div>
              <div className={cn(
                "w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center shrink-0 transition-all",
                done ? "bg-violet-600 border-violet-600" : "border-zinc-300"
              )}>
                {done && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Empty state ─────────────────────────────────────────────────── */
function EmptyPlanner({ onGoToGoals }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center pb-16">
      <span className="text-4xl">📅</span>
      <div>
        <p className="text-[15px] font-bold text-zinc-800">Bugun reja yo'q</p>
        <p className="text-[13px] text-zinc-400 leading-relaxed mt-1">
          Maqsad qo'ying — Cloudy AI odatlarni jadvalga avtomatik qo'shadi
        </p>
      </div>
      <button
        onClick={onGoToGoals}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 text-white text-[13px] font-bold hover:bg-violet-700 transition-all"
      >
        <Target className="w-4 h-4" /> Maqsad qo'y
      </button>
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────────────── */
export default function PlannerPage() {
  const { habits, tasks, plannedBlocks, actions, data } = useLifeOSData();
  const navigate = useNavigate();
  const today = todayStr();

  /* ── Timeline blocks (habits with scheduledTime → plannedBlocks) ── */
  const blocks = useMemo(
    () => buildTodayBlocks(plannedBlocks, habits, tasks, today),
    [plannedBlocks, habits, tasks, today],
  );

  const conflicts  = useMemo(() => detectConflicts(blocks), [blocks]);
  const freeSlots  = useMemo(() => calcFreeSlots(blocks), [blocks]);
  const habitBlocks = blocks.filter(b => b.type === "habit");
  const taskBlocks  = blocks.filter(b => b.type === "task");

  /* ── Goal-linked habits WITHOUT a scheduled time block ────────────
     These are shown as a simple checklist below the timeline.        */
  const unscheduledHabits = useMemo(() => {
    const scheduledIds = new Set(habitBlocks.map(b => b.refId));
    return habits.filter(h => {
      const hasGoal = h.linkedGoalId || h.goalId;
      const hasTime = h.cueType === "time" && (h.cueValue || h.scheduledTime);
      return hasGoal && !hasTime && !scheduledIds.has(h.id);
    });
  }, [habits, habitBlocks]);

  /* ── Handlers ── */
  const handleBlockDone = (blockId) => {
    const block = plannedBlocks.find(b => b.id === blockId);
    if (block?.type === "habit") {
      actions.toggleHabitCompletion(block.refId, block.date);
    } else {
      actions.markBlockDone(blockId);
    }
  };

  const handleUnscheduledDone = (habitId) => {
    actions.toggleHabitCompletion(habitId, today);
  };

  const handleAddTask = () => {};

  const totalHabitsToday = habitBlocks.length + unscheduledHabits.length;
  const doneHabitsToday  = habitBlocks.filter(b => b.done).length
    + unscheduledHabits.filter(h => (h.completedDates || []).includes(today)).length;

  const isEmpty = blocks.length === 0 && unscheduledHabits.length === 0;

  return (
    <div className="flex flex-col h-full bg-[#F5F5F4]">
      <PlannerHeader
        date={today}
        habitsDone={doneHabitsToday}
        habitsTotal={totalHabitsToday}
        tasksDone={taskBlocks.filter(b => b.done).length}
        tasksTotal={taskBlocks.length}
      />

      <AnimatePresence>
        {conflicts.length > 0 && (
          <ConflictBanner key="conflicts" conflicts={conflicts} />
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <EmptyPlanner onGoToGoals={() => navigate("/goals")} />
        ) : (
          <>
            {blocks.length > 0 && (
              <Timeline
                blocks={blocks}
                freeSlots={freeSlots}
                onDone={handleBlockDone}
                onAddTask={handleAddTask}
              />
            )}
            <UnscheduledHabits
              habits={unscheduledHabits}
              onDone={handleUnscheduledDone}
            />
          </>
        )}
      </div>
    </div>
  );
}
