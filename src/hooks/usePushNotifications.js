/**
 * usePushNotifications — web Notification API wrapper
 *
 * Features:
 *  - T-5 minute advance warning before habit time
 *  - Exact-time notification with Cloudy AI personalized text
 *  - 21:00 streak danger alert for uncompleted habits
 */
import { notificationText } from "@/lib/cloudyAI";

// Track active timeouts so we can clear them on re-schedule
const _timers = new Map(); // habitId → [timeoutId, ...]

function clearTimers(habitId) {
  const ids = _timers.get(habitId) || [];
  ids.forEach(id => clearTimeout(id));
  _timers.set(habitId, []);
}

function addTimer(habitId, id) {
  const ids = _timers.get(habitId) || [];
  _timers.set(habitId, [...ids, id]);
}

function msUntil(hours, minutes, seconds = 0) {
  const now = new Date();
  const target = new Date();
  target.setHours(hours, minutes, seconds, 0);
  return target - now;
}

export function usePushNotifications() {
  const requestPermission = async () => {
    if (!("Notification" in window)) return "denied";
    if (Notification.permission === "granted") return "granted";
    if (Notification.permission !== "denied") {
      return await Notification.requestPermission();
    }
    return Notification.permission;
  };

  /**
   * Schedule smart notifications for a single habit.
   * - T-5: quick prep reminder
   * - T+0: Cloudy AI personalized text
   */
  const scheduleHabitNotification = async (habit) => {
    const timeStr = habit.cueValue || habit.scheduledTime;
    if (!timeStr || habit.cueType !== "time") return;

    const perm = await requestPermission();
    if (perm !== "granted") return;

    const [hours, minutes] = timeStr.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) return;

    clearTimers(habit.id);

    // ── T-5 min: prep reminder ─────────────────────────────
    const msFull = msUntil(hours, minutes);
    const msPrep = msFull - 5 * 60 * 1000; // exactly 5 minutes before

    if (msPrep > 0) {
      const tid = setTimeout(() => {
        if (Notification.permission !== "granted") return;
        new Notification(
          `⏱️ 5 daqiqada — ${habit.emoji || "📌"} ${habit.name}`,
          {
            body: habit.location
              ? `${habit.location}ga boring`
              : `Tayyor bo'ling: ${habit.minimalVersion || "minimal versiya"}`,
            tag: `prep_${habit.id}`,
            silent: true,
          }
        );
      }, msPrep);
      addTimer(habit.id, tid);
    }

    // ── T+0: main notification with Cloudy AI text ─────────
    if (msFull > 0) {
      const tid = setTimeout(async () => {
        if (Notification.permission !== "granted") return;

        const body = await notificationText({
          habit,
          streak: habit.streak || 0,
          currentTime: timeStr,
        });

        const n = new Notification(
          `${habit.emoji || "📌"} ${habit.name}`,
          {
            body,
            tag: `habit_${habit.id}`,
            requireInteraction: true,
          }
        );
        n.onclick = () => {
          window.focus();
          window.location.href = `/habits?open=${habit.id}`;
          n.close();
        };
      }, msFull);
      addTimer(habit.id, tid);
    }
  };

  /**
   * Schedule 21:00 streak danger alerts for habits not yet completed today.
   * Call this on app load, passing only habits that haven't been checked in today.
   */
  const scheduleStreakDangerAlerts = async (uncompletedHabits) => {
    if (!uncompletedHabits?.length) return;
    const perm = await requestPermission();
    if (perm !== "granted") return;

    const ms = msUntil(21, 0);
    if (ms <= 0) return; // already past 21:00

    const tid = setTimeout(() => {
      if (Notification.permission !== "granted") return;

      // Group into one notification to avoid spam
      const names = uncompletedHabits.map(h => `${h.emoji || "📌"} ${h.name}`).join(", ");
      const streakAtRisk = uncompletedHabits.filter(h => (h.streak || 0) >= 3);

      const title = streakAtRisk.length
        ? `🔥 ${streakAtRisk.length} ta streak xavf ostida!`
        : `🌙 Bugungi odatlar bajarilmagan`;

      const n = new Notification(title, {
        body: names,
        tag: "streak_danger_21",
        requireInteraction: true,
      });
      n.onclick = () => {
        window.focus();
        window.location.href = "/goals";
        n.close();
      };
    }, ms);

    // Store under a special key
    const ids = _timers.get("__streak_danger__") || [];
    _timers.set("__streak_danger__", [...ids, tid]);
  };

  const cancelHabitNotification = (habitId) => {
    clearTimers(habitId);
  };

  const cancelStreakDangerAlerts = () => {
    const ids = _timers.get("__streak_danger__") || [];
    ids.forEach(id => clearTimeout(id));
    _timers.set("__streak_danger__", []);
  };

  return {
    requestPermission,
    scheduleHabitNotification,
    scheduleStreakDangerAlerts,
    cancelHabitNotification,
    cancelStreakDangerAlerts,
  };
}
