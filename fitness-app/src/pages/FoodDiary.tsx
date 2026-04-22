import { useState } from 'react'
import { Plus, Search, X, ChevronDown, ChevronUp, Trash2, UtensilsCrossed } from 'lucide-react'
import type { MealEntry, FoodItem, DayLog, UserProfile } from '../types'
import { searchFoods } from '../utils/foodDatabase'
import { calcNutrients } from '../utils/calculations'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Props {
  today: string
  dayLog: DayLog
  profile: UserProfile
  customFoods: FoodItem[]
  onAddMeal: (meal: MealEntry) => void
  onRemoveMeal: (id: string) => void
  onAddCustomFood: (food: FoodItem) => void
}

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

const mealLabels: Record<MealType, string> = {
  breakfast: 'Petit-déjeuner',
  lunch: 'Déjeuner',
  dinner: 'Dîner',
  snack: 'Collation',
}

const mealIcons: Record<MealType, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍎',
}

interface AddFoodModalProps {
  mealType: MealType
  customFoods: FoodItem[]
  onClose: () => void
  onAdd: (meal: MealEntry) => void
  onAddCustomFood: (food: FoodItem) => void
}

function AddFoodModal({ mealType, customFoods, onClose, onAdd, onAddCustomFood }: AddFoodModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<FoodItem[]>([])
  const [selected, setSelected] = useState<FoodItem | null>(null)
  const [quantity, setQuantity] = useState('100')
  const [tab, setTab] = useState<'search' | 'custom'>('search')

  // Custom food state
  const [customName, setCustomName] = useState('')
  const [customCalories, setCustomCalories] = useState('')
  const [customProtein, setCustomProtein] = useState('')
  const [customCarbs, setCustomCarbs] = useState('')
  const [customFat, setCustomFat] = useState('')

  const handleSearch = (q: string) => {
    setQuery(q)
    setResults(searchFoods(q, customFoods))
  }

  const handleSelect = (food: FoodItem) => {
    setSelected(food)
    setResults([])
    setQuery(food.name)
  }

  const handleAdd = () => {
    if (!selected) return
    const qty = parseFloat(quantity) || 100
    const entry: MealEntry = {
      id: `meal_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      foodId: selected.id,
      foodName: selected.name,
      brand: selected.brand,
      mealType,
      quantity: qty,
      calories: calcNutrients(selected.calories, selected.calories, qty),
      protein: calcNutrients(selected.protein, selected.protein, qty),
      carbs: calcNutrients(selected.carbs, selected.carbs, qty),
      fat: calcNutrients(selected.fat, selected.fat, qty),
      fiber: calcNutrients(selected.fiber ?? 0, selected.fiber ?? 0, qty),
      date: new Date().toISOString().split('T')[0],
      timestamp: Date.now(),
    }
    onAdd(entry)
    onClose()
  }

  const handleAddCustom = () => {
    if (!customName || !customCalories) return
    const food: FoodItem = {
      id: `custom_${Date.now()}`,
      name: customName,
      calories: parseFloat(customCalories) || 0,
      protein: parseFloat(customProtein) || 0,
      carbs: parseFloat(customCarbs) || 0,
      fat: parseFloat(customFat) || 0,
      isCustom: true,
    }
    onAddCustomFood(food)
    setSelected(food)
    setTab('search')
    setQuery(food.name)
  }

  const qty = parseFloat(quantity) || 100

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white dark:bg-gray-900 rounded-t-3xl w-full max-h-[85vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-900 z-10">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Ajouter à {mealLabels[mealType]}
          </h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 dark:border-gray-800">
          <button
            onClick={() => setTab('search')}
            className={`flex-1 py-3 text-sm font-medium ${tab === 'search' ? 'text-primary-600 border-b-2 border-primary-500' : 'text-gray-500'}`}
          >
            Rechercher
          </button>
          <button
            onClick={() => setTab('custom')}
            className={`flex-1 py-3 text-sm font-medium ${tab === 'custom' ? 'text-primary-600 border-b-2 border-primary-500' : 'text-gray-500'}`}
          >
            Aliment personnalisé
          </button>
        </div>

        <div className="p-4 space-y-4">
          {tab === 'search' ? (
            <>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={e => handleSearch(e.target.value)}
                  placeholder="Rechercher un aliment..."
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  autoFocus
                />
              </div>

              {results.length > 0 && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                  {results.map(food => (
                    <button
                      key={food.id}
                      onClick={() => handleSelect(food)}
                      className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800 last:border-0 text-left"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{food.name}</p>
                        {food.brand && <p className="text-xs text-gray-400">{food.brand}</p>}
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        <p className="font-medium text-gray-700 dark:text-gray-300">{food.calories} kcal</p>
                        <p>pour 100g</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {selected && (
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                    <p className="font-semibold text-gray-900 dark:text-white mb-3">{selected.name}</p>
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div>
                        <p className="font-bold text-lg text-gray-900 dark:text-white">
                          {Math.round((selected.calories * qty) / 100)}
                        </p>
                        <p className="text-gray-500">kcal</p>
                      </div>
                      <div>
                        <p className="font-bold text-lg text-blue-600">{Math.round((selected.protein * qty) / 100)}g</p>
                        <p className="text-gray-500">Prot.</p>
                      </div>
                      <div>
                        <p className="font-bold text-lg text-yellow-600">{Math.round((selected.carbs * qty) / 100)}g</p>
                        <p className="text-gray-500">Gluc.</p>
                      </div>
                      <div>
                        <p className="font-bold text-lg text-red-500">{Math.round((selected.fat * qty) / 100)}g</p>
                        <p className="text-gray-500">Lip.</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Quantité (grammes)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={quantity}
                        onChange={e => setQuantity(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        min="1"
                      />
                      {[50, 100, 150, 200].map(q => (
                        <button
                          key={q}
                          onClick={() => setQuantity(String(q))}
                          className={`px-2 py-1.5 text-xs rounded-lg ${
                            quantity === String(q)
                              ? 'bg-primary-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                          }`}
                        >
                          {q}g
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleAdd}
                    className="w-full py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors"
                  >
                    Ajouter
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">Valeurs pour 100g</p>
              {[
                { label: 'Nom de l\'aliment *', value: customName, setter: setCustomName, type: 'text' },
                { label: 'Calories (kcal) *', value: customCalories, setter: setCustomCalories, type: 'number' },
                { label: 'Protéines (g)', value: customProtein, setter: setCustomProtein, type: 'number' },
                { label: 'Glucides (g)', value: customCarbs, setter: setCustomCarbs, type: 'number' },
                { label: 'Lipides (g)', value: customFat, setter: setCustomFat, type: 'number' },
              ].map(({ label, value, setter, type }) => (
                <div key={label}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
                  <input
                    type={type}
                    value={value}
                    onChange={e => setter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              ))}
              <button
                onClick={handleAddCustom}
                disabled={!customName || !customCalories}
                className="w-full py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50"
              >
                Créer et ajouter
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MealSection({
  mealType, entries, onAdd, onRemove, customFoods, onAddCustomFood,
}: {
  mealType: MealType
  entries: MealEntry[]
  onAdd: (meal: MealEntry) => void
  onRemove: (id: string) => void
  customFoods: FoodItem[]
  onAddCustomFood: (food: FoodItem) => void
}) {
  const [open, setOpen] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const total = entries.reduce((s, e) => s + e.calories, 0)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">{mealIcons[mealType]}</span>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{mealLabels[mealType]}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{total} kcal</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={e => { e.stopPropagation(); setShowModal(true) }}
            className="p-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-xl hover:bg-primary-100 transition-colors"
          >
            <Plus size={18} />
          </button>
          {open ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
        </div>
      </div>

      {open && entries.length > 0 && (
        <div className="border-t border-gray-100 dark:border-gray-700">
          {entries.map(entry => (
            <div key={entry.id} className="flex items-center justify-between px-4 py-2.5 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{entry.foodName}</p>
                <p className="text-xs text-gray-400">{entry.quantity}g</p>
              </div>
              <div className="flex items-center gap-3 ml-3">
                <div className="text-right text-xs">
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{entry.calories} kcal</p>
                  <p className="text-gray-400">P:{entry.protein}g G:{entry.carbs}g L:{entry.fat}g</p>
                </div>
                <button
                  onClick={() => onRemove(entry.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {open && entries.length === 0 && (
        <div className="border-t border-gray-100 dark:border-gray-700 p-4 text-center">
          <p className="text-sm text-gray-400 dark:text-gray-500">Aucun aliment ajouté</p>
        </div>
      )}

      {showModal && (
        <AddFoodModal
          mealType={mealType}
          customFoods={customFoods}
          onClose={() => setShowModal(false)}
          onAdd={onAdd}
          onAddCustomFood={onAddCustomFood}
        />
      )}
    </div>
  )
}

export default function FoodDiary({
  today, dayLog, profile, customFoods, onAddMeal, onRemoveMeal, onAddCustomFood
}: Props) {
  const meals = dayLog.meals
  const totalCal = meals.reduce((s, m) => s + m.calories, 0)
  const totalProtein = meals.reduce((s, m) => s + m.protein, 0)
  const totalCarbs = meals.reduce((s, m) => s + m.carbs, 0)
  const totalFat = meals.reduce((s, m) => s + m.fat, 0)
  const totalFiber = meals.reduce((s, m) => s + m.fiber, 0)

  const dateLabel = format(new Date(today + 'T12:00:00'), 'EEEE d MMMM', { locale: fr })

  const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']

  return (
    <div className="space-y-4 pb-20">
      <div className="px-4 pt-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white capitalize">{dateLabel}</h1>
      </div>

      {/* Daily summary */}
      <div className="mx-4 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-4 text-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <UtensilsCrossed size={18} />
            <span className="font-semibold">Total du jour</span>
          </div>
          <span className="font-bold text-xl">{totalCal} kcal</span>
        </div>
        <div className="flex gap-4 text-sm text-primary-100">
          <span>P: <span className="text-white font-semibold">{totalProtein}g</span></span>
          <span>G: <span className="text-white font-semibold">{totalCarbs}g</span></span>
          <span>L: <span className="text-white font-semibold">{totalFat}g</span></span>
          <span>F: <span className="text-white font-semibold">{totalFiber}g</span></span>
        </div>
        <div className="mt-2 flex gap-2 text-xs text-primary-200">
          <span>Objectif : {profile.calorieGoal} kcal</span>
          <span>•</span>
          <span className={totalCal > profile.calorieGoal ? 'text-red-300 font-semibold' : 'text-green-300 font-semibold'}>
            {totalCal > profile.calorieGoal ? '+' : ''}{totalCal - profile.calorieGoal} kcal
          </span>
        </div>
      </div>

      {/* Meal sections */}
      <div className="mx-4 space-y-3">
        {mealTypes.map(type => (
          <MealSection
            key={type}
            mealType={type}
            entries={meals.filter(m => m.mealType === type)}
            onAdd={onAddMeal}
            onRemove={onRemoveMeal}
            customFoods={customFoods}
            onAddCustomFood={onAddCustomFood}
          />
        ))}
      </div>
    </div>
  )
}
