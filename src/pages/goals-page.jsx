import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLifeOSData } from "@/lib/lifeos-store";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Plus,
  Target,
  TrendingUp,
  Trash2,
} from "lucide-react";

const PERIODS = ["Yillik", "Oylik", "Haftalik", "Kunlik"];

const PERIOD_META = {
  Yillik: {
    short: "YIL",
    label: "Yillik",
    accent: "bg-emerald-500",
    accentText: "text-emerald-600",
    badge: "bg-emerald-50 text-emerald-600",
    border: "border-emerald-100",
    progress: "bg-emerald-500",
  },
  Oylik: {
    short: "OY",
    label: "Oylik",
    accent: "bg-amber-500",
    accentText: "text-amber-600",
    badge: "bg-amber-50 text-amber-600",
    border: "border-amber-100",
    progress: "bg-amber-500",
  },
  Haftalik: {
    short: "HAFTA",
    label: "Haftalik",
    accent: "bg-violet-500",
    accentText: "text-violet-600",
    badge: "bg-violet-50 text-violet-600",
    border: "border-violet-100",
    progress: "bg-violet-500",
  },
  Kunlik: {
    short: "KUN",
    label: "Kunlik",
    accent: "bg-sky-500",
    accentText: "text-sky-600",
    badge: "bg-sky-50 text-sky-600",
    border: "border-sky-100",
    progress: "bg-sky-500",
  },
};

function ProgressBar({ value, className }) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className={cn("h-full rounded-full", className)}
      />
    </div>
  );
}

function GoalRow({ goal, meta, onDelete, onIncrement, onDecrement }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={cn(
        "rounded-2xl border bg-white p-4 shadow-sm",
        meta.border,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-900">{goal.title}</p>
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>{goal.deadline ? new Date(goal.deadline).toLocaleDateString("uz-UZ") : "Muddat yo'q"}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge className={cn("border-0 text-[10px] font-black uppercase tracking-widest", meta.badge)}>
            {goal.status}
          </Badge>
          <button
            type="button"
            onClick={() => onDelete(goal.id)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <ProgressBar value={goal.progress} className={meta.progress} />
        <div className="flex items-center justify-between">
          <p className={cn("text-xs font-extrabold", meta.accentText)}>
            {goal.currentValue} / {goal.targetValue}
          </p>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="h-8 w-8"
              onClick={() => onDecrement(goal.id)}
            >
              -
            </Button>
            <Button
              type="button"
              size="icon"
              className="h-8 w-8"
              onClick={() => onIncrement(goal.id)}
            >
              +
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function PeriodSection({ period, goals, onDelete, onIncrement, onDecrement }) {
  const [open, setOpen] = useState(true);
  const meta = PERIOD_META[period];

  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span className={cn("h-2.5 w-2.5 rounded-full", meta.accent)} />
          <span className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-500">{meta.short}</span>
          <Badge className={cn("border-0 text-[10px] font-black", meta.badge)}>{goals.length}</Badge>
        </div>

        <ChevronDown
          className={cn(
            "h-4 w-4 text-slate-400 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <CardContent className="space-y-3 pt-0">
              {goals.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-6 text-center text-sm font-medium text-slate-400">
                  Bu davrda maqsad yo'q.
                </div>
              )}

              <AnimatePresence>
                {goals.map((goal) => (
                  <GoalRow
                    key={goal.id}
                    goal={goal}
                    meta={meta}
                    onDelete={onDelete}
                    onIncrement={onIncrement}
                    onDecrement={onDecrement}
                  />
                ))}
              </AnimatePresence>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

function nextMonthDate() {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return date.toISOString().slice(0, 10);
}

export default function GoalsPage() {
  const { actions, selectors } = useLifeOSData();
  const goalsWithMeta = Array.isArray(selectors?.goalsWithMeta)
    ? selectors.goalsWithMeta
    : [];

  const [title, setTitle] = useState("");
  const [period, setPeriod] = useState("Oylik");
  const [target, setTarget] = useState("10");
  const [deadline, setDeadline] = useState("");
  const [showForm, setShowForm] = useState(false);

  const byPeriod = useMemo(() => {
    const map = { Yillik: [], Oylik: [], Haftalik: [], Kunlik: [] };
    goalsWithMeta.forEach((goal) => {
      if (map[goal.period]) {
        map[goal.period].push(goal);
      }
    });
    return map;
  }, [goalsWithMeta]);

  const total = goalsWithMeta.length;
  const completed = goalsWithMeta.filter((goal) => goal.progress >= 100).length;
  const inProgress = Math.max(0, total - completed);

  const handleAddGoal = () => {
    const trimmed = title.trim();
    const numericTarget = Number(target);
    if (!trimmed || !Number.isFinite(numericTarget) || numericTarget <= 0) {
      return;
    }

    actions.addGoal({
      title: trimmed,
      period,
      targetValue: Math.max(1, Math.round(numericTarget)),
      deadline: deadline || nextMonthDate(),
    });

    setTitle("");
    setTarget("10");
    setDeadline("");
    setShowForm(false);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400">Plan</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">Maqsadlar</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">Maqsadlarni period bo'yicha boshqaring va progressni kuzating.</p>
        </div>

        <Button
          type="button"
          onClick={() => setShowForm((prev) => !prev)}
          className="h-11 rounded-xl px-5 font-bold"
        >
          <Plus className="h-4 w-4" />
          Yangi Maqsad
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="pt-6">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Jami</p>
            <p className="mt-2 text-3xl font-black text-slate-900">{total}</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-100 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              <p className="text-xs font-bold uppercase tracking-widest">Bajarildi</p>
            </div>
            <p className="mt-2 text-3xl font-black text-emerald-600">{completed}</p>
          </CardContent>
        </Card>

        <Card className="border-amber-100 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-amber-600">
              <TrendingUp className="h-4 w-4" />
              <p className="text-xs font-bold uppercase tracking-widest">Jarayonda</p>
            </div>
            <p className="mt-2 text-3xl font-black text-amber-600">{inProgress}</p>
          </CardContent>
        </Card>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-center gap-2 text-slate-700">
                  <Target className="h-4 w-4" />
                  <p className="text-sm font-black uppercase tracking-widest">Yangi Maqsad</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goal-title">Maqsad nomi</Label>
                  <Input
                    id="goal-title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Maqsad nomi..."
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-4">
                  {PERIODS.map((item) => {
                    const active = period === item;
                    const meta = PERIOD_META[item];

                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setPeriod(item)}
                        className={cn(
                          "rounded-xl border px-3 py-2 text-xs font-black uppercase tracking-wider transition",
                          active
                            ? cn(meta.badge, "border-transparent")
                            : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50",
                        )}
                      >
                        {meta.label}
                      </button>
                    );
                  })}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="goal-target">Target qiymat</Label>
                    <Input
                      id="goal-target"
                      type="number"
                      min="1"
                      value={target}
                      onChange={(event) => setTarget(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="goal-deadline">Muddat</Label>
                    <Input
                      id="goal-deadline"
                      type="date"
                      value={deadline}
                      onChange={(event) => setDeadline(event.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Bekor qilish
                  </Button>
                  <Button type="button" onClick={handleAddGoal}>
                    Qo'shish
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {PERIODS.map((item) => (
          <PeriodSection
            key={item}
            period={item}
            goals={byPeriod[item]}
            onDelete={actions.removeGoal}
            onIncrement={(id) => actions.updateGoalProgress(id, 1)}
            onDecrement={(id) => actions.updateGoalProgress(id, -1)}
          />
        ))}
      </div>
    </div>
  );
}
