/**
 * Parse duration strings like "20 daq", "2 soat", "10 min" → seconds
 */
export function parseDurationToSeconds(str) {
  if (!str) return 20 * 60;
  const n = parseInt(str, 10);
  if (isNaN(n)) return 20 * 60;
  if (str.includes("soat")) return n * 3600;
  if (str.includes("min") || str.includes("daq")) return n * 60;
  return n * 60;
}

/**
 * Parse to minutes
 */
export function parseDurationToMinutes(str) {
  return parseDurationToSeconds(str) / 60;
}

/**
 * Format seconds → "MM:SS"
 */
export function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
