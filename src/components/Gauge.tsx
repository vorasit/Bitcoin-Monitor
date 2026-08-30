"use client";

interface GaugeProps {
  value: number; // 0-100
  label: string;
  sublabel: string;
  size?: number;
}

function colorForValue(value: number): string {
  if (value <= 20) return "#dc2626"; // extreme fear - red
  if (value <= 40) return "#f97316"; // fear - orange
  if (value <= 60) return "#eab308"; // neutral - yellow
  if (value <= 80) return "#84cc16"; // greed - lime
  return "#22c55e"; // extreme greed - green
}

export default function Gauge({ value, label, sublabel, size = 140 }: GaugeProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const angle = -90 + (clamped / 100) * 180;
  const radius = size / 2 - 10;
  const cx = size / 2;
  const cy = size / 2;
  const needleColor = colorForValue(clamped);

  const arcPath = (startAngle: number, endAngle: number) => {
    const toRad = (a: number) => (a * Math.PI) / 180;
    const x1 = cx + radius * Math.cos(toRad(startAngle));
    const y1 = cy + radius * Math.sin(toRad(startAngle));
    const x2 = cx + radius * Math.cos(toRad(endAngle));
    const y2 = cy + radius * Math.sin(toRad(endAngle));
    return `M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2}`;
  };

  const segments = [
    { from: -90, to: -54, color: "#dc2626" },
    { from: -54, to: -18, color: "#f97316" },
    { from: -18, to: 18, color: "#eab308" },
    { from: 18, to: 54, color: "#84cc16" },
    { from: 54, to: 90, color: "#22c55e" },
  ];

  const needleRad = ((angle - 90) * Math.PI) / 180;
  const needleLen = radius - 8;
  const nx = cx + needleLen * Math.cos(needleRad);
  const ny = cy + needleLen * Math.sin(needleRad);

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size / 1.7} viewBox={`0 0 ${size} ${size / 1.7}`}>
        {segments.map((s) => (
          <path
            key={s.color}
            d={arcPath(s.from, s.to)}
            stroke={s.color}
            strokeWidth={10}
            fill="none"
            strokeLinecap="round"
          />
        ))}
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={needleColor} strokeWidth={3} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={4} fill={needleColor} />
        <text x={cx} y={cy - 6} textAnchor="middle" className="fill-zinc-100" fontSize={22} fontWeight={700}>
          {Math.round(clamped)}
        </text>
      </svg>
      <div className="text-sm font-medium text-zinc-200">{label}</div>
      <div className="text-xs text-zinc-500">{sublabel}</div>
    </div>
  );
}
