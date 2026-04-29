import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

const SCIENCE_NOTE =
  'Charles Duhigg: "Har bir odat Cue → Routine → Reward siklidan iborat. Kuchli va aniq trigger — barqaror odatning asosi."';

const CUE_TYPES = [
  {
    value: "time",
    label: "Aniq vaqt",
    emoji: "🕐",
    desc: "Muayyan vaqtda",
    inputType: "time",
    placeholder: "",
  },
  {
    value: "action",
    label: "Odatdan keyin",
    emoji: "➡️",
    desc: "Boshqa harakatdan keyin",
    inputType: "text",
    placeholder: "masalan: Kofe ichib bo'lgach",
  },
  {
    value: "place",
    label: "Joy",
    emoji: "📍",
    desc: "Muayyan joyda",
    inputType: "text",
    placeholder: "masalan: Ish stolim oldida",
  },
  {
    value: "emotion",
    label: "His-tuyg'u",
    emoji: "💭",
    desc: "His paydo bo'lganda",
    inputType: "text",
    placeholder: "masalan: Tashvish his qilganimda",
  },
];

export default function Step4Cue({ data, onChange }) {
  const selected = CUE_TYPES.find(c => c.value === data.cueType);

  const previewLabel =
    data.cueType === "time"
      ? `Soat ${data.cueValue}`
      : data.cueValue;

  return (
    <div className="flex flex-col gap-5">
      {/* Science note */}
      <div className="p-3.5 rounded-xl bg-violet-50 border border-violet-100">
        <p className="text-[12px] text-violet-700 leading-relaxed">{SCIENCE_NOTE}</p>
      </div>

      {/* Cue type cards */}
      <div>
        <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-3">
          Trigger turi *
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          {CUE_TYPES.map(c => (
            <button
              key={c.value}
              type="button"
              onClick={() => onChange({ cueType: c.value, cueValue: "" })}
              className={cn(
                "flex flex-col items-start gap-1 p-3.5 rounded-xl border text-left transition-all",
                data.cueType === c.value
                  ? "border-violet-500 bg-violet-50"
                  : "border-black/[0.08] bg-white hover:border-black/20 hover:bg-zinc-50"
              )}
            >
              <span className="text-xl">{c.emoji}</span>
              <span className={cn(
                "text-[13px] font-semibold",
                data.cueType === c.value ? "text-violet-700" : "text-zinc-800"
              )}>
                {c.label}
              </span>
              <span className="text-[11px] text-zinc-400">{c.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Contextual input */}
      {selected && (
        <div>
          <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
            {selected.label}
          </p>
          <input
            type={selected.inputType}
            value={data.cueValue}
            onChange={e => onChange({ cueValue: e.target.value })}
            placeholder={selected.placeholder}
            className="w-full px-4 py-3 rounded-xl border border-black/[0.08] bg-white text-[14px] font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-400 transition-all"
          />
        </div>
      )}

      {/* Implementation Intention — extra fields for "time" cue */}
      {data.cueType === "time" && data.cueValue && (
        <div className="flex flex-col gap-3 pt-1">
          <div className="px-3 py-2.5 rounded-xl bg-amber-50/60 border border-amber-100">
            <p className="text-[11px] text-amber-800 leading-relaxed">
              <strong>Implementation Intention</strong> — tadqiqotlar ko'rsatadi:
              "Qachon + Qayerda + Qaysi cuedan keyin" formuli odat bajarilishini 2-3x oshiradi.
            </p>
          </div>

          <div>
            <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              Joy <span className="text-zinc-300">(ixtiyoriy)</span>
            </p>
            <input
              type="text"
              value={data.location || ""}
              onChange={e => onChange({ location: e.target.value })}
              placeholder="masalan: Oshxonada / Stol oldida / Yotoqxonada"
              className="w-full px-4 py-3 rounded-xl border border-black/[0.08] bg-white text-[14px] font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-400 transition-all"
            />
          </div>

          <div>
            <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              Qaysi harakatdan keyin <span className="text-zinc-300">(ixtiyoriy)</span>
            </p>
            <input
              type="text"
              value={data.afterCue || ""}
              onChange={e => onChange({ afterCue: e.target.value })}
              placeholder="masalan: Tishimni yuvgandan keyin / Kofeni quygach"
              className="w-full px-4 py-3 rounded-xl border border-black/[0.08] bg-white text-[14px] font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-400 transition-all"
            />
          </div>
        </div>
      )}

      {/* Preview */}
      {data.cueType && data.cueValue && (
        <div className="p-3.5 rounded-xl bg-green-50 border border-green-100">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-[13px] font-medium text-green-700">{previewLabel}</span>
            <ArrowRight className="w-4 h-4 text-green-500 shrink-0" />
            <span className="text-[13px] font-semibold text-green-800">
              {data.emoji} {data.name || "Yangi odat"}
            </span>
          </div>
          {(data.location || data.afterCue) && (
            <p className="text-[11px] text-green-700 mt-1.5 leading-relaxed">
              {[
                data.afterCue && `${data.afterCue} dan keyin`,
                data.location && `${data.location}`,
              ].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
