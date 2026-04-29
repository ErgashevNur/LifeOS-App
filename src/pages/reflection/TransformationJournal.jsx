import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLifeOSData } from "@/lib/lifeos-store";

function groupByMonth(entries) {
  const groups = {};
  for (const entry of entries) {
    const d = new Date(entry.date);
    const key = d.toLocaleDateString("uz-UZ", { year: "numeric", month: "long" });
    if (!groups[key]) groups[key] = [];
    groups[key].push(entry);
  }
  return groups;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("uz-UZ", { day: "numeric", month: "long" });
}

function EmptyJournalState() {
  return (
    <div className="flex flex-col items-center text-center px-6 py-16 gap-4">
      <div className="text-[52px]">📖</div>
      <div>
        <h3 className="text-[16px] font-bold text-gray-900 mb-1">Hali hech narsa yo'q</h3>
        <p className="text-[13px] text-gray-500 leading-relaxed max-w-[260px]">
          30 kun o'tgach Cloudy sizdan birinchi savolni so'raydi.
          Javoblaringiz bu erda saqlanadi.
        </p>
      </div>
    </div>
  );
}

export default function TransformationJournal() {
  const { journalEntries } = useLifeOSData();
  const navigate = useNavigate();

  const entries = journalEntries || [];
  const grouped = groupByMonth(entries);

  return (
    <div className="flex flex-col h-full bg-[#F5F5F4]">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 h-[52px] border-b border-black/[0.06] bg-white/60">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/[0.05] transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-[15px] font-semibold text-gray-900">O'zgarish yo'li</h2>
        <span className="text-[11px] text-gray-400">{entries.length} ta yozuv</span>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {entries.length === 0 ? (
          <EmptyJournalState />
        ) : (
          Object.entries(grouped).map(([month, monthEntries]) => (
            <div key={month} className="mb-6">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
                {month}
              </p>

              {monthEntries.map((entry, i) => (
                <div key={entry.id} className="flex gap-3 mb-3">
                  {/* Timeline */}
                  <div className="flex flex-col items-center pt-1.5">
                    <div className="w-2 h-2 rounded-full bg-violet-400 shrink-0" />
                    {i < monthEntries.length - 1 && (
                      <div className="w-px flex-1 bg-black/[0.06] my-1" />
                    )}
                  </div>

                  {/* Entry card */}
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex-1 pb-2"
                  >
                    <p className="text-[10px] text-gray-400 mb-1">
                      {formatDate(entry.date)} · {entry.milestone} kun · Cloudy savoli:
                    </p>
                    <p className="text-[11px] text-gray-500 italic mb-2 leading-relaxed">
                      "{entry.question}"
                    </p>
                    <div className="px-3.5 py-3 bg-white border border-black/[0.06] rounded-xl">
                      <p className="text-[13px] text-gray-800 leading-relaxed">
                        {entry.answer}
                      </p>
                    </div>
                    {/* Habit context badge */}
                    {entry.habitContext && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <span className="text-[10px] text-gray-400 px-2 py-0.5 bg-gray-100 rounded-full">
                          {entry.habitContext.activeHabits} ta odat
                        </span>
                        {entry.habitContext.topHabit && (
                          <span className="text-[10px] text-violet-500 px-2 py-0.5 bg-violet-50 rounded-full">
                            🔥 {entry.habitContext.topHabit}
                          </span>
                        )}
                      </div>
                    )}
                  </motion.div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
