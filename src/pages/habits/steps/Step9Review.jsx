import { cn } from "@/lib/utils";

const DAY_LABELS = { 0: "Ya", 1: "Du", 2: "Se", 3: "Ch", 4: "Pa", 5: "Ju", 6: "Sha" };

const CAT_LABELS = {
  health:   "Salomatlik 💪",
  learning: "Ta'lim 📚",
  work:     "Mehnat ⚡",
  social:   "Ijtimoiy 🤝",
  personal: "Shaxsiy 🌱",
  finance:  "Moliya 💰",
};

const FREQ_LABELS = {
  daily:    "Har kuni",
  weekdays: "Ish kunlari",
  "3x":     "Haftada 3x",
  custom:   "Maxsus",
};

const CUE_PREFIX = {
  time:    "Soat",
  action:  "Harakatdan keyin:",
  place:   "Joyda:",
  emotion: "His paydo bo'lganda:",
};

export default function Step9Review({ data }) {
  const activeDays = [...(data.customDays || [])].sort((a, b) => a - b);
  const activeDaysLabel = activeDays.map(d => DAY_LABELS[d]).join(", ");

  const rows = [
    { label: "Kategoriya", value: CAT_LABELS[data.category] || data.category },
    { label: "Identitet",  value: data.identityStatement ? `Men — ${data.identityStatement}` : null },
    { label: "Minimal",    value: data.minimalVersion || null },
    {
      label: "Trigger",
      value: data.cueValue
        ? `${CUE_PREFIX[data.cueType] || ""} ${data.cueValue}`.trim()
        : null,
    },
    { label: "Chastota",   value: FREQ_LABELS[data.frequency] || data.frequency },
    {
      label: "Stack",
      value: data.linkedHabit ? `${data.linkedHabit.emoji} ${data.linkedHabit.name}` : null,
    },
    { label: "Sabab",    value: data.whys?.[2] || null },
    { label: "Mukofot",  value: data.rewardDescription || null },
  ].filter(r => r.value);

  const milestones = Object.entries(data.milestoneRewards || {}).filter(([, v]) => v);

  return (
    <div className="flex flex-col gap-5">
      {/* Violet hero card */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-600 to-violet-500 text-white">
        <div className="text-4xl mb-3">{data.emoji}</div>
        <h3 className="text-xl font-bold leading-tight">
          {data.name || "Yangi odat"}
        </h3>
        {data.identityStatement && (
          <p className="text-[13px] text-white/80 mt-1">Men — {data.identityStatement}</p>
        )}
        {/* Active day pills */}
        {(activeDays.length > 0 || data.timeOfDay) && (
          <div className="flex gap-1.5 mt-4 flex-wrap">
            {activeDays.map(d => (
              <span key={d} className="px-2.5 py-1 rounded-full bg-white/20 text-[11px] font-bold">
                {DAY_LABELS[d]}
              </span>
            ))}
            {data.timeOfDay && (
              <span className="px-2.5 py-1 rounded-full bg-white/20 text-[11px] font-bold">
                {data.timeOfDay}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Detail table */}
      {rows.length > 0 && (
        <div className="rounded-2xl border border-black/[0.08] bg-white overflow-hidden">
          {rows.map((row, i) => (
            <div
              key={row.label}
              className={cn(
                "flex items-start gap-3 px-4 py-3",
                i < rows.length - 1 && "border-b border-black/[0.04]"
              )}
            >
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide w-20 shrink-0 pt-0.5">
                {row.label}
              </span>
              <span className="text-[13px] text-zinc-700 font-medium">{row.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Planner preview */}
      {data.cueType === "time" && (data.scheduledTime || data.cueValue) && (
        <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 rounded-xl border border-blue-100">
          <span className="text-[16px]">📅</span>
          <div>
            <p className="text-[11px] font-semibold text-blue-700">Planner'ga qo'shiladi</p>
            <p className="text-[11px] text-blue-500 mt-0.5">
              Har {activeDaysLabel} — {data.scheduledTime ?? data.cueValue} da{" "}
              {data.minimalDuration ?? "20 daqiqa"} blok
            </p>
          </div>
        </div>
      )}

      {/* Milestones */}
      {milestones.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2.5">
            Muhim bosqichlar
          </p>
          <div className="flex flex-col gap-1.5">
            {[["7","🔥 7 kun"],["30","🔥🔥 30 kun"],["100","🔥🔥🔥 100 kun"]].map(([key, label]) =>
              data.milestoneRewards?.[key] ? (
                <div
                  key={key}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-zinc-50 border border-black/[0.05]"
                >
                  <span className="text-[12px] font-bold text-zinc-500 w-24 shrink-0">{label}</span>
                  <span className="text-[13px] text-zinc-700">{data.milestoneRewards[key]}</span>
                </div>
              ) : null
            )}
          </div>
        </div>
      )}
    </div>
  );
}
