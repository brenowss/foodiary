import { FlatList, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DailyStats } from './DailyStats';
import { DateSwitcher } from './DateSwitcher';
import { MealCard } from './MealCard';

const meals = [
  {
    id: String(Math.random()),
    name: 'Café da manhã',
  },
  {
    id: String(Math.random()),
    name: 'Almoço',
  },
  {
    id: String(Math.random()),
    name: 'Janta',
  },
  {
    id: String(Math.random()),
    name: 'Café da manhã',
  },
  {
    id: String(Math.random()),
    name: 'Almoço',
  },
  {
    id: String(Math.random()),
    name: 'Janta (ultimo)',
  },
];

function MealsListHeader() {
  return (
    <View>
      <DateSwitcher />



      <View className="mt-2">
        <DailyStats
          calories={{
            current: 500,
            goal: 2500,
          }}
          proteins={{
            current: 2000,
            goal: 2500,
          }}
          carbohydrates={{
            current: 500,
            goal: 2500,
          }}
          fats={{
            current: 500,
            goal: 2500,
          }}
        />
      </View>

      <View className="h-px bg-gray-200 mt-7" />

      <Text className="text-black-700 m-5 text-base font-sans-medium tracking-[1.28px]">
        REFEIÇÕES
      </Text>
    </View>
  );
}

function Separator() {
  return (
    <View className="h-8" />
  );
}

export function MealsList() {
  const { bottom } = useSafeAreaInsets();

  return (
    <FlatList
      data={meals}
      contentContainerStyle={{ paddingBottom: 80 + bottom + 16 }}
      keyExtractor={meal => meal.id}
      ListHeaderComponent={MealsListHeader}
      ItemSeparatorComponent={Separator}
      renderItem={({ item: meal }) => (
        <View className="mx-5">
          <MealCard
            id={meal.id}
            name={meal.name}
          />
        </View>
      )}
    />
  );
}