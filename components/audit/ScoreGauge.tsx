'use client'

interface Props { score: number }

export default function ScoreGauge({ score }: Props) {
  const pct = Math.min(Math.max(score, 0), 100)
  const angle = -130 + (pct / 100) * 260
  const color = pct >= 75 ? '#16a34a' : pct >= 50 ? '#d97706' : '#dc2626'

  return (
    <div className="relative w-40 h-24 flex-shrink-0">
      <svg viewBox="0 0 160 96" className="w-full h-full">
        {/* Track */}
        <path d="M 20 80 A 60 60 0 0 1 140 80" fill="none" stroke="#e5e7eb" strokeWidth="12" strokeLinecap="round" />
        {/* Fill */}
        <path
          d="M 20 80 A 60 60 0 0 1 140 80"
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * 188} 188`}
        />
        {/* Needle */}
        <line
          x1="80" y1="80"
          x2={80 + 48 * Math.cos((angle * Math.PI) / 180)}
          y2={80 + 48 * Math.sin((angle * Math.PI) / 180)}
          stroke={color} strokeWidth="3" strokeLinecap="round"
        />
        <circle cx="80" cy="80" r="4" fill={color} />
      </svg>
    </div>
  )
}
