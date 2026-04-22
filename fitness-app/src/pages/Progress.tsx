import { useState } from 'react'
import { format, subDays } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend, AreaChart, Area
} from 'recharts'
import { Scale, Flame, Dumbbell, TrendingDown, TrendingUp, Award } from 'lucide-react'
import type { AppState, WeightEntry } from '../types'

interface Props {
  state: AppState
  today: string
  onLogWeight: (entry: WeightEntry) => void
}

type Period = '7d' | '30d' | '90d'

const PERIOD_DAYS: Record<Period, number> = { '7d': 7, '30d': 30, '90d': 90 }

function WeightLogModal({ onClose, onSave, today }: { onClose: () => void; onSave: (w: number) => void; today: string }) {
  const [val, setVal] = useState('')
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Peser le poids du jour</h3>
        <input
          type="number"
          value={val}
          onChange={e => setVal(e.target.value)}
          placeholder="Ex: 74.5"
          step="0.1"
          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-lg text-center focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
          autoFocus
        />
        <p className="text-sm text-gray-400 text-center mb-4">kg — {format(new Date(today + 'T12:00:00'), 'dd MMMM yyyy', { locale: fr })}</p>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-300">
            Annuler
          </button>
          <button
            onClick={() => { if (val) { onSave(parseFloat(val)); onClose() } }}
            disabled={!val}
            className="flex-1 py-2.5 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 disabled:opacity-50"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Progress({ state, today, onLogWeight }: Props) {
  const [period, setPeriod] = useState<Period>('30d')
  const [showWeightModal, setShowWeightModal] = useState(false)
  const [activeChart, setActiveChart] = useState<'weight' | 'calories' | 'workouts'>('weight')

  const days = PERIOD_DAYS[period]
  const dateRange = Array.from({ length: days }, (_, i) =>
    format(subDays(new Date(today + 'T12:00:00'), days - 1 - i), 'yyyy-MM-dd')
  )

  // Weight data
  const weightMap = Object.fromEntries(state.weightHistory.map(w => [w.date, w.weight]))
  const weightData = dateRange
    .filter(d => weightMap[d])
    .map(d => ({
      date: format(new Date(d + 'T12:00:00'), 'd MMM', { locale: fr }),
      poids: weightMap[d],
    }))

  // Calorie data
  const calorieData = dateRange.map(d => {
    const log = state.dayLogs[d]
    return {
      date: format(new Date(d + 'T12:00:00'), 'd MMM', { locale: fr }),
      mangé: log ? Math.round(log.meals.reduce((s, m) => s + m.calories, 0)) : 0,
      brûlé: log ? Math.round(log.workouts.reduce((s, w) => s + w.totalCaloriesBurned, 0)) : 0,
      objectif: state.profile.calorieGoal,
    }
  }).filter(d => d.mangé > 0 || d.brûlé > 0)

  // Workout frequency
  const workoutData = dateRange.map(d => {
    const log = state.dayLogs[d]
    return {
      date: format(new Date(d + 'T12:00:00'), 'd MMM', { locale: fr }),
      séances: log ? log.workouts.length : 0,
      durée: log ? log.workouts.reduce((s, w) => s + w.duration, 0) : 0,
    }
  }).filter(d => d.séances > 0)

  // Stats
  const latestWeight = state.weightHistory.length > 0 ? state.weightHistory[state.weightHistory.length - 1].weight : null
  const firstWeight = state.weightHistory.length > 1 ? state.weightHistory[0].weight : null
  const totalWeightChange = latestWeight && firstWeight ? latestWeight - firstWeight : null
  const totalWorkouts = Object.values(state.dayLogs).reduce((s, d) => s + d.workouts.length, 0)
  const totalCalsBurned = Object.values(state.dayLogs).reduce((s, d) => s + d.workouts.reduce((ss, w) => ss + w.totalCaloriesBurned, 0), 0)
  const avgCaloriesIn = (() => {
    const daysWithMeals = Object.values(state.dayLogs).filter(d => d.meals.length > 0)
    if (daysWithMeals.length === 0) return 0
    return Math.round(daysWithMeals.reduce((s, d) => s + d.meals.reduce((ss, m) => ss + m.calories, 0), 0) / daysWithMeals.length)
  })()

  return (
    <div className="space-y-4 pb-20">
      <div className="px-4 pt-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Progrès</h1>
        <button
          onClick={() => setShowWeightModal(true)}
          className="flex items-center gap-2 px-3 py-2 bg-primary-500 text-white text-sm font-medium rounded-xl hover:bg-primary-600"
        >
          <Scale size={15} /> Peser
        </button>
      </div>

      {/* Stats cards */}
      <div className="mx-4 grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Scale className="text-primary-500" size={18} />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Variation poids</span>
          </div>
          {totalWeightChange !== null ? (
            <div className={`flex items-center gap-1 ${totalWeightChange < 0 ? 'text-green-500' : totalWeightChange > 0 ? 'text-red-500' : 'text-gray-500'}`}>
              {totalWeightChange < 0 ? <TrendingDown size={18} /> : totalWeightChange > 0 ? <TrendingUp size={18} /> : null}
              <span className="text-2xl font-bold">{totalWeightChange > 0 ? '+' : ''}{totalWeightChange.toFixed(1)} kg</span>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Pas encore de données</p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Dumbbell className="text-purple-500" size={18} />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Séances</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalWorkouts}</p>
          <p className="text-xs text-gray-400">séances au total</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="text-orange-500" size={18} />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Calories brûlées</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCalsBurned.toLocaleString('fr-FR')}</p>
          <p className="text-xs text-gray-400">kcal au total</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Award className="text-yellow-500" size={18} />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Moy. calories</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{avgCaloriesIn.toLocaleString('fr-FR')}</p>
          <p className="text-xs text-gray-400">kcal/jour</p>
        </div>
      </div>

      {/* Chart tabs */}
      <div className="mx-4 flex gap-2">
        {([['weight', 'Poids', Scale], ['calories', 'Calories', Flame], ['workouts', 'Sport', Dumbbell]] as const).map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setActiveChart(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeChart === id
                ? 'bg-primary-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Period selector */}
      <div className="mx-4 flex gap-2">
        {(['7d', '30d', '90d'] as Period[]).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              period === p
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400'
            }`}
          >
            {p === '7d' ? '7 jours' : p === '30d' ? '30 jours' : '3 mois'}
          </button>
        ))}
      </div>

      {/* Charts */}
      <div className="mx-4 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
        {activeChart === 'weight' && (
          <>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Évolution du poids (kg)</h3>
            {weightData.length < 2 ? (
              <div className="h-48 flex flex-col items-center justify-center gap-2 text-gray-400">
                <Scale size={32} className="text-gray-300 dark:text-gray-600" />
                <p className="text-sm">Enregistre ton poids régulièrement</p>
                <button onClick={() => setShowWeightModal(true)} className="text-primary-500 text-sm font-medium">
                  Peser maintenant
                </button>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={weightData}>
                  <defs>
                    <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: unknown) => [`${v} kg`, 'Poids']} />
                  <Area type="monotone" dataKey="poids" stroke="#22c55e" fill="url(#weightGrad)" strokeWidth={2} dot={{ fill: '#22c55e', r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </>
        )}

        {activeChart === 'calories' && (
          <>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Calories (kcal)</h3>
            {calorieData.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center gap-2 text-gray-400">
                <Flame size={32} className="text-gray-300 dark:text-gray-600" />
                <p className="text-sm">Aucune donnée pour la période</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={calorieData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="mangé" fill="#f97316" name="Mangé" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="brûlé" fill="#3b82f6" name="Brûlé" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </>
        )}

        {activeChart === 'workouts' && (
          <>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Durée sport (minutes)</h3>
            {workoutData.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center gap-2 text-gray-400">
                <Dumbbell size={32} className="text-gray-300 dark:text-gray-600" />
                <p className="text-sm">Aucune séance enregistrée</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={workoutData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="durée" fill="#a855f7" name="Durée (min)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </>
        )}
      </div>

      {/* Streak history */}
      <div className="mx-4 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Activité ({days} derniers jours)</h3>
        <div className="flex flex-wrap gap-1">
          {dateRange.map(d => {
            const log = state.dayLogs[d]
            const hasMeals = log && log.meals.length > 0
            const hasWorkout = log && log.workouts.length > 0
            return (
              <div
                key={d}
                title={format(new Date(d + 'T12:00:00'), 'dd MMM', { locale: fr })}
                className={`w-4 h-4 rounded-sm transition-colors ${
                  hasMeals && hasWorkout
                    ? 'bg-primary-500'
                    : hasMeals || hasWorkout
                    ? 'bg-primary-200 dark:bg-primary-800'
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
              />
            )
          })}
        </div>
        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-700" />
            <span>Aucun</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-primary-200" />
            <span>Partiel</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-primary-500" />
            <span>Complet</span>
          </div>
        </div>
      </div>

      {showWeightModal && (
        <WeightLogModal
          onClose={() => setShowWeightModal(false)}
          onSave={w => onLogWeight({ date: today, weight: w, timestamp: Date.now() })}
          today={today}
        />
      )}
    </div>
  )
}
