import { useMemo } from "react";
import { motion } from "framer-motion";
import SectionLabel from "@/components/shared/SectionLabel";
import FocusCard, { AllDoneCard } from "./FocusCard";

export default function TodayFocus({ habits, doneHabits, nextBlock, today }) {
  const focus = useMemo(() => {
    // 1. Streak xavfi ostida (5+ kun)
    const atRisk = (habits || []).find(h =>
      !h.completedDates?.includes(today) && (h.streak || 0) > 5,
    );
    if (atRisk) {
      return { type: "streak_risk", habit: atRisk, label: "Streak xavf ostida", urgency: "high" };
    }

    // 2. Keyingi planner bloki
    if (nextBlock) {
      return { type: "next_block", block: nextBlock, label: "Keyingi blok", urgency: "medium" };
    }

    // 3. Bajarilmagan birinchi odat
    const notDone = (habits || []).find(h => !h.completedDates?.includes(today));
    if (notDone) {
      return { type: "habit", habit: notDone, label: "Bugungi odat", urgency: "low" };
    }

    return null;
  }, [habits, doneHabits, nextBlock, today]);

  // Hammasi bajarilgan
  if (!focus && (habits?.length > 0)) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <SectionLabel label="Hozir eng muhim" />
        <div className="mt-2.5">
          <AllDoneCard />
        </div>
      </motion.div>
    );
  }

  if (!focus) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <SectionLabel label="Hozir eng muhim" />
      <div className="mt-2.5">
        <FocusCard focus={focus} today={today} />
      </div>
    </motion.div>
  );
}
