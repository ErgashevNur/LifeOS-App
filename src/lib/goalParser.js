// goalParser.js — sodda regex-based goal parser (offline, AI yo'q)

export const CATEGORY_KEYWORDS = {
  language: ["ingliz", "english", "til", "rus", "arab", "ispan", "fransuz", "koreys", "yapon", "language"],
  fitness: ["sport", "fitness", "yugur", "vazn", "muskul", "qotaytir", "ozish", "ozg'in", "kuchli", "press", "gym"],
  learning: ["o'qi", "oqi", "kitob", "kurs", "o'rgan", "organ", "study", "ta'lim", "talim", "matematika", "fizika"],
  writing: ["yoz", "blog", "kitob yoz", "maqola", "writing", "kontent", "content"],
  business: ["biznes", "pul", "daromad", "loyiha", "startup", "ish", "freelanc", "biznes ochish"],
  health: ["sog'lom", "soglom", "sog'liq", "sogliq", "ovqat", "uyqu", "suv", "stress"],
  mindset: ["meditatsiya", "meditation", "tinch", "ong", "fikr", "diqqat", "focus", "mindfulness"],
  personal: ["odat", "habit", "kun", "rejim", "tartib", "hayot"],
};

export const CATEGORY_META = {
  language:  { emoji: "🌍", label: "Til o'rganish" },
  fitness:   { emoji: "💪", label: "Sport / Fitness" },
  learning:  { emoji: "📚", label: "O'rganish" },
  writing:   { emoji: "✍️", label: "Yozish" },
  business:  { emoji: "💼", label: "Biznes" },
  health:    { emoji: "🌿", label: "Sog'liq" },
  mindset:   { emoji: "🧘", label: "Ong / Tinchlik" },
  personal:  { emoji: "🌱", label: "Shaxsiy o'sish" },
};

// Detect category from raw text
function detectCategory(text) {
  const lower = text.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) return cat;
    }
  }
  return "personal";
}

// Detect timeframe (e.g. "3 oyda", "1 yilda", "6 hafta")
function detectTimeframe(text) {
  const lower = text.toLowerCase();
  const monthMatch = lower.match(/(\d+)\s*oy/);
  const weekMatch = lower.match(/(\d+)\s*hafta/);
  const yearMatch = lower.match(/(\d+)\s*yil/);
  const dayMatch = lower.match(/(\d+)\s*kun/);

  if (yearMatch) return { value: parseInt(yearMatch[1], 10) * 12, unit: "month", label: `${yearMatch[1]} yil` };
  if (monthMatch) return { value: parseInt(monthMatch[1], 10), unit: "month", label: `${monthMatch[1]} oy` };
  if (weekMatch) return { value: parseInt(weekMatch[1], 10), unit: "week", label: `${weekMatch[1]} hafta` };
  if (dayMatch) return { value: parseInt(dayMatch[1], 10), unit: "day", label: `${dayMatch[1]} kun` };

  return { value: 3, unit: "month", label: "3 oy" }; // default
}

// Build a clean title from the raw goal
function buildTitle(text) {
  const trimmed = text.trim();
  if (trimmed.length <= 60) return trimmed;
  return trimmed.slice(0, 57) + "...";
}

// ──────────────────────────────────────────────────
// parseGoal — main entry point
// ──────────────────────────────────────────────────
export function parseGoal(text) {
  if (!text || !text.trim()) return null;
  const category = detectCategory(text);
  const timeframe = detectTimeframe(text);
  const meta = CATEGORY_META[category];

  return {
    rawText: text.trim(),
    title: buildTitle(text),
    category,
    emoji: meta.emoji,
    label: meta.label,
    timeframe,
  };
}

// ──────────────────────────────────────────────────
// System templates — 8 categories
// ──────────────────────────────────────────────────

const languageSystem = (goal) => ({
  weeklyTime: "5-7 soat",
  dailyTime: "45-60 daqiqa",
  habits: [
    {
      emoji: "📖",
      name: "Lug'at o'rganish",
      minimalVersion: "5 ta yangi so'z",
      fullVersion: "20 ta yangi so'z + jumlalar",
      scheduledTime: "07:30",
      identityStatement: "Men har kuni so'z boyligimni oshiraman",
      category: "mind",
      cueType: "time",
    },
    {
      emoji: "🎧",
      name: "Audio mashq (suhbat)",
      minimalVersion: "5 daqiqa tinglash",
      fullVersion: "20 daqiqa podcast / dialog",
      scheduledTime: "12:30",
      identityStatement: "Men quloqni ko'nikadigan odamman",
      category: "mind",
      cueType: "time",
    },
    {
      emoji: "✍️",
      name: "Yozma mashq",
      minimalVersion: "1 ta jumla",
      fullVersion: "5 jumlalik kichik matn",
      scheduledTime: "21:00",
      identityStatement: "Men har kuni o'z fikrlarimni yangi tilda yozaman",
      category: "mind",
      cueType: "time",
    },
  ],
  milestones: [
    { day: 7, label: "Birinchi 50 so'z" },
    { day: 30, label: "Oddiy suhbat" },
    { day: 90, label: `${goal.timeframe.label}da B1 darajasi` },
  ],
  firstStep: "Bugun 5 ta so'zni daftarchaga yozib, qaytarib chiqing.",
});

const fitnessSystem = (goal) => ({
  weeklyTime: "3-5 soat",
  dailyTime: "30-45 daqiqa",
  habits: [
    {
      emoji: "🏃",
      name: "Yurish / Yugurish",
      minimalVersion: "5 daqiqa yurish",
      fullVersion: "30 daqiqa yugurish",
      scheduledTime: "06:30",
      identityStatement: "Men har kuni harakat qiladigan odamman",
      category: "health",
      cueType: "time",
    },
    {
      emoji: "💪",
      name: "Kuch mashqlari",
      minimalVersion: "10 ta press",
      fullVersion: "3 set: press + plank + squat",
      scheduledTime: "18:00",
      identityStatement: "Men kuchli tana quraman",
      category: "health",
      cueType: "time",
    },
    {
      emoji: "💧",
      name: "Suv ichish",
      minimalVersion: "2 stakan",
      fullVersion: "2 litr",
      scheduledTime: "09:00",
      identityStatement: "Men tanamga g'amxo'rlik qilaman",
      category: "health",
      cueType: "time",
    },
  ],
  milestones: [
    { day: 7, label: "7 kun ketma-ket harakat" },
    { day: 30, label: "Birinchi natijalar (sezgi)" },
    { day: 66, label: "Avtomatik odat — tana o'zi so'raydi" },
  ],
  firstStep: "Bugun 5 daqiqa pastga tushib chiqing — bu yetadi.",
});

const learningSystem = (goal) => ({
  weeklyTime: "5-8 soat",
  dailyTime: "45-60 daqiqa",
  habits: [
    {
      emoji: "📚",
      name: "Asosiy o'qish bloki",
      minimalVersion: "10 daqiqa fokus",
      fullVersion: "45 daqiqa chuqur o'qish",
      scheduledTime: "08:00",
      identityStatement: "Men har kuni biror narsa o'rganaman",
      category: "deep_work",
      cueType: "time",
    },
    {
      emoji: "📝",
      name: "Yozma takrorlash (notes)",
      minimalVersion: "1 ta tushuncha",
      fullVersion: "Bugungi xulosa qisqa qog'ozda",
      scheduledTime: "21:30",
      identityStatement: "Men o'rganganimni mustahkamlayman",
      category: "mind",
      cueType: "time",
    },
  ],
  milestones: [
    { day: 7, label: "Birinchi modul / bo'lim" },
    { day: 30, label: "Asoslar mustahkamlangan" },
    { day: 90, label: `${goal.timeframe.label}da loyiha tugaydi` },
  ],
  firstStep: "Bugun 10 daqiqa — faqat ochib ko'ring. Boshlash — eng muhimi.",
});

const writingSystem = (goal) => ({
  weeklyTime: "3-5 soat",
  dailyTime: "30-45 daqiqa",
  habits: [
    {
      emoji: "✍️",
      name: "Erta tongda yozish",
      minimalVersion: "1 ta jumla",
      fullVersion: "300 so'z draft",
      scheduledTime: "06:00",
      identityStatement: "Men har kuni yozadigan yozuvchiman",
      category: "deep_work",
      cueType: "time",
    },
    {
      emoji: "📖",
      name: "Boshqa yozuvchilarni o'qish",
      minimalVersion: "1 sahifa",
      fullVersion: "10 sahifa fokus",
      scheduledTime: "21:00",
      identityStatement: "Men yozish uchun o'qiyman",
      category: "mind",
      cueType: "time",
    },
  ],
  milestones: [
    { day: 7, label: "1-haftalik draft" },
    { day: 30, label: "Birinchi to'liq matn" },
    { day: 90, label: `${goal.timeframe.label}da nashrga tayyor` },
  ],
  firstStep: "Bugun 1 jumla yozing. Ha — bitta jumla. Bu yetadi.",
});

const businessSystem = (goal) => ({
  weeklyTime: "5-10 soat",
  dailyTime: "60-90 daqiqa",
  habits: [
    {
      emoji: "🎯",
      name: "Asosiy mahsulot ustida ish",
      minimalVersion: "10 daqiqa fokus",
      fullVersion: "60 daqiqa chuqur ish",
      scheduledTime: "08:00",
      identityStatement: "Men har kuni biznesimni qo'lga olaman",
      category: "deep_work",
      cueType: "time",
    },
    {
      emoji: "💬",
      name: "Mijoz / hamjamiyat bilan aloqa",
      minimalVersion: "1 ta xabar",
      fullVersion: "5 ta sifatli aloqa",
      scheduledTime: "14:00",
      identityStatement: "Men odamlarga qiymat beraman",
      category: "deep_work",
      cueType: "time",
    },
  ],
  milestones: [
    { day: 7, label: "Birinchi MVP / sketch" },
    { day: 30, label: "Birinchi mijoz / fikr-mulohaza" },
    { day: 90, label: `${goal.timeframe.label}da daromad bosqichi` },
  ],
  firstStep: "Bugun 10 daqiqa — eng kichik qadamni qiling. Mukammallik kerak emas.",
});

const healthSystem = () => ({
  weeklyTime: "3-5 soat",
  dailyTime: "30-45 daqiqa",
  habits: [
    {
      emoji: "💧",
      name: "Suv ichish",
      minimalVersion: "1 stakan ertalab",
      fullVersion: "2 litr kun davomida",
      scheduledTime: "07:00",
      identityStatement: "Men tanamga g'amxo'rlik qilaman",
      category: "health",
      cueType: "time",
    },
    {
      emoji: "🌿",
      name: "Sog'lom ovqatlanish",
      minimalVersion: "1 ta sabzavot qo'shish",
      fullVersion: "Sof, mukammal ovqat",
      scheduledTime: "13:00",
      identityStatement: "Men tanamni ozuqalantiraman",
      category: "health",
      cueType: "time",
    },
    {
      emoji: "😴",
      name: "Erta uxlash",
      minimalVersion: "Telefon yotoqdan tashqarida",
      fullVersion: "23:00 da chiroq o'chgan",
      scheduledTime: "22:30",
      identityStatement: "Men uyquni qadrlayman",
      category: "health",
      cueType: "time",
    },
  ],
  milestones: [
    { day: 7, label: "Energiya o'sgan" },
    { day: 30, label: "Yangi normaga aylangan" },
    { day: 66, label: "Avtomatik sog'lom rejim" },
  ],
  firstStep: "Bugun 1 stakan suv iching — boshlanish shu.",
});

const mindsetSystem = () => ({
  weeklyTime: "1.5-3 soat",
  dailyTime: "15-30 daqiqa",
  habits: [
    {
      emoji: "🧘",
      name: "Sokin meditatsiya",
      minimalVersion: "1 daqiqa nafas",
      fullVersion: "15 daqiqa o'tirish",
      scheduledTime: "07:00",
      identityStatement: "Men ongimning egasiman",
      category: "mind",
      cueType: "time",
    },
    {
      emoji: "📓",
      name: "Kunlik refleksiya",
      minimalVersion: "1 ta minnatdorchilik",
      fullVersion: "3 minnatdorchilik + 1 dars",
      scheduledTime: "21:30",
      identityStatement: "Men o'z tajribamdan o'rganaman",
      category: "mind",
      cueType: "time",
    },
  ],
  milestones: [
    { day: 7, label: "Birinchi tinch tong" },
    { day: 30, label: "Stress sezgi pasaygan" },
    { day: 90, label: "Yangi ong holatim" },
  ],
  firstStep: "Bugun 1 daqiqa — faqat nafas oling. Hech nima qilmang.",
});

const personalSystem = () => ({
  weeklyTime: "3-5 soat",
  dailyTime: "30-45 daqiqa",
  habits: [
    {
      emoji: "🌅",
      name: "Erta tong rejimi",
      minimalVersion: "Soat 7:00 da turish",
      fullVersion: "Tong rejimi: suv + harakat + niyat",
      scheduledTime: "07:00",
      identityStatement: "Men kunimni o'zim boshqaraman",
      category: "morning",
      cueType: "time",
    },
    {
      emoji: "🎯",
      name: "Bir asosiy ish",
      minimalVersion: "5 daqiqa fokus",
      fullVersion: "60 daqiqa eng muhim ish",
      scheduledTime: "09:00",
      identityStatement: "Men eng muhimga vaqt ajrataman",
      category: "deep_work",
      cueType: "time",
    },
    {
      emoji: "📓",
      name: "Kunlik xulosa",
      minimalVersion: "1 ta yutuq",
      fullVersion: "Kun xulosasi + ertangi reja",
      scheduledTime: "21:30",
      identityStatement: "Men kunimdan o'rganaman",
      category: "mind",
      cueType: "time",
    },
  ],
  milestones: [
    { day: 7, label: "Yangi rejim shakllangan" },
    { day: 30, label: "Tartib his qilinadi" },
    { day: 66, label: "Avtomatik kun tuzilmasi" },
  ],
  firstStep: "Bugun ertaga 7:00 da soatni qo'ying. Boshlanish shu.",
});

const SYSTEM_BUILDERS = {
  language: languageSystem,
  fitness: fitnessSystem,
  learning: learningSystem,
  writing: writingSystem,
  business: businessSystem,
  health: healthSystem,
  mindset: mindsetSystem,
  personal: personalSystem,
};

// ──────────────────────────────────────────────────
// generateSystem — main entry
// ──────────────────────────────────────────────────
export function generateSystem(goalData) {
  if (!goalData) return null;
  const builder = SYSTEM_BUILDERS[goalData.category] || SYSTEM_BUILDERS.personal;
  const system = builder(goalData);
  return {
    ...system,
    goalCategory: goalData.category,
    goalTitle: goalData.title,
    goalEmoji: goalData.emoji,
    goalLabel: goalData.label,
    timeframe: goalData.timeframe,
  };
}

// ──────────────────────────────────────────────────
// Sentiment / adjustment helpers
// ──────────────────────────────────────────────────
const POSITIVE_KEYWORDS = ["ha", "yaxshi", "rozi", "boshlay", "ok", "okey", "zo'r", "bo'ladi", "xop", "tayyorman", "👍", "ajoyib"];
const NEGATIVE_KEYWORDS = ["yo'q", "yoq", "kech", "kam", "ko'p", "qiyin", "boshqa", "uzgartir", "o'zgartir"];

export function isPositive(text) {
  if (!text) return false;
  const lower = text.toLowerCase().trim();
  return POSITIVE_KEYWORDS.some(kw => lower.includes(kw)) &&
         !NEGATIVE_KEYWORDS.some(kw => lower.includes(kw));
}

// Shift HH:MM by `minutes` (negative = earlier)
function shiftTime(timeStr, minutes) {
  const [h, m] = timeStr.split(":").map(Number);
  let total = h * 60 + m + minutes;
  total = Math.max(0, Math.min(23 * 60 + 59, total));
  const hh = String(Math.floor(total / 60)).padStart(2, "0");
  const mm = String(total % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function adjustSystem(system, feedback) {
  if (!system || !feedback) return system;
  const lower = feedback.toLowerCase();

  let updated = { ...system, habits: system.habits.map(h => ({ ...h })) };

  // "kech vaqt" — kechroqqa surish
  if (lower.includes("kech")) {
    updated.habits = updated.habits.map(h => ({
      ...h,
      scheduledTime: h.scheduledTime ? shiftTime(h.scheduledTime, 90) : h.scheduledTime,
    }));
  }

  // "kam vaqt" — minimal versiyaga o'tish
  if (lower.includes("kam vaqt") || lower.includes("vaqt yo'q") || lower.includes("vaqt yoq")) {
    updated.habits = updated.habits.map(h => ({
      ...h,
      fullVersion: h.minimalVersion, // minimal versiyani asosiy qilamiz
    }));
    updated.dailyTime = "10-15 daqiqa";
    updated.weeklyTime = "1-2 soat";
  }

  // "erta" — ertaroqqa surish
  if (lower.includes("erta") && !lower.includes("ertangi")) {
    updated.habits = updated.habits.map(h => ({
      ...h,
      scheduledTime: h.scheduledTime ? shiftTime(h.scheduledTime, -60) : h.scheduledTime,
    }));
  }

  return updated;
}
