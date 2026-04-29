import { cn } from "@/lib/utils";

const EMOJIS = [
  "✨","📚","✏️","🏃","💪","🧘","🍎","💧","🌱","⚡",
  "🎯","🔥","🌟","💡","🎨","🎵","💤","🏋️","🚶","🧠",
  "📖","✅","💰","🤝","🌍","☀️","🌙","🍃","🏆","💎",
];

const CATEGORIES = [
  { value: "health",   label: "Salomatlik", emoji: "💪" },
  { value: "learning", label: "Ta'lim",     emoji: "📚" },
  { value: "work",     label: "Mehnat",     emoji: "⚡" },
  { value: "social",   label: "Ijtimoiy",   emoji: "🤝" },
  { value: "personal", label: "Shaxsiy",    emoji: "🌱" },
  { value: "finance",  label: "Moliya",     emoji: "💰" },
];

export default function Step1Name({ data, onChange }) {
  return (
    <div className="flex flex-col gap-6">
      {/* Emoji picker */}
      <div>
        <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-3">Emoji</p>
        <div className="grid grid-cols-10 gap-1.5">
          {EMOJIS.map(e => (
            <button
              key={e}
              type="button"
              onClick={() => onChange({ emoji: e })}
              className={cn(
                "h-9 rounded-xl text-[18px] flex items-center justify-center transition-all",
                data.emoji === e
                  ? "bg-violet-100 ring-2 ring-violet-500 scale-110"
                  : "bg-black/[0.04] hover:bg-black/[0.08]"
              )}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Name input */}
      <div>
        <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
          Odat nomi *
        </p>
        <input
          autoFocus
          value={data.name}
          onChange={e => onChange({ name: e.target.value })}
          placeholder="masalan: Har kuni kitob o'qi"
          className="w-full px-4 py-3 rounded-xl border border-black/[0.08] bg-white text-[15px] font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-400 transition-all"
        />
      </div>

      {/* Category grid */}
      <div>
        <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-3">
          Kategoriya *
        </p>
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map(c => (
            <button
              key={c.value}
              type="button"
              onClick={() => onChange({ category: c.value })}
              className={cn(
                "flex items-center gap-2.5 px-3 py-3 rounded-xl border text-[12px] font-semibold transition-all text-left",
                data.category === c.value
                  ? "border-violet-500 bg-violet-50 text-violet-700"
                  : "border-black/[0.08] bg-white text-zinc-600 hover:border-black/20 hover:bg-zinc-50"
              )}
            >
              <span className="text-lg">{c.emoji}</span>
              <span>{c.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
