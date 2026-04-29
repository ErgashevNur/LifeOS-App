import { useMemo } from "react";

export default function CloudyGoalInsight({ goal, status, daysLeft, timePct }) {
  const message = useMemo(() => {
    const totalDays = goal.timeframeDays
      || (goal.timeframe?.value
        ? goal.timeframe.value * (goal.timeframe.unit === "month" ? 30 : goal.timeframe.unit === "week" ? 7 : 1)
        : 90);

    switch (status) {
      case "onTrack":
        return `${goal.emoji || ""} Siz to'g'ri yo'ldasiz. Hozirgi sur'atda ${daysLeft} kun qoldi — yetib borasan.`;
      case "atRisk": {
        const behindDays = Math.max(
          1,
          Math.round((timePct - (goal.progress || 0) / 100) * totalDays),
        );
        return `${behindDays} kun orqada. Kunlik vaqtni 15 daqiqa ko'paytirsangiz — muammo yo'q.`;
      }
      case "critical":
        return `${daysLeft} kun qoldi. Hozir eng muhim narsaga fokuslan — boshqa hamma narsani keyinga qo'y.`;
      case "overdue":
        return `Muddat o'tdi. Lekin bu — to'xtatish emas. Yangi deadline belgilaymizmi?`;
      default:
        return `${goal.progress || 0}% bajarildi. Har kun bir qadam — ${daysLeft} kunda yetib borasan.`;
    }
  }, [status, goal, daysLeft, timePct]);

  return (
    <div className="flex gap-2.5 px-3.5 py-3 bg-violet-50 border border-violet-100 rounded-xl mt-3">
      <span className="text-[13px] shrink-0">☁️</span>
      <p className="text-[12px] text-violet-700 leading-relaxed">{message}</p>
    </div>
  );
}
