import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, 
  ThumbsUp, 
  Share2, 
  Search, 
  Send, 
  TrendingUp, 
  Award,
  Zap,
  Shield,
  HeartPulse,
  Wallet
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const FEED_ITEMS = [
  {
    id: 1,
    user: "Ergashev",
    role: "Founder",
    category: "Moliya",
    text: "Qarzlardan qutilish uchun eng yaxshi usul — 50/30/20 qoidasi. 50% ehtiyojlar, 30% xohishlar, 20% qarzlar uchun.",
    likes: 42,
    comments: 12,
    time: "1 soat oldin",
    icon: Wallet
  },
  {
    id: 2,
    user: "Rahimov",
    role: "Product Design",
    category: "Sog'liq",
    text: "Kuniga kamida 3 litr suv ichish diqqatni jamlashga 20% ga ko'proq yordam beradi. Sinab ko'ring!",
    likes: 85,
    comments: 24,
    time: "3 soat oldin",
    icon: HeartPulse
  },
  {
    id: 3,
    user: "Azizbek",
    role: "User",
    category: "Unumdorlik",
    text: "LifeOS'dagi 'Fokus Soatlari' moduli orqali bugun 8 soat to'xtovsiz ishladim. Tavsiya qilaman!",
    likes: 128,
    comments: 45,
    time: "5 soat oldin",
    icon: Zap
  }
];

export default function CommunityPulsePage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Hammasi");
  const [newComment, setNewComment] = useState("");
  const [feed, setFeed] = useState(FEED_ITEMS);

  const categories = ["Hammasi", "Moliya", "Sog'liq", "Unumdorlik", "Bilim"];

  const filteredFeed = useMemo(() => {
    return feed.filter(item => {
      const matchSearch = item.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.user.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = activeCategory === "Hammasi" || item.category === activeCategory;
      return matchSearch && matchCategory;
    });
  }, [searchQuery, activeCategory, feed]);

  const handlePost = () => {
    if (newComment.trim()) {
      const newItem = {
        id: Date.now(),
        user: "Siz",
        role: "Premium",
        category: activeCategory === "Hammasi" ? "Umumiy" : activeCategory,
        text: newComment,
        likes: 0,
        comments: 0,
        time: "Hozir",
        icon: MessageSquare
      };
      setFeed([newItem, ...feed]);
      setNewComment("");
    }
  };

  return (
    <div className="space-y-12">
      {/* Header & Search */}
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center justify-between">
        <div>
          <h2 className="text-4xl lg:text-5xl font-black tracking-tighter text-slate-900">
            {t('dashboard.community_pulse.header')}
          </h2>
          <p className="mt-2 text-slate-500 font-medium text-lg italic">
            "{t('dashboard.community_pulse.subtitle')}"
          </p>
        </div>

        <div className="relative w-full lg:w-[400px]">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Izlash (masalan: Moliya, Suv, Fokus)..."
            className="h-16 rounded-2xl bg-white border-0 shadow-premium px-16 font-bold text-sm ring-1 ring-slate-100 focus-visible:ring-indigo-500"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "shrink-0 px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
              activeCategory === cat 
                ? "bg-slate-900 text-white shadow-xl scale-[1.05]" 
                : "bg-white text-slate-500 shadow-premium ring-1 ring-slate-100 hover:bg-slate-50"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Post Input */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-premium ring-1 ring-slate-100 relative group">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-indigo-500 to-cyan-400 opacity-20 group-focus-within:opacity-100 transition-opacity rounded-t-[2.5rem]" />
        <div className="flex gap-6">
          <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black">
            SIES
          </div>
          <div className="flex-1 space-y-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={t('dashboard.community_pulse.comment_placeholder')}
              className="w-full bg-transparent border-0 focus:ring-0 text-xl font-bold tracking-tight text-slate-900 placeholder:text-slate-300 resize-none min-h-[100px] no-scrollbar"
            />
            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-slate-50 border-0 rounded-lg px-3 py-1 font-bold text-[9px] text-slate-400 uppercase tracking-widest ">
                  Markdown
                </Badge>
              </div>
              <Button 
                onClick={handlePost}
                className="h-14 px-10 rounded-2xl bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-transform"
              >
                {t('dashboard.community_pulse.post')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="grid gap-8">
        <AnimatePresence mode="popLayout">
          {filteredFeed.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-[2.5rem] p-8 lg:p-10 shadow-premium ring-1 ring-slate-100 group hover:ring-indigo-500/10 transition-all hover:-translate-y-1"
            >
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className={cn("h-16 w-16 rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-lg", 
                  item.category === "Moliya" ? "bg-emerald-50 text-emerald-600" :
                  item.category === "Sog'liq" ? "bg-red-50 text-red-600" : 
                  "bg-indigo-50 text-indigo-600"
                )}>
                  <item.icon className="w-8 h-8" />
                </div>

                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-black tracking-tight text-slate-900">{item.user}</span>
                      <Badge className="bg-slate-100 text-slate-400 font-black text-[8px] uppercase tracking-widest border-0 p-1.5 rounded-md leading-none h-fit">
                        {item.role}
                      </Badge>
                    </div>
                    <span className="text-xs font-bold text-slate-400">{item.time}</span>
                  </div>

                  <p className="text-xl font-bold tracking-tight text-slate-700 leading-relaxed">
                    {item.text}
                  </p>

                  <div className="flex items-center gap-8 pt-6">
                    <button className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors group/btn">
                      <ThumbsUp className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                      <span className="text-sm font-black italic">{item.likes}</span>
                    </button>
                    <button className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors group/btn">
                      <MessageSquare className="w-5 h-5" />
                      <span className="text-sm font-black italic">{item.comments}</span>
                    </button>
                    <button className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors group/btn ml-auto">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Stats / Sidebar-like footer or separate widget */}
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Award className="w-24 h-24" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Jamiyat Trendlari</p>
          <h3 className="text-2xl font-black tracking-tighter mt-4">Hafta Maqsadi:</h3>
          <p className="text-slate-400 font-bold mt-2">10,000 foydalanuvchi qarzdan qutildi!</p>
        </div>
      </div>
    </div>
  );
}
