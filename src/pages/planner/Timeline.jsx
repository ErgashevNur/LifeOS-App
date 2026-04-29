import TimeBlock  from "./TimeBlock";
import FreeSlotHint from "./FreeSlotHint";

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 06–22

function pad(n) {
  return String(n).padStart(2, "0");
}

export default function Timeline({ blocks, freeSlots, onDone, onAddTask }) {
  return (
    <div className="px-4 py-3 pb-24">
      {HOURS.map(hour => {
        const timeStr = `${pad(hour)}:00`;
        const nextStr = `${pad(hour + 1)}:00`;

        const hourBlocks = blocks.filter(
          b => b.startTime >= timeStr && b.startTime < nextStr,
        );
        const freeSlot = freeSlots.find(s => s.startTime >= timeStr && s.startTime < nextStr);

        return (
          <div key={hour} className="flex gap-3 min-h-[52px]">
            {/* Hour label */}
            <div className="w-10 pt-1 shrink-0">
              <span className="text-[10px] text-zinc-400 font-medium">{timeStr}</span>
            </div>

            {/* Content column */}
            <div className="relative flex-1">
              {/* Vertical rule */}
              <div className="absolute left-0 top-0 bottom-0 w-px bg-black/[0.05]" />

              {hourBlocks.map(block => (
                <TimeBlock key={block.id} block={block} onDone={onDone} />
              ))}

              {freeSlot && hourBlocks.length === 0 && (
                <FreeSlotHint slot={freeSlot} onAdd={onAddTask} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
