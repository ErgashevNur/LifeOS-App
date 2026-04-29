import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

import Step1Name      from "./steps/Step1Name";
import Step2Identity  from "./steps/Step2Identity";
import Step3Minimal   from "./steps/Step3Minimal";
import Step4Cue       from "./steps/Step4Cue";
import Step5Frequency from "./steps/Step5Frequency";
import Step6Stack     from "./steps/Step6Stack";
import Step7Why       from "./steps/Step7Why";
import Step8Reward    from "./steps/Step8Reward";
import Step9Review    from "./steps/Step9Review";

/* ─── Constants ──────────────────────────────────────────────────── */

const TOTAL = 9;

const STEP_TITLES = [
  "Odat nomi",
  "Identitet",
  "Minimal versiya",
  "Trigger / Cue",
  "Chastota",
  "Habit Stacking",
  "3× Nima uchun?",
  "Mukofot",
  "Ko'rib chiqish",
];

const INITIAL_DATA = {
  emoji: "✨",
  name: "",
  category: "",
  identityStatement: "",
  fullVersion: "",
  minimalVersion: "",
  minimalDuration: "2 daq",
  cueType: "",
  cueValue: "",
  location: "",
  afterCue: "",
  frequency: "daily",
  customDays: [1, 2, 3, 4, 5, 6, 0],
  timeOfDay: "",
  linkedHabit: null,
  whys: ["", "", ""],
  rewardType: "",
  rewardDescription: "",
  milestoneRewards: { "7": "", "30": "", "100": "" },
};

/* ─── Validation ─────────────────────────────────────────────────── */

function canProceed(step, data) {
  switch (step) {
    case 1: return data.name?.trim().length > 1 && data.category?.length > 0;
    case 2: return data.identityStatement?.trim().length > 2;
    case 3: return data.minimalVersion?.trim().length > 1;
    case 4: return data.cueType?.length > 0;
    default: return true;
  }
}

/* ─── Step animation variants ────────────────────────────────────── */

const variants = {
  initial: dir => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  animate: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 380, damping: 36 },
  },
  exit: dir => ({
    opacity: 0,
    x: dir > 0 ? -40 : 40,
    transition: { duration: 0.18 },
  }),
};

/* ─── Component ──────────────────────────────────────────────────── */

export default function HabitBuilder({ onSave, onCancel, existingHabits = [] }) {
  const [step, setStep]           = useState(1);
  const [direction, setDirection] = useState(1);
  const [data, setData]           = useState(INITIAL_DATA);

  const update = updates => setData(prev => ({ ...prev, ...updates }));

  const goNext = () => {
    if (!canProceed(step, data)) return;
    if (step === TOTAL) {
      onSave({
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        streak: 0,
        completedDates: [],
        ...data,
      });
      return;
    }
    setDirection(1);
    setStep(s => s + 1);
  };

  const goPrev = () => {
    if (step === 1) return;
    setDirection(-1);
    setStep(s => s - 1);
  };

  const ok = canProceed(step, data);

  const stepProps = { data, onChange: update };

  const STEPS = [
    <Step1Name      key={1} {...stepProps} />,
    <Step2Identity  key={2} {...stepProps} />,
    <Step3Minimal   key={3} {...stepProps} />,
    <Step4Cue       key={4} {...stepProps} />,
    <Step5Frequency key={5} {...stepProps} />,
    <Step6Stack     key={6} {...stepProps} existingHabits={existingHabits} />,
    <Step7Why       key={7} {...stepProps} />,
    <Step8Reward    key={8} {...stepProps} />,
    <Step9Review    key={9} data={data} />,
  ];

  return (
    <div className="flex flex-col h-full bg-[#F5F5F4]">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 h-14 bg-white border-b border-black/[0.06] shrink-0">
        <button
          type="button"
          onClick={onCancel}
          className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-zinc-100 transition-colors"
        >
          <X className="w-4 h-4 text-zinc-500" strokeWidth={2} />
        </button>

        <p className="text-[13px] font-bold text-zinc-900">{STEP_TITLES[step - 1]}</p>

        <span className="text-[11px] font-semibold text-zinc-400 w-8 text-right">
          {step}/{TOTAL}
        </span>
      </div>

      {/* ── Progress bar ── */}
      <div className="flex gap-0.5 px-5 py-3 bg-white border-b border-black/[0.04] shrink-0">
        {Array.from({ length: TOTAL }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "flex-1 h-1 rounded-full transition-all duration-300",
              i + 1 <  step ? "bg-violet-400" :
              i + 1 === step ? "bg-violet-600" :
                               "bg-black/[0.08]"
            )}
          />
        ))}
      </div>

      {/* ── Step content ── */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {STEPS[step - 1]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Footer ── */}
      <div className="px-5 py-4 bg-white border-t border-black/[0.06] shrink-0">
        <div className="flex items-center justify-between">

          {/* Back */}
          <button
            type="button"
            onClick={goPrev}
            disabled={step === 1}
            className={cn(
              "flex items-center gap-1 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all",
              step === 1
                ? "text-zinc-300 cursor-not-allowed"
                : "text-zinc-600 hover:bg-zinc-100"
            )}
          >
            <ChevronLeft className="w-4 h-4" />
            Orqaga
          </button>

          {/* Dot nav */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: TOTAL }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i + 1 === step ? "w-4 bg-violet-600" :
                  i + 1 <  step ? "w-1.5 bg-violet-300" :
                                   "w-1.5 bg-black/10"
                )}
              />
            ))}
          </div>

          {/* Next / Save */}
          <button
            type="button"
            onClick={goNext}
            disabled={!ok}
            className={cn(
              "px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all",
              ok
                ? "bg-violet-600 text-white hover:bg-violet-700 active:scale-[0.97]"
                : "bg-black/[0.06] text-zinc-400 cursor-not-allowed"
            )}
          >
            {step === TOTAL ? "Saqlash" : "Davom →"}
          </button>

        </div>
      </div>
    </div>
  );
}
