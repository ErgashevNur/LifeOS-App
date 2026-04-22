import { Badge } from "@/components/ui/badge";
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
  registerWithGoogle,
  registerUser,
  saveAuthSession,
} from "@/lib/auth";
import { GoogleLogin } from "@react-oauth/google";
import {
  ArrowLeft,
  AtSign,
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
    firstName: z.string().min(2).max(60),
    lastName: z.string().min(2).max(80),
    phone: z.string().regex(/^\+998\d{9}$/),
    address: z.string().min(5).max(200),
    region: z.string().min(2),
    city: z.string().min(2),
    district: z.string().min(2),
    profession: z.string().min(2),
    confirmPassword: z.string().min(6),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Parollar mos emas.",
    path: ["confirmPassword"],
  });

const GOOGLE_CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "").trim();

export default function AuthPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  const [tab, setTab] = useState(
    searchParams.get("tab") === "register" ? "register" : "login"
  );

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

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) navigate("/dashboard");
  }, []);

  const updateField = (f) => (e) =>
    setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (tab === "login") {
      const parsed = loginSchema.safeParse(form);
      if (!parsed.success) {
        toast({ variant: "destructive", title: "Xato" });
        return;
      }

      setIsLoading(true);
      const res = await loginUser(parsed.data);
      setIsLoading(false);

      if (!res.ok) {
        toast({ variant: "destructive", title: res.message });
        return;
      }

      saveAuthSession(res.user);
      navigate("/dashboard");
      return;
    }

    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) {
      toast({ variant: "destructive", title: "Xato" });
      return;
    }

    setIsLoading(true);
    const res = await registerUser(parsed.data);
    setIsLoading(false);

    if (!res.ok) {
      toast({ variant: "destructive", title: res.message });
      return;
    }

    saveAuthSession(res.user);
    navigate("/welcome");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="grid lg:grid-cols-2 gap-6 max-w-6xl w-full">

        {/* LEFT */}
        <div className="bg-slate-900 text-white p-10 rounded-3xl flex flex-col justify-between">
          <div>
            <Link to="/" className="flex items-center gap-2 text-sm mb-6">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>

            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 rounded-full text-xs mb-4">
              <Sparkles className="w-3 h-3" />
              {t("auth.hero_badge")}
            </div>

            <h1 className="text-4xl font-bold mb-3">
              {t("auth.hero_title")}
            </h1>

            <p className="text-slate-400">
              {t("auth.hero_desc")}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mt-6">
            {[Target, Zap, BookOpen, Brain, TrendingUp, Shield].map((Icon, i) => (
              <div key={i} className="flex items-center gap-1 text-xs bg-white/10 px-2 py-1 rounded-full">
                <Icon className="w-3 h-3" />
                Feature
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <Card className="p-6 rounded-3xl">
          <CardContent className="space-y-4">

            {/* Tabs */}
            <div className="flex gap-2">
              {["login", "register"].map((tkey) => (
                <button
                  key={tkey}
                  onClick={() => setTab(tkey)}
                  className={cn(
                    "flex-1 py-2 rounded-xl",
                    tab === tkey ? "bg-indigo-500 text-white" : "bg-slate-100"
                  )}
                >
                  {tkey}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">

              {tab === "register" && (
                <>
                  <Input placeholder="First name" onChange={updateField("firstName")} />
                  <Input placeholder="Last name" onChange={updateField("lastName")} />
                </>
              )}

              <Input
                type="email"
                placeholder="Email"
                onChange={updateField("email")}
              />

              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  onChange={updateField("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-2 top-2"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>

              {tab === "register" && (
                <Input
                  type="password"
                  placeholder="Confirm"
                  onChange={updateField("confirmPassword")}
                />
              )}

              <Button className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : tab}
              </Button>
            </form>

            {/* Google */}
            {GOOGLE_CLIENT_ID && (
              <GoogleLogin onSuccess={() => {}} />
            )}

          </CardContent>
        </Card>

      </div>
    </div>
  );
}