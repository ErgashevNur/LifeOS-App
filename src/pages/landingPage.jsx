import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import heroBg from "/step-bystep.png";
import founder1 from "/founder1.jpg";
import founder2 from "/founder1.jpg";
import {
  CheckCircle2,
  ArrowRight,
  Loader2,
  Sparkles,
  Target,
  Brain,
  Trophy,
  Zap,
  BookOpen,
  TrendingUp,
  Star,
  Users,
  Clock,
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const FEATURES = [
  {
    icon: Target,
    title: "Goal Tracking",
    description:
      "Plan and track your annual, monthly, weekly, and daily goals.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Brain,
    title: "AI Assistant",
    description:
      "Boost your productivity and get advice with a personal AI coach.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Zap,
    title: "Habit System",
    description:
      "Form new habits with a 40-day challenge and maintain your streaks.",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: Trophy,
    title: "Gamification",
    description: "Compete with friends and reach new milestones.",
    color: "from-yellow-500 to-amber-500",
  },
  {
    icon: BookOpen,
    title: "Book Library",
    description: "Track the books you're reading and leave notes.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: TrendingUp,
    title: "Analytics",
    description: "Monitor and analyze your progress through charts.",
    color: "from-indigo-500 to-violet-500",
  },
];

const STATS = [
  { value: "10K+", label: "Users" },
  { value: "500K+", label: "Completed goals" },
  { value: "1M+", label: "Streak days" },
  { value: "4.9", label: "Rating", icon: Star },
];

export default function landingPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields.",
      });
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Welcome to LifeOS! 🚀",
        description: "Your 40-day challenge has begun.",
      });
      setLocation("/dashboard");
    }, 1500);
  };

  return (
    <div className="overflow-hidden">
      <nav className="bg-background/80 sticky top-0 z-50 border-b backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div
            className="font-heading flex items-center gap-2 text-2xl font-bold"
            data-testid="text-logo"
          >
            <div className="from-primary text-primary-foreground shadow-primary/30 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br to-indigo-600 shadow-lg">
              <img src="/logo.png" alt="LifeOS Logo" className="w-20" />
            </div>
            LifeOS
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" data-testid="button-login">
                Login
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button
                className="shadow-primary/30 shadow-lg"
                data-testid="button-get-started"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="from-primary/5 absolute inset-0 bg-gradient-to-br via-transparent to-indigo-500/5" />
        <div className="bg-primary/10 absolute top-20 left-10 h-72 w-72 animate-pulse rounded-full blur-3xl" />
        <div className="absolute right-10 bottom-20 h-96 w-96 animate-pulse rounded-full bg-indigo-500/10 blur-3xl delay-1000" />

        <div className="relative z-10 container mx-auto px-6">
          <div className="flex flex-col items-center gap-16 lg:flex-row">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8 lg:w-1/2"
            >
              <Badge
                variant="secondary"
                className="bg-primary/10 text-primary border-primary/20 px-4 py-2 text-sm font-medium"
              >
                🎯 40-Day Challenge
              </Badge>

              <h1
                className="font-heading text-5xl leading-[1.1] font-bold tracking-tight md:text-7xl"
                data-testid="text-hero-title"
              >
                Transform Your <br />
                <span className="from-primary animate-gradient bg-gradient-to-r via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                  Life
                </span>
                <br />
                Step by Step
              </h1>

              <p className="text-muted-foreground max-w-lg text-xl leading-relaxed">
                Form habits, achieve your goals, and realize your potential with
                an AI assistant.
              </p>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="shadow-primary/30 hover:shadow-primary/40 h-14 rounded-full px-8 text-lg shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
                    data-testid="button-start-journey"
                  >
                    Start Your Journey
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="hover:bg-secondary/80 h-14 rounded-full px-8 text-lg"
                  data-testid="button-view-demo"
                >
                  View Demo
                </Button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="from-primary/20 border-background flex h-10 w-10 items-center justify-center rounded-full border-2 bg-gradient-to-br to-indigo-500/20 text-xs font-bold"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Trusted by 10,000+ users
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative lg:w-1/2"
            >
              <div className="from-primary/30 absolute inset-0 rotate-3 transform rounded-[2.5rem] bg-gradient-to-tr to-indigo-500/30 blur-3xl" />
              <img
                src={heroBg}
                alt="LifeOS Dashboard"
                className="border-border/50 relative h-[500px] w-full rounded-[2.5rem] border object-cover shadow-2xl"
                data-testid="img-hero"
              />

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1 }}
                className="bg-card/95 border-border/50 absolute -bottom-6 -left-6 rounded-2xl border p-5 shadow-2xl backdrop-blur-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-lg shadow-green-500/30">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <div>
                    <div className="text-lg font-bold">Habit Completed!</div>
                    <div className="text-muted-foreground text-sm">
                      Morning Meditation ✨
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.2 }}
                className="bg-card/95 border-border/50 absolute -top-4 -right-4 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-lg shadow-orange-500/30">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-bold">12 days</div>
                    <div className="text-muted-foreground text-xs">
                      Streak 🔥
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="bg-secondary/30 border-y py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {STATS.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="font-heading from-primary flex items-center justify-center gap-2 bg-gradient-to-r to-indigo-600 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
                  {stat.value}
                  {stat.icon && (
                    <stat.icon className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                  )}
                </div>
                <div className="text-muted-foreground mt-2">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <Badge variant="secondary" className="mb-4">
              Features
            </Badge>
            <h2 className="font-heading mb-4 text-4xl font-bold md:text-5xl">
              All Tools for Success
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
              LifeOS provides all the tools you need to form habits, track
              goals, and realize your potential.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card
                  className="bg-card/50 group h-full border-0 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                  data-testid={`card-feature-${i}`}
                >
                  <CardContent className="p-8">
                    <div
                      className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${feature.color} mb-6 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110`}
                    >
                      <feature.icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="mb-3 text-xl font-bold">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="from-secondary/30 bg-gradient-to-b to-transparent py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="font-heading mb-4 text-3xl font-bold md:text-4xl">
              Meet the Team
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl">
              We created LifeOS because we were tired of fragmented productivity
              tools.
            </p>
          </motion.div>

          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
            {[
              {
                img: founder1,
                name: "Asadbek Rahimov",
                role: "Founder & CEO",
                quote:
                  "Productivity is not about doing more, it's about being intentional with your time.",
              },
              {
                img: founder2,
                name: "MuhammadNurulloh Ergashev",
                role: "Founder & Project Manager",
                quote:
                  "We built LifeOS as an operating system for your personal growth.",
              },
            ].map((founder, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card
                  className="bg-card/50 overflow-hidden border-0 shadow-xl backdrop-blur-sm transition-all hover:shadow-2xl"
                  data-testid={`card-founder-${i}`}
                >
                  <CardContent className="flex flex-col p-0 md:flex-row">
                    <div className="relative overflow-hidden md:w-2/5">
                      <img
                        src={founder.img}
                        alt={founder.name}
                        className="h-full min-h-[280px] w-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>
                    <div className="flex flex-col justify-center p-8 md:w-3/5">
                      <h3 className="mb-1 text-2xl font-bold">
                        {founder.name}
                      </h3>
                      <p className="text-primary mb-4 font-medium">
                        {founder.role}
                      </p>
                      <p className="text-muted-foreground italic">
                        "{founder.quote}"
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto max-w-md px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="mb-10 text-center">
              <Badge variant="secondary" className="mb-4">
                Start Today
              </Badge>
              <h2 className="font-heading mb-2 text-3xl font-bold">
                Join LifeOS
              </h2>
              <p className="text-muted-foreground">
                Start your 40-day challenge now.
              </p>
            </div>

            <Card className="bg-card/80 border-0 shadow-2xl backdrop-blur-xl">
              <CardContent className="space-y-6 pt-8">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      placeholder="your@email.com"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      className="h-12"
                      data-testid="input-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      className="h-12"
                      data-testid="input-password"
                    />
                  </div>
                  <Button
                    className="shadow-primary/30 h-12 w-full text-lg shadow-lg"
                    size="lg"
                    type="submit"
                    disabled={isLoading}
                    data-testid="button-register"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Sign Up
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </form>
                <div className="text-muted-foreground text-center text-sm">
                  Already have an account?{" "}
                  <Link href="/dashboard">
                    <span className="text-primary cursor-pointer font-medium hover:underline">
                      Login
                    </span>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <footer className="bg-secondary/20 border-t py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="from-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br to-indigo-600">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-bold">LifeOS</span>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2024 LifeOS. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
