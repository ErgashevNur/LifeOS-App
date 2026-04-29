import { motion } from "framer-motion";
import SectionLabel from "@/components/shared/SectionLabel";
import GoalProgressCard from "./GoalProgressCard";

export default function GoalsSection({ goals }) {
  const activeGoals = (goals || []).slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <SectionLabel label="Maqsadlar" linkTo="/goals" />

      <div className="flex flex-col gap-2.5 mt-2.5">
        {activeGoals.map((goal, i) => (
          <GoalProgressCard key={goal.id} goal={goal} index={i} />
        ))}
      </div>
    </motion.div>
  );
}
