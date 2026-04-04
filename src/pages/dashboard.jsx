import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Target, 
  Flame, 
  Clock, 
  PieChart,
  Layout,
  MessageSquare,
  Send,
  Zap,
  TrendingUp,
  Wallet
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLifeOSData } from "@/lib/lifeos-store";
import { cn } from "@/lib/utils";

function BentoCard({ children, className, title, subtitle, icon: Icon }) {
  return (
    <div className={cn("bg-white rounded-[2.5rem] p-8 shadow-premium ring-1 ring-slate-100 hover:ring-indigo-500/10 transition-all", className)}>
      {(title || Icon) && (
        <div className="flex items-center justify-between mb-8">
          <div>
            {title && <h3 className="text-xl font-black tracking-tight text-slate-900">{title}</h3>}
            {subtitle && <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{subtitle}</p>}
          </div>
          {Icon && (
            <div className="p-3 bg-slate-50 rounded-2xl text-slate-900 group-hover:scale-110 transition-transform">
              <Icon className="w-5 h-5" />
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-premium ring-1 ring-slate-100 group">
      <div className="flex items-center justify-between">
        <div className={cn("p-3 rounded-2xl", color)}>
          <Icon className="w-5 h-5" />
        </div>
        <TrendingUp className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="mt-8">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
        <p className="mt-2 text-4xl font-black tracking-tighter text-slate-900 group-hover:translate-x-1 transition-transform">{value}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const { data, actions, selectors, dashboardSummary } = useLifeOSData();
  const [newGoal, setNewGoal] = useState("");
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([
    { id: 1, user: "Asadbek", text: "Maqsadlarga yetish uchun reja eng muhimi!", time: "2m ago" },
    { id: 2, user: "Muhammad", text: "LifeOS'dagi moliya markazi juda foydali bo'libdi.", time: "10m ago" }
  ]);

  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments([{ id: Date.now(), user: "Siz", text: newComment, time: "Hozir" }, ...comments]);
      setNewComment("");
    }
  };

  return (
    <div className="space-y-12">
      {/* Strategic Goals Header */}
      <div className="grid gap-8 lg:grid-cols-3">
        <BentoCard className="lg:col-span-2 bg-slate-900 text-white ring-slate-800 shadow-2xl shadow-slate-900/20">
          <div className="space-y-6">
            <Badge className="bg-indigo-500 text-white px-4 py-1.5 rounded-full font-black text-[9px] uppercase tracking-widest border-0">
              STRATEGIK REJA
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tighter leading-tight">
              {t('dashboard.goals_center.header')}
            </h2>
            <p className="text-xl text-slate-400 font-medium max-w-lg">
              {t('dashboard.goals_center.subtitle')}
            </p>
            
            <div className="flex gap-4 mt-8">
              <Input 
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder={t('dashboard.goals_center.placeholder')}
                className="h-16 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-slate-600 px-6 focus-visible:ring-indigo-500"
              />
              <Button 
                onClick={() => {
                  if (newGoal.trim()) {
                    actions.addGoal({ title: newGoal, category: 'Personal', targetDate: new Date().toISOString() });
                    setNewGoal("");
                  }
                }}
                className="h-16 px-8 rounded-2xl bg-white text-slate-950 font-black uppercase text-xs tracking-widest hover:bg-indigo-500 hover:text-white transition-all shadow-xl"
              >
                {t('dashboard.goals_center.add')}
              </Button>
            </div>
          </div>
        </BentoCard>

        <BentoCard icon={Wallet} title={t('dashboard.finance.header')}>
          <div className="mt-4 space-y-6">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t('dashboard.finance.wealth')}</p>
              <p className="text-5xl font-black tracking-tighter text-slate-900 mt-2">92%</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-end text-[10px] font-black uppercase text-slate-500">
                <span>{t('dashboard.finance.debt')}</span>
                <span>$1,200 Left</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full w-[70%] bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
              </div>
            </div>
          </div>
        </BentoCard>
      </div>

      {/* Stats Quick View */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t('dashboard.metrics.productivity')} value="88%" icon={Zap} color="bg-indigo-50 text-indigo-600" />
        <StatCard label={t('dashboard.metrics.streaks')} value={dashboardSummary.streak} icon={Flame} color="bg-orange-50 text-orange-600" />
        <StatCard label={t('dashboard.metrics.focus')} value="6.4h" icon={Clock} color="bg-cyan-50 text-cyan-600" />
        <StatCard label={t('dashboard.metrics.goals')} value={dashboardSummary.goalsCount} icon={Target} color="bg-emerald-50 text-emerald-600" />
      </div>

      {/* Bottom Area: Tasks & Community Pulse */}
      <div className="grid gap-8 xl:grid-cols-[1fr_420px]">
        <BentoCard icon={Layout} title={t('dashboard.tasks.header')} subtitle={t('dashboard.tasks.completed')}>
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {data.dashboard.tasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-4 p-5 rounded-3xl bg-slate-50 border border-slate-100 group hover:ring-1 hover:ring-indigo-500/20 transition-all cursor-pointer"
                  onClick={() => actions.toggleDashboardTask(task.id)}
                >
                  <div className={cn(
                    "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all",
                    task.done ? "bg-slate-900 border-slate-900" : "border-slate-300"
                  )}>
                    {task.done && <CheckCircle2 className="h-4 w-4 text-white" />}
                  </div>
                  <span className={cn("text-lg font-bold tracking-tight", task.done ? "text-slate-400 line-through" : "text-slate-900")}>
                    {task.title}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </BentoCard>

        {/* Community Pulse (Comments Section) */}
        <BentoCard icon={MessageSquare} title={t('dashboard.community_pulse.header')} subtitle={t('dashboard.community_pulse.subtitle')}>
          <div className="flex flex-col h-[400px]">
            <div className="flex-1 overflow-y-auto space-y-6 no-scrollbar pr-2 mb-6">
              {comments.map((comment) => (
                <div key={comment.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-indigo-600">{comment.user}</span>
                    <span className="text-[10px] font-bold text-slate-400">{comment.time}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-sm font-bold text-slate-700 leading-relaxed">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="relative">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={t('dashboard.community_pulse.comment_placeholder')}
                className="h-14 rounded-2xl bg-slate-100 border-0 px-6 pr-14 font-bold text-sm focus-visible:ring-indigo-500"
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
              />
              <button 
                onClick={handleAddComment}
                className="absolute right-2 top-2 h-10 w-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:scale-105 transition-transform"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </BentoCard>
      </div>
    </div>
  );
}
