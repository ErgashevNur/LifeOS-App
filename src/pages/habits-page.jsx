import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLifeOSData } from "@/lib/lifeos-store";
import { cn } from "@/lib/utils";
import { Plus, Trash2, Zap, Check } from "lucide-react";
import { useMemo, useState } from "react";

function HabitGrid({ completedDays }) {
  return (
    <div className="grid grid-cols-10 gap-2 w-full">
      {Array.from({ length: 40 }, (_, index) => (
        <span
          key={index}
          className={cn(
            "h-5 w-auto rounded-full transition-all duration-500",
            index < completedDays
              ? "bg-indigo-500 shadow-sm shadow-indigo-500/20"
              : "bg-slate-100"
          )}
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
    <div className="space-y-8">
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 rounded-[2rem] overflow-hidden group hover:-translate-y-1 transition-all duration-300 bg-white">
          <CardContent className="p-8 pb-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Aktiv</p>
            <p className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tighter text-slate-900 group-hover:text-indigo-600 transition-colors">{data.habits.length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 rounded-[2rem] overflow-hidden group hover:-translate-y-1 transition-all duration-300 bg-white">
          <CardContent className="p-8 pb-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Eng uzun</p>
            <p className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tighter text-slate-900 group-hover:text-indigo-600 transition-colors">{longestStreak}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 rounded-[2rem] overflow-hidden group hover:-translate-y-1 transition-all duration-300 bg-white">
          <CardContent className="p-8 pb-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bugungi</p>
            <p className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tighter text-slate-900 group-hover:text-indigo-600 transition-colors">{todayDoneCount}<span className="text-3xl text-slate-300">/{data.habits.length}</span></p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-2xl shadow-indigo-900/20 bg-slate-950 text-white rounded-[2rem] overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-cyan-400/20 mix-blend-overlay pointer-events-none transition-transform duration-700 group-hover:scale-105" />
          <CardContent className="p-8 pb-6 relative z-10">
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Murabbiy</p>
            <p className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tighter shadow-sm">{coachProgress}%</p>
          </CardContent>
        </Card>
      </section>

      <Card className="border-0 shadow-xl shadow-slate-200/30 ring-1 ring-slate-100 rounded-[2.5rem] bg-white overflow-hidden">
        <CardHeader className="px-8 pt-8 pb-6 flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-extrabold tracking-tight">Odatlar markazi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 px-8 pb-8">
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              value={newHabitTitle}
              onChange={(event) => setNewHabitTitle(event.target.value)}
              placeholder="Yangi odat qo'shish..."
              className="h-14 rounded-2xl bg-slate-50 border-0 ring-1 ring-slate-200 px-6 font-medium focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all shadow-inner w-full"
            />
            <Button
              className="h-14 rounded-2xl px-8 font-bold bg-slate-900 hover:bg-slate-800 text-white transition-transform hover:-translate-y-0.5 group shrink-0"
              onClick={() => {
                actions.addHabit(newHabitTitle);
                setNewHabitTitle("");
              }}
            >
              <Plus className="h-5 w-5 mr-2 transition-transform group-hover:rotate-90" />
              Qo'shish
            </Button>
          </div>

          <div className="grid gap-6">
            {data.habits.map((habit) => (
              <div key={habit.id} className="relative overflow-hidden space-y-6 rounded-[2rem] bg-white p-8 ring-1 ring-slate-200/60 shadow-sm hover:shadow-lg transition-all duration-300 border-0 group/card">
                
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-slate-900 pointer-events-none transform translate-x-1/4 -translate-y-1/4 group-hover/card:scale-110 group-hover/card:opacity-[0.05] transition-all duration-700">
                  <Zap className="h-48 w-48" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-extrabold tracking-tight text-slate-900">{habit.title}</h3>
                    <div className="flex items-center gap-2">
                      <Badge className="rounded-full px-3 py-1 text-[9px] uppercase font-black tracking-widest border-0 bg-indigo-50 text-indigo-600 shadow-sm">{habit.streak} kun</Badge>
                      <Badge variant="secondary" className="rounded-full px-3 py-1 text-[9px] uppercase font-black tracking-widest border-0 bg-slate-100 text-slate-500">Top {habit.longestStreak}</Badge>
                    </div>
                  </div>
                  
                  <div className="text-left md:text-right">
                    <Button
                      variant={habit.completedToday ? "outline" : "default"}
                      onClick={() => actions.toggleHabitCheckIn(habit.id)}
                      className={cn(
                        "rounded-2xl h-14 px-8 font-extrabold tracking-wide transition-all shadow-md",
                        habit.completedToday 
                          ? "bg-slate-50 text-slate-600 border border-slate-200 shadow-none hover:bg-slate-100" 
                          : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20 hover:-translate-y-0.5"
                      )}
                    >
                      {habit.completedToday ? "Check-inni qaytarish" : (
                        <div className="flex items-center">
                          <Check className="mr-2 h-5 w-5" />
                          Bugungi check-in
                        </div>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="relative z-10 pt-2">
                  <HabitGrid completedDays={habit.completedDays} />
                </div>

                <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pt-2">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span className="text-indigo-500">{habit.completedDays}</span> / 40 kun
                    <span className="mx-2 opacity-50">&middot;</span>
                    <span className={habit.completedToday ? "text-emerald-500" : "text-slate-400"}>
                      {habit.completedToday ? "Bugun bajarilgan" : "Bugun bajarilmagan"}
                    </span>
                  </div>
                  
                  <Button
                    variant="outline"
                    className="rounded-xl h-10 px-5 text-xs font-bold bg-red-50/50 text-red-500 border-0 ring-1 ring-red-100 hover:bg-red-50 transition-colors group/del"
                    onClick={() => actions.removeHabit(habit.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2 group-hover/del:text-red-600 transition-colors" />
                    O'chirish
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
