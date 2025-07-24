export type Meal = {
  name: string;
  id: string;
  icon: string;
  key: MealKey;
  foods: {
    name: string;
    quantity: string;
    calories: number;
    proteins: number;
    carbohydrates: number;
    fats: number;
  }[];
  createdAt: string;
};

export type Goal = 'gain' | 'lose' | 'maintain';

export type MealKey = 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'extra';

export interface ConsumedMeal {
  meal: MealKey;
  calories: number;
}

export type MealTargets = {
  [key in MealKey]: number;
};
