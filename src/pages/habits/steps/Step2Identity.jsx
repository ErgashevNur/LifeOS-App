import { cn } from "@/lib/utils";

const SCIENCE_NOTE =
  'James Clear: "Har bir odatni rivojlantirish — o\'zingizning kimligingizga ovoz berishdir. Yetarlicha ovoz bering va o\'zingizga bo\'lgan ishonch o\'zgaradi."';

const SUGGESTIONS_BY_CATEGORY = {
  health:   ["sog'lom insonman", "jismoniy faolman", "tanasini e'zozlaydigan insonman"],
  learning: ["hayot bo'yi o'rganuvchiman", "kitob o'quvchiman", "doim rivojlanib boraman"],
  work:     ["samarali ishlovchiman", "maqsadga yo'nalganman", "intizomli insonman"],
  social:   ["yaxshi muloqot qiluvchiman", "insonlarga g'amxo'r bo'lamanman", "hamkorlikka ochiqman"],
  personal: ["o'zimni rivojlantirishga intilamanman", "tizimli yashashga harakat qilamanman", "o'zim bilan halol bo'lamanman"],
  finance:  ["moliyaviy savodxon insonman", "maqsadli sarflovchiman", "kelajagim uchun tejovchiman"],
};

const DEFAULT_SUGGESTIONS = [
  "intizomli insonman",
  "maqsadga yo'nalganman",
  "o'zimni rivojlantirishga intilamanman",
];

export default function Step2Identity({ data, onChange }) {
  const suggestions = SUGGESTIONS_BY_CATEGORY[data.category] || DEFAULT_SUGGESTIONS;

  return (
    <div className="flex flex-col gap-5">
      {/* Science note */}
      <div className="p-3.5 rounded-xl bg-violet-50 border border-violet-100">
        <p className="text-[12px] text-violet-700 leading-relaxed">{SCIENCE_NOTE}</p>
      </div>

      {/* Identity input */}
      <div>
        <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
          Identitet ifodasi *
        </p>
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-black/[0.08] bg-white focus-within:ring-2 focus-within:ring-violet-100 focus-within:border-violet-400 transition-all">
          <span className="text-[15px] font-semibold text-violet-600 shrink-0">Men —</span>
          <input
            value={data.identityStatement}
            onChange={e => onChange({ identityStatement: e.target.value })}
            placeholder="kitob o'quvchiman"
            className="flex-1 text-[15px] font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none bg-transparent"
          />
        </div>
      </div>

      {/* Suggestions */}
      <div>
        <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2.5">
          Tavsiyalar
        </p>
        <div className="flex flex-col gap-1.5">
          {suggestions.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => onChange({ identityStatement: s })}
              className={cn(
                "px-3.5 py-2.5 rounded-xl border text-[13px] font-medium text-left transition-all",
                data.identityStatement === s
                  ? "border-violet-400 bg-violet-50 text-violet-700"
                  : "border-black/[0.08] bg-white text-zinc-600 hover:border-black/20 hover:bg-zinc-50"
              )}
            >
              Men — {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
