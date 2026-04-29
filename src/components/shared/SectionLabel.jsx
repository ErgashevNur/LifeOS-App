import { useNavigate } from "react-router-dom";

export default function SectionLabel({ label, badge, linkTo }) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          {label}
        </h3>
        {badge && (
          <span className="text-[10px] font-medium text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-100">
            {badge}
          </span>
        )}
      </div>
      {linkTo && (
        <button
          type="button"
          onClick={() => navigate(linkTo)}
          className="text-[11px] text-violet-500 font-medium"
        >
          Hammasi →
        </button>
      )}
    </div>
  );
}
