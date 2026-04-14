import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Play,
  Pause,
  RotateCcw,
  Clock,
  Zap,
  Target,
  Check,
  X,
  Brain,
  Timer,
  Coffee,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ── Session type presets ─────────────────────────────────────────────────────
const SESSION_TYPES = [
  { id: "pomodoro", label: "Pomodoro", work: 25, rest: 5, icon: Timer },
  { id: "deep", label: "Deep Work", work: 50, rest: 10, icon: Brain },
  { id: "study", label: "Study Block", work: 90, rest: 15, icon: Target },
  { id: "custom", label: "Custom", work: 25, rest: 5, icon: Zap },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatClockTime(date) {
  return date.toLocaleTimeString("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

// ── SVG circular progress ────────────────────────────────────────────────────
const CIRCLE_RADIUS = 140;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

function TimerCircle({ progress, isRunning, isBreak }) {
  const offset = CIRCLE_CIRCUMFERENCE * (1 - progress);

  return (
    <svg
      width="320"
      height="320"
      viewBox="0 0 320 320"
      className="absolute inset-0 m-auto"
    >
      {/* Background track */}
      <circle
        cx="160"
        cy="160"
        r={CIRCLE_RADIUS}
        fill="none"
        stroke={isBreak ? "#e2e8f0" : "#f1f5f9"}
        strokeWidth="6"
      />
      {/* Progress arc */}
      <motion.circle
        cx="160"
        cy="160"
        r={CIRCLE_RADIUS}
        fill="none"
        stroke={isBreak ? "#94a3b8" : "#0f172a"}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={CIRCLE_CIRCUMFERENCE}
        strokeDashoffset={offset}
        transform="rotate(-90 160 160)"
        initial={false}
        animate={
          isRunning
            ? {
                filter: [
                  "drop-shadow(0 0 4px rgba(15,23,42,0.15))",
                  "drop-shadow(0 0 8px rgba(15,23,42,0.25))",
                  "drop-shadow(0 0 4px rgba(15,23,42,0.15))",
                ],
              }
            : { filter: "drop-shadow(0 0 0px rgba(15,23,42,0))" }
        }
        transition={
          isRunning
            ? { duration: 3, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.5 }
        }
      />
    </svg>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function FocusPage() {
  // ── State ────────────────────────────────────────────────────────────────
  const [selectedType, setSelectedType] = useState("pomodoro");
  const [customWork, setCustomWork] = useState(25);
  const [customRest, setCustomRest] = useState(5);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [currentTask, setCurrentTask] = useState("");
  const [sessions, setSessions] = useState([]);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showComplete, setShowComplete] = useState(false);

  const intervalRef = useRef(null);

  // ── Derived values ───────────────────────────────────────────────────────
  const activePreset = SESSION_TYPES.find((t) => t.id === selectedType);
  const workMinutes =
    selectedType === "custom" ? customWork : activePreset.work;
  const restMinutes =
    selectedType === "custom" ? customRest : activePreset.rest;
  const totalSeconds = isBreak ? restMinutes * 60 : workMinutes * 60;
  const progress = totalSeconds > 0 ? timeLeft / totalSeconds : 0;

  const todaySessions = useMemo(
    () => sessions.filter((s) => s.date === getTodayKey()),
    [sessions],
  );

  const todayMinutes = useMemo(
    () => todaySessions.reduce((sum, s) => sum + s.duration, 0),
    [todaySessions],
  );

  const weekMinutes = useMemo(() => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    return sessions
      .filter((s) => new Date(s.completedAt) >= weekStart)
      .reduce((sum, s) => sum + s.duration, 0);
  }, [sessions]);

  const bestStreak = useMemo(() => {
    if (sessions.length === 0) return 0;
    const uniqueDays = [...new Set(sessions.map((s) => s.date))].sort();
    let max = 1;
    let current = 1;
    for (let i = 1; i < uniqueDays.length; i++) {
      const prev = new Date(uniqueDays[i - 1]);
      const curr = new Date(uniqueDays[i]);
      const diff = (curr - prev) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        current++;
        max = Math.max(max, current);
      } else {
        current = 1;
      }
    }
    return max;
  }, [sessions]);

  // ── Timer logic ──────────────────────────────────────────────────────────
  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const handleComplete = useCallback(() => {
    clearTimer();
    if (!isBreak) {
      const session = {
        id: Date.now(),
        task: currentTask || "Nomsiz sessiya",
        duration: workMinutes,
        completedAt: new Date().toISOString(),
        date: getTodayKey(),
        time: formatClockTime(new Date()),
      };
      setSessions((prev) => [...prev, session]);
      setShowComplete(true);
      setTimeout(() => setShowComplete(false), 2500);
      // Start break timer
      setIsBreak(true);
      setTimeLeft(restMinutes * 60);
      setIsRunning(true);
      setIsPaused(false);
    } else {
      // Break finished
      setIsBreak(false);
      setIsRunning(false);
      setIsPaused(false);
      setIsFocusMode(false);
      setTimeLeft(workMinutes * 60);
    }
  }, [isBreak, currentTask, workMinutes, restMinutes, clearTimer]);

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearTimer();
    }
    return clearTimer;
  }, [isRunning, isPaused, clearTimer]);

  // Watch for timeLeft hitting zero
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      handleComplete();
    }
  }, [timeLeft, isRunning, handleComplete]);

  // ── Controls ─────────────────────────────────────────────────────────────
  const handleStart = () => {
    if (!isRunning) {
      setTimeLeft(totalSeconds);
      setIsRunning(true);
      setIsPaused(false);
      setIsFocusMode(true);
      setIsBreak(false);
    } else if (isPaused) {
      setIsPaused(false);
    }
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleReset = () => {
    clearTimer();
    setIsRunning(false);
    setIsPaused(false);
    setIsBreak(false);
    setIsFocusMode(false);
    setTimeLeft(workMinutes * 60);
  };

  const selectType = (id) => {
    if (isRunning) return;
    setSelectedType(id);
    const preset = SESSION_TYPES.find((t) => t.id === id);
    const mins = id === "custom" ? customWork : preset.work;
    setTimeLeft(mins * 60);
    setIsBreak(false);
  };

  // ── Focus Mode (fullscreen-like) ─────────────────────────────────────────
  if (isFocusMode) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white"
        >
          {/* Subtle background pulse */}
          <motion.div
            className="absolute inset-0 bg-slate-50"
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative z-10 flex flex-col items-center gap-8">
            {/* Break / Work indicator */}
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400"
            >
              {isBreak ? "Dam olish" : "Ish sessiyasi"}
            </motion.p>

            {/* Timer circle */}
            <div className="relative w-80 h-80 flex items-center justify-center">
              <TimerCircle
                progress={progress}
                isRunning={isRunning && !isPaused}
                isBreak={isBreak}
              />
              <div className="relative z-10 flex flex-col items-center">
                <motion.span
                  key={timeLeft}
                  initial={{ opacity: 0.7, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    "text-7xl font-black tracking-tighter tabular-nums",
                    isBreak ? "text-slate-400" : "text-slate-900",
                  )}
                >
                  {formatTime(timeLeft)}
                </motion.span>
                {isBreak && (
                  <span className="mt-2 flex items-center gap-1.5 text-sm text-slate-400">
                    <Coffee className="h-4 w-4" /> Dam olish
                  </span>
                )}
              </div>
            </div>

            {/* Current task */}
            {currentTask && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-slate-500 max-w-xs text-center truncate"
              >
                {currentTask}
              </motion.p>
            )}

            {/* Controls */}
            <div className="flex items-center gap-4">
              {isPaused ? (
                <Button
                  onClick={handleStart}
                  className="h-14 w-14 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-lg"
                >
                  <Play className="h-6 w-6" />
                </Button>
              ) : (
                <Button
                  onClick={handlePause}
                  className="h-14 w-14 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-lg"
                >
                  <Pause className="h-6 w-6" />
                </Button>
              )}
              <Button
                onClick={handleReset}
                variant="outline"
                className="h-14 w-14 rounded-full border-slate-200 text-slate-500 hover:bg-slate-50"
              >
                <RotateCcw className="h-5 w-5" />
              </Button>
              <Button
                onClick={() => setIsFocusMode(false)}
                variant="outline"
                className="h-14 w-14 rounded-full border-slate-200 text-slate-500 hover:bg-slate-50"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Session complete overlay */}
          <AnimatePresence>
            {showComplete && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute inset-0 z-20 flex items-center justify-center bg-white/90 backdrop-blur-sm"
              >
                <div className="flex flex-col items-center gap-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="h-20 w-20 rounded-full bg-slate-900 flex items-center justify-center"
                  >
                    <Check className="h-10 w-10 text-white" />
                  </motion.div>
                  <p className="text-2xl font-bold text-slate-900">
                    Session tugadi!
                  </p>
                  <p className="text-sm text-slate-500">
                    Dam olish boshlanmoqda...
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    );
  }

  // ── Normal View ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      {/* Header */}
      <section>
        <motion.h1
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900"
        >
          Deep Work
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mt-1 text-sm text-slate-500"
        >
          Chuqur diqqat bilan ishlang
        </motion.p>
      </section>

      {/* Stats Row */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Bugun",
            value: `${todayMinutes} min`,
            icon: Clock,
          },
          {
            label: "Sessiyalar",
            value: todaySessions.length,
            icon: Zap,
          },
          {
            label: "Haftalik",
            value: `${weekMinutes} min`,
            icon: Target,
          },
          {
            label: "Eng yaxshi streak",
            value: `${bestStreak} kun`,
            icon: Brain,
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 * i }}
          >
            <Card className="border-0 shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 rounded-2xl overflow-hidden group hover:-translate-y-1 transition-all duration-300 bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {stat.label}
                    </p>
                    <p className="mt-3 text-3xl font-extrabold tracking-tighter text-slate-900">
                      {stat.value}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <stat.icon className="h-5 w-5 text-slate-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </section>

      {/* Session Type Selector */}
      <section>
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
          Sessiya turi
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SESSION_TYPES.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.id;
            return (
              <motion.button
                key={type.id}
                onClick={() => selectType(type.id)}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  "relative rounded-2xl p-5 text-left transition-all duration-200 border",
                  isSelected
                    ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20"
                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:shadow-md",
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 mb-3",
                    isSelected ? "text-slate-300" : "text-slate-400",
                  )}
                />
                <p className="font-bold text-sm">{type.label}</p>
                <p
                  className={cn(
                    "text-xs mt-1",
                    isSelected ? "text-slate-400" : "text-slate-400",
                  )}
                >
                  {type.id === "custom"
                    ? `${customWork}/${customRest} min`
                    : `${type.work}/${type.rest} min`}
                </p>
              </motion.button>
            );
          })}
        </div>

        {/* Custom inputs */}
        <AnimatePresence>
          {selectedType === "custom" && !isRunning && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex gap-4 mt-4">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">
                    Ish (min)
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={180}
                    value={customWork}
                    onChange={(e) => {
                      const v = Math.max(1, Math.min(180, +e.target.value || 1));
                      setCustomWork(v);
                      setTimeLeft(v * 60);
                    }}
                    className="rounded-xl border-slate-200"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">
                    Dam olish (min)
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={60}
                    value={customRest}
                    onChange={(e) => {
                      setCustomRest(
                        Math.max(1, Math.min(60, +e.target.value || 1)),
                      );
                    }}
                    className="rounded-xl border-slate-200"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Timer + Task Section */}
      <section className="grid gap-6 lg:grid-cols-5">
        {/* Timer */}
        <Card className="lg:col-span-3 border-0 shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 rounded-2xl overflow-hidden bg-white">
          <CardContent className="p-8 flex flex-col items-center">
            {/* Timer circle */}
            <div className="relative w-80 h-80 flex items-center justify-center mb-8">
              <TimerCircle
                progress={progress}
                isRunning={isRunning && !isPaused}
                isBreak={isBreak}
              />
              <div className="relative z-10 flex flex-col items-center">
                <span
                  className={cn(
                    "text-6xl font-black tracking-tighter tabular-nums",
                    isBreak ? "text-slate-400" : "text-slate-900",
                  )}
                >
                  {formatTime(timeLeft)}
                </span>
                {isBreak && (
                  <span className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                    <Coffee className="h-3.5 w-3.5" /> Dam olish
                  </span>
                )}
                {isRunning && !isBreak && (
                  <span className="mt-2 text-xs text-slate-400">
                    Ish sessiyasi
                  </span>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              {!isRunning ? (
                <Button
                  onClick={handleStart}
                  className="h-12 px-8 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-lg shadow-slate-900/20"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Boshlash
                </Button>
              ) : isPaused ? (
                <Button
                  onClick={handleStart}
                  className="h-12 px-8 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-lg shadow-slate-900/20"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Davom etish
                </Button>
              ) : (
                <Button
                  onClick={handlePause}
                  className="h-12 px-8 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-lg shadow-slate-900/20"
                >
                  <Pause className="h-5 w-5 mr-2" />
                  To'xtatish
                </Button>
              )}
              <Button
                onClick={handleReset}
                variant="outline"
                className="h-12 w-12 rounded-full border-slate-200 text-slate-500 hover:bg-slate-50"
              >
                <RotateCcw className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Task + Info side panel */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Current task */}
          <Card className="border-0 shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 rounded-2xl overflow-hidden bg-white">
            <CardContent className="p-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">
                Nima ustida ishlayapsiz?
              </h3>
              <Input
                placeholder="Masalan: API integratsiya..."
                value={currentTask}
                onChange={(e) => setCurrentTask(e.target.value)}
                disabled={isRunning && !isPaused}
                className="rounded-xl border-slate-200 text-slate-800 placeholder:text-slate-300"
              />
            </CardContent>
          </Card>

          {/* Session info */}
          <Card className="border-0 shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 rounded-2xl overflow-hidden bg-white flex-1">
            <CardContent className="p-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
                Sessiya ma'lumotlari
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Turi</span>
                  <span className="font-semibold text-slate-800">
                    {activePreset.label}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Ish vaqti</span>
                  <span className="font-semibold text-slate-800">
                    {workMinutes} min
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Dam olish</span>
                  <span className="font-semibold text-slate-800">
                    {restMinutes} min
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Holat</span>
                  <span
                    className={cn(
                      "font-semibold",
                      isRunning
                        ? isPaused
                          ? "text-slate-500"
                          : "text-slate-900"
                        : "text-slate-400",
                    )}
                  >
                    {isRunning
                      ? isPaused
                        ? "Pauza"
                        : isBreak
                          ? "Dam olish"
                          : "Ishlayapti"
                      : "Kutilmoqda"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Session Log */}
      <section>
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
          Bugungi sessiyalar
        </h2>
        {todaySessions.length === 0 ? (
          <Card className="border-0 shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 rounded-2xl overflow-hidden bg-white">
            <CardContent className="p-8 text-center">
              <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <Timer className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-sm text-slate-400">
                Hali sessiya yo'q. Birinchi sessiyani boshlang!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {todaySessions.map((session, i) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * i }}
              >
                <Card className="border-0 shadow-lg shadow-slate-200/30 ring-1 ring-slate-100 rounded-2xl overflow-hidden bg-white hover:-translate-y-0.5 transition-all duration-200">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center flex-shrink-0">
                      <Check className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-800 truncate">
                        {session.task}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {session.duration} min &middot; {session.time}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
