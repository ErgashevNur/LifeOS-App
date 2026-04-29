import { Plus } from "lucide-react";

export default function FreeSlotHint({ slot, onAdd }) {
  return (
    <div
      onClick={() => onAdd?.(slot)}
      className="ml-3 mb-1 flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-black/[0.08] text-zinc-300 hover:border-violet-200 hover:text-violet-400 hover:bg-violet-50/50 transition-all cursor-pointer"
    >
      <Plus className="w-3 h-3" />
      <span className="text-[11px]">
        {slot.durationMinutes} daqiqa bo'sh — vazifa qo'shish
      </span>
    </div>
  );
}
