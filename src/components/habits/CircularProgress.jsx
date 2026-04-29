export default function CircularProgress({ value, label, color = "#7C3AED", size = 180 }) {
  const r = size / 2 - 12;
  const circumference = 2 * Math.PI * r;
  const dash = circumference * Math.min(value, 1);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="8"
        />
        {/* Progress */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circumference}`}
          strokeDashoffset={circumference * 0.25}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.5s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[32px] font-bold text-zinc-900 tabular-nums">{label}</span>
      </div>
    </div>
  );
}
