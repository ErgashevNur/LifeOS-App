import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLifeOSData } from "@/lib/lifeos-store";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

function GoalProgressBar({ progress }) {
  return (
    <div className="h-2 rounded-full bg-slate-100">
      <div className="h-2 rounded-full bg-slate-900" style={{ width: `${progress}%` }} />
    </div>
  );
}

export default function GoalsPage() {
  const { actions, selectors } = useLifeOSData();
  const [title, setTitle] = useState("");
  const [period, setPeriod] = useState("Oylik");
  const [targetValue, setTargetValue] = useState("10");
  const [deadline, setDeadline] = useState("");

  const byPeriod = useMemo(() => {
    const counters = { Yillik: 0, Oylik: 0, Haftalik: 0, Kunlik: 0 };
    selectors.goalsWithMeta.forEach((goal) => {
      counters[goal.period] = (counters[goal.period] ?? 0) + 1;
    });
    return counters;
  }, [selectors.goalsWithMeta]);

  const addGoal = () => {
    actions.addGoal({
      title,
      period,
      targetValue: Number(targetValue),
      deadline: deadline || "2026-12-31",
    });
    setTitle("");
    setTargetValue("10");
    setDeadline("");
  };

  return (
    <div className="space-y-4">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Yillik maqsadlar</p>
            <p className="text-3xl font-semibold">{byPeriod.Yillik}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Oylik maqsadlar</p>
            <p className="text-3xl font-semibold">{byPeriod.Oylik}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Haftalik maqsadlar</p>
            <p className="text-3xl font-semibold">{byPeriod.Haftalik}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-900 bg-slate-950 text-white">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-300">Umumiy progress</p>
            <p className="text-3xl font-semibold">{selectors.goalCompletionRate}%</p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Yangi maqsad qo'shish</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <div className="space-y-2 xl:col-span-2">
            <Label htmlFor="goal-title">Maqsad nomi</Label>
            <Input
              id="goal-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Masalan: Har oy 1 ta kitob tugatish"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="goal-period">Davr</Label>
            <select
              id="goal-period"
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
            >
              <option>Yillik</option>
              <option>Oylik</option>
              <option>Haftalik</option>
              <option>Kunlik</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="goal-target">Target</Label>
            <Input
              id="goal-target"
              type="number"
              min="1"
              value={targetValue}
              onChange={(event) => setTargetValue(event.target.value)}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="goal-deadline">Deadline</Label>
            <Input
              id="goal-deadline"
              type="date"
              value={deadline}
              onChange={(event) => setDeadline(event.target.value)}
              className="h-11"
            />
          </div>
          <div className="md:col-span-2 xl:col-span-5">
            <Button onClick={addGoal}>Maqsad qo'shish</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Maqsadlar ro'yxati</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {selectors.goalsWithMeta.map((goal) => (
            <div key={goal.id} className="space-y-2 rounded-lg border border-slate-200 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{goal.title}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{goal.period}</Badge>
                  <Badge variant={goal.status === "Xavf" ? "secondary" : "default"}>
                    {goal.status}
                  </Badge>
                </div>
              </div>
              <GoalProgressBar progress={goal.progress} />
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <p className="text-slate-500">
                  {goal.currentValue}/{goal.targetValue} · {goal.progress}%
                </p>
                <p className="text-slate-500">Muddat: {goal.deadline}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => actions.updateGoalProgress(goal.id, -1)}
                >
                  <Minus className="h-4 w-4" />
                  1 kamaytirish
                </Button>
                <Button onClick={() => actions.updateGoalProgress(goal.id, 1)}>
                  <Plus className="h-4 w-4" />
                  1 qo'shish
                </Button>
                <Button
                  variant="outline"
                  onClick={() => actions.removeGoal(goal.id)}
                  className="ml-auto"
                >
                  <Trash2 className="h-4 w-4" />
                  O'chirish
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
