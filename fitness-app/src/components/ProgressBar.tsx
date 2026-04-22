interface Props {
  value: number
  max: number
  color?: string
  label?: string
  showValue?: boolean
}

export default function ProgressBar({ value, max, color = 'bg-primary-500', label, showValue = true }: Props) {
  const pct = Math.min(100, max > 0 ? (value / max) * 100 : 0)
  const isOver = value > max

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
          {label && <span>{label}</span>}
          {showValue && (
            <span className={isOver ? 'text-red-500 font-medium' : ''}>
              {Math.round(value)} / {Math.round(max)}
            </span>
          )}
        </div>
      )}
      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 progress-bar ${isOver ? 'bg-red-500' : color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
