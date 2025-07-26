import { useQuery } from '@tanstack/react-query';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { useDebounce } from '../hooks/useDebounce';
import { httpClient } from '../services/httpClient';
import { MealsListHeader } from './MealsListHeader';
import { MealSlot } from './MealSlot';
import { calculateMealTargets } from '../utils/calculateMealTargets';
import { type Meal, type MealKey } from '../types/meal';

const MEAL_SLOTS: { key: MealKey; name: string; icon: any }[] = [
  { key: 'breakfast', name: 'Café da Manhã', icon: require('../assets/meal-icons/breakfast.png') },
  { key: 'lunch', name: 'Almoço', icon: require('../assets/meal-icons/lunch.png') },
  { key: 'snack', name: 'Lanche', icon: require('../assets/meal-icons/snack.png') },
  { key: 'dinner', name: 'Jantar', icon: require('../assets/meal-icons/dinner.png') },
  { key: 'extra', name: 'Extra', icon: require('../assets/meal-icons/extra.png') },
];

export function MealsList() {
  const { bottom } = useSafeAreaInsets();
  const { user } = useAuth();

  const [currentDate, setCurrentDate] = useState(new Date());

  // Hook de debounce para otimizar requests quando navegar rapidamente entre datas
  const {
    currentValue: currentDateValue,
    debouncedValue: debouncedDate,
    isDebouncing
  } = useDebounce(currentDate, 300);

  // Data atual (sem delay) para exibição imediata no DateSwitcher
  const currentDateParam = useMemo(() => {
    const year = currentDateValue.getFullYear();
    const month = String(currentDateValue.getMonth() + 1).padStart(2, '0');
    const day = String(currentDateValue.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }, [currentDateValue]);

  // Data debounced para a query (evita muitas requests)
  const debouncedDateParam = useMemo(() => {
    const year = debouncedDate.getFullYear();
    const month = String(debouncedDate.getMonth() + 1).padStart(2, '0');
    const day = String(debouncedDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }, [debouncedDate]);

  const { data: meals, refetch } = useQuery({
    queryKey: ['meals', debouncedDateParam],
    staleTime: 15_000,
    queryFn: async () => {
      const { data } = await httpClient.get<{ meals: Meal[] }>('/meals', {
        params: {
          date: debouncedDateParam,
        },
      });

      return data.meals;
    },
    // Só faz a request quando não estiver debouncing para evitar requests desnecessárias
    enabled: !isDebouncing,
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
      className='mt-10'
      keyExtractor={slot => slot.key}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={(
        <MealsListHeader
          currentDate={currentDateValue}
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