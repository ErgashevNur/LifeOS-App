import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { todayISO } from "@/lib/streakEngine";

const STORAGE_KEY = "lifeos.energyByDate";

const ENERGY_LEVELS = [
  { value: 1, emoji: "😪", label: "Juda past" },
  { value: 2, emoji: "😕", label: "Past" },
  { value: 3, emoji: "😐", label: "O'rta" },
  { value: 4, emoji: "🙂", label: "Yaxshi" },
  { value: 5, emoji: "💪", label: "Yuqori" },
];

function readMap() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
}
function writeMap(m) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(m)); } catch {}
}

export function getTodayEnergy() {
  const today = todayISO();
  return readMap()[today] || null;
}

export default function EnergyCheckIn({ onAnswered }) {
  const today = todayISO();
  const [todayEnergy, setTodayEnergy] = useState(() => readMap()[today] || null);
  const [showThanks, setShowThanks] = useState(false);

  // Allaqachon javob berilgan bo'lsa — ko'rsatmaymiz
  useEffect(() => {
    if (todayEnergy) onAnswered?.(todayEnergy);
  }, [todayEnergy, onAnswered]);

  if (todayEnergy) return null;

  const handlePick = (level) => {
    const map = readMap();
    map[today] = level;
    writeMap(map);
    setTodayEnergy(level);
    setShowThanks(true);
    onAnswered?.(level);
    setTimeout(() => setShowThanks(false), 2000);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="rounded-2xl border border-violet-100 bg-violet-50/60 p-4"
      >
        <p className="text-[12px] font-semibold text-violet-700 mb-3">
          ☁️ Bugungi energiyangiz qanday?
        </p>
        <div className="flex justify-between gap-1.5">
          {ENERGY_LEVELS.map(l => (
            <button
              key={l.value}
              type="button"
              onClick={() => handlePick(l.value)}
              className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl bg-white border border-violet-100 hover:border-violet-300 hover:bg-violet-50 active:scale-95 transition-all"
            >
              <span className="text-[22px]">{l.emoji}</span>
              <span className="text-[9px] font-medium text-zinc-500">{l.label}</span>
            </button>
          ))}
        </div>
        {showThanks && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[11px] text-violet-600 mt-2 text-center"
          >
            Rahmat! Bugun sizga moslashamiz.
          </motion.p>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
