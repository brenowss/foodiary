import { useQuery } from '@tanstack/react-query';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { httpClient } from '../services/httpClient';
import { MealsListHeader } from './MealsListHeader';
import { MealSlot } from './MealSlot';
import { calculateMealTargets } from '../utils/calculateMealTargets';
import { type Meal, type MealKey } from '../types/meal';

const MEAL_SLOTS: { key: MealKey; name: string; icon: string }[] = [
  { key: 'breakfast', name: 'Café da Manhã', icon: '🌅' },
  { key: 'lunch', name: 'Almoço', icon: '🍽️' },
  { key: 'snack', name: 'Lanche', icon: '🍪' },
  { key: 'dinner', name: 'Jantar', icon: '🌙' },
  { key: 'extra', name: 'Extra', icon: '➕' },
];

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