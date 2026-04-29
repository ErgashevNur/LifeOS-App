// src/lib/behaviorEngine.js
// Analyzes user habit data for patterns and insights

const DAY_NAMES = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];

function getDay(dateStr) {
  return new Date(dateStr).getDay();
}

function getHours(isoStr) {
  return new Date(isoStr).getHours();
}

// Which day of week this habit is most often completed
export function bestDayOfWeek(habit) {
  const dates = habit.completedDates || [];
  if (dates.length === 0) return null;
  const dayCount = Array(7).fill(0);
  dates.forEach(date => {
    dayCount[getDay(date)]++;
  });
  const maxIdx = dayCount.indexOf(Math.max(...dayCount));
  return DAY_NAMES[maxIdx];
}

// Which hour of day completions happen most
export function bestTimeOfDay(habit, completionLogs) {
  const logs = (completionLogs || []).filter(l => l.habitId === habit.id);
  if (logs.length === 0) return null;
  const hourCount = Array(24).fill(0);
  logs.forEach(l => {
    hourCount[getHours(l.completedAt)]++;
  });
  const best = hourCount.indexOf(Math.max(...hourCount));
  return `${String(best).padStart(2, "0")}:00`;
}

// Correlation: when habitA is done, does habitB also get done?
export function findDominoes(habits, _completionLogs) {
  const results = [];
  for (const habitA of habits) {
    for (const habitB of habits) {
      if (habitA.id === habitB.id) continue;
      const daysA = new Set(habitA.completedDates || []);
      const daysB = new Set(habitB.completedDates || []);
      if (daysA.size < 5) continue; // Need enough data

      let bothDone = 0;
      daysA.forEach(d => { if (daysB.has(d)) bothDone++; });

      const correlation = daysA.size > 0 ? bothDone / daysA.size : 0;
      if (correlation > 0.7) {
        results.push({
          trigger: habitA,
          effect: habitB,
          correlation: Math.round(correlation * 100),
        });
      }
    }
  }
  return results.sort((a, b) => b.correlation - a.correlation);
}

// Generate insights — only when enough data exists (30+ completions total)
export function generateInsights(habits, completionLogs) {
  const totalCompletions = habits.reduce((sum, h) => sum + (h.completedDates?.length || 0), 0);
  if (totalCompletions < 30) return [];

  const insights = [];

  // 1. Domino insight
  const dominoes = findDominoes(habits, completionLogs);
  if (dominoes.length > 0) {
    const d = dominoes[0];
    insights.push({
      type: "domino",
      priority: "high",
      message: `Siz ${d.trigger.emoji} ${d.trigger.name} qilgan kunlari ${d.effect.emoji} ${d.effect.name} ${d.correlation}% ko'proq bajariladi. Bu sizning kalit odatingiz.`,
      action: `${d.trigger.name} ni hech qachon o'tkazib yubormang`,
    });
  }

  // 2. Best day insights
  habits.forEach(habit => {
    const best = bestDayOfWeek(habit);
    if (best && (habit.completedDates?.length || 0) >= 10) {
      insights.push({
        type: "bestDay",
        priority: "medium",
        message: `${habit.emoji} ${habit.name}: ${best} kuni eng ko'p bajarasiz`,
      });
    }
  });

  // 3. Best time insight
  habits.forEach(habit => {
    const bestTime = bestTimeOfDay(habit, completionLogs);
    if (bestTime) {
      insights.push({
        type: "bestTime",
        priority: "low",
        message: `${habit.emoji} ${habit.name}: odatda soat ${bestTime} da bajarasiz`,
      });
    }
  });

  return insights.sort((a, b) => (a.priority === "high" ? -1 : b.priority === "high" ? 1 : 0));
}
