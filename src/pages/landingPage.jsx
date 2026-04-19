import { Button } from "@/components/ui/button";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/auth";
import {
<<<<<<< HEAD
  ArrowRight, BookOpen, Brain, Sparkles, Target, Trophy,
  TrendingUp, Zap, Check, Star, Users, HeartPulse,
  Wallet, Bot, Repeat, ChevronRight, Play, Flame,
  LayoutDashboard as LayoutDashboardIcon,
  Target as TargetIcon,
  Repeat as RepeatIcon,
  BookOpen as BookOpenIcon,
  Trophy as TrophyIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
=======
  ArrowRight, Brain, Target,
  TrendingUp, Zap,
  Bot, Repeat, ChevronRight, Flame,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
>>>>>>> a982465 (man life os loyihasini hamma modullarini ozgartirdm)

const MotionDiv = motion.div;

// ── Intro animation constants ─────────────────────────────────────────────────
const INTRO_HOLD_DELAY_MS = 1450;
const INTRO_PARALLEL_DURATION_MS = 1400;
const INTRO_HIDE_DELAY_MS = INTRO_HOLD_DELAY_MS + INTRO_PARALLEL_DURATION_MS + 120;

<<<<<<< HEAD
const ICON_MAP = { Target, Brain, Zap, Trophy, BookOpen, TrendingUp };

// ── Feature card color themes ─────────────────────────────────────────────────
const FEATURE_THEMES = {
  Target:     { bg: "bg-amber-50",   icon: "bg-orange-100 text-orange-600",  border: "border-orange-100" },
  Brain:      { bg: "bg-violet-50",  icon: "bg-fuchsia-100 text-fuchsia-600", border: "border-violet-100" },
  Zap:        { bg: "bg-yellow-50",  icon: "bg-amber-100 text-amber-600",    border: "border-yellow-100" },
  Trophy:     { bg: "bg-emerald-50", icon: "bg-emerald-100 text-emerald-600", border: "border-emerald-100" },
  BookOpen:   { bg: "bg-blue-50",    icon: "bg-blue-100 text-blue-600",      border: "border-blue-100" },
  TrendingUp: { bg: "bg-teal-50",    icon: "bg-teal-100 text-teal-600",      border: "border-teal-100" },
};
const DEFAULT_THEME = { bg: "bg-indigo-50", icon: "bg-indigo-100 text-indigo-600", border: "border-indigo-100" };

// ── Marquee strip ─────────────────────────────────────────────────────────────
function MarqueeStrip({ items }) {
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden select-none">
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        className="flex gap-10 items-center whitespace-nowrap"
      >
        {doubled.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-2 text-slate-400 font-semibold text-[13px] uppercase tracking-[0.15em]"
          >
            <span className="w-1 h-1 rounded-full bg-slate-300 inline-block" />
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ── Testimonial card ──────────────────────────────────────────────────────────
function TestimonialCard({ quote, name, role, avatar, delay = 0 }) {
  return (
    <MotionDiv
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="flex flex-col gap-4 rounded-2xl bg-white border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <p className="text-slate-700 text-[15px] leading-relaxed font-medium flex-1">"{quote}"</p>
      <div className="flex items-center gap-3 pt-2 border-t border-slate-50">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {avatar}
        </div>
        <div>
          <p className="text-[13px] font-bold text-slate-900">{name}</p>
          <p className="text-[11px] text-slate-400">{role}</p>
        </div>
      </div>
    </MotionDiv>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { t } = useTranslation();
=======
const ICON_MAP = { Target, Brain, Zap, TrendingUp, Repeat, Bot };

// ── Feature card color themes ─────────────────────────────────────────────────
const FEATURE_THEMES = {
  Target:     { bg: "bg-slate-50",  icon: "bg-slate-200 text-slate-700",  border: "border-slate-200" },
  Brain:      { bg: "bg-slate-50",  icon: "bg-slate-200 text-slate-700",  border: "border-slate-200" },
  Zap:        { bg: "bg-slate-50",  icon: "bg-slate-200 text-slate-700",  border: "border-slate-200" },
  Trophy:     { bg: "bg-slate-50",  icon: "bg-slate-200 text-slate-700",  border: "border-slate-200" },
  BookOpen:   { bg: "bg-slate-50",  icon: "bg-slate-200 text-slate-700",  border: "border-slate-200" },
  TrendingUp: { bg: "bg-slate-50",  icon: "bg-slate-200 text-slate-700",  border: "border-slate-200" },
};
const DEFAULT_THEME = { bg: "bg-slate-50", icon: "bg-slate-200 text-slate-700", border: "border-slate-200" };

// ── Main component ────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
>>>>>>> a982465 (man life os loyihasini hamma modullarini ozgartirdm)
  const logoRef = useRef(null);
  const introTextRef = useRef(null);
  const [content, setContent] = useState(null);
  const [showIntro, setShowIntro] = useState(true);
  const [isIntroMoving, setIsIntroMoving] = useState(false);
  const [introTargetTransform, setIntroTargetTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [scrolled, setScrolled] = useState(false);
<<<<<<< HEAD

  // ── Intro animation ───────────────────────────────────────────────────────
  useEffect(() => {
=======
  const [showLoader, setShowLoader] = useState(false);
  const [loaderIndex, setLoaderIndex] = useState(0);
  const [loaderTarget, setLoaderTarget] = useState("register");

  const LOADER_WORDS = ["Maqsadlar", "Strategiyalar", "Odatlar", "Mahorat", "Muvaffaqiyat"];

  const handleGetStarted = () => {
    setLoaderTarget("register");
    setLoaderIndex(0);
    setShowLoader(true);
  };

  const handleLogin = () => {
    navigate("/auth?tab=login");
  };

  // ── Loader cycle ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!showLoader) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const stepMs = 1400;
    const interval = window.setInterval(() => {
      setLoaderIndex((i) => i + 1);
    }, stepMs);
    const navTimer = window.setTimeout(() => {
      navigate(`/auth?tab=${loaderTarget}`);
    }, stepMs * LOADER_WORDS.length + 500);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(navTimer);
      document.body.style.overflow = previousOverflow;
    };
  }, [showLoader, loaderTarget, navigate]);

  // ── Intro animation ───────────────────────────────────────────────────────
  useEffect(() => {
>>>>>>> a982465 (man life os loyihasini hamma modullarini ozgartirdm)
    if (!showIntro) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const updateIntroTargetTransform = () => {
      if (!logoRef.current || !introTextRef.current) return;
      const logoRect = logoRef.current.getBoundingClientRect();
      const introRect = introTextRef.current.getBoundingClientRect();
      const introCenterX = introRect.left + introRect.width / 2;
      const introCenterY = introRect.top + introRect.height / 2;
      const logoCenterX = logoRect.left + logoRect.width / 2;
      const logoCenterY = logoRect.top + logoRect.height / 2;
      const widthScale = logoRect.width / introRect.width;
      const heightScale = logoRect.height / introRect.height;
      setIntroTargetTransform({
        x: logoCenterX - introCenterX,
        y: logoCenterY - introCenterY,
        scale: Math.min(widthScale, heightScale),
      });
    };

    const initialFrameId = window.requestAnimationFrame(updateIntroTargetTransform);
    window.addEventListener("resize", updateIntroTargetTransform);
    const moveTimer = window.setTimeout(() => { updateIntroTargetTransform(); setIsIntroMoving(true); }, INTRO_HOLD_DELAY_MS);
    const hideTimer = window.setTimeout(() => setShowIntro(false), INTRO_HIDE_DELAY_MS);

    return () => {
      window.clearTimeout(moveTimer);
      window.clearTimeout(hideTimer);
      window.cancelAnimationFrame(initialFrameId);
      window.removeEventListener("resize", updateIntroTargetTransform);
      document.body.style.overflow = previousOverflow;
    };
  }, [showIntro]);

  // ── API content ───────────────────────────────────────────────────────────
  useEffect(() => {
    let active = true;
    apiRequest("/public/landing")
      .then((payload) => { if (active) setContent(payload ?? null); })
      .catch(() => { if (active) setContent(null); });
    return () => { active = false; };
  }, []);

  // ── Navbar scroll ─────────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

<<<<<<< HEAD
  const MARQUEE_ITEMS = [
    "10,000+ Foydalanuvchi", "500K+ Maqsad", "1M+ Streak",
    "Unumdorlik +48%", "Bepul Boshlash", "LifeOS 2.0",
  ];

  const TESTIMONIALS = [
    { quote: "LifeOS mening kundalik hayotimni to'liq o'zgartirdi. Maqsadlarimga erishish ancha osonlashdi!", name: "Asadbek T.", role: "Tadbirkor", avatar: "A" },
    { quote: "Odatlar va fokus taimeri bilan har kuni 3 soat ko'proq samarali ishlayapman.", name: "Malika R.", role: "Designer", avatar: "M" },
    { quote: "Kitoblar bo'limi va AI murabbiy mening o'sishimni ikki baravarga oshirdi.", name: "Jahongir K.", role: "Dasturchi", avatar: "J" },
  ];

  const MODULES = [
    { icon: Target,     label: "Maqsadlar",  desc: "Yillik, oylik, kunlik maqsadlarni kuzating",  color: "bg-orange-500" },
    { icon: Repeat,     label: "Odatlar",    desc: "40 kunlik odat treker va streak tizimi",        color: "bg-emerald-500" },
    { icon: BookOpen,   label: "Kitoblar",   desc: "O'qigan kitoblar va bilimlarni saqlang",        color: "bg-blue-500" },
    { icon: HeartPulse, label: "Sog'liq",    desc: "Kaloriya, suv, uyqu — barchasi bir joyda",     color: "bg-rose-500" },
    { icon: Trophy,     label: "Mahorat",    desc: "Pomodoro bilan ko'nikmalarni rivojlantiring",  color: "bg-violet-500" },
    { icon: Wallet,     label: "Moliya",     desc: "Daromad va xarajatlarni nazorat qiling",        color: "bg-teal-500" },
    { icon: Bot,        label: "AI Murabbiy",desc: "Shaxsiy AI coach — har doim yoningizda",        color: "bg-indigo-500" },
    { icon: Users,      label: "Jamiyat",    desc: "Boshqalar bilan aloqa qiling va ilhom oling",   color: "bg-pink-500" },
=======
  const MODULES = [
    { icon: Target,     label: "Maqsadlar",  desc: "Yillik, oylik, kunlik maqsadlarni kuzating",  color: "bg-slate-900" },
    { icon: Repeat,     label: "Odatlar",    desc: "40 kunlik odat treker va streak tizimi",        color: "bg-slate-700" },
    { icon: Zap,        label: "Deep Work",  desc: "Pomodoro va chuqur fokus sessiyalar",           color: "bg-slate-800" },
    { icon: Brain,      label: "Kun rejasi", desc: "Top 3 vazifa va kunlik tizim",                  color: "bg-slate-600" },
    { icon: Bot,        label: "AI Murabbiy",desc: "Shaxsiy AI coach — har doim yoningizda",        color: "bg-slate-900" },
    { icon: TrendingUp, label: "Refleksiya", desc: "Kunlik va haftalik tahlil — o'sish kaliti",     color: "bg-slate-700" },
>>>>>>> a982465 (man life os loyihasini hamma modullarini ozgartirdm)
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden">

      {/* ── Intro animation ── */}
      {showIntro && (
        <MotionDiv
          initial={{ opacity: 1 }}
          animate={isIntroMoving ? { opacity: 0 } : { opacity: 1 }}
          transition={isIntroMoving
            ? { duration: INTRO_PARALLEL_DURATION_MS / 1000, ease: [0.22, 1, 0.36, 1] }
            : { duration: 0.2 }
          }
          className="pointer-events-none fixed inset-0 z-[120] overflow-hidden bg-slate-950"
        >
          <MotionDiv
            aria-hidden
            initial={{ opacity: 0.2, scale: 0.88 }}
            animate={isIntroMoving
              ? { opacity: 0, scale: 1.24 }
              : { opacity: [0.2, 0.46, 0.3], scale: [0.88, 1.06, 1] }
            }
            transition={isIntroMoving
              ? { duration: INTRO_PARALLEL_DURATION_MS / 1000, ease: [0.22, 1, 0.36, 1] }
              : { duration: 1.8, ease: [0.16, 1, 0.3, 1] }
            }
            className="absolute inset-0"
            style={{ background: "radial-gradient(circle at center, rgba(255,255,255,0.52) 0%, rgba(255,255,255,0.2) 22%, rgba(0,0,0,0.87) 58%, rgba(0,0,0,1) 100%)" }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <MotionDiv
              initial={{ opacity: 0, scale: 1.35, filter: "blur(16px)", letterSpacing: "0.28em", textShadow: "0 0 62px rgba(255,255,255,0.24)" }}
              animate={isIntroMoving
                ? { x: introTargetTransform.x, y: introTargetTransform.y, scale: introTargetTransform.scale, opacity: 1, filter: "blur(0px)", letterSpacing: "-0.02em", textShadow: "0 0 10px rgba(255,255,255,0.2)" }
                : { opacity: 1, scale: 1, filter: "blur(0px)", letterSpacing: "0.02em", textShadow: "0 0 48px rgba(255,255,255,0.9)" }
              }
              transition={isIntroMoving
                ? { duration: INTRO_PARALLEL_DURATION_MS / 1000, ease: [0.22, 1, 0.36, 1] }
                : { duration: 1.3, ease: [0.16, 1, 0.3, 1] }
              }
              ref={introTextRef}
              className="select-none text-5xl font-semibold tracking-[0.08em] text-white md:text-7xl"
            >
              LifeOS
            </MotionDiv>
          </div>
        </MotionDiv>
      )}

<<<<<<< HEAD
      {/* ── Navbar ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-sm"
          : "bg-white/70 backdrop-blur-md"
      }`}>
        <div className="mx-auto flex h-[64px] w-full max-w-7xl items-center justify-between px-6 lg:px-8">
          {/* Logo */}
          <p
            ref={logoRef}
            className="text-[17px] font-bold tracking-tight text-slate-900 select-none cursor-pointer flex items-center gap-2"
          >
            <span className="w-5 h-5 rounded-[5px] bg-violet-600 inline-flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" strokeWidth={2.5} />
            </span>
            LifeOS
          </p>

          {/* Center links */}
          <div className="hidden md:flex items-center gap-1">
            {["Xususiyatlar", "Modullar", "Narxlar", "Blog"].map((item) => (
              <button
                key={item}
                className="px-4 py-2 text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors rounded-lg hover:bg-slate-100"
              >
                {item}
              </button>
            ))}
          </div>
=======
      {/* ── Get Started Loader Overlay (portal to body so it survives route changes) ── */}
      {createPortal(
        <AnimatePresence>
          {showLoader && (
            <MotionDiv
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950"
            >
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-slate-600/20 rounded-full blur-[140px]" />
                <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-slate-500/15 rounded-full blur-[100px]" />
              </div>

              <div className="relative z-10 flex flex-col items-center gap-10">
                <div className="flex items-center gap-3">
                  <span className="w-12 h-12 rounded-[12px] bg-white inline-flex items-center justify-center shadow-2xl shadow-violet-500/30">
                    <span className="text-black font-extrabold text-[26px] leading-none">L</span>
                  </span>
                  <span className="text-white text-2xl font-bold tracking-tight">LifeOS</span>
                </div>

                <div className="h-16 flex items-center justify-center overflow-hidden">
                  <AnimatePresence mode="wait">
                    <MotionDiv
                      key={loaderIndex}
                      initial={{ opacity: 0, y: 28, filter: "blur(10px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -28, filter: "blur(10px)" }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-indigo-200 to-cyan-200 text-4xl md:text-5xl font-extrabold tracking-tight"
                    >
                      {LOADER_WORDS[loaderIndex % LOADER_WORDS.length]}
                    </MotionDiv>
                  </AnimatePresence>
                </div>

                <div className="w-64 h-1 rounded-full bg-white/10 overflow-hidden">
                  <MotionDiv
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: (1400 * LOADER_WORDS.length) / 1000, ease: "linear" }}
                    className="h-full bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400"
                  />
                </div>
              </div>
            </MotionDiv>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* ── Navbar ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-sm"
          : "bg-white/70 backdrop-blur-md"
      }`}>
        <div className="mx-auto flex h-[64px] w-full max-w-7xl items-center justify-between px-6 lg:px-8">
          {/* Logo */}
          <p
            ref={logoRef}
            className="text-[17px] font-bold tracking-tight text-slate-900 select-none cursor-pointer flex items-center gap-2"
          >
            <span className="w-7 h-7 rounded-[7px] bg-black inline-flex items-center justify-center">
              <span className="text-white font-extrabold text-[16px] leading-none">L</span>
            </span>
            LifeOS
          </p>
>>>>>>> a982465 (man life os loyihasini hamma modullarini ozgartirdm)

          {/* Right side */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <div className="w-[1px] h-4 bg-slate-200 mx-1" />
<<<<<<< HEAD
            <Link to="/auth?tab=login">
              <Button
                variant="ghost"
                className="rounded-full px-5 h-9 text-[13px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                {t('common.login')}
              </Button>
            </Link>
            <Link to="/auth?tab=register">
              <Button className="rounded-full px-5 h-9 text-[13px] font-medium bg-violet-600 hover:bg-violet-700 text-white transition-all shadow-sm shadow-violet-500/20">
                {t('common.getStarted')}
              </Button>
            </Link>
=======
            <Button
              onClick={handleLogin}
              variant="ghost"
              className="rounded-full px-5 h-9 text-[13px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {t('common.login')}
            </Button>
            <Button
              onClick={handleGetStarted}
              className="rounded-full px-5 h-9 text-[13px] font-medium bg-slate-900 hover:bg-slate-800 text-white transition-all"
            >
              {t('common.getStarted')}
            </Button>
>>>>>>> a982465 (man life os loyihasini hamma modullarini ozgartirdm)
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
<<<<<<< HEAD
      <section className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden bg-gradient-to-b from-slate-50/80 to-white">
        {/* Background gradients */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-violet-100/60 rounded-full blur-[120px]" />
          <div className="absolute top-1/4 left-0 w-[400px] h-[400px] bg-indigo-100/50 rounded-full blur-[100px]" />
          <div className="absolute top-1/3 right-0 w-[300px] h-[300px] bg-cyan-100/40 rounded-full blur-[80px]" />
          {/* Grid lines */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }}
          />
        </div>

        <div className="mx-auto w-full max-w-7xl px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-[1fr_1fr] gap-16 items-center">

            {/* Left: Text */}
            <div className="space-y-8">
              {/* Eyebrow */}
              <MotionDiv
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-[12px] font-semibold text-violet-600 uppercase tracking-widest">
                  <Sparkles className="w-3 h-3" />
                  LifeOS 2.0 — AI bilan yangilandi
                </span>
              </MotionDiv>

              {/* Headline */}
              <MotionDiv
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <h1 className="text-5xl md:text-6xl lg:text-[4.5rem] font-extrabold tracking-[-0.03em] leading-[1.07] text-slate-900">
                  {t('hero.title1')}{" "}
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-500">
                    {t('hero.title2')}
                  </span>
                </h1>
              </MotionDiv>

              {/* Subtitle */}
              <MotionDiv
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <p className="text-[17px] text-slate-500 leading-relaxed max-w-lg font-light">
                  {t('hero.description')}
                </p>
              </MotionDiv>

              {/* CTAs */}
              <MotionDiv
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap items-center gap-3"
              >
                <Link to="/auth?tab=register">
                  <Button className="rounded-full h-12 px-7 text-[14px] font-semibold bg-violet-600 hover:bg-violet-700 text-white transition-all shadow-lg shadow-violet-500/25 hover:-translate-y-0.5">
                    {t('common.getStarted')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button
                    variant="outline"
                    className="rounded-full h-12 px-7 text-[14px] font-semibold border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all"
                  >
                    <Play className="mr-2 h-3.5 w-3.5 fill-current" />
                    Demo ko'rish
                  </Button>
                </Link>
              </MotionDiv>

              {/* Trust badges */}
              <MotionDiv
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex items-center gap-4 pt-2"
              >
                <div className="flex -space-x-2">
                  {["A","M","S","J","N"].map((l, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold shadow-sm"
                      style={{ background: `hsl(${i * 60 + 240}, 65%, 55%)` }}
                    >
                      {l}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-0.5 mb-0.5">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-[12px] text-slate-400">
                    <span className="text-slate-700 font-semibold">10,000+</span> foydalanuvchi ishonadi
                  </p>
                </div>
              </MotionDiv>
            </div>

            {/* Right: Dashboard Mockup (kept dark — shows the app) */}
=======
      <section className="relative flex items-center pt-28 pb-20 overflow-hidden bg-gradient-to-b from-slate-50 to-white">
        {/* Subtle grid background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 opacity-[0.025]"
            style={{ backgroundImage: "linear-gradient(rgba(15,23,42,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }}
          />
        </div>

        <div className="mx-auto w-full max-w-7xl px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-[1fr_1fr] gap-16 items-center">

            {/* Left: Text */}
            <div className="space-y-8">
              {/* Headline */}
              <MotionDiv
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <h1 className="text-5xl md:text-6xl lg:text-[4.5rem] font-extrabold tracking-[-0.03em] leading-[1.07] text-slate-900">
                  {t('hero.title1')}{" "}
                  <br />
                  <span className="text-slate-500">
                    {t('hero.title2')}
                  </span>
                </h1>
              </MotionDiv>

              {/* Subtitle */}
              <MotionDiv
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <p className="text-[17px] text-slate-500 leading-relaxed max-w-lg font-light">
                  {t('hero.description')}
                </p>
              </MotionDiv>

              {/* CTAs */}
              <MotionDiv
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap items-center gap-3"
              >
                <Button
                  onClick={handleGetStarted}
                  className="rounded-full h-12 px-7 text-[14px] font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-md hover:-translate-y-0.5"
                >
                  {t('common.getStarted')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </MotionDiv>

            </div>

            {/* Right: Growth Chart */}
>>>>>>> a982465 (man life os loyihasini hamma modullarini ozgartirdm)
            <MotionDiv
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25 }}
              className="relative hidden lg:block"
            >
<<<<<<< HEAD
              {/* Glow */}
              <div className="absolute inset-0 bg-violet-200/40 blur-[80px] rounded-3xl scale-95 pointer-events-none" />

              {/* Dashboard card */}
              <div className="relative rounded-2xl bg-[#141414] border border-white/[0.09] shadow-2xl overflow-hidden ring-1 ring-slate-200/20">
                {/* Top bar */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.07] bg-[#191919]">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-[5px] bg-violet-600 flex items-center justify-center">
                      <Zap className="w-3 h-3 text-white" strokeWidth={2.5} />
                    </div>
                    <span className="text-white/80 text-[12px] font-semibold">LifeOS</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                  </div>
                </div>

                <div className="flex">
                  {/* Mini sidebar */}
                  <div className="w-[52px] bg-[#191919] border-r border-white/[0.07] py-4 flex flex-col items-center gap-3">
                    {[
                      { icon: LayoutDashboardIcon, color: "#7C3AED", active: true },
                      { icon: TargetIcon, color: "#3B82F6" },
                      { icon: RepeatIcon, color: "#10B981" },
                      { icon: BookOpenIcon, color: "#F59E0B" },
                      { icon: TrophyIcon, color: "#9333EA" },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${item.active ? "bg-white/10" : "opacity-40"}`}
                      >
                        <item.icon size={14} color={item.active ? item.color : "#888"} />
                      </div>
                    ))}
                  </div>

                  {/* Main content */}
                  <div className="flex-1 p-4 space-y-3">
                    {/* Header row */}
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <p className="text-[10px] text-white/30 font-medium uppercase tracking-widest">Xayrli tong</p>
                        <p className="text-white font-bold text-[15px]">Nurillo 👋</p>
                      </div>
                      <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span className="text-emerald-400 text-[10px] font-bold">Online</span>
                      </div>
                    </div>

                    {/* Stat cards */}
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: "Streak", value: "12🔥", color: "#F97316", bg: "bg-orange-500/10" },
                        { label: "Maqsad", value: "8", color: "#7C3AED", bg: "bg-violet-500/10" },
                        { label: "Fokus", value: "6.4h", color: "#0EA5E9", bg: "bg-sky-500/10" },
                      ].map((s) => (
                        <div key={s.label} className={`${s.bg} rounded-xl p-3 border border-white/[0.05]`}>
                          <p className="text-[9px] text-white/40 font-semibold uppercase tracking-wider">{s.label}</p>
                          <p className="text-white font-bold text-[15px] mt-1" style={{ color: s.color }}>{s.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Progress bars */}
                    <div className="bg-white/[0.04] rounded-xl p-3 border border-white/[0.05] space-y-2.5">
                      <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider">Bugungi maqsadlar</p>
                      {[
                        { label: "Kitob o'qish", pct: 75, color: "#F59E0B" },
                        { label: "Sport", pct: 100, color: "#10B981" },
                        { label: "Dasturlash", pct: 45, color: "#7C3AED" },
                      ].map((g) => (
                        <div key={g.label}>
                          <div className="flex justify-between mb-1">
                            <span className="text-[11px] text-white/60">{g.label}</span>
                            <span className="text-[11px] font-bold" style={{ color: g.color }}>{g.pct}%</span>
                          </div>
                          <div className="h-1.5 bg-white/[0.07] rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${g.pct}%`, backgroundColor: g.color }} />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Habit chips */}
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: "Suv 2L ✓", done: true },
                        { label: "Meditatsiya ✓", done: true },
                        { label: "Dars", done: false },
                      ].map((h) => (
                        <span
                          key={h.label}
                          className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${
                            h.done
                              ? "bg-emerald-500/15 border-emerald-500/25 text-emerald-400"
                              : "bg-white/[0.05] border-white/10 text-white/40"
                          }`}
                        >
                          {h.label}
                        </span>
                      ))}
                    </div>
                  </div>
=======
              {/* Chart card */}
              <div className="relative rounded-2xl bg-white border border-slate-200 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.18)] overflow-hidden">
                {/* Header */}
                <div className="flex items-start justify-between px-7 pt-6 pb-4">
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.18em]">O'sish dinamikasi</p>
                    <div className="flex items-baseline gap-2 mt-2">
                      <p className="text-3xl font-bold text-slate-900 tracking-tight">+48%</p>
                      <span className="text-[12px] font-semibold text-slate-500">unumdorlik</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
                    <TrendingUp className="w-3 h-3 text-slate-600" />
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">12 oy</span>
                  </div>
                </div>

                {/* Bar chart */}
                <div className="px-7 pt-2 pb-7">
                  <div className="relative h-[260px]">
                    {/* Y-axis grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between">
                      {[100, 75, 50, 25, 0].map((v) => (
                        <div key={v} className="flex items-center gap-2">
                          <span className="text-[9px] font-semibold text-slate-300 w-6">{v}</span>
                          <div className="flex-1 border-t border-dashed border-slate-100" />
                        </div>
                      ))}
                    </div>

                    {/* Bars */}
                    <div className="absolute inset-0 pl-8 flex items-end justify-between gap-2">
                      {[
                        { m: "Yan", v: 22 },
                        { m: "Fev", v: 28 },
                        { m: "Mar", v: 34 },
                        { m: "Apr", v: 31 },
                        { m: "May", v: 42 },
                        { m: "Iyn", v: 48 },
                        { m: "Iyl", v: 55 },
                        { m: "Avg", v: 61 },
                        { m: "Sen", v: 68 },
                        { m: "Okt", v: 74 },
                        { m: "Noy", v: 86 },
                        { m: "Dek", v: 95 },
                      ].map((bar, i) => (
                        <div key={bar.m} className="flex-1 flex flex-col items-center justify-end h-full gap-2">
                          <MotionDiv
                            initial={{ height: 0 }}
                            animate={showIntro ? { height: 0 } : { height: `${bar.v}%` }}
                            transition={{ duration: 1.2, delay: showIntro ? 0 : 0.3 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                            className={`w-full rounded-t-md ${i === 11 ? "bg-slate-900" : "bg-slate-300"}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* X-axis labels */}
                  <div className="pl-8 mt-3 flex justify-between gap-2">
                    {["Yan","Fev","Mar","Apr","May","Iyn","Iyl","Avg","Sen","Okt","Noy","Dek"].map((m) => (
                      <span key={m} className="flex-1 text-center text-[9px] font-semibold text-slate-400">{m}</span>
                    ))}
                  </div>
                </div>

                {/* Footer: comparison */}
                <div className="border-t border-slate-100 px-7 py-4 flex items-center justify-between bg-slate-50/40">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-sm bg-slate-300" />
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">O'tgan</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-sm bg-slate-900" />
                      <span className="text-[10px] font-semibold text-slate-700 uppercase tracking-wider">Bugun</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">12 oylik trend</p>
>>>>>>> a982465 (man life os loyihasini hamma modullarini ozgartirdm)
                </div>
              </div>

              {/* Floating stat: Goals */}
              <MotionDiv
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="absolute -bottom-4 -left-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-xl p-3.5 shadow-lg"
              >
                <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Target className="w-4 h-4 text-orange-500" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{t('hero.stats.goals')}</p>
                  <p className="text-[15px] font-bold text-slate-900">{content?.heroStats?.goalsCount || "128,400+"}</p>
                </div>
              </MotionDiv>

              {/* Floating stat: Productivity */}
              <MotionDiv
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="absolute -top-4 -right-5 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 backdrop-blur-xl p-3.5 shadow-lg"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{t('hero.stats.productivity')}</p>
                  <p className="text-[15px] font-bold text-emerald-700">{content?.heroStats?.productivityGrowth || "+48%"}</p>
                </div>
              </MotionDiv>
            </MotionDiv>
          </div>
<<<<<<< HEAD
        </div>
      </section>

      {/* ── Marquee strip ── */}
      <div className="py-5 bg-slate-50 border-y border-slate-100">
        <MarqueeStrip items={MARQUEE_ITEMS} />
      </div>

      {/* ── Hamkorlar ── */}
      <section className="py-16 bg-white border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400 mb-10">
            O'zbekistonning yetakchi tech hamjamiyatlari tomonidan ishlatiladi
          </p>
          <div className="flex flex-wrap justify-center items-center gap-3">
            {[
              { name: "Texno Hub",     abbr: "TH", color: "#7C3AED" },
              { name: "StartupUz",     abbr: "SU", color: "#3B82F6" },
              { name: "IT Park",       abbr: "IP", color: "#10B981" },
              { name: "iCDP",          abbr: "iC", color: "#F59E0B" },
              { name: "Najot Ta'lim",  abbr: "NT", color: "#F43F5E" },
              { name: "PDP Tech",      abbr: "PD", color: "#0EA5E9" },
            ].map((org) => (
              <div
                key={org.name}
                className="group flex items-center gap-3 px-5 py-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all duration-200 cursor-default"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black flex-shrink-0"
                  style={{ backgroundColor: `${org.color}18`, color: org.color, border: `1px solid ${org.color}30` }}
                >
                  {org.abbr}
                </div>
                <span className="text-[13px] font-semibold text-slate-500 group-hover:text-slate-800 transition-colors whitespace-nowrap">
                  {org.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Modules Showcase ── */}
      <section className="py-24 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 max-w-2xl"
          >
            <p className="text-[11px] font-black tracking-[0.25em] text-violet-600 uppercase mb-4">
              Modullar
            </p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              Hayotingizning barcha<br />
              <span className="text-slate-400">qirralarini boshqaring</span>
            </h2>
          </MotionDiv>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div className="grid grid-cols-2 gap-3">
              {MODULES.map((mod, i) => (
                <MotionDiv
                  key={mod.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  className="flex items-center gap-3 rounded-xl bg-white border border-slate-100 p-4 hover:border-slate-200 hover:shadow-sm transition-all cursor-default group"
                >
                  <div className={`w-8 h-8 rounded-lg ${mod.color} flex items-center justify-center flex-shrink-0`}>
                    <mod.icon className="w-4 h-4 text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-slate-800">{mod.label}</p>
                    <p className="text-[11px] text-slate-400 leading-tight mt-0.5 hidden group-hover:block">{mod.desc}</p>
                  </div>
                </MotionDiv>
              ))}
            </div>

            <div className="space-y-4">
              {[
                { title: "Maqsadlarni kuzating", desc: "Yillik strategik maqsaddan tortib kunlik vazifalargacha — hammasi bir tizimda. Progress bar, deadline, va hisoblagich bilan.", icon: Target, color: "text-orange-500", bg: "bg-orange-50", num: "01" },
                { title: "Odatlarni shakllantiring", desc: "40 kunlik grid vizualizatsiya, streak tizimi va kundalik check-in bilan yangi odatlar shakllantiramiz.", icon: Repeat, color: "text-emerald-600", bg: "bg-emerald-50", num: "02" },
                { title: "AI Murabbiy bilan o'sing", desc: "Shaxsiy AI coach sizning ma'lumotlaringizni tahlil qilib, har kuni yangi maslahatlar beradi.", icon: Bot, color: "text-indigo-600", bg: "bg-indigo-50", num: "03" },
              ].map((item, i) => (
                <MotionDiv
                  key={item.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex gap-5 p-5 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all"
                >
                  <div className="flex-shrink-0">
                    <span className="text-[10px] font-black text-slate-300 tracking-widest">{item.num}</span>
                    <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center mt-2`}>
                      <item.icon className={`w-5 h-5 ${item.color}`} strokeWidth={1.75} />
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 mb-1.5">{item.title}</p>
                    <p className="text-[13px] text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                </MotionDiv>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Cards ── */}
      <section className="py-24 bg-white">
=======
        </div>
      </section>

      {/* ── Modules Showcase ── */}
      <section className="py-20 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 max-w-2xl"
          >
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              Hayotingizning barcha<br />
              <span className="text-slate-400">qirralarini boshqaring</span>
            </h2>
          </MotionDiv>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div className="grid grid-cols-2 gap-3">
              {MODULES.map((mod, i) => (
                <MotionDiv
                  key={mod.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  className="flex items-center gap-3 rounded-xl bg-white border border-slate-100 p-4 hover:border-slate-200 hover:shadow-sm transition-all cursor-default group"
                >
                  <div className={`w-8 h-8 rounded-lg ${mod.color} flex items-center justify-center flex-shrink-0`}>
                    <mod.icon className="w-4 h-4 text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-slate-800">{mod.label}</p>
                    <p className="text-[11px] text-slate-400 leading-tight mt-0.5 hidden group-hover:block">{mod.desc}</p>
                  </div>
                </MotionDiv>
              ))}
            </div>

            <div className="space-y-4">
              {[
                { title: "Maqsadlarni kuzating", desc: "Yillik strategik maqsaddan tortib kunlik vazifalargacha — hammasi bir tizimda. Progress bar, deadline, va hisoblagich bilan.", icon: Target, color: "text-slate-700", bg: "bg-slate-100", num: "01" },
                { title: "Odatlarni shakllantiring", desc: "40 kunlik grid vizualizatsiya, streak tizimi va kundalik check-in bilan yangi odatlar shakllantiramiz.", icon: Repeat, color: "text-slate-700", bg: "bg-slate-100", num: "02" },
                { title: "AI Murabbiy bilan o'sing", desc: "Shaxsiy AI coach sizning ma'lumotlaringizni tahlil qilib, har kuni yangi maslahatlar beradi.", icon: Bot, color: "text-slate-700", bg: "bg-slate-100", num: "03" },
              ].map((item, i) => (
                <MotionDiv
                  key={item.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex gap-5 p-5 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all"
                >
                  <div className="flex-shrink-0">
                    <span className="text-[10px] font-black text-slate-300 tracking-widest">{item.num}</span>
                    <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center mt-2`}>
                      <item.icon className={`w-5 h-5 ${item.color}`} strokeWidth={1.75} />
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 mb-1.5">{item.title}</p>
                    <p className="text-[13px] text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                </MotionDiv>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Cards ── */}
      <section className="py-20 bg-white">
>>>>>>> a982465 (man life os loyihasini hamma modullarini ozgartirdm)
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 max-w-2xl"
          >
<<<<<<< HEAD
            <p className="text-[11px] font-black tracking-[0.25em] text-indigo-500 uppercase mb-4">
              {t('features.header')}
            </p>
=======
>>>>>>> a982465 (man life os loyihasini hamma modullarini ozgartirdm)
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              {t('features.title')}
            </h2>
          </MotionDiv>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {(content?.features || [
              { icon: "Target",     id: "Goal" },
<<<<<<< HEAD
              { icon: "Brain",      id: "AI" },
              { icon: "Zap",        id: "Habits" },
              { icon: "Trophy",     id: "Gamification" },
              { icon: "BookOpen",   id: "Books" },
=======
              { icon: "Repeat",     id: "Habits" },
              { icon: "Zap",        id: "AI" },
              { icon: "Brain",      id: "Gamification" },
>>>>>>> a982465 (man life os loyihasini hamma modullarini ozgartirdm)
              { icon: "TrendingUp", id: "Analytics" },
              { icon: "Bot",        id: "Books" },
            ]).map((feature, idx) => {
<<<<<<< HEAD
              const Icon   = ICON_MAP[feature.icon] ?? Sparkles;
=======
              const Icon   = ICON_MAP[feature.icon] ?? Target;
>>>>>>> a982465 (man life os loyihasini hamma modullarini ozgartirdm)
              const theme  = FEATURE_THEMES[feature.icon] || DEFAULT_THEME;
              const title  = t(`features.items.${feature.id || feature.title}.title`);
              const desc   = t(`features.items.${feature.id || feature.title}.description`);
              const isWide = idx === 0;

              return (
                <MotionDiv
                  key={feature.id || feature.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  className={isWide ? "md:col-span-2 lg:col-span-1" : ""}
                >
                  <div className={`group relative h-full overflow-hidden rounded-2xl border ${theme.border} ${theme.bg} p-6 hover:-translate-y-1 transition-all duration-300 hover:shadow-md cursor-default`}>
                    <div className="space-y-4">
                      <div className={`inline-flex w-12 h-12 items-center justify-center rounded-xl ${theme.icon} transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-[18px] font-bold tracking-tight text-slate-900">{title}</p>
                        <p className="mt-1.5 text-[14px] text-slate-500 leading-relaxed">{desc}</p>
                      </div>
                      <button className="flex items-center gap-1 text-[13px] font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                        Ko'proq <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </MotionDiv>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Stats Section ── */}
      <section className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(content?.stats || [
<<<<<<< HEAD
              { value: "10K+",  label: t('stats.users'),   icon: Users,  color: "text-violet-600", bg: "bg-violet-50" },
              { value: "500K+", label: t('stats.goals'),   icon: Target, color: "text-orange-600", bg: "bg-orange-50" },
              { value: "1M+",   label: t('stats.streaks'), icon: Flame,  color: "text-rose-600",   bg: "bg-rose-50" },
=======
              { value: "10K+",  label: t('stats.users'),   icon: Bot,    color: "text-slate-700", bg: "bg-slate-100" },
              { value: "500K+", label: t('stats.goals'),   icon: Target, color: "text-slate-700", bg: "bg-slate-100" },
              { value: "1M+",   label: t('stats.streaks'), icon: Flame,  color: "text-slate-700", bg: "bg-slate-100" },
>>>>>>> a982465 (man life os loyihasini hamma modullarini ozgartirdm)
            ]).map((stat, i) => (
              <MotionDiv
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="flex flex-col items-center justify-center p-10 rounded-2xl bg-white border border-slate-100 shadow-sm hover:-translate-y-1 transition-all duration-300"
              >
                {stat.icon && (
                  <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center mb-4`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                )}
                <p className="text-5xl lg:text-6xl font-extrabold tracking-tighter text-slate-900">{stat.value}</p>
                <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
              </MotionDiv>
            ))}
          </div>
        </div>
      </section>

<<<<<<< HEAD
      {/* ── Testimonials ── */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-[11px] font-black tracking-[0.25em] text-indigo-500 uppercase mb-4">Testimonials</p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
              Foydalanuvchilar nima deydi
            </h2>
          </MotionDiv>
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((item, i) => (
              <TestimonialCard key={i} {...item} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section — Bepul boshlash ── */}
      <section className="py-28 bg-gradient-to-br from-violet-600 to-indigo-700 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-white/10 rounded-full blur-[100px]" />
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-400/20 rounded-full blur-[80px]" />
        </div>
        <MotionDiv
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-3xl px-6 text-center relative z-10"
        >
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1] text-white">
            Hayotingizni bugundan<br />
            <span className="text-violet-200">
              boshqaring
            </span>
          </h2>
          <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto">
            Maqsadlar, odatlar, kitoblar, sog'liq — barchasini bir platformada. Bepul boshlang.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/auth?tab=register">
              <Button className="rounded-full h-13 px-8 text-[15px] font-semibold bg-white text-violet-700 hover:bg-white/95 shadow-xl shadow-violet-900/20 transition-all hover:-translate-y-0.5">
                Bepul boshlash
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button
                variant="outline"
                className="rounded-full h-13 px-8 text-[15px] font-semibold border-white/30 text-white bg-transparent hover:bg-white/10 hover:border-white/50 transition-all"
              >
                Demo ko'rish
              </Button>
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-[13px] text-white/50">
            {["Kredit karta shart emas", "Bepul tarif mavjud", "O'zbek tilida"].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-violet-200" />
                {item}
              </span>
            ))}
          </div>
        </MotionDiv>
      </section>

      {/* ── Founders Section ── */}
      <section className="py-28 bg-slate-50 border-t border-slate-100">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
          <div className="mb-16">
            <p className="text-xs font-black tracking-[0.25em] text-indigo-500 uppercase mb-4">{t('founders.header')}</p>
=======
      {/* ── Founders Section ── */}
      <section className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
          <div className="mb-16">
            <p className="text-xs font-black tracking-[0.25em] text-slate-400 uppercase mb-4">{t('founders.header')}</p>
>>>>>>> a982465 (man life os loyihasini hamma modullarini ozgartirdm)
            <h2 className="text-5xl md:text-6xl font-extrabold tracking-tighter text-slate-900">{t('founders.title')}</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-2 auto-rows-fr items-stretch">
            {(content?.founders || [
              { id: "founder1", image: "/founder1.jpg" },
              { id: "founder2", image: "/founder2.jpg" },
            ]).map((founder, i) => (
              <MotionDiv key={founder.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i*0.1, duration: 0.8, ease: "easeOut" }} viewport={{ once: true }} className="flex">
                <Card className="w-full overflow-hidden border border-slate-100 bg-white rounded-3xl flex flex-col h-full shadow-sm hover:shadow-md transition-shadow">
                  {/* Top: Names */}
                  <div className="p-8 pb-5 space-y-3">
                    <h3 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
                      <span className="block text-xs font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">{founder.id === 'founder1' ? "Ergashev" : "Rahimov"}</span>
                      <span className="block">{founder.id === 'founder1' ? "MuhammadNurulloh" : "Asadbek"}</span>
                    </h3>
<<<<<<< HEAD
                    <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1 text-[10px] font-black tracking-widest uppercase text-indigo-600">
=======
                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-4 py-1 text-[10px] font-black tracking-widest uppercase text-slate-600">
>>>>>>> a982465 (man life os loyihasini hamma modullarini ozgartirdm)
                      {t(`founders.roles.${founder.id === 'founder1' ? 'dev' : 'design'}`)}
                    </div>
                  </div>
                  {/* Middle: Image */}
                  <div className="relative aspect-[3/4] max-w-[380px] mx-auto w-full group overflow-hidden bg-slate-100 rounded-xl shadow-sm mx-6 mb-0" style={{ maxWidth: "calc(100% - 3rem)" }}>
                    <img
                      src={founder.image}
                      alt={t(`founders.names.${founder.id}`)}
                      className="absolute inset-0 h-full w-full object-cover object-top group-hover:scale-105 transition-all duration-1000"
                    />
                  </div>
                  {/* Bottom: Description */}
                  <div className="p-8 pt-6 flex-1 flex flex-col justify-end">
<<<<<<< HEAD
                    <p className="text-slate-500 leading-relaxed text-sm font-medium italic border-l-2 border-indigo-200 pl-4 py-1">
=======
                    <p className="text-slate-500 leading-relaxed text-sm font-medium italic border-l-2 border-slate-300 pl-4 py-1">
>>>>>>> a982465 (man life os loyihasini hamma modullarini ozgartirdm)
                      "{t(`founders.descriptions.${founder.id}`)}"
                    </p>
                  </div>
                </Card>
              </MotionDiv>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-slate-100 pt-12 pb-8">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
<<<<<<< HEAD
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
            {/* Brand */}
            <div className="md:col-span-2">
              <p className="text-[17px] font-bold text-slate-900 flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-[6px] bg-violet-600 inline-flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
=======
          <div className="mb-10">
            {/* Brand */}
            <div>
              <p className="text-[17px] font-bold text-slate-900 flex items-center gap-2 mb-3">
                <span className="w-7 h-7 rounded-[7px] bg-black inline-flex items-center justify-center">
                  <span className="text-white font-extrabold text-[16px] leading-none">L</span>
>>>>>>> a982465 (man life os loyihasini hamma modullarini ozgartirdm)
                </span>
                LifeOS
              </p>
              <p className="text-[13px] text-slate-400 leading-relaxed max-w-[280px]">
                Hayotingizni to'liq boshqarish uchun yagona platforma.
              </p>
            </div>
<<<<<<< HEAD

            {/* Yordam only */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-4">Yordam</p>
              <ul className="space-y-2.5">
                {["Qo'llanma", "FAQ", "Narxlar", "Aloqa"].map((link) => (
                  <li key={link}>
                    <button className="text-[13px] text-slate-500 hover:text-slate-900 transition-colors">
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

=======
          </div>

>>>>>>> a982465 (man life os loyihasini hamma modullarini ozgartirdm)
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
            <p className="text-[12px] text-slate-400">© 2026 LifeOS. {t('common.footerRights')}</p>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <div className="flex gap-3">
                {["𝕏", "in", "▶"].map((icon) => (
                  <button
                    key={icon}
                    className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:border-slate-300 transition-all text-[12px]"
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
