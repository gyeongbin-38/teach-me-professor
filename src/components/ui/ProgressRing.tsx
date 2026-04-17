interface Props {
  pct: number;
  size?: number;
  stroke?: number;
  color?: string;
  label?: string;
}

export default function ProgressRing({ pct, size = 64, stroke = 5, color = '#4f46e5', label }: Props) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * Math.min(pct, 100) / 100;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circ}
          strokeDashoffset={circ - dash}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      {label && (
        <span className="absolute text-xs font-black text-slate-700">{label}</span>
      )}
    </div>
  );
}
