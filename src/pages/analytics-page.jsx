import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLifeOSData } from "@/lib/lifeos-store";
import { ArrowLeft, TrendingUp, Activity } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

const WEEK_DAYS = [
  { key: "Dushanba", short: "Du" },
  { key: "Seshanba", short: "Se" },
  { key: "Chorshanba", short: "Cho" },
  { key: "Payshanba", short: "Pa" },
  { key: "Juma", short: "Ju" },
  { key: "Shanba", short: "Sha" },
  { key: "Yakshanba", short: "Ya" },
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function healthScoreFromLog(log) {
  const caloriesScore = Math.max(
    0,
    100 - Math.round((Math.abs(log.calories - 2300) / 2300) * 100),
  );
  const waterScore = clamp(Math.round((log.waterMl / 2500) * 100), 0, 100);
  const sleepScore = Math.max(
    0,
    100 - Math.round((Math.abs(log.sleepHours - 8) / 8) * 100),
  );

  return clamp(Math.round((caloriesScore + waterScore + sleepScore) / 3), 0, 100);
}

function StreakLineChart({ points }) {
  if (points.length === 0) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-[2rem] border-0 bg-slate-50/50 text-sm font-bold text-slate-400">
        Grafik uchun ma'lumot yetarli emas
      </div>
    );
  }

  const max = Math.max(...points, 10);
  const min = Math.min(...points);
  const diff = max - min || 1;
  const denominator = points.length > 1 ? points.length - 1 : 1;

  // Enhance points for smooth wave (simple estimation for SVG points)
  const svgPoints = points
    .map((value, index) => {
      const x = points.length > 1 ? (index / denominator) * 100 : 50;
      const y = 100 - ((value - min) / diff) * 80 - 10; // Add padding top/bottom
      return `${x},${y}`;
    })
    .join(" ");

  const polygonPoints = `0,100 ${svgPoints} 100,100`;

  return (
    <div className="relative h-64 w-full rounded-[2rem] bg-slate-50 overflow-hidden shadow-inner flex items-center p-4">
      <svg
        viewBox="0 0 100 100"
        className="h-full w-full overflow-visible drop-shadow-xl"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="50%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#d946ef" />
          </linearGradient>
          <linearGradient id="fillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        <polygon
          points={polygonPoints}
          fill="url(#fillGrad)"
          className="transition-all duration-1000"
        />
        <polyline
          points={svgPoints}
          fill="none"
          stroke="url(#lineGrad)"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
        
        {points.map((value, index) => {
          const x = points.length > 1 ? (index / denominator) * 100 : 50;
          const y = 100 - ((value - min) / diff) * 80 - 10;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="2"
              fill="white"
              stroke="#6366f1"
              strokeWidth="1.5"
              className="hover:r-3 transition-all cursor-pointer"
            >
              <title>{value} ball</title>
            </circle>
          );
        })}
      </svg>
    </div>
  );
}

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const { data } = useLifeOSData();

  const weeklyCompletion = useMemo(() => {
    const logByDay = new Map(data.health.logs.map((item) => [item.day, item]));

    return WEEK_DAYS.map((day) => {
      const log = logByDay.get(day.key);
      return {
        day: day.short,
        value: log ? healthScoreFromLog(log) : 0,
        hasData: Boolean(log),
      };
    });
  }, [data.health.logs]);

  const streakPoints = useMemo(() => {
    const now = new Date();
    const byDate = new Map();

    data.mastery.focusSessions.forEach((session) => {
      const total = byDate.get(session.date) ?? 0;
      byDate.set(session.date, total + Number(session.durationMin || 0));
    });

    return Array.from({ length: 7 }, (_, index) => {
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() - (6 - index));
      const key = targetDate.toISOString().slice(0, 10);
      const focusMinutes = byDate.get(key) ?? 0;
      return Math.round(focusMinutes / 10);
    });
  }, [data.mastery.focusSessions]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <Button 
          variant="outline" 
          onClick={() => navigate("/dashboard")}
          className="rounded-2xl h-12 px-6 font-bold shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 border-0 transition-transform active:scale-95"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Orqaga qaytish
        </Button>
      </div>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="border-0 shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 rounded-[2.5rem] bg-white overflow-hidden group">
          <CardHeader className="px-8 pt-8 pb-6 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-extrabold tracking-tight text-slate-900">Salomatlik Ritmi</CardTitle>
              <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-1">Haftalik statistika</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
              <Activity className="h-6 w-6" />
            </div>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <div className="grid grid-cols-7 items-end gap-3 sm:gap-4 rounded-[2rem] bg-slate-50 p-6 shadow-inner border-0 ring-1 ring-slate-200/50">
              {weeklyCompletion.map((item) => (
                <div key={item.day} className="space-y-3 text-center flex flex-col items-center group/bar">
                  <div className="h-48 w-full sm:w-12 rounded-full bg-slate-200/50 p-1 flex items-end overflow-hidden shadow-inner relative">
                    <div
                      className={cn(
                        "w-full rounded-full transition-all duration-1000 ease-out shadow-md",
                        item.hasData
                          ? "bg-gradient-to-t from-indigo-600 to-fuchsia-500 group-hover/bar:brightness-110"
                          : "bg-gradient-to-t from-slate-300 to-slate-200"
                      )}
                      style={{
                        height: `${Math.max(item.value, 8)}%`, 
                      }}
                    />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover/bar:text-indigo-600 transition-colors">{item.day}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 rounded-[2.5rem] bg-white overflow-hidden group">
          <CardHeader className="px-8 pt-8 pb-6 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-extrabold tracking-tight text-slate-900">Fokus Dinamikasi</CardTitle>
              <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-1">Sessiyalar grafigi</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-fuchsia-50 flex items-center justify-center text-fuchsia-500 group-hover:scale-110 group-hover:bg-fuchsia-500 group-hover:text-white transition-all duration-300">
              <TrendingUp className="h-6 w-6" />
            </div>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <div className="rounded-[2rem] p-1 bg-white ring-1 ring-slate-200/50 shadow-sm border-0 group-hover:shadow-md transition-shadow">
              <StreakLineChart points={streakPoints} />
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
