import type { UserProfile } from '../types'

const activityMultipliers = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
}

export function calculateBMR(profile: UserProfile): number {
  // Mifflin-St Jeor equation
  const { gender, weight, height, age } = {
    weight: profile.startWeight,
    height: profile.height,
    age: profile.age,
    gender: profile.gender,
  }
  if (gender === 'female') {
    return 10 * weight + 6.25 * height - 5 * age - 161
  }
  return 10 * weight + 6.25 * height - 5 * age + 5
}

export function calculateTDEE(profile: UserProfile): number {
  const bmr = calculateBMR(profile)
  return Math.round(bmr * activityMultipliers[profile.activityLevel])
}

export function calculateCalorieGoal(profile: UserProfile): number {
  const tdee = calculateTDEE(profile)
  if (profile.goal === 'lose') return Math.max(1200, tdee - 500)
  if (profile.goal === 'gain') return tdee + 300
  return tdee
}

export function calculateBMI(weight: number, height: number): number {
  const heightM = height / 100
  return weight / (heightM * heightM)
}

export function getBMICategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: 'Insuffisance pondérale', color: 'text-blue-500' }
  if (bmi < 25) return { label: 'Poids normal', color: 'text-green-500' }
  if (bmi < 30) return { label: 'Surpoids', color: 'text-yellow-500' }
  return { label: 'Obésité', color: 'text-red-500' }
}

export function getMacrosFromCalories(
  calories: number,
  proteinPct = 0.30,
  carbPct = 0.40,
  fatPct = 0.30
) {
  return {
    protein: Math.round((calories * proteinPct) / 4),
    carbs: Math.round((calories * carbPct) / 4),
    fat: Math.round((calories * fatPct) / 9),
  }
}

export function getDaysUntilGoal(profile: UserProfile): number {
  const diff = profile.startWeight - profile.goalWeight
  if (diff === 0) return 0
  // ~0.5kg per week with 500 kcal deficit
  const weeks = Math.abs(diff) / 0.5
  return Math.round(weeks * 7)
}

export function calcNutrients(_calories: number, per100: number, quantity: number) {
  return Math.round((per100 * quantity) / 100)
}

export function formatCalories(n: number): string {
  return Math.round(n).toLocaleString('fr-FR')
}

export function getWaterFromWeight(weight: number): number {
  // 35ml per kg of body weight
  return Math.round(weight * 35)
}

export function estimateCaloriesBurned(
  metValue: number,
  weightKg: number,
  durationMin: number
): number {
  // Calories = MET * weight(kg) * duration(h)
  return Math.round(metValue * weightKg * (durationMin / 60))
}
