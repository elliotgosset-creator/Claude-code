import { useState } from 'react'
import { Plus, X, Trash2, Timer, Flame, Dumbbell } from 'lucide-react'
import type { WorkoutEntry, WorkoutSet, Exercise, DayLog, UserProfile } from '../types'
import { searchExercises, EXERCISE_DATABASE } from '../utils/exerciseDatabase'
import { estimateCaloriesBurned } from '../utils/calculations'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Props {
  today: string
  dayLog: DayLog
  profile: UserProfile
  customExercises: Exercise[]
  onAddWorkout: (workout: WorkoutEntry) => void
  onRemoveWorkout: (id: string) => void
  onAddCustomExercise: (exercise: Exercise) => void
}

const categoryColors: Record<string, string> = {
  cardio: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  strength: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  flexibility: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  sports: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  other: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
}

const categoryLabels: Record<string, string> = {
  cardio: 'Cardio',
  strength: 'Musculation',
  flexibility: 'Flexibilité',
  sports: 'Sport',
  other: 'Autre',
}

interface AddWorkoutModalProps {
  profile: UserProfile
  customExercises: Exercise[]
  onClose: () => void
  onAdd: (workout: WorkoutEntry) => void
  onAddCustomExercise: (exercise: Exercise) => void
  today: string
}

function AddWorkoutModal({ profile, customExercises, onClose, onAdd, onAddCustomExercise, today }: AddWorkoutModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Exercise[]>(EXERCISE_DATABASE.slice(0, 8))
  const [selected, setSelected] = useState<Exercise | null>(null)
  const [duration, setDuration] = useState('30')
  const [sets, setSets] = useState<WorkoutSet[]>([{ reps: 10, weight: 20 }])
  const [notes, setNotes] = useState('')
  const [tab, setTab] = useState<'search' | 'custom'>('search')

  // Custom exercise
  const [customName, setCustomName] = useState('')
  const [customCategory, setCustomCategory] = useState<Exercise['category']>('strength')
  const [customMet, setCustomMet] = useState('5')

  const handleSearch = (q: string) => {
    setQuery(q)
    setResults(searchExercises(q, customExercises))
  }

  const handleSelect = (ex: Exercise) => {
    setSelected(ex)
    setQuery(ex.name)
    setResults([])
    if (ex.category === 'cardio' || ex.category === 'flexibility') {
      setSets([{ duration: 30 }])
    } else {
      setSets([{ reps: 10, weight: 20 }])
    }
  }

  const addSet = () => {
    if (selected?.category === 'cardio') {
      setSets(s => [...s, { duration: 30 }])
    } else {
      const last = sets[sets.length - 1] ?? { reps: 10, weight: 20 }
      setSets(s => [...s, { ...last }])
    }
  }

  const updateSet = (idx: number, field: keyof WorkoutSet, val: string) => {
    setSets(s => s.map((set, i) => i === idx ? { ...set, [field]: parseFloat(val) || 0 } : set))
  }

  const removeSet = (idx: number) => {
    setSets(s => s.filter((_, i) => i !== idx))
  }

  const handleAdd = () => {
    if (!selected) return
    const dur = parseFloat(duration) || 30
    const weight = profile.startWeight
    const calories = estimateCaloriesBurned(selected.metValue ?? 5, weight, dur)
    const workout: WorkoutEntry = {
      id: `workout_${Date.now()}`,
      exerciseId: selected.id,
      exerciseName: selected.name,
      category: selected.category,
      sets,
      totalCaloriesBurned: calories,
      duration: dur,
      date: today,
      timestamp: Date.now(),
      notes,
    }
    onAdd(workout)
    onClose()
  }

  const handleAddCustom = () => {
    if (!customName) return
    const ex: Exercise = {
      id: `custom_ex_${Date.now()}`,
      name: customName,
      category: customCategory,
      metValue: parseFloat(customMet) || 5,
      isCustom: true,
    }
    onAddCustomExercise(ex)
    handleSelect(ex)
    setTab('search')
  }

  const isCardio = selected?.category === 'cardio' || selected?.category === 'flexibility'

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white dark:bg-gray-900 rounded-t-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-900 z-10">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ajouter un exercice</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 dark:border-gray-800">
          <button onClick={() => setTab('search')} className={`flex-1 py-3 text-sm font-medium ${tab === 'search' ? 'text-primary-600 border-b-2 border-primary-500' : 'text-gray-500'}`}>
            Rechercher
          </button>
          <button onClick={() => setTab('custom')} className={`flex-1 py-3 text-sm font-medium ${tab === 'custom' ? 'text-primary-600 border-b-2 border-primary-500' : 'text-gray-500'}`}>
            Personnalisé
          </button>
        </div>

        <div className="p-4 space-y-4">
          {tab === 'search' ? (
            <>
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={e => handleSearch(e.target.value)}
                  placeholder="Rechercher un exercice..."
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  autoFocus
                />
              </div>

              {results.length > 0 && !selected && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                  {results.map(ex => (
                    <button
                      key={ex.id}
                      onClick={() => handleSelect(ex)}
                      className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800 last:border-0 text-left"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{ex.name}</p>
                        {ex.muscleGroups && (
                          <p className="text-xs text-gray-400">{ex.muscleGroups.join(', ')}</p>
                        )}
                      </div>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${categoryColors[ex.category]}`}>
                        {categoryLabels[ex.category]}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {selected && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{selected.name}</p>
                      {selected.muscleGroups && (
                        <p className="text-xs text-gray-400">{selected.muscleGroups.join(', ')}</p>
                      )}
                    </div>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${categoryColors[selected.category]}`}>
                      {categoryLabels[selected.category]}
                    </span>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Durée totale (minutes)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={duration}
                        onChange={e => setDuration(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        min="1"
                      />
                      {[15, 30, 45, 60].map(d => (
                        <button
                          key={d}
                          onClick={() => setDuration(String(d))}
                          className={`px-2 py-1.5 text-xs rounded-lg ${duration === String(d) ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                        >
                          {d}min
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Calories estimate */}
                  <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                    <Flame className="text-orange-500" size={18} />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Estimation : <span className="font-bold text-orange-600">
                        {estimateCaloriesBurned(selected.metValue ?? 5, profile.startWeight, parseFloat(duration) || 30)} kcal
                      </span>
                    </span>
                  </div>

                  {/* Sets */}
                  {!isCardio && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Séries</label>
                        <button onClick={addSet} className="text-xs text-primary-600 font-medium">+ Ajouter une série</button>
                      </div>
                      <div className="space-y-2">
                        {sets.map((set, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="w-6 text-xs text-center text-gray-400 font-medium">{i + 1}</span>
                            <div className="flex-1 grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-xs text-gray-400 mb-0.5 block">Reps</label>
                                <input
                                  type="number"
                                  value={set.reps ?? ''}
                                  onChange={e => updateSet(i, 'reps', e.target.value)}
                                  className="w-full px-2 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-gray-400 mb-0.5 block">Poids (kg)</label>
                                <input
                                  type="number"
                                  value={set.weight ?? ''}
                                  onChange={e => updateSet(i, 'weight', e.target.value)}
                                  className="w-full px-2 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                                />
                              </div>
                            </div>
                            {sets.length > 1 && (
                              <button onClick={() => removeSet(i)} className="text-gray-400 hover:text-red-500">
                                <X size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes (optionnel)</label>
                    <textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Sensations, PR, observations..."
                    />
                  </div>

                  <button
                    onClick={handleAdd}
                    className="w-full py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors"
                  >
                    Enregistrer la séance
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom de l'exercice *</label>
                <input
                  type="text"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Catégorie</label>
                <select
                  value={customCategory}
                  onChange={e => setCustomCategory(e.target.value as Exercise['category'])}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {Object.entries(categoryLabels).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Intensité MET (3=faible, 5=modérée, 8=intense)</label>
                <input
                  type="number"
                  value={customMet}
                  onChange={e => setCustomMet(e.target.value)}
                  min="1" max="15"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <button
                onClick={handleAddCustom}
                disabled={!customName}
                className="w-full py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50"
              >
                Créer l'exercice
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function WorkoutLog({
  today, dayLog, profile, customExercises, onAddWorkout, onRemoveWorkout, onAddCustomExercise
}: Props) {
  const [showModal, setShowModal] = useState(false)
  const dateLabel = format(new Date(today + 'T12:00:00'), 'EEEE d MMMM', { locale: fr })

  const totalCal = dayLog.workouts.reduce((s, w) => s + w.totalCaloriesBurned, 0)
  const totalDuration = dayLog.workouts.reduce((s, w) => s + w.duration, 0)

  return (
    <div className="space-y-4 pb-20">
      <div className="px-4 pt-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Sport</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{dateLabel}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-colors text-sm"
        >
          <Plus size={16} /> Ajouter
        </button>
      </div>

      {/* Summary */}
      {dayLog.workouts.length > 0 && (
        <div className="mx-4 grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm text-center">
            <Flame className="text-orange-500 mx-auto mb-1" size={24} />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCal}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">kcal brûlées</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm text-center">
            <Timer className="text-blue-500 mx-auto mb-1" size={24} />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalDuration}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">minutes</p>
          </div>
        </div>
      )}

      {/* Workout list */}
      <div className="mx-4 space-y-3">
        {dayLog.workouts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm text-center">
            <Dumbbell className="text-gray-300 dark:text-gray-600 mx-auto mb-3" size={48} />
            <p className="text-gray-500 dark:text-gray-400 font-medium">Aucune séance aujourd'hui</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Appuie sur "Ajouter" pour commencer</p>
          </div>
        ) : (
          dayLog.workouts.map(workout => (
            <div key={workout.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{workout.exerciseName}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[workout.category]}`}>
                      {categoryLabels[workout.category]}
                    </span>
                  </div>
                  <button
                    onClick={() => onRemoveWorkout(workout.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <Timer size={14} />
                    <span>{workout.duration} min</span>
                  </div>
                  <div className="flex items-center gap-1 text-orange-600">
                    <Flame size={14} />
                    <span className="font-medium">{workout.totalCaloriesBurned} kcal</span>
                  </div>
                  {workout.sets.length > 0 && workout.sets[0].reps !== undefined && (
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <span>{workout.sets.length} série{workout.sets.length > 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>

                {workout.sets.length > 0 && workout.sets[0].reps !== undefined && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex gap-3 overflow-x-auto text-xs">
                      {workout.sets.map((set, i) => (
                        <div key={i} className="flex-none bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-1.5 text-center">
                          <p className="font-semibold text-gray-900 dark:text-white">{set.reps} ×</p>
                          <p className="text-gray-500">{set.weight}kg</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {workout.notes && (
                  <p className="mt-2 text-xs text-gray-400 italic">{workout.notes}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <AddWorkoutModal
          profile={profile}
          customExercises={customExercises}
          onClose={() => setShowModal(false)}
          onAdd={onAddWorkout}
          onAddCustomExercise={onAddCustomExercise}
          today={today}
        />
      )}
    </div>
  )
}
