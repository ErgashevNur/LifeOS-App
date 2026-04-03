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
import { cn } from "@/lib/utils";
import { ArrowLeft, AtSign, Eye, EyeOff, Globe, Sparkles } from "lucide-react";
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
    () => (tab === "login" ? "Akkauntga Kirish" : "Ro'yxatdan o'tish"),
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
    <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 flex items-center justify-center">
      <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[1.2fr_1fr] relative z-10">
        <section className="relative overflow-hidden rounded-[3rem] border-0 ring-1 ring-slate-900/10 bg-slate-950 p-10 text-white md:p-12 shadow-2xl shadow-slate-900/40">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 mix-blend-overlay pointer-events-none" />
          
          <div className="relative z-10">
            <Link
              to="/"
              className="mb-8 inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors border border-white/10 px-4 py-2 rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
              Bosh sahifaga
            </Link>

            <div className="space-y-6 mt-6">
              <div className="inline-flex items-center gap-2 rounded-full border-0 bg-white px-4 py-1.5 text-[10px] font-black tracking-widest uppercase text-slate-900 shadow-sm">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                Soha Lideri
              </div>
              <h1 className="max-w-xl text-5xl leading-tight font-extrabold md:text-6xl tracking-tight drop-shadow-sm">
                Barcha imkoniyatlar <br /> bitta joyda.
              </h1>
              <p className="max-w-md text-lg text-slate-300 font-medium leading-relaxed">
                Platformaga qo'shiling va haqiqiy potensialingizni oching. Interfaol kuzatuvchi sizni kutmoqda.
              </p>
            </div>

            <div className="relative mt-16 flex items-center justify-center rounded-[2.5rem] border border-white/10 bg-white/5 p-12 backdrop-blur-md">
              <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full border border-white/10 mix-blend-overlay" />
              <div className="absolute -right-6 -bottom-6 h-24 w-24 rounded-full border border-white/10 mix-blend-overlay" />
              <div className="grid grid-cols-2 gap-10 relative z-10">
                {[0, 1].map((index) => (
                  <div
                    key={index}
                    className="flex h-32 w-32 items-center justify-center rounded-full border border-white/20 bg-white/10 shadow-inner"
                  >
                    <div className="relative h-20 w-20 rounded-full bg-white shadow-lg overflow-hidden">
                       <div className="absolute inset-0 shadow-inner rounded-full pointer-events-none" />
                      <span
                        className="absolute h-8 w-8 rounded-full bg-indigo-600 transition-transform duration-75 shadow-inner"
                        style={{
                          left: `calc(50% - 16px + ${eyeOffset.x}px)`,
                          top: `calc(50% - 16px + ${eyeOffset.y}px)`,
                        }}
                      >
                         <span className="absolute top-2 left-2 w-2 h-2 rounded-full bg-white/60"></span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <Card className="border-0 shadow-xl shadow-slate-200/50 ring-1 ring-slate-100 rounded-[3rem] bg-white overflow-hidden relative self-center">
          <CardContent className="space-y-8 p-6 md:p-10 relative z-10">
            <div className="flex rounded-2xl bg-slate-50 p-1.5 ring-1 ring-inset ring-slate-200">
              <button
                type="button"
                onClick={() => switchTab("login")}
                className={cn(
                  "flex-1 rounded-xl px-4 py-3 text-sm font-bold transition-all",
                  tab === "login"
                    ? "bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200/50"
                    : "text-slate-500 hover:text-slate-900"
                )}
              >
                Kirish
              </button>
              <button
                type="button"
                onClick={() => switchTab("register")}
                 className={cn(
                  "flex-1 rounded-xl px-4 py-3 text-sm font-bold transition-all",
                  tab === "register"
                    ? "bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200/50"
                    : "text-slate-500 hover:text-slate-900"
                )}
              >
                Ro'yxatdan o'tish
              </button>
            </div>

            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">{formTitle}</h2>
              <p className="mt-2 text-sm font-medium text-slate-500">
                Bu umumiy auth qismi. Email va parol kerak.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {tab === "register" ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                     <Label htmlFor="auth-firstname" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Ism</Label>
                    <Input
                      id="auth-firstname"
                      value={form.firstName}
                      onChange={updateField("firstName")}
                      className="h-12 rounded-xl bg-slate-50 border-0 ring-1 ring-slate-200 focus-visible:ring-indigo-500 font-medium px-4"
                      autoComplete="given-name"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="auth-lastname" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Familiya</Label>
                    <Input
                      id="auth-lastname"
                      value={form.lastName}
                      onChange={updateField("lastName")}
                       className="h-12 rounded-xl bg-slate-50 border-0 ring-1 ring-slate-200 focus-visible:ring-indigo-500 font-medium px-4"
                      autoComplete="family-name"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="auth-phone" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Telefon</Label>
                    <Input
                      id="auth-phone"
                      value={form.phone}
                      onChange={updateField("phone")}
                       className="h-12 rounded-xl bg-slate-50 border-0 ring-1 ring-slate-200 focus-visible:ring-indigo-500 font-medium px-4"
                      autoComplete="tel"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="auth-profession" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Kasb</Label>
                    <Input
                      id="auth-profession"
                      value={form.profession}
                      onChange={updateField("profession")}
                       className="h-12 rounded-xl bg-slate-50 border-0 ring-1 ring-slate-200 focus-visible:ring-indigo-500 font-medium px-4"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                     <Label htmlFor="auth-address" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Yashash manzili</Label>
                    <Input
                      id="auth-address"
                      value={form.address}
                      onChange={updateField("address")}
                       className="h-12 rounded-xl bg-slate-50 border-0 ring-1 ring-slate-200 focus-visible:ring-indigo-500 font-medium px-4"
                      autoComplete="street-address"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="auth-region" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Viloyat</Label>
                    <Input
                      id="auth-region"
                      value={form.region}
                      onChange={updateField("region")}
                       className="h-12 rounded-xl bg-slate-50 border-0 ring-1 ring-slate-200 focus-visible:ring-indigo-500 font-medium px-4"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="auth-city" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Shahar</Label>
                    <Input
                      id="auth-city"
                      value={form.city}
                      onChange={updateField("city")}
                       className="h-12 rounded-xl bg-slate-50 border-0 ring-1 ring-slate-200 focus-visible:ring-indigo-500 font-medium px-4"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="auth-district" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Tuman</Label>
                    <Input
                      id="auth-district"
                      value={form.district}
                      onChange={updateField("district")}
                       className="h-12 rounded-xl bg-slate-50 border-0 ring-1 ring-slate-200 focus-visible:ring-indigo-500 font-medium px-4"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="auth-email" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Email</Label>
                <Input
                  id="auth-email"
                  type="email"
                  value={form.email}
                  onChange={updateField("email")}
                  className="h-14 rounded-2xl bg-slate-50 border-0 ring-1 ring-slate-200 focus-visible:ring-indigo-500 font-medium px-5"
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="auth-password" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Parol</Label>
                <div className="relative">
                  <Input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={updateField("password")}
                    className="h-14 rounded-2xl bg-slate-50 border-0 ring-1 ring-slate-200 focus-visible:ring-indigo-500 font-medium px-5 pr-12"
                    autoComplete={
                      tab === "login" ? "current-password" : "new-password"
                    }
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-2 inline-flex w-10 items-center justify-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {tab === "register" ? (
                <div className="space-y-2">
                  <Label htmlFor="auth-confirm-password" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Parolni tasdiqlang</Label>
                  <Input
                    id="auth-confirm-password"
                    type={showPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={updateField("confirmPassword")}
                    className="h-14 rounded-2xl bg-slate-50 border-0 ring-1 ring-slate-200 focus-visible:ring-indigo-500 font-medium px-5"
                    autoComplete="new-password"
                    disabled={isLoading}
                  />
                </div>
              ) : null}

              <div className="pt-2">
                <Button type="submit" className="h-14 w-full rounded-2xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/20 text-base" disabled={isLoading}>
                  {isLoading
                    ? "Yuborilmoqda..."
                    : tab === "login"
                      ? "Kirish"
                      : "Ro'yxatdan o'tish"}
                </Button>
              </div>
            </form>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                className="h-12 flex-1 rounded-xl bg-white border-0 ring-1 ring-slate-200 font-bold text-slate-600 shadow-sm hover:shadow-md hover:ring-slate-300 transition-all"
                onClick={() => handleSocialLogin("Github")}
                type="button"
              >
                <AtSign className="h-4 w-4 mr-2" />
                Github
              </Button>
              <Button
                variant="outline"
                className="h-12 flex-1 rounded-xl bg-white border-0 ring-1 ring-slate-200 font-bold text-slate-600 shadow-sm hover:shadow-md hover:ring-slate-300 transition-all"
                onClick={() => handleSocialLogin("Google")}
                type="button"
              >
                <Globe className="h-4 w-4 mr-2" />
                Google
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
