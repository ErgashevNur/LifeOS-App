// goalProgressEngine.js — habit completionlardan goal progressini hisoblash
import { differenceInDaysFrom, parseISODate } from "@/lib/dashboardEngine";

function findGoalHabits(goal, habits) {
  return (habits || []).filter(
    h => h.linkedGoalId === goal.id || h.goalId === goal.id,
  );
}

function getTimeframeDays(goal) {
  if (goal.timeframeDays) return goal.timeframeDays;
  const tf = goal.timeframe;
  if (!tf?.value) return 90;
  if (tf.unit === "month") return tf.value * 30;
  if (tf.unit === "week") return tf.value * 7;
  if (tf.unit === "day") return tf.value;
  return 90;
}

/**
 * Compute progress (0–100) from linked habit completions.
 * Compares actual completions vs (timeframeDays × habitCount) target.
 */
export function recalculateGoalProgress(goal, habits) {
  if (!goal) return 0;
  const goalHabits = findGoalHabits(goal, habits);
  if (goalHabits.length === 0) return goal.progress || 0;

  const totalDays = getTimeframeDays(goal);
  const target = totalDays * goalHabits.length;
  if (target <= 0) return 0;

  const actualDone = goalHabits.reduce(
    (sum, h) => sum + (h.completedDates?.length || 0),
    0,
  );

  return Math.min(100, Math.round((actualDone / target) * 100));
}

/**
 * Iterate goals and call updateProgress(id, %) when value drifts.
 * Skips goals already at 100%.
 */
export function autoUpdateGoalProgress(goals, habits, updateProgress) {
  (goals || []).forEach(goal => {
    if ((goal.progress || 0) >= 100) return;
    const next = recalculateGoalProgress(goal, habits);
    if (next !== goal.progress) {
      updateProgress(goal.id, next);
    }
  });
}

/**
 * Classify a goal's status. Used for color-coding & insights.
 */
export function classifyGoalStatus(goal) {
  const progress = (goal.progress || 0) / 100;
  const deadline = parseISODate(goal.deadline);
  if (!deadline) return "normal";

  const daysLeft = differenceInDaysFrom(deadline);
  const totalDays = getTimeframeDays(goal);
  const timePct = totalDays > 0 ? Math.max(0, 1 - daysLeft / totalDays) : 0;

  if (daysLeft < 0) return "overdue";
  if (daysLeft <= 7 && progress < 0.9) return "critical";
  if (progress < timePct - 0.15) return "atRisk";
  if (progress >= timePct - 0.05) return "onTrack";
  return "normal";
}

export function getGoalMeta(goal) {
  const totalDays = getTimeframeDays(goal);
  const deadline = parseISODate(goal.deadline);
  const daysLeft = deadline ? differenceInDaysFrom(deadline) : null;
  const timePct = totalDays > 0 && deadline
    ? Math.max(0, 1 - daysLeft / totalDays)
    : 0;
  return { totalDays, deadline, daysLeft, timePct };
}
