import { useState, useCallback } from "react";
import { checkNewMilestone } from "@/lib/streakEngine";
import { MILESTONE_CONFIG } from "@/lib/milestoneConfig";

/**
 * Manages milestone modal visibility.
 * Call checkAndTrigger(habit, newStreak) after completing a habit.
 */
export function useMilestones() {
  const [pendingMilestone, setPendingMilestone] = useState(null); // { habit, milestone, config }

  const checkAndTrigger = useCallback((habit, newStreak) => {
    const achieved = habit.achievedMilestones || [];
    const milestone = checkNewMilestone(newStreak, achieved);
    if (milestone && MILESTONE_CONFIG[milestone]) {
      setPendingMilestone({ habit, milestone, config: MILESTONE_CONFIG[milestone] });
    }
  }, []);

  const dismissMilestone = useCallback(() => setPendingMilestone(null), []);

  return { pendingMilestone, checkAndTrigger, dismissMilestone };
}
