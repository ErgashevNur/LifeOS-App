const SCIENCE_NOTE =
  'Simon Sinek + James Clear: "Chuqur motivatsiya \'Nima?\' dan emas, \'Nima uchun?\' dan keladi. Sababingizni 3 marta qaziganingizda haqiqiy motivatsiyangizni topasiz."';

const QUESTIONS = [
  "Nima uchun bu odatni rivojlantirmoqchisiz?",
  "Bu nima uchun muhim?",
  "Eng chuqur sabab nima?",
];

export default function Step7Why({ data, onChange }) {
  const whys = data.whys?.length === 3 ? data.whys : ["", "", ""];

  const setWhy = (i, val) => {
    const next = [...whys];
    next[i] = val;
    onChange({ whys: next });
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Science note */}
      <div className="p-3.5 rounded-xl bg-violet-50 border border-violet-100">
        <p className="text-[12px] text-violet-700 leading-relaxed">{SCIENCE_NOTE}</p>
      </div>

      {/* 3x Why inputs */}
      <div className="flex flex-col gap-4">
        {QUESTIONS.map((q, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-600 text-[11px] font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <p className="text-[12px] font-semibold text-zinc-600">{q}</p>
            </div>
            <input
              value={whys[i]}
              onChange={e => setWhy(i, e.target.value)}
              placeholder={
                i === 0 ? "masalan: Sog'lig'imni yaxshilash uchun" :
                i === 1 ? "masalan: Energiyam ko'payadi, yaxshi uxlayman" :
                "masalan: Farzandlarim uchun namuna bo'lmoqchiman"
              }
              className="w-full px-4 py-3 rounded-xl border border-black/[0.08] bg-white text-[13px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-400 transition-all"
            />
            {i < 2 && whys[i]?.trim() && (
              <p className="text-[11px] text-zinc-400 ml-7 italic">↳ shuning uchun...</p>
            )}
          </div>
        ))}
      </div>

      {/* Deep why amber box */}
      {whys[2]?.trim() && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-100">
          <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wide mb-1">
            💡 Chuqur sabab
          </p>
          <p className="text-[13px] text-amber-800 font-medium">{whys[2]}</p>
        </div>
      )}
    </div>
  );
}
