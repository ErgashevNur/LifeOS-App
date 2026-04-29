export default function SystemPreviewCard({ system }) {
  if (!system) return null;
  return (
    <div className="w-full p-4 rounded-2xl bg-violet-50/70 border border-violet-100">
      <div className="flex items-start gap-3 mb-3">
        <div className="text-[28px] leading-none">{system.goalEmoji}</div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-violet-600 uppercase tracking-wider">Maqsad</p>
          <p className="text-[14px] font-semibold text-zinc-900 leading-snug">{system.goalTitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="p-2.5 rounded-xl bg-white/70 border border-violet-100">
          <p className="text-[10px] font-semibold text-violet-500 uppercase tracking-wider">Haftalik</p>
          <p className="text-[13px] font-bold text-zinc-900 mt-0.5">{system.weeklyTime}</p>
        </div>
        <div className="p-2.5 rounded-xl bg-white/70 border border-violet-100">
          <p className="text-[10px] font-semibold text-violet-500 uppercase tracking-wider">Kunlik</p>
          <p className="text-[13px] font-bold text-zinc-900 mt-0.5">{system.dailyTime}</p>
        </div>
      </div>

      <div className="mb-3">
        <p className="text-[11px] font-semibold text-violet-600 uppercase tracking-wider mb-1.5">Odatlar</p>
        <div className="flex flex-col gap-1.5">
          {system.habits.map((h, i) => (
            <div key={i} className="flex items-center gap-2.5 p-2 rounded-lg bg-white/80 border border-violet-100/60">
              <span className="text-[16px]">{h.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[12.5px] font-semibold text-zinc-900 truncate">{h.name}</p>
                <p className="text-[11px] text-zinc-500 truncate">
                  {h.scheduledTime} · {h.minimalVersion}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-3">
        <p className="text-[11px] font-semibold text-violet-600 uppercase tracking-wider mb-1.5">Bosqichlar</p>
        <div className="flex flex-col gap-1">
          {system.milestones.map((m, i) => (
            <div key={i} className="flex items-center gap-2 text-[12px]">
              <span className="px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 font-bold text-[10px]">{m.day}-kun</span>
              <span className="text-zinc-700">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-2.5 rounded-xl bg-white border border-violet-200">
        <p className="text-[10px] font-semibold text-violet-500 uppercase tracking-wider mb-0.5">Birinchi qadam (bugun)</p>
        <p className="text-[12.5px] text-zinc-800 leading-relaxed">{system.firstStep}</p>
      </div>
    </div>
  );
}
