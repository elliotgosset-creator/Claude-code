interface Props {
  consumed: number
  burned: number
  goal: number
}

export default function CalorieDonut({ consumed, burned, goal }: Props) {
  const remaining = Math.max(0, goal - consumed + burned)
  const netConsumed = Math.max(0, consumed - burned)
  const pct = Math.min(100, goal > 0 ? (netConsumed / goal) * 100 : 0)

  const r = 54
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  const isOver = netConsumed > goal

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-40">
        <svg viewBox="0 0 130 130" className="w-full h-full -rotate-90">
          <circle cx="65" cy="65" r={r} fill="none"
            className="text-gray-100 dark:text-gray-800" stroke="currentColor" strokeWidth="14" />
          <circle cx="65" cy="65" r={r} fill="none"
            stroke={isOver ? '#ef4444' : '#22c55e'}
            strokeWidth="14"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {remaining.toLocaleString('fr-FR')}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {isOver ? 'dépassement' : 'restantes'}
          </span>
          <span className="text-xs font-medium text-gray-400 dark:text-gray-500">kcal</span>
        </div>
      </div>

      <div className="flex gap-6 mt-2 text-sm">
        <div className="text-center">
          <p className="font-semibold text-gray-900 dark:text-white">{goal.toLocaleString('fr-FR')}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Objectif</p>
        </div>
        <div className="text-center">
          <p className="font-semibold text-orange-500">{consumed.toLocaleString('fr-FR')}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Mangé</p>
        </div>
        <div className="text-center">
          <p className="font-semibold text-blue-500">{burned.toLocaleString('fr-FR')}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Brûlé</p>
        </div>
      </div>
    </div>
  )
}
