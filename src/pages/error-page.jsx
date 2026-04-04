import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function ErrorPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-300 bg-white p-8 text-center">
        <p className="text-xs tracking-[0.18em] text-slate-500 uppercase">LifeOS</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Kutilmagan xatolik</h1>
        <p className="mt-3 text-sm text-slate-600">
          Sahifani yuklashda muammo yuz berdi. Iltimos, sahifani qayta yuklab ko&apos;ring.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Qayta yuklash
          </Button>
          <Button onClick={() => navigate("/", { replace: true })}>Bosh sahifa</Button>
        </div>
      </div>
    </div>
  );
}
