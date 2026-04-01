import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLifeOSData } from "@/lib/lifeos-store";
import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

function HabitGrid({ completedDays }) {
  return (
    <div className="grid grid-cols-10 gap-1">
      {Array.from({ length: 40 }, (_, index) => (
        <span
          key={index}
          className={
            index < completedDays
              ? "h-3 rounded-sm bg-slate-900"
              : "h-3 rounded-sm bg-slate-100"
          }
        />
      ))}
    </div>
  );
}

export default function HabitsPage() {
  const { data, actions } = useLifeOSData();
  const [newHabitTitle, setNewHabitTitle] = useState("");

  const todayDoneCount = useMemo(
    () => data.habits.filter((habit) => habit.completedToday).length,
    [data.habits],
  );

  const longestStreak = useMemo(
    () =>
      data.habits.reduce((max, habit) => Math.max(max, habit.longestStreak), 0),
    [data.habits],
  );

  const coachProgress = useMemo(() => {
    if (data.habits.length === 0) {
      return 0;
    }
    const total = data.habits.reduce((sum, habit) => sum + habit.completedDays, 0);
    return Math.round(total / (data.habits.length * 40) * 100);
  }, [data.habits]);

  return (
    <div className="space-y-4">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Aktiv odatlar</p>
            <p className="text-3xl font-semibold">{data.habits.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Eng uzun streak</p>
            <p className="text-3xl font-semibold">{longestStreak}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Bugungi check-in</p>
            <p className="text-3xl font-semibold">
              {todayDoneCount}/{data.habits.length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-900 bg-slate-950 text-white">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-300">40 kun murabbiy</p>
            <p className="text-3xl font-semibold">{coachProgress}%</p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Odatlar monitoringi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newHabitTitle}
              onChange={(event) => setNewHabitTitle(event.target.value)}
              placeholder="Yangi odat qo'shish..."
              className="h-11"
            />
            <Button
              className="h-11"
              onClick={() => {
                actions.addHabit(newHabitTitle);
                setNewHabitTitle("");
              }}
            >
              <Plus className="h-4 w-4" />
              Qo'shish
            </Button>
          </div>

          {data.habits.map((habit) => (
            <div key={habit.id} className="space-y-3 rounded-lg border border-slate-200 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{habit.title}</p>
                <div className="flex items-center gap-2">
                  <Badge>{habit.streak} kun</Badge>
                  <Badge variant="secondary">Top {habit.longestStreak}</Badge>
                </div>
              </div>

              <HabitGrid completedDays={habit.completedDays} />

              <div className="flex items-center justify-between gap-2 text-sm text-slate-500">
                <p>40 kundan {habit.completedDays} kun bajarilgan</p>
                <p>{habit.completedToday ? "Bugun bajarilgan" : "Bugun bajarilmagan"}</p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={habit.completedToday ? "outline" : "default"}
                  onClick={() => actions.toggleHabitCheckIn(habit.id)}
                >
                  {habit.completedToday ? "Check-inni qaytarish" : "Bugungi check-in"}
                </Button>
                <Button
                  variant="outline"
                  className="ml-auto"
                  onClick={() => actions.removeHabit(habit.id)}
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
