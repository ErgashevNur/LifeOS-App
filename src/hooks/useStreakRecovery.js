import { useState, useCallback } from "react";
import { getStreakStatus, daysSinceLastCompletion, todayISO } from "@/lib/streakEngine";

/**
 * Manages which recovery sheet is open and streak status per habit.
 */
export function useStreakRecovery(habits) {
  const [recoveryHabitId, setRecoveryHabitId] = useState(null);
  const today = todayISO();

  const openRecovery = useCallback((habitId) => setRecoveryHabitId(habitId), []);
  const closeRecovery = useCallback(() => setRecoveryHabitId(null), []);

  const recoveryHabit = habits.find(h => h.id === recoveryHabitId) || null;

  const getStatus = useCallback((habit) => getStreakStatus(habit, today), [today]);

  const getDaysMissed = useCallback((habit) => {
    const days = daysSinceLastCompletion(habit.completedDates || [], today);
    return days === Infinity ? 0 : Math.max(0, days - 1);
  }, [today]);

  return { recoveryHabit, openRecovery, closeRecovery, getStatus, getDaysMissed };
}
