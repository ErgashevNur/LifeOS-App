import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLifeOSData } from "@/lib/lifeos-store";
import { cn } from "@/lib/utils";
import {
  Plus, Search, Target, ChevronDown, ChevronRight, X, Check, Calendar,
  TrendingUp, AlertTriangle, Filter, LayoutGrid, List, Clock, ArrowUpDown,
  MoreHorizontal, Play, Pause, Archive, Copy, Trash2, Edit3, Flag,
  Zap, Link2, Repeat, FileText, Star, Sparkles, CheckCircle2, Circle,
  ArrowRight, Bot, Milestone, StickyNote, BarChart3, Eye, RefreshCw,
  ChevronUp, GripVertical, Layers, Timer, Hash, MessageSquare,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════════
   CONSTANTS & DATA
   ═══════════════════════════════════════════════════════════════════════════ */

const GOAL_TYPES = [
  { value: "outcome", label: "Outcome", desc: "Measurable end result" },
  { value: "process", label: "Process", desc: "Ongoing practice or habit" },
  { value: "learning", label: "Learning", desc: "Skill or knowledge acquisition" },
  { value: "project", label: "Project", desc: "Deliverable with clear scope" },
];

const CATEGORIES = [
  { value: "career", label: "Career", icon: "💼" },
  { value: "health", label: "Health", icon: "🏃" },
  { value: "education", label: "Education", icon: "📚" },
  { value: "finance", label: "Finance", icon: "💰" },
  { value: "relationships", label: "Relationships", icon: "🤝" },
  { value: "personal", label: "Personal", icon: "🌱" },
  { value: "creative", label: "Creative", icon: "🎨" },
  { value: "spiritual", label: "Spiritual", icon: "🧘" },
];

const PRIORITY_LEVELS = [
  { value: "critical", label: "Critical", color: "bg-zinc-900 text-white" },
  { value: "high", label: "High", color: "bg-zinc-700 text-white" },
  { value: "medium", label: "Medium", color: "bg-zinc-300 text-zinc-800" },
  { value: "low", label: "Low", color: "bg-zinc-100 text-zinc-500" },
];

const EFFORT_LEVELS = [
  { value: "minimal", label: "Minimal", desc: "< 1 hr/week" },
  { value: "moderate", label: "Moderate", desc: "2-5 hrs/week" },
  { value: "significant", label: "Significant", desc: "5-10 hrs/week" },
  { value: "intensive", label: "Intensive", desc: "10+ hrs/week" },
];

const TABS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "annual", label: "Annual" },
  { key: "quarterly", label: "Quarterly" },
  { key: "monthly", label: "Monthly" },
  { key: "completed", label: "Completed" },
  { key: "archived", label: "Archived" },
];

const SORT_OPTIONS = [
  { value: "deadline-asc", label: "Nearest Deadline" },
  { value: "progress-desc", label: "Highest Progress" },
  { value: "progress-asc", label: "Lowest Progress" },
  { value: "updated-desc", label: "Recently Updated" },
  { value: "priority-desc", label: "Most Important" },
];

const STATUS_OPTIONS = [
  { value: "on-track", label: "On Track" },
  { value: "at-risk", label: "At Risk" },
  { value: "behind", label: "Behind" },
  { value: "paused", label: "Paused" },
  { value: "completed", label: "Completed" },
];

const SAMPLE_TEMPLATES = [
  { title: "Read 24 Books This Year", type: "outcome", category: "education", priority: "medium" },
  { title: "Build a Side Project", type: "project", category: "career", priority: "high" },
  { title: "Meditate Daily for 90 Days", type: "process", category: "spiritual", priority: "medium" },
  { title: "Save $10,000 Emergency Fund", type: "outcome", category: "finance", priority: "high" },
  { title: "Run a Half Marathon", type: "outcome", category: "health", priority: "medium" },
  { title: "Learn a New Language to B1", type: "learning", category: "education", priority: "medium" },
];

/* ═══════════════════════════════════════════════════════════════════════════
   ANIMATION VARIANTS
   ═══════════════════════════════════════════════════════════════════════════ */

const fade = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.04 } },
};

const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: 10, transition: { duration: 0.2 } },
};

const drawerVariant = {
  initial: { x: "100%" },
  animate: { x: 0, transition: { type: "spring", damping: 30, stiffness: 300 } },
  exit: { x: "100%", transition: { duration: 0.25, ease: "easeIn" } },
};

/* ═══════════════════════════════════════════════════════════════════════════
   UTILITY HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

let _goalId = Date.now();
function uid() { return `goal_${_goalId++}`; }
function milestoneUid() { return `ms_${_goalId++}`; }

function toUIGoal(sg) {
  const progress = sg.progress ?? Math.round((sg.currentValue / Math.max(1, sg.targetValue)) * 100);
  return {
    id: sg.id,
    title: sg.title,
    deadline: sg.deadline ? new Date(sg.deadline).toISOString().slice(0, 10) : "",
    progress,
    period: sg.period,
    targetValue: sg.targetValue,
    currentValue: sg.currentValue,
    createdAt: sg.createdAt || new Date().toISOString(),
    type: "outcome",
    category: "personal",
    priority: "medium",
    effort: "moderate",
    status: progress >= 100 ? "completed" : "on-track",
    milestones: [],
    notes: [],
    reviews: [],
    linkedTasks: [],
    linkedHabits: [],
  };
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
  return diff;
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatDateShort(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function progressColor(pct) {
  if (pct >= 100) return "bg-zinc-900";
  if (pct >= 70) return "bg-zinc-700";
  if (pct >= 40) return "bg-zinc-500";
  return "bg-zinc-400";
}

function statusMeta(status) {
  switch (status) {
    case "completed": return { label: "Completed", bg: "bg-zinc-900", text: "text-white" };
    case "on-track": return { label: "On Track", bg: "bg-zinc-100", text: "text-zinc-700" };
    case "at-risk": return { label: "At Risk", bg: "bg-amber-50", text: "text-amber-700" };
    case "behind": return { label: "Behind", bg: "bg-red-50", text: "text-red-600" };
    case "paused": return { label: "Paused", bg: "bg-zinc-100", text: "text-zinc-400" };
    case "archived": return { label: "Archived", bg: "bg-zinc-50", text: "text-zinc-400" };
    default: return { label: "Active", bg: "bg-zinc-100", text: "text-zinc-600" };
  }
}

function computeStatus(goal) {
  if (goal.status === "completed" || goal.status === "archived" || goal.status === "paused") return goal.status;
  const pct = goal.progress ?? 0;
  if (pct >= 100) return "completed";
  const days = daysUntil(goal.deadline);
  if (days !== null && days < 0) return "behind";
  if (days !== null && days < 7 && pct < 80) return "at-risk";
  if (pct < 30 && days !== null && days < 30) return "at-risk";
  return "on-track";
}

function computeMomentum(goal) {
  // Momentum based on milestones completed in last 7 days + general progress trajectory
  const completedMilestones = (goal.milestones || []).filter(m => m.done).length;
  const totalMilestones = (goal.milestones || []).length;
  if (totalMilestones === 0) return "steady";
  const ratio = completedMilestones / totalMilestones;
  if (ratio > 0.6) return "strong";
  if (ratio > 0.3) return "steady";
  return "slowing";
}

function momentumMeta(momentum) {
  switch (momentum) {
    case "strong": return { label: "Strong momentum", icon: TrendingUp, color: "text-zinc-800" };
    case "steady": return { label: "Steady pace", icon: ArrowRight, color: "text-zinc-500" };
    case "slowing": return { label: "Needs attention", icon: AlertTriangle, color: "text-amber-600" };
    default: return { label: "—", icon: Circle, color: "text-zinc-400" };
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   REUSABLE UI PRIMITIVES
   ═══════════════════════════════════════════════════════════════════════════ */

function Card({ children, className, onClick, ...rest }) {
  return (
    <motion.div
      {...fade}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "bg-white rounded-2xl border border-zinc-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
        onClick && "cursor-pointer hover:border-zinc-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-200",
        className,
      )}
      onClick={onClick}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

function Badge({ children, className }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide",
      className,
    )}>
      {children}
    </span>
  );
}

function ProgressBar({ value, height = "h-[5px]", className, showLabel }) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn(height, "flex-1 bg-zinc-100 rounded-full overflow-hidden", className)}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className={cn("h-full rounded-full", progressColor(value))}
        />
      </div>
      {showLabel && (
        <span className="text-[11px] font-semibold text-zinc-500 tabular-nums w-8 text-right">
          {Math.round(value)}%
        </span>
      )}
    </div>
  );
}

function IconButton({ icon: Icon, label, onClick, className, size = "w-8 h-8", active }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        size, "rounded-xl flex items-center justify-center transition-all duration-150",
        active
          ? "bg-zinc-900 text-white"
          : "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100",
        className,
      )}
    >
      <Icon className="w-4 h-4" strokeWidth={1.8} />
    </button>
  );
}

function EmptyState({ icon: Icon, title, desc, action }) {
  return (
    <motion.div
      {...fade}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-zinc-400" strokeWidth={1.5} />
      </div>
      <p className="text-sm font-semibold text-zinc-700">{title}</p>
      <p className="text-xs text-zinc-400 mt-1 max-w-[280px]">{desc}</p>
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}

function Dropdown({ trigger, children, align = "right" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen(o => !o)}>{trigger}</div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute z-50 mt-1 min-w-[180px] bg-white border border-zinc-200 rounded-xl shadow-lg py-1",
              align === "right" ? "right-0" : "left-0",
            )}
            onClick={() => setOpen(false)}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DropdownItem({ icon: Icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2.5 px-3 py-2 text-[12px] font-medium transition-colors text-left",
        danger
          ? "text-red-500 hover:bg-red-50"
          : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900",
      )}
    >
      {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.8} />}
      {label}
    </button>
  );
}

function Modal({ open, onClose, children, title, subtitle, wide }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[60]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[61]",
              "bg-white rounded-2xl border border-zinc-200 shadow-2xl",
              "flex flex-col max-h-[90vh]",
              wide ? "w-[680px] max-w-[95vw]" : "w-[520px] max-w-[95vw]",
            )}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-zinc-100 flex-shrink-0">
              <div>
                <h3 className="text-[15px] font-bold text-zinc-900">{title}</h3>
                {subtitle && <p className="text-[11px] text-zinc-400 mt-0.5">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Modal body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 modal-scroll">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Drawer({ open, onClose, children, title, subtitle, actions: headerActions }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-[60]"
            onClick={onClose}
          />
          <motion.aside
            {...drawerVariant}
            className="fixed right-0 top-0 h-full w-[520px] max-w-[95vw] bg-white border-l border-zinc-200 shadow-2xl z-[61] flex flex-col"
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-6 h-[60px] border-b border-zinc-100 flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="min-w-0">
                  <h3 className="text-[14px] font-bold text-zinc-900 truncate">{title}</h3>
                  {subtitle && <p className="text-[10px] text-zinc-400 truncate">{subtitle}</p>}
                </div>
              </div>
              {headerActions && <div className="flex items-center gap-1.5">{headerActions}</div>}
            </div>
            {/* Drawer body */}
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function FormField({ label, required, children }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, className, ...rest }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        "w-full bg-transparent text-sm font-medium outline-none border border-zinc-200 rounded-xl px-3.5 py-2.5",
        "text-zinc-800 placeholder:text-zinc-300 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-200 transition-all",
        className,
      )}
      {...rest}
    />
  );
}

function TextArea({ value, onChange, placeholder, rows = 3, className }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={cn(
        "w-full bg-transparent text-sm font-medium outline-none border border-zinc-200 rounded-xl px-3.5 py-2.5 resize-none",
        "text-zinc-800 placeholder:text-zinc-300 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-200 transition-all",
        className,
      )}
    />
  );
}

function SelectInput({ value, onChange, options, placeholder }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "w-full bg-transparent text-sm font-medium outline-none border border-zinc-200 rounded-xl px-3.5 py-2.5 appearance-none",
        "text-zinc-800 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-200 transition-all",
        !value && "text-zinc-300",
      )}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

function PillToggle({ options, value, onChange }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value === value ? "" : opt.value)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all",
            value === opt.value
              ? (opt.color || "bg-zinc-900 text-white")
              : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200",
          )}
        >
          {opt.icon && <span className="mr-1">{opt.icon}</span>}
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   STAT CARDS ROW
   ═══════════════════════════════════════════════════════════════════════════ */

function StatCard({ label, value, icon: Icon, trend, accent }) {
  return (
    <Card className="px-4 py-4">
      <div className="flex items-start justify-between mb-2">
        <div className="w-9 h-9 rounded-xl bg-zinc-50 flex items-center justify-center">
          <Icon className={cn("w-4.5 h-4.5", accent || "text-zinc-500")} strokeWidth={1.8} />
        </div>
        {trend !== undefined && (
          <span className={cn(
            "text-[10px] font-bold px-1.5 py-0.5 rounded-md",
            trend >= 0 ? "bg-zinc-100 text-zinc-700" : "bg-red-50 text-red-500",
          )}>
            {trend >= 0 ? "+" : ""}{trend}%
          </span>
        )}
      </div>
      <p className="text-2xl font-black text-zinc-900 tabular-nums">{value}</p>
      <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mt-0.5">{label}</p>
    </Card>
  );
}

function OverviewStats({ goals }) {
  const active = goals.filter(g => g.status !== "completed" && g.status !== "archived").length;
  const completedThisMonth = goals.filter(g => {
    if (g.status !== "completed") return false;
    const now = new Date();
    const completed = g.completedAt ? new Date(g.completedAt) : null;
    return completed && completed.getMonth() === now.getMonth() && completed.getFullYear() === now.getFullYear();
  }).length;
  const atRisk = goals.filter(g => computeStatus(g) === "at-risk" || computeStatus(g) === "behind").length;

  const onTrackGoals = goals.filter(g => g.status !== "completed" && g.status !== "archived");
  const onTrackCount = onTrackGoals.filter(g => computeStatus(g) === "on-track").length;
  const onTrackRate = onTrackGoals.length > 0 ? Math.round((onTrackCount / onTrackGoals.length) * 100) : 100;

  const goalsWithMilestones = goals.filter(g => g.milestones && g.milestones.length > 0);
  const totalMs = goalsWithMilestones.reduce((s, g) => s + g.milestones.length, 0);
  const doneMs = goalsWithMilestones.reduce((s, g) => s + g.milestones.filter(m => m.done).length, 0);
  const consistency = totalMs > 0 ? Math.round((doneMs / totalMs) * 100) : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      <StatCard label="Active Goals" value={active} icon={Target} />
      <StatCard label="Completed This Month" value={completedThisMonth} icon={CheckCircle2} />
      <StatCard label="Goals At Risk" value={atRisk} icon={AlertTriangle} accent={atRisk > 0 ? "text-amber-600" : undefined} />
      <StatCard label="On Track Rate" value={`${onTrackRate}%`} icon={TrendingUp} />
      <StatCard label="Goal Consistency" value={`${consistency}%`} icon={BarChart3} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   GOAL CARD
   ═══════════════════════════════════════════════════════════════════════════ */

function GoalCardGrid({ goal, onOpen, onAction }) {
  const status = computeStatus(goal);
  const sm = statusMeta(status);
  const momentum = computeMomentum(goal);
  const mm = momentumMeta(momentum);
  const MomentumIcon = mm.icon;
  const days = daysUntil(goal.deadline);
  const cat = CATEGORIES.find(c => c.value === goal.category);
  const linkedTasks = goal.linkedTasks?.length ?? 0;
  const linkedHabits = goal.linkedHabits?.length ?? 0;
  const pct = Math.min(100, Math.max(0, goal.progress ?? 0));

  return (
    <Card onClick={() => onOpen(goal.id)} className="flex flex-col">
      {/* Top row */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {cat && <span className="text-sm flex-shrink-0">{cat.icon}</span>}
            <Badge className={cn(sm.bg, sm.text)}>{sm.label}</Badge>
          </div>
          <Dropdown
            trigger={
              <IconButton icon={MoreHorizontal} size="w-7 h-7" label="Actions" onClick={(e) => e.stopPropagation()} />
            }
          >
            <DropdownItem icon={Eye} label="Open" onClick={() => onOpen(goal.id)} />
            <DropdownItem icon={Milestone} label="Add Milestone" onClick={() => onAction(goal.id, "add-milestone")} />
            <DropdownItem icon={Link2} label="Link Task" onClick={() => onAction(goal.id, "link-task")} />
            <div className="h-px bg-zinc-100 my-1" />
            <DropdownItem icon={Edit3} label="Edit Goal" onClick={() => onAction(goal.id, "edit")} />
            <DropdownItem icon={Copy} label="Duplicate" onClick={() => onAction(goal.id, "duplicate")} />
            <DropdownItem
              icon={goal.status === "paused" ? Play : Pause}
              label={goal.status === "paused" ? "Resume Goal" : "Pause Goal"}
              onClick={() => onAction(goal.id, "toggle-pause")}
            />
            <DropdownItem icon={Archive} label="Archive Goal" onClick={() => onAction(goal.id, "archive")} />
            <DropdownItem icon={StickyNote} label="Add Note" onClick={() => onAction(goal.id, "add-note")} />
            <DropdownItem icon={RefreshCw} label="Review Goal" onClick={() => onAction(goal.id, "review")} />
            <div className="h-px bg-zinc-100 my-1" />
            <DropdownItem icon={Trash2} label="Delete Goal" danger onClick={() => onAction(goal.id, "delete")} />
          </Dropdown>
        </div>

        {/* Title + description */}
        <h3 className={cn(
          "text-[14px] font-bold leading-snug mb-1",
          status === "completed" ? "text-zinc-400 line-through" : "text-zinc-900",
        )}>
          {goal.title}
        </h3>
        {goal.description && (
          <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2 mb-3">{goal.description}</p>
        )}

        {/* Progress */}
        <ProgressBar value={pct} showLabel />

        {/* Deadline */}
        {goal.deadline && (
          <div className="flex items-center gap-1.5 mt-2.5">
            <Calendar className="w-3 h-3 text-zinc-400" strokeWidth={1.8} />
            <span className={cn(
              "text-[11px] font-medium",
              days !== null && days < 7 && days >= 0 ? "text-amber-600" : days !== null && days < 0 ? "text-red-500" : "text-zinc-400",
            )}>
              {formatDateShort(goal.deadline)}
              {days !== null && days >= 0 && <span className="ml-1 text-zinc-300">({days}d left)</span>}
              {days !== null && days < 0 && <span className="ml-1">({Math.abs(days)}d overdue)</span>}
            </span>
          </div>
        )}
      </div>

      {/* Bottom section */}
      <div className="mt-auto border-t border-zinc-100 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Next action */}
          {goal.nextAction && (
            <div className="flex items-center gap-1.5 max-w-[140px]">
              <Zap className="w-3 h-3 text-zinc-400 flex-shrink-0" strokeWidth={2} />
              <span className="text-[10px] font-medium text-zinc-500 truncate">{goal.nextAction}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          {/* Linked counts */}
          {linkedTasks > 0 && (
            <span className="text-[10px] font-semibold text-zinc-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />{linkedTasks}
            </span>
          )}
          {linkedHabits > 0 && (
            <span className="text-[10px] font-semibold text-zinc-400 flex items-center gap-1">
              <Repeat className="w-3 h-3" />{linkedHabits}
            </span>
          )}
          {/* Momentum */}
          <div className="flex items-center gap-1" title={mm.label}>
            <MomentumIcon className={cn("w-3 h-3", mm.color)} strokeWidth={2} />
          </div>
        </div>
      </div>
    </Card>
  );
}

function GoalCardList({ goal, onOpen, onAction }) {
  const status = computeStatus(goal);
  const sm = statusMeta(status);
  const days = daysUntil(goal.deadline);
  const cat = CATEGORIES.find(c => c.value === goal.category);
  const pct = Math.min(100, Math.max(0, goal.progress ?? 0));
  const linkedTasks = goal.linkedTasks?.length ?? 0;
  const linkedHabits = goal.linkedHabits?.length ?? 0;

  return (
    <motion.div
      {...fade}
      onClick={() => onOpen(goal.id)}
      className={cn(
        "flex items-center gap-4 px-5 py-3.5 border-b border-zinc-100 last:border-b-0",
        "hover:bg-zinc-50/50 cursor-pointer transition-colors",
      )}
    >
      {/* Category icon */}
      <span className="text-sm flex-shrink-0 w-6 text-center">{cat?.icon || "🎯"}</span>

      {/* Title + meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className={cn(
            "text-[13px] font-semibold truncate",
            status === "completed" ? "text-zinc-400 line-through" : "text-zinc-900",
          )}>
            {goal.title}
          </h3>
          <Badge className={cn(sm.bg, sm.text, "flex-shrink-0")}>{sm.label}</Badge>
        </div>
        {goal.nextAction && (
          <p className="text-[11px] text-zinc-400 mt-0.5 truncate">
            Next: {goal.nextAction}
          </p>
        )}
      </div>

      {/* Progress */}
      <div className="w-28 flex-shrink-0 hidden sm:block">
        <ProgressBar value={pct} showLabel />
      </div>

      {/* Deadline */}
      <div className="w-20 flex-shrink-0 text-right hidden md:block">
        <span className={cn(
          "text-[11px] font-medium",
          days !== null && days < 7 && days >= 0 ? "text-amber-600" : days !== null && days < 0 ? "text-red-500" : "text-zinc-400",
        )}>
          {formatDateShort(goal.deadline)}
        </span>
      </div>

      {/* Links */}
      <div className="flex items-center gap-2 flex-shrink-0 hidden lg:flex">
        {linkedTasks > 0 && (
          <span className="text-[10px] font-semibold text-zinc-400 flex items-center gap-0.5">
            <CheckCircle2 className="w-3 h-3" />{linkedTasks}
          </span>
        )}
        {linkedHabits > 0 && (
          <span className="text-[10px] font-semibold text-zinc-400 flex items-center gap-0.5">
            <Repeat className="w-3 h-3" />{linkedHabits}
          </span>
        )}
      </div>

      {/* Actions */}
      <Dropdown
        trigger={
          <IconButton icon={MoreHorizontal} size="w-7 h-7" label="Actions" onClick={(e) => e.stopPropagation()} />
        }
      >
        <DropdownItem icon={Eye} label="Open" onClick={() => onOpen(goal.id)} />
        <DropdownItem icon={Edit3} label="Edit" onClick={() => onAction(goal.id, "edit")} />
        <DropdownItem icon={Milestone} label="Add Milestone" onClick={() => onAction(goal.id, "add-milestone")} />
        <div className="h-px bg-zinc-100 my-1" />
        <DropdownItem icon={Archive} label="Archive" onClick={() => onAction(goal.id, "archive")} />
        <DropdownItem icon={Trash2} label="Delete" danger onClick={() => onAction(goal.id, "delete")} />
      </Dropdown>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   GOAL CREATION MODAL
   ═══════════════════════════════════════════════════════════════════════════ */

const EMPTY_FORM = {
  title: "",
  type: "outcome",
  deadline: "",
  successDefinition: "",
  why: "",
  category: "",
  priority: "medium",
  effort: "moderate",
  milestones: [],
  nextAction: "",
  linkedHabit: "",
  linkedTask: "",
  description: "",
};

function GoalCreationModal({ open, onClose, onSave, editGoal }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [milestoneDraft, setMilestoneDraft] = useState("");
  const [step, setStep] = useState(0); // 0 = essential, 1 = details, 2 = milestones & links

  useEffect(() => {
    if (open) {
      if (editGoal) {
        setForm({
          ...EMPTY_FORM,
          ...editGoal,
          milestones: editGoal.milestones || [],
          linkedHabit: editGoal.linkedHabits?.[0] || "",
          linkedTask: editGoal.linkedTasks?.[0] || "",
        });
      } else {
        setForm(EMPTY_FORM);
      }
      setStep(0);
      setMilestoneDraft("");
    }
  }, [open, editGoal]);

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const addMilestone = () => {
    if (!milestoneDraft.trim()) return;
    update("milestones", [
      ...form.milestones,
      { id: milestoneUid(), title: milestoneDraft.trim(), done: false },
    ]);
    setMilestoneDraft("");
  };

  const removeMilestone = (id) => {
    update("milestones", form.milestones.filter(m => m.id !== id));
  };

  const handleSave = (draft = false) => {
    if (!form.title.trim()) return;
    onSave({
      ...form,
      title: form.title.trim(),
      status: draft ? "draft" : "active",
      progress: 0,
      createdAt: new Date().toISOString(),
      linkedTasks: form.linkedTask ? [form.linkedTask] : [],
      linkedHabits: form.linkedHabit ? [form.linkedHabit] : [],
    });
    onClose();
  };

  const isValid = form.title.trim().length > 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editGoal ? "Edit Goal" : "Create New Goal"}
      subtitle={editGoal ? "Update goal details" : "Define a meaningful goal with clear milestones"}
      wide
    >
      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-6">
        {["Essentials", "Details", "Milestones & Links"].map((s, i) => (
          <button
            key={s}
            onClick={() => setStep(i)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all",
              step === i ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200",
            )}
          >
            <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[9px] font-bold">
              {i + 1}
            </span>
            {s}
          </button>
        ))}
      </div>

      {/* Step 0: Essentials */}
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="step0" {...slideUp} className="flex flex-col gap-4">
            <FormField label="Goal Title" required>
              <TextInput
                value={form.title}
                onChange={(v) => update("title", v)}
                placeholder="What do you want to achieve?"
              />
            </FormField>

            <FormField label="Goal Type">
              <div className="grid grid-cols-2 gap-2">
                {GOAL_TYPES.map(t => (
                  <button
                    key={t.value}
                    onClick={() => update("type", t.value)}
                    className={cn(
                      "flex flex-col items-start px-3.5 py-2.5 rounded-xl border transition-all text-left",
                      form.type === t.value
                        ? "border-zinc-900 bg-zinc-50"
                        : "border-zinc-200 hover:border-zinc-300",
                    )}
                  >
                    <span className="text-[12px] font-semibold text-zinc-800">{t.label}</span>
                    <span className="text-[10px] text-zinc-400">{t.desc}</span>
                  </button>
                ))}
              </div>
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Target Date">
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => update("deadline", e.target.value)}
                  className="w-full bg-transparent text-sm font-medium outline-none border border-zinc-200 rounded-xl px-3.5 py-2.5 text-zinc-800 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-200 transition-all"
                />
              </FormField>
              <FormField label="Category">
                <SelectInput
                  value={form.category}
                  onChange={(v) => update("category", v)}
                  options={CATEGORIES}
                  placeholder="Select category"
                />
              </FormField>
            </div>

            <FormField label="Priority Level">
              <PillToggle
                options={PRIORITY_LEVELS}
                value={form.priority}
                onChange={(v) => update("priority", v || "medium")}
              />
            </FormField>
          </motion.div>
        )}

        {/* Step 1: Details */}
        {step === 1 && (
          <motion.div key="step1" {...slideUp} className="flex flex-col gap-4">
            <FormField label="Why This Matters">
              <TextArea
                value={form.why}
                onChange={(v) => update("why", v)}
                placeholder="What makes this goal meaningful to you?"
                rows={2}
              />
            </FormField>

            <FormField label="Success Definition">
              <TextArea
                value={form.successDefinition}
                onChange={(v) => update("successDefinition", v)}
                placeholder="How will you know you've achieved this goal?"
                rows={2}
              />
            </FormField>

            <FormField label="Description">
              <TextArea
                value={form.description}
                onChange={(v) => update("description", v)}
                placeholder="Additional details, context, or notes..."
                rows={3}
              />
            </FormField>

            <FormField label="Expected Effort">
              <PillToggle
                options={EFFORT_LEVELS.map(e => ({ value: e.value, label: `${e.label} (${e.desc})` }))}
                value={form.effort}
                onChange={(v) => update("effort", v || "moderate")}
              />
            </FormField>

            {/* AI action buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-[11px] font-semibold text-zinc-600 hover:bg-zinc-100 transition-colors">
                <Sparkles className="w-3.5 h-3.5" />
                Use AI to Improve
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-[11px] font-semibold text-zinc-600 hover:bg-zinc-100 transition-colors">
                <Bot className="w-3.5 h-3.5" />
                Generate Success Definition
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Milestones & Links */}
        {step === 2 && (
          <motion.div key="step2" {...slideUp} className="flex flex-col gap-5">
            {/* Milestones */}
            <FormField label="Milestones">
              <div className="flex flex-col gap-2">
                {form.milestones.map((ms, i) => (
                  <div key={ms.id} className="flex items-center gap-2 bg-zinc-50 rounded-lg px-3 py-2">
                    <span className="text-[10px] font-bold text-zinc-400 w-5">{i + 1}.</span>
                    <span className="text-[12px] font-medium text-zinc-700 flex-1">{ms.title}</span>
                    <button
                      onClick={() => removeMilestone(ms.id)}
                      className="text-zinc-300 hover:text-red-500 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <TextInput
                    value={milestoneDraft}
                    onChange={setMilestoneDraft}
                    placeholder="Add a milestone..."
                    className="flex-1"
                    onKeyDown={(e) => e.key === "Enter" && addMilestone()}
                  />
                  <button
                    onClick={addMilestone}
                    className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center hover:bg-zinc-800 transition-colors flex-shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-[11px] font-semibold text-zinc-600 hover:bg-zinc-100 transition-colors self-start">
                  <Sparkles className="w-3.5 h-3.5" />
                  Suggest Milestones
                </button>
              </div>
            </FormField>

            {/* Next action */}
            <FormField label="Next Action">
              <TextInput
                value={form.nextAction}
                onChange={(v) => update("nextAction", v)}
                placeholder="What's the very next step?"
              />
            </FormField>

            {/* Linked Habit */}
            <FormField label="Link a Habit">
              <TextInput
                value={form.linkedHabit}
                onChange={(v) => update("linkedHabit", v)}
                placeholder="Type a habit to link..."
              />
            </FormField>

            {/* Linked Task */}
            <FormField label="Link a Task">
              <TextInput
                value={form.linkedTask}
                onChange={(v) => update("linkedTask", v)}
                placeholder="Type a task to link..."
              />
            </FormField>

            <div className="flex items-center gap-2 pt-1">
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-[11px] font-semibold text-zinc-600 hover:bg-zinc-100 transition-colors">
                <Link2 className="w-3.5 h-3.5" />
                Link Existing Tasks
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-[11px] font-semibold text-zinc-600 hover:bg-zinc-100 transition-colors">
                <Repeat className="w-3.5 h-3.5" />
                Choose Habit
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions bar */}
      <div className="flex items-center justify-between pt-5 mt-4 border-t border-zinc-100">
        <div className="flex items-center gap-2">
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="px-4 py-2.5 rounded-xl text-[12px] font-semibold text-zinc-500 hover:bg-zinc-100 transition-colors"
            >
              Back
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-[12px] font-semibold text-zinc-400 hover:bg-zinc-100 transition-colors"
          >
            Cancel
          </button>
        </div>
        <div className="flex items-center gap-2">
          {step < 2 && (
            <button
              onClick={() => setStep(s => s + 1)}
              className="px-4 py-2.5 rounded-xl text-[12px] font-semibold bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition-colors"
            >
              Next
            </button>
          )}
          <button
            onClick={() => handleSave(true)}
            disabled={!isValid}
            className="px-4 py-2.5 rounded-xl text-[12px] font-semibold text-zinc-500 hover:bg-zinc-100 transition-colors disabled:opacity-40"
          >
            Save Draft
          </button>
          <button
            onClick={() => handleSave(false)}
            disabled={!isValid}
            className={cn(
              "px-5 py-2.5 rounded-xl text-[12px] font-bold transition-all",
              isValid
                ? "bg-zinc-900 text-white hover:bg-zinc-800 active:scale-[0.97]"
                : "bg-zinc-200 text-zinc-400 cursor-not-allowed",
            )}
          >
            {editGoal ? "Update Goal" : "Create Goal"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   GOAL DETAIL DRAWER
   ═══════════════════════════════════════════════════════════════════════════ */

function GoalDetailDrawer({ goal, open, onClose, onAction, onUpdateGoal }) {
  const [noteText, setNoteText] = useState("");
  const [nextActionDraft, setNextActionDraft] = useState("");
  const [progressDelta, setProgressDelta] = useState(10);
  const [showProgressInput, setShowProgressInput] = useState(false);
  const [milestoneDraft, setMilestoneDraft] = useState("");

  useEffect(() => {
    if (open && goal) {
      setNoteText("");
      setNextActionDraft(goal.nextAction || "");
      setShowProgressInput(false);
      setMilestoneDraft("");
    }
  }, [open, goal?.id]);

  if (!goal) return null;

  const status = computeStatus(goal);
  const sm = statusMeta(status);
  const cat = CATEGORIES.find(c => c.value === goal.category);
  const pct = Math.min(100, Math.max(0, goal.progress ?? 0));
  const days = daysUntil(goal.deadline);
  const priorityMeta = PRIORITY_LEVELS.find(p => p.value === goal.priority);
  const effortMeta = EFFORT_LEVELS.find(e => e.value === goal.effort);
  const milestones = goal.milestones || [];
  const completedMs = milestones.filter(m => m.done).length;
  const notes = goal.notes || [];
  const reviews = goal.reviews || [];
  const linkedTasks = goal.linkedTasks || [];
  const linkedHabits = goal.linkedHabits || [];

  const toggleMilestone = (msId) => {
    const updated = milestones.map(m => m.id === msId ? { ...m, done: !m.done } : m);
    onUpdateGoal(goal.id, { milestones: updated });
  };

  const addMilestone = () => {
    if (!milestoneDraft.trim()) return;
    onUpdateGoal(goal.id, {
      milestones: [...milestones, { id: milestoneUid(), title: milestoneDraft.trim(), done: false }],
    });
    setMilestoneDraft("");
  };

  const addNote = () => {
    if (!noteText.trim()) return;
    onUpdateGoal(goal.id, {
      notes: [...notes, { id: uid(), text: noteText.trim(), date: new Date().toISOString() }],
    });
    setNoteText("");
  };

  const updateProgress = () => {
    const newProgress = Math.min(100, Math.max(0, pct + progressDelta));
    onUpdateGoal(goal.id, { progress: newProgress });
    setShowProgressInput(false);
  };

  const setNextAction = () => {
    if (nextActionDraft.trim()) {
      onUpdateGoal(goal.id, { nextAction: nextActionDraft.trim() });
    }
  };

  const Section = ({ title, icon: Icon, children, className }) => (
    <div className={cn("px-6 py-4 border-b border-zinc-100", className)}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.8} />
        <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{title}</span>
      </div>
      {children}
    </div>
  );

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={goal.title}
      subtitle={cat ? `${cat.icon} ${cat.label}` : undefined}
      actions={
        <>
          <Dropdown
            trigger={
              <button className="px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-[11px] font-semibold hover:bg-zinc-800 transition-colors flex items-center gap-1">
                Actions <ChevronDown className="w-3 h-3" />
              </button>
            }
          >
            <DropdownItem icon={Edit3} label="Edit Goal" onClick={() => onAction(goal.id, "edit")} />
            <DropdownItem icon={CheckCircle2} label="Mark Complete" onClick={() => onAction(goal.id, "complete")} />
            <DropdownItem
              icon={goal.status === "paused" ? Play : Pause}
              label={goal.status === "paused" ? "Resume" : "Pause"}
              onClick={() => onAction(goal.id, "toggle-pause")}
            />
            <DropdownItem icon={RefreshCw} label="Review Goal" onClick={() => onAction(goal.id, "review")} />
            <DropdownItem icon={Milestone} label="Add Milestone" onClick={() => { /* scroll to milestones */ }} />
            <DropdownItem icon={Link2} label="Link Habit" onClick={() => onAction(goal.id, "link-habit")} />
            <DropdownItem icon={Link2} label="Link Task" onClick={() => onAction(goal.id, "link-task")} />
            <div className="h-px bg-zinc-100 my-1" />
            <DropdownItem icon={Archive} label="Archive" onClick={() => onAction(goal.id, "archive")} />
            <DropdownItem icon={Trash2} label="Delete" danger onClick={() => onAction(goal.id, "delete")} />
          </Dropdown>
        </>
      }
    >
      {/* Status + Progress hero */}
      <div className="px-6 py-5 border-b border-zinc-100 bg-zinc-50/50">
        <div className="flex items-center gap-2 mb-4">
          <Badge className={cn(sm.bg, sm.text)}>{sm.label}</Badge>
          {priorityMeta && (
            <Badge className={priorityMeta.color}>
              <Flag className="w-2.5 h-2.5" />{priorityMeta.label}
            </Badge>
          )}
          {goal.type && (
            <Badge className="bg-zinc-100 text-zinc-500">
              {GOAL_TYPES.find(t => t.value === goal.type)?.label || goal.type}
            </Badge>
          )}
        </div>

        {/* Progress ring + number */}
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 flex-shrink-0">
            <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
              <circle cx="32" cy="32" r="28" fill="none" stroke="#f4f4f5" strokeWidth="4" />
              <motion.circle
                cx="32" cy="32" r="28" fill="none" stroke="#27272a" strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 28}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 28 * (1 - pct / 100) }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[14px] font-black text-zinc-900 tabular-nums">{Math.round(pct)}%</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-zinc-500">Progress</span>
              {!showProgressInput ? (
                <button
                  onClick={() => setShowProgressInput(true)}
                  className="text-[10px] font-semibold text-zinc-400 hover:text-zinc-700 transition-colors"
                >
                  Update
                </button>
              ) : (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={progressDelta}
                    onChange={(e) => setProgressDelta(Number(e.target.value))}
                    className="w-14 text-[11px] font-semibold text-center border border-zinc-200 rounded-lg px-1 py-0.5 outline-none"
                  />
                  <span className="text-[10px] text-zinc-400">%</span>
                  <button onClick={updateProgress} className="text-zinc-700 hover:text-zinc-900">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setShowProgressInput(false)} className="text-zinc-400 hover:text-zinc-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
            <ProgressBar value={pct} height="h-2" />
            {goal.deadline && (
              <div className="flex items-center gap-1.5 mt-2">
                <Calendar className="w-3 h-3 text-zinc-400" />
                <span className={cn(
                  "text-[11px] font-medium",
                  days !== null && days < 0 ? "text-red-500" : "text-zinc-500",
                )}>
                  Due {formatDate(goal.deadline)}
                  {days !== null && days >= 0 && ` (${days} days left)`}
                  {days !== null && days < 0 && ` (${Math.abs(days)} days overdue)`}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Why it matters */}
      {goal.why && (
        <Section title="Why It Matters" icon={Star}>
          <p className="text-[13px] text-zinc-700 leading-relaxed">{goal.why}</p>
        </Section>
      )}

      {/* Success definition */}
      {goal.successDefinition && (
        <Section title="Success Definition" icon={Target}>
          <p className="text-[13px] text-zinc-700 leading-relaxed">{goal.successDefinition}</p>
        </Section>
      )}

      {/* Description */}
      {goal.description && (
        <Section title="Description" icon={FileText}>
          <p className="text-[13px] text-zinc-600 leading-relaxed">{goal.description}</p>
        </Section>
      )}

      {/* Milestones */}
      <Section title={`Milestones (${completedMs}/${milestones.length})`} icon={Milestone}>
        <div className="flex flex-col gap-1.5">
          {milestones.length === 0 && (
            <p className="text-[12px] text-zinc-300 py-2">No milestones yet</p>
          )}
          {milestones.map((ms, i) => (
            <div
              key={ms.id}
              className="flex items-center gap-2.5 py-2 px-3 rounded-xl hover:bg-zinc-50 transition-colors group"
            >
              <button
                onClick={() => toggleMilestone(ms.id)}
                className={cn(
                  "w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all",
                  ms.done
                    ? "bg-zinc-900 border-zinc-900"
                    : "border-zinc-300 hover:border-zinc-500",
                )}
              >
                {ms.done && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </button>
              <span className={cn(
                "text-[13px] font-medium flex-1",
                ms.done ? "text-zinc-400 line-through" : "text-zinc-700",
              )}>
                {ms.title}
              </span>
            </div>
          ))}

          {/* Add milestone inline */}
          <div className="flex items-center gap-2 mt-1">
            <input
              value={milestoneDraft}
              onChange={(e) => setMilestoneDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addMilestone()}
              placeholder="Add milestone..."
              className="flex-1 text-[12px] border border-zinc-200 rounded-lg px-3 py-2 outline-none placeholder:text-zinc-300 focus:border-zinc-400 transition-colors"
            />
            <button
              onClick={addMilestone}
              className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center hover:bg-zinc-800 transition-colors flex-shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </Section>

      {/* Next Action */}
      <Section title="Next Action" icon={Zap}>
        <div className="flex items-center gap-2">
          <input
            value={nextActionDraft}
            onChange={(e) => setNextActionDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setNextAction()}
            placeholder="What's the very next step?"
            className="flex-1 text-[13px] font-medium border border-zinc-200 rounded-lg px-3 py-2 outline-none placeholder:text-zinc-300 focus:border-zinc-400 transition-colors"
          />
          <button
            onClick={setNextAction}
            className="px-3 py-2 rounded-lg bg-zinc-100 text-zinc-600 text-[11px] font-semibold hover:bg-zinc-200 transition-colors"
          >
            Set
          </button>
        </div>
      </Section>

      {/* Linked Tasks */}
      <Section title={`Linked Tasks (${linkedTasks.length})`} icon={CheckCircle2}>
        {linkedTasks.length === 0 ? (
          <p className="text-[12px] text-zinc-300 py-1">No linked tasks</p>
        ) : (
          <div className="flex flex-col gap-1">
            {linkedTasks.map((t, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-50">
                <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-[12px] font-medium text-zinc-600">{t}</span>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={() => onAction(goal.id, "link-task")}
          className="flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-zinc-400 hover:text-zinc-700 transition-colors"
        >
          <Plus className="w-3 h-3" /> Link Task
        </button>
      </Section>

      {/* Linked Habits */}
      <Section title={`Linked Habits (${linkedHabits.length})`} icon={Repeat}>
        {linkedHabits.length === 0 ? (
          <p className="text-[12px] text-zinc-300 py-1">No linked habits</p>
        ) : (
          <div className="flex flex-col gap-1">
            {linkedHabits.map((h, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-50">
                <Repeat className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-[12px] font-medium text-zinc-600">{h}</span>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={() => onAction(goal.id, "link-habit")}
          className="flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-zinc-400 hover:text-zinc-700 transition-colors"
        >
          <Plus className="w-3 h-3" /> Link Habit
        </button>
      </Section>

      {/* Notes */}
      <Section title={`Notes (${notes.length})`} icon={StickyNote}>
        {notes.length > 0 && (
          <div className="flex flex-col gap-2 mb-3">
            {notes.map(n => (
              <div key={n.id} className="bg-zinc-50 rounded-xl px-3.5 py-2.5">
                <p className="text-[12px] text-zinc-700 leading-relaxed">{n.text}</p>
                <p className="text-[10px] text-zinc-400 mt-1">{formatDate(n.date)}</p>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <input
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addNote()}
            placeholder="Write a note..."
            className="flex-1 text-[12px] border border-zinc-200 rounded-lg px-3 py-2 outline-none placeholder:text-zinc-300 focus:border-zinc-400 transition-colors"
          />
          <button
            onClick={addNote}
            className="px-3 py-2 rounded-lg bg-zinc-100 text-zinc-600 text-[11px] font-semibold hover:bg-zinc-200 transition-colors"
          >
            Add
          </button>
        </div>
      </Section>

      {/* Review History */}
      <Section title="Review History" icon={RefreshCw} className="border-b-0">
        {reviews.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-[12px] text-zinc-300 mb-2">No reviews yet</p>
            <button
              onClick={() => onAction(goal.id, "review")}
              className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-700 transition-colors"
            >
              Start First Review
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {reviews.map((r, i) => (
              <div key={i} className="bg-zinc-50 rounded-xl px-3.5 py-2.5">
                <p className="text-[12px] text-zinc-700">{r.text}</p>
                <p className="text-[10px] text-zinc-400 mt-1">{formatDate(r.date)}</p>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* AI Insight panel */}
      <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100">
        <div className="flex items-center gap-2 mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">AI Insight</span>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-3.5">
          <p className="text-[12px] text-zinc-600 leading-relaxed">
            {pct >= 80
              ? "You're making excellent progress. Stay consistent and you'll reach your goal ahead of schedule. Consider raising your target."
              : pct >= 50
                ? "Solid progress so far. Focus on completing your next milestone to maintain momentum. Consider reviewing your weekly plan."
                : pct >= 20
                  ? "You're building a foundation. Break your next milestone into smaller steps to build momentum. Consistency is key."
                  : "This goal needs attention. Start with just 15 minutes today. Small actions compound into big results."
            }
          </p>
        </div>
      </div>
    </Drawer>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TEMPLATE PICKER MODAL
   ═══════════════════════════════════════════════════════════════════════════ */

function TemplatePickerModal({ open, onClose, onSelect }) {
  return (
    <Modal open={open} onClose={onClose} title="Create From Template" subtitle="Start with a pre-defined goal structure">
      <div className="grid grid-cols-1 gap-2">
        {SAMPLE_TEMPLATES.map((tmpl, i) => {
          const cat = CATEGORIES.find(c => c.value === tmpl.category);
          return (
            <button
              key={i}
              onClick={() => { onSelect(tmpl); onClose(); }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-all text-left"
            >
              <span className="text-lg">{cat?.icon || "🎯"}</span>
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-zinc-800">{tmpl.title}</p>
                <p className="text-[10px] text-zinc-400 mt-0.5">{cat?.label} · {tmpl.type}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-300" />
            </button>
          );
        })}
      </div>
    </Modal>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MONTHLY REVIEW MODAL
   ═══════════════════════════════════════════════════════════════════════════ */

function MonthlyReviewModal({ open, onClose, goals }) {
  const activeGoals = goals.filter(g => g.status !== "archived");
  const completed = activeGoals.filter(g => computeStatus(g) === "completed").length;
  const atRisk = activeGoals.filter(g => computeStatus(g) === "at-risk" || computeStatus(g) === "behind").length;
  const avgProgress = activeGoals.length > 0
    ? Math.round(activeGoals.reduce((s, g) => s + (g.progress ?? 0), 0) / activeGoals.length)
    : 0;

  return (
    <Modal open={open} onClose={onClose} title="Monthly Review" subtitle="Review your goal progress this month">
      <div className="flex flex-col gap-5">
        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-zinc-50 p-3.5 text-center">
            <p className="text-2xl font-black text-zinc-900">{completed}</p>
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Completed</p>
          </div>
          <div className="rounded-xl bg-zinc-50 p-3.5 text-center">
            <p className="text-2xl font-black text-zinc-900">{atRisk}</p>
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">At Risk</p>
          </div>
          <div className="rounded-xl bg-zinc-50 p-3.5 text-center">
            <p className="text-2xl font-black text-zinc-900">{avgProgress}%</p>
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Avg Progress</p>
          </div>
        </div>

        {/* Goal list */}
        <div>
          <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">All Goals</p>
          <div className="flex flex-col gap-1.5">
            {activeGoals.map(g => {
              const st = computeStatus(g);
              const sm2 = statusMeta(st);
              return (
                <div key={g.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-zinc-50">
                  <span className="text-sm">{CATEGORIES.find(c => c.value === g.category)?.icon || "🎯"}</span>
                  <span className="text-[12px] font-semibold text-zinc-700 flex-1 truncate">{g.title}</span>
                  <ProgressBar value={g.progress ?? 0} className="w-20" />
                  <Badge className={cn(sm2.bg, sm2.text)}>{sm2.label}</Badge>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-zinc-900 text-white text-[12px] font-bold hover:bg-zinc-800 transition-colors"
        >
          Close Review
        </button>
      </div>
    </Modal>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN GOALS PAGE
   ═══════════════════════════════════════════════════════════════════════════ */

export default function GoalsPage() {
  const { data, actions: storeActions } = useLifeOSData();

  // ── Goals — synced from backend ──
  const [goals, setGoals] = useState(() => data.goals.map(toUIGoal));

  useEffect(() => {
    setGoals(prev => {
      const prevMap = new Map(prev.map(g => [g.id, g]));
      return data.goals.map(sg => {
        const existing = prevMap.get(sg.id);
        const progress = Math.round((sg.currentValue / Math.max(1, sg.targetValue)) * 100);
        return existing
          ? { ...existing, progress, title: sg.title, deadline: sg.deadline ? new Date(sg.deadline).toISOString().slice(0, 10) : existing.deadline }
          : toUIGoal(sg);
      });
    });
  }, [data.goals]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("deadline-asc");
  const [viewMode, setViewMode] = useState("grid"); // grid | list
  const [filterCategory, setFilterCategory] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  // ── Modals & drawers ──
  const [createOpen, setCreateOpen] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const [detailGoalId, setDetailGoalId] = useState(null);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  // ── Goal CRUD ──
  const addGoal = useCallback((goalData) => {
    const newGoal = {
      id: uid(),
      ...goalData,
      progress: goalData.progress ?? 0,
      milestones: goalData.milestones || [],
      notes: [],
      reviews: [],
      linkedTasks: goalData.linkedTasks || [],
      linkedHabits: goalData.linkedHabits || [],
      createdAt: goalData.createdAt || new Date().toISOString(),
    };
    setGoals(prev => [newGoal, ...prev]);
    storeActions.addGoal({
      title: newGoal.title,
      period: newGoal.type === "outcome" ? "Oylik" : "Haftalik",
      targetValue: 100,
      deadline: newGoal.deadline || "2026-12-31",
    });
  }, [storeActions]);

  const updateGoal = useCallback((id, updates) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  }, []);

  const removeGoal = useCallback((id) => {
    storeActions.removeGoal(id);
    setGoals(prev => prev.filter(g => g.id !== id));
  }, [storeActions]);

  const duplicateGoal = useCallback((id) => {
    setGoals(prev => {
      const original = prev.find(g => g.id === id);
      if (!original) return prev;
      const clone = {
        ...original,
        id: uid(),
        title: `${original.title} (copy)`,
        status: "active",
        progress: 0,
        createdAt: new Date().toISOString(),
        milestones: (original.milestones || []).map(m => ({ ...m, id: milestoneUid(), done: false })),
        notes: [],
        reviews: [],
      };
      return [clone, ...prev];
    });
  }, []);

  // ── Goal actions handler ──
  const handleAction = useCallback((goalId, action) => {
    switch (action) {
      case "delete":
        removeGoal(goalId);
        if (detailGoalId === goalId) setDetailGoalId(null);
        break;
      case "edit":
        setEditGoal(goals.find(g => g.id === goalId) || null);
        setCreateOpen(true);
        break;
      case "duplicate":
        duplicateGoal(goalId);
        break;
      case "toggle-pause":
        updateGoal(goalId, (prev => {
          const g = goals.find(g2 => g2.id === goalId);
          return { status: g?.status === "paused" ? "active" : "paused" };
        })());
        break;
      case "archive":
        updateGoal(goalId, { status: "archived" });
        if (detailGoalId === goalId) setDetailGoalId(null);
        break;
      case "complete":
        updateGoal(goalId, { status: "completed", progress: 100, completedAt: new Date().toISOString() });
        break;
      case "review":
        updateGoal(goalId, {
          reviews: [
            ...(goals.find(g => g.id === goalId)?.reviews || []),
            { text: "Goal reviewed", date: new Date().toISOString() },
          ],
        });
        break;
      case "add-milestone":
        setDetailGoalId(goalId);
        break;
      case "add-note":
        setDetailGoalId(goalId);
        break;
      default:
        break;
    }
  }, [goals, removeGoal, duplicateGoal, updateGoal, detailGoalId]);

  const handleSaveGoal = useCallback((goalData) => {
    if (editGoal) {
      updateGoal(editGoal.id, goalData);
      setEditGoal(null);
    } else {
      addGoal(goalData);
    }
  }, [editGoal, addGoal, updateGoal]);

  const handleTemplateSelect = useCallback((template) => {
    setEditGoal(null);
    setCreateOpen(true);
    // Pre-fill after modal opens
    setTimeout(() => {
      const formEl = document.querySelector('[data-goal-form]');
      // Template will be applied via editGoal
    }, 50);
    // Use editGoal to pass template data
    setEditGoal({
      ...EMPTY_FORM,
      ...template,
      id: null, // signal it's a new goal from template
    });
    setCreateOpen(true);
  }, []);

  // ── Filtering & Sorting ──
  const filteredGoals = useMemo(() => {
    let result = [...goals];

    // Tab filter
    if (activeTab === "active") result = result.filter(g => g.status !== "completed" && g.status !== "archived");
    else if (activeTab === "annual") result = result.filter(g => {
      const dl = daysUntil(g.deadline);
      return dl !== null && dl > 180;
    });
    else if (activeTab === "quarterly") result = result.filter(g => {
      const dl = daysUntil(g.deadline);
      return dl !== null && dl > 30 && dl <= 180;
    });
    else if (activeTab === "monthly") result = result.filter(g => {
      const dl = daysUntil(g.deadline);
      return dl !== null && dl <= 30;
    });
    else if (activeTab === "completed") result = result.filter(g => g.status === "completed" || computeStatus(g) === "completed");
    else if (activeTab === "archived") result = result.filter(g => g.status === "archived");

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(g =>
        g.title.toLowerCase().includes(q) ||
        g.description?.toLowerCase().includes(q) ||
        g.category?.toLowerCase().includes(q)
      );
    }

    // Filters
    if (filterCategory) result = result.filter(g => g.category === filterCategory);
    if (filterPriority) result = result.filter(g => g.priority === filterPriority);
    if (filterStatus) result = result.filter(g => computeStatus(g) === filterStatus);

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "deadline-asc":
          return (new Date(a.deadline || "9999") - new Date(b.deadline || "9999"));
        case "progress-desc":
          return (b.progress ?? 0) - (a.progress ?? 0);
        case "progress-asc":
          return (a.progress ?? 0) - (b.progress ?? 0);
        case "updated-desc":
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case "priority-desc": {
          const order = { critical: 0, high: 1, medium: 2, low: 3 };
          return (order[a.priority] ?? 2) - (order[b.priority] ?? 2);
        }
        default:
          return 0;
      }
    });

    return result;
  }, [goals, activeTab, search, sortBy, filterCategory, filterPriority, filterStatus]);

  const detailGoal = detailGoalId ? goals.find(g => g.id === detailGoalId) : null;
  const activeFilterCount = [filterCategory, filterPriority, filterStatus].filter(Boolean).length;

  return (
    <div className="flex flex-col gap-5 p-4 lg:p-6 max-w-[1200px]">

      {/* ═══════════════════════════════════════════════════════════
         1. HEADER
         ═══════════════════════════════════════════════════════════ */}
      <motion.div {...fade} className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] font-black tracking-[0.3em] uppercase text-zinc-400">Planning</p>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 mt-0.5">Goals</h1>
          <p className="text-[13px] text-zinc-400 mt-0.5">Turn intention into progress</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Secondary actions */}
          <button
            onClick={() => setTemplateOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-zinc-200 text-[11px] font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors"
          >
            <Layers className="w-3.5 h-3.5" />
            From Template
          </button>
          <button
            onClick={() => setReviewOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-zinc-200 text-[11px] font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Review Month
          </button>
          <button className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-zinc-200 text-[11px] font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors">
            <Sparkles className="w-3.5 h-3.5" />
            AI Define Goal
          </button>

          {/* Primary */}
          <button
            onClick={() => { setEditGoal(null); setCreateOpen(true); }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-900 text-white text-[12px] font-bold hover:bg-zinc-800 active:scale-[0.97] transition-all"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Add Goal
          </button>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════
         2. OVERVIEW STATS
         ═══════════════════════════════════════════════════════════ */}
      <OverviewStats goals={goals} />

      {/* ═══════════════════════════════════════════════════════════
         3. FILTER & VIEW CONTROLS
         ═══════════════════════════════════════════════════════════ */}
      <Card className="px-4 py-3">
        {/* Tabs row */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-none">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all",
                activeTab === tab.key
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search + controls row */}
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-zinc-100">
          {/* Search */}
          <div className="flex-1 flex items-center gap-2 bg-zinc-50 rounded-xl px-3 py-2 max-w-[320px]">
            <Search className="w-4 h-4 text-zinc-400 flex-shrink-0" strokeWidth={1.8} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search goals..."
              className="flex-1 bg-transparent text-[12px] font-medium outline-none text-zinc-800 placeholder:text-zinc-400"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex-1" />

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(f => !f)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all",
              showFilters || activeFilterCount > 0
                ? "bg-zinc-900 text-white"
                : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200",
            )}
          >
            <Filter className="w-3.5 h-3.5" />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[9px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Sort */}
          <Dropdown
            trigger={
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-100 text-zinc-500 text-[11px] font-semibold hover:bg-zinc-200 transition-all">
                <ArrowUpDown className="w-3.5 h-3.5" />
                Sort
              </button>
            }
          >
            {SORT_OPTIONS.map(opt => (
              <DropdownItem
                key={opt.value}
                icon={sortBy === opt.value ? Check : undefined}
                label={opt.label}
                onClick={() => setSortBy(opt.value)}
              />
            ))}
          </Dropdown>

          {/* View toggles */}
          <div className="flex items-center gap-0.5 bg-zinc-100 rounded-xl p-0.5">
            <IconButton
              icon={LayoutGrid}
              size="w-8 h-8"
              active={viewMode === "grid"}
              onClick={() => setViewMode("grid")}
              label="Grid view"
            />
            <IconButton
              icon={List}
              size="w-8 h-8"
              active={viewMode === "list"}
              onClick={() => setViewMode("list")}
              label="List view"
            />
          </div>
        </div>

        {/* Filter dropdowns */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-3 pt-3 mt-2 border-t border-zinc-100 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase">Category:</span>
                  <SelectInput
                    value={filterCategory}
                    onChange={setFilterCategory}
                    options={CATEGORIES}
                    placeholder="All"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase">Priority:</span>
                  <SelectInput
                    value={filterPriority}
                    onChange={setFilterPriority}
                    options={PRIORITY_LEVELS}
                    placeholder="All"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase">Status:</span>
                  <SelectInput
                    value={filterStatus}
                    onChange={setFilterStatus}
                    options={STATUS_OPTIONS}
                    placeholder="All"
                  />
                </div>
                {activeFilterCount > 0 && (
                  <button
                    onClick={() => { setFilterCategory(""); setFilterPriority(""); setFilterStatus(""); }}
                    className="text-[10px] font-semibold text-zinc-400 hover:text-zinc-700 transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* ═══════════════════════════════════════════════════════════
         4. GOALS GRID / LIST
         ═══════════════════════════════════════════════════════════ */}
      {filteredGoals.length === 0 ? (
        <EmptyState
          icon={Target}
          title={goals.length === 0 ? "No goals yet" : "No goals match your filters"}
          desc={goals.length === 0
            ? "Create your first goal to start turning intention into daily action."
            : "Try adjusting your filters or search to find what you're looking for."
          }
          action={goals.length === 0 && (
            <button
              onClick={() => { setEditGoal(null); setCreateOpen(true); }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-900 text-white text-[12px] font-bold hover:bg-zinc-800 transition-all"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              Create First Goal
            </button>
          )}
        />
      ) : viewMode === "grid" ? (
        <motion.div
          {...stagger}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
        >
          {filteredGoals.map(goal => (
            <GoalCardGrid
              key={goal.id}
              goal={goal}
              onOpen={setDetailGoalId}
              onAction={handleAction}
            />
          ))}
        </motion.div>
      ) : (
        <Card className="overflow-hidden">
          {/* List header */}
          <div className="flex items-center gap-4 px-5 py-2.5 border-b border-zinc-100 bg-zinc-50/50">
            <span className="w-6" />
            <span className="flex-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Goal</span>
            <span className="w-28 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider hidden sm:block">Progress</span>
            <span className="w-20 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider text-right hidden md:block">Deadline</span>
            <span className="w-16 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider hidden lg:block">Links</span>
            <span className="w-7" />
          </div>
          {filteredGoals.map(goal => (
            <GoalCardList
              key={goal.id}
              goal={goal}
              onOpen={setDetailGoalId}
              onAction={handleAction}
            />
          ))}
        </Card>
      )}

      {/* ═══════════════════════════════════════════════════════════
         MODALS & DRAWERS
         ═══════════════════════════════════════════════════════════ */}

      {/* Goal creation / edit modal */}
      <GoalCreationModal
        open={createOpen}
        onClose={() => { setCreateOpen(false); setEditGoal(null); }}
        onSave={handleSaveGoal}
        editGoal={editGoal}
      />

      {/* Goal detail drawer */}
      <GoalDetailDrawer
        goal={detailGoal}
        open={!!detailGoalId}
        onClose={() => setDetailGoalId(null)}
        onAction={handleAction}
        onUpdateGoal={updateGoal}
      />

      {/* Template picker */}
      <TemplatePickerModal
        open={templateOpen}
        onClose={() => setTemplateOpen(false)}
        onSelect={handleTemplateSelect}
      />

      {/* Monthly review */}
      <MonthlyReviewModal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        goals={goals}
      />
    </div>
  );
}
