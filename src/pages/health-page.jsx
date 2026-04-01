import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLifeOSData } from "@/lib/lifeos-store";
import { Link } from "react-router-dom";

export default function HealthPage() {
  const { data } = useLifeOSData();

  return (
    <div className="space-y-4">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Kaloriya</p>
            <p className="text-3xl font-semibold">{data.health.calories} / 2300</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Suv</p>
            <p className="text-3xl font-semibold">{(data.health.waterMl / 1000).toFixed(1)}L / 2.5L</p>
          </CardContent>
        </Card>
        <Card className="border-slate-900 bg-slate-950 text-white">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-300">Uyqu</p>
            <p className="text-3xl font-semibold">{data.health.sleepHours} soat</p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Haftalik sog'liq logi</CardTitle>
          <Link to="/healthy-life">
            <Button>Healthy Life panel</Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.health.logs.map((item) => (
            <div
              key={item.id}
              className="grid gap-2 rounded-lg border border-slate-200 p-3 text-sm sm:grid-cols-4"
            >
              <p className="font-medium">{item.day}</p>
              <p className="text-slate-600">Kaloriya: {item.calories} / 2300</p>
              <p className="text-slate-600">Suv: {(item.waterMl / 1000).toFixed(1)}L / 2.5L</p>
              <p className="text-slate-600">Uyqu: {item.sleepHours} soat</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
