import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { isAuthenticated, registerUser, saveAuthSession } from "@/lib/auth";
import { ArrowLeft, Loader2, Rocket } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!fullName || !email || !password || !confirmPassword) {
      toast({
        variant: "destructive",
        title: "Xatolik",
        description: "Barcha maydonlarni to'ldiring.",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Xatolik",
        description: "Parollar bir xil emas.",
      });
      return;
    }

    setIsLoading(true);

    const result = await registerUser({
      fullName: fullName.trim(),
      email: email.trim(),
      password,
    });

    if (!result.ok) {
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Ro'yxatdan o'tish xatosi",
        description: result.message,
      });
      return;
    }

    saveAuthSession(result.user);
    setIsLoading(false);
    toast({
      title: "Ro'yxatdan o'tish muvaffaqiyatli",
      description: "Akkaunt yaratildi va tizimga kirildi.",
    });
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-8 text-white flex items-center justify-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_#312e81,_transparent_40%),radial-gradient(circle_at_bottom_left,_#020617,_transparent_60%)]" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col justify-center gap-10 lg:flex-row lg:items-center lg:justify-between z-10">
        <section className="max-w-xl space-y-8">
          <Button
            variant="ghost"
            className="h-auto p-0 text-sm hover:bg-transparent hover:underline text-slate-400 hover:text-white transition-colors"
            type="button"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Bosh sahifaga
          </Button>
          
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border-0 ring-1 ring-white/10 bg-white/5 backdrop-blur-md px-4 py-1.5 text-[10px] font-black tracking-widest uppercase text-slate-300 shadow-sm">
              <Rocket className="w-3 h-3 text-indigo-400" />
              Yangi Platforma
            </div>
            <h1 className="text-5xl leading-tight font-extrabold md:text-6xl tracking-tight text-white drop-shadow-sm">
              Yangi Hayotni <br className="hidden lg:block"/> Boshlang.
            </h1>
            <p className="max-w-md text-lg font-medium text-slate-400 leading-relaxed">
              O'z maqsadlaringizga erishing, sog'ligingizni nazorat qiling va jamoa toping.
            </p>
          </div>
        </section>

        <Card className="w-full max-w-md border-0 bg-slate-900/40 backdrop-blur-3xl shadow-2xl shadow-black/80 ring-1 ring-white/10 rounded-[2.5rem] overflow-hidden text-white">
          <CardContent className="space-y-8 p-6 md:p-10">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-white">Ro'yxatdan o'tish</h2>
              <p className="mt-2 text-sm font-medium text-slate-400">
                Profilingizni yarating.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="register-name" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">F.I.Sh</Label>
                <Input
                  id="register-name"
                  type="text"
                  placeholder="Ism va Familiya"
                  autoComplete="name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  disabled={isLoading}
                  className="h-14 rounded-2xl border-0 ring-1 ring-inset ring-white/10 bg-white/5 focus-visible:ring-2 focus-visible:ring-indigo-500 px-5 font-medium placeholder:text-slate-500 text-white transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Email</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={isLoading}
                 className="h-14 rounded-2xl border-0 ring-1 ring-inset ring-white/10 bg-white/5 focus-visible:ring-2 focus-visible:ring-indigo-500 px-5 font-medium placeholder:text-slate-500 text-white transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Parol</Label>
                <Input
                  id="register-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={isLoading}
                 className="h-14 rounded-2xl border-0 ring-1 ring-inset ring-white/10 bg-white/5 focus-visible:ring-2 focus-visible:ring-indigo-500 px-5 font-medium placeholder:text-slate-500 text-white transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-confirm-password" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
                  Parolni tasdiqlang
                </Label>
                <Input
                  id="register-confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  disabled={isLoading}
                  className="h-14 rounded-2xl border-0 ring-1 ring-inset ring-white/10 bg-white/5 focus-visible:ring-2 focus-visible:ring-indigo-500 px-5 font-medium placeholder:text-slate-500 text-white transition-all"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="h-14 w-full rounded-2xl font-bold text-base bg-indigo-500 hover:bg-indigo-400 text-white shadow-xl shadow-indigo-500/20 py-2.5 transition-transform active:scale-95"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Yaratilmoqda...
                    </>
                  ) : (
                    "Ro'yxatdan o'tish"
                  )}
                </Button>
              </div>
            </form>

            <div className="pt-4 border-t border-white/10">
              <p className="text-center text-sm font-medium text-slate-400">
                Akkauntingiz bormi?{" "}
                <Link
                  to="/login"
                  className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Kirish
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
