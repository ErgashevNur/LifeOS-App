// identityTracker.js — har bajarilgan odat identitet sanoqchini oshiradi
// "Men yuguruvchi insonman" — siz 47-marta shu insondek harakat qildingiz
//
// localStorage da saqlanadi:
//   lifeos.identityCounts → { "yuguruvchi inson": 47, "o'qiyotgan inson": 89 }

const STORAGE_KEY = "lifeos.identityCounts";

function readMap() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeMap(m) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(m));
  } catch {
    // ignore
  }
}

// "Men yuguruvchi insonman" → "yuguruvchi inson"
function normalizeIdentity(statement) {
  if (!statement) return "";
  let s = statement.trim().toLowerCase();
  s = s.replace(/^men\s+[—-]\s*/i, "");
  s = s.replace(/^men\s+/i, "");
  s = s.replace(/\s+(man|kishiman|insonman)$/i, " inson");
  return s.trim();
}

// Identitet sanog'ini oshirish (habit complete bo'lganda chaqiriladi)
export function recordIdentityAction(identityStatement) {
  const key = normalizeIdentity(identityStatement);
  if (!key) return null;
  const map = readMap();
  const next = (map[key] || 0) + 1;
  map[key] = next;
  writeMap(map);
  return { identity: key, count: next, statement: identityStatement };
}

// Hozirgi sanog'ini olish (oshirmasdan)
export function getIdentityCount(identityStatement) {
  const key = normalizeIdentity(identityStatement);
  if (!key) return 0;
  return readMap()[key] || 0;
}

// Barcha identitetlarni olish (Identity dashboard uchun)
export function getAllIdentities() {
  const map = readMap();
  return Object.entries(map)
    .map(([identity, count]) => ({ identity, count }))
    .sort((a, b) => b.count - a.count);
}

// Reinforcement matnini yaratish (notification/UI uchun)
export function buildReinforcementMessage({ identity, count, statement }) {
  if (!identity || !count) return null;

  // Milestone xabarlari
  if (count === 1) {
    return `🌱 Birinchi qadam — siz endi ${identity} bo'lish yo'lidasiz`;
  }
  if (count === 7) {
    return `✨ 7 marta — ${identity} bo'lish odatga aylana boshladi`;
  }
  if (count === 21) {
    return `🔥 21 marta — siz haqiqatan ham ${identity}siz`;
  }
  if (count === 50) {
    return `🏆 50 marta — bu sizning shaxsiyatingiz, vaqtinchalik harakat emas`;
  }
  if (count === 100) {
    return `💎 100 marta! Siz ${identity} sifatida tug'ilgansiz`;
  }
  if (count % 50 === 0) {
    return `${count} marta ${identity} sifatida harakat qildingiz`;
  }

  // Default
  return `Siz bugun ${count}-marta ${identity} sifatida harakat qildingiz`;
}
