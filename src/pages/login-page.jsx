import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { isAuthenticated, loginUser, saveAuthSession } from "@/lib/auth";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Xatolik",
        description: "Email va parolni kiriting.",
      });
      return;
    }

    setIsLoading(true);

    const result = await loginUser({
      email: email.trim(),
      password,
    });

    if (!result.ok) {
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Kirish xatosi",
        description: result.message,
      });
      return;
    }

    saveAuthSession(result.user);
    setIsLoading(false);
    toast({
      title: "Kirish muvaffaqiyatli",
      description: "Xush kelibsiz.",
    });
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-8 text-slate-950 flex items-center justify-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_#e0e7ff,_transparent_40%),radial-gradient(circle_at_bottom_right,_#fdf4ff,_transparent_40%)]" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col justify-center gap-10 lg:flex-row lg:items-center lg:justify-between z-10">
        <section className="max-w-xl space-y-8">
          <Button
            variant="ghost"
            className="h-auto p-0 text-sm hover:bg-transparent hover:underline text-slate-500 hover:text-slate-900 transition-colors"
            type="button"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Bosh sahifaga
          </Button>
          
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border-0 ring-1 ring-slate-200 bg-white/50 backdrop-blur-md px-4 py-1.5 text-[10px] font-black tracking-widest uppercase text-slate-600 shadow-sm">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              Tizimga kirish
            </div>
            <h1 className="text-5xl leading-tight font-extrabold md:text-6xl tracking-tight text-slate-900 drop-shadow-sm">
              LifeOS'ga <br className="hidden lg:block"/> Xush Kelibsiz.
            </h1>
            <p className="max-w-md text-lg font-medium text-slate-500 leading-relaxed">
              Shaxsiy rivojlanish, rejalashtirish va unumdorlik platformangiz.
            </p>
          </div>
        </section>

        <Card className="w-full max-w-md border-0 bg-white/60 backdrop-blur-2xl shadow-2xl shadow-slate-300/50 ring-1 ring-white rounded-[2.5rem] overflow-hidden">
          <CardContent className="space-y-8 p-6 md:p-10">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Kirish</h2>
              <p className="mt-2 text-sm font-medium text-slate-500">
                Akkauntingiz ma'lumotlarini kiriting.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={isLoading}
                  className="h-14 rounded-2xl border-0 ring-1 ring-inset ring-slate-200 bg-white/80 focus-visible:ring-2 focus-visible:ring-indigo-500 px-5 font-medium shadow-sm transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Parol</Label>
                <Input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={isLoading}
                  className="h-14 rounded-2xl border-0 ring-1 ring-inset ring-slate-200 bg-white/80 focus-visible:ring-2 focus-visible:ring-indigo-500 px-5 font-medium shadow-sm transition-all"
                />
              </div>

              <Button
                type="submit"
                className="h-14 w-full rounded-2xl font-bold text-base bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/20 transition-transform active:scale-95"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Kirilmoqda...
                  </>
                ) : (
                  "Kirish"
                )}
              </Button>
            </form>

            <div className="pt-4 border-t border-slate-200/60">
              <p className="text-center text-sm font-medium text-slate-500">
                Akkauntingiz yo'qmi?{" "}
                <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
                  Ro'yxatdan o'tish
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
