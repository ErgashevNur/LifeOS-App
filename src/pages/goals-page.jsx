import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLifeOSData } from "@/lib/lifeos-store";
import { cn } from "@/lib/utils";
import { Minus, Plus, Trash2, Target } from "lucide-react";
import { useMemo, useState } from "react";

function GoalProgressBar({ progress }) {
  return (
    <div className="h-3.5 rounded-full bg-slate-100/80 overflow-hidden shadow-inner">
      <div className="h-3.5 rounded-full bg-slate-900 transition-all duration-1000 ease-out" style={{ width: `${progress}%` }} />
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
    <div className="space-y-8">
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 rounded-[2rem] overflow-hidden group hover:-translate-y-1 transition-all duration-300 bg-white">
          <CardContent className="p-8 pb-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Yillik</p>
            <p className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tighter text-slate-900 group-hover:text-indigo-600 transition-colors">{byPeriod.Yillik}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 rounded-[2rem] overflow-hidden group hover:-translate-y-1 transition-all duration-300 bg-white">
          <CardContent className="p-8 pb-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Oylik</p>
            <p className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tighter text-slate-900 group-hover:text-indigo-600 transition-colors">{byPeriod.Oylik}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 rounded-[2rem] overflow-hidden group hover:-translate-y-1 transition-all duration-300 bg-white">
          <CardContent className="p-8 pb-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Haftalik</p>
            <p className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tighter text-slate-900 group-hover:text-indigo-600 transition-colors">{byPeriod.Haftalik}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-2xl shadow-indigo-900/20 bg-slate-950 text-white rounded-[2rem] overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 mix-blend-overlay pointer-events-none" />
          <CardContent className="p-8 pb-6 relative z-10">
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Progress</p>
            <p className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tighter">{selectors.goalCompletionRate}%</p>
          </CardContent>
        </Card>
      </section>

      <Card className="border-0 shadow-xl shadow-slate-200/30 ring-1 ring-slate-100 rounded-[2.5rem] bg-white overflow-hidden">
        <CardHeader className="px-8 pt-8 pb-4">
          <CardTitle className="text-2xl font-extrabold tracking-tight">Yangi maqsad qo'shish</CardTitle>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5 p-6 rounded-[2rem] bg-slate-50 border-0 ring-1 ring-slate-200/50 shadow-inner">
            <div className="space-y-2 xl:col-span-2">
              <Label htmlFor="goal-title" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Maqsad nomi</Label>
              <Input
                id="goal-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Masalan: Har oy 1 ta kitob tugatish"
                className="h-14 rounded-2xl bg-white border-0 shadow-sm ring-1 ring-inset ring-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 font-medium"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-period" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Davr</Label>
              <select
                id="goal-period"
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
                className="h-14 w-full rounded-2xl bg-white border-0 shadow-sm ring-1 ring-inset ring-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 font-bold text-sm px-4 outline-none"
              >
                <option>Yillik</option>
                <option>Oylik</option>
                <option>Haftalik</option>
                <option>Kunlik</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-target" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Miqdor</Label>
              <Input
                id="goal-target"
                type="number"
                min="1"
                value={targetValue}
                onChange={(event) => setTargetValue(event.target.value)}
                className="h-14 rounded-2xl bg-white border-0 shadow-sm ring-1 ring-inset ring-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-deadline" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Deadline</Label>
              <Input
                id="goal-deadline"
                type="date"
                value={deadline}
                onChange={(event) => setDeadline(event.target.value)}
                className="h-14 rounded-2xl bg-white border-0 shadow-sm ring-1 ring-inset ring-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 font-bold text-sm px-4"
              />
            </div>
            <div className="md:col-span-2 xl:col-span-5 pt-2">
              <Button onClick={addGoal} className="h-14 w-full rounded-2xl font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/10 transition-transform hover:-translate-y-0.5">
                <Target className="mr-2 h-5 w-5" />
                Maqsadni qadash
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-xl shadow-slate-200/30 ring-1 ring-slate-100 rounded-[2.5rem] bg-white overflow-hidden">
        <CardHeader className="px-8 pt-8 pb-6">
          <CardTitle className="text-2xl font-extrabold tracking-tight">E'tibordagi maqsadlar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 px-8 pb-8">
          {selectors.goalsWithMeta.map((goal) => (
            <div key={goal.id} className="space-y-6 rounded-[2rem] bg-slate-50/50 p-8 ring-1 ring-slate-200/50 shadow-sm transition-all hover:shadow-md border-0 group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 text-slate-900 pointer-events-none transform translate-x-1/4 -translate-y-1/4 group-hover:scale-110 group-hover:opacity-10 transition-all duration-700">
                <Target className="h-40 w-40" />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-extrabold tracking-tight mb-2 text-slate-900">{goal.title}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="rounded-full px-3 py-1 text-[9px] uppercase font-black tracking-widest border-0 bg-white ring-1 ring-slate-200 text-slate-500 shadow-sm">{goal.period}</Badge>
                    <Badge variant={goal.status === "Xavf" ? "secondary" : "default"} className={cn("rounded-full px-3 py-1 text-[9px] uppercase font-black tracking-widest shadow-none border-0", goal.status === "Xavf" ? "bg-red-100 text-red-600" : "")}>
                      {goal.status}
                    </Badge>
                  </div>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Muddat</p>
                  <p className="text-sm font-bold text-slate-700 mt-1">{goal.deadline}</p>
                </div>
              </div>
              <div className="relative z-10 space-y-4 pt-2">
                <GoalProgressBar progress={goal.progress} />
                <div className="flex items-center justify-between">
                  <p className="text-lg font-extrabold tracking-tight text-slate-900">
                    <span className="text-indigo-600">{goal.currentValue}</span> <span className="text-slate-400 opacity-50">/</span> {goal.targetValue}
                  </p>
                  <p className="text-sm font-black uppercase tracking-widest text-indigo-500">{goal.progress}%</p>
                </div>
              </div>
              <div className="relative z-10 flex flex-wrap gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => actions.updateGoalProgress(goal.id, -1)}
                  className="rounded-xl h-12 px-6 font-bold bg-white shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 border-0 transition-transform active:scale-95"
                >
                  <Minus className="mr-2 h-4 w-4" />
                  1 ayirish
                </Button>
                <Button 
                  onClick={() => actions.updateGoalProgress(goal.id, 1)}
                  className="rounded-xl h-12 px-6 font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-md shadow-slate-900/10 transition-transform active:scale-95"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  1 qo'shish
                </Button>
                <Button
                  variant="outline"
                  onClick={() => actions.removeGoal(goal.id)}
                  className="rounded-xl h-12 px-6 font-bold ml-auto bg-red-50 text-red-600 ring-1 ring-red-200 hover:bg-red-100 border-0 transition-transform active:scale-95 group/del"
                >
                  <Trash2 className="mr-2 h-4 w-4 group-hover/del:rotate-12 transition-transform" />
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
