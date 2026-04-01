import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { isAuthenticated, registerUser, saveAuthSession } from "@/lib/auth";
import { ArrowLeft, Loader2 } from "lucide-react";
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
    <div className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-8 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_#1e293b,_transparent_42%),radial-gradient(circle_at_bottom,_#0f172a,_transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,_rgba(255,255,255,0.09)_1px,_transparent_1px),linear-gradient(to_bottom,_rgba(255,255,255,0.09)_1px,_transparent_1px)] bg-[size:52px_52px] opacity-35" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col justify-center gap-10 lg:flex-row lg:items-center lg:justify-between">
        <section className="max-w-xl space-y-6">
          <Button
            variant="ghost"
            className="h-auto p-0 text-sm text-white hover:bg-transparent hover:text-white hover:underline"
            type="button"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-4 w-4" />
            Orqaga
          </Button>
          <div className="inline-flex rounded-full border border-white px-3 py-1 text-xs font-medium tracking-[0.2em] uppercase">
            REGISTER
          </div>
          <h1 className="text-4xl leading-tight font-bold md:text-5xl">
            Yangi akkaunt yarating
          </h1>
          <p className="max-w-lg text-base text-slate-300 md:text-lg">
            Qisqa form orqali ro&apos;yxatdan o&apos;ting. Dizayn minimal, fokus
            faqat kerakli maydonlarda.
          </p>
        </section>

        <Card className="w-full max-w-md border-white bg-white text-slate-950 shadow-[10px_10px_0_0_rgba(255,255,255,0.9)]">
          <CardContent className="space-y-6 pt-8">
            <div>
              <h2 className="text-2xl font-semibold">Create account</h2>
              <p className="mt-1 text-sm text-slate-600">
                Ma&apos;lumotlaringizni kiriting va davom eting.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="register-name">Ism</Label>
                <Input
                  id="register-name"
                  type="text"
                  placeholder="F.I.Sh"
                  autoComplete="name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  disabled={isLoading}
                  className="h-11 border-slate-900/50 focus-visible:ring-slate-900/30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input
                  id="register-email"
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
                <Label htmlFor="register-password">Parol</Label>
                <Input
                  id="register-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={isLoading}
                  className="h-11 border-slate-900/50 focus-visible:ring-slate-900/30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-confirm-password">
                  Parolni tasdiqlang
                </Label>
                <Input
                  id="register-confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
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
                    Yaratilmoqda...
                  </>
                ) : (
                  "Ro'yxatdan o'tish"
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-slate-600">
              Akkauntingiz bormi?{" "}
              <Link
                to="/login"
                className="font-medium text-slate-950 underline"
              >
                Kirish
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
