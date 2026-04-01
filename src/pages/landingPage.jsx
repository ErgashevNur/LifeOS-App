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
  stats: [],
  features: [],
  founders: [],
};

const INTRO_HOLD_DELAY_MS = 1450;
const INTRO_PARALLEL_DURATION_MS = 1400;
const INTRO_HIDE_DELAY_MS =
  INTRO_HOLD_DELAY_MS + INTRO_PARALLEL_DURATION_MS + 120;

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

      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-6">
          <p ref={logoRef} className="text-xl font-semibold tracking-tight">
            LifeOS
          </p>
          <div className="flex items-center gap-2">
            <Link to="/auth?tab=login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link to="/auth?tab=register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="border-b border-slate-200">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-14 md:px-6 lg:grid-cols-[1.1fr_1fr] lg:py-20">
          <div className="space-y-6">
            {/* <Badge variant="outline">Mahsuldorlik Veb-Ilovasi</Badge> */}
            <h1 className="text-4xl leading-tight font-semibold md:text-6xl">
              Hayotingizni bosqichma-bosqich tartibga soling.
            </h1>
            <p className="max-w-xl text-lg text-slate-600">
              Maqsadlar, odatlar, AI yordamchi va tahlillarni bitta tizimda
              boshqaring.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/auth?tab=register">
                <Button size="lg">
                  Boshlash
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline">
                  Dashboard ko'rish
                </Button>
              </Link>
            </div>
          </div>

          <MotionDiv
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="relative"
          >
            <img
              src={heroImage}
              alt="LifeOS Hero"
              className="h-full min-h-[300px] w-full rounded-2xl border border-slate-900 object-cover"
            />
            <MotionDiv
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="absolute -bottom-4 -left-3 rounded-xl border border-slate-900 bg-white p-3 shadow-sm"
            >
              <p className="text-xs tracking-[0.15em] text-slate-500 uppercase">
                Streak
              </p>
              <p className="text-lg font-semibold">12 kun</p>
            </MotionDiv>
            <MotionDiv
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="absolute -top-4 right-3 rounded-xl border border-slate-900 bg-slate-900 p-3 text-white shadow-sm"
            >
              <p className="text-xs tracking-[0.15em] text-slate-300 uppercase">
                Fokus
              </p>
              <p className="text-lg font-semibold">84%</p>
            </MotionDiv>
          </MotionDiv>
        </div>
      </section>

      <section className="border-b border-slate-200 py-12">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 px-4 md:grid-cols-3 md:px-6">
          {content.stats.map((item) => (
            <Card key={item.label} className="border-slate-300">
              <CardContent className="pt-6 text-center">
                <p className="text-4xl font-semibold">{item.value}</p>
                <p className="mt-1 text-slate-500">{item.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
          <div className="mb-8">
            <Badge variant="outline">Xususiyatlar</Badge>
            <h2 className="mt-3 text-3xl font-semibold">6 ta asosiy modul</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {content.features.map((feature) => {
              const Icon = ICON_MAP[feature.icon] ?? Sparkles;
              return (
                <Card key={feature.title} className="border-slate-300">
                <CardContent className="space-y-4 pt-6">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-900">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-xl font-semibold">{feature.title}</p>
                  <p className="text-slate-600">{feature.description}</p>
                </CardContent>
              </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 py-14">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
          <h2 className="mb-6 text-3xl font-semibold">Jamoa</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {content.founders.map((founder) => (
              <Card
                key={founder.name}
                className="overflow-hidden border-slate-300"
              >
                <CardContent className="grid gap-4 p-0 md:grid-cols-[180px_1fr]">
                  <img
                    src={founder.image}
                    alt={founder.name}
                    className="h-full min-h-[220px] w-full object-cover"
                  />
                  <div className="space-y-2 p-5">
                    <p className="text-2xl font-semibold">{founder.name}</p>
                    <p className="text-sm text-slate-500">{founder.role}</p>
                    <p className="text-slate-600">{founder.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto w-full max-w-lg px-4 md:px-6">
          <Card className="border-slate-900">
            <CardContent className="space-y-5 pt-8">
              <div>
                <h2 className="text-3xl font-semibold">Ro'yxatdan o'tish</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Email va parol orqali tezkor boshlang.
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleSignup}>
                <div className="space-y-2">
                  <Label htmlFor="home-email">Email</Label>
                  <Input
                    id="home-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="home-password">Parol</Label>
                  <Input
                    id="home-password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-11"
                  />
                </div>
                <Button type="submit" className="h-11 w-full">
                  Ro'yxatdan o'tish
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>

              <p className="rounded-lg border border-slate-300 bg-slate-50 p-3 text-xs text-slate-600">
                Bu forma sizni to'liq register bo'limiga yuboradi. U yerda
                barcha kerakli ma'lumotlarni kiritasiz.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 text-sm text-slate-500 md:px-6">
          <p className="inline-flex items-center gap-2 text-slate-900">
            <Sparkles className="h-4 w-4" />
            LifeOS
          </p>
          <p>© 2026 LifeOS. Barcha huquqlar himoyalangan.</p>
        </div>
      </footer>
    </div>
  );
}
