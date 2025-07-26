import { useMemo } from 'react';
import { Text, View, Image } from 'react-native';
import { MealCard } from './MealCard';
import { type Meal, type MealKey } from '../types/meal';

interface MealSlotProps {
  slot: { key: MealKey; name: string; icon: any };
  meals: Meal[];
  targetCalories: number;
}

export function MealSlot({ slot, meals, targetCalories }: MealSlotProps) {
  const slotMeals = meals.filter(meal => meal.key === slot.key);

  const slotTotals = useMemo(() => {
    let calories = 0;
    let proteins = 0;
    let carbohydrates = 0;
    let fats = 0;

    for (const meal of slotMeals) {
      for (const food of meal.foods) {
        calories += food.calories;
        proteins += food.proteins;
        carbohydrates += food.carbohydrates;
        fats += food.fats;
      }
    }

    return { calories, proteins, carbohydrates, fats };
  }, [slotMeals]);

  return (
    <View className="mx-5 mb-6">
      {/* Header do Slot */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <Image source={slot.icon} style={{ width: 24, height: 24, marginRight: 8 }} />
          <Text className="text-gray-800 text-lg font-sans-medium">
            {slot.name}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Text className="text-gray-600 text-sm font-sans-medium">
            {slotTotals.calories}
          </Text>
          <Text className="text-gray-400 text-sm font-sans-regular">
            /{targetCalories} kcal
          </Text>
        </View>
      </View>

      {/* Lista de Refeições do Slot */}
      {slotMeals.length > 0 ? (
        <View className="space-y-3">
          {slotMeals.map((meal, index) => (
            <View key={meal.id}>
              <MealCard
                id={meal.id}
                name={meal.name}
                icon={meal.icon}
                foods={meal.foods}
                createdAt={new Date(meal.createdAt)}
              />
              {index < slotMeals.length - 1 && (
                <View className="h-2" />
              )}
            </View>
          ))}
        </View>
      ) : (
        <View className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 items-center justify-center min-h-[100px]">
          <View className="mb-2">
            <Image source={slot.icon} style={{ width: 32, height: 32 }} />
          </View>
          <Text className="text-blue-600 text-base font-sans-medium text-center">
            Adicione sua primeira refeição
          </Text>
          <Text className="text-blue-400 text-sm font-sans-regular mt-1 text-center">
            Meta: {targetCalories} kcal
          </Text>
        </View>
      )}
    </View>
  );
} 