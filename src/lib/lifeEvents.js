// src/lib/lifeEvents.js

export const LIFE_EVENTS = {
  travel: {
    id: "travel",
    label: "Sayohatda",
    emoji: "✈️",
    defaultDuration: null,
    habitAdjustment: "minimal",
    message: "Sayohat rejimiga o'tdik. Odatlar engilroq versiyaga tushdi.",
  },
  sick: {
    id: "sick",
    label: "Kasal",
    emoji: "🤒",
    defaultDuration: null,
    habitAdjustment: "pause",
    message: "Tuzaling. Faqat suv ichish va uyqu qoladi.",
  },
  newJob: {
    id: "newJob",
    label: "Yangi ish",
    emoji: "💼",
    defaultDuration: 14,
    habitAdjustment: "reduced",
    message: "Yangi ish boshlaganda moslashish kerak. 2 hafta kamroq talab qilamiz.",
  },
  newBaby: {
    id: "newBaby",
    label: "Yangi bola",
    emoji: "👶",
    defaultDuration: 30,
    habitAdjustment: "mvd",
    message: "Tabriklaymiz! Hozir faqat eng minimal narsalar — siz uchun ham, bola uchun ham.",
  },
  loss: {
    id: "loss",
    label: "Qiyin davr",
    emoji: "🕊️",
    defaultDuration: null,
    habitAdjustment: "pause",
    message: "Hozir odatlar emas — siz muhimroq. Tayyor bo'lganda qaytamiz.",
  },
  exam: {
    id: "exam",
    label: "Imtihon / deadline",
    emoji: "📚",
    defaultDuration: null,
    habitAdjustment: "focus",
    message: "Imtihon davri. Faqat uyqu va harakat qoladi — miya uchun.",
  },
};

// Core habits that are never paused
const CORE_HABIT_IDS = ["water", "sleep", "movement"];

export function adjustHabit(habit, adjustmentType) {
  const id = habit.id || "";
  switch (adjustmentType) {
    case "minimal":
      return habit.minimalVersion || "Minimal versiya";
    case "pause":
      return CORE_HABIT_IDS.some(k => id.includes(k) || (habit.name || "").toLowerCase().includes(k))
        ? (habit.minimalVersion || "Minimal versiya")
        : "To'xtatildi";
    case "reduced":
      return `${habit.minimalVersion || "Minimal"} (50%)`;
    case "mvd":
      return CORE_HABIT_IDS.some(k => id.includes(k) || (habit.name || "").toLowerCase().includes(k))
        ? (habit.minimalVersion || "Minimal versiya")
        : "To'xtatildi";
    case "focus":
      return ["sleep","movement","uyqu","harakat"].some(k =>
        id.includes(k) || (habit.name || "").toLowerCase().includes(k))
        ? (habit.name || habit.minimalVersion)
        : "To'xtatildi";
    default:
      return habit.minimalVersion || "Minimal versiya";
  }
}

export function parseDurationLabel(label) {
  if (!label || label === "Bilmayman") return null;
  const map = { "1 hafta": 7, "2 hafta": 14, "1 oy": 30 };
  return map[label] || null;
}
