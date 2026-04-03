import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Link, useNavigate } from "react-router-dom";
import heroImage from "/step-bystep.png";

const MotionDiv = motion.div;

const ICON_MAP = {
  Target,
  Brain,
  Zap,
  Trophy,
  BookOpen,
  TrendingUp,
};

const EMPTY_CONTENT = {
  heroStats: {
    goalsCount: "128,400+",
    productivityGrowth: "+48%",
  },
  stats: [
    { value: "10K+", label: "foydalanuvchi" },
    { value: "500K+", label: "maqsad" },
    { value: "1M+", label: "streak kun" },
  ],
  features: [
    {
      title: "Goal",
      description: "Yillikdan kunlikgacha maqsadlarni bir joyda kuzating.",
      icon: "Target",
    },
    {
      title: "AI",
      description: "Shaxsiy produktivlik kouchi orqali aniq tavsiyalar oling.",
      icon: "Brain",
    },
    {
      title: "Habits",
      description: "40 kunlik odat murabbiyi va streak nazorati.",
      icon: "Zap",
    },
    {
      title: "Gamification",
      description: "Coin, challenge va mukofot tizimi bilan motivatsiyani oshiring.",
      icon: "Trophy",
    },
    {
      title: "Books",
      description: "O'qish progressi, izoh va reytinglar bilan ishlang.",
      icon: "BookOpen",
    },
    {
      title: "Analytics",
      description: "Jarayonni grafiklar orqali tahlil qilib boring.",
      icon: "TrendingUp",
    },
  ],
  founders: [
    {
      name: "Ergashev MuhammadNurulloh",
      role: "Dasturchi",
      image: "/founder1.jpg",
      description: "Frontend va backend qismlarini birlashtirib, LifeOS'ni tez, toza va kengaytirishga qulay arxitekturada quradi.",
    },
    {
      name: "Rahimov Asadbek",
      role: "UI/UX va Data Science",
      image: "/founder2.jpg",
      description: "Interfeys tajribasini foydalanuvchi odatlariga moslaydi, ma'lumotlardan insight olib mahsulot qarorlarini kuchaytiradi.",
    },
  ],
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
  const navigate = useNavigate();
  const { toast } = useToast();
  const logoRef = useRef(null);
  const introTextRef = useRef(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [content, setContent] = useState(EMPTY_CONTENT);
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
        setContent(payload?.landing ?? EMPTY_CONTENT);
      })
      .catch(() => {
        if (!active) {
          return;
        }
        setContent(EMPTY_CONTENT);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleSignup = async (event) => {
    event.preventDefault();

    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Xatolik",
        description: "Email va parolni kiriting.",
      });
      return;
    }

    toast({
      title: "Ro'yxatdan o'tish bo'limiga o'tildi",
      description: "To'liq ma'lumotlarni kiriting va akkaunt yarating.",
    });
    navigate(`/auth?tab=register&email=${encodeURIComponent(email.trim())}`);
  };

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
          <div className="flex items-center gap-3">
            <Link to="/auth?tab=login">
              <Button variant="ghost" className="rounded-full px-6 font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/50">Login</Button>
            </Link>
            <Link to="/auth?tab=register">
              <Button className="rounded-full px-7 font-medium shadow-md shadow-slate-900/10 transition-all hover:shadow-lg hover:-translate-y-0.5">Get Started</Button>
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
                Hayotingizni <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-400">
                  tartibga soling.
                </span>
              </h1>
            </MotionDiv>
            <MotionDiv 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            >
              <p className="max-w-xl text-lg text-slate-500 md:text-xl md:leading-relaxed font-light">
                Maqsadlar, odatlar, murakkab AI tahlillarni bitta sokin tizimda boshqaring va o'zingizni kashf eting.
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
                  Boshlash
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="rounded-full h-14 px-8 text-base font-medium border-slate-200 hover:bg-slate-50 transition-all">
                  Dashboard ko'rish
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
                  Bajarilgan maqsadlar
                </p>
                <p className="text-lg font-bold text-slate-950">{content.heroStats?.goalsCount || "128,400+"}</p>
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
                  Samaradorlik
                </p>
                <div className="flex items-end gap-1.5">
                  <p className="text-lg font-bold text-white">{content.heroStats?.productivityGrowth || "+48%"}</p>
                  <p className="text-xs font-medium text-emerald-400 mb-[3px]">o'sish</p>
                </div>
              </div>
            </MotionDiv>
          </MotionDiv>
        </div>
      </section>

      <section className="py-20 bg-slate-50/50 border-b border-white">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-6 md:grid-cols-3 lg:px-8">
          {content.stats.map((item, i) => (
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
            <p className="text-xs font-black tracking-[0.25em] text-indigo-500 uppercase mb-4">Xususiyatlar</p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              Mukammal qismlardan <br /><span className="text-slate-400">tashkil topgan.</span>
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {content.features.map((feature, idx) => {
              const Icon = ICON_MAP[feature.icon] ?? Sparkles;
              const styles = MODULE_STYLES[feature.icon] || DEFAULT_MODULE_STYLE;

              return (
                <MotionDiv
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, type: "spring", bounce: 0.2, delay: idx * 0.1 }}
                  className="group block"
                >
                  <Card className={`relative h-full overflow-hidden border-slate-200/80 bg-white/70 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 ${styles.border} ${styles.glow}`}>
                    
                    {/* Animated Aurora Blobs */}
                    <div className="pointer-events-none absolute -inset-1 opacity-0 mix-blend-multiply transition-opacity duration-700 group-hover:opacity-100">
                      <div className={`absolute -left-10 -top-10 h-[180px] w-[180px] animate-pulse rounded-full blur-[50px] ${styles.blob1}`} style={{ animationDuration: '3s' }} />
                      <div className={`absolute -bottom-10 -right-10 h-[180px] w-[180px] animate-pulse rounded-full blur-[50px] ${styles.blob2}`} style={{ animationDuration: '4s', animationDelay: '1s' }} />
                    </div>

                    {/* Dotted Grid Background */}
                    <div
                      className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-[0.04]"
                      style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, black 2px, transparent 0)`,
                        backgroundSize: "24px 24px",
                      }}
                    />

                    <CardContent className="relative z-10 space-y-4 pt-8 pb-8 px-6">
                      <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6 ${styles.bg}`}>
                        <Icon className="h-7 w-7" />
                      </div>
                      <p className="text-2xl font-bold tracking-tight text-slate-900 transition-colors duration-300">{feature.title}</p>
                      <p className="text-[1.05rem] text-slate-600 leading-relaxed transition-colors duration-300 group-hover:text-slate-800">{feature.description}</p>
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
            <p className="text-xs font-black tracking-[0.25em] text-indigo-400 uppercase mb-4">Jamoa</p>
            <h2 className="text-5xl md:text-7xl font-extrabold tracking-tighter">Asoschilar.</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            {content.founders.map((founder, i) => (
              <MotionDiv key={founder.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i*0.1, duration: 0.8, ease: "easeOut" }} viewport={{ once: true }}>
                <Card className="overflow-hidden border-0 bg-slate-900/50 backdrop-blur-md rounded-[2.5rem] text-white ring-1 ring-white/10">
                  <CardContent className="grid gap-0 p-0 md:grid-cols-[240px_1fr]">
                    <div className="relative h-full min-h-[300px] w-full group overflow-hidden">
                      <div className="absolute inset-0 bg-black/20 z-10 group-hover:bg-transparent transition-all duration-700 pointer-events-none" />
                      <img
                        src={founder.image}
                        alt={founder.name}
                        className="absolute inset-0 h-full w-full object-cover grayscale-[0.8] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                      />
                    </div>
                    <div className="space-y-4 p-8 lg:p-12 flex flex-col justify-center">
                      <h3 className="text-3xl lg:text-4xl font-bold tracking-tight">{founder.name}</h3>
                      <p className="text-xs font-black tracking-[0.2em] uppercase text-indigo-400">{founder.role}</p>
                      <p className="text-slate-400 leading-relaxed pt-2">{founder.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </MotionDiv>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white relative">
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-slate-100/50 to-transparent pointer-events-none" />
        <div className="mx-auto w-full max-w-lg px-6 lg:px-8 relative z-10">
          <Card className="border-0 shadow-2xl shadow-indigo-900/5 bg-slate-50/80 backdrop-blur-3xl rounded-[2rem]">
            <CardContent className="space-y-6 pt-10 px-8 pb-10">
              <div className="text-center">
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Tayyormisiz?</h2>
                <p className="mt-2 text-sm font-medium text-slate-500">
                  Email va parol orqali qadam qo'ying.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSignup}>
                <div className="space-y-2">
                  <Label htmlFor="home-email" className="font-bold text-[10px] uppercase tracking-[0.2em] text-slate-400">Email</Label>
                  <Input
                    id="home-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="h-14 rounded-2xl bg-white border-0 shadow-sm ring-1 ring-inset ring-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 transition-shadow"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="home-password" className="font-bold text-[10px] uppercase tracking-[0.2em] text-slate-400">Parol</Label>
                  <Input
                    id="home-password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-14 rounded-2xl bg-white border-0 shadow-sm ring-1 ring-inset ring-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 transition-shadow"
                  />
                </div>
                <Button type="submit" className="h-14 w-full rounded-2xl font-bold bg-slate-900 hover:bg-slate-800 text-white mt-4 shadow-xl shadow-slate-900/10 transition-all hover:-translate-y-0.5 group">
                  Ro'yxatdan o'tish
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </form>

              <p className="rounded-2xl border border-transparent bg-slate-200/50 p-4 text-xs font-medium text-slate-500 text-center">
                Vaqtingizni qadrlovchi eng so'nggi tizim.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="border-t border-slate-100 bg-white py-12">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-6 lg:px-8 text-sm font-medium text-slate-400">
          <p className="inline-flex items-center text-slate-900 font-extrabold tracking-tighter select-none cursor-default text-lg">
            LifeOS<span className="text-indigo-500">.</span>
          </p>
          <p>© 2026 LifeOS. Barcha huquqlar himoyalangan.</p>
        </div>
      </footer>
    </div>
  );
}
