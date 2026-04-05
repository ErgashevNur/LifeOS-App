import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLifeOSData } from "@/lib/lifeos-store";
import { cn } from "@/lib/utils";
import { Minus, Plus, Activity, Droplets, Moon, Flame } from "lucide-react";

export default function HealthyLifePage() {
  const { data, actions } = useLifeOSData();
  const { health } = data;
  const foodDatabase = data.content.health.foodDatabase;
  const waterProgress = Math.min(100, Math.round((health.waterMl / 2500) * 100));

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-0 shadow-xl shadow-orange-500/10 ring-1 ring-slate-100 rounded-[2rem] overflow-hidden group hover:-translate-y-1 transition-all duration-300 bg-white relative">
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none transform translate-x-1/4 -translate-y-1/4 group-hover:scale-110 group-hover:opacity-10 transition-all duration-700 text-orange-500">
            <Flame className="w-32 h-32" />
          </div>
          <CardContent className="p-8 pb-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Kaloriya</p>
              <div className="h-8 w-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                <Flame className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tighter text-slate-900 group-hover:text-orange-500 transition-colors">{health.calories}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl shadow-cyan-500/10 ring-1 ring-slate-100 rounded-[2rem] overflow-hidden group hover:-translate-y-1 transition-all duration-300 bg-white relative">
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none transform translate-x-1/4 -translate-y-1/4 group-hover:scale-110 group-hover:opacity-10 transition-all duration-700 text-cyan-500">
            <Droplets className="w-32 h-32" />
          </div>
          <CardContent className="p-8 pb-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Suv</p>
              <div className="h-8 w-8 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-500">
                <Droplets className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tighter text-slate-900 group-hover:text-cyan-500 transition-colors">
              {health.waterMl} <span className="text-3xl text-slate-300">ml</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-2xl shadow-indigo-900/20 bg-slate-950 text-white rounded-[2rem] overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 mix-blend-overlay pointer-events-none transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none transform translate-x-1/4 -translate-y-1/4 group-hover:scale-110 group-hover:opacity-[0.08] transition-all duration-700 text-white">
            <Moon className="w-32 h-32" />
          </div>
          <CardContent className="p-8 pb-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Uyqu</p>
              <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-white backdrop-blur-md">
                <Moon className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tighter drop-shadow-sm">
              {health.sleepHours} <span className="text-3xl opacity-50 font-medium">soat</span>
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <Card className="border-0 shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 rounded-[2.5rem] bg-white overflow-hidden flex flex-col h-full">
          <CardHeader className="px-8 pt-8 pb-4">
            <CardTitle className="text-2xl font-extrabold tracking-tight">Taom ma'lumotlar bazasi</CardTitle>
            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-1">Kaloriya nazorati</p>
          </CardHeader>
          <CardContent className="px-8 pb-8 flex-1">
            <div className="space-y-4">
              {foodDatabase.map((food) => (
                <div
                  key={food.id}
                  className="flex flex-wrap items-center justify-between rounded-[1.5rem] border-0 ring-1 ring-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md hover:ring-slate-200 p-4 transition-all group"
                >
                  <span className="text-lg font-bold text-slate-900 ml-2 py-1">{food.name}</span>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="rounded-full px-4 py-1.5 text-[10px] font-black tracking-widest uppercase border-0 bg-white ring-1 ring-slate-200 text-slate-500 shadow-sm mr-2">
                      {food.calories} kcal
                    </Badge>
                    <div className="flex items-center bg-slate-100 rounded-full p-1 shadow-inner h-10">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-full text-slate-500 hover:text-slate-900 hover:bg-white transition-all shadow-sm shadow-transparent hover:shadow-slate-200"
                        onClick={() => actions.removeCalories(food.calories)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-full text-slate-500 hover:text-slate-900 hover:bg-white transition-all shadow-sm shadow-transparent hover:shadow-slate-200"
                        onClick={() => actions.addCalories(food.calories)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="border-0 shadow-xl shadow-cyan-900/5 ring-1 ring-slate-100 rounded-[2.5rem] bg-white overflow-hidden relative">
             <div className="absolute top-0 right-0 p-0 opacity-[0.02] transform translate-x-1/3 -translate-y-1/3 pointer-events-none text-cyan-500">
               <Droplets className="w-64 h-64" />
             </div>
             <CardHeader className="px-8 pt-8 pb-4 relative z-10">
               <CardTitle className="text-xl font-extrabold tracking-tight">Suv balansi</CardTitle>
             </CardHeader>
             <CardContent className="px-8 pb-8 relative z-10">
                <div className="space-y-6 rounded-[2rem] bg-cyan-50/30 p-6 border-0 ring-1 ring-cyan-100 shadow-sm">
                  <div className="flex items-end justify-between">
                    <p className="text-[10px] uppercase font-black tracking-widest text-cyan-600">Progress</p>
                    <p className="text-xl font-black text-cyan-600">{waterProgress}%</p>
                  </div>
                  <div className="h-4 rounded-full bg-white shadow-inner overflow-hidden p-1 ring-1 ring-slate-100">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-cyan-500 transition-all duration-1000 ease-out shadow-sm" 
                      style={{ width: `${waterProgress}%` }} 
                    />
                  </div>
                  <Button
                    className="w-full h-12 rounded-xl border-0 bg-white text-cyan-600 font-bold shadow-sm ring-1 ring-cyan-200 hover:bg-cyan-50 transition-colors uppercase tracking-widest text-[10px]"
                    onClick={() => actions.addWater(250)}
                  >
                    <Plus className="h-3.5 w-3.5 mr-2" />
                    250 ml ichish
                  </Button>
                </div>
             </CardContent>
          </Card>

          <Card className="border-0 shadow-xl shadow-indigo-900/5 ring-1 ring-slate-100 rounded-[2.5rem] bg-white overflow-hidden relative">
             <div className="absolute top-0 right-0 p-0 opacity-[0.02] transform translate-x-1/3 -translate-y-1/3 pointer-events-none text-indigo-500">
               <Moon className="w-64 h-64" />
             </div>
             <CardHeader className="px-8 pt-8 pb-4 relative z-10">
               <CardTitle className="text-xl font-extrabold tracking-tight">Uyqu nazorati</CardTitle>
             </CardHeader>
             <CardContent className="px-8 pb-8 relative z-10">
                <div className="space-y-6 rounded-[2rem] bg-slate-50/50 p-6 border-0 ring-1 ring-slate-100 shadow-sm">
                  <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Soatni tahrirlash</p>
                  <div className="flex bg-white rounded-2xl shadow-inner p-1">
                    <Button
                      variant="ghost"
                      className="flex-1 rounded-xl h-12 text-slate-500 hover:text-slate-900 font-bold hover:bg-slate-50 transition-colors"
                      onClick={() => actions.setSleepHours(health.sleepHours - 0.5)}
                    >
                      <Minus className="h-4 w-4 mr-1" />
                      0.5
                    </Button>
                    <div className="w-px bg-slate-100 my-2 mx-1"></div>
                    <Button
                      variant="ghost"
                      className="flex-1 rounded-xl h-12 text-slate-500 hover:text-slate-900 font-bold hover:bg-slate-50 transition-colors"
                      onClick={() => actions.setSleepHours(health.sleepHours + 0.5)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      0.5
                    </Button>
                  </div>
                </div>
             </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
