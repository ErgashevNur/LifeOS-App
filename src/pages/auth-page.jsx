import { Button } from "@/components/ui/button";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  isAuthenticated,
  loginUser,
  loginWithGoogle,
  requestPasswordResetCode,
  registerUser,
  resetPasswordWithCode,
  saveAuthSession,
  verifyPasswordResetCode,
} from "@/lib/auth";
import { GoogleLogin } from "@react-oauth/google";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Sparkles,
  Target,
  BookOpen,
  Brain,
  TrendingUp,
  Zap,
  Shield,
  Loader2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
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

const forgotPasswordSchema = z.object({
  email: z.string().email("Email noto'g'ri formatda."),
});

const resetPasswordSchema = z
  .object({
    email: z.string().email("Email noto'g'ri formatda."),
    code: z
      .string()
      .regex(/^\d{6}$/, "Tasdiqlash kodi 6 xonali raqam bo'lishi kerak."),
    newPassword: z.string().min(8, "Yangi parol kamida 8 ta belgidan iborat bo'lsin."),
    confirmNewPassword: z
      .string()
      .min(8, "Parol tasdiqlash maydoni to'ldirilishi kerak."),
  })
  .refine((payload) => payload.newPassword === payload.confirmNewPassword, {
    message: "Yangi parollar mos emas.",
    path: ["confirmNewPassword"],
  });

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function tabFromQuery(value) {
  return value === "register" ? "register" : "login";
}

const GOOGLE_CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "").trim();

const FEATURES = [
  { icon: Target, label: "Maqsadlar", color: "text-indigo-400" },
  { icon: Zap, label: "Odatlar", color: "text-amber-400" },
  { icon: BookOpen, label: "Kitoblar", color: "text-emerald-400" },
  { icon: Brain, label: "AI Murabbiy", color: "text-purple-400" },
  { icon: TrendingUp, label: "Tahlil", color: "text-cyan-400" },
  { icon: Shield, label: "Xavfsiz", color: "text-rose-400" },
];

function GoogleIcon({ className = "h-4 w-4" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className}>
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.44a5.5 5.5 0 0 1-2.39 3.61v2.99h3.86c2.26-2.08 3.58-5.14 3.58-8.63z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.94-2.9l-3.86-2.99c-1.07.72-2.44 1.14-4.08 1.14-3.13 0-5.78-2.11-6.73-4.96H1.28v3.11A11.99 11.99 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29a7.22 7.22 0 0 1 0-4.58V6.6H1.28a12 12 0 0 0 0 10.8l3.99-3.11z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.35.61 4.59 1.79l3.44-3.44C17.95 1.16 15.24 0 12 0A11.99 11.99 0 0 0 1.28 6.6l3.99 3.11c.95-2.85 3.6-4.96 6.73-4.96z"
      />
    </svg>
  );
}

export default function AuthPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const [tab, setTab] = useState(() => tabFromQuery(searchParams.get("tab")));
  const [showPassword, setShowPassword] = useState(false);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
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
  const [resetStep, setResetStep] = useState("hidden");
  const [resetForm, setResetForm] = useState({
    email: "",
    code: "",
    newPassword: "",
    confirmNewPassword: "",
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
    if (!emailFromQuery) return;
    setForm((prev) => ({ ...prev, email: prev.email || emailFromQuery }));
    setResetForm((prev) => ({ ...prev, email: prev.email || emailFromQuery }));
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

  const formTitle = useMemo(() => {
    if (tab === "login" && resetStep === "request") {
      return "Parolni tiklash";
    }
    if (tab === "login" && resetStep === "confirm") {
      return "Kodni tasdiqlash";
    }
    return tab === "login" ? t("auth.login") : t("auth.register");
  }, [tab, resetStep, t]);

  const updateField = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const updateResetField = (field) => (event) => {
    setResetForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const switchTab = (nextTab) => {
    setTab(nextTab);
    setResetStep("hidden");
    setSearchParams({ tab: nextTab });
  };

  const openPasswordReset = () => {
    setResetStep("request");
    setResetForm((prev) => ({
      ...prev,
      email: prev.email || form.email,
      code: "",
      newPassword: "",
      confirmNewPassword: "",
    }));
  };

  const closePasswordReset = () => {
    setResetStep("hidden");
    setResetForm((prev) => ({
      ...prev,
      code: "",
      newPassword: "",
      confirmNewPassword: "",
    }));
  };

  const handleGoogleAuth = async (credentialResponse) => {
    const idToken =
      credentialResponse && typeof credentialResponse.credential === "string"
        ? credentialResponse.credential
        : "";

    if (!idToken) {
      toast({
        variant: "destructive",
        title: "Google auth xatosi",
        description: "Google token olinmadi. Qayta urinib ko'ring.",
      });
      return;
    }

    setIsLoading(true);
    const result = await loginWithGoogle(idToken);
    if (!result.ok) {
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Google orqali kirish xatosi",
        description: result.message,
      });
      return;
    }

    saveAuthSession(result.user);
    setIsLoading(false);
    toast({
      title:
        tab === "register"
          ? "Google orqali ro'yxatdan o'tish muvaffaqiyatli"
          : "Google orqali kirish muvaffaqiyatli",
      description: "Dashboard sahifasiga yo'naltirilyapsiz.",
    });
    navigate("/dashboard", { replace: true });
  };

  const handleForgotPasswordSubmit = async (event) => {
    event.preventDefault();
    const parsed = forgotPasswordSchema.safeParse({
      email: resetForm.email,
    });

    if (!parsed.success) {
      toast({
        variant: "destructive",
        title: "Validatsiya xatoligi",
        description: parsed.error.issues[0]?.message ?? "Emailni tekshiring.",
      });
      return;
    }

    setIsLoading(true);
    const result = await requestPasswordResetCode(parsed.data.email);
    setIsLoading(false);

    if (!result.ok) {
      toast({
        variant: "destructive",
        title: "Kod yuborilmadi",
        description: result.message,
      });
      return;
    }

    setResetStep("confirm");
    toast({
      title: "Agar email tizimda bo'lsa, kod yuborildi",
      description: "Emailingizni tekshirib, tasdiqlash kodini kiriting.",
    });
  };

  const handleResetPasswordSubmit = async (event) => {
    event.preventDefault();
    const parsed = resetPasswordSchema.safeParse(resetForm);

    if (!parsed.success) {
      toast({
        variant: "destructive",
        title: "Validatsiya xatoligi",
        description: parsed.error.issues[0]?.message ?? "Maydonlarni tekshiring.",
      });
      return;
    }

    setIsLoading(true);
    const verifyResult = await verifyPasswordResetCode({
      email: parsed.data.email,
      code: parsed.data.code,
    });
    if (!verifyResult.ok) {
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Tasdiqlash kodi xato",
        description: verifyResult.message,
      });
      return;
    }

    const resetResult = await resetPasswordWithCode({
      email: parsed.data.email,
      code: parsed.data.code,
      newPassword: parsed.data.newPassword,
    });
    setIsLoading(false);

    if (!resetResult.ok) {
      toast({
        variant: "destructive",
        title: "Parolni yangilab bo'lmadi",
        description: resetResult.message,
      });
      return;
    }

    setForm((prev) => ({
      ...prev,
      email: parsed.data.email,
      password: "",
      confirmPassword: "",
    }));
    setResetForm((prev) => ({
      ...prev,
      code: "",
      newPassword: "",
      confirmNewPassword: "",
    }));
    setResetStep("hidden");
    toast({
      title: "Parol muvaffaqiyatli yangilandi",
      description: "Endi yangi parol bilan tizimga kiring.",
    });
  };

  const handleResendResetCode = async () => {
    const parsed = forgotPasswordSchema.safeParse({
      email: resetForm.email,
    });

    if (!parsed.success) {
      toast({
        variant: "destructive",
        title: "Email noto'g'ri",
        description: parsed.error.issues[0]?.message ?? "Emailni tekshiring.",
      });
      return;
    }

    setIsLoading(true);
    const result = await requestPasswordResetCode(parsed.data.email);
    setIsLoading(false);

    if (!result.ok) {
      toast({
        variant: "destructive",
        title: "Kod qayta yuborilmadi",
        description: result.message,
      });
      return;
    }

    toast({
      title: "Kod qayta yuborildi",
      description: "Emailingizni tekshirib, yangi kodni kiriting.",
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
        title: t("auth.messages.login_success"),
        description: t("auth.messages.login_redirect"),
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
      title: t("auth.messages.register_success"),
      description: t("auth.messages.register_redirect"),
    });
    navigate("/welcome", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-indigo-50/40 px-4 py-8 text-slate-950 flex items-center justify-center">
      {/* Background decorative blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-indigo-200/30 blur-3xl" />
        <div className="absolute top-1/2 -right-32 h-96 w-96 rounded-full bg-purple-200/20 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-blue-200/25 blur-3xl" />
      </div>

      <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[1.15fr_1fr] relative z-10">
        {/* ─── Left Panel ─── */}
        <section className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 p-10 text-white md:p-12 shadow-2xl shadow-slate-900/50 ring-1 ring-white/5">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/25 via-transparent to-purple-600/20 pointer-events-none" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative z-10 flex flex-col h-full">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-10">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors border border-white/10 hover:border-white/20 px-4 py-2 rounded-full backdrop-blur-sm"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                {t("auth.back_to_home")}
              </Link>
              <div className="bg-white/5 p-1 rounded-full border border-white/10">
                <LanguageSwitcher />
              </div>
            </div>

            {/* Hero text */}
            <div className="space-y-5 mt-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-[10px] font-black tracking-widest uppercase text-indigo-300">
                <Sparkles className="w-3 h-3" />
                {t("auth.hero_badge")}
              </div>
              <h1 className="max-w-xl text-4xl leading-tight font-extrabold md:text-5xl tracking-tight whitespace-pre-line">
                {t("auth.hero_title")}
              </h1>
              <p className="max-w-md text-base text-slate-400 leading-relaxed">
                {t("auth.hero_desc")}
              </p>
            </div>

            {/* Eye animation */}
            <div className="relative my-10 flex items-center justify-center rounded-3xl border border-white/10 bg-white/[0.03] p-10 backdrop-blur-sm">
              <div className="absolute -left-6 -top-6 h-24 w-24 rounded-full border border-white/5" />
              <div className="absolute -right-4 -bottom-4 h-16 w-16 rounded-full border border-white/5" />
              <div className="flex gap-10 relative z-10">
                {[0, 1].map((index) => (
                  <div
                    key={index}
                    className="flex h-28 w-28 items-center justify-center rounded-full border border-white/15 bg-white/[0.07] shadow-inner relative overflow-hidden"
                  >
                    <AnimatePresence>
                      {isPasswordFocused && (
                        <motion.div
                          initial={{ y: "-100%" }}
                          animate={{ y: "0%" }}
                          exit={{ y: "-100%" }}
                          transition={{ duration: 0.28, ease: "easeInOut" }}
                          className="absolute inset-0 z-20 rounded-full"
                          style={{
                            background:
                              "radial-gradient(ellipse at 50% 50%, #1e293b 60%, transparent 100%)",
                            clipPath: "ellipse(70% 52% at 50% 50%)",
                          }}
                        />
                      )}
                    </AnimatePresence>
                    <div className="relative h-[72px] w-[72px] rounded-full bg-white shadow-lg overflow-hidden">
                      <div className="absolute inset-0 shadow-inner rounded-full pointer-events-none" />
                      <span
                        className="absolute h-7 w-7 rounded-full bg-slate-950 transition-transform duration-75 shadow-inner"
                        style={{
                          left: `calc(50% - 14px + ${eyeOffset.x}px)`,
                          top: `calc(50% - 14px + ${eyeOffset.y}px)`,
                        }}
                      >
                        <span className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-white/70" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature badges */}
            <div className="mt-auto">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">
                Imkoniyatlar
              </p>
              <div className="flex flex-wrap gap-2">
                {FEATURES.map(({ icon: Icon, label, color }) => (
                  <div
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300"
                  >
                    <Icon className={cn("h-3 w-3", color)} />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── Right Panel (Form) ─── */}
        <Card className="border-0 shadow-xl shadow-slate-200/60 ring-1 ring-slate-200/80 rounded-[2.5rem] bg-white/90 backdrop-blur-xl overflow-hidden relative self-center">
          <CardContent className="space-y-7 p-6 md:p-10 relative z-10">
            {/* Tab switcher */}
            <div className="flex rounded-2xl bg-slate-100 p-1.5 ring-1 ring-inset ring-slate-200">
              {["login", "register"].map((t_key) => (
                <button
                  key={t_key}
                  type="button"
                  onClick={() => switchTab(t_key)}
                  className={cn(
                    "flex-1 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-200",
                    tab === t_key
                      ? "bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200/70"
                      : "text-slate-500 hover:text-slate-800",
                  )}
                >
                  {t_key === "login" ? t("auth.buttons.login") : t("auth.buttons.register")}
                </button>
              ))}
            </div>

            {/* Heading */}
            <div>
              <motion.h2
                key={tab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="text-2xl font-extrabold tracking-tight text-slate-900"
              >
                {formTitle}
              </motion.h2>
              <p className="mt-1.5 text-sm text-slate-400">
                {tab === "login" && resetStep !== "hidden"
                  ? "Emailga yuborilgan bir martalik kod bilan parolni yangilang."
                  : t("auth.form_hint")}
              </p>
            </div>

            {/* Form */}
            {tab === "login" && resetStep !== "hidden" ? (
              <form
                className="space-y-4"
                onSubmit={
                  resetStep === "request"
                    ? handleForgotPasswordSubmit
                    : handleResetPasswordSubmit
                }
              >
                <div className="space-y-1.5">
                  <Label
                    htmlFor="reset-email"
                    className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1"
                  >
                    {t("auth.labels.email")}
                  </Label>
                  <Input
                    id="reset-email"
                    type="email"
                    value={resetForm.email}
                    onChange={updateResetField("email")}
                    className="h-12 rounded-xl bg-slate-50 border-0 ring-1 ring-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 font-medium px-4 transition-all"
                    autoComplete="email"
                    disabled={isLoading}
                  />
                </div>

                {resetStep === "confirm" && (
                  <>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="reset-code"
                        className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1"
                      >
                        Tasdiqlash kodi
                      </Label>
                      <Input
                        id="reset-code"
                        value={resetForm.code}
                        onChange={updateResetField("code")}
                        className="h-12 rounded-xl bg-slate-50 border-0 ring-1 ring-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 font-medium px-4 tracking-[0.3em] text-center transition-all"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="000000"
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="reset-password"
                        className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1"
                      >
                        Yangi parol
                      </Label>
                      <div className="relative">
                        <Input
                          id="reset-password"
                          type={showPassword ? "text" : "password"}
                          value={resetForm.newPassword}
                          onChange={updateResetField("newPassword")}
                          onFocus={() => setIsPasswordFocused(true)}
                          onBlur={() => setIsPasswordFocused(false)}
                          className="h-12 rounded-xl bg-slate-50 border-0 ring-1 ring-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 font-medium px-4 pr-12 transition-all"
                          autoComplete="new-password"
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((p) => !p)}
                          className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="reset-confirm-password"
                        className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1"
                      >
                        Yangi parolni tasdiqlang
                      </Label>
                      <Input
                        id="reset-confirm-password"
                        type={showPassword ? "text" : "password"}
                        value={resetForm.confirmNewPassword}
                        onChange={updateResetField("confirmNewPassword")}
                        onFocus={() => setIsPasswordFocused(true)}
                        onBlur={() => setIsPasswordFocused(false)}
                        className="h-12 rounded-xl bg-slate-50 border-0 ring-1 ring-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 font-medium px-4 transition-all"
                        autoComplete="new-password"
                        disabled={isLoading}
                      />
                    </div>
                  </>
                )}

                <div className="pt-1">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="h-12 w-full rounded-xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-500/25 text-sm transition-all duration-200 active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t("auth.buttons.loading")}
                      </span>
                    ) : resetStep === "request" ? (
                      "Kod yuborish"
                    ) : (
                      "Parolni yangilash"
                    )}
                  </Button>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  {resetStep === "confirm" ? (
                    <button
                      type="button"
                      onClick={handleResendResetCode}
                      disabled={isLoading}
                      className="font-semibold text-indigo-600 hover:text-indigo-500 disabled:opacity-60"
                    >
                      Kodni qayta yuborish
                    </button>
                  ) : (
                    <span />
                  )}
                  <button
                    type="button"
                    onClick={closePasswordReset}
                    disabled={isLoading}
                    className="font-semibold text-slate-500 hover:text-slate-700 disabled:opacity-60"
                  >
                    Bekor qilish
                  </button>
                </div>
              </form>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <AnimatePresence mode="wait">
                  {tab === "register" && (
                    <motion.div
                      key="register-fields"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="grid gap-3 md:grid-cols-2 pb-1">
                        {[
                          { id: "auth-firstname", field: "firstName", label: t("auth.labels.firstName"), autoComplete: "given-name", span: 1 },
                          { id: "auth-lastname", field: "lastName", label: t("auth.labels.lastName"), autoComplete: "family-name", span: 1 },
                          { id: "auth-phone", field: "phone", label: t("auth.labels.phone"), autoComplete: "tel", span: 1 },
                          { id: "auth-profession", field: "profession", label: t("auth.labels.profession"), span: 1 },
                          { id: "auth-address", field: "address", label: t("auth.labels.address"), autoComplete: "street-address", span: 2 },
                          { id: "auth-region", field: "region", label: t("auth.labels.region"), span: 1 },
                          { id: "auth-city", field: "city", label: t("auth.labels.city"), span: 1 },
                          { id: "auth-district", field: "district", label: t("auth.labels.district"), span: 2 },
                        ].map(({ id, field, label, autoComplete, span }) => (
                          <div
                            key={id}
                            className={cn("space-y-1.5", span === 2 && "md:col-span-2")}
                          >
                            <Label
                              htmlFor={id}
                              className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1"
                            >
                              {label}
                            </Label>
                            <Input
                              id={id}
                              value={form[field]}
                              onChange={updateField(field)}
                              autoComplete={autoComplete}
                              disabled={isLoading}
                              className="h-11 rounded-xl bg-slate-50 border-0 ring-1 ring-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 font-medium px-4 transition-all"
                            />
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="auth-email"
                    className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1"
                  >
                    {t("auth.labels.email")}
                  </Label>
                  <Input
                    id="auth-email"
                    type="email"
                    value={form.email}
                    onChange={updateField("email")}
                    className="h-12 rounded-xl bg-slate-50 border-0 ring-1 ring-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 font-medium px-4 transition-all"
                    autoComplete="email"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="auth-password"
                    className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1"
                  >
                    {t("auth.labels.password")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="auth-password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={updateField("password")}
                      onFocus={() => setIsPasswordFocused(true)}
                      onBlur={() => setIsPasswordFocused(false)}
                      className="h-12 rounded-xl bg-slate-50 border-0 ring-1 ring-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 font-medium px-4 pr-12 transition-all"
                      autoComplete={tab === "login" ? "current-password" : "new-password"}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {tab === "login" && (
                  <div className="flex justify-end pt-0.5">
                    <button
                      type="button"
                      onClick={openPasswordReset}
                      disabled={isLoading}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 disabled:opacity-60"
                    >
                      Parolni unutdingizmi?
                    </button>
                  </div>
                )}

                <AnimatePresence mode="wait">
                  {tab === "register" && (
                    <motion.div
                      key="confirm-password"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden space-y-1.5"
                    >
                      <Label
                        htmlFor="auth-confirm-password"
                        className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1"
                      >
                        {t("auth.labels.confirmPassword")}
                      </Label>
                      <Input
                        id="auth-confirm-password"
                        type={showPassword ? "text" : "password"}
                        value={form.confirmPassword}
                        onChange={updateField("confirmPassword")}
                        onFocus={() => setIsPasswordFocused(true)}
                        onBlur={() => setIsPasswordFocused(false)}
                        className="h-12 rounded-xl bg-slate-50 border-0 ring-1 ring-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 font-medium px-4 transition-all"
                        autoComplete="new-password"
                        disabled={isLoading}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="pt-1">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="h-12 w-full rounded-xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-500/25 text-sm transition-all duration-200 active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t("auth.buttons.loading")}
                      </span>
                    ) : tab === "login" ? (
                      t("auth.buttons.login")
                    ) : (
                      t("auth.buttons.register")
                    )}
                  </Button>
                </div>
              </form>
            )}

            {/* Social logins */}
            {!(tab === "login" && resetStep !== "hidden") && (
              <div className="pt-1 border-t border-slate-100">
                <p className="text-center text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-4">
                  yoki davom eting
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  {GOOGLE_CLIENT_ID ? (
                    <div className="w-full">
                      <GoogleLogin
                        onSuccess={handleGoogleAuth}
                        onError={() => {
                          toast({
                            variant: "destructive",
                            title: "Google auth xatosi",
                            description:
                              "Google orqali kirishni hozir yakunlab bo'lmadi. Qayta urinib ko'ring.",
                          });
                        }}
                        text={tab === "login" ? "signin_with" : "signup_with"}
                        theme="outline"
                        shape="rectangular"
                        size="large"
                        width="100%"
                      />
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="h-11 w-full rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold transition-all"
                      onClick={() =>
                        toast({
                          variant: "destructive",
                          title: "Google orqali kirish hozircha mavjud emas",
                          description: "Iltimos, birozdan keyin qayta urinib ko'ring.",
                        })
                      }
                      type="button"
                    >
                      <GoogleIcon className="h-4 w-4 mr-2" />
                      Google bilan davom etish
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
