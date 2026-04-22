import { useMemo } from "react";
import { motion } from "framer-motion";
import { useLifeOSData } from "@/lib/lifeos-store";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, Flame, Target, BookOpen, Repeat } from "lucide-react";

const DAYS = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];

function clamp(v, mn, mx) { return Math.max(mn, Math.min(mx, v)); }

function healthScore(log) {
  const c = Math.max(0, 100 - Math.round((Math.abs(log.calories - 2300) / 2300) * 100));
  const w = clamp(Math.round((log.waterMl / 2500) * 100), 0, 100);
  const s = Math.max(0, 100 - Math.round((Math.abs(log.sleepHours - 8) / 8) * 100));
  return clamp(Math.round((c + w + s) / 3), 0, 100);
}

// ── SVG line chart ─────────────────────────────────────────────────────────
function LineChart({ points }) {
  if (!points || points.length < 2) {
    return (
      <div className="flex h-32 items-center justify-center rounded-xl bg-slate-50 text-xs font-semibold text-slate-400">
        Ma'lumot yetarli emas
      </div>
    );
  }
  const max = Math.max(...points, 1);
  const min = Math.min(...points);
  const range = max - min || 1;
  const W = 100;
  const H = 60;
  const pad = 4;
  const xs = points.map((_, i) => pad + (i / (points.length - 1)) * (W - pad * 2));
  const ys = points.map((v) => H - pad - ((v - min) / range) * (H - pad * 2));

  const path = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`).join(" ");
  const fill = `${path} L${xs[xs.length - 1]},${H} L${xs[0]},${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 128 }}>
      <defs>
        <linearGradient id="chartGradLight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fill} fill="url(#chartGradLight)" />
      <path d={path} fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {xs.map((x, i) => (
        <circle key={i} cx={x} cy={ys[i]} r="2" fill="#6366f1" />
      ))}
    </svg>
  );
}

// ── Weekly bar chart ────────────────────────────────────────────────────────
function WeekBars({ logs }) {
  const padded = [...Array(7)].map((_, i) => logs[logs.length - 7 + i] ?? null);

  return (
    <div className="flex items-end gap-2 h-20">
      {padded.map((log, i) => {
        const score = log ? healthScore(log) : 0;
        const h = Math.max(4, (score / 100) * 80);
        const colorClass = score >= 70
          ? "bg-indigo-500"
          : score >= 40
          ? "bg-amber-400"
          : score > 0
          ? "bg-red-400"
          : "bg-slate-100";
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
            <motion.div
              className={cn("w-full rounded-md", colorClass)}
              style={{ height: h }}
              initial={{ height: 0 }}
              animate={{ height: h }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
            />
            <span className="text-[9px] font-bold text-slate-400">{DAYS[i]}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Score ring ──────────────────────────────────────────────────────────────
function ScoreRing({ score }) {
  const r = 42;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const color = score >= 70 ? "#6366f1" : score >= 40 ? "#f59e0b" : "#ef4444";
  const textColor = score >= 70 ? "text-indigo-600" : score >= 40 ? "text-amber-500" : "text-red-500";

  return (
    <div className="relative w-28 h-28">
      <svg className="-rotate-90 absolute inset-0" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#f1f5f9" strokeWidth="6" />
        <motion.circle
          cx="50" cy="50" r={r} fill="none"
          stroke={color} strokeWidth="6"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-2xl font-black", textColor)}>{score}</span>
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">SCORE</span>
      </div>
    </div>
  );
}

// ── Health bar ──────────────────────────────────────────────────────────────
function HealthBar({ label, pct, unit, colorClass }) {
  return (
    <div>
      <div className="flex justify-between text-[10px] font-bold mb-1.5">
        <span className="text-slate-500">{label}</span>
        <span className={colorClass}>{unit}</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <motion.div
          className={cn("h-full rounded-full", colorClass.replace("text-", "bg-"))}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { data, dashboardSummary } = useLifeOSData();

  const logs = data.health.logs ?? [];
  const avgScore = useMemo(() => {
    if (!logs.length) return 0;
    return Math.round(logs.slice(-7).reduce((a, l) => a + healthScore(l), 0) / Math.min(logs.length, 7));
  }, [logs]);

  const chartPoints = useMemo(() => logs.slice(-14).map(healthScore), [logs]);

  const insight = useMemo(() => {
    if (!logs.length) return { text: "Hali ma'lumot yo'q. Tizimni to'ldiring.", colorClass: "text-slate-400", icon: Minus };
    if (avgScore >= 70) return { text: "Yaxshi ish. Tizimingiz ishlayapti.", colorClass: "text-indigo-600", icon: TrendingUp };
    if (avgScore >= 40) return { text: "Orqada qolmoqdasiz. Tezlashing.", colorClass: "text-amber-500", icon: Minus };
    return { text: "Siz ancha orqada. Hoziroq tuzating.", colorClass: "text-red-500", icon: TrendingDown };
  }, [avgScore, logs.length]);

  const InsightIcon = insight.icon;

  return (
    <div className="min-h-full bg-slate-50">

      {/* ── Page header ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 lg:px-8"
      >
        <div className="mx-auto max-w-2xl flex h-16 items-center">
          <div>
            <p className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">Progress</p>
            <p className="text-base font-black text-slate-900 leading-tight mt-0.5">Tahlil</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mx-auto max-w-2xl px-4 lg:px-8 py-6 flex flex-col gap-5"
      >

        {/* ── Score + insight ───────────────────────────────────── */}
        <div className="bg-white ring-1 ring-slate-100 rounded-3xl shadow-sm p-5 flex items-center gap-6">
          <ScoreRing score={avgScore} />
          <div className="flex-1">
            <div className={cn("flex items-start gap-2 text-sm font-bold leading-snug", insight.colorClass)}>
              <InsightIcon className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{insight.text}</span>
            </div>
            <p className="text-[10px] mt-2 font-semibold text-slate-400">
              So'nggi 7 kun o'rtachasi
            </p>
          </div>
        </div>

        {/* ── 14-day line chart ─────────────────────────────────── */}
        <div className="bg-white ring-1 ring-slate-100 rounded-2xl shadow-sm p-5">
          <p className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-400 mb-4">
            14 KUNLIK GRAFIK
          </p>
          <LineChart points={chartPoints} />
        </div>

        {/* ── Weekly bars ───────────────────────────────────────── */}
        <div className="bg-white ring-1 ring-slate-100 rounded-2xl shadow-sm p-5">
          <p className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-400 mb-4">
            HAFTALIK KO'RSATKICH
          </p>
          <WeekBars logs={logs} />
        </div>

        {/* ── Stats grid ────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Streak",    value: `${dashboardSummary.streak ?? 0} kun`,  icon: Flame,    iconCls: "text-orange-500",  bgCls: "bg-orange-50" },
            { label: "Maqsadlar", value: `${dashboardSummary.goalsCount ?? 0}`,  icon: Target,   iconCls: "text-indigo-600",  bgCls: "bg-indigo-50" },
            { label: "Kitoblar",  value: `${dashboardSummary.booksCount ?? 0}`,  icon: BookOpen, iconCls: "text-amber-600",   bgCls: "bg-amber-50" },
            { label: "Odatlar",   value: `${dashboardSummary.habitsCount ?? 0}`, icon: Repeat,   iconCls: "text-violet-600",  bgCls: "bg-violet-50" },
          ].map(({ label, value, icon: Icon, iconCls, bgCls }) => (
            <div key={label} className="bg-white ring-1 ring-slate-100 rounded-2xl shadow-sm p-4 flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", bgCls)}>
                <Icon className={cn("w-5 h-5", iconCls)} />
              </div>
              <div>
                <p className={cn("text-lg font-black", iconCls)}>{value}</p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Health overview ───────────────────────────────────── */}
        <div className="bg-white ring-1 ring-slate-100 rounded-2xl shadow-sm p-5">
          <p className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-400 mb-4">
            SOG'LIQ
          </p>
          <div className="flex flex-col gap-4">
            <HealthBar
              label="Kaloriya"
              pct={clamp(Math.round((data.health.calories / 2300) * 100), 0, 100)}
              unit={`${data.health.calories} kcal`}
              colorClass="text-pink-500"
            />
            <HealthBar
              label="Suv"
              pct={clamp(Math.round((data.health.waterMl / 2500) * 100), 0, 100)}
              unit={`${data.health.waterMl} ml`}
              colorClass="text-sky-500"
            />
            <HealthBar
              label="Uyqu"
              pct={clamp(Math.round((data.health.sleepHours / 8) * 100), 0, 100)}
              unit={`${data.health.sleepHours}h`}
              colorClass="text-violet-500"
            />
          </div>
        </div>

      </motion.div>
    </div>
  );
}
