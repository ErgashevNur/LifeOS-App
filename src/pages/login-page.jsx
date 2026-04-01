import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { isAuthenticated, loginUser, saveAuthSession } from "@/lib/auth";
import { ArrowLeft, Loader2 } from "lucide-react";
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
    <div className="relative min-h-screen overflow-hidden bg-white px-4 py-8 text-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_#f1f5f9,_transparent_55%),radial-gradient(circle_at_bottom_right,_#e2e8f0,_transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,_#e2e8f0_1px,_transparent_1px),linear-gradient(to_bottom,_#e2e8f0_1px,_transparent_1px)] bg-[size:46px_46px] opacity-35" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col justify-center gap-10 lg:flex-row lg:items-center lg:justify-between">
        <section className="max-w-xl space-y-6">
          <Button
            variant="ghost"
            className="h-auto p-0 text-sm hover:bg-transparent hover:underline"
            type="button"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-4 w-4" />
            Orqaga
          </Button>
          <div className="inline-flex rounded-full border border-slate-900 px-3 py-1 text-xs font-medium tracking-[0.2em] uppercase">
            LOGIN
          </div>
          <h1 className="text-4xl leading-tight font-bold md:text-5xl">
            LifeOS akkauntingizga kiring
          </h1>
          <p className="max-w-lg text-base text-slate-600 md:text-lg">
            Minimal va toza interfeys. Email va parol orqali tizimga kirib ishni
            davom ettiring.
          </p>
        </section>

        <Card className="w-full max-w-md border-slate-900 bg-white shadow-[10px_10px_0_0_rgba(15,23,42,0.95)]">
          <CardContent className="space-y-6 pt-8">
            <div>
              <h2 className="text-2xl font-semibold">Sign in</h2>
              <p className="mt-1 text-sm text-slate-600">
                Akkauntingizga kirish uchun ma&apos;lumotlarni kiriting.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={isLoading}
                  className="h-11 border-slate-900/50 focus-visible:ring-slate-900/30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Parol</Label>
                <Input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={isLoading}
                  className="h-11 border-slate-900/50 focus-visible:ring-slate-900/30"
                />
              </div>

              <Button
                type="submit"
                className="h-11 w-full rounded-md bg-slate-950 text-white hover:bg-slate-800"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Kirilmoqda...
                  </>
                ) : (
                  "Kirish"
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-slate-600">
              Akkauntingiz yo&apos;qmi?{" "}
              <Link to="/register" className="font-medium text-slate-950 underline">
                Ro&apos;yxatdan o&apos;tish
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
