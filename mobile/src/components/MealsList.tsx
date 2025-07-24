import { useQuery } from '@tanstack/react-query';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { httpClient } from '../services/httpClient';
import { DailyStats } from './DailyStats';
import { DateSwitcher } from './DateSwitcher';
import { MealCard } from './MealCard';
import { calculateMealTargets, type MealKey } from '../utils/calculateMealTargets';

type Meal = {
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
}

interface IMealsListHeaderProps {
  currentDate: Date;
  meals: Meal[];
  onPreviousDate(): void;
  onNextDate(): void;
}

function MealsListHeader({
  meals,
  currentDate,
  onNextDate,
  onPreviousDate,
}: IMealsListHeaderProps) {
  const { user } = useAuth();

  const totals = useMemo(() => {
    let calories = 0;
    let proteins = 0;
    let carbohydrates = 0;
    let fats = 0;

    for (const meal of meals) {
      for (const food of meal.foods) {
        calories += food.calories;
        proteins += food.proteins;
        carbohydrates += food.carbohydrates;
        fats += food.fats;
      }
    }

    return {
      calories,
      proteins,
      carbohydrates,
      fats,
    };
  }, [meals]);

  return (
    <View>
      <DateSwitcher
        currentDate={currentDate}
        onNextDate={onNextDate}
        onPreviousDate={onPreviousDate}
      />

      <View className="mt-2">
        <DailyStats
          calories={{
            current: totals.calories,
            goal: user!.calories,
          }}
          proteins={{
            current: totals.proteins,
            goal: user!.proteins,
          }}
          carbohydrates={{
            current: totals.carbohydrates,
            goal: user!.carbohydrates,
          }}
          fats={{
            current: totals.fats,
            goal: user!.fats
          }}
        />
      </View>

      <View className="h-px bg-gray-200 mt-7" />
    </View>
  );
}

const MEAL_SLOTS: { key: MealKey; name: string; icon: string }[] = [
  { key: 'breakfast', name: 'Café da Manhã', icon: '🌅' },
  { key: 'lunch', name: 'Almoço', icon: '🍽️' },
  { key: 'snack', name: 'Lanche', icon: '🍪' },
  { key: 'dinner', name: 'Jantar', icon: '🌙' },
  { key: 'extra', name: 'Extra', icon: '➕' },
];

interface MealSlotProps {
  slot: { key: MealKey; name: string; icon: string };
  meals: Meal[];
  targetCalories: number;
}

function MealSlot({ slot, meals, targetCalories }: MealSlotProps) {
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
          <Text className="text-2xl mr-2">{slot.icon}</Text>
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
        <View className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-4 items-center justify-center min-h-[80px]">
          <Text className="text-gray-400 text-sm font-sans-regular">
            Nenhuma refeição adicionada
          </Text>
          <Text className="text-gray-300 text-xs font-sans-regular mt-1">
            Meta: {targetCalories} kcal
          </Text>
        </View>
      )}
    </View>
  );
}

export function MealsList() {
  const { bottom } = useSafeAreaInsets();
  const { user } = useAuth();

  const [currentDate, setCurrentDate] = useState(new Date());

  const dateParam = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }, [currentDate]);

  const { data: meals, refetch } = useQuery({
    queryKey: ['meals', dateParam],
    staleTime: 15_000,
    queryFn: async () => {
      const { data } = await httpClient.get<{ meals: Meal[] }>('/meals', {
        params: {
          date: dateParam,
        },
      });

      return data.meals;
    },
  });

  // Calcular as metas de calorias por refeição
  const mealTargets = useMemo(() => {
    if (!user || !meals) return {
      breakfast: 0,
      lunch: 0,
      snack: 0,
      dinner: 0,
      extra: 0,
    };

    const consumedMeals = meals.map(meal => ({
      meal: meal.key,
      calories: meal.foods.reduce((sum, food) => sum + food.calories, 0),
    }));

    return calculateMealTargets(
      user.calories,
      user.goal as 'gain' | 'lose' | 'maintain',
      consumedMeals
    );
  }, [user, meals]);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  function handlePreviousDate() {
    setCurrentDate(prevState => {
      const newDate = new Date(prevState);
      newDate.setDate(newDate.getDate() - 1);

      return newDate;
    });
  }

  function handleNextDate() {
    setCurrentDate(prevState => {
      const newDate = new Date(prevState);
      newDate.setDate(newDate.getDate() + 1);

      return newDate;
    });
  }

  return (
    <FlatList
      data={MEAL_SLOTS}
      contentContainerStyle={{ paddingBottom: 80 + bottom + 16 }}
      keyExtractor={slot => slot.key}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={(
        <MealsListHeader
          currentDate={currentDate}
          meals={meals ?? []}
          onNextDate={handleNextDate}
          onPreviousDate={handlePreviousDate}
        />
      )}
      renderItem={({ item: slot }) => (
        <MealSlot
          slot={slot}
          meals={meals ?? []}
          targetCalories={mealTargets[slot.key] || 0}
        />
      )}
    />
  );
}