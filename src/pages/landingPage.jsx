import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/auth";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Sparkles,
  Target,
  Trophy,
  TrendingUp,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import heroImage from "/hero-v3.png";

const MotionDiv = motion.div;

const ICON_MAP = {
  Target,
  Brain,
  Zap,
  Trophy,
  BookOpen,
  TrendingUp,
};

const INTRO_HOLD_DELAY_MS = 1450;
const INTRO_PARALLEL_DURATION_MS = 1400;
const INTRO_HIDE_DELAY_MS =
  INTRO_HOLD_DELAY_MS + INTRO_PARALLEL_DURATION_MS + 120;

const MODULE_STYLES = {
  Target: {
    bg: "bg-orange-100 text-orange-600",
    border: "group-hover:border-orange-500/40",
    glow: "group-hover:shadow-[0_0_40px_-10px_rgba(249,115,22,0.4)]",
    blob1: "bg-orange-400/40",
    blob2: "bg-red-400/40",
  },
  Brain: {
    bg: "bg-fuchsia-100 text-fuchsia-600",
    border: "group-hover:border-fuchsia-500/40",
    glow: "group-hover:shadow-[0_0_40px_-10px_rgba(217,70,239,0.4)]",
    blob1: "bg-fuchsia-400/40",
    blob2: "bg-purple-400/40",
  },
  Zap: {
    bg: "bg-amber-100 text-amber-600",
    border: "group-hover:border-amber-500/40",
    glow: "group-hover:shadow-[0_0_40px_-10px_rgba(245,158,11,0.4)]",
    blob1: "bg-amber-400/40",
    blob2: "bg-yellow-400/40",
  },
  Trophy: {
    bg: "bg-yellow-100 text-yellow-600",
    border: "group-hover:border-yellow-500/40",
    glow: "group-hover:shadow-[0_0_40px_-10px_rgba(234,179,8,0.4)]",
    blob1: "bg-yellow-400/40",
    blob2: "bg-orange-300/40",
  },
  BookOpen: {
    bg: "bg-blue-100 text-blue-600",
    border: "group-hover:border-blue-500/40",
    glow: "group-hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.4)]",
    blob1: "bg-blue-400/40",
    blob2: "bg-indigo-400/40",
  },
  TrendingUp: {
    bg: "bg-emerald-100 text-emerald-600",
    border: "group-hover:border-emerald-500/40",
    glow: "group-hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.4)]",
    blob1: "bg-emerald-400/40",
    blob2: "bg-teal-400/40",
  },
};

const DEFAULT_MODULE_STYLE = {
  bg: "bg-indigo-100 text-indigo-600",
  border: "group-hover:border-indigo-500/40",
  glow: "group-hover:shadow-[0_0_40px_-10px_rgba(99,102,241,0.4)]",
  blob1: "bg-indigo-400/40",
  blob2: "bg-violet-400/40",
};

export default function LandingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const logoRef = useRef(null);
  const introTextRef = useRef(null);
  const [content, setContent] = useState(null);
  const [showIntro, setShowIntro] = useState(true);
  const [isIntroMoving, setIsIntroMoving] = useState(false);
  const [introTargetTransform, setIntroTargetTransform] = useState({
    x: 0,
    y: 0,
    scale: 1,
  });

  useEffect(() => {
    if (!showIntro) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const updateIntroTargetTransform = () => {
      if (!logoRef.current || !introTextRef.current) {
        return;
      }

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

    const initialFrameId = window.requestAnimationFrame(
      updateIntroTargetTransform,
    );
    window.addEventListener("resize", updateIntroTargetTransform);

    const moveTimer = window.setTimeout(() => {
      updateIntroTargetTransform();
      setIsIntroMoving(true);
    }, INTRO_HOLD_DELAY_MS);

    const hideTimer = window.setTimeout(() => {
      setShowIntro(false);
    }, INTRO_HIDE_DELAY_MS);

    return () => {
      window.clearTimeout(moveTimer);
      window.clearTimeout(hideTimer);
      window.cancelAnimationFrame(initialFrameId);
      window.removeEventListener("resize", updateIntroTargetTransform);
      document.body.style.overflow = previousOverflow;
    };
  }, [showIntro]);

  useEffect(() => {
    let active = true;

    apiRequest("/public/content")
      .then((payload) => {
        if (!active) {
          return;
        }
        setContent(payload?.landing ?? null);
      })
      .catch(() => {
        if (!active) {
          return;
        }
        setContent(null);
      });

    return () => {
      active = false;
    };
  }, []);



  return (
    <div className="min-h-screen bg-white text-slate-950">
      {showIntro && (
        <MotionDiv
          initial={{ opacity: 1 }}
          animate={isIntroMoving ? { opacity: 0 } : { opacity: 1 }}
          transition={
            isIntroMoving
              ? {
                  duration: INTRO_PARALLEL_DURATION_MS / 1000,
                  ease: [0.22, 1, 0.36, 1],
                }
              : { duration: 0.2 }
          }
          className="pointer-events-none fixed inset-0 z-[120] overflow-hidden bg-black"
        >
          <MotionDiv
            aria-hidden
            initial={{ opacity: 0.2, scale: 0.88 }}
            animate={
              isIntroMoving
                ? { opacity: 0, scale: 1.24 }
                : { opacity: [0.2, 0.46, 0.3], scale: [0.88, 1.06, 1] }
            }
            transition={
              isIntroMoving
                ? {
                    duration: INTRO_PARALLEL_DURATION_MS / 1000,
                    ease: [0.22, 1, 0.36, 1],
                  }
                : { duration: 1.8, ease: [0.16, 1, 0.3, 1] }
            }
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at center, rgba(255,255,255,0.52) 0%, rgba(255,255,255,0.2) 22%, rgba(0,0,0,0.87) 58%, rgba(0,0,0,1) 100%)",
            }}
          />

          <div className="absolute inset-0 flex items-center justify-center">
            <MotionDiv
              initial={{
                opacity: 0,
                scale: 1.35,
                filter: "blur(16px)",
                letterSpacing: "0.28em",
                textShadow: "0 0 62px rgba(255,255,255,0.24)",
              }}
              animate={
                isIntroMoving
                  ? {
                      x: introTargetTransform.x,
                      y: introTargetTransform.y,
                      scale: introTargetTransform.scale,
                      opacity: 1,
                      filter: "blur(0px)",
                      letterSpacing: "-0.02em",
                      textShadow: "0 0 10px rgba(255,255,255,0.2)",
                    }
                  : {
                      opacity: 1,
                      scale: 1,
                      filter: "blur(0px)",
                      letterSpacing: "0.02em",
                      textShadow: "0 0 48px rgba(255,255,255,0.9)",
                    }
              }
              transition={
                isIntroMoving
                  ? {
                      duration: INTRO_PARALLEL_DURATION_MS / 1000,
                      ease: [0.22, 1, 0.36, 1],
                    }
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

      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-2xl transition-all duration-300 border-b border-transparent">
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6 lg:px-8">
          <p ref={logoRef} className="text-2xl font-bold tracking-tighter text-slate-900 select-none cursor-pointer">
            LifeOS<span className="text-indigo-500"></span>
          </p>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <div className="h-6 w-[1px] bg-slate-200 mx-1" />
            <Link to="/auth?tab=login">

              <Button variant="ghost" className="rounded-full px-6 font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/50">{t('common.login')}</Button>
            </Link>
            <Link to="/auth?tab=register">
              <Button className="rounded-full px-7 font-medium shadow-md shadow-slate-900/10 transition-all hover:shadow-lg hover:-translate-y-0.5">{t('common.getStarted')}</Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden border-b border-transparent">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-100/80 via-white to-white opacity-70"></div>
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 lg:grid-cols-[1.1fr_1fr] lg:px-8 items-center">
          <div className="space-y-8 relative z-10 flex flex-col justify-center">
            <MotionDiv 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <h1 className="text-5xl font-extrabold tracking-[-0.04em] text-slate-900 md:text-7xl lg:text-[5.5rem] leading-[1.05]">
                {t('hero.title1')} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-400">
                  {t('hero.title2')}
                </span>
              </h1>
            </MotionDiv>
            <MotionDiv 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            >
              <p className="max-w-xl text-lg text-slate-500 md:text-xl md:leading-relaxed font-light">
                {t('hero.description')}
              </p>
            </MotionDiv>
            <MotionDiv 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <Link to="/auth?tab=register">
                <Button size="lg" className="rounded-full h-14 px-8 text-base font-medium shadow-xl shadow-slate-900/10 hover:shadow-slate-900/20 transition-all hover:-translate-y-0.5">
                  {t('common.getStarted')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="rounded-full h-14 px-8 text-base font-medium border-slate-200 hover:bg-slate-50 transition-all">
                  Dashboard
                </Button>
              </Link>
            </MotionDiv>
          </div>

          <MotionDiv
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            whileHover={{ y: -8 }}
            className="group relative cursor-default"
          >
            <div className="relative overflow-hidden rounded-[24px] bg-slate-50 shadow-2xl shadow-indigo-900/5 ring-1 ring-slate-200 transition-shadow duration-500 group-hover:shadow-indigo-900/10">
              <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-tr from-white/20 via-transparent to-slate-900/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <img
                src={heroImage}
                alt="LifeOS Hero"
                className="h-full min-h-[300px] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
              />
            </div>
            <MotionDiv
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="absolute -bottom-5 -left-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-xl backdrop-blur-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                  {t('hero.stats.goals')}
                </p>
                <p className="text-lg font-bold text-slate-950">{content?.heroStats?.goalsCount || "128,400+"}</p>
              </div>
            </MotionDiv>
            <MotionDiv
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="absolute -top-5 -right-4 flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900/95 p-4 text-white shadow-2xl backdrop-blur-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                  {t('hero.stats.productivity')}
                </p>
                <div className="flex items-end gap-1.5">
                  <p className="text-lg font-bold text-white">{content?.heroStats?.productivityGrowth || "+48%"}</p>
                </div>
              </div>
            </MotionDiv>
          </MotionDiv>
        </div>
      </section>

      <section className="py-20 bg-slate-50/50 border-b border-white">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-6 md:grid-cols-3 lg:px-8">
          {(content?.stats || [
            { value: "10K+", label: t('stats.users') },
            { value: "500K+", label: t('stats.goals') },
            { value: "1M+", label: t('stats.streaks') },
          ]).map((item, i) => (
            <MotionDiv key={item.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1, duration: 0.6 }} viewport={{ once: true }}>
              <div className="flex flex-col items-center justify-center p-12 rounded-[2.5rem] bg-white shadow-xl shadow-slate-200/40 ring-1 ring-slate-900/5 transition-transform duration-500 hover:-translate-y-2">
                <p className="text-5xl lg:text-7xl font-extrabold tracking-tighter text-slate-900">{item.value}</p>
                <p className="mt-4 text-xs xl:text-sm font-bold uppercase tracking-[0.25em] text-slate-400">{item.label}</p>
              </div>
            </MotionDiv>
          ))}
        </div>
      </section>

      <section className="py-28 relative">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(99,102,241,0.03),_transparent_40%)]" />
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-8 relative z-10">
          <div className="mb-20 max-w-2xl">
            <p className="text-xs font-black tracking-[0.25em] text-indigo-500 uppercase mb-4">{t('features.header')}</p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              {t('features.title')}
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(content?.features || [
              { icon: "Target", id: "Goal" },
              { icon: "Brain", id: "AI" },
              { icon: "Zap", id: "Habits" },
              { icon: "Trophy", id: "Gamification" },
              { icon: "BookOpen", id: "Books" },
              { icon: "TrendingUp", id: "Analytics" },
            ]).map((feature, idx) => {
              const Icon = ICON_MAP[feature.icon] ?? Sparkles;
              const styles = MODULE_STYLES[feature.icon] || DEFAULT_MODULE_STYLE;
              const translatedTitle = t(`features.items.${feature.id || feature.title}.title`);
              const translatedDesc = t(`features.items.${feature.id || feature.title}.description`);

              return (
                <MotionDiv
                  key={feature.id || feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, type: "spring", bounce: 0.2, delay: idx * 0.1 }}
                  className="group block"
                >
                  <Card className={`relative h-full overflow-hidden border-slate-200/80 bg-white/70 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 ${styles.border} ${styles.glow}`}>
                    
                    <CardContent className="relative z-10 space-y-4 pt-8 pb-8 px-6">
                      <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6 ${styles.bg}`}>
                        <Icon className="h-7 w-7" />
                      </div>
                      <p className="text-2xl font-bold tracking-tight text-slate-900 transition-colors duration-300">{translatedTitle}</p>
                      <p className="text-[1.05rem] text-slate-600 leading-relaxed transition-colors duration-300 group-hover:text-slate-800">{translatedDesc}</p>
                    </CardContent>
                  </Card>
                </MotionDiv>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-32 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-8 relative z-10">
          <div className="mb-20">
            <p className="text-xs font-black tracking-[0.25em] text-indigo-400 uppercase mb-4">{t('founders.header')}</p>
            <h2 className="text-5xl md:text-7xl font-extrabold tracking-tighter">{t('founders.title')}</h2>
          </div>
          <div className="grid gap-12 md:grid-cols-2 auto-rows-fr items-stretch">
            {(content?.founders || [
              { id: "founder1", image: "/founder1.jpg" },
              { id: "founder2", image: "/founder2.jpg" },
            ]).map((founder, i) => (
              <MotionDiv key={founder.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i*0.1, duration: 0.8, ease: "easeOut" }} viewport={{ once: true }} className="flex">
                <Card className="w-full overflow-hidden border-0 bg-slate-900/40 backdrop-blur-xl rounded-[3rem] text-white ring-1 ring-white/10 flex flex-col h-full shadow-2xl transition-all duration-500 hover:ring-indigo-500/30">
                  {/* Top: Names */}
                  <div className="p-10 pb-6 space-y-4">
                    <h3 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
                      <span className="block text-sm lg:text-base font-bold text-white/50 uppercase tracking-[0.3em] mb-2">{founder.id === 'founder1' ? "Ergashev" : "Rahimov"}</span>
                      <span className="block">{founder.id === 'founder1' ? "MuhammadNurulloh" : "Asadbek"}</span>
                    </h3>
                    <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1 text-[10px] font-black tracking-widest uppercase text-indigo-400">
                      {t(`founders.roles.${founder.id === 'founder1' ? 'dev' : 'design'}`)}
                    </div>
                  </div>

                  {/* Middle: Image */}
                  <div className="relative aspect-[3/4] max-w-[400px] mx-auto w-full group overflow-hidden bg-slate-800 rounded-2xl shadow-inner">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent z-10 pointer-events-none" />
                    <img
                      src={founder.image}
                      alt={t(`founders.names.${founder.id}`)}
                      className="absolute inset-0 h-full w-full object-cover object-top grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
                    />
                  </div>

                  {/* Bottom: Description */}
                  <div className="p-10 pt-8 flex-1 flex flex-col justify-end bg-gradient-to-b from-transparent to-black/20">
                    <p className="text-slate-300 leading-relaxed text-sm lg:text-lg font-medium italic border-l-2 border-indigo-500/40 pl-6 py-2">
                       "{t(`founders.descriptions.${founder.id}`)}"
                    </p>
                  </div>
                </Card>
              </MotionDiv>
            ))}
          </div>
        </div>
      </section>



      <footer className="border-t border-slate-100 bg-white py-12">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-6 lg:px-8 text-sm font-medium text-slate-400">
          <p className="inline-flex items-center text-slate-900 font-extrabold tracking-tighter select-none cursor-default text-lg">
            LifeOS<span className="text-indigo-500"></span>
          </p>
          <p>© 2026 LifeOS. {t('common.footerRights')}</p>
        </div>
      </footer>
    </div>
  );
}
