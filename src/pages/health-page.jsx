import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLifeOSData } from "@/lib/lifeos-store";
import { cn } from "@/lib/utils";
import { ArrowRight, Flame, Droplets, Moon, Activity } from "lucide-react";
import { Link } from "react-router-dom";

export default function HealthPage() {
  const { data } = useLifeOSData();

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-0 shadow-xl shadow-orange-500/5 ring-1 ring-slate-100 rounded-[2rem] overflow-hidden bg-white">
          <CardContent className="p-8 pb-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Kaloriya</p>
              <div className="h-8 w-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                <Flame className="h-4 w-4" />
              </div>
            </div>
            <p className="text-4xl font-extrabold tracking-tighter text-slate-900">{data.health.calories} <span className="text-2xl text-slate-300 font-medium">/ 2300</span></p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-xl shadow-cyan-500/5 ring-1 ring-slate-100 rounded-[2rem] overflow-hidden bg-white">
          <CardContent className="p-8 pb-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Suv</p>
              <div className="h-8 w-8 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-500">
                <Droplets className="h-4 w-4" />
              </div>
            </div>
            <p className="text-4xl font-extrabold tracking-tighter text-slate-900">{(data.health.waterMl / 1000).toFixed(1)}L <span className="text-2xl text-slate-300 font-medium">/ 2.5L</span></p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-2xl shadow-indigo-900/10 bg-slate-950 text-white rounded-[2rem] overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10 mix-blend-overlay pointer-events-none" />
          <CardContent className="p-8 pb-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Uyqu</p>
              <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-white backdrop-blur-md">
                <Moon className="h-4 w-4" />
              </div>
            </div>
            <p className="text-4xl font-extrabold tracking-tighter drop-shadow-sm">{data.health.sleepHours} <span className="text-2xl opacity-50 font-medium">soat</span></p>
          </CardContent>
        </Card>
      </section>

      <Card className="border-0 shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 rounded-[2.5rem] bg-white overflow-hidden flex flex-col items-stretch">
        <CardHeader className="flex flex-row items-center justify-between px-8 pt-8 pb-4">
          <div>
            <CardTitle className="text-2xl font-extrabold tracking-tight">Haftalik loglar</CardTitle>
            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-1">Sog'liq tarixi</p>
          </div>
          <Link to="/healthy-life">
            <Button className="rounded-xl h-11 px-6 font-bold bg-slate-900 hover:bg-slate-800 text-white transition-transform active:scale-95 shadow-md group">
              To'liq oyna
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="px-8 pb-8 space-y-3">
          {data.health.logs.length === 0 ? (
            <div className="h-32 flex flex-col items-center justify-center text-center opacity-40">
              <Activity className="h-8 w-8 text-slate-400 mb-2" />
              <p className="font-bold text-slate-500">Hech qanday log mavjud emas.</p>
            </div>
          ) : (
            data.health.logs.map((item) => (
              <div
                key={item.id}
                className="grid gap-4 items-center rounded-[1.5rem] border-0 ring-1 ring-slate-100 bg-slate-50 p-5 text-sm sm:grid-cols-4 hover:bg-white hover:ring-slate-200 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <p className="font-bold text-slate-900 text-base">{item.day}</p>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase font-black tracking-widest text-slate-400">Kaloriya</span>
                  <span className="font-bold text-slate-700">{item.calories} <span className="text-slate-400 font-medium">/ 2300</span></span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase font-black tracking-widest text-slate-400">Suv</span>
                  <span className="font-bold text-slate-700">{(item.waterMl / 1000).toFixed(1)}L <span className="text-slate-400 font-medium">/ 2.5L</span></span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase font-black tracking-widest text-slate-400">Uyqu</span>
                  <span className="font-bold text-slate-700">{item.sleepHours} <span className="text-slate-400 font-medium">soat</span></span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
