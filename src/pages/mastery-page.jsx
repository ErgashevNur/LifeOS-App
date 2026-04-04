import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLifeOSData } from "@/lib/lifeos-store";
import { cn } from "@/lib/utils";
import { Pause, Play, Plus, Hourglass, Trophy, WifiOff, Smartphone, X, Crown, ShieldAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

function formatSeconds(value) {
  const minutes = Math.floor(value / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (value % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function ProgressBar({ value }) {
  return (
    <div className="h-3.5 rounded-full bg-slate-100/80 overflow-hidden shadow-inner flex-1">
      <div className="h-3.5 rounded-full bg-slate-900 transition-all duration-1000 ease-out shadow-sm" style={{ width: `${value}%` }} />
    </div>
  );
}

export default function MasteryPage() {
  const { data, actions } = useLifeOSData();
  const milestones =
    data.content.mastery.milestones.length > 0
      ? data.content.mastery.milestones
      : [4000];
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillHours, setNewSkillHours] = useState("0");
  const [wifiBlocked, setWifiBlocked] = useState(false);
  const [phoneMode, setPhoneMode] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState(
    data.mastery.skills[0]?.id ?? "",
  );

  useEffect(() => {
    if (!isTimerRunning) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isTimerRunning]);

  const totalHours = useMemo(
    () => data.mastery.skills.reduce((sum, skill) => sum + skill.hours, 0),
    [data.mastery.skills],
  );

  const level = Math.floor(totalHours / 200) + 1;
  const nextMilestone = milestones.find((item) => item > totalHours) ?? 4000;

  const addSkill = () => {
    actions.addSkill(newSkillName, Number(newSkillHours));
    setNewSkillName("");
    setNewSkillHours("0");
    setShowAddDialog(false);
  };

  const finishFocusSession = () => {
    if (!selectedSkillId) {
      return;
    }

    const spentMinutes = 25 - Math.floor(timerSeconds / 60);
    if (spentMinutes <= 0) {
      return;
    }

    actions.addFocusSession({
      skillId: selectedSkillId,
      minutes: spentMinutes,
    });
    setIsTimerRunning(false);
    setTimerSeconds(25 * 60);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 rounded-[2rem] overflow-hidden group hover:-translate-y-1 transition-all duration-300 bg-white">
          <CardContent className="p-8 pb-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ko'nikmalar</p>
              <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500">
                <Trophy className="h-4 w-4" />
              </div>
            </div>
            <p className="text-4xl md:text-5xl font-extrabold tracking-tighter text-slate-900 group-hover:text-indigo-600 transition-colors">{data.mastery.skills.length}</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 rounded-[2rem] overflow-hidden group hover:-translate-y-1 transition-all duration-300 bg-white">
          <CardContent className="p-8 pb-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Jami Soat</p>
              <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500">
                <Hourglass className="h-4 w-4" />
              </div>
            </div>
            <p className="text-4xl md:text-5xl font-extrabold tracking-tighter text-slate-900 group-hover:text-fuchsia-600 transition-colors">{totalHours.toFixed(1)}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl shadow-amber-500/10 ring-1 ring-amber-100/50 rounded-[2rem] overflow-hidden group hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="p-8 pb-6 relative">
            <Crown className="absolute right-[-20%] top-[-20%] w-48 h-48 text-amber-500/5 group-hover:scale-110 transition-transform duration-700 pointer-events-none" />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">Daraja</p>
              <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                <Crown className="h-4 w-4" />
              </div>
            </div>
            <p className="text-4xl md:text-5xl font-extrabold tracking-tighter text-slate-900 relative z-10">Lv.{level}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-2xl shadow-indigo-900/20 bg-slate-950 text-white rounded-[2rem] overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 mix-blend-overlay pointer-events-none transition-transform duration-700 group-hover:scale-105" />
          <CardContent className="p-8 pb-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Keyingi Milestone</p>
            </div>
            <p className="text-4xl md:text-5xl font-extrabold tracking-tighter drop-shadow-sm">{nextMilestone}<span className="text-3xl opacity-50 font-medium">h</span></p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <Card className="border-0 shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 rounded-[2.5rem] bg-white flex flex-col items-stretch overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between px-8 pt-8 pb-4">
            <div>
              <CardTitle className="text-2xl font-extrabold tracking-tight">Ko'nikmalar ro'yxati</CardTitle>
              <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-1">Sizning progress</p>
            </div>
            <Button 
              onClick={() => setShowAddDialog(true)}
              className="rounded-xl h-12 px-6 font-bold bg-slate-900 hover:bg-slate-800 text-white transition-transform active:scale-95 shadow-lg shadow-slate-900/20 hidden sm:flex"
            >
              <Plus className="h-4 w-4 mr-2" />
              Qo'shish
            </Button>
            <Button 
              onClick={() => setShowAddDialog(true)}
              size="icon"
              className="rounded-xl h-12 w-12 bg-slate-900 hover:bg-slate-800 text-white sm:hidden"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent className="px-8 pb-8 space-y-4">
            {data.mastery.skills.map((skill) => {
              const percent = Math.min(100, Math.round((skill.hours / 4000) * 100));

              return (
                <div key={skill.id} className="group rounded-[1.5rem] border-0 ring-1 ring-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md hover:ring-slate-200 p-5 transition-all">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <p className="text-xl font-bold text-slate-900">{skill.name}</p>
                    <Badge variant="outline" className="rounded-full px-4 py-1.5 text-[10px] font-black tracking-widest uppercase border-0 bg-white ring-1 ring-slate-200 text-slate-500 shadow-sm">
                      {skill.hours}h / 4000h
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <ProgressBar value={percent} />
                    <span className="text-xs font-bold text-slate-400 w-10 text-right">{percent}%</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-2xl shadow-indigo-900/10 ring-1 ring-slate-100 rounded-[2.5rem] bg-white overflow-hidden relative flex flex-col items-stretch">
          <div className="absolute top-0 right-[-10%] p-0 opacity-[0.03] transform translate-x-1/4 -translate-y-1/4 pointer-events-none text-slate-900">
             <Hourglass className="w-80 h-80" />
          </div>
          <CardHeader className="px-8 pt-8 pb-4 relative z-10 text-center">
            <CardTitle className="text-2xl font-extrabold tracking-tight">Fokus Taymer</CardTitle>
            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-1">Deep Work Session</p>
          </CardHeader>
          <CardContent className="px-8 pb-8 relative z-10 flex flex-col flex-1">
            <div className="rounded-[2rem] border-0 bg-gradient-to-b from-slate-900 to-slate-950 p-8 text-center text-white shadow-xl shadow-slate-900/30 mb-6 flex-1 flex flex-col justify-center min-h-[220px]">
              <p className={cn(
                "font-mono font-bold tracking-tighter transition-all duration-500",
                isTimerRunning ? "text-7xl scale-110 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] text-indigo-400" : "text-7xl opacity-90"
              )}>
                {formatSeconds(timerSeconds)}
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="focus-skill" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Sessiya ko'nikmasi</Label>
                <select
                  id="focus-skill"
                  value={selectedSkillId}
                  onChange={(event) => setSelectedSkillId(event.target.value)}
                  className="h-14 w-full rounded-2xl border-0 shadow-sm ring-1 ring-inset ring-slate-200 bg-slate-50 focus-visible:ring-2 focus-visible:ring-indigo-500 px-4 font-bold text-sm outline-none text-slate-900"
                >
                  {data.mastery.skills.map((skill) => (
                    <option key={skill.id} value={skill.id}>
                      {skill.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <Button
                  className={cn(
                    "flex-1 h-14 rounded-2xl font-bold shadow-md transition-all active:scale-95 duration-300",
                    isTimerRunning ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20 text-white" : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20 text-white"
                  )}
                  onClick={() => setIsTimerRunning((prev) => !prev)}
                >
                  {isTimerRunning ? (
                    <>
                      <Pause className="h-5 w-5 mr-2 fill-white" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5 mr-2 fill-white ml-1" />
                      Play
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="h-14 w-20 rounded-2xl font-bold bg-white border-0 ring-1 ring-slate-200 text-slate-500 hover:bg-slate-50"
                  onClick={() => {
                    setIsTimerRunning(false);
                    setTimerSeconds(25 * 60);
                  }}
                >
                  Reset
                </Button>
              </div>

              <Button 
                variant="outline" 
                className="w-full h-14 rounded-2xl font-bold border-0 bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/10 transition-transform active:scale-95" 
                onClick={finishFocusSession}
              >
                Sessiyani Yakunlash
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <Card className="border-0 shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 rounded-[2.5rem] bg-white overflow-hidden">
          <CardHeader className="px-8 pt-8 pb-4">
            <CardTitle className="text-xl font-extrabold tracking-tight">Milestones</CardTitle>
            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-1">Bosqichlar</p>
          </CardHeader>
          <CardContent className="px-8 pb-8 flex flex-wrap gap-3">
            {milestones.map((item) => {
              const isPassed = item <= totalHours;
              return (
                <Badge
                  key={item}
                  variant="outline"
                  className={cn(
                    "px-6 py-2.5 rounded-full text-[11px] font-black tracking-widest uppercase border-0 shadow-sm transition-all",
                    isPassed 
                      ? "bg-slate-900 text-white shadow-md shadow-slate-900/10" 
                      : "bg-slate-50 ring-1 ring-slate-200 text-slate-400"
                  )}
                >
                  {item}h
                </Badge>
              )
            })}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 rounded-[2.5rem] bg-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none text-slate-900">
            <ShieldAlert className="w-40 h-40" />
          </div>
          <CardHeader className="px-8 pt-8 pb-4 relative z-10">
             <CardTitle className="text-xl font-extrabold tracking-tight">Distraktsiya bloker</CardTitle>
             <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-1">Fokus rejimlari</p>
          </CardHeader>
          <CardContent className="px-8 pb-8 space-y-4 relative z-10">
            <button
              type="button"
              onClick={() => setWifiBlocked((prev) => !prev)}
              className={cn(
                "flex w-full items-center justify-between rounded-[1.5rem] border-0 p-5 text-left transition-all shadow-sm ring-1 group",
                wifiBlocked ? "bg-indigo-50 ring-indigo-200" : "bg-slate-50 ring-slate-100 hover:ring-slate-200 hover:bg-white hover:shadow-md"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "h-12 w-12 rounded-2xl flex items-center justify-center transition-colors",
                  wifiBlocked ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20" : "bg-white ring-1 ring-slate-200 text-slate-400 group-hover:text-slate-900"
                )}>
                  <WifiOff className="h-5 w-5" />
                </div>
                <div>
                  <p className={cn("text-lg font-bold transition-colors", wifiBlocked ? "text-indigo-900" : "text-slate-900")}>Wi-Fi blok</p>
                  <p className={cn("text-[10px] font-black uppercase tracking-widest mt-1", wifiBlocked ? "text-indigo-400" : "text-slate-400")}>Chalg'ituvchi saytlarni to'sish</p>
                </div>
              </div>
              <Badge variant="outline" className={cn(
                "rounded-full px-4 py-1 border-0 shadow-none text-[9px] uppercase font-black tracking-widest",
                wifiBlocked ? "bg-indigo-500 text-white" : "bg-slate-200 text-slate-500"
              )}>
                {wifiBlocked ? "Yoqilgan" : "O'chirilgan"}
              </Badge>
            </button>

            <button
              type="button"
              onClick={() => setPhoneMode((prev) => !prev)}
              className={cn(
                "flex w-full items-center justify-between rounded-[1.5rem] border-0 p-5 text-left transition-all shadow-sm ring-1 group",
                phoneMode ? "bg-fuchsia-50 ring-fuchsia-200" : "bg-slate-50 ring-slate-100 hover:ring-slate-200 hover:bg-white hover:shadow-md"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "h-12 w-12 rounded-2xl flex items-center justify-center transition-colors",
                  phoneMode ? "bg-fuchsia-500 text-white shadow-md shadow-fuchsia-500/20" : "bg-white ring-1 ring-slate-200 text-slate-400 group-hover:text-slate-900"
                )}>
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <p className={cn("text-lg font-bold transition-colors", phoneMode ? "text-fuchsia-900" : "text-slate-900")}>Telefon fokusi</p>
                  <p className={cn("text-[10px] font-black uppercase tracking-widest mt-1", phoneMode ? "text-fuchsia-400" : "text-slate-400")}>Bildirishnomalarni o'chirish</p>
                </div>
              </div>
              <Badge variant="outline" className={cn(
                "rounded-full px-4 py-1 border-0 shadow-none text-[9px] uppercase font-black tracking-widest",
                phoneMode ? "bg-fuchsia-500 text-white" : "bg-slate-200 text-slate-500"
              )}>
                {phoneMode ? "Yoqilgan" : "O'chirilgan"}
              </Badge>
            </button>

          </CardContent>
        </Card>
      </section>

      {showAddDialog ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md border-0 shadow-2xl shadow-indigo-900/20 ring-1 ring-white/20 rounded-[2.5rem] bg-white animate-in zoom-in-95 duration-200 overflow-hidden">
            <CardHeader className="px-8 pt-8 pb-4 relative bg-slate-50/50">
              <CardTitle className="text-2xl font-extrabold tracking-tight">Yangi ko'nikma</CardTitle>
              <button
                type="button"
                onClick={() => setShowAddDialog(false)}
                className="absolute top-8 right-8 rounded-full bg-slate-200/50 hover:bg-slate-200 text-slate-500 p-2 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent className="px-8 pb-8 pt-4 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="skill-name" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Ko'nikma nomi</Label>
                <Input
                  id="skill-name"
                  value={newSkillName}
                  onChange={(event) => setNewSkillName(event.target.value)}
                  className="h-14 rounded-2xl bg-slate-50 border-0 ring-1 ring-inset ring-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 px-4 font-medium text-lg"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skill-hours" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Boshlang'ich soat</Label>
                <Input
                  id="skill-hours"
                  type="number"
                  min="0"
                  value={newSkillHours}
                  onChange={(event) => setNewSkillHours(event.target.value)}
                  className="h-14 rounded-2xl bg-slate-50 border-0 ring-1 ring-inset ring-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 px-4 font-bold text-lg"
                />
              </div>
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <Button 
                  variant="outline" 
                  className="flex-1 h-14 rounded-2xl font-bold border-0 ring-1 ring-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                  onClick={() => setShowAddDialog(false)}
                >
                  Bekor qilish
                </Button>
                <Button 
                  className="flex-1 h-14 rounded-2xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 group" 
                  onClick={addSkill}
                >
                  <Plus className="h-5 w-5 mr-1 group-hover:scale-110 transition-transform" />
                  Qo'shish
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
