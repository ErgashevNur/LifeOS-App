import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  ArrowUpRight, 
  CreditCard, 
  PiggyBank, 
  ShieldCheck, 
  Zap, 
  Target,
  FileText,
  BarChart3
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLifeOSData } from "@/lib/lifeos-store";
import { cn } from "@/lib/utils";

function FinancialCard({ children, className, title, subtitle, icon: Icon, color }) {
  return (
    <div className={cn("bg-white rounded-[2.5rem] p-8 shadow-premium ring-1 ring-slate-100 hover:ring-indigo-500/10 transition-all", className)}>
      <div className="flex items-center justify-between mb-8">
        <div>
          {title && <h3 className="text-xl font-black tracking-tight text-slate-900">{title}</h3>}
          {subtitle && <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{subtitle}</p>}
        </div>
        <div className={cn("p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform", color)}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {children}
    </div>
  );
}

function ProgressIndicator({ value, label, current, target, color = "bg-indigo-500" }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">{label}</p>
        <span className="text-sm font-black text-slate-900">{value}%</span>
      </div>
      <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          className={cn("h-full rounded-full shadow-[0_0_15px_rgba(0,0,0,0.1)]", color)} 
        />
      </div>
      <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        <span>{current}</span>
        <span>Target: {target}</span>
      </div>
    </div>
  );
}

export default function FinancialCenterPage() {
  const { t } = useTranslation();
  const { data } = useLifeOSData();
  const finance = data.finance ?? {};

  const wealthScore = Number(finance.wealthScore) || 0;
  const monthlyGrowthPct = Number(finance.monthlyGrowthPct) || 0;
  const debtCurrent = Math.max(0, Number(finance.debtCurrent) || 0);
  const debtTarget = Math.max(1, Number(finance.debtTarget) || 1);
  const debtProgress = Math.max(0, Math.min(100, Math.round((debtCurrent / debtTarget) * 100)));
  const savingsCurrent = Math.max(0, Number(finance.savingsCurrent) || 0);
  const savingsTarget = Math.max(1, Number(finance.savingsTarget) || 1);
  const savingsProgress = Math.max(0, Math.min(100, Math.round((savingsCurrent / savingsTarget) * 100)));
  const income = Math.max(0, Number(finance.income) || 0);
  const expense = Math.max(0, Number(finance.expense) || 0);
  const debtPlanHint =
    typeof finance.debtPlanHint === "string" && finance.debtPlanHint.trim()
      ? finance.debtPlanHint
      : "Moliyaviy reja bo'yicha izoh hali kiritilmagan.";
  const investments = Array.isArray(finance.investments) ? finance.investments : [];

  const formatMoney = (value) =>
    `$${Math.round(value).toLocaleString("en-US")}`;
  const formatPercent = (value) =>
    `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h2 className="text-4xl lg:text-5xl font-black tracking-tighter text-slate-900">
            {t('dashboard.finance.header')}
          </h2>
          <p className="mt-2 text-slate-500 font-medium text-lg italic">
            "Moliya erkinligi — o'z kelajagingizni boshqarishning birinchi qadami."
          </p>
        </div>
        <div className="flex gap-4">
          <Badge className="bg-emerald-50 text-emerald-600 px-6 py-2 rounded-2xl font-black text-xs uppercase tracking-widest border-0">
            Harakatdagi Hisob
          </Badge>
          <Badge className="bg-indigo-50 text-indigo-600 px-6 py-2 rounded-2xl font-black text-xs uppercase tracking-widest border-0">
            Premium Access
          </Badge>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Wealth Score Card */}
        <FinancialCard 
          title={t('dashboard.finance.wealth')} 
          subtitle="Umumiy holat" 
          icon={TrendingUp} 
          color="bg-indigo-500 text-white"
          className="lg:col-span-1 shadow-2xl shadow-indigo-500/10"
        >
          <div className="mt-4 text-center py-8">
            <p className="text-7xl font-black tracking-tighter text-slate-900">{wealthScore}/100</p>
            <p className="mt-4 text-sm font-bold text-slate-400 uppercase tracking-widest">Mukammal Daraja!</p>
          </div>
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-sm font-bold text-slate-600">Oylik o'sish</span>
              <span className="flex items-center gap-1 text-emerald-500 font-black">
                <ArrowUpRight className="w-4 h-4" />
                {formatPercent(monthlyGrowthPct)}
              </span>
            </div>
          </div>
        </FinancialCard>

        {/* Debt Repayment Planner */}
        <FinancialCard 
          title={t('dashboard.finance.debt')} 
          subtitle="Qarzlardan xalos bo'ling" 
          icon={CreditCard} 
          color="bg-red-500 text-white"
          className="lg:col-span-2"
        >
          <div className="grid gap-12 md:grid-cols-2 mt-8">
            <div className="space-y-8">
              <ProgressIndicator 
                label="Qarz progressi" 
                value={debtProgress} 
                current={formatMoney(debtCurrent)} 
                target={formatMoney(debtTarget)} 
                color="bg-red-400"
              />
              <ProgressIndicator 
                label="Jamg'arma progressi" 
                value={savingsProgress} 
                current={formatMoney(savingsCurrent)} 
                target={formatMoney(savingsTarget)} 
                color="bg-emerald-400"
              />
            </div>
            <div className="rounded-[2rem] bg-slate-50 border border-slate-100 p-8 space-y-6 flex flex-col justify-center">
              <div className="p-4 bg-white rounded-2xl w-fit shadow-sm">
                <Zap className="w-6 h-6 text-yellow-500" />
              </div>
              <h4 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
                {debtPlanHint}
              </h4>
              <Button className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest">
                Rejani ko'rish
              </Button>
            </div>
          </div>
        </FinancialCard>
      </div>

      {/* Savings & Investments */}
      <div className="grid gap-8 lg:grid-cols-3">
        <FinancialCard 
          title={t('dashboard.finance.savings')} 
          subtitle="Jamg'armalar" 
          icon={PiggyBank} 
          color="bg-cyan-500 text-white"
        >
          <div className="mt-4 space-y-6">
            <div className="text-center p-6 border-2 border-dashed border-slate-100 rounded-[2.5rem]">
              <p className="text-4xl font-black tracking-tighter text-slate-900">{formatMoney(savingsCurrent)}</p>
              <p className="text-[10px] font-black uppercase text-slate-400 mt-2">Saved / Total</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Daromad</p>
                <p className="text-sm font-black text-emerald-600 mt-1">{formatMoney(income)}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Xarajat</p>
                <p className="text-sm font-black text-rose-500 mt-1">{formatMoney(expense)}</p>
              </div>
            </div>
            <Button className="w-full h-12 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-100">
              Transfer Funds
            </Button>
          </div>
        </FinancialCard>

        <FinancialCard 
          title="Investitsiyalar" 
          subtitle="Kelajak aktivlari" 
          icon={BarChart3} 
          color="bg-emerald-500 text-white"
          className="lg:col-span-2"
        >
          <div className="grid gap-6 sm:grid-cols-3 mt-4">
            {investments.map((item, i) => (
              <div key={i} className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 hover:scale-[1.02] transition-transform">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
                <p className="text-2xl font-black text-slate-900 mt-2">{item.val}</p>
                <div className="mt-3 inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-emerald-600">
                  {item.stat}
                </div>
              </div>
            ))}
            {investments.length === 0 && (
              <div className="sm:col-span-3 rounded-[2rem] bg-slate-50 border border-slate-100 p-6 text-center text-sm font-semibold text-slate-400">
                Investitsiya ma'lumotlari hozircha mavjud emas.
              </div>
            )}
          </div>
        </FinancialCard>
      </div>

      {/* Security Info */}
      <div className="bg-white rounded-[2.5rem] p-10 shadow-premium ring-1 ring-slate-100 flex flex-col md:flex-row items-center gap-10">
        <div className="h-20 w-20 rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <div className="flex-1 text-center md:text-left space-y-2">
          <h3 className="text-2xl font-black tracking-tighter text-slate-900 uppercase">Xavfsizlik Birinchi Navbatda</h3>
          <p className="text-slate-500 font-medium">Bank darajasidagi 256-bitli shifrlash tizimi orqali barcha ma'lumotlaringiz himoyalangan.</p>
        </div>
        <Button variant="outline" className="h-14 px-8 rounded-2xl border-2 font-black uppercase text-xs tracking-widest">
          Audit ko'rish
        </Button>
      </div>
    </div>
  );
}
