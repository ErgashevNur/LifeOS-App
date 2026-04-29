// src/lib/transformationEngine.js

export const TRANSFORMATION_MILESTONES = [30, 60, 90, 180];

export const TRANSFORMATION_QUESTIONS = {
  30: (entries) => {
    const first = entries?.[0];
    return first
      ? `30 kun oldin siz yozdingiz:\n"${first.answer?.slice(0, 80)}..."\n\nHozir qanday?`
      : "30 kun o'tdi. Hayotingizda nima o'zgardi?";
  },
  60: (entries) => {
    const last = entries?.at(-1);
    return last
      ? `2 oy oldin siz yozdingiz:\n"${last.answer?.slice(0, 60)}..."\n\nHozir bu qanday ko'rinadi?`
      : "2 oy o'tdi. O'zingizda qanday o'zgarishlarni sezdingiz?";
  },
  90: () => "3 oy — to'rt faslning biri. Eng katta o'zgarish qaysi?",
  180: () => "6 oy. Bir yil oldingi siz bu natijalarga ishonardimi?",
};

// Check if a transformation prompt should be shown
export function shouldAskTransformation(habits, journalEntries) {
  if (!habits || habits.length === 0) return null;

  // Find the oldest habit
  const sorted = [...habits].sort((a, b) =>
    (a.createdAt || "").localeCompare(b.createdAt || ""),
  );
  const oldest = sorted[0];
  if (!oldest?.createdAt) return null;

  const daysSinceStart = Math.floor(
    (Date.now() - new Date(oldest.createdAt).getTime()) / (1000 * 60 * 60 * 24),
  );

  for (const m of TRANSFORMATION_MILESTONES) {
    if (daysSinceStart >= m) {
      const alreadyAsked = (journalEntries || []).some(e => e.milestone === m);
      // If snoozed within 3 days, skip
      const snoozed = (journalEntries || []).find(e => e.milestone === m && e.snoozedAt);
      if (snoozed) {
        const snoozeAge = Math.floor(
          (Date.now() - new Date(snoozed.snoozedAt).getTime()) / (1000 * 60 * 60 * 24),
        );
        if (snoozeAge < 3) continue;
      }
      if (!alreadyAsked) return m;
    }
  }

  return null;
}

export function buildTransformationQuestion(milestone, entries) {
  const fn = TRANSFORMATION_QUESTIONS[milestone];
  return fn ? fn(entries || []) : `${milestone} kun. Nima o'zgardi?`;
}
