// src/lib/lifeEventDetector.js

export function detectLifeEvent(habit, daysMissed) {
  if (daysMissed >= 3) {
    return {
      shouldAsk: true,
      message: buildEventQuestion(habit, daysMissed),
    };
  }
  return { shouldAsk: false };
}

function buildEventQuestion(habit, daysMissed) {
  return `${habit.emoji || "✨"} ${habit.name || habit.title} ${daysMissed} kun bo'ldi.\n\nQiyin davr bo'ldimi? Nima bo'ldi?`;
}

// Calculate how many consecutive days a habit has been missed
export function getDaysMissedStreak(habit, today) {
  const completedDates = new Set(habit.completedDates || []);
  let missed = 0;
  const d = new Date(today);

  // Check from yesterday backwards (today might still be completable)
  d.setDate(d.getDate() - 1);

  while (missed < 30) {
    const dateStr = d.toISOString().slice(0, 10);
    if (completedDates.has(dateStr)) break;
    missed++;
    d.setDate(d.getDate() - 1);
  }

  return missed;
}

// Check if any habit needs a life event prompt
export function checkHabitsForLifeEventPrompt(habits, today, shownEventPrompts) {
  for (const habit of habits) {
    if (habit.completedToday || habit.isAdjusted) continue;
    const missed = getDaysMissedStreak(habit, today);
    const { shouldAsk } = detectLifeEvent(habit, missed);
    if (shouldAsk && !shownEventPrompts?.has(habit.id)) {
      return { habit, daysMissed: missed };
    }
  }
  return null;
}
