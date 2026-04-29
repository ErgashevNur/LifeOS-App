// cloudyAI.js — Claude API wrapper (Cloudy = AI coach)
// Browser-direct fetch. Production uchun proxy server tavsiya qilinadi.
//
// .env: VITE_ANTHROPIC_API_KEY=sk-ant-...
// API key bo'lmasa — fallback rejimida ishlaydi (parseGoal/generateSystem).

import { parseGoal as fallbackParse, generateSystem as fallbackGenerate } from "./goalParser";

const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-6";
const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

export const isCloudyEnabled = () => Boolean(API_KEY);

// ─────────────────────────────────────────────
// Low-level call
// ─────────────────────────────────────────────
async function callClaude({ system, messages, maxTokens = 1024, temperature = 0.7 }) {
  if (!API_KEY) throw new Error("CLOUDY_DISABLED");

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      temperature,
      system,
      messages,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Claude API ${res.status}: ${text}`);
  }
  const data = await res.json();
  return data.content?.[0]?.text || "";
}

// JSON javobni xavfsiz parse qilish (Claude ba'zan ```json ... ``` ko'rinishida qaytaradi)
function extractJSON(text) {
  if (!text) return null;
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fence ? fence[1] : text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────
// 1. analyzeGoal — chuqur tahlil
//    Foydalanuvchi yozgan maqsadni tushunadi va kerak bo'lsa savol qaytaradi
// ─────────────────────────────────────────────
const ANALYZE_SYSTEM = `Sen "Cloudy" — LifeOS ilovasidagi AI hayot kouchsan. Vazifang: foydalanuvchining maqsadini chuqur tushunish.

QOIDALAR:
1. JAVOB FAQAT JSON formatida
2. Foydalanuvchining maqsadi noaniq bo'lsa, "needsClarification: true" va 1-2 ta aniq, qisqa savol qaytar
3. Aniq bo'lsa, "needsClarification: false" va parsed ma'lumot qaytar
4. Til: O'zbek tili (lotin)
5. Soddalik: hech qachon 2 dan ortiq savol qo'yma

JSON sxemasi:
{
  "needsClarification": boolean,
  "clarifyingQuestions": ["savol1", "savol2"],  // agar needsClarification true
  "parsed": {
    "title": "qisqa, aniq sarlavha (≤60 belgi)",
    "category": "language|fitness|learning|writing|business|health|mindset|personal",
    "emoji": "bitta emoji",
    "label": "kategoriya nomi o'zbekcha",
    "timeframe": { "value": number, "unit": "month|week|day", "label": "3 oy" },
    "motivation": "Cloudy bergan baho — nega bu maqsad muhim",
    "warning": "agar mavjud bo'lsa: real bo'lmagan vaqt yoki noaniqlik haqida (qisqa)"
  }
}`;

export async function analyzeGoal(text, conversationHistory = []) {
  if (!isCloudyEnabled()) {
    const parsed = fallbackParse(text);
    return {
      needsClarification: false,
      parsed: parsed && {
        ...parsed,
        motivation: "Maqsadingiz qabul qilindi.",
        warning: null,
      },
      _fallback: true,
    };
  }

  try {
    const messages = [
      ...conversationHistory,
      { role: "user", content: text },
    ];
    const reply = await callClaude({
      system: ANALYZE_SYSTEM,
      messages,
      maxTokens: 800,
      temperature: 0.6,
    });
    const json = extractJSON(reply);
    if (!json) throw new Error("Invalid JSON from Cloudy");
    return json;
  } catch (err) {
    console.warn("[Cloudy] analyzeGoal failed → fallback:", err.message);
    const parsed = fallbackParse(text);
    return {
      needsClarification: false,
      parsed: parsed && { ...parsed, motivation: "", warning: null },
      _fallback: true,
      _error: err.message,
    };
  }
}

// ─────────────────────────────────────────────
// 2. generateSystem — shaxsiy odat tizimi
// ─────────────────────────────────────────────
const SYSTEM_GEN_PROMPT = `Sen "Cloudy" — habit-design eksperti. Foydalanuvchining maqsadiga **shaxsiylashtirilgan** tizim tuz.

ASOSLAR (BJ Fogg, James Clear):
- Har odatda implementation intention bo'lsin (vaqt + joy + cue)
- "Two-minute rule": minimalVersion juda kichik bo'lsin (1-5 daq)
- Identity-based: identityStatement "Men ... kishiman" formatida
- Habit stacking imkoniyati: cueValue oldingi odatga ulanish

QOIDALAR:
1. JAVOB FAQAT JSON
2. 2-4 ta odat (ko'p emas — focus muhim)
3. Milestonelar realistik: 7-kun, 30-kun, oxirgi kun
4. firstStep — bugun shu daqiqada bajariladigan ishtirok
5. Til: O'zbek (lotin), iliq, motivatsion

JSON sxemasi:
{
  "weeklyTime": "5-7 soat",
  "dailyTime": "30-45 daqiqa",
  "habits": [
    {
      "emoji": "📖",
      "name": "Odat nomi",
      "minimalVersion": "2 daqiqali versiya (kasal kunlar uchun)",
      "fullVersion": "to'liq versiya",
      "scheduledTime": "07:30",
      "location": "Oshxonada / Stol oldida / ...",
      "afterCue": "Kofeni quygandan keyin / Tishimni yuvgandan keyin",
      "identityStatement": "Men ... kishiman",
      "category": "mind|health|deep_work|morning",
      "cueType": "time"
    }
  ],
  "milestones": [
    { "day": 7, "label": "...", "description": "..." },
    { "day": 30, "label": "...", "description": "..." },
    { "day": 90, "label": "...", "description": "..." }
  ],
  "firstStep": "Bugun aynan hozir bajariladigan eng kichik qadam",
  "philosophy": "1-2 jumla — nega bu tizim aynan shu odamga ishlaydi"
}`;

export async function generateSystem(goalData, userContext = {}) {
  if (!isCloudyEnabled() || !goalData) {
    const sys = fallbackGenerate(goalData);
    return sys && { ...sys, _fallback: true };
  }

  try {
    const userMsg = `Maqsad: ${goalData.title}
Kategoriya: ${goalData.category}
Vaqt: ${goalData.timeframe?.label || "3 oy"}
Motivatsiya: ${goalData.motivation || "—"}
${userContext.energy ? `Energiya darajasi: ${userContext.energy}/5` : ""}
${userContext.busyLevel ? `Bandlik: ${userContext.busyLevel}` : ""}

Shu maqsad uchun shaxsiy tizim tuzing.`;

    const reply = await callClaude({
      system: SYSTEM_GEN_PROMPT,
      messages: [{ role: "user", content: userMsg }],
      maxTokens: 2000,
      temperature: 0.7,
    });
    const json = extractJSON(reply);
    if (!json || !Array.isArray(json.habits)) throw new Error("Invalid system JSON");

    return {
      ...json,
      goalCategory: goalData.category,
      goalTitle: goalData.title,
      goalEmoji: goalData.emoji,
      goalLabel: goalData.label,
      timeframe: goalData.timeframe,
    };
  } catch (err) {
    console.warn("[Cloudy] generateSystem failed → fallback:", err.message);
    const sys = fallbackGenerate(goalData);
    return sys && { ...sys, _fallback: true, _error: err.message };
  }
}

// ─────────────────────────────────────────────
// 3. dailyMessage — kontekstli kun xabari (dashboard, push)
// ─────────────────────────────────────────────
export async function dailyMessage({ time, mood, streaks, todayHabits, missedYesterday }) {
  if (!isCloudyEnabled()) return null;

  try {
    const ctx = `Vaqt: ${time}
Ruhiy holat: ${mood || "noma'lum"}
Bugungi odatlar: ${(todayHabits || []).map(h => h.name).join(", ") || "yo'q"}
Aktiv streaklar: ${(streaks || []).map(s => `${s.name}(${s.days}k)`).join(", ") || "yo'q"}
Kecha o'tkazilgan: ${missedYesterday ? "ha" : "yo'q"}`;

    const reply = await callClaude({
      system: `Sen Cloudy — yumshoq, ilhom beruvchi AI hayot kouch. 1-2 jumla, o'zbek tilida (lotin), iliq, do'stona ohang. ☁️ emoji bilan boshla. Maqtab tashlama, lekin samimiy bo'l.`,
      messages: [{ role: "user", content: ctx }],
      maxTokens: 200,
      temperature: 0.85,
    });
    return reply.trim();
  } catch (err) {
    console.warn("[Cloudy] dailyMessage failed:", err.message);
    return null;
  }
}

// ─────────────────────────────────────────────
// 4. recoveryMessage — odam o'tkazib yuborganda
// ─────────────────────────────────────────────
export async function recoveryMessage({ habitName, daysMissed, identityStatement }) {
  if (!isCloudyEnabled()) return null;

  try {
    const reply = await callClaude({
      system: `Sen Cloudy — rahmdil AI kouch. Foydalanuvchi odat o'tkazib yubordi. Vazifa: AYBLAMA, qo'rqitma. "Never miss twice" prinsipi: ertaga 2 daqiqali minimal versiya bilan qaytishni taklif qil. 2-3 jumla, o'zbekcha (lotin), juda iliq.`,
      messages: [{
        role: "user",
        content: `Odat: ${habitName}\nO'tkazilgan kunlar: ${daysMissed}\nIdentitet: ${identityStatement || "—"}`,
      }],
      maxTokens: 250,
      temperature: 0.8,
    });
    return reply.trim();
  } catch (err) {
    return null;
  }
}

// ─────────────────────────────────────────────
// 5. notificationText — kontekstli push matn
// ─────────────────────────────────────────────
export async function notificationText({ habit, streak, currentTime }) {
  if (!isCloudyEnabled()) {
    return `${habit.emoji} ${habit.name} — vaqti keldi`;
  }

  try {
    const reply = await callClaude({
      system: `Sen Cloudy — push notification yozuvchi. 1 jumla, ≤80 belgi, o'zbekcha (lotin). Identitet bilan ulang. Qo'rqituvchi emas, ilhomli.`,
      messages: [{
        role: "user",
        content: `Odat: ${habit.name}\nMinimal: ${habit.minimalVersion}\nIdentitet: ${habit.identityStatement}\nStreak: ${streak} kun\nVaqt: ${currentTime}`,
      }],
      maxTokens: 100,
      temperature: 0.85,
    });
    return reply.trim().replace(/^["']|["']$/g, "");
  } catch {
    return `${habit.emoji} ${habit.name} — ${habit.minimalVersion}`;
  }
}
