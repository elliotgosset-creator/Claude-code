export interface UserProfile {
  name: string
  age: number
  gender: 'male' | 'female' | 'other'
  height: number // cm
  startWeight: number // kg
  goalWeight: number // kg
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive'
  goal: 'lose' | 'maintain' | 'gain'
  calorieGoal: number
  proteinGoal: number // g
  carbGoal: number // g
  fatGoal: number // g
  waterGoal: number // ml
  sleepGoal: number // hours
}

export interface FoodItem {
  id: string
  name: string
  brand?: string
  calories: number // per 100g
  protein: number // g per 100g
  carbs: number // g per 100g
  fat: number // g per 100g
  fiber?: number
  sugar?: number
  sodium?: number
  isCustom?: boolean
}

export interface MealEntry {
  id: string
  foodId: string
  foodName: string
  brand?: string
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  quantity: number // grams
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  date: string // ISO date YYYY-MM-DD
  timestamp: number
}

export interface DayLog {
  date: string // YYYY-MM-DD
  meals: MealEntry[]
  workouts: WorkoutEntry[]
  water: number // ml
  weight?: number // kg
  sleep?: number // hours
  mood?: 1 | 2 | 3 | 4 | 5
  notes?: string
}

export interface Exercise {
  id: string
  name: string
  category: 'cardio' | 'strength' | 'flexibility' | 'sports' | 'other'
  muscleGroups?: string[]
  metValue?: number // for calorie calculation
  isCustom?: boolean
}

export interface WorkoutSet {
  reps?: number
  weight?: number // kg
  duration?: number // minutes
  distance?: number // km
}

export interface WorkoutEntry {
  id: string
  exerciseId: string
  exerciseName: string
  category: string
  sets: WorkoutSet[]
  totalCaloriesBurned: number
  duration: number // minutes total
  date: string
  timestamp: number
  notes?: string
}

export interface WeightEntry {
  date: string
  weight: number
  timestamp: number
}

export interface StreakData {
  currentStreak: number
  longestStreak: number
  lastLoggedDate: string
  totalDaysLogged: number
}

export type Tab = 'dashboard' | 'diary' | 'workout' | 'progress' | 'profile'

export type Theme = 'light' | 'dark'

export interface AppState {
  profile: UserProfile
  dayLogs: Record<string, DayLog>
  weightHistory: WeightEntry[]
  customFoods: FoodItem[]
  customExercises: Exercise[]
  streak: StreakData
  theme: Theme
  onboardingComplete: boolean
}
