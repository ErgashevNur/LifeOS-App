import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLifeOSData } from "@/lib/lifeos-store";
import { useNavigate } from "react-router-dom";

const HABIT_PACKS = [
  {
    id: "morning",
    name: "Sabah rutini",
    emoji: "🌅",
    duration: "13 daqiqa",
    science: "Andrew Huberman morning protocol",
    description: "Kun uchun energiya va fokus",
    color: "amber",
    habits: [
      { emoji: "💧", name: "Suv ich",          minimalVersion: "1 stakan",           scheduledTime: "07:00", minimalDuration: "1 daqiqa"  },
      { emoji: "🌅", name: "Tashqariga qara",  minimalVersion: "2 daqiqa",           scheduledTime: "07:05", minimalDuration: "2 daqiqa"  },
      { emoji: "🧘", name: "Nafas mashqi",     minimalVersion: "4-7-8",              scheduledTime: "07:10", minimalDuration: "5 daqiqa"  },
      { emoji: "📝", name: "Minnatdorchilik",  minimalVersion: "3 ta yoz",           scheduledTime: "07:15", minimalDuration: "3 daqiqa"  },
      { emoji: "📚", name: "Kitob",            minimalVersion: "1 sahifa",           scheduledTime: "07:20", minimalDuration: "2 daqiqa"  },
    ],
  },
  {
    id: "health",
    name: "Salomatlik paketi",
    emoji: "💪",
    duration: "45 daqiqa",
    science: "WHO va CDC tavsiyalari",
    description: "Tanani va miyani sog' saqlash",
    color: "green",
    habits: [
      { emoji: "💧", name: "2L suv",          minimalVersion: "1 stakan",           scheduledTime: "07:00", minimalDuration: "1 daqiqa"  },
      { emoji: "🏃", name: "Harakat",          minimalVersion: "10 daqiqa yur",      scheduledTime: "07:30", minimalDuration: "10 daqiqa" },
      { emoji: "🥗", name: "Sabzavot ye",      minimalVersion: "1 ta",              scheduledTime: "12:00", minimalDuration: "1 daqiqa"  },
      { emoji: "😴", name: "Uyqu rejimi",      minimalVersion: "23:00 yot",          scheduledTime: "22:30", minimalDuration: "5 daqiqa"  },
    ],
  },
  {
    id: "mind",
    name: "Aqliy o'sish",
    emoji: "🧠",
    duration: "30 daqiqa",
    science: "Atomic Habits + Cal Newport",
    description: "Bilim va chuqur fikrlash",
    color: "violet",
    habits: [
      { emoji: "📚", name: "Kitob o'qi",       minimalVersion: "10 sahifa",          scheduledTime: "07:30", minimalDuration: "15 daqiqa" },
      { emoji: "✍️", name: "Yoz",              minimalVersion: "100 so'z",           scheduledTime: "08:00", minimalDuration: "10 daqiqa" },
      { emoji: "🙏", name: "Minnatdorchilik",  minimalVersion: "3 ta yoz",           scheduledTime: "21:00", minimalDuration: "3 daqiqa"  },
      { emoji: "🔍", name: "Refleksiya",       minimalVersion: "2 savol",            scheduledTime: "21:30", minimalDuration: "5 daqiqa"  },
    ],
  },
  {
    id: "deep_work",
    name: "Chuqur ish",
    emoji: "⚡",
    duration: "3 soat",
    science: "Deep Work — Cal Newport",
    description: "Muhim ishni chuqur bajarish",
    color: "blue",
    habits: [
      { emoji: "📅", name: "Kunlik reja",      minimalVersion: "3 vazifa",           scheduledTime: "08:00", minimalDuration: "5 daqiqa"  },
      { emoji: "📵", name: "Telefonsiz blok",  minimalVersion: "25 daqiqa",          scheduledTime: "09:00", minimalDuration: "25 daqiqa" },
      { emoji: "🔍", name: "Kun yakunlash",    minimalVersion: "2 daqiqa",           scheduledTime: "18:00", minimalDuration: "5 daqiqa"  },
    ],
  },
];

const COLOR_MAP = {
  amber:  { bg: "bg-amber-50",  border: "border-amber-200",  text: "text-amber-700",  btn: "bg-amber-500"  },
  green:  { bg: "bg-green-50",  border: "border-green-200",  text: "text-green-700",  btn: "bg-green-600"  },
  violet: { bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-700", btn: "bg-violet-600" },
  blue:   { bg: "bg-blue-50",   border: "border-blue-200",   text: "text-blue-700",   btn: "bg-blue-600"   },
};

function makeHabitFromTemplate(h, packId) {
  return {
    id: crypto.randomUUID(),
    name: h.name,
    emoji: h.emoji,
    minimalVersion: h.minimalVersion,
    minimalDuration: h.minimalDuration,
    scheduledTime: h.scheduledTime,
    cueType: "time",
    cueValue: h.scheduledTime,
    frequency: "daily",
    customDays: [1, 2, 3, 4, 5, 6, 7],
    category: packId,
    streak: 0,
    completedDates: [],
    achievedMilestones: [],
    recordStreak: 0,
    totalMinutes: 0,
    isAutomatic: false,
    createdAt: new Date().toISOString(),
  };
}

// ─── Pack preview sheet ──────────────────────────────────────────────────────

function PackPreviewSheet({ pack, onClose, onAddAll }) {
  const c = COLOR_MAP[pack.color];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 340, damping: 34 }}
        className="fixed inset-x-0 bottom-0 bg-white rounded-t-2xl z-50 pb-8 max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-8 h-1 bg-black/[0.1] rounded-full mx-auto mt-3 mb-4" />

        {/* Pack header */}
        <div className={cn("mx-4 rounded-2xl p-4 mb-4", c.bg, c.border, "border")}>
          <div className="flex items-center gap-3">
            <span className="text-[36px]">{pack.emoji}</span>
            <div>
              <h3 className="text-[16px] font-bold text-gray-900">{pack.name}</h3>
              <p className="text-[12px] text-gray-500">{pack.description}</p>
              <p className="text-[10px] text-gray-400 italic mt-0.5">{pack.science}</p>
            </div>
          </div>
        </div>

        {/* Habits list */}
        <div className="px-4 flex flex-col gap-2 mb-5">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
            {pack.habits.length} ta odat
          </p>
          {pack.habits.map(h => (
            <div key={h.name} className="flex items-center gap-3 px-4 py-3 bg-[#FAFAF9] rounded-xl border border-black/[0.06]">
              <span className="text-[20px]">{h.emoji}</span>
              <div className="flex-1">
                <div className="text-[13px] font-medium text-gray-900">{h.name}</div>
                <div className="text-[11px] text-gray-400">{h.minimalVersion} · {h.scheduledTime}</div>
              </div>
              <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", c.bg, c.text)}>
                {h.minimalDuration}
              </span>
            </div>
          ))}
        </div>

        <div className="px-4">
          <button
            onClick={onAddAll}
            className={cn("w-full py-3.5 rounded-xl text-white text-[14px] font-bold", c.btn)}
          >
            Hammasi qo'shish → {pack.habits.length} ta odat
          </button>
        </div>
      </motion.div>
    </>
  );
}

// ─── Pack card ───────────────────────────────────────────────────────────────

function PackCard({ pack, onPreview, onAddAll }) {
  const c = COLOR_MAP[pack.color];

  return (
    <div className={cn("rounded-2xl border p-4", c.bg, c.border)}>
      <div className="flex items-start gap-3">
        <span className="text-[32px]">{pack.emoji}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-[14px] font-semibold text-gray-900">{pack.name}</h3>
            <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/60", c.text)}>
              {pack.duration}
            </span>
          </div>
          <p className="text-[11px] text-gray-500 mt-0.5">{pack.description}</p>
          <p className="text-[10px] text-gray-400 mt-0.5 italic">{pack.science}</p>
        </div>
      </div>

      {/* Habit pills */}
      <div className="flex gap-1.5 mt-3 flex-wrap">
        {pack.habits.map(h => (
          <span key={h.name} className="flex items-center gap-1 px-2 py-1 bg-white/60 rounded-lg text-[11px] text-gray-600">
            {h.emoji} {h.name}
          </span>
        ))}
      </div>

      <div className="flex gap-2 mt-3">
        <button
          onClick={onPreview}
          className="flex-1 py-2.5 rounded-xl border border-black/[0.08] bg-white/60 text-[12px] text-gray-600 font-medium"
        >
          Ko'rish
        </button>
        <button
          onClick={onAddAll}
          className="flex-1 py-2.5 rounded-xl bg-gray-900 text-white text-[12px] font-semibold"
        >
          Hammasi qo'shish →
        </button>
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function HabitLibraryPage() {
  const { actions } = useLifeOSData();
  const navigate = useNavigate();
  const [selectedPack, setSelectedPack] = useState(null);
  const [addedPacks, setAddedPacks] = useState(new Set());

  const handleAddAll = (pack) => {
    pack.habits.forEach(h => {
      actions.addLocalHabit(makeHabitFromTemplate(h, pack.id));
    });
    setAddedPacks(prev => new Set([...prev, pack.id]));
    setSelectedPack(null);
  };

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
        <h2 className="text-[15px] font-semibold text-gray-900">Odat kutubxonasi</h2>
        <span className="text-[11px] text-gray-400">ilmiy asosda</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {HABIT_PACKS.map(pack => (
          <div key={pack.id} className="relative">
            <PackCard
              pack={pack}
              onPreview={() => setSelectedPack(pack)}
              onAddAll={() => handleAddAll(pack)}
            />
            {addedPacks.has(pack.id) && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-3 right-3 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
              >
                <Check className="w-3.5 h-3.5 text-white" />
              </motion.div>
            )}
          </div>
        ))}

        <div className="mt-2 pb-4">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Yoki o'zingiz yarating
          </p>
          <button
            onClick={() => navigate("/habits")}
            className="w-full py-3 rounded-xl border border-black/[0.08] bg-white text-[13px] text-gray-600 font-medium"
          >
            + Yangi odat yaratish
          </button>
        </div>
      </div>

      {/* Pack preview sheet */}
      <AnimatePresence>
        {selectedPack && (
          <PackPreviewSheet
            pack={selectedPack}
            onClose={() => setSelectedPack(null)}
            onAddAll={() => handleAddAll(selectedPack)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
