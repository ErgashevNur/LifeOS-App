// src/lib/onboardingEngine.js
// Local onboarding logic — no API required

export function analyzePain(input) {
  const lower = input.toLowerCase();
  if (lower.match(/charch|holsiz|energiya|uyqu/)) return "energy";
  if (lower.match(/vaqt|ulgurolmayman|band/)) return "time";
  if (lower.match(/motivatsiya|boshlay olmayman|qo'ym|qoymayman/)) return "motivation";
  if (lower.match(/fokus|diqqat|chalg'i|distract/)) return "focus";
  return "general";
}

export function analyzeEnergy(input) {
  const lower = input.toLowerCase();
  if (lower.match(/tong|ertalab|07|08|09|saharf/)) return "morning";
  if (lower.match(/tush|12|13|14/)) return "afternoon";
  if (lower.match(/kech|oqshom|18|19|20|21/)) return "evening";
  return "morning";
}

export function getPainResponse(painCategory) {
  const responses = {
    energy: "Tushundim. Energiya masalasi — bu ko'pchilikni to'xtatadi.\n\nIkkinchi savol: Siz kim bo'lmoqchisiz? Bir jumla bilan — bu insonning nomi qanday bo'ladi?",
    time: "Ha, vaqt — eng qimmat resurs.\n\nKim bo'lmoqchisiz? O'zingizni bir jumla bilan tasvirlang.",
    motivation: "Bu eng keng tarqalgan muammo. Gap motivatsiyada emas — tizimda.\n\nKim bo'lmoqchisiz? Bir jumla bilan.",
    focus: "Diqqatni boshqarish — zamonaviy eng muhim ko'nikma.\n\nKim bo'lmoqchisiz?",
    general: "Tushundim.\n\nKim bo'lmoqchisiz? O'zingizni bir jumla bilan tasvirlang.",
  };
  return responses[painCategory] || responses.general;
}

export function buildSuggestionMessage(suggestions) {
  const names = suggestions.map(s => `${s.emoji} ${s.name}`).join(", ");
  return `Tahlil tayyor.\n\nSizga mos 3 ta odat topdim:\n${names}\n\nHar biri minimal — 1-5 daqiqa. Har kun. Mana shular:`;
}

export function generateHabitSuggestions(profile) {
  const { painPoint, energyTime } = profile;

  const timeMap = {
    morning:   { first: "07:00", second: "07:30", third: "08:00" },
    afternoon: { first: "12:30", second: "13:00", third: "13:30" },
    evening:   { first: "18:00", second: "18:30", third: "19:00" },
  };

  const times = timeMap[energyTime] || timeMap.morning;

  const suggestions = {
    energy: [
      { tempId: "sleep",    emoji: "😴", name: "Uyqu rejimi",      minimalVersion: "23:00 da yotish",      scheduledTime: "22:30", minimalDuration: "5 daqiqa",  identityStatement: "tartibli yashaydighan insonman" },
      { tempId: "water",    emoji: "💧", name: "Suv ichish",        minimalVersion: "1 stakan",              scheduledTime: times.first,  minimalDuration: "1 daqiqa",  identityStatement: "o'z tanasiga g'amxo'r insonman" },
      { tempId: "movement", emoji: "🏃", name: "Harakat",           minimalVersion: "5 daqiqa yurish",      scheduledTime: times.second, minimalDuration: "5 daqiqa",  identityStatement: "harakatda bo'lishni yaxshi ko'raman" },
    ],
    motivation: [
      { tempId: "why",      emoji: "📝", name: "Kunlik niyat",      minimalVersion: "1 jumla yoz",          scheduledTime: times.first,  minimalDuration: "2 daqiqa",  identityStatement: "maqsadli yashaydighan insonman" },
      { tempId: "win",      emoji: "🏆", name: "Kichik g'alaba",    minimalVersion: "1 narsa yoz",          scheduledTime: times.third,  minimalDuration: "2 daqiqa",  identityStatement: "o'sishga intiluvchiman" },
      { tempId: "read",     emoji: "📚", name: "Kitob o'qish",      minimalVersion: "1 sahifa",             scheduledTime: times.second, minimalDuration: "2 daqiqa",  identityStatement: "kitob o'quvchiman" },
    ],
    time: [
      { tempId: "plan",     emoji: "📅", name: "Kunlik reja",       minimalVersion: "3 vazifa yoz",         scheduledTime: times.first,  minimalDuration: "5 daqiqa",  identityStatement: "vaqtini aqlli ishlatuvchiman" },
      { tempId: "deep",     emoji: "⚡", name: "Chuqur ish",        minimalVersion: "25 daqiqa fokus",      scheduledTime: times.second, minimalDuration: "25 daqiqa", identityStatement: "chuqur ishlovchiman" },
      { tempId: "review",   emoji: "🔍", name: "Kun yakunlash",     minimalVersion: "2 daqiqa ko'rib chiq", scheduledTime: "21:00",      minimalDuration: "2 daqiqa",  identityStatement: "o'z hayotini boshqaruvchiman" },
    ],
    focus: [
      { tempId: "meditate", emoji: "🧘", name: "Meditatsiya",       minimalVersion: "2 nafas mashqi",       scheduledTime: times.first,  minimalDuration: "2 daqiqa",  identityStatement: "tinch va fokusli insonman" },
      { tempId: "noPhone",  emoji: "📵", name: "Telefonsiz tong",   minimalVersion: "30 daqiqa",            scheduledTime: times.first,  minimalDuration: "1 daqiqa",  identityStatement: "diqqatli insonman" },
      { tempId: "journal",  emoji: "✍️", name: "Refleksiya",        minimalVersion: "2 jumla yoz",          scheduledTime: times.third,  minimalDuration: "3 daqiqa",  identityStatement: "o'z-o'zini bilib boruvchiman" },
    ],
    general: [
      { tempId: "water",    emoji: "💧", name: "Suv ichish",        minimalVersion: "1 stakan",              scheduledTime: times.first,  minimalDuration: "1 daqiqa",  identityStatement: "o'z tanasiga g'amxo'r insonman" },
      { tempId: "plan",     emoji: "📅", name: "Kunlik reja",       minimalVersion: "3 vazifa yoz",         scheduledTime: times.second, minimalDuration: "5 daqiqa",  identityStatement: "vaqtini aqlli ishlatuvchiman" },
      { tempId: "journal",  emoji: "✍️", name: "Refleksiya",        minimalVersion: "2 jumla yoz",          scheduledTime: times.third,  minimalDuration: "3 daqiqa",  identityStatement: "o'z-o'zini bilib boruvchiman" },
    ],
  };

  const base = suggestions[painPoint] || suggestions.general;

  return base.map(s => ({
    ...s,
    id: crypto.randomUUID(),
    category: painPoint || "general",
    frequency: "daily",
    customDays: [1, 2, 3, 4, 5, 6, 7],
    cueType: "time",
    cueValue: s.scheduledTime,
    streak: 0,
    completedDates: [],
    achievedMilestones: [],
    recordStreak: 0,
    totalMinutes: 0,
    isAutomatic: false,
    createdAt: new Date().toISOString(),
  }));
}
