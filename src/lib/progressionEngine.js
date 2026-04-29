// src/lib/progressionEngine.js

export const PROGRESSION_STAGES = [
  { id: "seed",   daysRequired: 0,   label: "Urug'",    emoji: "🌱", multiplier: 1.0 },
  { id: "sprout", daysRequired: 7,   label: "Ko'chat",  emoji: "🌿", multiplier: 1.0 },
  { id: "plant",  daysRequired: 21,  label: "O'simlik", emoji: "🌳", multiplier: 1.5 },
  { id: "tree",   daysRequired: 66,  label: "Daraxt",   emoji: "🏆", multiplier: 2.0 },
  { id: "forest", daysRequired: 100, label: "O'rmon",   emoji: "💎", multiplier: 3.0 },
];

export function getCurrentStage(streak) {
  return [...PROGRESSION_STAGES]
    .reverse()
    .find(s => streak >= s.daysRequired) || PROGRESSION_STAGES[0];
}

export function getNextStage(streak) {
  return PROGRESSION_STAGES.find(s => s.daysRequired > streak) || null;
}

export function getProgressToNext(streak) {
  const current = getCurrentStage(streak);
  const next = getNextStage(streak);
  if (!next) return 1;
  const range = next.daysRequired - current.daysRequired;
  const done = streak - current.daysRequired;
  return Math.min(done / range, 1);
}

export function getVersionForStage(habit, stageId) {
  const versions = {
    seed:   habit.minimalVersion,
    sprout: habit.minimalVersion,
    plant:  habit.fullVersion || habit.minimalVersion,
    tree:   habit.strongVersion || habit.fullVersion || habit.minimalVersion,
    forest: habit.masterVersion || habit.strongVersion || habit.fullVersion || habit.minimalVersion,
  };
  return versions[stageId] || habit.minimalVersion || habit.fullVersion;
}

// Recent completion rate over last N days
function getRecentCompletionRate(habit, days) {
  const completedDates = new Set(habit.completedDates || []);
  const today = new Date();
  let done = 0;
  for (let i = 1; i <= days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (completedDates.has(d.toISOString().slice(0, 10))) done++;
  }
  return done / days;
}

export function shouldOfferProgression(habit) {
  const streak = habit.streak || 0;
  const nextStage = getNextStage(streak);
  if (!nextStage) return false;

  const atMilestone = streak === nextStage.daysRequired;
  const notYetOffered = !habit.progressionOfferedAt?.[nextStage.id];
  const recentRate = getRecentCompletionRate(habit, 7);

  return atMilestone && notYetOffered && recentRate >= 0.8;
}
