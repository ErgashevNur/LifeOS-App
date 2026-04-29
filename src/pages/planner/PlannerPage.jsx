import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useLifeOSData } from "@/lib/lifeos-store";
import {
  buildTodayBlocks,
  detectConflicts,
  calcFreeSlots,
} from "@/lib/scheduleEngine";

import PlannerHeader  from "./PlannerHeader";
import ConflictBanner from "./ConflictBanner";
import Timeline       from "./Timeline";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function PlannerPage() {
  const { habits, tasks, plannedBlocks, actions } = useLifeOSData();
  const today = todayStr();

  /* ── Derived data ── */
  const blocks = useMemo(
    () => buildTodayBlocks(plannedBlocks, habits, tasks, today),
    [plannedBlocks, habits, tasks, today],
  );

  const conflicts = useMemo(() => detectConflicts(blocks), [blocks]);
  const freeSlots = useMemo(() => calcFreeSlots(blocks), [blocks]);

  const habitBlocks = blocks.filter(b => b.type === "habit");
  const taskBlocks  = blocks.filter(b => b.type === "task");

  /* ── Handlers ── */
  const handleBlockDone = (blockId) => {
    const block = plannedBlocks.find(b => b.id === blockId);
    if (block?.type === "habit") {
      // toggleHabitCompletion handles both block.done and habit.completedToday
      actions.toggleHabitCompletion(block.refId, block.date);
    } else {
      actions.markBlockDone(blockId);
    }
  };

  const handleAddTask = (slot) => {
    // Placeholder — can open a quick-add modal in future
    console.log("Add task to slot:", slot);
  };

  /* ── Empty state ── */
  const isEmpty = blocks.length === 0;

  return (
    <div className="flex flex-col h-full bg-[#F5F5F4]">
      <PlannerHeader
        date={today}
        habitsDone={habitBlocks.filter(b => b.done).length}
        habitsTotal={habitBlocks.length}
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
          <EmptyPlanner />
        ) : (
          <Timeline
            blocks={blocks}
            freeSlots={freeSlots}
            onDone={handleBlockDone}
            onAddTask={handleAddTask}
          />
        )}
      </div>
    </div>
  );
}

/* ─── Empty state ─────────────────────────────────────────────────── */
function EmptyPlanner() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 px-8 text-center pb-16">
      <span className="text-4xl">📅</span>
      <p className="text-[15px] font-bold text-zinc-800">Bugun reja yo'q</p>
      <p className="text-[13px] text-zinc-400 leading-relaxed">
        Odatlarga "Aniq vaqt" trigger qo'shilganda bloklar avtomatik paydo bo'ladi.
        <br />
        <span className="text-violet-500 font-medium">Habits → Yangi odat → Step 4</span>
      </p>
    </div>
  );
}
