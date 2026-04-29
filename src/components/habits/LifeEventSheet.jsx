import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLifeOSData } from "@/lib/lifeos-store";
import { LIFE_EVENTS, adjustHabit } from "@/lib/lifeEvents";

// ─── Adjusted habits preview ──────────────────────────────────────────────────

function AdjustedHabitsPreview({ event }) {
  const { habits } = useLifeOSData();
  const preview = (habits || []).slice(0, 3).map(habit => ({
    habit,
    after: adjustHabit(habit, event.habitAdjustment),
  }));

  if (preview.length === 0) return null;

  return (
    <div className="bg-[#FAFAF9] rounded-xl border border-black/[0.06] overflow-hidden">
      <div className="px-4 py-2.5 border-b border-black/[0.04]">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          Odatlar qanday o'zgaradi
        </p>
      </div>
      {preview.map(({ habit, after }) => (
        <div key={habit.id} className="flex items-center gap-2.5 px-4 py-2.5 border-b border-black/[0.04] last:border-0">
          <span className="text-[14px]">{habit.emoji}</span>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] text-gray-400 line-through truncate">
              {habit.minimalVersion}
            </div>
            <div className="text-[12px] font-medium text-gray-900 truncate">{after}</div>
          </div>
          <span className={cn(
            "text-[9px] font-medium shrink-0",
            after === "To'xtatildi" ? "text-red-400" : "text-blue-500",
          )}>
            {after === "To'xtatildi" ? "To'xtatildi" : "Mosland"}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Main sheet ───────────────────────────────────────────────────────────────

export default function LifeEventSheet({ onClose, onEventSelected }) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [duration, setDuration] = useState("");

  const handleConfirm = () => {
    if (!selectedEvent) return;
    onEventSelected(selectedEvent, duration || null);
    onClose();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[60]"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 340, damping: 34 }}
        className="fixed inset-x-0 bottom-0 bg-white rounded-t-2xl z-[61] pb-8 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-8 h-1 bg-black/[0.1] rounded-full mx-auto mt-3 mb-4" />

        <div className="px-5">
          <h3 className="text-[15px] font-semibold text-gray-900 mb-1">Hayotda nima bo'ldi?</h3>
          <p className="text-[12px] text-gray-400 mb-4">
            Cloudy odatlarni moslashtiradi — o'chirmaydi.
          </p>

          {/* Event grid */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {Object.values(LIFE_EVENTS).map(event => (
              <button
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className={cn(
                  "flex items-center gap-2.5 px-3.5 py-3 rounded-xl border text-left transition-all",
                  selectedEvent?.id === event.id
                    ? "bg-violet-50 border-violet-300"
                    : "bg-[#FAFAF9] border-black/[0.07] hover:border-black/[0.15]",
                )}
              >
                <span className="text-[20px]">{event.emoji}</span>
                <span className={cn(
                  "text-[12px] font-medium",
                  selectedEvent?.id === event.id ? "text-violet-700" : "text-gray-700",
                )}>
                  {event.label}
                </span>
              </button>
            ))}
          </div>

          {/* Preview */}
          <AnimatePresence>
            {selectedEvent && (
              <motion.div
                key={selectedEvent.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="mb-4"
              >
                <div className="px-4 py-3.5 bg-blue-50 border border-blue-100 rounded-xl mb-3">
                  <p className="text-[12px] font-semibold text-blue-700 mb-1">
                    Cloudy nima qiladi:
                  </p>
                  <p className="text-[12px] text-blue-600 leading-relaxed">
                    {selectedEvent.message}
                  </p>

                  {/* Duration picker — if no fixed duration */}
                  {!selectedEvent.defaultDuration && (
                    <div className="mt-3">
                      <p className="text-[11px] text-blue-500 mb-2">Qancha davom etadi?</p>
                      <div className="flex gap-2 flex-wrap">
                        {["1 hafta", "2 hafta", "1 oy", "Bilmayman"].map(d => (
                          <button
                            key={d}
                            onClick={() => setDuration(d)}
                            className={cn(
                              "px-2.5 py-1.5 rounded-lg text-[10px] font-medium border transition-all",
                              duration === d
                                ? "bg-blue-600 border-blue-600 text-white"
                                : "bg-white border-blue-200 text-blue-600",
                            )}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <AdjustedHabitsPreview event={selectedEvent} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex gap-2 mt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-black/[0.08] text-[13px] text-gray-500"
            >
              Bekor
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedEvent}
              className={cn(
                "flex-1 py-3 rounded-xl text-[13px] font-semibold transition-all",
                selectedEvent
                  ? "bg-violet-600 text-white"
                  : "bg-black/[0.05] text-gray-300",
              )}
            >
              Moslashtirish →
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
