/* ─── DualRing ────────────────────────────────────────────────────── */
function DualRing({ outer, inner }) {
  const SIZE = 56;
  const CX = SIZE / 2;

  function arc(r, done, total) {
    const c = 2 * Math.PI * r;
    const pct = total > 0 ? done / total : 0;
    const dash = c * pct;
    const offset = -c * 0.25 + c; // start at top
    return { c, dash, offset };
  }

  const o = arc(24, outer.done, outer.total);
  const i = arc(16, inner.done, inner.total);
  const combinedPct =
    outer.total + inner.total > 0
      ? Math.round(((outer.done + inner.done) / (outer.total + inner.total)) * 100)
      : 0;

  return (
    <div className="relative w-14 h-14 shrink-0">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {/* Outer track (habits — violet) */}
        <circle cx={CX} cy={CX} r={24} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="4" />
        <circle
          cx={CX} cy={CX} r={24} fill="none"
          stroke="#7C3AED" strokeWidth="4"
          strokeDasharray={`${o.dash} ${o.c}`}
          strokeDashoffset={-o.offset + o.c}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray .6s ease" }}
        />
        {/* Inner track (tasks — blue) */}
        <circle cx={CX} cy={CX} r={16} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="3.5" />
        <circle
          cx={CX} cy={CX} r={16} fill="none"
          stroke="#3B82F6" strokeWidth="3.5"
          strokeDasharray={`${i.dash} ${i.c}`}
          strokeDashoffset={-i.offset + i.c}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray .6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-bold text-zinc-700">{combinedPct}%</span>
      </div>
    </div>
  );
}

/* ─── PlannerHeader ───────────────────────────────────────────────── */
export default function PlannerHeader({
  date,
  habitsDone, habitsTotal,
  tasksDone,  tasksTotal,
}) {
  const d = new Date(date + "T00:00:00");
  const dayLabel = d.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  return (
    <div className="px-4 pt-4 pb-3 bg-white border-b border-black/[0.06]">
      <div className="flex items-center gap-3">
        <DualRing
          outer={{ done: habitsDone, total: habitsTotal }}
          inner={{ done: tasksDone,  total: tasksTotal  }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            Bugungi reja
          </p>
          <p className="text-[14px] font-bold text-zinc-900 mt-0.5 capitalize truncate">
            {dayLabel}
          </p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[11px] text-violet-600 font-semibold">
              {habitsDone}/{habitsTotal} odat
            </span>
            <span className="text-[11px] text-blue-500 font-semibold">
              {tasksDone}/{tasksTotal} vazifa
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
