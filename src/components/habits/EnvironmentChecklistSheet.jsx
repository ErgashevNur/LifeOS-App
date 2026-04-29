import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const CHECKLISTS = {
  health: [
    { id: "place",  text: (habit) => `${habit.emoji} ${habit.name} uchun joy ajrattim` },
    { id: "tools",  text: () => "Kerakli narsalar ko'rinib turadi" },
    { id: "remove", text: () => "Xalaqit beradigan narsani olib qo'ydim" },
    { id: "tell",   text: () => "Oilamga/do'stimga aytdim" },
  ],
  learning: [
    { id: "book",  text: () => "Kitob yostiq yonida turibdi" },
    { id: "phone", text: () => "Telefon o'qish paytida boshqa xonada" },
    { id: "light", text: () => "Yoritish yetarli" },
    { id: "time",  text: () => "Bu vaqtda boshqa ish bo'lmasin deb belgiladim" },
  ],
  work: [
    { id: "desk",  text: () => "Ish stoli tartibli" },
    { id: "apps",  text: () => "Chalg'ituvchi applarni o'chirdim" },
    { id: "water", text: () => "Suv va kerakli narsalar oldimda" },
    { id: "door",  text: () => "Eshikni yopdim / tinch muhit ta'minladim" },
  ],
};

export default function EnvironmentChecklistSheet({ habit, onClose }) {
  const category = habit?.category || "health";
  const items = CHECKLISTS[category] || CHECKLISTS.health;
  const [checked, setChecked] = useState({});

  const allDone = items.every(i => checked[i.id]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-50"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 340, damping: 34 }}
        className="fixed inset-x-0 bottom-0 bg-white rounded-t-2xl z-[51] pb-8"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-8 h-1 bg-black/[0.1] rounded-full mx-auto mt-3 mb-5" />

        <div className="px-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[20px]">{habit?.emoji}</span>
            <h3 className="text-[15px] font-semibold text-gray-900">Muhit tayyorlash</h3>
          </div>
          <p className="text-[12px] text-gray-400 mb-5">
            Fizik muhit to'g'ri bo'lsa — odat 2x osonlashadi.
          </p>

          <div className="flex flex-col gap-2 mb-5">
            {items.map(item => (
              <button
                key={item.id}
                onClick={() => setChecked(c => ({ ...c, [item.id]: !c[item.id] }))}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all",
                  checked[item.id]
                    ? "bg-green-50 border-green-200"
                    : "bg-[#FAFAF9] border-black/[0.07]",
                )}
              >
                <div className={cn(
                  "w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center shrink-0 transition-all",
                  checked[item.id] ? "bg-green-500 border-green-500" : "border-gray-300",
                )}>
                  {checked[item.id] && <span className="text-white text-[10px]">✓</span>}
                </div>
                <span className={cn(
                  "text-[13px]",
                  checked[item.id] ? "text-green-700" : "text-gray-700",
                )}>
                  {item.text(habit)}
                </span>
              </button>
            ))}
          </div>

          <button
            onClick={onClose}
            className={cn(
              "w-full py-3.5 rounded-xl text-[14px] font-semibold transition-all",
              allDone
                ? "bg-violet-600 text-white"
                : "bg-[#FAFAF9] border border-black/[0.08] text-gray-600",
            )}
          >
            {allDone ? "Muhit tayyor! Boshlaymiz →" : "Keyinroq qilaman"}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
