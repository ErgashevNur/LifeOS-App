import { motion } from "framer-motion";

export default function CloudyCard({ message }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="flex items-start gap-3 px-4 py-4 bg-violet-600 rounded-2xl"
    >
      <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-[14px]">☁️</span>
      </div>

      <div className="flex-1">
        <p className="text-[11px] text-violet-200 font-medium mb-1">Cloudy</p>
        <p className="text-[13px] text-white leading-relaxed">{message}</p>
      </div>
    </motion.div>
  );
}
