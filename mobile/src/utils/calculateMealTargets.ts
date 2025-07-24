/**
 * Defines the possible user goals.
 */
export type Goal = 'gain' | 'lose' | 'maintain';

/**
 * Defines the keys for the meals.
 */
export type MealKey = 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'extra';

/**
 * Represents a meal that has been consumed by the user.
 */
export interface ConsumedMeal {
  meal: MealKey;
  calories: number;
}

/**
 * Represents the final calculated calorie targets for all meals.
 * The keys are the meal names, and the values are the calorie targets.
 */
export type MealTargets = {
  [key in MealKey]: number;
};

// --- UTILITY FUNCTION ---

/**
 * Calculates calorie targets for each meal, dynamically adjusting based on what has already been consumed.
 *
 * @param {number} totalDailyCalories - The total daily calorie goal for the user.
 * @param {Goal} goal - The user's primary goal ('gain', 'lose', or 'maintain').
 * @param {ConsumedMeal[]} mealsEaten - An array of objects representing the meals already consumed today.
 * @returns {MealTargets} An object containing the calculated calorie targets for each meal.
 */
export const calculateMealTargets = (
  totalDailyCalories: number,
  goal: Goal,
  mealsEaten: ConsumedMeal[] = []
): MealTargets => {
  // 1. BASE DISTRIBUTION (PERCENTAGES)
  // These are the starting points. You can fine-tune these values to fit your app's philosophy.
  const MEAL_PERCENTAGES: { [g in Goal]: { [m in MealKey]: number } } = {
    gain: {
      breakfast: 0.25,
      lunch: 0.35,
      snack: 0.15,
      dinner: 0.25,
      extra: 0.0,
    },
    lose: { breakfast: 0.3, lunch: 0.35, snack: 0.1, dinner: 0.25, extra: 0.0 },
    maintain: {
      breakfast: 0.25,
      lunch: 0.35,
      snack: 0.1,
      dinner: 0.3,
      extra: 0.0,
    },
  };

  const percentages = MEAL_PERCENTAGES[goal] || MEAL_PERCENTAGES.maintain;
  const mealNames = Object.keys(percentages) as MealKey[];
  const finalTargets = {} as MealTargets;

  // 2. PROCESS WHAT HAS ALREADY BEEN CONSUMED
  let totalCaloriesEaten = 0;
  const consumedByMeal: { [key in MealKey]?: number } = {};
  mealsEaten.forEach((item) => {
    totalCaloriesEaten += item.calories;
    consumedByMeal[item.meal] = item.calories;
  });

  // 3. CALCULATE REMAINING CALORIES AND MEALS
  const remainingCalories = Math.max(
    0,
    totalDailyCalories - totalCaloriesEaten
  );
  const uneatenMeals = mealNames.filter(
    (meal) => !consumedByMeal.hasOwnProperty(meal)
  );

  // 4. CALCULATE THE PROPORTIONAL WEIGHT OF THE REMAINING MEALS
  let weightOfUneatenMeals = uneatenMeals.reduce(
    (sum, meal) => sum + percentages[meal],
    0
  );

  // Avoid division by zero if all meals have been eaten
  if (weightOfUneatenMeals === 0) {
    weightOfUneatenMeals = 1;
  }

  // 5. CALCULATE AND ASSIGN THE FINAL TARGETS
  mealNames.forEach((meal) => {
    if (consumedByMeal.hasOwnProperty(meal)) {
      // For eaten meals, the target is what was actually consumed.
      finalTargets[meal] = consumedByMeal[meal]!;
    } else {
      // For uneaten meals, redistribute the remaining calories proportionally.
      const proportion = percentages[meal] / weightOfUneatenMeals;
      finalTargets[meal] = Math.round(remainingCalories * proportion);
    }
  });

  return finalTargets;
};
