import { useMemo } from "react";
import { useLifeOSData } from "@/lib/lifeos-store";
import { buildTodayBlocks } from "@/lib/scheduleEngine";
import {
  generateDashboardMessage,
  formatDate,
} from "@/lib/dashboardEngine";

import DashboardHeader from "./DashboardHeader";
import CloudyCard from "./CloudyCard";
import GoalsSection from "./GoalsSection";
import TodayFocus from "./TodayFocus";
import HabitsTodaySection from "./HabitsTodaySection";
import PlannerPreview from "./PlannerPreview";
import EnergyCheckIn from "./EnergyCheckIn";

function getTodayDayNum() {
  // Spec uses 1=Mon...7=Sun. JS: 0=Sun
  const day = new Date().getDay();
  return day === 0 ? 7 : day;
}

function getDayStatus(habitProgress) {
  if (habitProgress >= 1)   return "excellent";
  if (habitProgress >= 0.7) return "good";
  if (habitProgress >= 0.4) return "ok";
  if (habitProgress > 0)    return "started";
  return "notStarted";
}

export default function DashboardPage() {
  const { user, data, habits, plannedBlocks, tasks } = useLifeOSData();
  const goals = data?.goals || [];

  const today = formatDate(new Date(), "yyyy-MM-dd");
  const hour = new Date().getHours();
  const nowHHMM = formatDate(new Date(), "HH:mm");

  // Bugungi bloklar
  const blocks = useMemo(
    () => buildTodayBlocks(plannedBlocks || [], habits || [], tasks || [], today),
    [plannedBlocks, habits, tasks, today],
  );

  // Bugungi odatlar (haftaning kuniga qarab)
  const todayDayNum = getTodayDayNum();
  const todayHabits = (habits || []).filter(h => {
    const days = h.customDays;
    if (!days || days.length === 0) return true;
    // customDays may use either 0–6 (JS) or 1–7 (spec). Accept either.
    const jsDay = todayDayNum === 7 ? 0 : todayDayNum;
    return days.includes(todayDayNum) || days.includes(jsDay);
  });
  const doneHabits = todayHabits.filter(h =>
    h.completedDates?.includes(today),
  );
  const habitProgress = todayHabits.length > 0
    ? doneHabits.length / todayHabits.length
    : 0;

  // Keyingi blok
  const nextBlock = blocks.find(b => !b.done && b.startTime > nowHHMM);

  // Cloudy xabari
  const cloudyMessage = useMemo(
    () => generateDashboardMessage({
      user, goals, habits, todayHabits, doneHabits, nextBlock, hour, today,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hour, doneHabits.length, todayHabits.length, goals.length],
  );

  const dayStatus = getDayStatus(habitProgress);

  return (
    <div className="flex flex-col h-full bg-[#F5F5F4] overflow-y-auto">
      <div className="px-4 py-5 flex flex-col gap-4 pb-24">
        <DashboardHeader
          name={user?.name}
          status={dayStatus}
          hour={hour}
        />

        <CloudyCard message={cloudyMessage} />

        <EnergyCheckIn />

        {goals.length > 0 && (
          <GoalsSection goals={goals} />
        )}

        <TodayFocus
          habits={todayHabits}
          doneHabits={doneHabits}
          nextBlock={nextBlock}
          today={today}
        />

        {todayHabits.length > 0 && (
          <HabitsTodaySection
            habits={todayHabits}
            doneHabits={doneHabits}
            today={today}
          />
        )}

        {blocks.length > 0 && (
          <PlannerPreview blocks={blocks} />
        )}
      </div>
    </div>
  );
}
