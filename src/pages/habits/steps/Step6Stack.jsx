import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

const SCIENCE_NOTE =
  'B.J. Fogg: "Yangi odatni mavjud odatga bog\'lang: \'X dan keyin — Y qilaman\'. Bu eng kuchli va ishonchli odat qurish usuli."';

const DEMO_HABITS = [
  { id: "d1", name: "Ertalabki mashq",  emoji: "🏃", time: "Erta tong (05–07)" },
  { id: "d2", name: "Kitob o'qish",     emoji: "📚", time: "Kechqurun (17–20)" },
  { id: "d3", name: "Meditatsiya",      emoji: "🧘", time: "Tong (07–09)" },
  { id: "d4", name: "Jurnal yozish",    emoji: "✏️", time: "Kech kechqurun (20–23)" },
  { id: "d5", name: "Suv ichish",       emoji: "💧", time: "Ertalab (09–12)" },
];

export default function Step6Stack({ data, onChange, existingHabits = [] }) {
  const raw = existingHabits.length > 0 ? existingHabits : DEMO_HABITS;
  const habits = raw.map(h => ({
    id: h.id,
    name: h.name || h.title || "Odat",
    emoji: h.emoji || "📌",
    time: h.time || h.timeOfDay || "",
  }));

  return (
    <div className="flex flex-col gap-5">
      {/* Science note */}
      <div className="p-3.5 rounded-xl bg-violet-50 border border-violet-100">
        <p className="text-[12px] text-violet-700 leading-relaxed">{SCIENCE_NOTE}</p>
      </div>

      <div>
        <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-3">
          Mavjud odatga bog'lang
        </p>
        <div className="flex flex-col gap-2">
          {/* No stack option */}
          <button
            type="button"
            onClick={() => onChange({ linkedHabit: null })}
            className={cn(
              "flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all",
              !data.linkedHabit
                ? "border-violet-400 bg-violet-50"
                : "border-black/[0.08] bg-white hover:border-black/20 hover:bg-zinc-50"
            )}
          >
            <span className="text-xl">🚫</span>
            <div>
              <p className={cn(
                "text-[13px] font-semibold",
                !data.linkedHabit ? "text-violet-700" : "text-zinc-700"
              )}>
                Stack qo'llamang
              </p>
              <p className="text-[11px] text-zinc-400">Bu odatni mustaqil boshlayman</p>
            </div>
          </button>

          {/* Existing habits */}
          {habits.map(h => {
            const selected = data.linkedHabit?.id === h.id;
            return (
              <button
                key={h.id}
                type="button"
                onClick={() => onChange({ linkedHabit: selected ? null : h })}
                className={cn(
                  "flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all",
                  selected
                    ? "border-violet-400 bg-violet-50"
                    : "border-black/[0.08] bg-white hover:border-black/20 hover:bg-zinc-50"
                )}
              >
                <span className="text-xl">{h.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-[13px] font-semibold truncate",
                    selected ? "text-violet-700" : "text-zinc-700"
                  )}>
                    {h.name}
                  </p>
                  {h.time && <p className="text-[11px] text-zinc-400">{h.time}</p>}
                </div>
                {selected && (
                  <span className="text-violet-500 text-[12px] font-bold shrink-0">✓</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Preview */}
      {data.linkedHabit && (
        <div className="p-3.5 rounded-xl bg-green-50 border border-green-100 flex items-center gap-2.5 flex-wrap">
          <span className="text-xl">{data.linkedHabit.emoji}</span>
          <span className="text-[13px] font-medium text-green-700">{data.linkedHabit.name}</span>
          <ArrowRight className="w-4 h-4 text-green-500 shrink-0" />
          <span className="text-[13px] font-semibold text-green-800">
            {data.emoji} {data.name || "Yangi odat"}
          </span>
        </div>
      )}
    </div>
  );
}
