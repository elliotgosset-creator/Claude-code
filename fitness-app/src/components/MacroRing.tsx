interface Props {
  label: string
  value: number
  goal: number
  color: string
  unit?: string
}

export default function MacroRing({ label, value, goal, color, unit = 'g' }: Props) {
  const pct = Math.min(100, goal > 0 ? (value / goal) * 100 : 0)
  const r = 28
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ

  const colorMap: Record<string, string> = {
    blue: '#3b82f6',
    red: '#ef4444',
    yellow: '#f59e0b',
    green: '#22c55e',
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-16 h-16">
        <svg viewBox="0 0 70 70" className="w-full h-full -rotate-90">
          <circle cx="35" cy="35" r={r} fill="none" stroke="currentColor"
            className="text-gray-100 dark:text-gray-800" strokeWidth="7" />
          <circle cx="35" cy="35" r={r} fill="none"
            stroke={colorMap[color] || colorMap.green}
            strokeWidth="7"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
            {Math.round(pct)}%
          </span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
          {Math.round(value)}{unit}
        </p>
        <p className="text-[10px] text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-[10px] text-gray-400 dark:text-gray-500">/{goal}{unit}</p>
      </div>
    </div>
  )
}
