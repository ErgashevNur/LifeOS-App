import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLifeOSData } from "@/lib/lifeos-store";
import { Minus, Plus } from "lucide-react";

export default function HealthyLifePage() {
  const { data, actions } = useLifeOSData();
  const { health } = data;
  const foodDatabase = data.content.health.foodDatabase;
  const waterProgress = Math.min(100, Math.round((health.waterMl / 2500) * 100));

  return (
    <div className="space-y-4 text-white">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-slate-700 bg-slate-900 text-white">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-300">Kaloriya</p>
            <p className="text-3xl font-semibold">{health.calories}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-700 bg-slate-900 text-white">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-300">Suv</p>
            <p className="text-3xl font-semibold">{health.waterMl} ml</p>
          </CardContent>
        </Card>
        <Card className="border-white bg-white text-slate-950">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600">Uyqu</p>
            <p className="text-3xl font-semibold">{health.sleepHours} soat</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_330px]">
        <Card className="border-slate-700 bg-slate-900 text-white">
          <CardHeader>
            <CardTitle className="text-lg">Taom ma'lumotlar bazasi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {foodDatabase.map((food) => (
              <div
                key={food.id}
                className="flex items-center justify-between rounded-lg border border-slate-600 px-3 py-2"
              >
                <span>{food.name}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-slate-400 text-slate-200">
                    {food.calories} kcal
                  </Badge>
                  <Button
                    size="sm"
                    className="h-8 bg-white text-slate-950 hover:bg-slate-200"
                    onClick={() => actions.addCalories(food.calories)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 border-slate-400 bg-transparent text-white hover:bg-white hover:text-slate-950"
                    onClick={() => actions.removeCalories(food.calories)}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-900 text-white">
          <CardHeader>
            <CardTitle className="text-lg">Kuzatuv paneli</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2 rounded-lg border border-slate-600 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-300">Suv progressi</p>
                <p className="text-sm">{waterProgress}%</p>
              </div>
              <div className="h-2 rounded-full bg-slate-700">
                <div className="h-2 rounded-full bg-white" style={{ width: `${waterProgress}%` }} />
              </div>
              <Button
                variant="outline"
                className="w-full border-slate-500 bg-transparent text-white hover:bg-white hover:text-slate-950"
                onClick={() => actions.addWater(250)}
              >
                <Plus className="h-4 w-4" />
                Suv ichish (+250ml)
              </Button>
            </div>

            <div className="space-y-2 rounded-lg border border-slate-600 p-3">
              <p className="text-sm text-slate-300">Uyquni sozlash</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 border-slate-500 bg-transparent text-white hover:bg-white hover:text-slate-950"
                  onClick={() => actions.setSleepHours(health.sleepHours - 0.5)}
                >
                  <Minus className="h-4 w-4" />
                  0.5h
                </Button>
                <Button
                  className="flex-1 bg-white text-slate-950 hover:bg-slate-200"
                  onClick={() => actions.setSleepHours(health.sleepHours + 0.5)}
                >
                  <Plus className="h-4 w-4" />
                  0.5h
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
