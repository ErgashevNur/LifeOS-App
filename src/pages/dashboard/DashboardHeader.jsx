import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/dashboardEngine";

const STATUS_CONFIG = {
  excellent:  { text: "Ajoyib kun! 🔥",         color: "text-violet-600" },
  good:       { text: "Yaxshi ketmoqda",         color: "text-green-600"  },
  ok:         { text: "Davom ettiramiz",         color: "text-amber-600"  },
  started:    { text: "Boshlandi",               color: "text-blue-600"   },
  notStarted: { text: "Bugun hali boshlanmadi",  color: "text-gray-400"   },
};

export default function DashboardHeader({ name, status, hour }) {
  const greeting = hour < 12 ? "Xayrli tong" : hour < 17 ? "Xayrli kun" : "Xayrli kech";
  const s = STATUS_CONFIG[status] || STATUS_CONFIG.notStarted;
  const now = new Date();

  return (
    <div className="flex items-end justify-between pt-1">
      <div>
        <p className="text-[13px] text-gray-400">{greeting}</p>
        <h1 className="text-[24px] font-bold text-gray-900 mt-0.5 leading-none">
          {name || "Salom"}
        </h1>
        <p className={cn("text-[13px] font-medium mt-1.5", s.color)}>
          {s.text}
        </p>
      </div>

      <div className="text-right">
        <p className="text-[20px] font-bold text-gray-900">
          {formatDate(now, "d")}
        </p>
        <p className="text-[11px] text-gray-400">
          {formatDate(now, "MMMM, eeee")}
        </p>
      </div>
    </div>
  );
}
