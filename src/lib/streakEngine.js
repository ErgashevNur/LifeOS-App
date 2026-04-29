/**
 * streakEngine.js — pure streak/status calculations, no side-effects
 */

/**
 * Calculate current streak from sorted completedDates array and today string.
 * Counts consecutive days ending at today or yesterday.
 */
export function calculateStreak(completedDates, today) {
  if (!completedDates || completedDates.length === 0) return 0;
  const sorted = [...completedDates].sort().reverse();
  let streak = 0;
  let checkDate = today;

  for (const date of sorted) {
    const diff = daysDiff(checkDate, date);
    if (diff === 0 || diff === 1) {
      streak++;
      checkDate = date;
    } else {
      break;
    }
  }
  return streak;
}

/**
 * Difference in days: how many days from dateB to dateA (dateA >= dateB)
 */
export function daysDiff(dateA, dateB) {
  const a = new Date(dateA + "T00:00:00");
  const b = new Date(dateB + "T00:00:00");
  return Math.round((a - b) / 86400000);
}

/**
 * How many days since last completion
 */
export function daysSinceLastCompletion(completedDates, today) {
  if (!completedDates || completedDates.length === 0) return Infinity;
  const last = [...completedDates].sort().at(-1);
  return daysDiff(today, last);
}

/**
 * Get streak status for a habit
 * Returns: "active" | "at_risk" | "missed_1" | "missed_2" | "recovery"
 */
export function getStreakStatus(habit, today) {
  const { completedDates = [], scheduledTime } = habit;
  if (completedDates.length === 0) return "active";

  const daysSince = daysSinceLastCompletion(completedDates, today);

  if (daysSince === 0) return "active";

  if (daysSince === 1) {
    // If we're before the scheduled time today, streak not yet at risk
    if (scheduledTime && isBeforeScheduledTime(scheduledTime)) return "active";
    return "at_risk";
  }

  if (daysSince === 2) return "missed_1";
  if (daysSince === 3) return "missed_2";
  return "recovery";
}

function isBeforeScheduledTime(timeStr) {
  if (!timeStr) return false;
  const [h, m] = timeStr.split(":").map(Number);
  const now = new Date();
  return now.getHours() < h || (now.getHours() === h && now.getMinutes() < m);
}

/**
 * Check which milestones are newly reached
 */
export const MILESTONES = [7, 21, 30, 66, 100];

export function checkNewMilestone(streak, achievedMilestones = []) {
  for (const m of MILESTONES) {
    if (streak === m && !achievedMilestones.includes(m)) return m;
  }
  return null;
}

/**
 * Today ISO string
 */
export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/* ─────────────────────────────────────────────────────────
 * Streak Freeze — haftada 1 ta "muzlatish" haqqi
 *
 * Foydalanuvchi 1 kun o'tkazib yuborsa, freeze avtomatik
 * ishlatiladi, streak buzilmaydi. Haftada faqat 1 marta.
 *
 * habit obyektida saqlanadi:
 *   freezeUsedDates: ["2026-04-15", ...]
 * ───────────────────────────────────────────────────────── */

// Hafta boshini (dushanba) qaytaradi
function weekStartISO(dateISO) {
  const d = new Date(dateISO + "T00:00:00");
  const dow = d.getDay(); // 0=Sun, 1=Mon, ...
  const offset = dow === 0 ? 6 : dow - 1;
  d.setDate(d.getDate() - offset);
  return d.toISOString().slice(0, 10);
}

// Bu hafta freeze ishlatilganmi?
export function isFreezeAvailable(habit, today) {
  const used = habit.freezeUsedDates || [];
  const weekStart = weekStartISO(today);
  return !used.some(d => d >= weekStart);
}

// Freeze ishlatish kerakmi? (1 kun o'tkazilgan + freeze mavjud)
export function shouldUseFreeze(habit, today) {
  const daysSince = daysSinceLastCompletion(habit.completedDates || [], today);
  // Faqat 1 kun bo'shliq + freeze hali ishlatilmagan + tarix bor
  return daysSince === 2 && isFreezeAvailable(habit, today);
}

// Freeze ni saqlash — habit obyektini qaytaradi
export function applyFreeze(habit, today) {
  const used = habit.freezeUsedDates || [];
  if (used.includes(today)) return habit;
  return {
    ...habit,
    freezeUsedDates: [...used, today],
  };
}

/* ─────────────────────────────────────────────────────────
 * Energy-aware target — past energiyada minimal versiya tavsiya
 * energy: 1 (juda past) — 5 (yuqori)
 * ───────────────────────────────────────────────────────── */
export function targetForEnergy(habit, energy) {
  if (!energy || energy >= 4) return { mode: "full", text: habit.fullVersion || habit.name };
  if (energy === 3) return { mode: "full", text: habit.fullVersion || habit.name };
  // 1-2 — minimal
  return {
    mode: "minimal",
    text: habit.minimalVersion || `${habit.name} (qisqa versiya)`,
  };
}
