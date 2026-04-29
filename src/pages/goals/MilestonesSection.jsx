import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLifeOSData } from "@/lib/lifeos-store";

export default function MilestonesSection({ goal }) {
  const { actions } = useLifeOSData();
  const milestones = goal.milestones || [];

  return (
    <div>
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
        Milestonelar
      </p>
      <div className="flex flex-col gap-1.5">
        {milestones.map((m, i) => {
          const isDone = !!m.done;
          const prevDone = i === 0 || !!milestones[i - 1]?.done;
          const isCurrent = !isDone && prevDone;

          return (
            <div
              key={i}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-xl border",
                isDone    ? "bg-green-50  border-green-200"   :
                isCurrent ? "bg-violet-50 border-violet-200"  :
                "bg-[#FAFAF9] border-black/[0.06]",
              )}
            >
              <div className={cn(
                "w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center shrink-0",
                isDone    ? "bg-green-500  border-green-500"  :
                isCurrent ? "border-violet-400"               :
                "border-gray-300",
              )}>
                {isDone && <Check className="w-3 h-3 text-white" />}
                {isCurrent && <div className="w-2 h-2 rounded-full bg-violet-400" />}
              </div>

              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-[12px] font-medium",
                  isDone ? "text-green-700" : isCurrent ? "text-violet-700" : "text-gray-500",
                )}>
                  {m.label}
                  {m.day ? <span className="text-gray-400 font-normal"> · {m.day}-kun</span> : null}
                </p>
                {m.description && (
                  <p className="text-[10px] text-gray-400 mt-0.5">{m.description}</p>
                )}
              </div>

              {isCurrent && (
                <button
                  type="button"
                  onClick={() => actions.updateGoalMilestone(goal.id, i, true)}
                  className="text-[10px] font-medium text-violet-600 px-2 py-1 bg-violet-100 rounded-lg shrink-0"
                >
                  Bajarildi
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
