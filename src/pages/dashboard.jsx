import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLifeOSData } from "@/lib/lifeos-store";
import { cn } from "@/lib/utils";
import { ArrowRight, CheckCircle2, Circle, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

function ProgressBar({ value }) {
  return (
    <div className="h-3 rounded-full bg-slate-100/80 overflow-hidden">
      <div className="h-3 rounded-full bg-slate-900 transition-all duration-1000 ease-out" style={{ width: `${value}%` }} />
    </div>
  );
}

export default function DashboardPage() {
  const { data, actions, selectors, dashboardSummary } = useLifeOSData();
  const [activeTab, setActiveTab] = useState("goals");
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const completedTasks = useMemo(
    () => data.dashboard.tasks.filter((task) => task.done).length,
    [data.dashboard.tasks],
  );

  const streakScore = selectors.highestStreak;
  const quickModules = data.content.dashboard.quickModules;
  const hasServerSummary =
    dashboardSummary.goalsCount > 0 ||
    dashboardSummary.habitsCount > 0 ||
    dashboardSummary.booksCount > 0 ||
    dashboardSummary.focusHours > 0 ||
    dashboardSummary.streak > 0 ||
    dashboardSummary.completedHabits > 0;
  const metrics = hasServerSummary
    ? dashboardSummary
    : {
        goalsCompletion: selectors.goalCompletionRate,
        streak: selectors.highestStreak,
        focusHours: selectors.focusHours,
        goalsCount: data.goals.length,
      };
  const quote =
    metrics.goalsCompletion >= 70
      ? "Natija intizomdan keladi. Shu tempni ushlab turing."
      : "Har kuni 1% yaxshilanish ham yil yakunida katta farq beradi.";

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_320px]">
      <div className="space-y-8">
        <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="border-0 shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 rounded-[2rem] overflow-hidden group hover:-translate-y-1 transition-all duration-300">
            <CardContent className="p-8">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Samaradorlik</p>
              <p className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tighter text-slate-900 group-hover:text-indigo-600 transition-colors">{metrics.goalsCompletion}%</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 rounded-[2rem] overflow-hidden group hover:-translate-y-1 transition-all duration-300">
            <CardContent className="p-8">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Streaklar</p>
              <p className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tighter text-slate-900 group-hover:text-indigo-600 transition-colors">{metrics.streak ?? streakScore}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 rounded-[2rem] overflow-hidden group hover:-translate-y-1 transition-all duration-300">
            <CardContent className="p-8">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fokus soatlar</p>
              <p className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tighter text-slate-900 group-hover:text-indigo-600 transition-colors">{metrics.focusHours}h</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 rounded-[2rem] overflow-hidden group hover:-translate-y-1 transition-all duration-300">
            <CardContent className="p-8">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Maqsadlar</p>
              <p className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tighter text-slate-900 group-hover:text-indigo-600 transition-colors">{metrics.goalsCount}</p>
            </CardContent>
          </Card>
        </section>

        <Card className="border-0 bg-slate-950 text-white rounded-[2rem] shadow-2xl shadow-slate-900/20 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 mix-blend-overlay pointer-events-none" />
          <CardContent className="p-8 sm:p-10 relative z-10">
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Motivatsion iqtibos</p>
            <p className="mt-4 text-2xl lg:text-3xl font-bold tracking-tight leading-relaxed">"{quote}"</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 rounded-[2.5rem] overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between px-8 pt-8 pb-4">
            <CardTitle className="text-2xl font-extrabold tracking-tight">Kunlik vazifalar</CardTitle>
            <Badge variant="secondary" className="rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest border-0">
              {completedTasks}/{data.dashboard.tasks.length} bajarildi
            </Badge>
          </CardHeader>
          <CardContent className="space-y-6 px-8 pb-8">
            <div className="flex gap-3">
              <Input
                value={newTaskTitle}
                onChange={(event) => setNewTaskTitle(event.target.value)}
                placeholder="Yangi task qo'shing..."
                className="h-14 rounded-2xl bg-slate-50 border-0 ring-1 ring-slate-200 px-6 font-medium focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all shadow-inner"
              />
              <Button
                className="h-14 rounded-2xl px-8 font-bold bg-slate-900 hover:bg-slate-800 text-white transition-transform hover:-translate-y-0.5 group"
                onClick={() => {
                  actions.addDashboardTask(newTaskTitle);
                  setNewTaskTitle("");
                }}
              >
                <Plus className="h-5 w-5 mr-2 transition-transform group-hover:rotate-90" />
                Qo'shish
              </Button>
            </div>

            <div className="space-y-3">
              {data.dashboard.tasks.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => actions.toggleDashboardTask(task.id)}
                  className="flex w-full items-center justify-between rounded-2xl bg-white hover:bg-slate-50 transition-colors px-6 py-5 text-left group border-0 ring-1 ring-slate-100 shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    {task.done ? (
                      <div className="rounded-full bg-indigo-100 p-1">
                        <CheckCircle2 className="h-5 w-5 text-indigo-500 drop-shadow-sm" />
                      </div>
                    ) : (
                      <div className="rounded-full bg-slate-100 p-1 group-hover:bg-slate-200 transition-colors">
                        <Circle className="h-5 w-5 text-slate-400 group-hover:text-slate-500" />
                      </div>
                    )}
                    <span className={cn("text-lg font-bold tracking-tight transition-all", task.done ? "text-slate-400 line-through" : "text-slate-900")}>
                      {task.title}
                    </span>
                  </div>
                  <Badge variant={task.done ? "outline" : "default"} className={cn("rounded-full px-3 py-1 font-black tracking-widest text-[9px] uppercase transition-colors shadow-none border-0", task.done ? "bg-slate-100 text-slate-400" : "")}>
                    {task.done ? "Done" : "Active"}
                  </Badge>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 rounded-[2.5rem] overflow-hidden">
          <CardHeader className="flex flex-col sm:flex-row items-baseline sm:items-center justify-between px-8 pt-8 pb-6 gap-4">
            <CardTitle className="text-2xl font-extrabold tracking-tight">Kuzatuv markazi</CardTitle>
            <div className="flex rounded-[1.25rem] bg-slate-100/80 p-1.5 w-full sm:w-auto shadow-inner">
              <button
                type="button"
                onClick={() => setActiveTab("goals")}
                className={cn(
                  "rounded-xl px-8 py-2.5 text-sm font-bold tracking-wide transition-all flex-1 sm:flex-none",
                  activeTab === "goals"
                    ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5"
                    : "text-slate-500 hover:text-slate-900"
                )}
              >
                Maqsadlar
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("habits")}
                className={cn(
                  "rounded-xl px-8 py-2.5 text-sm font-bold tracking-wide transition-all flex-1 sm:flex-none",
                  activeTab === "habits"
                    ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5"
                    : "text-slate-500 hover:text-slate-900"
                )}
              >
                Odatlar
              </button>
            </div>
          </CardHeader>

          {activeTab === "goals" ? (
            <CardContent className="space-y-4 px-8 pb-8">
              {selectors.goalsWithMeta.slice(0, 4).map((goal) => (
                <div key={goal.id} className="space-y-4 rounded-2xl bg-white ring-1 ring-slate-100 shadow-sm p-6 group hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-lg font-bold tracking-tight">{goal.title}</p>
                    <Badge variant="outline" className="rounded-full px-3 text-[10px] uppercase font-black tracking-widest border-0 bg-slate-50 text-slate-500">{goal.period}</Badge>
                  </div>
                  <ProgressBar value={goal.progress} />
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
                    <p className="text-indigo-500">{goal.progress}% yakunlandi</p>
                    <p>{goal.status}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          ) : (
            <CardContent className="space-y-3 px-8 pb-8">
              {data.habits.slice(0, 4).map((habit) => (
                <button
                  key={habit.id}
                  type="button"
                  onClick={() => actions.toggleHabitCheckIn(habit.id)}
                  className="flex w-full items-center justify-between rounded-2xl bg-white hover:bg-slate-50 ring-1 ring-slate-100 shadow-sm px-6 py-5 text-left transition-all hover:shadow-md border-0 group"
                >
                  <div>
                    <p className="text-lg font-bold tracking-tight">{habit.title}</p>
                    <p className="mt-1 text-xs font-semibold tracking-widest text-slate-400 uppercase">
                      {habit.streak} kun <span className="opacity-50">/</span> Top {habit.longestStreak}
                    </p>
                  </div>
                  <Badge variant={habit.completedToday ? "default" : "outline"} className={cn("rounded-full px-4 py-1.5 font-black uppercase tracking-widest text-[9px] shadow-none", habit.completedToday ? "bg-emerald-500" : "border-0 bg-slate-100 text-slate-500")}>
                    {habit.completedToday ? "Bajarilgan" : "Check-in"}
                  </Badge>
                </button>
              ))}
            </CardContent>
          )}
        </Card>
      </div>

      <aside className="space-y-6">
        <Card className="border-0 shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 rounded-[2.5rem] overflow-hidden sticky top-8">
          <CardHeader className="px-8 pt-8 pb-4">
            <CardTitle className="text-xl font-extrabold tracking-tight">Katalog</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-8 pb-8">
            {quickModules.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center justify-between rounded-2xl bg-slate-50/50 hover:bg-slate-100 hover:-translate-y-0.5 transition-all px-5 py-4 text-[0.95rem] font-bold tracking-tight group"
              >
                {item.title}
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
