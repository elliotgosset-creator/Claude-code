import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { useStore } from './hooks/useStore'
import Navigation from './components/Navigation'
import Dashboard from './pages/Dashboard'
import FoodDiary from './pages/FoodDiary'
import WorkoutLog from './pages/WorkoutLog'
import Progress from './pages/Progress'
import Profile from './pages/Profile'
import Onboarding from './pages/Onboarding'
import type { Tab } from './types'

export default function App() {
  const {
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
  } = useStore()

  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const today = format(new Date(), 'yyyy-MM-dd')
  const dayLog = getDayLog(today)

  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [state.theme])

  if (!state.onboardingComplete) {
    return (
      <div className="dark:bg-gray-900 min-h-screen">
        <Onboarding onComplete={updateProfile} />
      </div>
    )
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        theme={state.theme}
        onToggleTheme={toggleTheme}
      />

      <main className="max-w-2xl mx-auto pt-14">
        {activeTab === 'dashboard' && (
          <Dashboard
            today={today}
            dayLog={dayLog}
            profile={state.profile}
            streak={state.streak}
            weightHistory={state.weightHistory}
            onWaterAdd={ml => setWater(today, Math.max(0, dayLog.water + ml))}
            onSleepSet={h => setSleep(today, h)}
            onMoodSet={m => setMood(today, m)}
          />
        )}

        {activeTab === 'diary' && (
          <FoodDiary
            today={today}
            dayLog={dayLog}
            profile={state.profile}
            customFoods={state.customFoods}
            onAddMeal={meal => addMeal(today, meal)}
            onRemoveMeal={id => removeMeal(today, id)}
            onAddCustomFood={addCustomFood}
          />
        )}

        {activeTab === 'workout' && (
          <WorkoutLog
            today={today}
            dayLog={dayLog}
            profile={state.profile}
            customExercises={state.customExercises}
            onAddWorkout={w => addWorkout(today, w)}
            onRemoveWorkout={id => removeWorkout(today, id)}
            onAddCustomExercise={addCustomExercise}
          />
        )}

        {activeTab === 'progress' && (
          <Progress
            state={state}
            today={today}
            onLogWeight={logWeight}
          />
        )}

        {activeTab === 'profile' && (
          <Profile
            profile={state.profile}
            onSave={updateProfile}
          />
        )}
      </main>
    </div>
  )
}
