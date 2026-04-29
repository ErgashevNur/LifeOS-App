import { Plus } from "lucide-react";

export default function EmptyGoalsState({ onAdd }) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center">
        <span className="text-[28px]">🎯</span>
      </div>
      <div>
        <p className="text-[15px] font-semibold text-gray-900">Maqsad yo'q</p>
        <p className="text-[12px] text-gray-400 mt-1 leading-relaxed whitespace-pre-line">
          {"Birinchi maqsadingizni qo'shing.\nCloudy tizim tuzib beradi."}
        </p>
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="flex items-center gap-2 px-5 py-3 rounded-xl bg-violet-600 text-white text-[13px] font-semibold"
      >
        <Plus className="w-4 h-4" />
        Maqsad qo'shish
      </button>
    </div>
  );
}
