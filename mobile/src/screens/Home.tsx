import { View } from 'react-native';
import { FloatingCreateMealButton } from '../components/FloatingCreateMealButton';
import { HomeHeader } from '../components/HomeHeader';
import { MealsList } from '../components/MealsList';

export function Home() {
  return (
    <View className="flex-1">
      <HomeHeader />
      <MealsList />

      <FloatingCreateMealButton />
    </View>
  );
}