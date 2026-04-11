import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  Check,
  Plus,
  Target,
  Flame,
  Clock,
  Zap,
  TrendingUp,
  Wallet,
  MessageSquare,
  Send,
  BookOpen,
  Repeat,
  MoreHorizontal,
  ChevronRight,
  Activity,
  Trophy,
  Users,
  Sparkles,
  Circle
} from "lucide-react";
import { useLifeOSData } from "@/lib/lifeos-store";
import { getAuthSession } from "@/lib/auth";
import { cn } from "@/lib/utils";

// ── Reusable Card ──────────────────────────────────────────────
function Card({ children, className }) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-black/[0.06] shadow-soft",
        className
      )}
    >
      {children}
    </div>
  );
}

// ── Section Header ─────────────────────────────────────────────
function CardHeader({ title, subtitle, icon: Icon, iconColor, action }) {
  return (
    <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-50">
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${iconColor}18` }}
          >
            <Icon className="w-3.5 h-3.5" style={{ color: iconColor }} strokeWidth={2} />
          </div>
        )}
        <div>
          <p className="text-[13.5px] font-semibold text-gray-800 leading-tight">{title}</p>
          {subtitle && (
            <p className="text-[11px] text-gray-400 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {action && action}
    </div>
  );
}

// ── Stat Card ──────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, change }) {
  return (
    <Card className="p-5 hover:shadow-medium transition-shadow duration-200 cursor-default group">
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="w-4.5 h-4.5" style={{ color }} strokeWidth={2} />
        </div>
        <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
          {change}
        </span>
      </div>
      <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
      <p className="text-[12px] text-gray-500 font-medium mt-1">{label}</p>
    </Card>
  );
}

// ── Progress Bar ───────────────────────────────────────────────
function ProgressBar({ value, color }) {
  return (
    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────
export default function DashboardPage() {
  const { t } = useTranslation();
  const { data, actions, dashboardSummary } = useLifeOSData();
  const session = getAuthSession();
  const [newGoal, setNewGoal] = useState("");
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([
    { id: 1, user: "Asadbek", avatar: "A", color: "#7C3AED", text: "Maqsadlarga yetish uchun reja eng muhimi!", time: "2m ago" },
    { id: 2, user: "Muhammad", avatar: "M", color: "#3B82F6", text: "LifeOS'dagi moliya markazi juda foydali bo'libdi.", time: "10m ago" },
    { id: 3, user: "Sardor", avatar: "S", color: "#10B981", text: "Odatlar bo'limini kunlik ishlataman, juda qulay!", time: "25m ago" },
  ]);

  const today = new Date().toLocaleDateString("uz-UZ", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    setComments([
      {
        id: Date.now(),
        user: session?.firstName ?? "Siz",
        avatar: session?.firstName?.[0] ?? "S",
        color: "#7C3AED",
        text: newComment,
        time: "Hozir",
      },
      ...comments,
    ]);
    setNewComment("");
  };

  const handleAddGoal = () => {
    if (!newGoal.trim()) return;
    actions.addGoal({
      title: newGoal,
      period: "Kunlik",
      targetValue: 1,
      deadline: new Date(new Date().getFullYear(), 11, 31).toISOString().slice(0, 10),
    });
    setNewGoal("");
  };

  const completedTasks = data.dashboard.tasks.filter((t) => t.done).length;
  const totalTasks = data.dashboard.tasks.length;

  return (
    <div className="space-y-5">

      {/* ── Greeting Banner ───────────────────────────── */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 gradient-animated p-6 text-white shadow-medium">
        <div className="absolute right-0 top-0 w-64 h-full opacity-10">
          <div className="absolute top-2 right-8 w-32 h-32 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-2 right-24 w-20 h-20 rounded-full bg-white blur-2xl" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-5">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-violet-200" strokeWidth={1.5} />
              <p className="text-violet-200 text-[13px] font-medium">{today}</p>
            </div>
            <h1 className="text-xl lg:text-2xl font-bold leading-snug">
              Salom, {session?.firstName ?? "Do'stim"}! 👋
            </h1>
            <p className="text-violet-200/80 text-sm mt-1">
              Bugun {completedTasks}/{totalTasks} vazifa bajarildi. Davom eting!
            </p>
          </div>

          <div className="flex gap-2 w-full lg:w-auto">
            <input
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddGoal()}
              placeholder="Yangi maqsad qo'shing..."
              className="flex-1 lg:w-64 h-10 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-[13px] font-medium px-4 outline-none focus:bg-white/15 focus:border-white/40 transition-all"
            />
            <button
              onClick={handleAddGoal}
              className="h-10 px-4 rounded-lg bg-white text-violet-700 text-[13px] font-bold hover:bg-violet-50 transition-colors flex items-center gap-1.5 flex-shrink-0"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
              Qo'shish
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats Row ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t("dashboard.metrics.productivity")}
          value="88%"
          icon={Zap}
          color="#7C3AED"
          change="+4%"
        />
        <StatCard
          label={t("dashboard.metrics.streaks")}
          value={`${dashboardSummary.streak}🔥`}
          icon={Flame}
          color="#F97316"
          change="+2"
        />
        <StatCard
          label={t("dashboard.metrics.focus")}
          value="6.4h"
          icon={Clock}
          color="#0EA5E9"
          change="+1.2h"
        />
        <StatCard
          label={t("dashboard.metrics.goals")}
          value={dashboardSummary.goalsCount}
          icon={Target}
          color="#10B981"
          change="Active"
        />
      </div>

      {/* ── Main Grid ─────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* Left Column (2 cols) */}
        <div className="lg:col-span-2 space-y-5">

          {/* Tasks Widget */}
          <Card>
            <CardHeader
              title={t("dashboard.tasks.header")}
              subtitle={`${completedTasks}/${totalTasks} ${t("dashboard.tasks.completed")}`}
              icon={Check}
              iconColor="#7C3AED"
              action={
                <Link
                  to="/goals"
                  className="flex items-center gap-1 text-[12px] text-violet-600 font-semibold hover:text-violet-700 transition-colors"
                >
                  Barchasi
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              }
            />

            <div className="px-5 py-3 border-b border-gray-50">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-gray-500 font-medium">Kunlik progress</span>
                <span className="text-[11px] font-bold text-gray-700">
                  {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
                </span>
              </div>
              <ProgressBar
                value={totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}
                color="#7C3AED"
              />
            </div>

            <div className="p-3 space-y-1">
              <AnimatePresence mode="popLayout">
                {data.dashboard.tasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer group transition-colors",
                      task.done ? "hover:bg-gray-50/80" : "hover:bg-gray-50"
                    )}
                    onClick={() => actions.toggleDashboardTask(task.id)}
                  >
                    <div
                      className={cn(
                        "w-4.5 h-4.5 rounded-[5px] border-2 flex items-center justify-center transition-all duration-150 flex-shrink-0",
                        task.done
                          ? "bg-violet-600 border-violet-600"
                          : "border-gray-300 group-hover:border-gray-400"
                      )}
                    >
                      {task.done && (
                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                      )}
                    </div>

                    <span
                      className={cn(
                        "text-[13.5px] font-medium flex-1 transition-colors",
                        task.done ? "line-through text-gray-400" : "text-gray-700"
                      )}
                    >
                      {task.title}
                    </span>

                    {task.done && (
                      <span className="text-[10px] text-gray-400 font-medium">Bajarildi ✓</span>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {data.dashboard.tasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                  <Circle className="w-8 h-8 mb-2 opacity-30" strokeWidth={1} />
                  <p className="text-[13px] font-medium">Hali vazifa yo'q</p>
                </div>
              )}
            </div>
          </Card>

          {/* Modules Quick View */}
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: "Kitoblar", icon: BookOpen, color: "#F59E0B", to: "/books", stat: `${data.books?.length ?? 0} kitob`, sub: "kuzatilmoqda" },
              { label: "Odatlar", icon: Repeat, color: "#10B981", to: "/habits", stat: `${data.habits?.length ?? 0} odat`, sub: "faol" },
              { label: "Mahorat", icon: Trophy, color: "#9333EA", to: "/mastery", stat: "Focus", sub: "yozing" },
            ].map((mod) => (
              <Link to={mod.to} key={mod.to}>
                <Card className="p-4 hover:shadow-medium transition-all duration-200 cursor-pointer group hover:-translate-y-0.5">
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${mod.color}15` }}
                    >
                      <mod.icon className="w-4 h-4" style={{ color: mod.color }} strokeWidth={2} />
                    </div>
                    <ArrowUpRight
                      className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors"
                    />
                  </div>
                  <p className="text-[15px] font-bold text-gray-800">{mod.stat}</p>
                  <p className="text-[11px] text-gray-400 font-medium mt-0.5">{mod.sub}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Right Column (1 col) */}
        <div className="space-y-5">

          {/* Finance Widget */}
          <Card>
            <CardHeader
              title={t("dashboard.finance.header")}
              icon={Wallet}
              iconColor="#14B8A6"
              action={
                <Link to="/finance">
                  <ArrowUpRight className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors" />
                </Link>
              }
            />
            <div className="p-5 space-y-4">
              <div>
                <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider mb-1">
                  {t("dashboard.finance.wealth")}
                </p>
                <div className="flex items-end gap-2">
                  <p className="text-3xl font-bold text-gray-900">92%</p>
                  <span className="text-[11px] text-emerald-600 font-semibold mb-1 bg-emerald-50 px-2 py-0.5 rounded-full">
                    +3%
                  </span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[11px] text-gray-500 font-medium">
                    {t("dashboard.finance.debt")}
                  </span>
                  <span className="text-[11px] font-semibold text-gray-600">$1,200</span>
                </div>
                <ProgressBar value={70} color="#14B8A6" />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                {[
                  { label: "Daromad", value: "$4,200", color: "#10B981" },
                  { label: "Xarajat", value: "$1,800", color: "#F43F5E" },
                ].map((item) => (
                  <div key={item.label} className="bg-gray-50/70 rounded-lg p-3">
                    <p className="text-[11px] text-gray-500 font-medium">{item.label}</p>
                    <p
                      className="text-[15px] font-bold mt-0.5"
                      style={{ color: item.color }}
                    >
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Community Pulse */}
          <Card>
            <CardHeader
              title={t("dashboard.community_pulse.header")}
              subtitle={t("dashboard.community_pulse.subtitle")}
              icon={MessageSquare}
              iconColor="#EC4899"
            />

            <div className="flex flex-col" style={{ height: 320 }}>
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 no-scrollbar">
                <AnimatePresence>
                  {comments.map((comment, i) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex gap-2.5"
                    >
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: comment.color }}
                      >
                        {comment.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[12px] font-semibold text-gray-700">
                            {comment.user}
                          </span>
                          <span className="text-[10px] text-gray-400">{comment.time}</span>
                        </div>
                        <div className="bg-gray-50 rounded-lg px-3 py-2">
                          <p className="text-[12.5px] text-gray-600 leading-relaxed">
                            {comment.text}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="px-4 pb-4 pt-2 border-t border-gray-50">
                <div className="flex gap-2">
                  <input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                    placeholder={t("dashboard.community_pulse.comment_placeholder")}
                    className="flex-1 h-9 rounded-lg bg-gray-50 border border-gray-100 text-[13px] text-gray-700 placeholder:text-gray-400 px-3 outline-none focus:border-violet-300 focus:bg-white transition-all"
                  />
                  <button
                    onClick={handleAddComment}
                    className="w-9 h-9 rounded-lg bg-violet-600 text-white flex items-center justify-center hover:bg-violet-700 transition-colors flex-shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" strokeWidth={2} />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
