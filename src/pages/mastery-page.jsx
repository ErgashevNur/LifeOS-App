import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLifeOSData } from "@/lib/lifeos-store";
import { Pause, Play, Plus } from "lucide-react";
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
    <div className="h-2 rounded-full bg-slate-100">
      <div className="h-2 rounded-full bg-slate-900" style={{ width: `${value}%` }} />
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
    <div className="space-y-4">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Ko'nikmalar soni</p>
            <p className="text-3xl font-semibold">{data.mastery.skills.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Jami soat</p>
            <p className="text-3xl font-semibold">{totalHours.toFixed(1)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Daraja</p>
            <p className="text-3xl font-semibold">Lv.{level}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-900 bg-slate-950 text-white">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-300">Keyingi milestone</p>
            <p className="text-3xl font-semibold">{nextMilestone}h</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Ko'nikmalar ro'yxati</CardTitle>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4" />
              Ko'nikma qo'shish
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.mastery.skills.map((skill) => {
              const percent = Math.min(100, Math.round((skill.hours / 4000) * 100));

              return (
                <div key={skill.id} className="space-y-2 rounded-lg border border-slate-200 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">{skill.name}</p>
                    <Badge variant="outline">{skill.hours}h / 4000h</Badge>
                  </div>
                  <ProgressBar value={percent} />
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Fokus taymer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-slate-900 bg-slate-900 p-5 text-center text-white">
              <p className="text-xs tracking-[0.15em] text-slate-300 uppercase">Session</p>
              <p className="mt-2 text-4xl font-semibold">{formatSeconds(timerSeconds)}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="focus-skill">Sessiya ko'nikmasi</Label>
              <select
                id="focus-skill"
                value={selectedSkillId}
                onChange={(event) => setSelectedSkillId(event.target.value)}
                className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900"
              >
                {data.mastery.skills.map((skill) => (
                  <option key={skill.id} value={skill.id}>
                    {skill.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => setIsTimerRunning((prev) => !prev)}
              >
                {isTimerRunning ? (
                  <>
                    <Pause className="h-4 w-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Play
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimerSeconds(25 * 60);
                }}
              >
                Reset
              </Button>
            </div>

            <Button variant="outline" className="w-full" onClick={finishFocusSession}>
              Sessiyani loglash
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Milestones</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {milestones.map((item) => (
              <Badge
                key={item}
                variant={item <= totalHours ? "default" : "secondary"}
                className="px-3 py-1"
              >
                {item}h
              </Badge>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distraktsiya bloker</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button
              type="button"
              onClick={() => setWifiBlocked((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-3 text-left"
            >
              <span>
                <p className="font-medium">Wi-Fi o'chirish rejimi</p>
                <p className="text-sm text-slate-500">Chalg'ituvchi saytlarni vaqtincha to'sish</p>
              </span>
              <Badge variant={wifiBlocked ? "default" : "outline"}>
                {wifiBlocked ? "Yoqilgan" : "O'chirilgan"}
              </Badge>
            </button>

            <button
              type="button"
              onClick={() => setPhoneMode((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-3 text-left"
            >
              <span>
                <p className="font-medium">Telefon fokus rejimi</p>
                <p className="text-sm text-slate-500">Bildirishnomalarni vaqtincha o'chirish</p>
              </span>
              <Badge variant={phoneMode ? "default" : "outline"}>
                {phoneMode ? "Yoqilgan" : "O'chirilgan"}
              </Badge>
            </button>
          </CardContent>
        </Card>
      </section>

      {showAddDialog ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <Card className="w-full max-w-md border-slate-900">
            <CardHeader>
              <CardTitle className="text-lg">Yangi ko'nikma qo'shish</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="skill-name">Ko'nikma nomi</Label>
                <Input
                  id="skill-name"
                  value={newSkillName}
                  onChange={(event) => setNewSkillName(event.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skill-hours">Boshlang'ich soat</Label>
                <Input
                  id="skill-hours"
                  type="number"
                  min="0"
                  value={newSkillHours}
                  onChange={(event) => setNewSkillHours(event.target.value)}
                  className="h-11"
                />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={addSkill}>
                  Saqlash
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowAddDialog(false)}
                >
                  Bekor qilish
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
