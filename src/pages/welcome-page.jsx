import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, CheckCircle2, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function WelcomePage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-slate-950 overflow-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50 rounded-full blur-[120px] -z-10 opacity-60" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-50 rounded-full blur-[100px] -z-10 opacity-50" />

      {/* Top Navigation / Language Switcher */}
      <div className="absolute top-8 right-8 z-50 bg-slate-50 p-1 rounded-full border border-slate-200">
        <LanguageSwitcher />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-2xl w-full text-center space-y-10"
      >
        <div className="flex justify-center">
          <div className="h-24 w-24 rounded-[2rem] bg-slate-950 flex items-center justify-center shadow-2xl shadow-slate-900/20 relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-cyan-400 opacity-20 blur-xl group-hover:opacity-40 transition-opacity" />
            <User className="h-10 w-10 text-white relative z-10" />
          </div>
        </div>

        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-[10px] font-black tracking-widest uppercase text-slate-600 shadow-sm"
          >
            <Sparkles className="w-3 h-3 text-indigo-500" />
            {t('welcome.badge')}
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-950 leading-tight whitespace-pre-line">
            {t('welcome.title')}
          </h1>
          <p className="text-lg text-slate-500 max-w-md mx-auto leading-relaxed">
            {t('welcome.desc')}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 text-left">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/40 space-y-3"
          >
            <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900">{t('welcome.steps.profile.title')}</h3>
            <p className="text-sm text-slate-500 leading-snug">{t('welcome.steps.profile.desc')}</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/40 space-y-3"
          >
            <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900">{t('welcome.steps.dashboard.title')}</h3>
            <p className="text-sm text-slate-500 leading-snug">{t('welcome.steps.dashboard.desc')}</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="pt-6"
        >
          <Link to="/dashboard">
            <button className="h-16 px-10 rounded-[1.5rem] bg-slate-950 text-white font-bold text-lg shadow-2xl shadow-slate-900/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 mx-auto">
              {t('welcome.button')}
              <ArrowRight className="h-5 w-5" />
            </button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
