import type { Exercise } from '../types'

export const EXERCISE_DATABASE: Exercise[] = [
  // Cardio
  { id: 'e1', name: 'Course à pied', category: 'cardio', metValue: 9.8 },
  { id: 'e2', name: 'Vélo (modéré)', category: 'cardio', metValue: 8 },
  { id: 'e3', name: 'Natation', category: 'cardio', metValue: 8.3 },
  { id: 'e4', name: 'Corde à sauter', category: 'cardio', metValue: 11 },
  { id: 'e5', name: 'Marche rapide', category: 'cardio', metValue: 4.5 },
  { id: 'e6', name: 'HIIT', category: 'cardio', metValue: 12 },
  { id: 'e7', name: 'Elliptique', category: 'cardio', metValue: 7 },
  { id: 'e8', name: 'Rameur', category: 'cardio', metValue: 7 },
  { id: 'e9', name: 'Zumba', category: 'cardio', metValue: 6.5 },
  { id: 'e10', name: 'Football', category: 'sports', metValue: 8 },

  // Musculation - Poitrine
  { id: 's1', name: 'Développé couché', category: 'strength', muscleGroups: ['Poitrine', 'Épaules', 'Triceps'], metValue: 5 },
  { id: 's2', name: 'Pompes', category: 'strength', muscleGroups: ['Poitrine', 'Triceps'], metValue: 4.5 },
  { id: 's3', name: 'Écarté haltères', category: 'strength', muscleGroups: ['Poitrine'], metValue: 4 },

  // Musculation - Dos
  { id: 's4', name: 'Tractions (pull-ups)', category: 'strength', muscleGroups: ['Dos', 'Biceps'], metValue: 5 },
  { id: 's5', name: 'Rowing barre', category: 'strength', muscleGroups: ['Dos', 'Biceps'], metValue: 5 },
  { id: 's6', name: 'Tirage poulie haute', category: 'strength', muscleGroups: ['Dos', 'Biceps'], metValue: 4.5 },
  { id: 's7', name: 'Soulevé de terre', category: 'strength', muscleGroups: ['Dos', 'Jambes', 'Fessiers'], metValue: 6 },

  // Musculation - Jambes
  { id: 's8', name: 'Squat barre', category: 'strength', muscleGroups: ['Quadriceps', 'Fessiers', 'Ischio-jambiers'], metValue: 6 },
  { id: 's9', name: 'Presse à cuisses', category: 'strength', muscleGroups: ['Quadriceps', 'Fessiers'], metValue: 5 },
  { id: 's10', name: 'Fentes', category: 'strength', muscleGroups: ['Quadriceps', 'Fessiers'], metValue: 5 },
  { id: 's11', name: 'Leg curl', category: 'strength', muscleGroups: ['Ischio-jambiers'], metValue: 4 },
  { id: 's12', name: 'Mollets debout', category: 'strength', muscleGroups: ['Mollets'], metValue: 4 },
  { id: 's13', name: 'Hip thrust', category: 'strength', muscleGroups: ['Fessiers'], metValue: 5 },

  // Musculation - Épaules
  { id: 's14', name: 'Développé militaire', category: 'strength', muscleGroups: ['Épaules', 'Triceps'], metValue: 5 },
  { id: 's15', name: 'Élévations latérales', category: 'strength', muscleGroups: ['Épaules'], metValue: 4 },

  // Musculation - Bras
  { id: 's16', name: 'Curl biceps', category: 'strength', muscleGroups: ['Biceps'], metValue: 4 },
  { id: 's17', name: 'Extension triceps', category: 'strength', muscleGroups: ['Triceps'], metValue: 4 },
  { id: 's18', name: 'Dips', category: 'strength', muscleGroups: ['Triceps', 'Poitrine'], metValue: 4.5 },

  // Abdos
  { id: 's19', name: 'Crunchs', category: 'strength', muscleGroups: ['Abdominaux'], metValue: 4 },
  { id: 's20', name: 'Planche (Plank)', category: 'strength', muscleGroups: ['Abdominaux', 'Gainage'], metValue: 4 },
  { id: 's21', name: 'Relevés de jambes', category: 'strength', muscleGroups: ['Abdominaux'], metValue: 4 },
  { id: 's22', name: 'Russian twists', category: 'strength', muscleGroups: ['Abdominaux', 'Obliques'], metValue: 4 },

  // Flexibilité
  { id: 'fl1', name: 'Yoga', category: 'flexibility', metValue: 3 },
  { id: 'fl2', name: 'Stretching', category: 'flexibility', metValue: 2.5 },
  { id: 'fl3', name: 'Pilates', category: 'flexibility', metValue: 3.5 },
]

export function searchExercises(query: string, customExercises: Exercise[]): Exercise[] {
  const q = query.toLowerCase().trim()
  if (!q) return EXERCISE_DATABASE.slice(0, 10)
  const all = [...EXERCISE_DATABASE, ...customExercises]
  return all.filter(e =>
    e.name.toLowerCase().includes(q) ||
    e.category.toLowerCase().includes(q) ||
    (e.muscleGroups?.some(m => m.toLowerCase().includes(q)))
  ).slice(0, 15)
}
