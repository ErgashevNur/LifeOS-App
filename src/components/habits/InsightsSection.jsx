import { useMemo } from "react";
import { generateInsights } from "@/lib/behaviorEngine";

export default function InsightsSection({ habits, completionLogs }) {
  const insights = useMemo(
    () => generateInsights(habits || [], completionLogs || []),
    [habits, completionLogs],
  );

  if (insights.length === 0) return null;

  const top = insights[0];

  return (
    <div className="mx-4 mb-3">
      <div className="flex items-start gap-2.5 px-4 py-3.5 bg-violet-50 border border-violet-100 rounded-xl">
        <span className="text-[16px] shrink-0">🧠</span>
        <div>
          <p className="text-[12px] font-semibold text-violet-700 mb-0.5">Cloudy pattern topdi</p>
          <p className="text-[12px] text-violet-600 leading-relaxed">{top.message}</p>
          {top.action && (
            <p className="text-[11px] text-violet-400 mt-1">→ {top.action}</p>
          )}
        </div>
      </div>
    </div>
  );
}
