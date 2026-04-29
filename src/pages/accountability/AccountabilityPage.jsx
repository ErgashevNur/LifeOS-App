import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ChevronLeft, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useLifeOSData } from "@/lib/lifeos-store";

// ─── Partner card ─────────────────────────────────────────────────────────────

function PartnerCard({ partner }) {
  const missedToday = (partner.sharedHabits || []).filter(h => !h.partnerStatus);

  return (
    <div className="bg-white rounded-2xl border border-black/[0.07] p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center text-[16px]">
          {partner.avatar || partner.name?.[0] || "?"}
        </div>
        <div>
          <div className="text-[13px] font-medium text-gray-900">{partner.name}</div>
          <div className="text-[10px] text-gray-400">
            {(partner.sharedHabits || []).length} ta umumiy odat
          </div>
        </div>
        <div className="ml-auto">
          {missedToday.length === 0 ? (
            <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-lg">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-[10px] text-green-600 font-medium">Yaxshi kun</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 rounded-lg">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span className="text-[10px] text-amber-600 font-medium">{missedToday.length} ta qoldi</span>
            </div>
          )}
        </div>
      </div>

      {/* Shared habits */}
      <div className="flex flex-col gap-1.5">
        {(partner.sharedHabits || []).map(habit => (
          <div key={habit.id} className="flex items-center gap-2.5 px-3 py-2 bg-[#FAFAF9] rounded-xl">
            <span className="text-[14px]">{habit.emoji}</span>
            <span className="text-[12px] text-gray-700 flex-1">{habit.name}</span>
            <div className="flex items-center gap-1">
              {/* Me */}
              <div className={cn(
                "w-5 h-5 rounded-full border flex items-center justify-center text-[9px]",
                habit.myStatus ? "bg-violet-600 border-violet-600 text-white" : "border-gray-300",
              )}>
                {habit.myStatus ? "✓" : "·"}
              </div>
              <span className="text-[9px] text-gray-300">·</span>
              {/* Partner */}
              <div className={cn(
                "w-5 h-5 rounded-full border flex items-center justify-center text-[9px]",
                habit.partnerStatus ? "bg-blue-500 border-blue-500 text-white" : "border-gray-300",
              )}>
                {habit.partnerStatus ? "✓" : "·"}
              </div>
            </div>
            <span className="text-[11px] font-medium text-orange-500">🔥{habit.sharedStreak || 0}</span>
          </div>
        ))}
      </div>

      {/* Nudge */}
      {missedToday.length > 0 && (
        <button className="w-full mt-3 py-2.5 rounded-xl border border-black/[0.07] text-[12px] text-gray-600 bg-[#FAFAF9]">
          💬 Xabar yuborish — qanday ketmoqda?
        </button>
      )}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onInvite }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center text-center px-6 py-12 gap-4"
    >
      <div className="text-[52px]">🤝</div>
      <div>
        <h3 className="text-[16px] font-bold text-gray-900 mb-1">Hali hamroh yo'q</h3>
        <p className="text-[13px] text-gray-500 leading-relaxed max-w-[260px]">
          Do'stingizni taklif qiling. Birgalikda odat shakllantirish 2x samaraliroq.
        </p>
      </div>
      <button
        onClick={onInvite}
        className="flex items-center gap-2 px-5 py-3 rounded-xl bg-violet-600 text-white text-[13px] font-semibold"
      >
        <Plus className="w-4 h-4" /> Hamroh taklif qilish
      </button>
    </motion.div>
  );
}

// ─── Invite sheet ─────────────────────────────────────────────────────────────

function InviteSheet({ onClose }) {
  const inviteLink = "https://lifeos.app/join/abc123"; // placeholder

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 340, damping: 34 }}
        className="fixed inset-x-0 bottom-0 bg-white rounded-t-2xl z-50 pb-8"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-8 h-1 bg-black/[0.1] rounded-full mx-auto mt-3 mb-5" />
        <div className="px-5 flex flex-col items-center gap-4">
          <div className="text-[36px]">🤝</div>
          <div className="text-center">
            <h3 className="text-[16px] font-bold text-gray-900">Hamroh taklif qiling</h3>
            <p className="text-[12px] text-gray-500 mt-1 leading-relaxed max-w-[280px]">
              Havolani ulashing. Do'stingiz qo'shilgandan so'ng umumiy odatlarni tanlaysiz.
            </p>
          </div>
          <div className="w-full px-4 py-3 bg-[#FAFAF9] rounded-xl border border-black/[0.07] flex items-center gap-3">
            <span className="text-[12px] text-gray-600 flex-1 truncate">{inviteLink}</span>
            <button
              onClick={() => navigator.clipboard?.writeText(inviteLink)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 text-white text-[11px] font-medium"
            >
              <Share2 className="w-3 h-3" /> Nusxa
            </button>
          </div>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl border border-black/[0.08] text-[13px] text-gray-500"
          >
            Yopish
          </button>
        </div>
      </motion.div>
    </>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AccountabilityPage() {
  const { data } = useLifeOSData();
  const navigate = useNavigate();
  const [inviteMode, setInviteMode] = useState(false);

  const partners = data.accountabilityPartners || [];

  return (
    <div className="flex flex-col h-full bg-[#F5F5F4]">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 h-[52px] border-b border-black/[0.06] bg-white/60">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/[0.05] transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-[15px] font-semibold text-gray-900">Hamrohlar</h2>
        <button
          onClick={() => setInviteMode(true)}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 text-white text-[12px] font-medium"
        >
          <Plus className="w-3.5 h-3.5" /> Taklif
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {/* Description */}
        <div className="px-4 py-3.5 bg-[#FAFAF9] border border-black/[0.06] rounded-xl">
          <p className="text-[12px] text-gray-600 leading-relaxed">
            Hamrohing tushib ketsa — sen bilasan. U tushib ketsa — sen xabar olasan.
            Jazolash emas — g'amxo'rlik.
          </p>
        </div>

        {partners.length > 0 ? (
          partners.map(p => <PartnerCard key={p.id} partner={p} />)
        ) : (
          <EmptyState onInvite={() => setInviteMode(true)} />
        )}
      </div>

      {/* Invite sheet */}
      <AnimatePresence>
        {inviteMode && <InviteSheet onClose={() => setInviteMode(false)} />}
      </AnimatePresence>
    </div>
  );
}
