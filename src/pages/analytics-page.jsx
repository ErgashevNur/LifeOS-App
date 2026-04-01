import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLifeOSData } from "@/lib/lifeos-store";
import { ArrowLeft } from "lucide-react";
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
      <div className="flex h-56 w-full items-center justify-center rounded-lg border border-slate-200 bg-white text-sm text-slate-500">
        Grafik uchun ma&apos;lumot topilmadi.
      </div>
    );
  }

  const max = Math.max(...points);
  const min = Math.min(...points);
  const diff = max - min || 1;
  const denominator = points.length > 1 ? points.length - 1 : 1;

  const svgPoints = points
    .map((value, index) => {
      const x = points.length > 1 ? (index / denominator) * 100 : 50;
      const y = 100 - ((value - min) / diff) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox="0 0 100 100"
      className="h-56 w-full rounded-lg border border-slate-200 bg-white p-2"
    >
      <polyline
        points={svgPoints}
        fill="none"
        stroke="#0f172a"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
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
    <div className="space-y-4">
      <Button variant="outline" onClick={() => navigate("/dashboard")}>
        <ArrowLeft className="h-4 w-4" />
        Dashboard&apos;ga qaytish
      </Button>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Haftalik bajarilish grafigi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 items-end gap-2 rounded-lg border border-slate-200 p-3">
              {weeklyCompletion.map((item) => (
                <div key={item.day} className="space-y-2 text-center">
                  <div className="h-44 rounded-md bg-slate-100 p-1">
                    <div
                      className={
                        item.hasData
                          ? "w-full rounded-sm bg-slate-900"
                          : "w-full rounded-sm bg-slate-300"
                      }
                      style={{
                        height: `${item.value}%`,
                        marginTop: `${100 - item.value}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-slate-500">{item.day}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Fokus sessiyalar dinamikasi</CardTitle>
          </CardHeader>
          <CardContent>
            <StreakLineChart points={streakPoints} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
