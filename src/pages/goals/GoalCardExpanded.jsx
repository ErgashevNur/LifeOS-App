import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useLifeOSData } from "@/lib/lifeos-store";
import CloudyGoalInsight from "./CloudyGoalInsight";
import MilestonesSection from "./MilestonesSection";
import LinkedHabitsSection from "./LinkedHabitsSection";

function DeleteConfirm({ onConfirm, onCancel }) {
  return (
    <div className="px-3.5 py-3 rounded-xl bg-red-50 border border-red-200 flex flex-col gap-2.5">
      <p className="text-[12px] text-red-700 font-medium">
        Maqsadni o'chirasizmi? Bog'liq odatlar ham o'chiriladi.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 rounded-lg border border-black/[0.08] bg-white text-[12px] text-gray-600"
        >
          Bekor
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="flex-1 py-2 rounded-lg bg-red-500 text-white text-[12px] font-semibold"
        >
          O'chirish
        </button>
      </div>
    </div>
  );
}

export default function GoalCardExpanded({ goal, habits, status, daysLeft, timePct }) {
  const { actions } = useLifeOSData();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div className="px-4 pb-4 flex flex-col gap-3 border-t border-black/[0.05]">
      <CloudyGoalInsight
        goal={goal}
        status={status}
        daysLeft={daysLeft}
        timePct={timePct}
      />

      {goal.milestones?.length > 0 && (
        <MilestonesSection goal={goal} />
      )}

      {habits.length > 0 && (
        <LinkedHabitsSection habits={habits} />
      )}

      <div className="flex gap-2 mt-1">
        <button
          type="button"
          onClick={() => {
            const newProgress = Math.min(100, (goal.progress || 0) + 10);
            actions.updateLocalGoalProgress(goal.id, newProgress);
          }}
          className="flex-1 py-2.5 rounded-xl bg-violet-600 text-white text-[12px] font-semibold"
        >
          +10% Progress
        </button>
        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          className="px-3 py-2.5 rounded-xl border border-black/[0.08] text-[12px] text-gray-500"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {showDeleteConfirm && (
        <DeleteConfirm
          onConfirm={() => actions.deleteLocalGoal(goal.id)}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}
