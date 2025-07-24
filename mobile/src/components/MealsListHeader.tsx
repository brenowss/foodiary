import { useMemo } from 'react';
import { View } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { DailyStats } from './DailyStats';
import { DateSwitcher } from './DateSwitcher';
import { type Meal } from '../types/meal';

interface IMealsListHeaderProps {
  currentDate: Date;
  meals: Meal[];
  onPreviousDate(): void;
  onNextDate(): void;
}

export function MealsListHeader({
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