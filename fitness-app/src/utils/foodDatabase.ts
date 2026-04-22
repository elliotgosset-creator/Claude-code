import type { FoodItem } from '../types'

export const FOOD_DATABASE: FoodItem[] = [
  // Viandes & Protéines
  { id: 'f1', name: 'Poulet grillé (poitrine)', brand: '', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 },
  { id: 'f2', name: 'Bœuf haché 5%', brand: '', calories: 137, protein: 21, carbs: 0, fat: 5.5, fiber: 0 },
  { id: 'f3', name: 'Saumon', brand: '', calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0 },
  { id: 'f4', name: 'Thon en conserve (eau)', brand: '', calories: 116, protein: 26, carbs: 0, fat: 1, fiber: 0 },
  { id: 'f5', name: 'Œuf entier', brand: '', calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0 },
  { id: 'f6', name: 'Blanc d\'œuf', brand: '', calories: 52, protein: 11, carbs: 0.7, fat: 0.2, fiber: 0 },
  { id: 'f7', name: 'Dinde (escalope)', brand: '', calories: 157, protein: 29, carbs: 0, fat: 3.6, fiber: 0 },
  { id: 'f8', name: 'Crevettes', brand: '', calories: 99, protein: 24, carbs: 0.2, fat: 0.3, fiber: 0 },
  { id: 'f9', name: 'Cabillaud', brand: '', calories: 82, protein: 18, carbs: 0, fat: 0.7, fiber: 0 },
  { id: 'f10', name: 'Jambon blanc (sans couenne)', brand: '', calories: 107, protein: 17, carbs: 1.2, fat: 3.5, fiber: 0 },

  // Produits laitiers
  { id: 'd1', name: 'Yaourt grec 0%', brand: '', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0 },
  { id: 'd2', name: 'Fromage blanc 0%', brand: '', calories: 45, protein: 7.5, carbs: 4, fat: 0.1, fiber: 0 },
  { id: 'd3', name: 'Lait demi-écrémé', brand: '', calories: 46, protein: 3.2, carbs: 4.8, fat: 1.6, fiber: 0 },
  { id: 'd4', name: 'Cottage cheese', brand: '', calories: 98, protein: 11, carbs: 3.4, fat: 4.3, fiber: 0 },
  { id: 'd5', name: 'Skyr nature', brand: '', calories: 66, protein: 11, carbs: 4, fat: 0.2, fiber: 0 },
  { id: 'd6', name: 'Whey protéine (scoop 30g)', brand: '', calories: 113, protein: 24, carbs: 3, fat: 1.5, fiber: 0 },
  { id: 'd7', name: 'Emmental', brand: '', calories: 382, protein: 29, carbs: 0.5, fat: 29, fiber: 0 },
  { id: 'd8', name: 'Mozzarella', brand: '', calories: 280, protein: 18, carbs: 3.1, fat: 22, fiber: 0 },

  // Céréales & Féculents
  { id: 'c1', name: 'Riz blanc cuit', brand: '', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4 },
  { id: 'c2', name: 'Riz brun cuit', brand: '', calories: 123, protein: 2.7, carbs: 26, fat: 0.9, fiber: 1.8 },
  { id: 'c3', name: 'Pâtes cuites (al dente)', brand: '', calories: 131, protein: 5, carbs: 25, fat: 1.1, fiber: 1.8 },
  { id: 'c4', name: 'Patate douce cuite', brand: '', calories: 90, protein: 2, carbs: 21, fat: 0.1, fiber: 3.3 },
  { id: 'c5', name: 'Pomme de terre cuite', brand: '', calories: 87, protein: 1.9, carbs: 20, fat: 0.1, fiber: 1.8 },
  { id: 'c6', name: 'Avoine (flocons)', brand: '', calories: 389, protein: 17, carbs: 66, fat: 7, fiber: 10 },
  { id: 'c7', name: 'Quinoa cuit', brand: '', calories: 120, protein: 4.4, carbs: 21, fat: 1.9, fiber: 2.8 },
  { id: 'c8', name: 'Pain de seigle', brand: '', calories: 259, protein: 9, carbs: 48, fat: 3.3, fiber: 6.2 },
  { id: 'c9', name: 'Pain complet', brand: '', calories: 247, protein: 9, carbs: 41, fat: 3.4, fiber: 6.9 },
  { id: 'c10', name: 'Lentilles cuites', brand: '', calories: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 7.9 },
  { id: 'c11', name: 'Pois chiches cuits', brand: '', calories: 164, protein: 8.9, carbs: 27, fat: 2.6, fiber: 7.6 },
  { id: 'c12', name: 'Haricots rouges cuits', brand: '', calories: 127, protein: 8.7, carbs: 22, fat: 0.5, fiber: 7.4 },

  // Légumes
  { id: 'v1', name: 'Brocoli', brand: '', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6 },
  { id: 'v2', name: 'Épinards', brand: '', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2 },
  { id: 'v3', name: 'Courgette', brand: '', calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3, fiber: 1 },
  { id: 'v4', name: 'Poivron rouge', brand: '', calories: 31, protein: 1, carbs: 6, fat: 0.3, fiber: 2.1 },
  { id: 'v5', name: 'Tomate', brand: '', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2 },
  { id: 'v6', name: 'Concombre', brand: '', calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1, fiber: 0.5 },
  { id: 'v7', name: 'Salade verte (mélange)', brand: '', calories: 17, protein: 1.3, carbs: 2.9, fat: 0.2, fiber: 1.7 },
  { id: 'v8', name: 'Carotte', brand: '', calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8 },
  { id: 'v9', name: 'Champignons', brand: '', calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3, fiber: 1 },
  { id: 'v10', name: 'Haricots verts', brand: '', calories: 31, protein: 1.8, carbs: 7, fat: 0.1, fiber: 3.4 },
  { id: 'v11', name: 'Chou-fleur', brand: '', calories: 25, protein: 1.9, carbs: 5, fat: 0.3, fiber: 2 },
  { id: 'v12', name: 'Asperges', brand: '', calories: 20, protein: 2.2, carbs: 3.9, fat: 0.1, fiber: 2.1 },

  // Fruits
  { id: 'fr1', name: 'Banane', brand: '', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6 },
  { id: 'fr2', name: 'Pomme', brand: '', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4 },
  { id: 'fr3', name: 'Orange', brand: '', calories: 47, protein: 0.9, carbs: 12, fat: 0.1, fiber: 2.4 },
  { id: 'fr4', name: 'Fraises', brand: '', calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, fiber: 2 },
  { id: 'fr5', name: 'Myrtilles', brand: '', calories: 57, protein: 0.7, carbs: 14, fat: 0.3, fiber: 2.4 },
  { id: 'fr6', name: 'Mangue', brand: '', calories: 60, protein: 0.8, carbs: 15, fat: 0.4, fiber: 1.6 },
  { id: 'fr7', name: 'Avocat', brand: '', calories: 160, protein: 2, carbs: 9, fat: 15, fiber: 7 },
  { id: 'fr8', name: 'Ananas', brand: '', calories: 50, protein: 0.5, carbs: 13, fat: 0.1, fiber: 1.4 },
  { id: 'fr9', name: 'Raisin', brand: '', calories: 69, protein: 0.7, carbs: 18, fat: 0.2, fiber: 0.9 },
  { id: 'fr10', name: 'Kiwi', brand: '', calories: 61, protein: 1.1, carbs: 15, fat: 0.5, fiber: 3 },

  // Graisses & Oléagineux
  { id: 'g1', name: 'Huile d\'olive', brand: '', calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 },
  { id: 'g2', name: 'Beurre de cacahuète', brand: '', calories: 588, protein: 25, carbs: 20, fat: 50, fiber: 6 },
  { id: 'g3', name: 'Amandes', brand: '', calories: 579, protein: 21, carbs: 22, fat: 50, fiber: 12 },
  { id: 'g4', name: 'Noix', brand: '', calories: 654, protein: 15, carbs: 14, fat: 65, fiber: 6.7 },
  { id: 'g5', name: 'Graines de chia', brand: '', calories: 486, protein: 17, carbs: 42, fat: 31, fiber: 34 },
  { id: 'g6', name: 'Graines de lin', brand: '', calories: 534, protein: 18, carbs: 29, fat: 42, fiber: 27 },
  { id: 'g7', name: 'Noix de cajou', brand: '', calories: 553, protein: 18, carbs: 30, fat: 44, fiber: 3.3 },

  // Plats préparés / Fast food
  { id: 'p1', name: 'Pizza Margherita (part)', brand: '', calories: 266, protein: 11, carbs: 33, fat: 10, fiber: 2.3 },
  { id: 'p2', name: 'Burger classique', brand: '', calories: 295, protein: 17, carbs: 24, fat: 14, fiber: 1.3 },
  { id: 'p3', name: 'Frites', brand: '', calories: 312, protein: 3.4, carbs: 41, fat: 15, fiber: 3.8 },
  { id: 'p4', name: 'Kebab (viande + pain)', brand: '', calories: 320, protein: 22, carbs: 35, fat: 9, fiber: 2 },

  // Boissons
  { id: 'b1', name: 'Lait végétal amande non sucré', brand: '', calories: 17, protein: 0.6, carbs: 0.5, fat: 1.4, fiber: 0 },
  { id: 'b2', name: 'Jus d\'orange 100%', brand: '', calories: 45, protein: 0.7, carbs: 10, fat: 0.2, fiber: 0.2 },
  { id: 'b3', name: 'Café noir', brand: '', calories: 2, protein: 0.3, carbs: 0, fat: 0, fiber: 0 },
  { id: 'b4', name: 'Smoothie banane-lait', brand: '', calories: 90, protein: 3.5, carbs: 18, fat: 1.4, fiber: 1 },
]

export function searchFoods(query: string, customFoods: FoodItem[]): FoodItem[] {
  const q = query.toLowerCase().trim()
  if (!q) return []
  const all = [...FOOD_DATABASE, ...customFoods]
  return all.filter(f =>
    f.name.toLowerCase().includes(q) ||
    (f.brand && f.brand.toLowerCase().includes(q))
  ).slice(0, 20)
}
