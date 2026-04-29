import { cn } from "@/lib/utils";

const FREQUENCY_OPTIONS = [
  { value: "daily",    label: "Har kuni",    sub: "7/7 kun" },
  { value: "weekdays", label: "Ish kunlari", sub: "5/7 kun" },
  { value: "3x",       label: "Haftada 3x",  sub: "3/7 kun" },
  { value: "custom",   label: "Maxsus",      sub: "O'zingiz tanlang" },
];

const DAY_LABELS = ["Du", "Se", "Ch", "Pa", "Ju", "Sha", "Ya"];
const DAY_VALUES = [1, 2, 3, 4, 5, 6, 0];

const TIME_OPTIONS = [
  "Erta tong (05–07)",
  "Tong (07–09)",
  "Ertalab (09–12)",
  "Tushdan keyin (12–17)",
  "Kechqurun (17–20)",
  "Kech kechqurun (20–23)",
];

function getYearlyHint(frequency, customDays) {
  const n =
    frequency === "daily"    ? 7 :
    frequency === "weekdays" ? 5 :
    frequency === "3x"       ? 3 :
    (customDays || []).length;
  return `Haftada ${n} kun — yiliga ~${n * 52} marta`;
}

export default function Step5Frequency({ data, onChange }) {
  const toggleDay = day => {
    const days = (data.customDays || []).includes(day)
      ? data.customDays.filter(d => d !== day)
      : [...(data.customDays || []), day];
    onChange({ customDays: days });
  };

  const handleFrequency = value => {
    let customDays =
      value === "daily"    ? [1, 2, 3, 4, 5, 6, 0] :
      value === "weekdays" ? [1, 2, 3, 4, 5]        :
      value === "3x"       ? [1, 3, 5]              :
      data.customDays;
    onChange({ frequency: value, customDays });
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Frequency cards */}
      <div>
        <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-3">
          Chastota
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          {FREQUENCY_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleFrequency(opt.value)}
              className={cn(
                "flex flex-col items-start gap-0.5 p-3.5 rounded-xl border text-left transition-all",
                data.frequency === opt.value
                  ? "border-violet-500 bg-violet-50"
                  : "border-black/[0.08] bg-white hover:border-black/20 hover:bg-zinc-50"
              )}
            >
              <span className={cn(
                "text-[13px] font-bold",
                data.frequency === opt.value ? "text-violet-700" : "text-zinc-800"
              )}>
                {opt.label}
              </span>
              <span className="text-[11px] text-zinc-400">{opt.sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Day toggles */}
      <div>
        <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2.5">
          Kunlar
        </p>
        <div className="flex gap-1.5">
          {DAY_LABELS.map((label, i) => {
            const dayVal = DAY_VALUES[i];
            const active = (data.customDays || []).includes(dayVal);
            return (
              <button
                key={label}
                type="button"
                onClick={() => toggleDay(dayVal)}
                className={cn(
                  "flex-1 h-9 rounded-xl text-[11px] font-bold transition-all",
                  active
                    ? "bg-violet-600 text-white"
                    : "bg-black/[0.04] text-zinc-400 hover:bg-black/[0.08]"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time of day chips */}
      <div>
        <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2.5">
          Kun vaqti
        </p>
        <div className="flex flex-wrap gap-2">
          {TIME_OPTIONS.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => onChange({ timeOfDay: data.timeOfDay === t ? "" : t })}
              className={cn(
                "px-3 py-2 rounded-xl text-[11px] font-semibold border transition-all",
                data.timeOfDay === t
                  ? "bg-violet-600 text-white border-transparent"
                  : "bg-white border-black/[0.08] text-zinc-600 hover:border-black/20"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Hint */}
      <div className="px-3.5 py-2.5 rounded-xl bg-black/[0.03] text-[12px] text-zinc-500">
        💡 {getYearlyHint(data.frequency, data.customDays)}
      </div>

      {/* Planner time — only when cueType === "time" */}
      {data.cueType === "time" && (
        <div>
          <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
            Planner'dagi vaqt
          </p>
          <div className="flex items-center gap-3 p-3 bg-violet-50 rounded-xl border border-violet-100">
            <span className="text-violet-600 text-[11px] font-semibold">📅 Planga qo'shiladi</span>
            <input
              type="time"
              value={data.scheduledTime ?? data.cueValue ?? ""}
              onChange={e => onChange({ scheduledTime: e.target.value })}
              className="ml-auto text-sm font-medium text-violet-700 bg-transparent border-none outline-none focus:outline-none"
            />
          </div>
          <p className="text-[11px] text-zinc-400 mt-1.5">
            Bu odat har {data.frequency === "daily" ? "kuni" : "tanlangan kuni"}{" "}
            {data.scheduledTime ?? data.cueValue ?? ""} da planer'ingizda ko'rinadi
          </p>
        </div>
      )}
    </div>
  );
}
