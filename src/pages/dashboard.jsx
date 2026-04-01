import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLifeOSData } from "@/lib/lifeos-store";
import { ArrowRight, CheckCircle2, Circle, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

function ProgressBar({ value }) {
  return (
    <div className="h-2 rounded-full bg-slate-100">
      <div className="h-2 rounded-full bg-slate-900" style={{ width: `${value}%` }} />
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
    <div className="grid gap-4 xl:grid-cols-[1fr_300px]">
      <div className="space-y-4">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-500">Samaradorlik</p>
              <p className="text-3xl font-semibold">{metrics.goalsCompletion}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-500">Streaklar</p>
              <p className="text-3xl font-semibold">{metrics.streak ?? streakScore}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-500">Fokus soatlar</p>
              <p className="text-3xl font-semibold">{metrics.focusHours}h</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-500">Maqsadlar soni</p>
              <p className="text-3xl font-semibold">{metrics.goalsCount}</p>
            </CardContent>
          </Card>
        </section>

        <Card className="border-slate-900 bg-slate-950 text-white">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-300">Motivatsion iqtibos</p>
            <p className="mt-2 text-xl font-medium">"{quote}"</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Kunlik vazifalar</CardTitle>
            <Badge variant="outline">
              {completedTasks}/{data.dashboard.tasks.length} bajarildi
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newTaskTitle}
                onChange={(event) => setNewTaskTitle(event.target.value)}
                placeholder="Yangi task qo'shing..."
                className="h-11"
              />
              <Button
                className="h-11"
                onClick={() => {
                  actions.addDashboardTask(newTaskTitle);
                  setNewTaskTitle("");
                }}
              >
                <Plus className="h-4 w-4" />
                Qo'shish
              </Button>
            </div>

            <div className="space-y-2">
              {data.dashboard.tasks.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => actions.toggleDashboardTask(task.id)}
                  className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-left hover:border-slate-900"
                >
                  <div className="flex items-center gap-2">
                    {task.done ? (
                      <CheckCircle2 className="h-4 w-4 text-slate-900" />
                    ) : (
                      <Circle className="h-4 w-4 text-slate-400" />
                    )}
                    <span className={task.done ? "text-slate-500 line-through" : ""}>
                      {task.title}
                    </span>
                  </div>
                  <Badge variant={task.done ? "default" : "secondary"}>
                    {task.done ? "Done" : "Active"}
                  </Badge>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Asosiy kuzatuv</CardTitle>
            <div className="flex rounded-lg border border-slate-300 p-1">
              <button
                type="button"
                onClick={() => setActiveTab("goals")}
                className={
                  activeTab === "goals"
                    ? "rounded-md bg-slate-900 px-3 py-1 text-sm text-white"
                    : "rounded-md px-3 py-1 text-sm text-slate-600"
                }
              >
                Maqsadlar
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("habits")}
                className={
                  activeTab === "habits"
                    ? "rounded-md bg-slate-900 px-3 py-1 text-sm text-white"
                    : "rounded-md px-3 py-1 text-sm text-slate-600"
                }
              >
                Odatlar
              </button>
            </div>
          </CardHeader>

          {activeTab === "goals" ? (
            <CardContent className="space-y-3">
              {selectors.goalsWithMeta.slice(0, 4).map((goal) => (
                <div key={goal.id} className="space-y-2 rounded-lg border border-slate-200 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{goal.title}</p>
                    <Badge variant="outline">{goal.period}</Badge>
                  </div>
                  <ProgressBar value={goal.progress} />
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <p>{goal.progress}%</p>
                    <p>{goal.status}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          ) : (
            <CardContent className="space-y-2">
              {data.habits.slice(0, 4).map((habit) => (
                <button
                  key={habit.id}
                  type="button"
                  onClick={() => actions.toggleHabitCheckIn(habit.id)}
                  className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-left hover:border-slate-900"
                >
                  <div>
                    <p className="font-medium">{habit.title}</p>
                    <p className="text-sm text-slate-500">
                      {habit.streak} kun streak · Top {habit.longestStreak}
                    </p>
                  </div>
                  <Badge variant={habit.completedToday ? "default" : "secondary"}>
                    {habit.completedToday ? "Bajarilgan" : "Check-in"}
                  </Badge>
                </button>
              ))}
            </CardContent>
          )}
        </Card>
      </div>

      <aside className="space-y-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Modulga kirish</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickModules.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm hover:border-slate-900"
              >
                {item.title}
                <ArrowRight className="h-4 w-4" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
