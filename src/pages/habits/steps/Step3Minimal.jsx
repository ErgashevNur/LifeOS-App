import { cn } from "@/lib/utils";
import { ArrowDown } from "lucide-react";

const SCIENCE_NOTE =
  'James Clear: "2-daqiqa qoidasi: Yangi odatni boshlashda uni 2 daqiqadan kamroq vaqt olishi kerak bo\'lgan narsaga kichraytiring. Boshlanish — eng muhim qadam."';

const DURATIONS = ["1 daq", "2 daq", "5 daq", "10 daq", "15 daq", "20 daq"];

export default function Step3Minimal({ data, onChange }) {
  return (
    <div className="flex flex-col gap-5">
      {/* Science note */}
      <div className="p-3.5 rounded-xl bg-violet-50 border border-violet-100">
        <p className="text-[12px] text-violet-700 leading-relaxed">{SCIENCE_NOTE}</p>
      </div>

      {/* Full version */}
      <div>
        <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
          To'liq versiya
        </p>
        <input
          value={data.fullVersion}
          onChange={e => onChange({ fullVersion: e.target.value })}
          placeholder="masalan: 30 daqiqa yugurish"
          className="w-full px-4 py-3 rounded-xl border border-black/[0.08] bg-white text-[14px] font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-400 transition-all"
        />
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 text-zinc-400">
        <div className="flex-1 h-px bg-black/[0.06]" />
        <div className="flex items-center gap-1.5 text-[11px] font-semibold">
          <ArrowDown className="w-3.5 h-3.5" />
          <span>kichraytir</span>
        </div>
        <div className="flex-1 h-px bg-black/[0.06]" />
      </div>

      {/* Minimal version */}
      <div>
        <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
          Minimal versiya *
        </p>
        <input
          value={data.minimalVersion}
          onChange={e => onChange({ minimalVersion: e.target.value })}
          placeholder="masalan: 1 daqiqa yugurish"
          className="w-full px-4 py-3 rounded-xl border border-black/[0.08] bg-white text-[14px] font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-400 transition-all"
        />
      </div>

      {/* Duration chips */}
      <div>
        <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2.5">
          Minimal vaqt
        </p>
        <div className="flex flex-wrap gap-2">
          {DURATIONS.map(d => (
            <button
              key={d}
              type="button"
              onClick={() => onChange({ minimalDuration: d })}
              className={cn(
                "px-3.5 py-2 rounded-xl text-[12px] font-semibold border transition-all",
                data.minimalDuration === d
                  ? "bg-violet-600 text-white border-transparent"
                  : "bg-white border-black/[0.08] text-zinc-600 hover:border-black/20",
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Future versions — optional */}
      <div className="pt-1">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[11px] text-zinc-400 font-medium">Kelajakdagi versiyalar (ixtiyoriy)</span>
          <div className="flex-1 h-px bg-black/[0.05]" />
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2.5">
            <span className="text-[16px] shrink-0">🌳</span>
            <input
              value={data.strongVersion || ""}
              onChange={e => onChange({ strongVersion: e.target.value })}
              placeholder="66 kunda — kuchli versiya"
              className="flex-1 px-3 py-2.5 rounded-xl border border-black/[0.07] bg-[#FAFAF9] text-[12px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-violet-400 transition-all"
            />
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-[16px] shrink-0">💎</span>
            <input
              value={data.masterVersion || ""}
              onChange={e => onChange({ masterVersion: e.target.value })}
              placeholder="100 kunda — master versiya"
              className="flex-1 px-3 py-2.5 rounded-xl border border-black/[0.07] bg-[#FAFAF9] text-[12px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-violet-400 transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
