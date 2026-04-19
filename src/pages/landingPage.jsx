import { Button } from "@/components/ui/button";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/auth";
import {
  ArrowRight, Brain, Target,
  TrendingUp, Zap,
  Bot, Repeat, ChevronRight, Flame,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const MotionDiv = motion.div;

// ── Intro animation constants ─────────────────────────────────────────────────
const INTRO_HOLD_DELAY_MS = 1450;
const INTRO_PARALLEL_DURATION_MS = 1400;
const INTRO_HIDE_DELAY_MS = INTRO_HOLD_DELAY_MS + INTRO_PARALLEL_DURATION_MS + 120;

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
  const logoRef = useRef(null);
  const introTextRef = useRef(null);
  const [content, setContent] = useState(null);
  const [showIntro, setShowIntro] = useState(true);
  const [isIntroMoving, setIsIntroMoving] = useState(false);
  const [introTargetTransform, setIntroTargetTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [scrolled, setScrolled] = useState(false);
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

  const MODULES = [
    { icon: Target,     label: "Maqsadlar",  desc: "Yillik, oylik, kunlik maqsadlarni kuzating",  color: "bg-slate-900" },
    { icon: Repeat,     label: "Odatlar",    desc: "40 kunlik odat treker va streak tizimi",        color: "bg-slate-700" },
    { icon: Zap,        label: "Deep Work",  desc: "Pomodoro va chuqur fokus sessiyalar",           color: "bg-slate-800" },
    { icon: Brain,      label: "Kun rejasi", desc: "Top 3 vazifa va kunlik tizim",                  color: "bg-slate-600" },
    { icon: Bot,        label: "AI Murabbiy",desc: "Shaxsiy AI coach — har doim yoningizda",        color: "bg-slate-900" },
    { icon: TrendingUp, label: "Refleksiya", desc: "Kunlik va haftalik tahlil — o'sish kaliti",     color: "bg-slate-700" },
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

          {/* Right side */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <div className="w-[1px] h-4 bg-slate-200 mx-1" />
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
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
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
            <MotionDiv
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25 }}
              className="relative hidden lg:block"
            >
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
                </div>
              </div>
            </MotionDiv>
          </div>
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
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 max-w-2xl"
          >
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              {t('features.title')}
            </h2>
          </MotionDiv>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {(content?.features || [
              { icon: "Target",     id: "Goal" },
              { icon: "Repeat",     id: "Habits" },
              { icon: "Zap",        id: "AI" },
              { icon: "Brain",      id: "Gamification" },
              { icon: "TrendingUp", id: "Analytics" },
              { icon: "Bot",        id: "Books" },
            ]).map((feature, idx) => {
              const Icon   = ICON_MAP[feature.icon] ?? Target;
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
              { value: "10K+",  label: t('stats.users'),   icon: Bot,    color: "text-slate-700", bg: "bg-slate-100" },
              { value: "500K+", label: t('stats.goals'),   icon: Target, color: "text-slate-700", bg: "bg-slate-100" },
              { value: "1M+",   label: t('stats.streaks'), icon: Flame,  color: "text-slate-700", bg: "bg-slate-100" },
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

      {/* ── Founders Section ── */}
      <section className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
          <div className="mb-16">
            <p className="text-xs font-black tracking-[0.25em] text-slate-400 uppercase mb-4">{t('founders.header')}</p>
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
                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-4 py-1 text-[10px] font-black tracking-widest uppercase text-slate-600">
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
                    <p className="text-slate-500 leading-relaxed text-sm font-medium italic border-l-2 border-slate-300 pl-4 py-1">
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
          <div className="mb-10">
            {/* Brand */}
            <div>
              <p className="text-[17px] font-bold text-slate-900 flex items-center gap-2 mb-3">
                <span className="w-7 h-7 rounded-[7px] bg-black inline-flex items-center justify-center">
                  <span className="text-white font-extrabold text-[16px] leading-none">L</span>
                </span>
                LifeOS
              </p>
              <p className="text-[13px] text-slate-400 leading-relaxed max-w-[280px]">
                Hayotingizni to'liq boshqarish uchun yagona platforma.
              </p>
            </div>
          </div>

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
