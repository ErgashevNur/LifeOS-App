import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { formatTime } from "@/lib/durationParser";

/* ─── Simple confetti using canvas ──────────────────────────────── */
function ConfettiCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: -20,
      r: Math.random() * 6 + 3,
      color: ["#7C3AED", "#8B5CF6", "#A78BFA", "#F59E0B", "#10B981", "#3B82F6"][
        Math.floor(Math.random() * 6)
      ],
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 4 + 2,
      rot: Math.random() * 360,
      rotV: (Math.random() - 0.5) * 8,
    }));

    let frame;
    let done = false;

    const animate = () => {
      if (done) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r);
        ctx.restore();
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1;
        p.rot += p.rotV;
      }
      frame = requestAnimationFrame(animate);
    };
    animate();

    const timer = setTimeout(() => { done = true; }, 2800);
    return () => { done = true; cancelAnimationFrame(frame); clearTimeout(timer); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[51]"
      style={{ width: "100%", height: "100%" }}
    />
  );
}

/* ─── CompletionAnimation ─────────────────────────────────────── */
export default function CompletionAnimation({ habit, seconds, onClose }) {
  return (
    <>
      <ConfettiCanvas />
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
        className="flex flex-col items-center gap-5 px-6 text-center"
      >
        {/* Emoji */}
        <motion.div
          initial={{ scale: 0.5 }}
          animate={{ scale: [0.5, 1.2, 1] }}
          transition={{ duration: 0.5, times: [0, 0.6, 1] }}
          className="text-[72px]"
        >
          {habit.emoji || "✨"}
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col gap-1"
        >
          <p className="text-[22px] font-bold text-zinc-900">Bajarildi!</p>
          <p className="text-[13px] text-zinc-400">
            {formatTime(seconds)} · Men {habit.identityStatement || habit.identity || "rivojlanib boraman"}
          </p>
        </motion.div>

        {/* Streak badge */}
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="flex items-center gap-2 px-5 py-3 bg-violet-50 rounded-2xl border border-violet-100"
        >
          <span className="text-[20px]">🔥</span>
          <span className="text-[15px] font-bold text-violet-700">
            {(habit.streak || 0) + 1} kun streak
          </span>
        </motion.div>

        {/* Dismiss */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          onClick={onClose}
          className="mt-4 px-8 py-3 rounded-2xl bg-violet-600 text-white text-[14px] font-bold hover:bg-violet-700 active:scale-95 transition-all"
        >
          Davom etaman →
        </motion.button>
      </motion.div>
    </>
  );
}
