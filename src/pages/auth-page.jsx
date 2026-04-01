import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  isAuthenticated,
  loginUser,
  registerUser,
  saveAuthSession,
} from "@/lib/auth";
import { ArrowLeft, AtSign, Eye, EyeOff, Globe } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

const loginSchema = z.object({
  email: z.string().email("Email noto'g'ri formatda."),
  password: z.string().min(6, "Parol kamida 6 ta belgidan iborat bo'lsin."),
});

const registerSchema = loginSchema
  .extend({
    firstName: z
      .string()
      .min(2, "Ism kamida 2 ta belgidan iborat bo'lsin.")
      .max(60, "Ism juda uzun."),
    lastName: z
      .string()
      .min(2, "Familiya kamida 2 ta belgidan iborat bo'lsin.")
      .max(80, "Familiya juda uzun."),
    phone: z
      .string()
      .regex(/^\+998\d{9}$/, "Telefon raqam +998XXXXXXXXX formatda bo'lsin."),
    address: z
      .string()
      .min(5, "Yashash manzilini to'liqroq kiriting.")
      .max(200, "Manzil juda uzun."),
    region: z.string().min(2, "Viloyat nomini kiriting."),
    city: z.string().min(2, "Shahar nomini kiriting."),
    district: z.string().min(2, "Tuman nomini kiriting."),
    profession: z.string().min(2, "Kasbni kiriting."),
    confirmPassword: z.string().min(6, "Parol tasdiqlash kerak."),
  })
  .refine((payload) => payload.password === payload.confirmPassword, {
    message: "Parollar mos emas.",
    path: ["confirmPassword"],
  });

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function tabFromQuery(value) {
  return value === "register" ? "register" : "login";
}

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const [tab, setTab] = useState(() => tabFromQuery(searchParams.get("tab")));
  const [showPassword, setShowPassword] = useState(false);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "+998",
    address: "",
    region: "",
    city: "",
    district: "",
    profession: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    setTab(tabFromQuery(searchParams.get("tab")));
  }, [searchParams]);

  useEffect(() => {
    const emailFromQuery = searchParams.get("email");
    if (!emailFromQuery) {
      return;
    }
    setForm((prev) => ({
      ...prev,
      email: prev.email || emailFromQuery,
    }));
  }, [searchParams]);

  useEffect(() => {
    const handleMouseMove = (event) => {
      const centerX = window.innerWidth * 0.25;
      const centerY = window.innerHeight * 0.5;
      const x = clamp((event.clientX - centerX) / 28, -8, 8);
      const y = clamp((event.clientY - centerY) / 28, -8, 8);

      setEyeOffset({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const formTitle = useMemo(
    () => (tab === "login" ? "Kirish" : "Ro'yxatdan o'tish"),
    [tab],
  );

  const updateField = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const switchTab = (nextTab) => {
    setTab(nextTab);
    setSearchParams({ tab: nextTab });
  };

  const handleSocialLogin = (provider) => {
    toast({
      title: `${provider} orqali kirish`,
      description: "Bu integratsiya tez orada yoqiladi.",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (tab === "login") {
      const parsed = loginSchema.safeParse({
        email: form.email,
        password: form.password,
      });

      if (!parsed.success) {
        toast({
          variant: "destructive",
          title: "Validatsiya xatoligi",
          description: parsed.error.issues[0]?.message ?? "Formani tekshiring.",
        });
        return;
      }

      setIsLoading(true);

      const result = await loginUser({
        email: parsed.data.email,
        password: parsed.data.password,
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
        description: "Dashboard sahifasiga yo'naltirilyapsiz.",
      });
      navigate("/dashboard", { replace: true });

      return;
    }

    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) {
      toast({
        variant: "destructive",
        title: "Validatsiya xatoligi",
        description: parsed.error.issues[0]?.message ?? "Formani tekshiring.",
      });
      return;
    }

    setIsLoading(true);

    const result = await registerUser({
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      address: parsed.data.address,
      region: parsed.data.region,
      city: parsed.data.city,
      district: parsed.data.district,
      profession: parsed.data.profession,
      password: parsed.data.password,
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
      description: "Profil yaratildi va tizimga kirdingiz.",
    });
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen bg-white px-4 py-8 text-slate-950">
      <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[1.2fr_1fr]">
        <section className="relative overflow-hidden rounded-2xl border border-slate-900 bg-slate-950 p-6 text-white md:p-8">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-slate-200 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Bosh sahifaga qaytish
          </Link>

          <div className="relative space-y-6">
            <Badge className="bg-white text-slate-950 hover:bg-white">Auth</Badge>
            <h1 className="max-w-xl text-4xl leading-tight font-semibold md:text-5xl">
              Login va register bitta oynada, minimal oq-qora uslubda.
            </h1>
            <p className="max-w-md text-slate-300">
              Chap tarafdagi ko'zchalar sichqonchani kuzatadi. O'ng tarafda Zod
              validatsiya bilan forma ishlaydi.
            </p>
          </div>

          <div className="relative mt-10 flex items-center justify-center rounded-2xl border border-white/20 bg-white/5 p-10">
            <div className="absolute -left-8 -top-8 h-24 w-24 rounded-full border border-white/20" />
            <div className="absolute -right-6 -bottom-6 h-20 w-20 rounded-full border border-white/20" />
            <div className="grid grid-cols-2 gap-8">
              {[0, 1].map((index) => (
                <div
                  key={index}
                  className="flex h-24 w-24 items-center justify-center rounded-full border border-white/30 bg-white/10"
                >
                  <div className="relative h-14 w-14 rounded-full bg-white">
                    <span
                      className="absolute h-5 w-5 rounded-full bg-slate-950 transition-transform duration-75"
                      style={{
                        left: `calc(50% - 10px + ${eyeOffset.x}px)`,
                        top: `calc(50% - 10px + ${eyeOffset.y}px)`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Card className="border-slate-900">
          <CardContent className="space-y-6 pt-8">
            <div className="flex rounded-lg border border-slate-300 p-1">
              <button
                type="button"
                onClick={() => switchTab("login")}
                className={
                  tab === "login"
                    ? "flex-1 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white"
                    : "flex-1 rounded-md px-3 py-2 text-sm font-medium text-slate-600"
                }
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => switchTab("register")}
                className={
                  tab === "register"
                    ? "flex-1 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white"
                    : "flex-1 rounded-md px-3 py-2 text-sm font-medium text-slate-600"
                }
              >
                Register
              </button>
            </div>

            <div>
              <h2 className="text-2xl font-semibold">{formTitle}</h2>
              <p className="mt-1 text-sm text-slate-500">
                Demo account: `user@example.com` / `123456`.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {tab === "register" ? (
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="auth-firstname">Ism</Label>
                    <Input
                      id="auth-firstname"
                      value={form.firstName}
                      onChange={updateField("firstName")}
                      className="h-11"
                      autoComplete="given-name"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="auth-lastname">Familiya</Label>
                    <Input
                      id="auth-lastname"
                      value={form.lastName}
                      onChange={updateField("lastName")}
                      className="h-11"
                      autoComplete="family-name"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="auth-phone">Telefon</Label>
                    <Input
                      id="auth-phone"
                      value={form.phone}
                      onChange={updateField("phone")}
                      className="h-11"
                      autoComplete="tel"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="auth-profession">Kasb</Label>
                    <Input
                      id="auth-profession"
                      value={form.profession}
                      onChange={updateField("profession")}
                      className="h-11"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="auth-address">Yashash manzili</Label>
                    <Input
                      id="auth-address"
                      value={form.address}
                      onChange={updateField("address")}
                      className="h-11"
                      autoComplete="street-address"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="auth-region">Viloyat</Label>
                    <Input
                      id="auth-region"
                      value={form.region}
                      onChange={updateField("region")}
                      className="h-11"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="auth-city">Shahar</Label>
                    <Input
                      id="auth-city"
                      value={form.city}
                      onChange={updateField("city")}
                      className="h-11"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="auth-district">Tuman</Label>
                    <Input
                      id="auth-district"
                      value={form.district}
                      onChange={updateField("district")}
                      className="h-11"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="auth-email">Email</Label>
                <Input
                  id="auth-email"
                  type="email"
                  value={form.email}
                  onChange={updateField("email")}
                  className="h-11"
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="auth-password">Parol</Label>
                <div className="relative">
                  <Input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={updateField("password")}
                    className="h-11 pr-12"
                    autoComplete={
                      tab === "login" ? "current-password" : "new-password"
                    }
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-slate-500"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {tab === "register" ? (
                <div className="space-y-2">
                  <Label htmlFor="auth-confirm-password">Parolni tasdiqlang</Label>
                  <Input
                    id="auth-confirm-password"
                    type={showPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={updateField("confirmPassword")}
                    className="h-11"
                    autoComplete="new-password"
                    disabled={isLoading}
                  />
                </div>
              ) : null}

              <Button type="submit" className="h-11 w-full" disabled={isLoading}>
                {isLoading
                  ? "Yuborilmoqda..."
                  : tab === "login"
                    ? "Kirish"
                    : "Ro'yxatdan o'tish"}
              </Button>
            </form>

            <div className="space-y-2">
              <Button
                variant="outline"
                className="h-11 w-full"
                onClick={() => handleSocialLogin("Github")}
                type="button"
              >
                <AtSign className="h-4 w-4" />
                Github bilan kirish
              </Button>
              <Button
                variant="outline"
                className="h-11 w-full"
                onClick={() => handleSocialLogin("Google")}
                type="button"
              >
                <Globe className="h-4 w-4" />
                Google bilan kirish
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
