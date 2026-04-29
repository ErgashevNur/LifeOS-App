/**
 * usePushNotifications — web Notification API wrapper
 * On mobile this would integrate with a native notification service.
 * On web we use the Notification API where supported.
 */
export function usePushNotifications() {
  const requestPermission = async () => {
    if (!("Notification" in window)) return "denied";
    if (Notification.permission === "granted") return "granted";
    if (Notification.permission !== "denied") {
      const result = await Notification.requestPermission();
      return result;
    }
    return Notification.permission;
  };

  /**
   * Schedule a daily notification for a habit.
   * Web can't truly schedule future notifications — we set a timeout for today.
   */
  const scheduleHabitNotification = async (habit) => {
    if (!habit.scheduledTime || habit.cueType !== "time") return;
    const perm = await requestPermission();
    if (perm !== "granted") return;

    const [hours, minutes] = habit.scheduledTime.split(":").map(Number);
    const now = new Date();
    const target = new Date();
    target.setHours(hours, minutes, 0, 0);

    // If time has passed today, skip (would need a service worker for true scheduling)
    const msUntil = target - now;
    if (msUntil < 0) return;

    setTimeout(() => {
      if (Notification.permission !== "granted") return;
      const n = new Notification(`${habit.emoji || "📌"} ${habit.name || habit.title} vaqti`, {
        body: `Minimal: ${habit.minimalVersion || habit.minimalDuration || "5 daqiqa"}`,
        tag: `habit_${habit.id}`,
        requireInteraction: true,
      });
      n.onclick = () => {
        window.focus();
        window.location.href = `/habits?timer=${habit.id}`;
        n.close();
      };
    }, msUntil);
  };

  const cancelHabitNotification = (_habitId) => {
    // Web Notification API doesn't support cancelling scheduled notifications.
    // With a service worker + Push API this would call pushManager.getSubscription().unsubscribe()
  };

  return { scheduleHabitNotification, cancelHabitNotification, requestPermission };
}
