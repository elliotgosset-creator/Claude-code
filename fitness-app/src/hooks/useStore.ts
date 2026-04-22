import { useState, useCallback } from 'react'
import type { AppState, UserProfile, DayLog, MealEntry, WorkoutEntry, WeightEntry, FoodItem, Exercise, StreakData, Theme } from '../types'
import { calculateCalorieGoal } from '../utils/calculations'
import { format } from 'date-fns'

const STORAGE_KEY = 'fitlife_data'

const defaultProfile: UserProfile = {
  name: '',
  age: 25,
  gender: 'male',
  height: 175,
  startWeight: 75,
  goalWeight: 70,
  activityLevel: 'moderate',
  goal: 'lose',
  calorieGoal: 2000,
  proteinGoal: 150,
  carbGoal: 200,
  fatGoal: 67,
  waterGoal: 2500,
  sleepGoal: 8,
}

const defaultStreak: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastLoggedDate: '',
  totalDaysLogged: 0,
}

const defaultState: AppState = {
  profile: defaultProfile,
  dayLogs: {},
  weightHistory: [],
  customFoods: [],
  customExercises: [],
  streak: defaultStreak,
  theme: 'light',
  onboardingComplete: false,
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState
    return { ...defaultState, ...JSON.parse(raw) }
  } catch {
    return defaultState
  }
}

function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {}
}

function updateStreak(streak: StreakData, today: string): StreakData {
  if (streak.lastLoggedDate === today) return streak

  const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd')
  const newStreak = streak.lastLoggedDate === yesterday
    ? streak.currentStreak + 1
    : 1

  return {
    currentStreak: newStreak,
    longestStreak: Math.max(newStreak, streak.longestStreak),
    lastLoggedDate: today,
    totalDaysLogged: streak.totalDaysLogged + 1,
  }
}

export function useStore() {
  const [state, setState] = useState<AppState>(loadState)

  const update = useCallback((updater: (prev: AppState) => AppState) => {
    setState(prev => {
      const next = updater(prev)
      saveState(next)
      return next
    })
  }, [])

  const getDayLog = useCallback((date: string): DayLog => {
    return state.dayLogs[date] ?? {
      date,
      meals: [],
      workouts: [],
      water: 0,
    }
  }, [state.dayLogs])

  const addMeal = useCallback((date: string, meal: MealEntry) => {
    update(prev => {
      const day = prev.dayLogs[date] ?? { date, meals: [], workouts: [], water: 0 }
      const newStreak = updateStreak(prev.streak, date)
      return {
        ...prev,
        streak: newStreak,
        dayLogs: {
          ...prev.dayLogs,
          [date]: { ...day, meals: [...day.meals, meal] },
        },
      }
    })
  }, [update])

  const removeMeal = useCallback((date: string, mealId: string) => {
    update(prev => {
      const day = prev.dayLogs[date]
      if (!day) return prev
      return {
        ...prev,
        dayLogs: {
          ...prev.dayLogs,
          [date]: { ...day, meals: day.meals.filter(m => m.id !== mealId) },
        },
      }
    })
  }, [update])

  const addWorkout = useCallback((date: string, workout: WorkoutEntry) => {
    update(prev => {
      const day = prev.dayLogs[date] ?? { date, meals: [], workouts: [], water: 0 }
      const newStreak = updateStreak(prev.streak, date)
      return {
        ...prev,
        streak: newStreak,
        dayLogs: {
          ...prev.dayLogs,
          [date]: { ...day, workouts: [...day.workouts, workout] },
        },
      }
    })
  }, [update])

  const removeWorkout = useCallback((date: string, workoutId: string) => {
    update(prev => {
      const day = prev.dayLogs[date]
      if (!day) return prev
      return {
        ...prev,
        dayLogs: {
          ...prev.dayLogs,
          [date]: { ...day, workouts: day.workouts.filter(w => w.id !== workoutId) },
        },
      }
    })
  }, [update])

  const setWater = useCallback((date: string, water: number) => {
    update(prev => {
      const day = prev.dayLogs[date] ?? { date, meals: [], workouts: [], water: 0 }
      return {
        ...prev,
        dayLogs: { ...prev.dayLogs, [date]: { ...day, water } },
      }
    })
  }, [update])

  const setSleep = useCallback((date: string, sleep: number) => {
    update(prev => {
      const day = prev.dayLogs[date] ?? { date, meals: [], workouts: [], water: 0 }
      return {
        ...prev,
        dayLogs: { ...prev.dayLogs, [date]: { ...day, sleep } },
      }
    })
  }, [update])

  const setMood = useCallback((date: string, mood: 1 | 2 | 3 | 4 | 5) => {
    update(prev => {
      const day = prev.dayLogs[date] ?? { date, meals: [], workouts: [], water: 0 }
      return {
        ...prev,
        dayLogs: { ...prev.dayLogs, [date]: { ...day, mood } },
      }
    })
  }, [update])

  const logWeight = useCallback((entry: WeightEntry) => {
    update(prev => {
      const existing = prev.weightHistory.findIndex(w => w.date === entry.date)
      const newHistory = existing >= 0
        ? prev.weightHistory.map((w, i) => i === existing ? entry : w)
        : [...prev.weightHistory, entry].sort((a, b) => a.timestamp - b.timestamp)
      const day = prev.dayLogs[entry.date] ?? { date: entry.date, meals: [], workouts: [], water: 0 }
      return {
        ...prev,
        weightHistory: newHistory,
        dayLogs: { ...prev.dayLogs, [entry.date]: { ...day, weight: entry.weight } },
      }
    })
  }, [update])

  const updateProfile = useCallback((profile: UserProfile) => {
    const calorieGoal = calculateCalorieGoal(profile)
    const updated = { ...profile, calorieGoal }
    update(prev => ({ ...prev, profile: updated, onboardingComplete: true }))
  }, [update])

  const addCustomFood = useCallback((food: FoodItem) => {
    update(prev => ({ ...prev, customFoods: [...prev.customFoods, food] }))
  }, [update])

  const addCustomExercise = useCallback((exercise: Exercise) => {
    update(prev => ({ ...prev, customExercises: [...prev.customExercises, exercise] }))
  }, [update])

  const toggleTheme = useCallback(() => {
    update(prev => {
      const theme: Theme = prev.theme === 'light' ? 'dark' : 'light'
      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      return { ...prev, theme }
    })
  }, [update])

  const setNotes = useCallback((date: string, notes: string) => {
    update(prev => {
      const day = prev.dayLogs[date] ?? { date, meals: [], workouts: [], water: 0 }
      return {
        ...prev,
        dayLogs: { ...prev.dayLogs, [date]: { ...day, notes } },
      }
    })
  }, [update])

  return {
    state,
    getDayLog,
    addMeal,
    removeMeal,
    addWorkout,
    removeWorkout,
    setWater,
    setSleep,
    setMood,
    logWeight,
    updateProfile,
    addCustomFood,
    addCustomExercise,
    toggleTheme,
    setNotes,
  }
}
