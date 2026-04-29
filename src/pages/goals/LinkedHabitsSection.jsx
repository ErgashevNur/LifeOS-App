import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/dashboardEngine";

function getDateNDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return formatDate(d, "yyyy-MM-dd");
}

function getWeeklyRate(habit) {
  const last7 = Array.from({ length: 7 }, (_, i) => getDateNDaysAgo(i));
  const done = last7.filter(d => habit.completedDates?.includes(d)).length;
  return Math.round((done / 7) * 100);
}

export default function LinkedHabitsSection({ habits }) {
  const today = formatDate(new Date(), "yyyy-MM-dd");

  return (
    <div>
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
        Bog'liq odatlar
      </p>
      <div className="flex flex-col gap-1.5">
        {habits.map(habit => {
          const doneToday = habit.completedDates?.includes(today);
          const weekRate = getWeeklyRate(habit);

          return (
            <div
              key={habit.id}
              className="flex items-center gap-2.5 px-3 py-2.5 bg-[#FAFAF9] rounded-xl border border-black/[0.06]"
            >
              <span className="text-[16px]">{habit.emoji || "🌱"}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-gray-800 truncate">
                  {habit.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 7 }).map((_, i) => {
                      const date = getDateNDaysAgo(6 - i);
                      const done = habit.completedDates?.includes(date);
                      return (
                        <div
                          key={i}
                          className={cn(
                            "w-2 h-2 rounded-full",
                            done ? "bg-violet-500" : "bg-black/[0.08]",
                          )}
                        />
                      );
                    })}
                  </div>
                  <span className="text-[10px] text-gray-400">
                    {weekRate}% bu hafta
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-medium shrink-0">
                {doneToday
                  ? <span className="text-green-600">✓ Bugun</span>
                  : <span className="text-gray-400">· Qoldi</span>
                }
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
