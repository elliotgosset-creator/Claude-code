import { useState } from 'react'
import type { UserProfile } from '../types'
import { calculateCalorieGoal, getMacrosFromCalories, getWaterFromWeight } from '../utils/calculations'

interface Props {
  onComplete: (profile: UserProfile) => void
}

const steps = [
  { id: 'welcome', title: '' },
  { id: 'identity', title: 'Parle-nous de toi' },
  { id: 'goals', title: 'Ton objectif' },
  { id: 'activity', title: 'Ton activité' },
]

export default function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    name: '',
    age: 25,
    gender: 'male' as 'male' | 'female' | 'other',
    height: 175,
    startWeight: 75,
    goalWeight: 70,
    goal: 'lose' as 'lose' | 'maintain' | 'gain',
    activityLevel: 'moderate' as UserProfile['activityLevel'],
  })

  const set = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }))

  const handleComplete = () => {
    const calGoal = calculateCalorieGoal({ ...form } as UserProfile)
    const macros = getMacrosFromCalories(calGoal)
    const profile: UserProfile = {
      ...form,
      calorieGoal: calGoal,
      proteinGoal: macros.protein,
      carbGoal: macros.carbs,
      fatGoal: macros.fat,
      waterGoal: getWaterFromWeight(form.startWeight),
      sleepGoal: 8,
    }
    onComplete(profile)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white dark:from-gray-900 dark:to-gray-800 flex flex-col">
      {step > 0 && (
        <div className="px-6 pt-12">
          <div className="flex gap-1 mb-6">
            {steps.slice(1).map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  i < step ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col justify-center px-6 pb-12">
        {/* Welcome */}
        {step === 0 && (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-primary-500 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
              <span className="text-5xl">💪</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Bienvenue sur FitLife</h1>
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                Ton compagnon nutrition et fitness, 100% gratuit, sans pub.
              </p>
            </div>
            <div className="space-y-3 text-left">
              {[
                { icon: '🍽️', text: 'Journal alimentaire complet' },
                { icon: '🏋️', text: 'Suivi d\'entraînement détaillé' },
                { icon: '📊', text: 'Graphiques de progression' },
                { icon: '💧', text: 'Hydratation & sommeil' },
                { icon: '🔥', text: 'Streaks et motivation' },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                  <span className="text-xl">{icon}</span>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{text}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setStep(1)}
              className="w-full py-4 bg-primary-500 text-white font-bold text-lg rounded-2xl hover:bg-primary-600 transition-colors shadow-lg"
            >
              Commencer
            </button>
          </div>
        )}

        {/* Identity */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{steps[1].title}</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Prénom</label>
              <input
                type="text"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="Ton prénom"
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Âge</label>
                <input type="number" value={form.age} onChange={e => set('age', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Genre</label>
                <select value={form.gender} onChange={e => set('gender', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="male">Homme</option>
                  <option value="female">Femme</option>
                  <option value="other">Autre</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Taille (cm)</label>
              <input type="number" value={form.height} onChange={e => set('height', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Poids actuel (kg)</label>
                <input type="number" value={form.startWeight} onChange={e => set('startWeight', parseFloat(e.target.value) || 0)} step="0.1"
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Poids cible (kg)</label>
                <input type="number" value={form.goalWeight} onChange={e => set('goalWeight', parseFloat(e.target.value) || 0)} step="0.1"
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Goals */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{steps[2].title}</h2>
            <div className="space-y-3">
              {[
                { key: 'lose', emoji: '📉', title: 'Perdre du poids', desc: 'Déficit de 500 kcal/jour' },
                { key: 'maintain', emoji: '⚖️', title: 'Maintenir mon poids', desc: 'Équilibre calorique' },
                { key: 'gain', emoji: '📈', title: 'Prendre de la masse', desc: 'Surplus de 300 kcal/jour' },
              ].map(({ key, emoji, title, desc }) => (
                <button
                  key={key}
                  onClick={() => set('goal', key)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                    form.goal === key
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                  }`}
                >
                  <span className="text-3xl">{emoji}</span>
                  <div>
                    <p className={`font-semibold ${form.goal === key ? 'text-primary-700 dark:text-primary-400' : 'text-gray-800 dark:text-gray-200'}`}>{title}</p>
                    <p className="text-sm text-gray-400">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Activity */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{steps[3].title}</h2>
            <div className="space-y-2">
              {[
                { key: 'sedentary', emoji: '💼', title: 'Sédentaire', desc: 'Bureau, peu ou pas de sport' },
                { key: 'light', emoji: '🚶', title: 'Légèrement actif', desc: '1-2 séances/semaine' },
                { key: 'moderate', emoji: '🏃', title: 'Modérément actif', desc: '3-5 séances/semaine' },
                { key: 'active', emoji: '🏋️', title: 'Très actif', desc: '6-7 séances/semaine' },
                { key: 'veryActive', emoji: '🏅', title: 'Athlète', desc: '2 séances/jour' },
              ].map(({ key, emoji, title, desc }) => (
                <button
                  key={key}
                  onClick={() => set('activityLevel', key)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all text-left ${
                    form.activityLevel === key
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                  }`}
                >
                  <span className="text-2xl">{emoji}</span>
                  <div>
                    <p className={`text-sm font-semibold ${form.activityLevel === key ? 'text-primary-700 dark:text-primary-400' : 'text-gray-800 dark:text-gray-200'}`}>{title}</p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      {step > 0 && (
        <div className="px-6 pb-10 flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="px-6 py-3.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Retour
            </button>
          )}
          <button
            onClick={() => step < steps.length - 1 ? setStep(s => s + 1) : handleComplete()}
            className="flex-1 py-3.5 bg-primary-500 text-white font-bold rounded-2xl hover:bg-primary-600 transition-colors text-base"
          >
            {step === steps.length - 1 ? "C'est parti ! 🚀" : 'Suivant'}
          </button>
        </div>
      )}
    </div>
  )
}
