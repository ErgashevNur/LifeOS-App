import { getPersonalityType } from "@/lib/personalityEngine";

export default function PersonalityBadge({ type }) {
  if (!type) return null;
  const personality = getPersonalityType(type);

  return (
    <div className="flex items-center gap-3 px-4 py-3.5 bg-violet-50 border border-violet-100 rounded-xl">
      <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center text-[18px]">
        {personality.emoji}
      </div>
      <div>
        <p className="text-[11px] text-violet-400 font-medium uppercase tracking-wide">Sizning tipingiz</p>
        <p className="text-[14px] font-semibold text-violet-700">{personality.label}</p>
      </div>
    </div>
  );
}
