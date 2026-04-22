import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Flame, Droplets, Moon, Trophy, TrendingDown, TrendingUp, Minus, Scale, Zap } from 'lucide-react'
import type { DayLog, UserProfile, StreakData } from '../types'
import CalorieDonut from '../components/CalorieDonut'
import MacroRing from '../components/MacroRing'
import ProgressBar from '../components/ProgressBar'
import { calculateBMI, getBMICategory } from '../utils/calculations'

interface Props {
  today: string
  dayLog: DayLog
  profile: UserProfile
  streak: StreakData
  weightHistory: { date: string; weight: number }[]
  onWaterAdd: (ml: number) => void
  onSleepSet: (h: number) => void
  onMoodSet: (m: 1 | 2 | 3 | 4 | 5) => void
}

const moodEmojis: Record<number, string> = { 1: '😞', 2: '😕', 3: '😐', 4: '🙂', 5: '😄' }

export default function Dashboard({
  today, dayLog, profile, streak, weightHistory, onWaterAdd, onSleepSet, onMoodSet
}: Props) {
  const totalCaloriesIn = dayLog.meals.reduce((s, m) => s + m.calories, 0)
  const totalCaloriesBurned = dayLog.workouts.reduce((s, w) => s + w.totalCaloriesBurned, 0)
  const totalProtein = dayLog.meals.reduce((s, m) => s + m.protein, 0)
  const totalCarbs = dayLog.meals.reduce((s, m) => s + m.carbs, 0)
  const totalFat = dayLog.meals.reduce((s, m) => s + m.fat, 0)

  const latestWeight = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].weight : profile.startWeight
  const prevWeight = weightHistory.length > 1 ? weightHistory[weightHistory.length - 2].weight : null
  const weightDiff = prevWeight ? latestWeight - prevWeight : null

  const bmi = calculateBMI(latestWeight, profile.height)
  const bmiInfo = getBMICategory(bmi)

  const waterGlasses = Math.floor(dayLog.water / 250)
  const totalGlasses = Math.ceil(profile.waterGoal / 250)

  const dateLabel = format(new Date(today + 'T12:00:00'), 'EEEE d MMMM', { locale: fr })

  return (
    <div className="space-y-4 pb-20">
      {/* Date header */}
      <div className="px-4 pt-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">{dateLabel}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {profile.name ? `Bonjour ${profile.name} !` : 'Bonjour !'}
        </p>
      </div>

      {/* Streak banner */}
      {streak.currentStreak > 0 && (
        <div className="mx-4 bg-gradient-to-r from-orange-400 to-orange-500 rounded-2xl p-4 flex items-center gap-3">
          <Flame className="text-white" size={28} />
          <div>
            <p className="text-white font-bold text-lg">{streak.currentStreak} jour{streak.currentStreak > 1 ? 's' : ''} de suite !</p>
            <p className="text-orange-100 text-sm">Record : {streak.longestStreak} jours</p>
          </div>
          <div className="ml-auto">
            <Trophy className="text-orange-200" size={24} />
          </div>
        </div>
      )}

      {/* Calorie donut */}
      <div className="mx-4 bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 text-center">Calories du jour</h2>
        <div className="flex justify-center">
          <CalorieDonut
            consumed={totalCaloriesIn}
            burned={totalCaloriesBurned}
            goal={profile.calorieGoal}
          />
        </div>
      </div>

      {/* Macros */}
      <div className="mx-4 bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Macronutriments</h2>
        <div className="flex justify-around">
          <MacroRing label="Protéines" value={totalProtein} goal={profile.proteinGoal} color="blue" />
          <MacroRing label="Glucides" value={totalCarbs} goal={profile.carbGoal} color="yellow" />
          <MacroRing label="Lipides" value={totalFat} goal={profile.fatGoal} color="red" />
        </div>
      </div>

      {/* Water tracker */}
      <div className="mx-4 bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Droplets className="text-blue-500" size={20} />
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Hydratation</h2>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {dayLog.water}ml / {profile.waterGoal}ml
          </span>
        </div>
        <ProgressBar value={dayLog.water} max={profile.waterGoal} color="bg-blue-500" showValue={false} />
        <div className="flex gap-2 mt-3 flex-wrap">
          {Array.from({ length: totalGlasses }).map((_, i) => (
            <button
              key={i}
              onClick={() => onWaterAdd(i < waterGlasses ? 0 : 250)}
              className={`text-xl transition-all duration-200 hover:scale-110 ${
                i < waterGlasses ? 'opacity-100' : 'opacity-25'
              }`}
            >
              💧
            </button>
          ))}
        </div>
        <div className="flex gap-2 mt-3">
          {[150, 250, 330, 500].map(ml => (
            <button
              key={ml}
              onClick={() => onWaterAdd(ml)}
              className="flex-1 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
            >
              +{ml}ml
            </button>
          ))}
        </div>
      </div>

      {/* Sleep & Mood */}
      <div className="mx-4 grid grid-cols-2 gap-3">
        {/* Sleep */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Moon className="text-indigo-500" size={18} />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Sommeil</h3>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {dayLog.sleep ?? 0}h
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">Objectif : {profile.sleepGoal}h</p>
          <div className="flex gap-1 flex-wrap">
            {[5, 6, 7, 8, 9, 10].map(h => (
              <button
                key={h}
                onClick={() => onSleepSet(h)}
                className={`px-2 py-0.5 text-xs rounded-lg transition-colors ${
                  dayLog.sleep === h
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                }`}
              >
                {h}h
              </button>
            ))}
          </div>
        </div>

        {/* Mood */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Humeur</h3>
          <div className="text-3xl mb-2">
            {dayLog.mood ? moodEmojis[dayLog.mood] : '😐'}
          </div>
          <div className="flex gap-1">
            {([1, 2, 3, 4, 5] as const).map(m => (
              <button
                key={m}
                onClick={() => onMoodSet(m)}
                className={`text-lg transition-all hover:scale-125 ${
                  dayLog.mood === m ? 'scale-125' : 'opacity-50'
                }`}
              >
                {moodEmojis[m]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Weight & BMI */}
      <div className="mx-4 bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Scale className="text-primary-500" size={20} />
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Poids & IMC</h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{latestWeight} kg</p>
            {weightDiff !== null && (
              <div className={`flex items-center gap-1 text-sm ${
                weightDiff < 0 ? 'text-green-500' : weightDiff > 0 ? 'text-red-500' : 'text-gray-500'
              }`}>
                {weightDiff < 0 ? <TrendingDown size={14} /> : weightDiff > 0 ? <TrendingUp size={14} /> : <Minus size={14} />}
                <span>{weightDiff > 0 ? '+' : ''}{weightDiff.toFixed(1)} kg</span>
              </div>
            )}
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{bmi.toFixed(1)}</p>
            <p className={`text-sm font-medium ${bmiInfo.color}`}>{bmiInfo.label}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">IMC</p>
          </div>
        </div>
        <div className="mt-3">
          <ProgressBar
            value={latestWeight - profile.goalWeight}
            max={profile.startWeight - profile.goalWeight}
            color="bg-primary-500"
            label={`Objectif : ${profile.goalWeight} kg`}
          />
        </div>
      </div>

      {/* Workouts today */}
      {dayLog.workouts.length > 0 && (
        <div className="mx-4 bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="text-yellow-500" size={20} />
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Sport aujourd'hui</h2>
          </div>
          <div className="space-y-2">
            {dayLog.workouts.map(w => (
              <div key={w.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300 font-medium">{w.exerciseName}</span>
                <div className="flex gap-3 text-gray-500 dark:text-gray-400">
                  <span>{w.duration} min</span>
                  <span className="text-orange-500 font-medium">-{w.totalCaloriesBurned} kcal</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Total brûlé</span>
            <span className="font-bold text-orange-500">{totalCaloriesBurned} kcal</span>
          </div>
        </div>
      )}
    </div>
  )
}
