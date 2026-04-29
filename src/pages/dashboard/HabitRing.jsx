import { motion } from "framer-motion";

export default function HabitRing({ done, total }) {
  const pct = total > 0 ? done / total : 0;
  const size = 52;
  const r = 20;
  const circumference = 2 * Math.PI * r;
  const dash = circumference * pct;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(0,0,0,0.06)"
          strokeWidth="5"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#7C6BDB"
          strokeWidth="5"
          strokeDasharray={`${dash} ${circumference}`}
          strokeDashoffset={circumference * 0.25}
          strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${circumference}` }}
          animate={{ strokeDasharray: `${dash} ${circumference}` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
        />
      </svg>
    </div>
  );
}
