import { FlatList, Text, View } from 'react-native';
import { MealCard } from './MealCard';

const meals = [
  {
    id: 1,
    name: 'Café da manhã',
    calories: 100,
    proteins: 10,
    carbohydrates: 10,
    fats: 10,
  },
  {
    id: 2,
    name: 'Almoço',
    calories: 200,
    proteins: 20,
    carbohydrates: 20,
    fats: 20,
  },
  {
    id: 3,
    name: 'Janta',
    calories: 300,
    proteins: 30,
    carbohydrates: 30,
    fats: 30,
  },
];

export function MealsList() {
  return (
    <View className="p-5">
      <Text className="text-black-700 text-base font-sans-medium tracking-[1.28px]">
        REFEIÇÕES
      </Text>

      <View className="gap-8 mt-4">
        <FlatList
          data={meals}
          renderItem={({ item }) => <MealCard meal={item} />}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerClassName="gap-4"
        />
      </View>
    </View>
  );
}