import { cn } from "@/lib/utils";

const SCIENCE_NOTE =
  'B.J. Fogg: "Har bir muvaffaqiyatli odatdan keyin darhol o\'zingizni taqdirlang. Miya bu taqdirlani odat bilan bog\'laydi va uni mustahkamlaydi."';

const REWARD_TYPES = [
  { value: "feel", label: "His-tuyg'u", emoji: "✨", desc: "O'zimni yaxshi his qilaman" },
  { value: "say",  label: "So'z",       emoji: "💬", desc: "O'zimga biror narsa aytaman" },
  { value: "act",  label: "Harakat",    emoji: "🎉", desc: "Biror narsa qilaman" },
];

const MILESTONES = [
  { key: "7",   label: "7 kun 🔥",      placeholder: "masalan: Sevimli restoranga boring" },
  { key: "30",  label: "30 kun 🔥🔥",    placeholder: "masalan: Yangi kitob sotib oling" },
  { key: "100", label: "100 kun 🔥🔥🔥", placeholder: "masalan: Katta sovg'a qiling" },
];

const REWARD_PLACEHOLDERS = {
  feel: "masalan: G'ururlanaman, energiya his qilaman",
  say:  "masalan: 'Yaxshi qilding!' deb aytaman",
  act:  "masalan: Sevimli ichimligimni ichaman",
};

export default function Step8Reward({ data, onChange }) {
  const setMilestone = (key, val) => {
    onChange({ milestoneRewards: { ...data.milestoneRewards, [key]: val } });
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Science note */}
      <div className="p-3.5 rounded-xl bg-violet-50 border border-violet-100">
        <p className="text-[12px] text-violet-700 leading-relaxed">{SCIENCE_NOTE}</p>
      </div>

      {/* Reward type cards */}
      <div>
        <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-3">
          Taqdirlash turi
        </p>
        <div className="grid grid-cols-3 gap-2">
          {REWARD_TYPES.map(r => (
            <button
              key={r.value}
              type="button"
              onClick={() => onChange({ rewardType: r.value })}
              className={cn(
                "flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all",
                data.rewardType === r.value
                  ? "border-violet-500 bg-violet-50"
                  : "border-black/[0.08] bg-white hover:border-black/20 hover:bg-zinc-50"
              )}
            >
              <span className="text-2xl">{r.emoji}</span>
              <span className={cn(
                "text-[12px] font-semibold",
                data.rewardType === r.value ? "text-violet-700" : "text-zinc-700"
              )}>
                {r.label}
              </span>
              <span className="text-[10px] text-zinc-400 leading-tight">{r.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Reward description */}
      {data.rewardType && (
        <div>
          <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
            Qanday taqdirlaysiz?
          </p>
          <input
            value={data.rewardDescription}
            onChange={e => onChange({ rewardDescription: e.target.value })}
            placeholder={REWARD_PLACEHOLDERS[data.rewardType] || ""}
            className="w-full px-4 py-3 rounded-xl border border-black/[0.08] bg-white text-[14px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-400 transition-all"
          />
        </div>
      )}

      {/* Milestone rewards */}
      <div>
        <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-3">
          Muhim bosqichlar
        </p>
        <div className="flex flex-col gap-2.5">
          {MILESTONES.map(m => (
            <div key={m.key} className="flex items-center gap-3">
              <span className="text-[11px] font-bold text-zinc-500 w-20 shrink-0 leading-tight">
                {m.label}
              </span>
              <input
                value={(data.milestoneRewards || {})[m.key] || ""}
                onChange={e => setMilestone(m.key, e.target.value)}
                placeholder={m.placeholder}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-black/[0.08] bg-white text-[13px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-400 transition-all"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
