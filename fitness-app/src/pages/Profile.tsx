import { useState } from 'react'
import type { UserProfile } from '../types'
import { calculateBMR, calculateTDEE, calculateCalorieGoal, calculateBMI, getBMICategory, getDaysUntilGoal, getMacrosFromCalories, getWaterFromWeight } from '../utils/calculations'
import { User, Target, Activity, Calculator } from 'lucide-react'

interface Props {
  profile: UserProfile
  onSave: (profile: UserProfile) => void
}

const activityLabels: Record<string, string> = {
  sedentary: 'Sédentaire (bureau, peu de sport)',
  light: 'Légèrement actif (1-2x/semaine)',
  moderate: 'Modérément actif (3-5x/semaine)',
  active: 'Très actif (6-7x/semaine)',
  veryActive: 'Athlète (2x/jour)',
}

const goalLabels: Record<string, { label: string; desc: string }> = {
  lose: { label: 'Perdre du poids', desc: '-500 kcal/jour' },
  maintain: { label: 'Maintenir mon poids', desc: '0 kcal' },
  gain: { label: 'Prendre de la masse', desc: '+300 kcal/jour' },
}

export default function Profile({ profile, onSave }: Props) {
  const [form, setForm] = useState<UserProfile>({ ...profile })
  const [saved, setSaved] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>(null)

  const set = (field: keyof UserProfile, value: unknown) => {
    setForm(p => ({ ...p, [field]: value }))
  }

  const handleSave = () => {
    const macros = getMacrosFromCalories(calculateCalorieGoal(form))
    const water = getWaterFromWeight(form.startWeight)
    const saved: UserProfile = {
      ...form,
      calorieGoal: calculateCalorieGoal(form),
      proteinGoal: macros.protein,
      carbGoal: macros.carbs,
      fatGoal: macros.fat,
      waterGoal: water,
    }
    onSave(saved)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const bmr = calculateBMR(form)
  const tdee = calculateTDEE(form)
  const calGoal = calculateCalorieGoal(form)
  const bmi = calculateBMI(form.startWeight, form.height)
  const bmiInfo = getBMICategory(bmi)
  const daysUntilGoal = getDaysUntilGoal(form)
  const macros = getMacrosFromCaloires(calGoal)

  function getMacrosFromCaloires(cal: number) {
    return getMacrosFromCalories(cal)
  }

  const sections = [
    { id: 'identity', label: 'Identité', icon: User },
    { id: 'goals', label: 'Objectifs', icon: Target },
    { id: 'activity', label: 'Activité', icon: Activity },
    { id: 'calculator', label: 'Calculs', icon: Calculator },
  ]

  return (
    <div className="space-y-4 pb-24">
      <div className="px-4 pt-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Mon Profil</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Configure tes objectifs personnels</p>
      </div>

      {/* Section nav */}
      <div className="mx-4 flex gap-2 overflow-x-auto pb-1">
        {sections.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(activeSection === id ? null : id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors flex-none ${
              activeSection === id
                ? 'bg-primary-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'
            }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Identity */}
      {(activeSection === 'identity' || activeSection === null) && (
        <div className="mx-4 bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <User size={18} className="text-primary-500" /> Identité
          </h2>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prénom</label>
              <input
                type="text"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="Ton prénom"
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Âge</label>
                <input
                  type="number"
                  value={form.age}
                  onChange={e => set('age', parseInt(e.target.value) || 0)}
                  min="10" max="100"
                  className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Genre</label>
                <select
                  value={form.gender}
                  onChange={e => set('gender', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="male">Homme</option>
                  <option value="female">Femme</option>
                  <option value="other">Autre</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Taille (cm)</label>
              <input
                type="number"
                value={form.height}
                onChange={e => set('height', parseInt(e.target.value) || 0)}
                min="100" max="250"
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Poids actuel (kg)</label>
                <input
                  type="number"
                  value={form.startWeight}
                  onChange={e => set('startWeight', parseFloat(e.target.value) || 0)}
                  step="0.1" min="30" max="300"
                  className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Poids cible (kg)</label>
                <input
                  type="number"
                  value={form.goalWeight}
                  onChange={e => set('goalWeight', parseFloat(e.target.value) || 0)}
                  step="0.1" min="30" max="300"
                  className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Goals */}
      {(activeSection === 'goals' || activeSection === null) && (
        <div className="mx-4 bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Target size={18} className="text-primary-500" /> Objectif
          </h2>
          <div className="space-y-2">
            {(Object.entries(goalLabels) as [string, { label: string; desc: string }][]).map(([k, { label, desc }]) => (
              <button
                key={k}
                onClick={() => set('goal', k)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-colors text-left ${
                  form.goal === k
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <div>
                  <p className={`font-medium text-sm ${form.goal === k ? 'text-primary-700 dark:text-primary-400' : 'text-gray-800 dark:text-gray-200'}`}>{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                </div>
                {form.goal === k && <div className="w-4 h-4 rounded-full bg-primary-500 flex-none" />}
              </button>
            ))}
          </div>

          {/* Custom goals */}
          <div className="border-t border-gray-100 dark:border-gray-700 pt-4 space-y-3">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Personnaliser les objectifs</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Calories (kcal)', field: 'calorieGoal', step: '50' },
                { label: 'Protéines (g)', field: 'proteinGoal', step: '5' },
                { label: 'Glucides (g)', field: 'carbGoal', step: '5' },
                { label: 'Lipides (g)', field: 'fatGoal', step: '5' },
              ].map(({ label, field, step }) => (
                <div key={field}>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
                  <input
                    type="number"
                    value={form[field as keyof UserProfile] as number}
                    onChange={e => set(field as keyof UserProfile, parseFloat(e.target.value) || 0)}
                    step={step}
                    className="w-full px-2 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Eau (ml)</label>
                <input
                  type="number"
                  value={form.waterGoal}
                  onChange={e => set('waterGoal', parseInt(e.target.value) || 0)}
                  step="250"
                  className="w-full px-2 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Sommeil (h)</label>
                <input
                  type="number"
                  value={form.sleepGoal}
                  onChange={e => set('sleepGoal', parseFloat(e.target.value) || 0)}
                  min="4" max="12" step="0.5"
                  className="w-full px-2 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity */}
      {(activeSection === 'activity' || activeSection === null) && (
        <div className="mx-4 bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-3">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Activity size={18} className="text-primary-500" /> Niveau d'activité
          </h2>
          <div className="space-y-2">
            {(Object.entries(activityLabels) as [string, string][]).map(([k, label]) => (
              <button
                key={k}
                onClick={() => set('activityLevel', k)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-colors text-left ${
                  form.activityLevel === k
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <p className={`text-sm ${form.activityLevel === k ? 'font-medium text-primary-700 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}>{label}</p>
                {form.activityLevel === k && <div className="w-4 h-4 rounded-full bg-primary-500 flex-none" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Calculator */}
      {(activeSection === 'calculator' || activeSection === null) && (
        <div className="mx-4 bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <Calculator size={18} className="text-primary-500" /> Mes calculs
          </h2>
          <div className="space-y-3">
            {[
              { label: 'BMR (métabolisme de base)', value: `${Math.round(bmr)} kcal/jour`, desc: 'Calories brûlées au repos' },
              { label: 'TDEE (dépense totale)', value: `${tdee} kcal/jour`, desc: 'Avec ton niveau d\'activité' },
              { label: 'Objectif calorique', value: `${calGoal} kcal/jour`, desc: 'Adapté à ton objectif' },
              { label: 'IMC', value: `${bmi.toFixed(1)}`, desc: bmiInfo.label, valueColor: bmiInfo.color },
              { label: 'Durée estimée', value: daysUntilGoal > 0 ? `~${daysUntilGoal} jours` : 'Déjà atteint !', desc: 'Pour atteindre ton objectif' },
            ].map(({ label, value, desc, valueColor }) => (
              <div key={label} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
                <p className={`text-sm font-bold ${valueColor ?? 'text-gray-900 dark:text-white'}`}>{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
            <p className="text-xs font-semibold text-primary-700 dark:text-primary-400 mb-2">Macros recommandées</p>
            <div className="flex justify-around text-center text-xs">
              <div>
                <p className="font-bold text-blue-600 text-base">{macros.protein}g</p>
                <p className="text-gray-500">Protéines</p>
              </div>
              <div>
                <p className="font-bold text-yellow-600 text-base">{macros.carbs}g</p>
                <p className="text-gray-500">Glucides</p>
              </div>
              <div>
                <p className="font-bold text-red-500 text-base">{macros.fat}g</p>
                <p className="text-gray-500">Lipides</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save button */}
      <div className="fixed bottom-16 left-0 right-0 px-4 pb-2 bg-transparent">
        <button
          onClick={handleSave}
          className={`w-full py-3.5 rounded-2xl font-semibold text-white transition-all duration-300 shadow-lg ${
            saved ? 'bg-green-500' : 'bg-primary-500 hover:bg-primary-600'
          }`}
        >
          {saved ? '✓ Enregistré !' : 'Sauvegarder'}
        </button>
      </div>
    </div>
  )
}
