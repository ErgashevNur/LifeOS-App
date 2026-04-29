// dashboardEngine.js — Dashboard uchun Cloudy xabarini generatsiya qiladi
// + kichik sana yordamchilari (date-fns o'rniga)

// ─── Date helpers (date-fns o'rniga) ─────────────────────────────────
export function formatDate(date, pattern) {
  const d = date instanceof Date ? date : new Date(date);
  if (pattern === "yyyy-MM-dd") {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }
  if (pattern === "HH:mm") {
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }
  if (pattern === "d") {
    return String(d.getDate());
  }
  if (pattern === "MMMM, eeee") {
    return `${UZ_MONTHS[d.getMonth()]}, ${UZ_DAYS_LONG[d.getDay()]}`;
  }
  return d.toISOString();
}

export function parseISODate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}

export function differenceInDaysFrom(targetDate, fromDate = new Date()) {
  if (!targetDate) return 0;
  const target = targetDate instanceof Date ? targetDate : parseISODate(targetDate);
  if (!target) return 0;
  const ms = target.getTime() - fromDate.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

// O'zbek oy va kun nomlari
const UZ_MONTHS = [
  "yanvar", "fevral", "mart", "aprel", "may", "iyun",
  "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr",
];
const UZ_DAYS_LONG = [
  "yakshanba", "dushanba", "seshanba", "chorshanba",
  "payshanba", "juma", "shanba",
];

// ─── Cloudy dashboard xabari ──────────────────────────────────────────
export function generateDashboardMessage({
  user, goals, habits, todayHabits, doneHabits,
  nextBlock, hour, today,
}) {
  const name = user?.name || "";
  const doneCount = doneHabits?.length || 0;
  const totalCount = todayHabits?.length || 0;
  const allDone = doneCount === totalCount && totalCount > 0;

  // Streak xavfi
  const atRiskHabit = (habits || []).find(h =>
    !h.completedDates?.includes(today) && (h.streak || 0) >= 7,
  );

  // Maqsad orqada qolmoqda
  const atRiskGoal = (goals || []).find(g => {
    if (!g.deadline) return false;
    const daysLeft = differenceInDaysFrom(g.deadline);
    const daysTotal = g.timeframeDays || g.timeframe?.value
      ? (g.timeframe?.value || 0) * (g.timeframe?.unit === "month" ? 30 : g.timeframe?.unit === "week" ? 7 : 1)
      : 90;
    if (daysTotal <= 0) return false;
    const timePct = 1 - daysLeft / daysTotal;
    return ((g.progress || 0) / 100) < timePct - 0.2;
  });

  // ─── Ertalab (05–11) ───
  if (hour >= 5 && hour < 12) {
    if (atRiskHabit) {
      return `${name ? name + ", " : ""}${atRiskHabit.emoji || ""} ${atRiskHabit.name} — ${atRiskHabit.streak} kunlik streak. Bugun ham davom ettiramizmi?`;
    }
    if (nextBlock) {
      return `${name ? name + ", " : ""}bugungi birinchi blok ${nextBlock.startTime} da: ${nextBlock.emoji || ""} ${nextBlock.label}.`;
    }
    return `${name ? "Xayrli tong, " + name + "." : "Xayrli tong."} Bugun ${totalCount} ta odat kutmoqda.`;
  }

  // ─── Tush (12–17) ───
  if (hour >= 12 && hour < 17) {
    if (allDone) {
      return `${doneCount}/${totalCount} bajarildi. Ajoyib. Kechqurun ham shunday davom eting.`;
    }
    if (doneCount > 0) {
      return `${doneCount}/${totalCount} bajarildi.${nextBlock ? ` Keyingi: ${nextBlock.startTime} da ${nextBlock.label}.` : " Davom eting."}`;
    }
    if (atRiskGoal) {
      return `${atRiskGoal.emoji || ""} ${atRiskGoal.title} maqsadi orqada qolmoqda. Bugun bitta qadam?`;
    }
    return `Hali hech narsa bajarilmadi. Minimal versiyadan boshlasak ham bo'ladi.`;
  }

  // ─── Kechqurun (17–22) ───
  if (hour >= 17 && hour < 22) {
    if (allDone) {
      return `Bugun ${doneCount}/${totalCount} — hammasi bajarildi. 🔥 Ajoyib kun.`;
    }
    if (doneCount === 0) {
      return `Bugun hali boshlanmadi. Eng kichik narsa — ${todayHabits?.[0]?.minimalVersion || "bitta qadam"}?`;
    }
    const remaining = totalCount - doneCount;
    return `${doneCount} bajarildi, ${remaining} ta qoldi. Kechga ulguramizmi?`;
  }

  // ─── Kech kechqurun (22+ va 00-04) ───
  return allDone
    ? `Bugun juda yaxshi bo'ldi. Ertaga ham shu ruhda. Yaxshi tunlar${name ? ", " + name : ""}.`
    : `Bugun ${doneCount}/${totalCount}. Erta ertaga yangi imkoniyat. Yaxshi tunlar.`;
}
