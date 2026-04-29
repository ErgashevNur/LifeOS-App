import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

export default function ConflictBanner({ conflicts }) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="mx-4 mt-3 overflow-hidden"
    >
      <div className="flex items-start gap-2.5 px-3.5 py-3 bg-amber-50 border border-amber-200 rounded-xl">
        <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-semibold text-amber-800">
            {conflicts.length} ta vaqt to'qnashuvi
          </p>
          {conflicts.map((c, i) => (
            <p key={i} className="text-[11px] text-amber-600 mt-0.5 truncate">
              {c.block1.emoji} {c.block1.label} ↔ {c.block2.emoji} {c.block2.label}
            </p>
          ))}
          <p className="text-[10px] text-amber-500 mt-1">
            Odat vaqtini sozlamalar orqali o'zgartiring
          </p>
        </div>
      </div>
    </motion.div>
  );
}
