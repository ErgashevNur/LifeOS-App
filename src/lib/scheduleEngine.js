/* ═══════════════════════════════════════════════════════════════════
   scheduleEngine.js — pure functions, no side-effects
   Used inside useMemo() only.
   ═══════════════════════════════════════════════════════════════════ */

/**
 * Add minutes to a "HH:MM" string. Returns "HH:MM".
 */
export function addMinutes(time, mins) {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + mins;
  const clampedH = Math.min(Math.floor(total / 60), 23);
  const clampedM = total % 60;
  return `${String(clampedH).padStart(2, "0")}:${String(clampedM).padStart(2, "0")}`;
}

/**
 * Compare two "HH:MM" strings. Returns negative / 0 / positive.
 */
function cmpTime(a, b) {
  return a.localeCompare(b);
}

/**
 * Build enriched block list for a specific date.
 * Joins plannedBlocks with habits and tasks, then sorts by startTime.
 */
export function buildTodayBlocks(plannedBlocks, habits, tasks, date) {
  return plannedBlocks
    .filter(b => b.date === date)
    .map(b => {
      if (b.type === "habit") {
        const habit = habits.find(h => h.id === b.refId);
        return {
          ...b,
          habit,
          label: habit?.name || habit?.title || "Odat",
          emoji: habit?.emoji || "📌",
          color: "violet",
        };
      } else {
        const task = tasks.find(t => t.id === b.refId);
        return {
          ...b,
          task,
          label: task?.title || "Vazifa",
          emoji: task?.emoji || "📋",
          color: "neutral",
        };
      }
    })
    .sort((a, b) => cmpTime(a.startTime, b.startTime));
}

/**
 * Detect overlapping blocks.
 * Two blocks conflict when: a.startTime < b.endTime AND b.startTime < a.endTime
 */
export function detectConflicts(blocks) {
  const conflicts = [];
  for (let i = 0; i < blocks.length - 1; i++) {
    for (let j = i + 1; j < blocks.length; j++) {
      const a = blocks[i];
      const b = blocks[j];
      if (
        cmpTime(a.startTime, b.endTime) < 0 &&
        cmpTime(b.startTime, a.endTime) < 0
      ) {
        conflicts.push({ block1: a, block2: b });
      }
    }
  }
  return conflicts;
}

/**
 * Calculate free slots between dayStart and dayEnd.
 * Returns array of { startTime, endTime, durationMinutes }.
 */
export function calcFreeSlots(blocks, dayStart = "06:00", dayEnd = "23:00") {
  if (blocks.length === 0) {
    const start = timeToMins(dayStart);
    const end = timeToMins(dayEnd);
    return [
      {
        startTime: dayStart,
        endTime: dayEnd,
        durationMinutes: end - start,
      },
    ];
  }

  const sorted = [...blocks].sort((a, b) => cmpTime(a.startTime, b.startTime));
  const slots = [];
  let cursor = dayStart;

  for (const block of sorted) {
    if (cmpTime(cursor, block.startTime) < 0) {
      const dur = timeToMins(block.startTime) - timeToMins(cursor);
      if (dur >= 5) {
        slots.push({
          startTime: cursor,
          endTime: block.startTime,
          durationMinutes: dur,
        });
      }
    }
    if (cmpTime(cursor, block.endTime) < 0) {
      cursor = block.endTime;
    }
  }

  // Remaining slot after last block
  if (cmpTime(cursor, dayEnd) < 0) {
    const dur = timeToMins(dayEnd) - timeToMins(cursor);
    if (dur >= 5) {
      slots.push({
        startTime: cursor,
        endTime: dayEnd,
        durationMinutes: dur,
      });
    }
  }

  return slots;
}

/**
 * Suggest the first free slot that fits the task's estimated duration.
 */
export function suggestSlot(task, freeSlots) {
  const needed = task?.estimatedMinutes || 30;
  return freeSlots.find(s => s.durationMinutes >= needed) || null;
}

/**
 * Build plannedBlocks for a habit across the next N days.
 * Only runs when cueType === "time".
 */
export function buildHabitBlocks(habit, daysAhead = 30) {
  const time = habit.scheduledTime || habit.cueValue || habit.cue;
  if (!time) return [];
  const duration = parseDuration(habit.minimalDuration || "20 daq");
  const endTime = addMinutes(time, duration);
  const activeDays = habit.customDays || [0, 1, 2, 3, 4, 5, 6];
  const blocks = [];

  const today = new Date();
  for (let i = 0; i < daysAhead; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    // JS getDay(): 0=Sun,1=Mon,...6=Sat
    if (activeDays.includes(d.getDay())) {
      const dateStr = d.toISOString().slice(0, 10);
      blocks.push({
        id: `${habit.id}-${dateStr}`,
        type: "habit",
        refId: habit.id,
        date: dateStr,
        startTime: time,
        endTime,
        locked: true,
        done: false,
      });
    }
  }
  return blocks;
}

/* ── Helpers ─────────────────────────────────────────────────────── */

function timeToMins(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function parseDuration(str) {
  // "2 daq" → 2, "20 daq" → 20, "1 soat" → 60
  if (!str) return 20;
  const n = parseInt(str, 10);
  if (str.includes("soat")) return n * 60;
  return isNaN(n) ? 20 : n;
}
